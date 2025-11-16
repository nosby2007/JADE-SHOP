import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InvoiceDoc, InvoiceItem, PaymentService } from '../paiement.service';

export interface InvoiceViewEditData {
  mode: 'view' | 'edit';
  patientId: string;
  invoice: InvoiceDoc;
}

@Component({
  selector: 'app-invoice-view-edit-dialog',
  templateUrl: './invoice-view-edit-dialog.component.html',
  styleUrls: ['./invoice-view-edit-dialog.component.scss'],
})
export class InvoiceViewEditDialogComponent {
  mode: 'view' | 'edit';
  patientId: string;
  invoice: InvoiceDoc;

  form = this.fb.group({
    status: ['', Validators.required],
    items: this.fb.array([] as any[]),
  });

  get itemsFA(): FormArray {
    return this.form.get('items') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private pay: PaymentService,
    private ref: MatDialogRef<InvoiceViewEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: InvoiceViewEditData
  ) {
    this.mode = data.mode;
    this.patientId = data.patientId;
    this.invoice = data.invoice;

    this.form.patchValue({ status: this.invoice.status });

    this.invoice.items.forEach(it => {
      this.itemsFA.push(
        this.fb.group({
          code: [{ value: it.code, disabled: true }],
          label: [it.label, [Validators.required]],
          department: [{ value: it.department, disabled: true }],
          unitPrice: [it.unitPrice, [Validators.required, Validators.min(0)]],
          qty: [it.qty, [Validators.required, Validators.min(1)]],
          lineTotal: [{ value: it.lineTotal, disabled: true }],
        })
      );
    });

    if (this.mode === 'view') {
      this.form.disable();
    }
  }

  recalcRow(ix: number) {
    const row = this.itemsFA.at(ix);
    const unit = Number(row.get('unitPrice')?.value || 0);
    const qty = Number(row.get('qty')?.value || 0);
    const total = unit * qty;
    row.get('lineTotal')?.setValue(total, { emitEvent: false });
  }

  addBlankItem() {
    this.itemsFA.push(
      this.fb.group({
        code: [{ value: 'CUST', disabled: true }],
        label: ['', [Validators.required]],
        department: [{ value: 'provider', disabled: true }],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
        qty: [1, [Validators.required, Validators.min(1)]],
        lineTotal: [{ value: 0, disabled: true }],
      })
    );
  }

  removeItem(ix: number) {
    this.itemsFA.removeAt(ix);
  }

  async save() {
    if (this.form.invalid || this.mode !== 'edit') return;

    const status = this.form.value.status as InvoiceDoc['status'];
    const items: InvoiceItem[] = this.itemsFA.getRawValue().map((r: any) => ({
      code: r.code,
      label: r.label,
      department: r.department,
      unitPrice: Number(r.unitPrice || 0),
      qty: Number(r.qty || 0),
      lineTotal: Number(r.unitPrice || 0) * Number(r.qty || 0),
    }));

    await this.pay.updateInvoice(this.patientId, this.invoice.id!, { status, items });
    this.ref.close(true);
  }

  close() {
    this.ref.close(false);
  }
}
