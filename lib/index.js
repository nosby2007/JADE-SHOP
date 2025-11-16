"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();
const app = express();

/* ---------------- CORS ---------------- */
const allowedOrigins = new Set([
  "http://localhost:4200",
  "https://localhost:4200",
  "https://4200-firebase-jade-shopgit-1758333614171.cluster-4pw6tsljfvgw6vm32zi6vcadic.cloudworkstations.dev",
  "https://woundapp-261e6.firebaseapp.com",
  "https://woundapp-261e6.web.app",
]);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "X-Requested-With",
    "X-Firebase-AppCheck",
    "X-Firebase-Auth",
  ],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use((_, res, next) => {
  res.setHeader("Vary", "Origin");
  next();
});
app.options("*", cors(corsOptions), (_req, res) => res.sendStatus(204));

/* ---------------- Body parser ---------------- */
app.use(express.json());

/* ---------------- Auth middleware ---------------- */
async function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const m = h.match(/^Bearer (.+)$/i);
    if (!m) return res.status(401).json({ error: "Missing Authorization: Bearer <idToken>" });
    const decoded = await admin.auth().verifyIdToken(m[1]);
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ error: (e && e.message) || "unauthorized" });
  }
}

/* ---------------- Utils ---------------- */
function stripUndefined(obj) {
  if (Array.isArray(obj)) return obj.map((v) => stripUndefined(v));
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) out[k] = stripUndefined(v);
    }
    return out;
  }
  return obj;
}

/* =======================================================================
 *                           PRINT TEMPLATES
 * ======================================================================= */
function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[m]);
}

function renderSignatures(signatures) {
  if (!signatures) return "";
  const left = signatures.left || {};
  const right = signatures.right || {};
  return `
    <h2>Signatures</h2>
    <div class="row">
      <div class="col">
        <div class="muted">Provider Signature</div>
        ${left.image ? `<img class="signature" src="${esc(left.image)}" />` : "<div class=\"signature\"></div>"}
        <div>${esc(left.name || "")}</div>
        <div class="muted">${esc(left.title || "")}</div>
      </div>
      <div class="col">
        <div class="muted">Patient/Guardian</div>
        ${right.image ? `<img class="signature" src="${esc(right.image)}" />` : "<div class=\"signature\"></div>"}
        <div>${esc(right.name || "")}</div>
        <div class="muted">${esc(right.relation || "")}</div>
      </div>
    </div>
  `;
}

function renderAssessment(d) {
  const patient = d.patient || {};
  const findings = Array.isArray(d.findings) ? d.findings : [];
  const vitals = d.vitals || {};

  return `
    <h1>Clinical Assessment Report</h1>
    <div class="row">
      <div class="col">
        <strong>Patient:</strong> ${esc(patient.name || "")}<br/>
        <span class="muted">DOB:</span> ${esc(patient.dob || "")}<br/>
        <span class="muted">ID:</span> ${esc(patient.id || "")}
      </div>
      <div class="col">
        <strong>Date:</strong> ${esc(d.date || "")}<br/>
        <span class="muted">Assessor:</span> ${esc(d.assessor || "")}<br/>
        <span class="muted">Location:</span> ${esc(d.location || "")}
      </div>
    </div>

    <h2>Vitals</h2>
    <table>
      <tr><th>BP</th><th>HR</th><th>Temp</th><th>Resp</th><th>SpO₂</th><th>Weight</th></tr>
      <tr>
        <td>${esc(vitals.bp || "")}</td>
        <td>${esc(vitals.hr || "")}</td>
        <td>${esc(vitals.temp || "")}</td>
        <td>${esc(vitals.rr || "")}</td>
        <td>${esc(vitals.spo2 || "")}</td>
        <td>${esc(vitals.weight || "")}</td>
      </tr>
    </table>

    <h2>Findings</h2>
    <table>
      <tr><th>#</th><th>Description</th><th>Severity</th><th>Notes</th></tr>
      ${findings.map((f, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${esc(f.description || "")}</td>
          <td><span class="badge">${esc(f.severity || "n/a")}</span></td>
          <td>${esc(f.notes || "")}</td>
        </tr>
      `).join("")}
    </table>

    ${renderSignatures(d.signatures)}
  `;
}

function renderPrescription(d) {
  const patient = d.patient || {};
  const items = Array.isArray(d.items) ? d.items : [];

  return `
    <h1>Prescription</h1>
    <div class="row">
      <div class="col">
        <strong>Patient:</strong> ${esc(patient.name || "")}<br/>
        <span class="muted">DOB:</span> ${esc(patient.dob || "")}<br/>
        <span class="muted">ID:</span> ${esc(patient.id || "")}
      </div>
      <div class="col">
        <strong>Date:</strong> ${esc(d.date || "")}<br/>
        <span class="muted">Prescriber:</span> ${esc(d.prescriber || "")}<br/>
        <span class="muted">License:</span> ${esc(d.license || "")}
      </div>
    </div>

    <h2>Medications</h2>
    <table>
      <tr><th>Drug</th><th>Dosage</th><th>Route</th><th>Frequency</th><th>Duration</th><th>Notes</th></tr>
      ${items.map((m) => `
        <tr>
          <td>${esc(m.drug || "")}</td>
          <td>${esc(m.dose || "")}</td>
          <td>${esc(m.route || "")}</td>
          <td>${esc(m.frequency || "")}</td>
          <td>${esc(m.duration || "")}</td>
          <td>${esc(m.notes || "")}</td>
        </tr>
      `).join("")}
    </table>

    ${renderSignatures(d.signatures)}
  `;
}

function renderCustom(d) {
  return `
    <h1>${esc(d.title || "Report")}</h1>
    <div>${esc(d.subtitle || "")}</div>
    <div class="hr"></div>
    <div>${(d.html && typeof d.html === "string") ? d.html : "<em>No content</em>"}</div>
    ${renderSignatures(d.signatures)}
  `;
}

function buildHtml(type, data) {
  const styles = `
    <style>
      @page { size: A4; margin: 16mm; }
      body { font-family: Arial, Helvetica, sans-serif; color: #222; font-size: 12px; }
      h1 { font-size: 20px; margin: 0 0 8px; }
      h2 { font-size: 16px; margin: 18px 0 6px; }
      .muted { color:#666; }
      .row { display:flex; gap:16px; }
      .col { flex:1 }
      table { width:100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border: 1px solid #ddd; padding: 6px; vertical-align: top; }
      th { background:#f7f7f7; text-align:left; }
      .hr { height:1px; background:#e5e5e5; margin:12px 0; }
      .footer { position: fixed; bottom: -10mm; left: 0; right: 0; font-size: 10px; color:#777; text-align:center; }
      .badge { padding: 2px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 10px; }
      .signature { height: 64px; }
      .page-break { page-break-after: always; }
      img { max-width: 100%; }
      a { color: #1a0dab; }
    </style>
  `;

  let body = "";
  if (type === "assessment") body = renderAssessment(data);
  else if (type === "prescription") body = renderPrescription(data);
  else body = renderCustom(data);

  // You can prepend a branded header here if desired.

  return `
    <html>
      <head><meta charset="utf-8" />${styles}</head>
      <body>
        ${body}
        <div class="footer">Generated by SYGEPC · ${new Date().toLocaleString()}</div>
      </body>
    </html>
  `;
}

/* =======================================================================
 *                           API ROUTES
 * ======================================================================= */

/* ---------------- Health ---------------- */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* ---------------- PATIENTS ---------------- */
app.post("/patients", requireAuth, async (req, res) => {
  try {
    const data = stripUndefined(req.body || {});
    if (!data || !data.name) return res.status(400).json({ error: "name required" });
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await db.collection("patients").add({ ...data, createdAt: now });
    return res.status(201).json({ id: ref.id });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/patients", requireAuth, async (_req, res) => {
  const snap = await db.collection("patients").orderBy("createdAt", "desc").limit(100).get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json(items);
});

app.get("/patients/:patientId", requireAuth, async (req, res) => {
  const doc = await db.doc(`patients/${req.params.patientId}`).get();
  if (!doc.exists) return res.status(404).json({ error: "not_found" });
  res.json({ id: doc.id, ...doc.data() });
});

app.patch("/patients/:patientId", requireAuth, async (req, res) => {
  const patch = stripUndefined(req.body || {});
  await db.doc(`patients/${req.params.patientId}`).update(patch);
  res.json({ ok: true });
});

app.delete("/patients/:patientId", requireAuth, async (req, res) => {
  const patientId = req.params.patientId;
  const batch = db.batch();
  const assessments = await db.collection(`patients/${patientId}/woundAssessments`).get();
  assessments.forEach((d) => batch.delete(d.ref));
  batch.delete(db.doc(`patients/${patientId}`));
  await batch.commit();
  res.json({ ok: true, deletedAssessments: assessments.size });
});

/* ---------------- WOUNDS / ASSESSMENTS ---------------- */
app.post("/wounds", requireAuth, async (req, res) => {
  const body = req.body || {};
  const patientId = body.patientId;
  const data = body.data;
  if (!patientId || !data) return res.status(400).json({ error: "patientId & data required" });
  const now = admin.firestore.FieldValue.serverTimestamp();
  const payload = stripUndefined({ ...data, createdAt: now });
  const ref = await db.collection(`patients/${patientId}/woundAssessments`).add(payload);
  res.status(201).json({ id: ref.id });
});

app.get("/wounds/:patientId", requireAuth, async (req, res) => {
  const snap = await db
    .collection(`patients/${req.params.patientId}/woundAssessments`)
    .orderBy("createdAt", "desc")
    .get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json(items);
});

app.get("/wounds/:patientId/:assessmentId", requireAuth, async (req, res) => {
  const patientId = req.params.patientId;
  const assessmentId = req.params.assessmentId;
  const doc = await db.doc(`patients/${patientId}/woundAssessments/${assessmentId}`).get();
  if (!doc.exists) return res.status(404).json({ error: "not_found" });
  res.json({ id: doc.id, ...doc.data() });
});

app.patch("/wounds/:patientId/:assessmentId", requireAuth, async (req, res) => {
  const patientId = req.params.patientId;
  const assessmentId = req.params.assessmentId;
  const patch = stripUndefined(req.body || {});
  await db.doc(`patients/${patientId}/woundAssessments/${assessmentId}`).update(patch);
  res.json({ ok: true });
});

app.delete("/wounds/:patientId/:assessmentId", requireAuth, async (req, res) => {
  const patientId = req.params.patientId;
  const assessmentId = req.params.assessmentId;
  await db.doc(`patients/${patientId}/woundAssessments/${assessmentId}`).delete();
  res.json({ ok: true });
});

/* ---------------- PRESCRIPTIONS ---------------- */
app.post("/patients/:patientId/prescriptions", requireAuth, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const uid = req.user.uid;
    const body = stripUndefined(req.body || {});
    const now = admin.firestore.FieldValue.serverTimestamp();
    const payload = {
      ...body,
      patientId,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await db.collection(`patients/${patientId}/prescriptions`).add(payload);
    return res.status(201).json({ id: ref.id });
  } catch (e) {
    return res.status(400).json({ error: (e && e.message) || "bad_request" });
  }
});

app.get("/patients/:patientId/prescriptions", requireAuth, async (req, res) => {
  const patientId = req.params.patientId;
  const snap = await db.collection(`patients/${patientId}/prescriptions`).orderBy("createdAt", "desc").get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.json(items);
});

app.patch("/patients/:patientId/prescriptions/:rxId", requireAuth, async (req, res) => {
  const patientId = req.params.patientId;
  const rxId = req.params.rxId;
  const patch = stripUndefined(req.body || {});
  patch.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  await db.doc(`patients/${patientId}/prescriptions/${rxId}`).update(patch);
  res.json({ ok: true });
});

app.delete("/patients/:patientId/prescriptions/:rxId", requireAuth, async (req, res) => {
  const patientId = req.params.patientId;
  const rxId = req.params.rxId;
  await db.doc(`patients/${patientId}/prescriptions/${rxId}`).delete();
  res.json({ ok: true });
});

/* ---------------- PRINT (uses lazy requires) ---------------- */
/**
 * POST /print
 * Authorization: Bearer <Firebase ID token>
 * Body:
 *  {
 *    type: "assessment"|"prescription"|"custom",
 *    data: {...},
 *    bucketName?: string,
 *    returnBase64?: boolean,
 *    urlExpiryHours?: number
 *  }
 */
app.post("/print", requireAuth, async (req, res) => {
  // Lazy-load to avoid cold-start module failures if deps not installed during deploy
  const chromium = require("@sparticuz/chromium");
  const puppeteer = require("puppeteer-core");

  // CORS hint (already enabled globally); keep per-route if you like:
  res.set("Vary", "Origin");

  try {
    const {
      type = "custom",
      data = {},
      bucketName,            // optional override
      returnBase64 = false,  // set true to test PDF without Storage
      urlExpiryHours = 168,  // 7 days
      debug = false          // enable to surface more detail in response
    } = req.body || {};

    const id = data.id || String(Date.now());
    const fileName = `${type}-${id}.pdf`;

    // ---- Build HTML
    const html = buildHtml(type, data);

    // ---- Launch Puppeteer / Chromium
    const execPath = await chromium.executablePath();
    if (!execPath) {
      throw new Error("Chromium executablePath not found. Ensure @sparticuz/chromium installed.");
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: execPath,
      headless: "new",               // <— important; more reliable in CF Gen2
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // If your HTML references remote resources/images, networkidle0 waits longer.
    await page.setContent(html, { waitUntil: ["load", "domcontentloaded", "networkidle0"] });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "14mm", bottom: "16mm", left: "14mm" },
    });

    await browser.close();

    // ---- Fast path: return base64 to verify Chromium works and bypass Storage/IAM
    if (returnBase64) {
      return res.status(200).json({
        name: fileName,
        url: "",         // not used in this mode
        base64: pdfBuffer.toString("base64"),
        debug: debug ? { stage: "pdf_ready_no_storage" } : undefined,
      });
    }

    // ---- Resolve target bucket robustly
    const firebaseDefaultBucket = (admin.app().options && admin.app().options.storageBucket) || "";
    const envBucket = process.env.GCS_BUCKET || "";
    const targetBucketName = bucketName || envBucket || firebaseDefaultBucket;

    if (!targetBucketName) {
      throw new Error(
        "No Storage bucket configured. Set Firebase Storage in the project, " +
        "or pass body.bucketName, or set env GCS_BUCKET, or initialize admin with storageBucket."
      );
    }

    const bucket = admin.storage().bucket(targetBucketName);
    const destPath = `reports/${type}/${fileName}`;
    const file = bucket.file(destPath);

    await file.save(pdfBuffer, {
      contentType: "application/pdf",
      resumable: false,
      metadata: { cacheControl: "private, max-age=0" },
    });

    // Signed URL (requires uniform bucket access + service account permission)
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + urlExpiryHours * 60 * 60 * 1000,
    });

    return res.status(200).json({
      url: signedUrl,
      name: fileName,
      path: destPath,
      bucket: targetBucketName,
      debug: debug ? { stage: "uploaded_signed" } : undefined,
    });
  } catch (err) {
    // Stronger logging to Cloud Logging
    console.error("PRINT error:", {
      message: err?.message,
      stack: err?.stack,
      code: err?.code,
    });

    // Send the reason back to the client to avoid blind 500s
    return res.status(500).json({
      error: err?.message || "Internal error",
      hint:
        "If this is a bucket error, pass {bucketName} in the body or set env GCS_BUCKET. " +
        "If this is a Chromium error, try {returnBase64:true} to isolate Storage.",
    });
  }
});


/* ---------------- Export HTTP API ---------------- */
exports.api = functions
  .region("us-central1")
  .runWith({ memory: "1GB", timeoutSeconds: 120 })
  .https.onRequest(app);
