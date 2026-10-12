import { Router } from 'express';
import authRoutes from './auth.routes.js';
import sessionRoutes from './session.routes.js'
import bookingRoutes from './booking.routes.js'

const router = Router();

router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/booking', bookingRoutes)

export default router;
