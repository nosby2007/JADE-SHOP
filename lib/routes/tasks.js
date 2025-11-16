"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasks = void 0;
const express_1 = require("express");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const zod_1 = require("zod");
const db = firebase_admin_1.default.firestore();
exports.tasks = (0, express_1.Router)();
const taskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    patientId: zod_1.z.string(),
    woundId: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().optional(),
    assignedToUid: zod_1.z.string(),
    priority: zod_1.z.enum(['low', 'med', 'high']).optional(),
});
exports.tasks.post('/', async (req, res) => {
    const parse = taskSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json(parse.error.format());
    const now = Date.now();
    const doc = await db.collection('tasks').add({
        ...parse.data,
        status: 'open',
        createdAt: now,
        createdBy: req.user?.uid
    });
    const snap = await doc.get();
    res.status(201).json({ id: doc.id, ...snap.data() });
});
exports.tasks.get('/', async (req, res) => {
    const assignedToUid = req.query.assignedToUid;
    const status = req.query.status ?? undefined;
    let ref = db.collection('tasks');
    if (assignedToUid)
        ref = ref.where('assignedToUid', '==', assignedToUid);
    if (status)
        ref = ref.where('status', '==', status);
    ref = ref.orderBy('createdAt', 'desc').limit(50);
    const snaps = await ref.get();
    res.json(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
});
exports.tasks.patch('/:id', async (req, res) => {
    const allowed = zod_1.z.object({
        title: zod_1.z.string().optional(),
        dueDate: zod_1.z.string().optional(),
        priority: zod_1.z.enum(['low', 'med', 'high']).optional(),
        status: zod_1.z.enum(['open', 'in-progress', 'done']).optional(),
        assignedToUid: zod_1.z.string().optional()
    });
    const parse = allowed.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json(parse.error.format());
    const ref = db.collection('tasks').doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists)
        return res.status(404).json({ error: 'Not found' });
    await ref.update(parse.data);
    const updated = await ref.get();
    res.json({ id: updated.id, ...updated.data() });
});
