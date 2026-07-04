import type { Assessment } from '../types'
import { formatQuestion } from './formatQuestion'
import { C, drawHeader, drawSection } from './exportHelpers'

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
const PRAZO_COLOR: Record<string, [number, number, number]> = {
  curto: [192, 86, 33],
  medio: C.brand,
  longo: C.pos,
}
const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído',
}
const STATUS_COLOR: Record<string, [number, number, number]> = {
  pendente: C.gray, em_andamento: C.brand, concluido: C.pos,
}

export async function exportPEIPdf(assessment: Assessment, plan: PEIItem[]) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const { studentInfo } = assessment

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = pdf.internal.pageSize.getWidth()

  const done = plan.filter(p => p.status === 'concluido').length
  const inProgress = plan.filter(p => p.status === 'em_andamento').length
  const pct = plan.length ? Math.round(done / plan.length * 100) : 0
  const date = studentInfo.date || new Date().toLocaleDateString('pt-BR')

  let y = drawHeader(pdf, 'Plano de Ensino Individualizado — PEI',
    'Inventário de Avaliação do Desenvolvimento Infantil — IADI')

  // ── Identificação ──────────────────────────────────────────────────────
  y = drawSection(pdf, 'Identificação', y)
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: C.ink },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: C.brandLight, textColor: C.brandDark, cellWidth: 38 }, 2: { fontStyle: 'bold', fillColor: C.brandLight, textColor: C.brandDark, cellWidth: 38 } },
    body: [
      ['Nome do aluno', studentInfo.name, '', ''],
      ['Data de Nascimento', studentInfo.birthDate || '—', 'Idade', studentInfo.age || '—'],
      ['Diagnóstico', studentInfo.diagnosis || '—', '', ''],
      ['Data do PEI', date, 'Profissional', ''],
    ],
  })
  y = (pdf as any).lastAutoTable.finalY + 6

  // ── Síntese ────────────────────────────────────────────────────────────
  y = drawSection(pdf, 'Síntese do Plano', y)
  autoTable(pdf, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    headStyles: { fillColor: C.brand, textColor: C.white, fontSize: 8, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 11, cellPadding: 4, halign: 'center', fontStyle: 'bold', textColor: C.ink },
    head: [['Total de habilidades', 'Concluídas', 'Em andamento', 'Progresso']],
    body: [[plan.length, done, inProgress, `${pct}%`]],
    didParseCell(data) {
      if (data.section === 'body') {
        if (data.column.index === 1) data.cell.styles.textColor = C.pos
        if (data.column.index === 2) data.cell.styles.textColor = C.brand
      }
    },
  })
  y = (pdf as any).lastAutoTable.finalY + 6

  // ── Habilidades por prazo ──────────────────────────────────────────────
  y = drawSection(pdf, 'Habilidades e Estratégias de Intervenção', y)

  const grouped: Record<string, PEIItem[]> = { curto: [], medio: [], longo: [] }
  plan.forEach(p => grouped[p.prazo].push(p))

  for (const prazo of ['curto', 'medio', 'longo'] as const) {
    if (!grouped[prazo].length) continue

    // prazo sub-header
    if (y > 260) { pdf.addPage(); y = 16 }
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(...PRAZO_COLOR[prazo])
    pdf.text(PRAZO_LABEL[prazo], 14, y)
    pdf.setDrawColor(...PRAZO_COLOR[prazo])
    pdf.setLineWidth(0.4)
    pdf.line(14, y + 1.5, W - 14, y + 1.5)
    y += 5

    // build body rows: each skill has 2 rows — main + strategy
    const body: any[] = []
    grouped[prazo].forEach(item => {
      body.push([
        formatQuestion(item.skill),
        item.area,
        item.ageRange,
        STATUS_LABEL[item.status],
      ])
      body.push([{ content: `Estratégias: ${item.estrategias || '—'}`, colSpan: 4, styles: { fontSize: 7.5, textColor: [74, 85, 104], fillColor: [250, 250, 250], fontStyle: 'italic', cellPadding: { top: 2, bottom: 3, left: 4, right: 4 } } }])
    })

    autoTable(pdf, {
      startY: y,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      headStyles: { fillColor: C.brand, textColor: C.white, fontSize: 7.5, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.8, textColor: C.ink, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 48 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
      },
      head: [['Habilidade', 'Área', 'Faixa etária', 'Status']],
      body,
      didParseCell(data) {
        if (data.section === 'body' && data.column.index === 3 && data.row.index % 2 === 0) {
          const status = grouped[prazo][Math.floor(data.row.index / 2)]?.status
          if (status) data.cell.styles.textColor = STATUS_COLOR[status]
          data.cell.styles.fontStyle = 'bold'
        }
      },
    })
    y = (pdf as any).lastAutoTable.finalY + 8
  }

  // ── Observações ────────────────────────────────────────────────────────
  if (y > 250) { pdf.addPage(); y = 16 }
  y = drawSection(pdf, 'Observações / Metas Gerais', y)
  pdf.setDrawColor(203, 213, 224)
  pdf.setLineWidth(0.3)
  pdf.rect(14, y, W - 28, 18)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7.5)
  pdf.setTextColor(...C.gray)
  pdf.text('Espaço para anotações do profissional…', 17, y + 6)
  y += 24

  // ── Assinaturas ────────────────────────────────────────────────────────
  if (y > 260) { pdf.addPage(); y = 16 }
  const midX = W / 2
  pdf.setDrawColor(...C.ink)
  pdf.setLineWidth(0.4)
  pdf.line(14, y + 16, midX - 8, y + 16)
  pdf.line(midX + 8, y + 16, W - 14, y + 16)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7.5)
  pdf.setTextColor(...C.ink)
  pdf.text('Profissional responsável', 14, y + 20)
  pdf.text('Responsável pelo aluno', midX + 8, y + 20)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(...C.gray)
  pdf.text('Assinatura / Registro', 14, y + 24)
  pdf.text('Assinatura', midX + 8, y + 24)

  pdf.save(`PEI_${studentInfo.name}_${date}.pdf`)
}
