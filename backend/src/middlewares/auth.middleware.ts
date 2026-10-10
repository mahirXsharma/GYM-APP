import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// work is to verify the incoming jwt
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({error: "Unauthorized"})
    }

    const token = authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({error: "Unauthorized"})
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(401).json({ error: "Unauthorized" });
    }
    
}