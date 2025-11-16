import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InvoiceDoc, PayMethod, PaymentDoc, PaymentService } from '../paiement.service';

export interface PaymentEditData {
  patientId: string;
  payment: PaymentDoc;
  invoices: InvoiceDoc[]; // to optionally re-link payment
}

@Component({
  selector: 'app-payment-edit-dialog',
  templateUrl: './payment-edit-dialog.component.html',
  styleUrls: ['./payment-edit-dialog.component.scss'],
})
export class PaymentEditDialogComponent {
  invoices: InvoiceDoc[];

 form = this.fb.nonNullable.group({
  invoiceId: '' as string,            // we'll coerce '' -> null on save
  method: 'cash' as PayMethod,        // never null
  amount: 0 as number,                // never null
  reference: '' as string,
  note: '' as string,
});


  constructor(
    private fb: FormBuilder,
    private pay: PaymentService,
    private ref: MatDialogRef<PaymentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentEditData
  ) {
    this.invoices = data.invoices || [];
    const p = data.payment;
    this.form.patchValue({
      invoiceId: p.invoiceId || '',
      method: p.method,
      amount: p.amount,
      reference: p.reference || '',
      note: p.note || '',
    });
  }

   async save(): Promise<void> {
    if (this.form.invalid || !this.data.payment.id) return;
    const v = this.form.getRawValue();

    // Coerce to the exact Partial<PaymentDoc> shape expected by the service
    const payload: Partial<PaymentDoc> = {
      invoiceId: v.invoiceId ? v.invoiceId : null,
      method: v.method as PayMethod,
      amount: Number(v.amount ?? 0),
      reference: v.reference ?? '',
      note: v.note ?? '',
    };

    try {
      await this.pay.updatePayment(this.data.patientId, this.data.payment.id, payload);
      this.ref.close(true);
    } catch (e) {
      console.error('[PaymentEditDialog] save error:', e);
    }
  }

  close() {
    this.ref.close(false);
  }
}
