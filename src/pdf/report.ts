import PDFDocument from 'pdfkit';
import admin from 'firebase-admin';

const db = admin.firestore();
const bucket = admin.storage().bucket();

type Assessment = {
  date: string;
  size?: { lengthCm: number; widthCm: number; depthCm?: number };
  exudate?: string;
  exudateType?: string;
  tissue?: { granulationPct?: number; sloughPct?: number; necrosisPct?: number };
  periwound?: string;
  odor?: string;
  painScore?: number;
  dressingApplied?: string;
  images?: string[];
};

export async function generateWoundReportPDF(woundId: string){
  const wSnap = await db.collection('wounds').doc(woundId).get();
  if (!wSnap.exists) throw new Error('Wound not found');
  const wound = wSnap.data() as any;

  const pSnap = await db.collection('patients').doc(wound.patientId).get();
  const patient = pSnap.data() as any;

  const aSnaps = await db.collection('assessments')
    .where('woundId', '==', woundId)
    .orderBy('createdAt', 'desc').limit(10).get();
  const assessments = aSnaps.docs.map(d => ({ id: d.id, ...d.data() })) as any as Assessment[];

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  doc.fontSize(18).text('Wound Care — Rapport de plaie', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Patient: ${patient?.displayName || 'N/A'}`);
  doc.text(`DOB: ${patient?.dob || '—'}`);
  doc.text(`Plaie: ${wound.location} (${wound.etiology}${wound.stage ? `, Stade ${wound.stage}` : ''})`);
  doc.text(`Statut: ${wound.status}`);
  doc.moveDown();

  assessments.forEach((a, idx) => {
    doc.fontSize(13).text(`Évaluation #${assessments.length - idx} — ${a.date}`);
    const size = a.size ? `${a.size.lengthCm} x ${a.size.widthCm}${a.size.depthCm ? ` x ${a.size.depthCm}` : ''} cm` : 'N/A';
    doc.fontSize(11).list([
      `Taille: ${size}`,
      `Exsudat: ${a.exudate || '—'}${a.exudateType ? ` (${a.exudateType})` : ''}`,
      `Tissus: G${a.tissue?.granulationPct ?? 0}% / S${a.tissue?.sloughPct ?? 0}% / N${a.tissue?.necrosisPct ?? 0}%`,
      `Péri-plaie: ${a.periwound || '—'}`,
      `Odeur: ${a.odor || '—'}`,
      `Douleur: ${a.painScore ?? '—'} /10`,
      `Pansement: ${a.dressingApplied || '—'}`
    ]);
    doc.moveDown(0.5);
  });

  const images: string[] = [];
  for (const a of assessments){
    if (a.images && a.images.length) { for (const path of a.images) images.push(path); }
  }
  const limited = images.slice(0, 3);

  if (limited.length) {
    doc.addPage();
    doc.fontSize(14).text('Photos récentes', { underline: true });
    doc.moveDown();
    const w = 160, h = 120, gap = 20;
    let x = doc.x, y = doc.y;
    for (let i=0; i<limited.length; i++){
      try {
        const file = bucket.file(limited[i]);
        const [buf] = await file.download();
        doc.image(buf, x, y, { width: w, height: h });
      } catch {
        doc.rect(x, y, w, h).stroke();
        doc.text('Image introuvable', x+10, y+50);
      }
      x += w + gap;
      if ((i+1) % 2 === 0) { x = doc.x; y += h + gap; }
    }
  }

  doc.end();
  const pdfBuffer = await done;

  const now = new Date();
  const objectPath = `reports/wounds/${woundId}/report-${now.toISOString().slice(0,10)}.pdf`;
  const file = bucket.file(objectPath);
  await file.save(pdfBuffer, { contentType: 'application/pdf', resumable: false, metadata: { cacheControl: 'private, max-age=0' } });

  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000
  });

  return { path: objectPath, downloadUrl: signedUrl };
}
