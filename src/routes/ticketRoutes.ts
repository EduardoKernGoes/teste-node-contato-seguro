import express, { Router } from 'express';
import {
    createTicketController,
    getTicketsController,
    getTicketByIdController,
    updateTicketController
} from '../controllers/ticketController';

const ticketRouter: Router = express.Router();

ticketRouter.post('/', createTicketController);
ticketRouter.get('/', getTicketsController);
ticketRouter.get('/:id', getTicketByIdController);
ticketRouter.put('/:id/status', updateTicketController);

export default ticketRouter;