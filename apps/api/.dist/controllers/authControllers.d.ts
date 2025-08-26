import { Request, Response } from "express";
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}
export declare const userRegister: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const userLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLoggedUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllUsers: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const userLogout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const refreshAccessToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=authControllers.d.ts.map