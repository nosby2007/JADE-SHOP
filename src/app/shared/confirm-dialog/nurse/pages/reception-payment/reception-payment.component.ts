import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EncounterCode, InvoiceItem, InvoiceDoc, PaymentDoc, PayMethod, PaymentService } from '../paiement.service';
import { buildInvoicePdf } from 'src/app/shared/invoice-pdf.util';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceViewEditDialogComponent } from '../invoice-view-edit-dialog/invoice-view-edit-dialog.component';
import { PaymentEditDialogComponent } from '../payment-edit-dialog/payment-edit-dialog.component';

@Component({
  selector: 'app-reception-payment',
  templateUrl: './reception-payment.component.html',
  styleUrls: ['./reception-payment.component.scss']
})
export class ReceptionPaymentComponent implements OnInit, OnDestroy {
  /** REQUIRED: pass the target patient id from the parent page */
  @Input() patientId!: string;

  catalog: EncounterCode[] = [];
  items: InvoiceItem[] = [];
  subtotal = 0;
  createdInvoiceId?: string;
  createdInvoice?: InvoiceDoc | null;
  patientName = '';

  // Streams
  payments: PaymentDoc[] = [];
  invoices: InvoiceDoc[] = [];

  private sub = new Subscription();
  invMap: Record<string, InvoiceDoc> = {};
  addItemForm = this.fb.group({
    code: ['', Validators.required],
    qty: [1, [Validators.required, Validators.min(1)]],
  });

  customItemForm = this.fb.group({
    label: [''],
    department: ['provider'],
    unitPrice: [0, [Validators.min(0)]],
    qty: [1, [Validators.min(1)]],
  });

  paymentForm = this.fb.group({
    invoiceId: [''],
    method: ['cash' as PayMethod, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    reference: [''],
    note: [''],
  });

  loading = false;
  err = '';

  // NEW: simple filter form (works for both tables)
  filterForm = this.fb.group({
    q: [''],                // free text (invoice no, patient name, ref, note…)
    status: ['All'],        // OPEN | PARTIAL | PAID | All
    method: ['All'],        // cash|card|check|online|All
    min: [null],            // min amount
    max: [null],            // max amount
    dateFrom: [null],       // ISO date
    dateTo: [null],         // ISO date
  });

  constructor(private fb: FormBuilder, private pay: PaymentService,  private afs: AngularFirestore,  private dialog: MatDialog) {}

  ngOnInit(): void {
    if (!this.patientId) {
      this.err = '[ReceptionPayment] patientId is required';
      return;
    }
    this.catalog = this.pay.getCatalog();

    this.sub.add(
      this.pay.invoices$(this.patientId).subscribe(list => this.invoices = list || [])
    );
    this.sub.add(
      this.pay.payments$(this.patientId).subscribe(list => this.payments = list || [])
    );

     this.sub.add(
      this.afs.doc<any>(`patients/${this.patientId}`).valueChanges()
        .subscribe(p => {
          const n = p?.fullName || p?.name || [p?.firstName, p?.lastName].filter(Boolean).join(' ');
          this.patientName = (n || '').trim() || this.patientId;
        })
    );

    // invoices stream + build map for quick lookup
    this.sub.add(
      this.pay.invoices$(this.patientId).subscribe(list => {
        this.invoices = list || [];
        this.invMap = {};
        for (const inv of this.invoices) {
          if (inv.id) this.invMap[inv.id] = inv;
        }
      })
    );

    // payments stream
    this.sub.add(
      this.pay.payments$(this.patientId).subscribe(list => this.payments = list || [])
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

   // ---- FILTERED VIEWS (plain getters, no material table needed) ----
  get filteredInvoices(): InvoiceDoc[] {
    const f = this.filterForm.value;
    const q = (f.q || '').toString().toLowerCase();

    const from = f.dateFrom ? new Date(f.dateFrom) : null;
    const to   = f.dateTo   ? new Date(f.dateTo + 'T23:59:59') : null;

    return (this.invoices || []).filter(inv => {
      // text: invoiceNo or patient name
      let ok = true;
      if (q) {
        ok = (`${inv.invoiceNo}`.toLowerCase().includes(q) ||
              this.patientName.toLowerCase().includes(q));
      }
      if (!ok) return false;

      // status
      if (f.status && f.status !== 'All') {
        ok = inv.status === f.status;
        if (!ok) return false;
      }

      // amount range
      const total = Number(inv.total || 0);
      if (f.min != null && f.min !== '' && total < Number(f.min)) return false;
      if (f.max != null && f.max !== '' && total > Number(f.max)) return false;

      // date range
      const d: Date = (inv.createdAt?.toDate ? inv.createdAt.toDate() : inv.createdAt) || new Date(0);
      if (from && d < from) return false;
      if (to && d > to) return false;

      return true;
    });
  }

  get filteredPayments(): PaymentDoc[] {
    const f = this.filterForm.value;
    const q = (f.q || '').toString().toLowerCase();
    const from = f.dateFrom ? new Date(f.dateFrom) : null;
    const to   = f.dateTo   ? new Date(f.dateTo + 'T23:59:59') : null;

    return (this.payments || []).filter(p => {
      let ok = true;

      // method
      if (f.method && f.method !== 'All') {
        ok = p.method === f.method;
        if (!ok) return false;
      }

      // amount range
      const amt = Number(p.amount || 0);
      if (f.min != null && f.min !== '' && amt < Number(f.min)) return false;
      if (f.max != null && f.max !== '' && amt > Number(f.max)) return false;

      // date range (createdAt may be TS or Date)
      const d: Date = (p.createdAt?.toDate ? p.createdAt.toDate() : p.createdAt) || new Date(0);
      if (from && d < from) return false;
      if (to && d > to) return false;

      // text: reference, note, invoice no, patient name
      if (q) {
        const invNo = p.invoiceId ? (this.invMap[p.invoiceId]?.invoiceNo || '') : '';
        const text = [
          p.reference || '',
          p.note || '',
          invNo,
          this.patientName
        ].join(' ').toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }

  get codeSelected(): EncounterCode | undefined {
    const code = this.addItemForm.value.code!;
    return this.catalog.find(c => c.code === code);
  }

  addFromCode(): void {
    const { code, qty } = this.addItemForm.value;
    if (!code || !qty) return;
    const found = this.catalog.find(c => c.code === code);
    if (!found) return;
    const line: InvoiceItem = {
      code: found.code,
      label: found.label,
      department: found.department,
      unitPrice: found.unitPrice,
      qty,
      lineTotal: found.unitPrice * qty,
    };
    this.items.push(line);
    this.recalc();
  }

  addCustom(): void {
    const { label, department, unitPrice, qty } = this.customItemForm.value;
    if (!label || !qty || unitPrice == null || unitPrice < 0) return;
    const line: InvoiceItem = {
      code: 'CUST',
      label,
      department: (department as any) || 'provider',
      unitPrice: Number(unitPrice),
      qty: Number(qty),
      lineTotal: Number(unitPrice) * Number(qty),
    };
    this.items.push(line);
    this.recalc();
  }

  removeItem(ix: number): void {
    this.items.splice(ix, 1);
    this.recalc();
  }

  clearItems(): void {
    this.items = [];
    this.recalc();
  }

  private recalc(): void {
    this.subtotal = this.items.reduce((s, it) => s + Number(it.lineTotal || 0), 0);
  }

  async createInvoice(): Promise<void> {
    if (!this.patientId || this.items.length === 0) return;
    this.loading = true; this.err = '';
    try {
      const id = await this.pay.createInvoice(this.patientId, this.items);
      this.createdInvoiceId = id;
      this.clearItems();
    } catch (e: any) {
      this.err = e?.message || String(e);
    } finally {
      this.loading = false;
    }
  }

  async savePayment(): Promise<void> {
    if (!this.patientId) return;
    this.loading = true; this.err = '';
    const v = this.paymentForm.value;
    try {
      await this.pay.addPayment(this.patientId, {
        invoiceId: v.invoiceId || null,
        method: v.method!,
        amount: Number(v.amount || 0),
        reference: v.reference || '',
        note: v.note || '',
      });
      this.paymentForm.patchValue({ amount: 0, reference: '', note: '' });
    } catch (e: any) {
      this.err = e?.message || String(e);
    } finally {
      this.loading = false;
    }
  }

  downloadPdf(inv: InvoiceDoc) {
  const doc = buildInvoicePdf(inv, this.payments);
  doc.save(`${inv.invoiceNo}.pdf`);
}

printInvoice(inv: InvoiceDoc) {
  const doc = buildInvoicePdf(inv, this.payments);
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank'); // browser print dialog
}

  async onDeletePayment(p: PaymentDoc): Promise<void> {
    if (!this.patientId || !p?.id) return;
    if (!confirm(`Delete this payment of $${p.amount}?`)) return;

    this.loading = true; this.err = '';
    try {
      await this.pay.deletePayment(this.patientId, p.id);
    } catch (e: any) {
      this.err = e?.message || 'Unable to delete payment (check your permissions).';
    } finally {
      this.loading = false;
    }
  }

  async onDeleteInvoice(inv: InvoiceDoc): Promise<void> {
    if (!this.patientId || !inv?.id) return;
    if (!confirm(`Delete invoice ${inv.invoiceNo}? (only if it has no payments)`)) return;

    this.loading = true; this.err = '';
    try {
      await this.pay.deleteInvoice(this.patientId, inv.id);
    } catch (e: any) {
      this.err = e?.message || 'Unable to delete invoice (check payments or permissions).';
    } finally {
      this.loading = false;
    }
  }

  openInvoiceView(inv: InvoiceDoc) {
  this.dialog.open(InvoiceViewEditDialogComponent, {
    width: '820px',
    data: { mode: 'view', patientId: this.patientId, invoice: inv }
  });
}

openInvoiceEdit(inv: InvoiceDoc) {
  const dref = this.dialog.open(InvoiceViewEditDialogComponent, {
    width: '820px',
    data: { mode: 'edit', patientId: this.patientId, invoice: inv }
  });
  dref.afterClosed().subscribe(changed => {
    if (changed) {
      // Streams already listening; nothing else required.
    }
  });
}

openPaymentEdit(p: PaymentDoc) {
  const dref = this.dialog.open(PaymentEditDialogComponent, {
    width: '600px',
    data: { patientId: this.patientId, payment: p, invoices: this.invoices }
  });
  dref.afterClosed().subscribe(changed => {
    if (changed) {
      // payments$ stream updates automatically
    }
  });
}

}
