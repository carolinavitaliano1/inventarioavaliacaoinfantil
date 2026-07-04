import { saveAs } from 'file-saver'

export function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, filename)
}

/**
 * Renderiza o HTML num iframe oculto (com head+style completos),
 * captura com html2canvas e baixa como PDF A4 diretamente.
 */
export async function downloadPdf(html: string, filename: string) {
  // Cria iframe fora da tela para o browser parsear o HTML completo (head + style + body)
  const iframe = document.createElement('iframe')
  iframe.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    'width:794px',
    'height:1px',
    'border:none',
    'visibility:hidden',
  ].join(';')
  document.body.appendChild(iframe)

  await new Promise<void>(resolve => {
    iframe.onload = () => resolve()
    iframe.srcdoc = html
  })

  // Aguarda um tick extra para garantir que o CSS foi aplicado
  await new Promise(r => setTimeout(r, 200))

  const doc = iframe.contentDocument!
  const body = doc.body

  // Expande o iframe para a altura real do conteúdo
  const scrollH = body.scrollHeight
  iframe.style.height = scrollH + 'px'

  try {
    const h2c = (await import('html2canvas')).default
    const canvas = await h2c(body, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      logging: false,
    })

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW
    const imgH = (canvas.height / canvas.width) * imgW

    let remaining = imgH
    let srcY = 0

    while (remaining > 0) {
      const sliceH = Math.min(pageH, remaining)
      const sc = document.createElement('canvas')
      sc.width = canvas.width
      sc.height = Math.round((sliceH / imgH) * canvas.height)
      const ctx = sc.getContext('2d')!
      ctx.drawImage(canvas, 0, srcY, canvas.width, sc.height, 0, 0, canvas.width, sc.height)
      if (remaining < imgH) pdf.addPage()
      pdf.addImage(sc.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, imgW, sliceH)
      srcY += sc.height
      remaining -= sliceH
    }

    pdf.save(filename)
  } finally {
    document.body.removeChild(iframe)
  }
}
