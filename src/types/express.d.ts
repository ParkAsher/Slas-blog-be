import { Express } from 'express';

type JwtPayload = {
    sub: string;
    nickname?: string;
    role?: string;
    iat?: number;
    exp?: number;
};

declare global {
    namespace Express {
        interface User extends JwtPayload {}
    }
}
