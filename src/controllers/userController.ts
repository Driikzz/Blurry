import { Request, Response } from 'express';


export class UserController{
    getAll = (req: Request, res: Response) => {
        // ...
    }

    getById = (req: Request, res: Response) => {
        console.log('Test user by id')
    }

    create = (req: Request, res: Response) => {
        // ...
    }

    update = (req: Request, res: Response) => {
        // ...
    }

    delete = (req: Request, res: Response) => {
        // ...
    }

}