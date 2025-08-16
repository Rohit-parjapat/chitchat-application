import { Request, Response } from "express";
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}
export declare const sendFriendRequest: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const acceptFriendRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const rejectFriendRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateFriendRequestStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const listPendingRequests: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFriends: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=friendRequestControllers.d.ts.map