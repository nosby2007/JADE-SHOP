"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
async function authMiddleware(req, res, next) {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.substring(7) : undefined;
    if (!token)
        return res.status(401).json({ error: 'Missing Authorization: Bearer <token>' });
    try {
        const decoded = await firebase_admin_1.default.auth().verifyIdToken(token);
        req.user = decoded;
        next();
    }
    catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
}
