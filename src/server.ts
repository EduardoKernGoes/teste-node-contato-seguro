import express, { Application } from 'express';
import ticketRouter from './routes/ticketRoutes';
import healthRouter from './routes/healthRoutes';
import userRouter from './routes/userRoutes';

const server: Application = express();
const port: number = 3000;

server.use(express.json());

server.use('/tickets', ticketRouter);
server.use('/health', healthRouter);
server.use('/users', userRouter);

server.listen(port, () => {
   console.log(`Server is running on: http://localhost:${port}`);
});