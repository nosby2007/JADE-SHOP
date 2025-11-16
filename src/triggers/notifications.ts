import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';

admin.initializeApp();
const db = admin.firestore();

const SENDGRID_API_KEY = functions.config().sendgrid?.key as string | undefined;
if (SENDGRID_API_KEY) sgMail.setApiKey(SENDGRID_API_KEY);

// ---------- helpers ----------
function fmtDate(v: any): string {
  try {
    if (!v) return '—';
    // Firestore Timestamp
    if (typeof v?.toDate === 'function') return v.toDate().toISOString();
    if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000).toISOString();
    // JS Date
    if (v instanceof Date) return v.toISOString();
    // ISO/string/number
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v) : d.toISOString();
  } catch {
    return String(v ?? '—');
  }
}

function patientDisplayName(p: any): string {
  return (
    p?.displayName ||
    p?.name ||
    p?.demographics?.legalName ||
    p?.demographics?.preferredName ||
    'Patient'
  );
}

async function getUserProfile(uid: string) {
  try {
    const snap = await db.collection('users').doc(uid).get();
    const data = snap.data() || {};
    return {
      email: (data.email as string | undefined) || undefined,
      name: (data.displayName || data.firstName || 'User') as string,
    };
  } catch (e) {
    functions.logger.warn('getUserProfile failed', { uid, e });
    return { email: undefined, name: 'User' };
  }
}

async function sendMail(to: string | string[], subject: string, html: string) {
  if (!SENDGRID_API_KEY) {
    functions.logger.info('SENDGRID key missing — skipping email', { subject, to });
    return;
  }
  const msg = {
    to,
    from: { email: 'support@perryhomewoundcare.network', name: 'innovacare-app' },
    subject,
    html,
  };
  try {
    await sgMail.send(msg as any);
  } catch (e) {
    functions.logger.error('SendGrid send failed', { subject, to, e });
  }
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

// =====================================
// Task: notify assignee on task create
// =====================================
export const onTaskCreateNotify = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap) => {
    const task = snap.data() as any;
    if (!task?.assignedToUid) return;

    const assignee = await getUserProfile(task.assignedToUid);
    if (!assignee.email) return;

    const patientData = task.patientId
      ? (await db.collection('patients').doc(task.patientId).get()).data()
      : null;

    const subject = `🗒️ New Task Assigned: ${task.title || 'Untitled'}`;
    const html = `
      <p>Hello ${assignee.name},</p>
      <p>A new task has been assigned to you.</p>
      <ul>
        <li><b>Title:</b> ${task.title || '—'}</li>
        <li><b>Patient:</b> ${patientDisplayName(patientData)}</li>
        <li><b>Due:</b> ${fmtDate(task.dueDate) || '—'}</li>
        <li><b>Priority:</b> ${task.priority || '—'}</li>
      </ul>
      <p>Initial status: <b>${task.status || '—'}</b></p>
      <p>— WoundCare</p>
    `;
    await sendMail(assignee.email, subject, html);
  });

// ==================================================
// Patient: notify on new patient document creation
// ==================================================
export const onPatientCreateNotify = functions.firestore
  .document('patients/{patientId}')
  .onCreate(async (snap, context) => {
    const p = snap.data() as any;

    // Try to discover relevant recipients
    const candidateUids: (string | undefined)[] = [
      p.createdByUid,
      p.assignedToUid,
      p.primaryNurseUid,
      p.caseManagerUid,
      p.primaryCareProviderUid,
      p.referringProviderUid,
    ];

    const profiles = await Promise.all(
      candidateUids.filter(Boolean).map((uid) => getUserProfile(uid as string))
    );

    // Allow explicit email list if present on doc, else build from discovered profiles
    const explicit: string[] = Array.isArray(p.notifyEmails) ? p.notifyEmails : [];
    const discovered: string[] = profiles.map((pr) => pr.email).filter(Boolean) as string[];
    const recipients = uniq([...explicit, ...discovered]);

    if (recipients.length === 0) {
      functions.logger.info('No recipients found for new patient; skipping email', {
        patientId: context.params.patientId,
      });
      return;
    }

    const subject = `👤 New Patient Created — ${patientDisplayName(p)}`;
    const html = `
      <p>A new patient record has been created.</p>
      <ul>
        <li><b>Name:</b> ${patientDisplayName(p)}</li>
        <li><b>Gender:</b> ${p.gender || p.demographics?.gender || '—'}</li>
        <li><b>DOB:</b> ${fmtDate(p.dob || p.demographics?.dob)}</li>
        <li><b>Admission:</b> ${fmtDate(p.admissionDate || p.demographics?.admissionDate)}</li>
        <li><b>Phone:</b> ${p.phone || p.demographics?.phone || '—'}</li>
        <li><b>Email:</b> ${p.email || p.demographics?.email || '—'}</li>
        <li><b>Payor:</b> ${p.paiement || p.payor || p.identity?.payor || '—'}</li>
        <li><b>Primary Provider:</b> ${p.docteur || p.clinical?.primaryCareProvider || '—'}</li>
      </ul>
      <p>— WoundCare</p>
    `;

    await sendMail(recipients, subject, html);
  });

// ==================================================
// Care plan: author notification when completed
// (kept from your original; wording switched to EN)
// ==================================================
export const onCarePlanCompleteNotify = functions.firestore
  .document('carePlans/{planId}')
  .onUpdate(async (change) => {
    const before = change.before.data() as any;
    const after = change.after.data() as any;

    if (before?.status === 'completed' || after?.status !== 'completed') return;

    const authorUid = after.authorUid as string | undefined;
    const author = authorUid ? await getUserProfile(authorUid) : { email: undefined, name: 'Author' };

    const wound = after.woundId
      ? (await db.collection('wounds').doc(after.woundId).get()).data()
      : null;

    const patient = wound?.patientId
      ? (await db.collection('patients').doc(wound.patientId).get()).data()
      : null;

    const subject = `✅ Care Plan Completed — ${patientDisplayName(patient)}`;
    const html = `
      <p>Hello ${author.name},</p>
      <p>The care plan for wound <b>${wound?.location || wound?.id || '—'}</b> of patient <b>${patientDisplayName(
        patient
      )}</b> is now <b>completed</b>.</p>
      <p><b>Goals:</b> ${(after.goals || []).join(', ') || '—'}</p>
      <p><b>Interventions:</b> ${(after.interventions || []).join(', ') || '—'}</p>
      <p>— WoundCare</p>
    `;

    if (author.email) await sendMail(author.email, subject, html);

    // Hook for notifying additional team addresses if you later add them
    const teamEmails: string[] = [];
    await Promise.all(teamEmails.map((e) => sendMail(e, subject, html)));
  });
