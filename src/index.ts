// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';

admin.initializeApp();
const db = admin.firestore();

const app = express();

/* ---------------- CORS ---------------- */
const allowedOrigins = new Set<string>([
  'http://localhost:4200',
  'https://localhost:4200',
  'https://4200-firebase-jade-shopgit-1758333614171.cluster-4pw6tsljfvgw6vm32zi6vcadic.cloudworkstations.dev',
  'https://woundapp-261e6.firebaseapp.com',
  'https://woundapp-261e6.web.app',
]);

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'X-Requested-With',
    'X-Firebase-AppCheck',
    'X-Firebase-Auth',
  ],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use((_, res, next) => { res.setHeader('Vary', 'Origin'); next(); });
app.options('*', cors(corsOptions), (_req, res) => res.sendStatus(204));

/* ---------------- Body parser ---------------- */
app.use(express.json());

/* ---------------- Auth middleware ---------------- */
type AuthedReq = Request & { user?: admin.auth.DecodedIdToken };

async function requireAuth(req: AuthedReq, res: Response, next: NextFunction) {
  try {
    const h = req.headers.authorization || '';
    const m = h.match(/^Bearer (.+)$/i);
    if (!m) return res.status(401).json({ error: 'Missing Authorization: Bearer <idToken>' });
    const decoded = await admin.auth().verifyIdToken(m[1]);
    req.user = decoded;
    return next();
  } catch (e: any) {
    return res.status(401).json({ error: e?.message || 'unauthorized' });
  }
}

/* ---------------- Utils ---------------- */
function stripUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => stripUndefined(v)) as unknown as T;
  }
  if (obj && typeof obj === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj as any)) {
      if (v !== undefined) out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return obj;
}

/* ---------------- Health ---------------- */
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

/* ---------------- PATIENTS ---------------- */
app.post('/patients', requireAuth, async (req: AuthedReq, res: Response) => {
  try {
    const data = stripUndefined(req.body || {});
    if (!data?.name) return res.status(400).json({ error: 'name required' });
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await db.collection('patients').add({ ...data, createdAt: now });
    return res.status(201).json({ id: ref.id });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

app.get('/patients', requireAuth, async (_req: AuthedReq, res: Response) => {
  const snap = await db.collection('patients').orderBy('createdAt', 'desc').limit(100).get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json(items);
});

app.get('/patients/:patientId', requireAuth, async (req: AuthedReq, res: Response) => {
  const doc = await db.doc(`patients/${req.params.patientId}`).get();
  if (!doc.exists) return res.status(404).json({ error: 'not_found' });
  res.json({ id: doc.id, ...doc.data() });
});

app.patch('/patients/:patientId', requireAuth, async (req: AuthedReq, res: Response) => {
  const patch = stripUndefined(req.body || {});
  await db.doc(`patients/${req.params.patientId}`).update(patch);
  res.json({ ok: true });
});

app.delete('/patients/:patientId', requireAuth, async (req: AuthedReq, res: Response) => {
  const { patientId } = req.params;
  const batch = db.batch();
  const assessments = await db.collection(`patients/${patientId}/woundAssessments`).get();
  assessments.forEach((d) => batch.delete(d.ref));
  batch.delete(db.doc(`patients/${patientId}`));
  await batch.commit();
  res.json({ ok: true, deletedAssessments: assessments.size });
});

/* ---------------- WOUNDS (legacy) ---------------- */
app.post('/wounds', requireAuth, async (req: AuthedReq, res: Response) => {
  const { patientId, data } = req.body || {};
  if (!patientId || !data) return res.status(400).json({ error: 'patientId & data required' });
  const now = admin.firestore.FieldValue.serverTimestamp();
  const payload = stripUndefined({ ...data, createdAt: now });
  const ref = await db.collection(`patients/${patientId}/woundAssessments`).add(payload);
  res.status(201).json({ id: ref.id });
});

app.get('/wounds/:patientId', requireAuth, async (req: AuthedReq, res: Response) => {
  const snap = await db
    .collection(`patients/${req.params.patientId}/woundAssessments`)
    .orderBy('createdAt', 'desc')
    .get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json(items);
});

app.get('/wounds/:patientId/:assessmentId', requireAuth, async (req: AuthedReq, res: Response) => {
  const { patientId, assessmentId } = req.params;
  const doc = await db.doc(`patients/${patientId}/woundAssessments/${assessmentId}`).get();
  if (!doc.exists) return res.status(404).json({ error: 'not_found' });
  res.json({ id: doc.id, ...doc.data() });
});

app.patch('/wounds/:patientId/:assessmentId', requireAuth, async (req: AuthedReq, res: Response) => {
  const { patientId, assessmentId } = req.params;
  const patch = stripUndefined(req.body || {});
  await db.doc(`patients/${patientId}/woundAssessments/${assessmentId}`).update(patch);
  res.json({ ok: true });
});

app.delete('/wounds/:patientId/:assessmentId', requireAuth, async (req: AuthedReq, res: Response) => {
  const { patientId, assessmentId } = req.params;
  await db.doc(`patients/${patientId}/woundAssessments/${assessmentId}`).delete();
  res.json({ ok: true });
});

/* ---------------- ASSESSMENTS (générique) ---------------- */
// Aligne avec NurseDataService.addAssessment -> POST /patients/:pid/assessments
app.post('/patients/:patientId/assessments', requireAuth, async (req: AuthedReq, res: Response) => {
  try {
    const { patientId } = req.params;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });

    const now = admin.firestore.FieldValue.serverTimestamp();
    const uid = req.user!.uid;

    // le client peut envoyer des champs quelconques; on nettoie
    const body = stripUndefined(req.body || {});
    // on impose les champs requis côté règles
    const payload = {
      ...body,
      patientId,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(`patients/${patientId}/assessments`).add(payload);
    return res.status(201).json({ id: ref.id });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'bad_request' });
  }
});

/* ---------------- PRESCRIPTIONS ---------------- */
// Créer une prescription (aligne avec NurseDataService.addRx)
app.post('/patients/:patientId/prescriptions', requireAuth, async (req: AuthedReq, res: Response) => {
  try {
    const { patientId } = req.params;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });

    const uid = req.user!.uid;
    const now = admin.firestore.FieldValue.serverTimestamp();

    // Le client envoie un payload JSON-safe (dates en ms/ISO, pas de FieldValue)
    const body = stripUndefined(req.body || {});
    // On reconstruit le payload attendu par les règles
    const payload: Record<string, any> = {
      ...body,
      patientId,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    };

    // Si eSignature existe côté client, on force un signedAt côté serveur
    if (payload.eSignature && typeof payload.eSignature === 'object') {
      payload.eSignature = {
        ...payload.eSignature,
        signerUid: uid,
        signedAt: now,
      };
    }

    const ref = await db.collection(`patients/${patientId}/prescriptions`).add(payload);
    return res.status(201).json({ id: ref.id });
  } catch (e: any) {
    console.error('POST /patients/:patientId/prescriptions error', e);
    return res.status(400).json({ error: e?.message || 'bad_request' });
  }
});

// (optionnel) Lister les prescriptions d’un patient
app.get('/patients/:patientId/prescriptions', requireAuth, async (req: AuthedReq, res: Response) => {
  const { patientId } = req.params;
  const snap = await db
    .collection(`patients/${patientId}/prescriptions`)
    .orderBy('createdAt', 'desc')
    .get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json(items);
});

// (optionnel) Mise à jour d’une prescription
app.patch('/patients/:patientId/prescriptions/:rxId', requireAuth, async (req: AuthedReq, res: Response) => {
  const { patientId, rxId } = req.params;
  const patch = stripUndefined(req.body || {});
  const now = admin.firestore.FieldValue.serverTimestamp();
  await db.doc(`patients/${patientId}/prescriptions/${rxId}`).update({ ...patch, updatedAt: now });
  res.json({ ok: true });
});

// (optionnel) Suppression (si tes règles l’autorisent pour admin)
app.delete('/patients/:patientId/prescriptions/:rxId', requireAuth, async (req: AuthedReq, res: Response) => {
  const { patientId, rxId } = req.params;
  await db.doc(`patients/${patientId}/prescriptions/${rxId}`).delete();
  res.json({ ok: true });
});

/* ---------------- Callable: Admin helpers ---------------- */
async function assertCallerIsAdmin(context: functions.https.CallableContext) {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in required');
  const uid = context.auth.uid;
  const snap = await db.doc(`admins/${uid}`).get();
  if (!snap.exists) throw new functions.https.HttpsError('permission-denied', 'Admins only');
}

function isE164(s: any): boolean {
  return typeof s === 'string' && /^\+\d{8,15}$/.test(s);
}

export const adminCreateUser = functions.https.onCall(async (data, context) => {
  try {
    await assertCallerIsAdmin(context);

    const { email, password, displayName, role, phoneNumber, photoURL } = data || {};
    if (!email || !password) {
      throw new functions.https.HttpsError('invalid-argument', 'email & password are required');
    }

    const createReq: admin.auth.CreateRequest = {
      email,
      password,
      displayName,
      disabled: false,
    };
    if (isE164(phoneNumber)) createReq.phoneNumber = phoneNumber;
    if (typeof photoURL === 'string' && photoURL.trim()) createReq.photoURL = photoURL.trim();

    const userRecord = await admin.auth().createUser(createReq);

    const roles = role ? [role] : ['user'];
    await admin.auth().setCustomUserClaims(userRecord.uid, { roles });

    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName: displayName ?? '',
      role: roles[0],
      roles,
      phoneNumber: isE164(phoneNumber) ? phoneNumber : null,
      photoURL: typeof photoURL === 'string' && photoURL.trim() ? photoURL.trim() : null,
      status: 'active',
      isVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
      disabled: false,
    });

    return { ok: true, uid: userRecord.uid, roles };
  } catch (e: any) {
    console.error('adminCreateUser error:', e);
    if (e instanceof functions.https.HttpsError) throw e;
    throw new functions.https.HttpsError('internal', e?.message ?? 'internal error');
  }
});

export const setUserRoles = functions.https.onCall(async (data, context) => {
  await assertCallerIsAdmin(context);

  const { uid, roles } = data as { uid: string; roles: string[] };
  if (!uid || !Array.isArray(roles) || roles.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'uid and roles[] are required');
  }

  await admin.auth().setCustomUserClaims(uid, { roles });
  await db
    .collection('users')
    .doc(uid)
    .set(
      {
        roles,
        role: roles[0] ?? 'user',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  return { ok: true };
});

/* ---------------- Export HTTP API ---------------- */
export const api = functions.region('us-central1').https.onRequest(app);
