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
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const marginRight = 40;
  const contentWidth = pageWidth - marginX - marginRight;
  let y = 40;

  // ===== HEADER SECTION =====
  const headerBgColor = [25, 40, 30]; // Professional dark green
  doc.setFillColor(...headerBgColor);
  doc.rect(0, 0, pageWidth, 90, "F");

  // Hotel name and logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(hotelProfile?.name || "Bisek Atithi Griha", marginX, 30);

  // Hotel details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);

  let detailY = 45;
  doc.text(hotelProfile?.address || "", marginX, detailY);
  detailY += 11;

  if (hotelProfile?.near) {
    doc.text(`Near: ${hotelProfile.near}`, marginX, detailY);
    detailY += 11;
  }

  if (hotelProfile?.phone) {
    doc.text(`Phone: ${hotelProfile.phone}`, marginX, detailY);
    detailY += 11;
  }

  // PAN Number
  doc.text(`PAN No. 604184588`, marginX, detailY);

  // Invoice title on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", pageWidth - marginRight - 50, 40);

  // Invoice details on right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  let rightX = pageWidth - marginRight - 50;
  doc.text(`Room No: ${stay.room?.id ?? "-"}`, rightX, 58, { align: "right" });
  doc.text(
    `Invoice Date: ${new Date(stay.check_in_at).toLocaleDateString("en-NP")}`,
    rightX,
    70,
    { align: "right" },
  );
  doc.text(`${formatBS(stay.check_in_at)} BS`, rightX, 82, { align: "right" });

  y = 105;

  // ===== CUSTOMER DETAILS SECTION =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("BILL TO:", marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  y += 14;
  doc.text(`Name: ${stay.patient_name || "-"}`, marginX, y);
  y += 11;
  doc.text(`Address: ${stay.address || "-"}`, marginX, y);
  y += 11;
  doc.text(`Contact: ${stay.contact_number || "-"}`, marginX, y);

  // Check-in/Check-out dates on the right
  doc.setFont("helvetica", "bold");
  doc.text("STAY DETAILS:", pageWidth - marginRight - 100, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  let rightDetailY = 119;
  doc.text(
    `Check-in: ${new Date(stay.check_in_at).toLocaleString("en-NP")}`,
    pageWidth - marginRight - 100,
    rightDetailY,
  );
  rightDetailY += 10;
  doc.text(
    `(${formatBS(stay.check_in_at)} BS)`,
    pageWidth - marginRight - 100,
    rightDetailY,
  );
  rightDetailY += 10;

  if (stay.check_out_at) {
    doc.text(
      `Check-out: ${new Date(stay.check_out_at).toLocaleString("en-NP")}`,
      pageWidth - marginRight - 100,
      rightDetailY,
    );
    rightDetailY += 10;
    doc.text(
      `(${formatBS(stay.check_out_at)} BS)`,
      pageWidth - marginRight - 100,
      rightDetailY,
    );
  }

  y = 160;

  // ===== SEPARATOR LINE =====
  doc.setDrawColor(180, 180, 180);
  doc.line(marginX, y, pageWidth - marginRight, y);
  y += 15;

  // ===== ROOM CHARGES TABLE =====
  autoTable(doc, {
    startY: y,
    head: [
      [
        "Description",
        "Nights",
        "Unit Price (NPR)",
        "Extra Persons",
        "Amount (NPR)",
      ],
    ],
    body: bill.breakdown.map((r) => [
      `Room ${r.roomId ?? "-"}`,
      String(r.nights),
      r.baseRate.toFixed(2),
      r.extraPersons > 0
        ? `${r.extraPersons} × ${r.extraPersonRate.toFixed(2)}`
        : "-",
      r.charge.toFixed(2),
    ]),
    margin: { left: marginX, right: marginRight },
    styles: {
      fontSize: 9,
      cellPadding: 7,
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: [25, 40, 30],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
    },
    columnStyles: {
      4: { halign: "right" },
    },
    foot: [["", "", "", "Room Total:", `${bill.roomTotal.toFixed(2)}`]],
  });

  let nextY = doc.lastAutoTable.finalY + 15;

  // ===== ADD-ONS TABLE =====
  if (addonEntries?.length) {
    autoTable(doc, {
      startY: nextY,
      head: [
        ["Service/Add-on", "Period", "Qty", "Unit Price (NPR)", "Amount (NPR)"],
      ],
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
      margin: { left: marginX, right: marginRight },
      styles: {
        fontSize: 9,
        cellPadding: 7,
        textColor: [30, 30, 30],
      },
      headStyles: {
        fillColor: [25, 40, 30],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      footStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        4: { halign: "right" },
      },
      foot: [["", "", "", "Add-ons Total:", `${bill.addonTotal.toFixed(2)}`]],
    });
    nextY = doc.lastAutoTable.finalY + 20;
  } else {
    nextY += 10;
  }

  // ===== SUMMARY SECTION =====
  doc.setDrawColor(180, 180, 180);
  doc.line(marginX, nextY, pageWidth - marginRight, nextY);
  nextY += 12;

  const summaryX = pageWidth - marginRight - 150;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Room Total:", summaryX, nextY);
  doc.setFont("helvetica", "bold");
  doc.text(
    `NPR ${bill.roomTotal.toFixed(2)}`,
    pageWidth - marginRight - 10,
    nextY,
    {
      align: "right",
    },
  );

  nextY += 11;
  doc.setFont("helvetica", "normal");
  doc.text("Add-ons Total:", summaryX, nextY);
  doc.setFont("helvetica", "bold");
  doc.text(
    `NPR ${bill.addonTotal.toFixed(2)}`,
    pageWidth - marginRight - 10,
    nextY,
    {
      align: "right",
    },
  );

  // Grand Total
  nextY += 14;
  doc.setFillColor(25, 40, 30);
  doc.rect(marginX, nextY - 8, contentWidth, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("GRAND TOTAL:", marginX + 10, nextY + 4);
  doc.setFontSize(13);
  doc.text(
    `NPR ${bill.grandTotal.toFixed(2)}`,
    pageWidth - marginRight - 10,
    nextY + 4,
    {
      align: "right",
    },
  );

  nextY += 25;

  // ===== PAYMENT SECTION =====
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PAYMENT STATUS:", marginX, nextY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  nextY += 11;

  if (payment) {
    const statusBgColor = [200, 230, 201]; // Light green for paid
    doc.setFillColor(...statusBgColor);
    doc.rect(marginX, nextY - 7, 100, 16, "F");
    doc.setTextColor(27, 94, 32);
    doc.text("PAID", marginX + 5, nextY + 2);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `via ${payment.method.toUpperCase()} on ${new Date(payment.paid_at).toLocaleDateString("en-NP")}`,
      marginX + 110,
      nextY + 2,
    );
    nextY += 14;
    doc.text(
      `Amount: NPR ${Number(payment.amount).toFixed(2)}`,
      marginX,
      nextY,
    );
  } else {
    const statusBgColor = [255, 235, 205]; // Light orange for pending
    doc.setFillColor(...statusBgColor);
    doc.rect(marginX, nextY - 7, 100, 16, "F");
    doc.setTextColor(230, 124, 15);
    doc.text("PENDING", marginX + 5, nextY + 2);
  }

  nextY += 20;

  // ===== FOOTER =====
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, nextY, pageWidth - marginRight, nextY);
  nextY += 12;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Thank you for choosing Bisek Atithi Griha. Wishing you and your family strength during this time.",
    pageWidth / 2,
    nextY,
    { maxWidth: contentWidth, align: "center" },
  );

  return doc;
}

export function downloadBillPdf(args) {
  const doc = generateBillPdf(args);
  const filename = `bill-room${args.stay.room?.id}-${new Date(args.stay.check_in_at).toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
