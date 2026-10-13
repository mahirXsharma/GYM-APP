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

export const getLiveSessions = async (req: Request, res: Response) => {
  const isAdmin = req.user?.isAdmin;
  const now = new Date();

  const userId = req.user?.id;
  if (!userId) {
    // unathorized
    return res.status(401).json({ error: "Unauthorized" })
  }
  try {

    // if its admin, then return only the session list
    if (isAdmin) {
      const sessions = await prisma.session.findMany({
        where: {
          scheduledFor: {
            lte: now,
          },
        },
        include: {
          _count: {
            select: {
              bookings: {
                where: {
                  status: "CONFIRMED"
                }
              }
            }
          }
        }
      })

      const liveSessions = sessions.filter(session => {
        const end = new Date(session.scheduledFor);
        end.setHours(end.getHours() + 1);
        return end >= now;
      });

      if (liveSessions.length === 0) {
        return res.status(404).json({ error: "Oops! There are no live Sessions right now!" })

      }

      const sessionsWithSeats = liveSessions.map(({ _count, ...s }) => ({
        ...s,
        seatsRemaining: Math.max(0, s.capacity - _count.bookings),
      }));

      return res.status(200).json({ liveSessions: sessionsWithSeats });
    }


    const bookings = await prisma.booking.findMany({
      where: { userId, status: "CONFIRMED" },
      include: { session: true },
    });

    if (bookings.length === 0) {
      return res.status(404).json({ error: "You haven't booked any session yet!" })
    }

    const liveSessions = bookings.filter((booking) => {
      const session = booking.session;
      const start = new Date(session.scheduledFor);
      const end = new Date(session.scheduledFor);
      end.setHours(end.getHours() + 1);
      return start <= now && end >= now;
    });

    if (liveSessions.length === 0) {
      return res.status(404).json({ error: "Oops! There are no live Sessions right now!" })

    }

    return res.status(200).json({ liveSessions });
  } catch (error) {
    console.error("Get live sessions error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


export const oneLiveSession = async (req: Request, res: Response) => {
  const sessionId = Number(req.params?.id);
  if (!sessionId) {
    return res.status(400).json({ error: "Invalid Session ID" });
  }
  // return the session + it should also return all the users which have confirmed bookings for this session
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include:{
        bookings:{
          where:{
            status:"CONFIRMED"
          },
          select:{
            user:{
              select:{
                id:true,
                name:true,
                email:true
              }
            }
          }
        }
      }
    })

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.status(200).json({ message: "Session fetched successfully", session })


  } catch (error) {

    console.error("Error fetching one live session", error);
    return res.status(500).json({ error: "Internal server error" });
  }

}
