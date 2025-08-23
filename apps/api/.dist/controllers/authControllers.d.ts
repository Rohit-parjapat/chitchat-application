import { Request, Response } from "express";
export declare const userRegister: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const userLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const userLogout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const refreshAccessToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authControllers.d.ts.map