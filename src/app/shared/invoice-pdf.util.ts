import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceDoc, PaymentDoc } from './confirm-dialog/nurse/pages/paiement.service';


export function buildInvoicePdf(inv: InvoiceDoc, payments: PaymentDoc[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  // Header
  doc.setFontSize(18);
  doc.text('INNOVACARE — Invoice', 40, 40);
  doc.setFontSize(11);
  doc.text(`Invoice No: ${inv.invoiceNo}`, 40, 60);
  doc.text(`Patient: ${inv.patientId}`, 40, 76);
  doc.text(`Status: ${inv.status}`, 40, 92);

  // Items
  autoTable(doc, {
    startY: 120,
    head: [['Code','Label','Dept','Qty','Unit','Line Total']],
    body: inv.items.map(it => [
      it.code, it.label, it.department, String(it.qty),
      `$${it.unitPrice.toFixed(2)}`, `$${it.lineTotal.toFixed(2)}`
    ])
  });

  const afterItemsY = (doc as any).lastAutoTable.finalY || 140;

  // Totals
  doc.setFontSize(12);
  doc.text(`Subtotal: $${inv.subtotal.toFixed(2)}`, 40, afterItemsY + 24);
  doc.text(`Total: $${inv.total.toFixed(2)}`, 40, afterItemsY + 40);

  // Payments
  autoTable(doc, {
    startY: afterItemsY + 64,
    head: [['Method','Invoice','Amount']],
    body: payments
      .filter(p => p.invoiceId === inv.id)
      .map(p => [p.method, inv.invoiceNo, `$${(p.amount||0).toFixed(2)}`])
  });

  return doc;
}
