import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto"

export const createBooking = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const sessionId = Number(req.params.id);
        if (!Number.isInteger(sessionId) || sessionId <= 0) {
            return res.status(400).json({ error: "Invalid session ID" });
        }

        const existingBooking = await prisma.booking.findFirst({
            where: {
                userId,
                sessionId,
                status: "CONFIRMED",
            },
        });

        if (existingBooking) {
            return res.status(409).json({ error: "You already have a booking for this session" });
        }

        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                _count: {
                    select: {
                        bookings: {
                            where: { status: "CONFIRMED" },
                        },
                    },
                },
            },
        });

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        if (session.scheduledFor < new Date()) {
            return res.status(400).json({ error: "Session has already passed" });
        }

        const bookedCount = session._count.bookings;
        const seatsRemaining = session.capacity - bookedCount;

        if (seatsRemaining <= 0) {
            // wether is it already in the waiting list or not 
            const isAlreadyInWaitingList = await prisma.booking.findFirst({
                where: {
                    userId,
                    sessionId,
                    status: "WAITING_LIST",
                }
            })
            if (isAlreadyInWaitingList) {
                return res.status(409).json({ error: "You are already in the waiting list for this session" });
            }
            const waitlistBooking = await prisma.booking.create({
                data: {
                    userId,
                    sessionId,
                    status: "WAITING_LIST",
                    code: null
                }
            });
            const { code, ...w } = waitlistBooking;
            return res.status(200).json({
                message: "Session is full. You've been added to the waiting list.",
                booking: w,
            });
        }

        const { booking: newBooking, session: verifiedSession } = await prisma.$transaction(async (tx) => {
            const txSession = await tx.session.findUnique({
                where: { id: sessionId },
                include: {
                    _count: {
                        select: { bookings: { where: { status: "CONFIRMED" } } }
                    }
                }
            });
            if (!txSession || txSession._count.bookings >= txSession.capacity) {
                throw new Error("Session is full!");
            }

            const createdBooking = await tx.booking.create({
                data: {
                    userId,
                    sessionId,
                    code: crypto.randomUUID().slice(0, 8).toUpperCase()
                }
            });

            return { booking: createdBooking, session: txSession };
        });

        const { capacity, _count } = verifiedSession;
        return res.status(201).json({
            message: "Session booked successfully",
            booking: newBooking,
            seatsRemaining: capacity - _count.bookings - 1
        });
    } catch (error: any) {
        if (error?.message === "Session is full!") {
            return res.status(409).json({ error: "Session is full" });
        }
        console.error("Create booking error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const activeQuery = req.query?.active;
    if (activeQuery !== undefined && activeQuery !== "true" && activeQuery !== "false") {
        return res.status(400).json({ error: "Query parameter 'active' must be 'true' or 'false'" });
    }
    const isActive = activeQuery === "true";

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const showAll = req.user?.isAdmin ?? false;

    try {
        const bookings = await prisma.booking.findMany({
            where: {
                AND: [
                    showAll ? {} : { userId },
                    isActive ? {
                        status: {
                            in: ["CONFIRMED", "WAITING_LIST"]
                        }
                    } : {},

                ]
            },

            orderBy: { createdAt: "desc" },
            include: { 
                session: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }

        })

        const sanitizedBookings = showAll
            ? bookings.map(({ code, ...rest }) => ({ ...rest, code: null }))
            : bookings;

        return res.status(200).json({ bookings: sanitizedBookings });
    } catch (error) {
        console.log("Error fetching bookings:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    const bookingId = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
        return res.status(400).json({ error: "Invalid booking ID" });
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { session: true }
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        const isAdmin = req.user?.isAdmin;
        if (!isAdmin && booking.userId !== userId) {
            return res.status(403).json({ error: "Forbidden: You can only cancel your own bookings" });
        }

        if (booking.status !== "CONFIRMED" && booking.status !== "WAITING_LIST") {
            return res.status(400).json({ error: `Cannot cancel a booking that is already ${booking.status.toLowerCase()}` });
        }
        if (booking.status == "WAITING_LIST") {
            const waiting = await prisma.booking.delete({
                where: { id: bookingId },
            })
            const { code, ...w } = waiting
            return res.status(200).json({ message: "You are Removed From Waiting List", waiting: w });

        }

        if (booking.session.scheduledFor < new Date()) {
            return res.status(400).json({ error: "Cannot cancel a past session" });
        }

        const { cancelled } = await prisma.$transaction(async (tx) => {
            const cancelled = await tx.booking.update({
                where: { id: bookingId },
                data: { status: "CANCELLED" }
            });

            if (booking.session.scheduledFor < new Date()) {
                return { cancelled };
            }

            const waiting = await tx.booking.findFirst({
                where: {
                    sessionId: booking.sessionId,
                    status: "WAITING_LIST"
                },
                orderBy: { createdAt: "asc" }
            })

            if (waiting) {
                await tx.booking.update({
                    where: { id: waiting.id },
                    data: {
                        status: "CONFIRMED",
                        code: crypto.randomUUID().slice(0, 8).toUpperCase()
                    },
                })
            }
            return { cancelled }
        })


        return res.status(200).json({ message: "Booking cancelled", booking: cancelled });
    } catch (error) {
        console.error("Cancel booking error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const markAttendance = async (req: Request, res: Response) => {
    const rawCode = req.body?.code;

    if (typeof rawCode !== "string" || !rawCode.trim()) {
        return res.status(400).json({ error: "Attendance code is required" });
    }
    const code = rawCode.trim().toUpperCase();

    try {
        const booking = await prisma.booking.findFirst({
            where: { code },
            include: {
                session: true,
                user: { select: { id: true, name: true, email: true } },
            },
        });

        if (!booking) {
            return res.status(404).json({ error: "Invalid check-in code. No booking found with this code." });
        }

        if (booking.status === "ATTENDED") {
            return res.status(409).json({
                error: `This check-in code has already been used. ${booking.user?.name || "Member"} is already marked present.`,
            });
        }

        if (booking.status === "CANCELLED") {
            return res.status(400).json({
                error: "This booking was cancelled and cannot be used for check-in.",
            });
        }

        if (booking.status !== "CONFIRMED") {
            return res.status(400).json({
                error: `Cannot check in a booking with status ${booking.status.toLowerCase()}.`,
            });
        }

        const now = new Date();
        const sessionStart = new Date(booking.session.scheduledFor);
        const sessionEnd = new Date(sessionStart.getTime());
        sessionEnd.setHours(sessionEnd.getHours() + 1); // 1 hour duration

        if (now <= sessionStart || now >= sessionEnd) {
            return res.status(400).json({
                error: "Check-in is only allowed during the session's active hour.",
            });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: "ATTENDED",
            },
            include: {
                session: true,
                user: { select: { id: true, name: true, email: true } },
            },
        });

        return res.status(200).json({
            message: `Attendance marked successfully for ${updatedBooking.user?.name || "member"}.`,
            booking: updatedBooking,
        });
    } catch (error) {
        console.error("Error marking attendance:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
