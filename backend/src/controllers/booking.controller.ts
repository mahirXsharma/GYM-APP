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
            return res.status(400).json({ error: "Session is fully booked" });
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

