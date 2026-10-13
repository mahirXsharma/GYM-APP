import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {cancelBooking, getBookings, markAttendance } from "../controllers/booking.controller.js";

const router = Router();
router.use(authMiddleware);
router.get('/' , getBookings)
router.delete('/:id', cancelBooking)
router.post('/check-in', markAttendance)
export default router;