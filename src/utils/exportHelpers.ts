import { saveAs } from 'file-saver'

export function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, filename)
}

// Shared colours
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

export type JsPDF = InstanceType<typeof import('jspdf').jsPDF>

/** Draws the standard document header and returns the Y position after it. */
export function drawHeader(pdf: JsPDF, title: string, subtitle: string): number {
  const W = pdf.internal.pageSize.getWidth()
  const emitDate = new Date().toLocaleDateString('pt-BR')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.setTextColor(...C.brandDark)
  pdf.text(title.toUpperCase(), 14, 18)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(...C.gray)
  pdf.text(subtitle, 14, 23)
  pdf.text(`Emitido em ${emitDate}`, W - 14, 23, { align: 'right' })

  // blue rule
  pdf.setDrawColor(...C.brand)
  pdf.setLineWidth(0.8)
  pdf.line(14, 26, W - 14, 26)

  return 32
}

/** Section heading bar */
export function drawSection(pdf: JsPDF, label: string, y: number): number {
  const W = pdf.internal.pageSize.getWidth()
  pdf.setFillColor(...C.brandLight)
  pdf.rect(14, y, W - 28, 7, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7.5)
  pdf.setTextColor(...C.brandDark)
  pdf.text(label.toUpperCase(), 17, y + 5)
  return y + 11
}
