import { saveAs } from 'file-saver'

export function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, filename)
}

/** Renderiza o HTML numa div oculta, captura com html2canvas e baixa como PDF A4 direto. */
export async function downloadPdf(html: string, filename: string) {
  const container = document.createElement('div')
  container.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    'width:794px',          // ~A4 a 96dpi
    'background:#fff',
    'z-index:-1',
    'font-family:Segoe UI,Arial,sans-serif',
    'font-size:12px',
    'color:#1A202C',
    'line-height:1.55',
    'padding:48px 56px',
    'box-sizing:border-box',
  ].join(';')

  // injeta só o body do HTML (sem html/head)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  container.innerHTML = bodyMatch ? bodyMatch[1] : html

  document.body.appendChild(container)

  try {
    const h2c = (await import('html2canvas')).default
    const canvas = await h2c(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
      logging: false,
    })

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()   // 210mm
    const pageH = pdf.internal.pageSize.getHeight()  // 297mm
    const margin = 0
    const imgW = pageW - margin * 2
    const imgH = (canvas.height / canvas.width) * imgW

    let remaining = imgH
    let srcY = 0

    while (remaining > 0) {
      const sliceH = Math.min(pageH - margin * 2, remaining)
      const sc = document.createElement('canvas')
      sc.width = canvas.width
      sc.height = Math.round((sliceH / imgH) * canvas.height)
      const ctx = sc.getContext('2d')!
      ctx.drawImage(canvas, 0, srcY, canvas.width, sc.height, 0, 0, canvas.width, sc.height)
      if (remaining < imgH) pdf.addPage()
      pdf.addImage(sc.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, imgW, sliceH)
      srcY += sc.height
      remaining -= sliceH
    }

    pdf.save(filename)
  } finally {
    document.body.removeChild(container)
  }
}
