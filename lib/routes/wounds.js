"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wounds = void 0;
const express_1 = require("express");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const zod_1 = require("zod");
const db = firebase_admin_1.default.firestore();
exports.wounds = (0, express_1.Router)();
const woundSchema = zod_1.z.object({
    patientId: zod_1.z.string(),
    location: zod_1.z.string().min(1),
    etiology: zod_1.z.enum(['pressure', 'diabetic', 'venous', 'arterial', 'surgical', 'trauma', 'other']),
    stage: zod_1.z.enum(['I', 'II', 'III', 'IV', 'DTPI', 'Unstageable']).optional(),
    onsetDate: zod_1.z.string().optional()
});
exports.wounds.post('/', async (req, res) => {
    const parse = woundSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json(parse.error.format());
    const now = Date.now();
    const doc = await db.collection('wounds').add({
        ...parse.data,
        status: 'active',
        createdAt: now,
        createdBy: req.user?.uid
    });
    const snap = await doc.get();
    res.status(201).json({ id: doc.id, ...snap.data() });
});
exports.wounds.get('/:id', async (req, res) => {
    const snap = await db.collection('wounds').doc(req.params.id).get();
    if (!snap.exists)
        return res.status(404).json({ error: 'Not found' });
    res.json({ id: snap.id, ...snap.data() });
});
exports.wounds.get('/by-patient/:patientId', async (req, res) => {
    const snaps = await db.collection('wounds')
        .where('patientId', '==', req.params.patientId)
        .orderBy('createdAt', 'desc')
        .get();
    res.json(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
});
exports.wounds.post('/:id/resolve', async (req, res) => {
    const ref = db.collection('wounds').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists)
        return res.status(404).json({ error: 'Not found' });
    await ref.update({ status: 'resolved' });
    res.json({ id: ref.id, status: 'resolved' });
});
