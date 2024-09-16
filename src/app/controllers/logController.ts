import { Request, Response } from 'express';
import { storeLog } from '../services/logService';

export const createLog = async (req: Request, res: Response) => {
    try {
        const logData = req.body;
        const response = await storeLog(logData);
        res.status(201).json({ message: 'Log stored successfully', response });
    } catch (error) {
        res.status(500).json({ message: 'Error storing log', error });
    }
};
