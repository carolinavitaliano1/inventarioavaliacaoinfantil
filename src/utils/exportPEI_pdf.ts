import type { Assessment } from '../types'
import { formatQuestion } from './formatQuestion'

interface PEIItem {
  id: string; skill: string; area: string; ageRange: string
  prazo: 'curto' | 'medio' | 'longo'
  status: 'pendente' | 'em_andamento' | 'concluido'
  estrategias: string
}

const PRAZO_LABEL: Record<string, string> = {
  curto: 'Curto prazo (até 3 meses)',
  medio: 'Médio prazo (até 6 meses)',
  longo: 'Longo prazo (9–12 meses)',
}
const PRAZO_COLOR: Record<string, string> = {
  curto: '#C05621', medio: '#2F64A0', longo: '#276749',
}
const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído',
}
const STATUS_BG: Record<string, string> = {
  pendente: '#F1F3F5', em_andamento: '#DBE7F5', concluido: '#E6F4EE',
}
const STATUS_COLOR: Record<string, string> = {
  pendente: '#718096', em_andamento: '#2F64A0', concluido: '#276749',
}

function buildHtml(assessment: Assessment, plan: PEIItem[]): string {
  const { studentInfo } = assessment
  const done = plan.filter(p => p.status === 'concluido').length
  const inProgress = plan.filter(p => p.status === 'em_andamento').length
  const pct = plan.length ? Math.round(done / plan.length * 100) : 0
  const date = studentInfo.date || new Date().toLocaleDateString('pt-BR')
  const grouped: Record<string, PEIItem[]> = { curto: [], medio: [], longo: [] }
  plan.forEach(p => grouped[p.prazo].push(p))

  const itemRows = (items: PEIItem[]) => items.map(item => `
    <tr>
      <td style="width:40%;padding:7px 9px;border-bottom:1px solid #E2E8F0;font-size:11px;vertical-align:top">${formatQuestion(item.skill)}</td>
      <td style="width:26%;padding:7px 9px;border-bottom:1px solid #E2E8F0;font-size:11px;vertical-align:top">${item.area}</td>
      <td style="width:14%;padding:7px 9px;border-bottom:1px solid #E2E8F0;font-size:11px;vertical-align:top">${item.ageRange}</td>
      <td style="width:20%;padding:7px 9px;border-bottom:1px solid #E2E8F0;font-size:11px;vertical-align:top">
        <span style="background:${STATUS_BG[item.status]};color:${STATUS_COLOR[item.status]};padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700">${STATUS_LABEL[item.status]}</span>
      </td>
    </tr>
    <tr>
      <td colspan="4" style="padding:5px 9px 10px;border-bottom:1px solid #E2E8F0;font-size:10.5px;color:#4A5568;background:#FAFAFA">
        <b>Estratégias:</b> ${item.estrategias}
      </td>
    </tr>
  `).join('')

  const prazoSections = (['curto', 'medio', 'longo'] as const)
    .filter(k => grouped[k].length > 0)
    .map(k => `
      <div style="margin-top:20px">
        <div style="color:${PRAZO_COLOR[k]};font-weight:700;font-size:12px;border-bottom:2px solid ${PRAZO_COLOR[k]};padding-bottom:4px;margin-bottom:8px">${PRAZO_LABEL[k]}</div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="background:#2F64A0;color:#fff;text-align:left;padding:7px 9px;font-size:11px;width:40%">Habilidade</th>
              <th style="background:#2F64A0;color:#fff;text-align:left;padding:7px 9px;font-size:11px;width:26%">Área</th>
              <th style="background:#2F64A0;color:#fff;text-align:left;padding:7px 9px;font-size:11px;width:14%">Faixa etária</th>
              <th style="background:#2F64A0;color:#fff;text-align:left;padding:7px 9px;font-size:11px;width:20%">Status</th>
            </tr>
          </thead>
          <tbody>${itemRows(grouped[k])}</tbody>
        </table>
      </div>
    `).join('')

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #2D3748; padding: 28px; background: #fff; }
  </style>
  </head><body>
    <div style="text-align:center;border-bottom:3px solid #2F64A0;padding-bottom:10px;margin-bottom:4px">
      <div style="font-size:20px;font-weight:700;color:#1A365D">PLANO DE ENSINO INDIVIDUALIZADO — PEI</div>
    </div>
    <div style="text-align:center;color:#718096;font-size:11px;margin-bottom:20px">Inventário de Avaliação do Desenvolvimento Infantil — IADI</div>

    <div style="background:#DBE7F5;padding:7px 10px;font-weight:700;font-size:12px;color:#1A365D;margin-bottom:8px;border-radius:3px">1. IDENTIFICAÇÃO</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
      <tr>
        <td style="background:#F1F3F5;font-weight:600;padding:6px 9px;width:25%;font-size:11px">Nome do aluno</td>
        <td style="padding:6px 9px;border-bottom:1px solid #E2E8F0;font-size:11px" colspan="3">${studentInfo.name}</td>
      </tr>
      <tr>
        <td style="background:#F1F3F5;font-weight:600;padding:6px 9px;font-size:11px">Data de nascimento</td>
        <td style="padding:6px 9px;border-bottom:1px solid #E2E8F0;font-size:11px;width:25%">${studentInfo.birthDate || '—'}</td>
        <td style="background:#F1F3F5;font-weight:600;padding:6px 9px;font-size:11px;width:25%">Idade</td>
        <td style="padding:6px 9px;border-bottom:1px solid #E2E8F0;font-size:11px;width:25%">${studentInfo.age || '—'}</td>
      </tr>
      <tr>
        <td style="background:#F1F3F5;font-weight:600;padding:6px 9px;font-size:11px">Diagnóstico</td>
        <td style="padding:6px 9px;border-bottom:1px solid #E2E8F0;font-size:11px" colspan="3">${studentInfo.diagnosis || '—'}</td>
      </tr>
      <tr>
        <td style="background:#F1F3F5;font-weight:600;padding:6px 9px;font-size:11px">Data do PEI</td>
        <td style="padding:6px 9px;border-bottom:1px solid #E2E8F0;font-size:11px">${date}</td>
        <td style="background:#F1F3F5;font-weight:600;padding:6px 9px;font-size:11px">Profissional</td>
        <td style="padding:6px 9px;border-bottom:1px solid #E2E8F0;font-size:11px"></td>
      </tr>
    </table>

    <div style="background:#DBE7F5;padding:7px 10px;font-weight:700;font-size:12px;color:#1A365D;margin-bottom:8px;border-radius:3px">2. SÍNTESE DO PLANO</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
      <thead>
        <tr>
          <th style="background:#2F64A0;color:#fff;padding:7px 10px;font-size:11px">Total de habilidades</th>
          <th style="background:#2F64A0;color:#fff;padding:7px 10px;font-size:11px">Concluídas</th>
          <th style="background:#2F64A0;color:#fff;padding:7px 10px;font-size:11px">Em andamento</th>
          <th style="background:#2F64A0;color:#fff;padding:7px 10px;font-size:11px">Progresso</th>
        </tr>
      </thead>
      <tbody>
        <tr style="text-align:center">
          <td style="padding:8px;font-size:16px;font-weight:700">${plan.length}</td>
          <td style="padding:8px;font-size:16px;font-weight:700;color:#276749">${done}</td>
          <td style="padding:8px;font-size:16px;font-weight:700;color:#2F64A0">${inProgress}</td>
          <td style="padding:8px;font-size:16px;font-weight:700">${pct}%</td>
        </tr>
      </tbody>
    </table>

    <div style="background:#DBE7F5;padding:7px 10px;font-weight:700;font-size:12px;color:#1A365D;margin-bottom:8px;border-radius:3px">3. HABILIDADES E ESTRATÉGIAS DE INTERVENÇÃO</div>
    ${prazoSections}

    <div style="margin-top:20px;background:#DBE7F5;padding:7px 10px;font-weight:700;font-size:12px;color:#1A365D;border-radius:3px">4. OBSERVAÇÕES / METAS GERAIS</div>
    <div style="border:1px solid #CBD5E0;border-radius:4px;padding:12px;min-height:60px;margin:8px 0 20px;font-size:11px;color:#A0AEC0">Espaço para anotações...</div>

    <div style="background:#DBE7F5;padding:7px 10px;font-weight:700;font-size:12px;color:#1A365D;border-radius:3px;margin-bottom:12px">5. ASSINATURAS</div>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="width:50%;padding:48px 16px 8px;border-top:1.5px solid #2D3748;font-size:11px">
          <b>Profissional responsável</b><br><span style="color:#718096">Assinatura / Registro</span>
        </td>
        <td style="width:50%;padding:48px 16px 8px;border-top:1.5px solid #2D3748;font-size:11px">
          <b>Responsável pelo aluno</b><br><span style="color:#718096">Assinatura</span>
        </td>
      </tr>
    </table>
  </body></html>`
}

export async function exportPEIPdf(assessment: Assessment, plan: PEIItem[]) {
  const html = buildHtml(assessment, plan)

  // Renderiza o HTML numa div oculta, captura com html2canvas, gera PDF
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:860px;background:#fff;z-index:-1'
  container.innerHTML = html.replace(/<html.*?>|<\/html>|<head>[\s\S]*?<\/head>|<!DOCTYPE[^>]*>/gi, '')
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
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width
    const margin = 0

    let yPos = margin
    let remaining = imgH

    // Quebra em páginas A4
    while (remaining > 0) {
      const sliceH = Math.min(pageH - margin * 2, remaining)
      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = (sliceH / imgH) * canvas.height
      const ctx = sliceCanvas.getContext('2d')!
      ctx.drawImage(
        canvas,
        0, ((imgH - remaining) / imgH) * canvas.height,
        canvas.width, sliceCanvas.height,
        0, 0,
        canvas.width, sliceCanvas.height,
      )
      const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.92)
      if (yPos > margin) pdf.addPage()
      pdf.addImage(sliceData, 'JPEG', margin, margin, imgW - margin * 2, sliceH)
      remaining -= sliceH
      yPos += sliceH
    }

    const date = assessment.studentInfo.date || new Date().toLocaleDateString('pt-BR')
    pdf.save(`PEI_${assessment.studentInfo.name}_${date}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
