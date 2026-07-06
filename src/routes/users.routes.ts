import express, { type Request, type Response, type NextFunction } from 'express';
import { UserController } from '../controllers/userController';


const router = express.Router();
const controller = new UserController();



router.get('/:id',(req: Request, res: Response) =>  controller.getById(req,res) )
  


module.exports = router;
