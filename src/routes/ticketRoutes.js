import express from 'express';
import { createTicketController } from '../controllers/ticketController.js';

const ticketRouter = express.Router();

// Quando bater um POST na raiz dessa rota, chama o Controller
ticketRouter.post('/', createTicketController);

// Aqui você colocaria as outras:
// ticketRouter.get('/', getTicketsController);
// ticketRouter.get('/:id', getTicketByIdController);

export default ticketRouter;