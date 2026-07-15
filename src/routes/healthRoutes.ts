import express, { Router } from 'express';
import { getTicketHealthController } from '../controllers/healthController';

const healthRouter: Router = express.Router();

healthRouter.get('/', getTicketHealthController);

export default healthRouter;