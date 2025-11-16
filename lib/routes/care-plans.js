"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carePlans = void 0;
const express_1 = require("express");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const zod_1 = require("zod");
const db = firebase_admin_1.default.firestore();
exports.carePlans = (0, express_1.Router)();
const carePlanSchema = zod_1.z.object({
    goals: zod_1.z.array(zod_1.z.string()).min(1),
    interventions: zod_1.z.array(zod_1.z.string()).min(1),
    reviewInDays: zod_1.z.number().int().positive().optional(),
});
exports.carePlans.post('/wound/:woundId', async (req, res) => {
    const woundId = req.params.woundId;
    const parse = carePlanSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json(parse.error.format());
    const now = Date.now();
    const doc = await db.collection('carePlans').add({
        woundId,
        ...parse.data,
        status: 'active',
        authorUid: req.user?.uid,
        createdAt: now
    });
    const snap = await doc.get();
    res.status(201).json({ id: doc.id, ...snap.data() });
});
exports.carePlans.get('/wound/:woundId', async (req, res) => {
    const snaps = await db.collection('carePlans')
        .where('woundId', '==', req.params.woundId)
        .orderBy('createdAt', 'desc')
        .get();
    res.json(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
});
exports.carePlans.patch('/:planId', async (req, res) => {
    const planId = req.params.planId;
    const allowed = zod_1.z.object({
        goals: zod_1.z.array(zod_1.z.string()).optional(),
        interventions: zod_1.z.array(zod_1.z.string()).optional(),
        reviewInDays: zod_1.z.number().int().positive().optional(),
        status: zod_1.z.enum(['active', 'completed', 'on-hold']).optional()
    });
    const parse = allowed.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json(parse.error.format());
    const ref = db.collection('carePlans').doc(planId);
    const snap = await ref.get();
    if (!snap.exists)
        return res.status(404).json({ error: 'Not found' });
    await ref.update(parse.data);
    const updated = await ref.get();
    res.json({ id: updated.id, ...updated.data() });
});
exports.carePlans.post('/:planId/complete', async (req, res) => {
    const ref = db.collection('carePlans').doc(req.params.planId);
    const snap = await ref.get();
    if (!snap.exists)
        return res.status(404).json({ error: 'Not found' });
    await ref.update({ status: 'completed' });
    res.json({ id: ref.id, status: 'completed' });
});
