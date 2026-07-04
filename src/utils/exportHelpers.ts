export type JsPDF = InstanceType<typeof import('jspdf').jsPDF>

export const C = {
  brand:      [47,  100, 160] as [number, number, number],
  brandLight: [219, 231, 245] as [number, number, number],
  brandDark:  [26,  54,  93]  as [number, number, number],
  pos:        [30,  107, 69]  as [number, number, number],
  neg:        [185, 28,  28]  as [number, number, number],
  gray:       [113, 128, 150] as [number, number, number],
  ink:        [26,  32,  44]  as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  rowAlt:     [247, 250, 255] as [number, number, number],
}

/** Sanitise text for jsPDF WinAnsi (cp1252) — replaces Unicode symbols with ASCII equivalents */
export function safe(s: string | number | null | undefined): string {
  if (s === null || s === undefined) return '-'
  return String(s)
    .replace(/↑/g, '(+)')   // ↑
    .replace(/↓/g, '(-)')   // ↓
    .replace(/→/g, '(=)')   // →
    .replace(/—/g, '-')     // —
    .replace(/–/g, '-')     // –
    .replace(/·/g, '/')     // ·
    .replace(/[^\x00-\xFF]/g, '?') // fallback for any other non-cp1252 char
}

export const BASE_TABLE = {
  theme: 'grid' as const,
  styles: {
    fontSize: 9,
    textColor: [0, 0, 0] as [number, number, number],
    lineColor: [180, 180, 180] as [number, number, number],
    lineWidth: 0.1,
    cellPadding: 2.5,
  },
  headStyles: {
    fillColor: [242, 242, 242] as [number, number, number],
    textColor: [0, 0, 0] as [number, number, number],
    fontStyle: 'bold' as const,
    halign: 'left' as const,
  },
  margin: { left: 20, right: 20 },
  rowPageBreak: 'avoid' as const,
}

/** Standard document header — returns Y after the rule */
export function drawHeader(pdf: JsPDF, title: string, subtitle: string): number {
  const W = pdf.internal.pageSize.getWidth()
  const emitDate = new Date().toLocaleDateString('pt-BR')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(0, 0, 0)
  pdf.text(safe(title).toUpperCase(), 20, 18)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(120, 120, 120)
  pdf.text(safe(subtitle), 20, 24)
  pdf.text(`Emitido em ${emitDate}`, W - 20, 24, { align: 'right' })

  pdf.setDrawColor(180, 180, 180)
  pdf.setLineWidth(0.4)
  pdf.line(20, 27, W - 20, 27)

  return 34
}

/** Section heading — returns Y after the section label */
export function drawSection(pdf: JsPDF, label: string, y: number): number {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(0, 0, 0)
  pdf.text(safe(label).toUpperCase(), 20, y)
  return y + 6
}

/** Add "Pagina X de Y" footer on every page */
export function addPageNumbers(pdf: JsPDF): void {
  const total = pdf.getNumberOfPages()
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(7.5)
    pdf.setTextColor(150, 150, 150)
    pdf.text(`Pagina ${i} de ${total}`, W / 2, H - 8, { align: 'center' })
  }
}

/** Two-column signature block */
export function drawSignatures(
  pdf: JsPDF,
  y: number,
  left: { label: string; sub: string },
  right: { label: string; sub: string },
): number {
  const W = pdf.internal.pageSize.getWidth()
  const mid = W / 2

  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.3)
  pdf.line(20, y + 14, mid - 10, y + 14)
  pdf.line(mid + 10, y + 14, W - 20, y + 14)

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(0, 0, 0)
  pdf.text(safe(left.label), 20, y + 18)
  pdf.text(safe(right.label), mid + 10, y + 18)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7.5)
  pdf.setTextColor(120, 120, 120)
  pdf.text(safe(left.sub), 20, y + 22)
  pdf.text(safe(right.sub), mid + 10, y + 22)

  return y + 30
}
