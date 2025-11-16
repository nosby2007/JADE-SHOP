"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCarePlanCompleteNotify = exports.onTaskCreateNotify = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const db = firebase_admin_1.default.firestore();
const SENDGRID_API_KEY = functions.config().sendgrid?.key;
if (SENDGRID_API_KEY)
    mail_1.default.setApiKey(SENDGRID_API_KEY);
async function getUserProfile(uid) {
    const snap = await db.collection('users').doc(uid).get();
    const data = snap.data() || {};
    return { email: data.email, name: (data.displayName || data.firstName || 'User') };
}
async function sendMail(to, subject, html) {
    if (!SENDGRID_API_KEY)
        return;
    const msg = {
        to,
        from: { email: 'no-reply@yourdomain.com', name: 'WoundCare System' },
        subject,
        html
    };
    await mail_1.default.send(msg);
}
exports.onTaskCreateNotify = functions.firestore
    .document('tasks/{taskId}')
    .onCreate(async (snap, context) => {
    const task = snap.data();
    if (!task?.assignedToUid)
        return;
    const assignee = await getUserProfile(task.assignedToUid);
    if (!assignee.email)
        return;
    const patient = task.patientId ? (await db.collection('patients').doc(task.patientId).get()).data() : null;
    const subject = `🗒️ Nouvelle tâche: ${task.title}`;
    const html = `
      <p>Bonjour ${assignee.name},</p>
      <p>Une nouvelle tâche vous a été assignée.</p>
      <ul>
        <li><b>Titre:</b> ${task.title}</li>
        <li><b>Patient:</b> ${patient?.displayName || 'N/A'}</li>
        <li><b>Échéance:</b> ${task.dueDate || '—'}</li>
        <li><b>Priorité:</b> ${task.priority || '—'}</li>
      </ul>
      <p>Statut initial: <b>${task.status}</b></p>
      <p>— WoundCare</p>
    `;
    await sendMail(assignee.email, subject, html);
});
exports.onCarePlanCompleteNotify = functions.firestore
    .document('carePlans/{planId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.status === 'completed' || after.status !== 'completed')
        return;
    const authorUid = after.authorUid;
    const author = authorUid ? await getUserProfile(authorUid) : { email: undefined, name: 'Author' };
    const wound = after.woundId ? (await db.collection('wounds').doc(after.woundId).get()).data() : null;
    const patient = wound?.patientId ? (await db.collection('patients').doc(wound.patientId).get()).data() : null;
    const subject = `✅ Care plan complété — ${patient?.displayName || 'Patient'}`;
    const html = `
      <p>Bonjour ${author.name},</p>
      <p>Le plan de soins pour la plaie <b>${wound?.location || wound?.id}</b> du patient <b>${patient?.displayName || 'N/A'}</b> est maintenant <b>complété</b>.</p>
      <p><b>Objectifs:</b> ${(after.goals || []).join(', ')}</p>
      <p><b>Interventions:</b> ${(after.interventions || []).join(', ')}</p>
      <p>— WoundCare</p>
    `;
    if (author.email)
        await sendMail(author.email, subject, html);
    const teamEmails = [];
    await Promise.all(teamEmails.map(e => sendMail(e, subject, html)));
});
