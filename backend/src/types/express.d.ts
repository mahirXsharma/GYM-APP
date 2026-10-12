export interface UserPayload {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}
