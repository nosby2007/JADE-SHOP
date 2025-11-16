"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.media = void 0;
const express_1 = require("express");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.media = (0, express_1.Router)();
exports.media.post('/uploadUrl', async (req, res) => {
    const { contentType, filename, refs } = req.body || {};
    if (!contentType || !filename)
        return res.status(400).json({ error: 'contentType and filename required' });
    const bucket = firebase_admin_1.default.storage().bucket();
    const path = `wounds/${req.user?.uid}/${Date.now()}-${filename}`;
    const file = bucket.file(path);
    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 10 * 60 * 1000,
        contentType
    });
    res.json({ uploadUrl: url, path, refs });
});
exports.media.post('/', async (req, res) => {
    const db = firebase_admin_1.default.firestore();
    const { path, contentType, tags, ref } = req.body || {};
    if (!path || !contentType)
        return res.status(400).json({ error: 'path and contentType required' });
    const now = Date.now();
    const doc = await db.collection('media').add({
        path, contentType, tags: tags || [],
        ref: ref || {},
        authorUid: req.user?.uid,
        createdAt: now
    });
    const snap = await doc.get();
    res.status(201).json({ id: doc.id, ...snap.data() });
});
