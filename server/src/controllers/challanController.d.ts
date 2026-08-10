import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getChallans: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getChallanById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createChallan: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateChallanStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=challanController.d.ts.map