import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import type { NextFunction, Request, Response } from 'express';

const app = express();
 
app.use(cors());
app.use(express.json());
app.use('/api/v1', apiRouter);

app.use((_, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    if (res.headersSent) {
        return next(err);
    }
    const status = err.status || err.statusCode || 500;
    const message = status >= 500 ? "Internal server error" : (err.message || "Bad Request");
    res.status(status).json({ error: message });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
