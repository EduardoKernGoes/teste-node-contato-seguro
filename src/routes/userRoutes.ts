import express, { Router } from 'express';
import {
    createUserController,
    getUsersController,
    getuserByIdController,
    updateUserController,
    deleteUserController
} from '../controllers/userController';

const userRouter: Router = express.Router();

userRouter.post('/', createUserController);
userRouter.get('/', getUsersController);
userRouter.get('/:id', getuserByIdController);
userRouter.put('/:id', updateUserController);
userRouter.delete('/:id', deleteUserController);

export default userRouter;