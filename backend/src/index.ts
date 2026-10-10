import 'dotenv/config';
import express from 'express';
import apiRouter from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
