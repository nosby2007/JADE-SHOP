"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notes = void 0;
const express_1 = require("express");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const zod_1 = require("zod");
const db = firebase_admin_1.default.firestore();
exports.notes = (0, express_1.Router)();
const noteSchema = zod_1.z.object({
    subject: zod_1.z.string().optional(),
    body: zod_1.z.string().min(1),
    target: zod_1.z.object({
        patientId: zod_1.z.string().optional(),
        woundId: zod_1.z.string().optional()
    })
});
exports.notes.post('/', async (req, res) => {
    const parse = noteSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json(parse.error.format());
    const now = Date.now();
    const doc = await db.collection('notes').add({
        ...parse.data,
        authorUid: req.user?.uid,
        createdAt: now
    });
    const snap = await doc.get();
    res.status(201).json({ id: doc.id, ...snap.data() });
});
exports.notes.get('/', async (req, res) => {
    const patientId = req.query.patientId;
    const woundId = req.query.woundId;
    let ref = db.collection('notes');
    if (patientId)
        ref = ref.where('target.patientId', '==', patientId);
    if (woundId)
        ref = ref.where('target.woundId', '==', woundId);
    ref = ref.orderBy('createdAt', 'desc').limit(50);
    const snaps = await ref.get();
    res.json(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
});
