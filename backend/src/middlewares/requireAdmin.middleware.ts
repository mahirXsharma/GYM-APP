import type{ NextFunction, Request, Response } from "express";

export const requireAdmin = (req:Request, res:Response, next:NextFunction)=>{
    // doing the check , wether this user is admin or not
    const userId = req.user?.id;
    if(!userId){
        return res.status(401).json({ error: "Unauthorized" });
    }
    const isAdmin = req.user?.isAdmin;
    if(!isAdmin){
        return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    next();
}