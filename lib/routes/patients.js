"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patients = void 0;
const express_1 = require("express");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const zod_1 = require("zod");
const db = firebase_admin_1.default.firestore();
exports.patients = (0, express_1.Router)();
const patientSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(1),
    dob: zod_1.z.string().optional(),
    mrn: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    address: zod_1.z.string().optional()
});
exports.patients.post('/', async (req, res) => {
    const parse = patientSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json(parse.error.format());
    const now = Date.now();
    const doc = await db.collection('patients').add({
        ...parse.data, createdAt: now, createdBy: req.user?.uid
    });
    const snap = await doc.get();
    res.status(201).json({ id: doc.id, ...snap.data() });
});
exports.patients.get('/:id', async (req, res) => {
    const snap = await db.collection('patients').doc(req.params.id).get();
    if (!snap.exists)
        return res.status(404).json({ error: 'Not found' });
    res.json({ id: snap.id, ...snap.data() });
});
exports.patients.get('/', async (req, res) => {
    const q = req.query.search?.toLowerCase();
    let ref = db.collection('patients').orderBy('createdAt', 'desc').limit(25);
    const snaps = await ref.get();
    const items = snaps.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((p) => !q || (p.displayName || '').toLowerCase().includes(q));
    res.json(items);
});
