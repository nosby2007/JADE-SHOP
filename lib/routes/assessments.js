"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessments = void 0;
const express_1 = require("express");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const zod_1 = require("zod");
const db = firebase_admin_1.default.firestore();
exports.assessments = (0, express_1.Router)();
const schema = zod_1.z.object({
    date: zod_1.z.string(),
    size: zod_1.z.object({
        lengthCm: zod_1.z.number().nonnegative(),
        widthCm: zod_1.z.number().nonnegative(),
        depthCm: zod_1.z.number().optional()
    }).optional(),
    exudate: zod_1.z.enum(['none', 'scant', 'light', 'moderate', 'heavy']).optional(),
    exudateType: zod_1.z.enum(['serous', 'sanguineous', 'serosanguineous', 'purulent']).optional(),
    tissue: zod_1.z.object({
        granulationPct: zod_1.z.number().min(0).max(100).optional(),
        sloughPct: zod_1.z.number().min(0).max(100).optional(),
        necrosisPct: zod_1.z.number().min(0).max(100).optional()
    }).optional(),
    periwound: zod_1.z.string().optional(),
    odor: zod_1.z.enum(['none', 'faint', 'moderate', 'strong']).optional(),
    painScore: zod_1.z.number().min(0).max(10).optional(),
    dressingApplied: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional()
});
exports.assessments.post('/wound/:woundId', async (req, res) => {
    const woundId = req.params.woundId;
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json(parse.error.format());
    const now = Date.now();
    const doc = await db.collection('assessments').add({
        woundId,
        ...parse.data,
        authorUid: req.user?.uid,
        createdAt: now
    });
    await db.collection('wounds').doc(woundId).update({ lastAssessmentAt: now });
    const snap = await doc.get();
    res.status(201).json({ id: doc.id, ...snap.data() });
});
exports.assessments.get('/wound/:woundId', async (req, res) => {
    const limit = Number(req.query.limit || 20);
    const snaps = await db.collection('assessments')
        .where('woundId', '==', req.params.woundId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
    res.json(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
});
