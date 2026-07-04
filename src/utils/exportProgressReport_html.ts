import type { Patient, Assessment } from '../types'
import { AREAS } from '../types'
import { portageItems } from '../hooks/usePortageAssessment'
import { calcAreaDevResult } from './ageCalc'
import { safe, BASE_TABLE, drawHeader, drawSection, addPageNumbers } from './exportHelpers'
import type { PortageItem, ResponseType } from '../types'

const AREA_SHORT: Record<string, string> = {
  'I - AREA SOCIALIZACAO':        'Socializacao',
  'I – ÁREA SOCIABILIZAÇÃO': 'Socializacao',
  'IIa – LINGUAGEM RECEPTIVA':  'Ling. Receptiva',
  'IIb – LINGUAGEM EXPRESSIVA': 'Ling. Expressiva',
  'III – ÁREA CUIDADOS PRÓPRIOS': 'Cuidados Proprios',
  'IV- ÁREA COGNITIVA':         'Cognitiva',
  'V. ÁREA PSICOMOTORA':        'Psicomotora',
}
function short(a: string) { return safe(AREA_SHORT[a] ?? a) }

function getAreaVal(area: string, responses: Record<string, ResponseType>) {
  const items = portageItems.filter(i => i.area === area) as PortageItem[]
  return calcAreaDevResult(area, items, responses as Record<string, ResponseType>)
}

function fmtAge(v: number) {
  if (v === 0) return '-'
  const y = Math.floor(v), m = Math.round((v - y) * 12)
  return `${y}a ${m}m`
}

export async function exportProgressPdf(patient: Patient, assessments: Assessment[]) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const sorted = [...assessments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  let y = drawHeader(pdf, 'Relatorio de Acompanhamento Continuo',
    'Inventario de Avaliacao do Desenvolvimento Infantil - IADI')

  // Dados do paciente
  y = drawSection(pdf, 'Dados do Paciente', y)
  autoTable(pdf, {
    ...BASE_TABLE,
    startY: y,
    columnStyles: {
      0: { fontStyle: 'bold' as const, cellWidth: 44 },
      2: { fontStyle: 'bold' as const, cellWidth: 44 },
    },
    body: [
      [safe('Nome'), safe(patient.name), safe('Diagnostico'), safe(patient.diagnosis)],
      [safe('Data de Nascimento'), safe(patient.birthDate), safe('Total de avaliacoes'), sorted.length],
    ],
  })
  y = (pdf as any).lastAutoTable.finalY + 4

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(120, 120, 120)
  pdf.text('(+) Evolucao  /  (-) Regressao  /  (=) Estabilidade em relacao a avaliacao anterior', 20, y + 4)
  y += 10

  // Evolucao por area
  y = drawSection(pdf, 'Evolucao da Idade Desenvolvimental por Area', y)

  const head = [['Area', ...sorted.map((a, i) => `Av. ${i + 1}\n${safe(a.studentInfo.date)}`)]]

  const matrix: { v: number; prev: number | null }[][] = AREAS.map(area =>
    sorted.map((a, i) => {
      const v = getAreaVal(area, a.responses as Record<string, ResponseType>).idadeDesenvAnos
      const prev = i > 0 ? getAreaVal(area, sorted[i - 1].responses as Record<string, ResponseType>).idadeDesenvAnos : null
      return { v, prev }
    })
  )

  const body = AREAS.map((area, ai) => {
    const cells = matrix[ai].map(({ v, prev }) => {
      const arrow = prev === null ? '' : v > prev + 0.01 ? ' (+)' : v < prev - 0.01 ? ' (-)' : ' (=)'
      return fmtAge(v) + arrow
    })
    return [short(area), ...cells]
  })

  const mediaRow = ['Media geral', ...sorted.map(a => {
    const results = AREAS.map(area => getAreaVal(area, a.responses as Record<string, ResponseType>))
    const m = results.reduce((s, r) => s + r.idadeDesenvAnos, 0) / results.length
    return fmtAge(m)
  })]
  body.push(mediaRow)

  autoTable(pdf, {
    ...BASE_TABLE,
    startY: y,
    headStyles: { ...BASE_TABLE.headStyles, halign: 'center' as const },
    styles: { ...BASE_TABLE.styles, halign: 'center' as const },
    columnStyles: { 0: { halign: 'left' as const } },
    head,
    body,
    didParseCell(data: any) {
      if (data.section === 'body' && data.row.index === AREAS.length) {
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })
  y = (pdf as any).lastAutoTable.finalY + 8

  // Detalhe por avaliacao
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i]
    if (y > 240) { pdf.addPage(); y = 16 }
    y = drawSection(pdf, `Avaliacao ${i + 1} - ${safe(a.studentInfo.date)}`, y)

    const areaResults = AREAS.map(area => {
      const r = getAreaVal(area, a.responses as Record<string, ResponseType>)
      return [
        short(area),
        fmtAge(r.idadeDesenvAnos),
        `${r.totalItems > 0 ? Math.round((r.totalSim / r.totalItems) * 100) : 0}%`,
      ]
    })

    autoTable(pdf, {
      ...BASE_TABLE,
      startY: y,
      columnStyles: {
        1: { halign: 'center' as const, fontStyle: 'bold' as const },
        2: { halign: 'center' as const },
      },
      head: [['Area', 'Idade Desenvolvimental', '% Acertos']],
      body: areaResults,
    })
    y = (pdf as any).lastAutoTable.finalY + 6
  }

  addPageNumbers(pdf)
  pdf.save(`Acompanhamento_${safe(patient.name)}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`)
}
