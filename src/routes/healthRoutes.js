import express from 'express';
import { getTicketHealthController } from '../controllers/healthController.js';

const healthRouter = express.Router();

healthRouter.get('/', getTicketHealthController);

export default healthRouter;