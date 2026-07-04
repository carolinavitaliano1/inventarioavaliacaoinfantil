import { saveAs } from 'file-saver'

export function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, filename)
}

/** Abre o HTML numa nova aba e aciona o diálogo de impressão nativo do browser (qualidade vetorial). */
export function downloadPdf(html: string, _filename: string) {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Permita pop-ups neste site para gerar o PDF e tente novamente.')
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 500)
}
