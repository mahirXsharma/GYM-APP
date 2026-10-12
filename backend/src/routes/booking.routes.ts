import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {getBookings } from "../controllers/booking.controller.js";

const router = Router();
router.get('/',authMiddleware, getBookings)
export default router;