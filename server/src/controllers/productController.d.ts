import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getProducts: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProductById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createProduct: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProduct: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const adjustStock: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllStockLogs: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=productController.d.ts.map