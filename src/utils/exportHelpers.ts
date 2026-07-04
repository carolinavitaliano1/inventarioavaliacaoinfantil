import { saveAs } from 'file-saver'

/** Baixa qualquer string HTML como arquivo .html */
export function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, filename)
}

/** Renderiza um HTML numa div oculta e baixa como PDF (A4) */
export async function downloadPdf(html: string, filename: string) {
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:860px;background:#fff;z-index:-1;font-family:Arial,sans-serif'
  // Remove tags html/head/body para injetar só o conteúdo
  const body = html.replace(/<!DOCTYPE[^>]*>|<html[^>]*>|<\/html>|<head>[\s\S]*?<\/head>|<body[^>]*>|<\/body>/gi, '')
  container.innerHTML = body
  document.body.appendChild(container)

  try {
    const h2c = (await import('html2canvas')).default
    const canvas = await h2c(container, {
      scale: 1.8,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 860,
      windowWidth: 860,
    })

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgH = (canvas.height * pageW) / canvas.width
    let remaining = imgH

    while (remaining > 0) {
      const sliceH = Math.min(pageH, remaining)
      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = Math.round((sliceH / imgH) * canvas.height)
      const ctx = sliceCanvas.getContext('2d')!
      ctx.drawImage(
        canvas,
        0, Math.round(((imgH - remaining) / imgH) * canvas.height),
        canvas.width, sliceCanvas.height,
        0, 0, canvas.width, sliceCanvas.height,
      )
      if (remaining < imgH) pdf.addPage()
      pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, sliceH)
      remaining -= sliceH
    }

    pdf.save(filename)
  } finally {
    document.body.removeChild(container)
  }
}
