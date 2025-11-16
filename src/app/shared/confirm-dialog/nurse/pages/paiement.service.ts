import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { map, Observable } from 'rxjs';

export type PayMethod = 'cash' | 'card' | 'check' | 'online';

export interface EncounterCode {
  code: string;
  label: string;
  department: 'nurse' | 'provider' | 'pharmacy' | 'lab' | 'social_service';
  unitPrice: number;
}

export interface InvoiceItem {
  code: string;
  label: string;
  department: EncounterCode['department'];
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface InvoiceDoc {
  id?: string;
  invoiceNo: string;
  patientId: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;           // extend later with tax/discount if needed
  status: 'OPEN' | 'PARTIAL' | 'PAID';
  createdAt: any;
  createdBy: string;
  updatedAt?: any;
  /** NEW: controls whether status is auto-recalculated from payments */
  statusMode?: 'AUTO' | 'MANUAL'; // default AUTO
}

export interface PaymentDoc {
  id?: string;
  patientId: string;
  invoiceId?: string | null;
  method: PayMethod;
  amount: number;
  reference?: string;
  note?: string;
  createdAt: any;
  createdBy: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private afs = inject(AngularFirestore);
  private auth = inject(AngularFireAuth);

  /** Reference catalog (extend as needed) */
  readonly catalog: EncounterCode[] = [
    { code: '005', label: 'Consultation', department: 'provider', unitPrice: 10 },
    { code: '006', label: 'Lab CMP',      department: 'lab',      unitPrice: 125 },
  ];

  /** Simple invoice number: INV-YYYYMMDD-XXXX */
  private async makeInvoiceNo(): Promise<string> {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `INV-${y}${m}${day}-${rand}`;
  }

  getCatalog(): EncounterCode[] {
    return this.catalog;
  }

  /* ===================== Invoices ===================== */

  async createInvoice(patientId: string, items: InvoiceItem[]): Promise<string> {
    if (!patientId) throw new Error('patientId required');
    if (!items.length) throw new Error('No items');

    const user = await this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const subtotal = items.reduce((s, it) => s + Number(it.lineTotal || 0), 0);
    const invoice: Omit<InvoiceDoc, 'id'> = {
      invoiceNo: await this.makeInvoiceNo(),
      patientId,
      items,
      subtotal,
      total: subtotal,
      status: 'OPEN',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: user.uid,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      statusMode: 'AUTO', // NEW: default to auto
    };

    const ref = await this.afs.collection(`patients/${patientId}/invoices`).add(invoice);
    return ref.id;
  }

  invoice$(patientId: string, invoiceId: string): Observable<InvoiceDoc | undefined> {
    return this.afs
      .doc<InvoiceDoc>(`patients/${patientId}/invoices/${invoiceId}`)
      .snapshotChanges()
      .pipe(
        map(s => {
          const data = s.payload.data();
          return s.payload.exists && data
            ? ({ id: s.payload.id, ...data })
            : undefined;
        })
      );
  }

  invoices$(patientId: string): Observable<InvoiceDoc[]> {
    return this.afs.collection<InvoiceDoc>(
      `patients/${patientId}/invoices`,
      ref => ref.orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  /** NEW: Explicit toggle for manual/auto status mode */
  async setInvoiceStatusMode(
    patientId: string,
    invoiceId: string,
    mode: 'AUTO' | 'MANUAL'
  ): Promise<void> {
    await this.afs.doc(`patients/${patientId}/invoices/${invoiceId}`).update({
      statusMode: mode,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    if (mode === 'AUTO') {
      // Recompute immediately when returning to AUTO
      await this.updateInvoiceStatus(patientId, invoiceId);
    }
  }

  /** Recompute invoice status from payments (skips if MANUAL) */
  async updateInvoiceStatus(patientId: string, invoiceId: string): Promise<void> {
    const invRef = this.afs.doc<InvoiceDoc>(`patients/${patientId}/invoices/${invoiceId}`).ref;
    const invSnap = await invRef.get();
    if (!invSnap.exists) return;

    const inv = invSnap.data() as InvoiceDoc;

    // NEW: Respect manual override
    if ((inv.statusMode || 'AUTO') === 'MANUAL') {
      return;
    }

    const paysSnap = await this.afs.collection<PaymentDoc>(
      `patients/${patientId}/payments`,
      ref => ref.where('invoiceId', '==', invoiceId)
    ).ref.get();

    const paid = paysSnap.docs.reduce((s, d) => s + Number((d.data().amount || 0)), 0);
    const due  = Math.max(Number(inv.total || 0) - paid, 0);
    const status: InvoiceDoc['status'] = paid <= 0 ? 'OPEN' : (due <= 0 ? 'PAID' : 'PARTIAL');

    await this.afs.doc(`patients/${patientId}/invoices/${invoiceId}`).update({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  /* ===================== Payments ===================== */

  async addPayment(
    patientId: string,
    data: Omit<PaymentDoc, 'createdAt' | 'createdBy' | 'patientId'>
  ): Promise<string> {
    if (!patientId) throw new Error('patientId required');
    const user = await this.auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const payload: Omit<PaymentDoc, 'id'> = {
      patientId,
      method: data.method,
      amount: Number(data.amount || 0),
      reference: data.reference || '',
      note: data.note || '',
      invoiceId: data.invoiceId ?? null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: user.uid,
    };

    const ref = await this.afs.collection(`patients/${patientId}/payments`).add(payload);

    // When AUTO, recompute. If MANUAL, updateInvoiceStatus will early-return.
    if (data.invoiceId) {
      await this.updateInvoiceStatus(patientId, data.invoiceId);
    }
    return ref.id;
  }

  payments$(patientId: string): Observable<PaymentDoc[]> {
    return this.afs.collection<PaymentDoc>(
      `patients/${patientId}/payments`,
      ref => ref.orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  /** Placeholder: UI can combine invoice$ with payments$ if needed */
  invoiceTotals$(patientId: string, invoiceId: string) {
    return this.invoice$(patientId, invoiceId);
  }

  /** Delete a payment, then refresh the linked invoice status (if any). */
  async deletePayment(patientId: string, paymentId: string): Promise<void> {
    if (!patientId || !paymentId) throw new Error('patientId and paymentId required');

    const pRef = this.afs.doc<PaymentDoc>(`patients/${patientId}/payments/${paymentId}`).ref;
    const snap = await pRef.get();
    if (!snap.exists) return;

    const data = snap.data() as PaymentDoc;
    await pRef.delete();

    if (data?.invoiceId) {
      await this.updateInvoiceStatus(patientId, data.invoiceId);
    }
  }

  /**
   * Delete an invoice ONLY if it has no payments.
   * (Match your Firestore security rules: delete allowed for admin/finance only.)
   */
  async deleteInvoice(patientId: string, invoiceId: string): Promise<void> {
    if (!patientId || !invoiceId) throw new Error('patientId and invoiceId required');

    const paysSnap = await this.afs.collection<PaymentDoc>(
      `patients/${patientId}/payments`,
      ref => ref.where('invoiceId', '==', invoiceId)
    ).ref.get();

    if (!paysSnap.empty) {
      throw new Error('Cannot delete invoice with existing payments. Delete payments first.');
    }

    await this.afs.doc(`patients/${patientId}/invoices/${invoiceId}`).delete();
  }

  /** Update an invoice (status and/or items). Respects MANUAL mode. */
  async updateInvoice(
    patientId: string,
    invoiceId: string,
    change: Partial<InvoiceDoc>
  ): Promise<void> {
    if (!patientId || !invoiceId) throw new Error('patientId and invoiceId required');

    const patch: any = { ...change, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };

    // If items were edited, recompute totals (lineTotal wins, otherwise unitPrice*qty)
    if (Array.isArray(change.items)) {
      const items = change.items.map(it => ({
        ...it,
        lineTotal: (it.lineTotal != null ? it.lineTotal : Number(it.unitPrice || 0) * Number(it.qty || 0))
      }));
      const subtotal = items.reduce((s, it) => s + (it.lineTotal || 0), 0);
      patch.items = items;
      patch.subtotal = subtotal;
      patch.total = subtotal;
    }

    // NEW: if the caller provided a status explicitly, switch to MANUAL mode
    if (Object.prototype.hasOwnProperty.call(change, 'status')) {
      patch.statusMode = 'MANUAL';
    }

    await this.afs.doc(`patients/${patientId}/invoices/${invoiceId}`).update(patch);

    // Only auto-recompute when no explicit manual status was set
    if (!Object.prototype.hasOwnProperty.call(change, 'status')) {
      await this.updateInvoiceStatus(patientId, invoiceId);
    }
  }

  /** Update a payment (amount, method, reference, note, invoice link). Keeps invoice status in sync (unless MANUAL). */
  async updatePayment(
    patientId: string,
    paymentId: string,
    change: Partial<PaymentDoc>
  ): Promise<void> {
    if (!patientId || !paymentId) throw new Error('patientId and paymentId required');

    const ref = this.afs.doc<PaymentDoc>(`patients/${patientId}/payments/${paymentId}`).ref;
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Payment not found');

    const before = snap.data() as PaymentDoc;

    const amount =
      change.amount != null ? Number(change.amount) : Number(before.amount || 0);

    await ref.update({
      ...change,
      amount,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    } as any);

    const invId = (change.invoiceId ?? before.invoiceId) || null;
    if (invId) {
      await this.updateInvoiceStatus(patientId, invId);
    }
  }
}
