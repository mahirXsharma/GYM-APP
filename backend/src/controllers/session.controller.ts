import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { createSessionSchema } from "../validators/session.validator.js";

export const createSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const parsed = createSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }

    const { scheduledFor, capacity } = parsed.data;

    const newSession = await prisma.session.create({
      data: {
        scheduledFor,
        capacity,
      },
    });

    return res.status(201).json({
      message: "Session created successfully",
      session: newSession,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A session at this scheduled time already exists" });
    }

    console.error("Session creation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user?.isAdmin;
    const showAll = req.query.all === "true";
    if (showAll && !isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    const sessions = await prisma.session.findMany({
      where: showAll ? {} : { scheduledFor: { gte: new Date() } },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: "CONFIRMED" },
            },
          },
        },
      },
      orderBy: showAll ? { scheduledFor: "desc" } : { scheduledFor: "asc" },
    });

    const sessionsWithSeats = sessions.map(({ _count, ...s }) => ({
      ...s,
      seatsRemaining: Math.max(0, s.capacity - _count.bookings),
    }));

    return res.status(200).json({
      message: "Sessions fetched successfully",
      sessions: sessionsWithSeats,
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

