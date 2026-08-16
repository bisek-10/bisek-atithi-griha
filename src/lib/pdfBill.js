import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatBS } from "./nepaliDate";

// stay: { room, patient_name, address, contact_number, check_in_at, check_out_at }
// bill: result of computeBillTotal(...)
// addonEntries: raw addon rows (with catalog name resolved as `label`)
// payment: { method, amount, paid_at } | null
// hotelProfile: { name, address, phone, near }
export function generateBillPdf({
  stay,
  bill,
  addonEntries,
  payment,
  hotelProfile,
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(hotelProfile?.name || "Bisek Atithi Griha", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 18;
  doc.text(hotelProfile?.address || "", marginX, y);
  if (hotelProfile?.near) {
    y += 14;
    doc.text(`Near ${hotelProfile.near}`, marginX, y);
  }
  if (hotelProfile?.phone) {
    y += 14;
    doc.text(`Phone: ${hotelProfile.phone}`, marginX, y);
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice / Bill", 420, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Room No: ${stay.room?.id ?? ""}`, 420, 70);
  doc.text(
    `Check-in: ${new Date(stay.check_in_at).toLocaleString()} (${formatBS(stay.check_in_at)} BS)`,
    420,
    84,
  );
  if (stay.check_out_at) {
    doc.text(
      `Check-out: ${new Date(stay.check_out_at).toLocaleString()} (${formatBS(stay.check_out_at)} BS)`,
      420,
      98,
    );
  }

  y += 30;
  doc.setDrawColor(200);
  doc.line(marginX, y, 555, y);
  y += 20;

  doc.setFont("helvetica", "bold");
  doc.text("Guest Details", marginX, y);
  doc.setFont("helvetica", "normal");
  y += 16;
  doc.text(`Name: ${stay.patient_name || "-"}`, marginX, y);
  y += 14;
  doc.text(`Address: ${stay.address || "-"}`, marginX, y);
  y += 14;
  doc.text(`Contact: ${stay.contact_number || "-"}`, marginX, y);
  y += 20;

  // Room nights table
  autoTable(doc, {
    startY: y,
    head: [["Room", "Nights", "Base Rate", "Extra Persons", "Charge (NPR)"]],
    body: bill.breakdown.map((r) => [
      `Room ${r.roomId ?? "-"}`,
      String(r.nights),
      r.baseRate.toFixed(2),
      r.extraPersons > 0 ? `${r.extraPersons} x ${r.extraPersonRate}` : "-",
      r.charge.toFixed(2),
    ]),
    margin: { left: marginX, right: 40 },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [47, 79, 62] },
    foot: [["", "", "", "Room subtotal", bill.roomTotal.toFixed(2)]],
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: 20,
      fontStyle: "bold",
    },
  });

  let nextY = doc.lastAutoTable.finalY + 20;

  if (addonEntries?.length) {
    autoTable(doc, {
      startY: nextY,
      head: [["Service", "Date(s)", "Qty", "Unit Price", "Total (NPR)"]],
      body: addonEntries.map((a) => [
        a.label,
        a.end_date && a.end_date !== a.start_date
          ? `${formatBS(a.start_date)} - ${formatBS(a.end_date)}`
          : formatBS(a.start_date),
        String(a.quantity),
        Number(a.unit_price).toFixed(2),
        Number(
          a.quantity *
            a.unit_price *
            (a.unit_type === "per_day" ||
            a.addon_catalog?.unit_type === "per_day"
              ? Math.max(
                  1,
                  Math.round(
                    (new Date(
                      `${a.end_date || a.start_date}T00:00:00Z`,
                    ).getTime() -
                      new Date(`${a.start_date}T00:00:00Z`).getTime()) /
                      86400000,
                  ) + 1,
                )
              : 1),
        ).toFixed(2),
      ]),
      margin: { left: marginX, right: 40 },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [200, 144, 26] },
      foot: [["", "", "", "Add-ons subtotal", bill.addonTotal.toFixed(2)]],
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: 20,
        fontStyle: "bold",
      },
    });
    nextY = doc.lastAutoTable.finalY + 20;
  }

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: NPR ${bill.grandTotal.toFixed(2)}`, marginX, nextY);
  nextY += 20;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (payment) {
    doc.text(
      `Paid via ${payment.method.toUpperCase()} — NPR ${Number(payment.amount).toFixed(2)} on ${new Date(payment.paid_at).toLocaleString()}`,
      marginX,
      nextY,
    );
  } else {
    doc.text("Payment: pending", marginX, nextY);
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "Thank you for staying with us. Wishing you and your family strength.",
    marginX,
    800,
  );

  return doc;
}

export function downloadBillPdf(args) {
  const doc = generateBillPdf(args);
  const filename = `bill-room${args.stay.room?.id}-${new Date(args.stay.check_in_at).toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
