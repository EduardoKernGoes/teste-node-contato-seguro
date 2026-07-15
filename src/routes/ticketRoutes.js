import express from 'express';
import {
    createTicketController,
    getTicketsController,
    getTicketByIdController,
    updateTicketController
} from '../controllers/ticketController.js';

const ticketRouter = express.Router();

// Quando bater um POST na raiz dessa rota, chama o Controller
ticketRouter.post('/', createTicketController);
ticketRouter.get('/', getTicketsController);
ticketRouter.get('/:id', getTicketByIdController);
ticketRouter.put('/:id/status', updateTicketController);

// Aqui você colocaria as outras:
// ticketRouter.get('/', getTicketsController);
// ticketRouter.get('/:id', getTicketByIdController);

export default ticketRouter;