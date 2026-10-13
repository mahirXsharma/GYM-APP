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
        if (!sessionId || isNaN(sessionId)) {
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
            return res.status(400).json({ error: "You already have a booking for this session" });
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

        if (!session || session.scheduledFor < new Date()) {
            return res.status(400).json({ error: "Session not found or has already passed" });
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
                return res.status(400).json({ error: "You are already in the waiting list for this session" });
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
            message: "Session booked successfullyy",
            booking: newBooking,
            seatsRemaining: capacity - _count.bookings - 1
        });
    } catch (error) {
        console.error("Create booking error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const showAll = req.user?.isAdmin ?? false;

    try {
        const bookings = await prisma.booking.findMany({
            where: showAll ? {} : { userId },
            orderBy: { createdAt: "desc" },
            include: { session: true }

        })
        return res.status(200).json({ bookings });
    } catch (error) {
        console.log("Error fetching bookings:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    const bookingId = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId || !bookingId) {
        return res.status(400).json({ message: "Invalid Data" });
    }

    try {
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId,
                status: {
                    in: ["CONFIRMED", "WAITING_LIST"]
                }
            },
            include: { session: true }
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.status == "WAITING_LIST") {
            const waiting = await prisma.booking.delete({
                where: { id: bookingId },
            })
            const { code, ...w } = waiting
            return res.status(200).json({ message: "You are Removed From Waiting List", waiting: w });

        }

        if (booking.session.scheduledFor < new Date()) {
            return res.status(400).json({ message: "Cannot cancel a past session" });
        }

        const { cancelled } = await prisma.$transaction(async (tx) => {
            const cancelled = await tx.booking.update({
                where: { id: bookingId },
                data: { status: "CANCELLED" }
            });
            // sessionId and status is waiting -> if someone with sessionn id is in watiting list -> promote them
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
