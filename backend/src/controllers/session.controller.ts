import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

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

    const { scheduledFor, capacity } = req.body;
    if (!scheduledFor) {
      return res.status(400).json({ error: "scheduledFor is required" });
    }

    if (capacity !== undefined && (typeof capacity !== "number" || capacity <= 0 || !Number.isInteger(capacity))) {
      return res.status(400).json({ error: "Capacity must be a positive integer" });
    }

    const sessionDate = new Date(scheduledFor);
    if (isNaN(sessionDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (sessionDate <= new Date()) {
      return res.status(400).json({ error: "Session must be scheduled in the future" });
    }

    const newSession = await prisma.session.create({
      data: {
        scheduledFor: sessionDate,
        capacity: capacity ?? 20,
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
