import type { Assessment } from '../types'
import { formatQuestion } from './formatQuestion'
import { safe, BASE_TABLE, drawHeader, drawSection, addPageNumbers, drawSignatures } from './exportHelpers'

interface PEIItem {
  id: string; skill: string; area: string; ageRange: string
  prazo: 'curto' | 'medio' | 'longo'
  status: 'pendente' | 'em_andamento' | 'concluido'
  estrategias: string
}

const PRAZO_LABEL: Record<string, string> = {
  curto: 'Curto prazo (ate 3 meses)',
  medio: 'Medio prazo (ate 6 meses)',
  longo: 'Longo prazo (9-12 meses)',
}
const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluido',
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

  let y = drawHeader(pdf, 'Plano de Ensino Individualizado - PEI',
    'Inventario de Avaliacao do Desenvolvimento Infantil - IADI')

  // Identificacao
  y = drawSection(pdf, 'Identificacao', y)
  autoTable(pdf, {
    ...BASE_TABLE,
    startY: y,
    columnStyles: {
      0: { fontStyle: 'bold' as const, cellWidth: 42 },
      2: { fontStyle: 'bold' as const, cellWidth: 42 },
    },
    body: [
      [safe('Nome do aluno'), safe(studentInfo.name), '', ''],
      [safe('Data de Nascimento'), safe(studentInfo.birthDate), safe('Idade'), safe(studentInfo.age)],
      [safe('Diagnostico'), safe(studentInfo.diagnosis), '', ''],
      [safe('Data do PEI'), safe(date), safe('Profissional'), ''],
    ],
  })
  y = (pdf as any).lastAutoTable.finalY + 6

  // Sintese
  y = drawSection(pdf, 'Sintese do Plano', y)
  autoTable(pdf, {
    ...BASE_TABLE,
    startY: y,
    headStyles: { ...BASE_TABLE.headStyles, halign: 'center' as const },
    styles: { ...BASE_TABLE.styles, halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 11 },
    head: [['Total de habilidades', 'Concluidas', 'Em andamento', 'Progresso']],
    body: [[plan.length, done, inProgress, `${pct}%`]],
  })
  y = (pdf as any).lastAutoTable.finalY + 6

  // Habilidades por prazo
  y = drawSection(pdf, 'Habilidades e Estrategias de Intervencao', y)

  const grouped: Record<string, PEIItem[]> = { curto: [], medio: [], longo: [] }
  plan.forEach(p => grouped[p.prazo].push(p))

  for (const prazo of ['curto', 'medio', 'longo'] as const) {
    if (!grouped[prazo].length) continue

    if (y > 258) { pdf.addPage(); y = 16 }
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)
    pdf.text(safe(PRAZO_LABEL[prazo]), 20, y)
    pdf.setDrawColor(180, 180, 180)
    pdf.setLineWidth(0.3)
    pdf.line(20, y + 1.5, W - 20, y + 1.5)
    y += 5

    const body: any[] = []
    grouped[prazo].forEach(item => {
      body.push([
        safe(formatQuestion(item.skill)),
        safe(item.area),
        safe(item.ageRange),
        safe(STATUS_LABEL[item.status]),
      ])
      body.push([{
        content: safe(`Estrategias: ${item.estrategias || '-'}`),
        colSpan: 4,
        styles: { fontSize: 8, textColor: [80, 80, 80] as [number,number,number], fillColor: [250, 250, 250] as [number,number,number], fontStyle: 'italic' as const, cellPadding: { top: 2, bottom: 3, left: 4, right: 4 } },
      }])
    })

    autoTable(pdf, {
      ...BASE_TABLE,
      startY: y,
      columnStyles: {
        0: { cellWidth: 68 },
        1: { cellWidth: 50 },
        2: { cellWidth: 28 },
        3: { cellWidth: 24 },
      },
      head: [['Habilidade', 'Area', 'Faixa etaria', 'Status']],
      body,
    })
    y = (pdf as any).lastAutoTable.finalY + 8
  }

  // Observacoes
  if (y > 250) { pdf.addPage(); y = 16 }
  y = drawSection(pdf, 'Observacoes / Metas Gerais', y)
  pdf.setDrawColor(180, 180, 180)
  pdf.setLineWidth(0.3)
  pdf.rect(20, y, W - 40, 20)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(150, 150, 150)
  pdf.text('Espaco para anotacoes do profissional...', 24, y + 7)
  y += 26

  // Assinaturas
  if (y > 255) { pdf.addPage(); y = 16 }
  drawSignatures(pdf, y,
    { label: 'Profissional responsavel', sub: 'Assinatura / Registro' },
    { label: 'Responsavel pelo aluno', sub: 'Assinatura' },
  )

  addPageNumbers(pdf)
  pdf.save(`PEI_${safe(studentInfo.name)}_${safe(date)}.pdf`)
}
