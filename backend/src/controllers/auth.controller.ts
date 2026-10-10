import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const signup = async (req: Request, res: Response) => {
    try {
        res.status(501).json({ message: 'Signup route not implemented yet' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        res.status(501).json({ message: 'Login route not implemented yet' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
