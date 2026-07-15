import express from 'express';
import ticketRouter from './routes/ticketRoutes.js';
import healthRouter from './routes/healthRoutes.js';
import userRouter from './routes/userRoutes.js';

const server = express()
const port = 3000

server.use(express.json())

server.use('/tickets', ticketRouter)
server.use('/health', healthRouter)
server.use('/users', userRouter)

server.listen(port, () => {
   console.log(`Server is running on: http://localhost:${port}`)
})