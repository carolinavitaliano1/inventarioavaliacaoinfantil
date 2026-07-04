import type { Patient, Assessment } from '../types'
import { AREAS } from '../types'
import { portageItems } from '../hooks/usePortageAssessment'
import { calcAreaDevResult } from './ageCalc'
import { C, drawHeader, drawSection } from './exportHelpers'
import type { PortageItem, ResponseType } from '../types'

const AREA_SHORT: Record<string, string> = {
  'I – ÁREA SOCIABILIZAÇÃO':      'Sociabilização',
  'IIa – LINGUAGEM RECEPTIVA':    'Ling. Receptiva',
  'IIb – LINGUAGEM EXPRESSIVA':   'Ling. Expressiva',
  'III – ÁREA CUIDADOS PRÓPRIOS': 'Cuidados Próprios',
  'IV- ÁREA COGNITIVA':           'Cognitiva',
  'V. ÁREA PSICOMOTORA':          'Psicomotora',
}
function short(a: string) { return AREA_SHORT[a] ?? a }

function getAreaVal(area: string, responses: Record<string, ResponseType>) {
  const items = portageItems.filter(i => i.area === area) as PortageItem[]
  return calcAreaDevResult(area, items, responses as Record<string, ResponseType>)
}

function fmtAge(v: number) {
  if (v === 0) return '—'
  const y = Math.floor(v), m = Math.round((v - y) * 12)
  return `${y}a ${m}m`
}

export async function exportProgressPdf(patient: Patient, assessments: Assessment[]) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const sorted = [...assessments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  let y = drawHeader(pdf, 'Relatório de Acompanhamento Contínuo',
    'Inventário de Avaliação do Desenvolvimento Infantil — IADI')

  // ── Dados do paciente ──────────────────────────────────────────────────
  y = drawSection(pdf, 'Dados do Paciente', y)
  autoTable(pdf, {
    startY: y, margin: { left: 14, right: 14 }, theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: C.ink },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: C.brandLight, textColor: C.brandDark, cellWidth: 40 }, 2: { fontStyle: 'bold', fillColor: C.brandLight, textColor: C.brandDark, cellWidth: 40 } },
    body: [
      ['Nome', patient.name, 'Diagnóstico', patient.diagnosis || '—'],
      ['Data de Nascimento', patient.birthDate || '—', 'Total de avaliações', sorted.length],
    ],
  })
  y = (pdf as any).lastAutoTable.finalY + 4

  // legend
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(...C.gray)
  pdf.text('↑ Evolução  ·  ↓ Regressão  ·  → Estabilidade em relação à avaliação anterior', 14, y + 4)
  y += 10

  // ── Evolução por área ──────────────────────────────────────────────────
  y = drawSection(pdf, 'Evolução da Idade Desenvolvimental por Área', y)

  // build header cols
  const head = [['Área', ...sorted.map((a, i) => `Av. ${i + 1}\n${a.studentInfo.date || '—'}`)]]

  // compute values
  const matrix: { v: number; prev: number | null }[][] = AREAS.map(area =>
    sorted.map((a, i) => {
      const v = getAreaVal(area, a.responses as Record<string, ResponseType>).idadeDesenvAnos
      const prev = i > 0 ? getAreaVal(area, sorted[i - 1].responses as Record<string, ResponseType>).idadeDesenvAnos : null
      return { v, prev }
    })
  )

  const body = AREAS.map((area, ai) => {
    const cells = matrix[ai].map(({ v, prev }) => {
      const arrow = prev === null ? '' : v > prev + 0.01 ? ' ↑' : v < prev - 0.01 ? ' ↓' : ' →'
      return fmtAge(v) + arrow
    })
    return [short(area), ...cells]
  })

  // media row
  const mediaRow = ['Média geral', ...sorted.map(a => {
    const results = AREAS.map(area => getAreaVal(area, a.responses as Record<string, ResponseType>))
    const m = results.reduce((s, r) => s + r.idadeDesenvAnos, 0) / results.length
    return fmtAge(m)
  })]
  body.push(mediaRow)

  autoTable(pdf, {
    startY: y, margin: { left: 14, right: 14 }, theme: 'striped',
    headStyles: { fillColor: C.brand, textColor: C.white, fontSize: 8, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 8.5, cellPadding: 2.8, textColor: C.ink, halign: 'center' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'normal' } },
    head,
    body,
    didParseCell(data) {
      if (data.section === 'body' && data.row.index === AREAS.length) {
        data.cell.styles.fillColor = C.brandLight
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.textColor = data.column.index === 0 ? C.brandDark : C.brand
      }
      // color arrows
      if (data.section === 'body' && data.column.index > 0 && data.row.index < AREAS.length) {
        const cell = data.cell.raw as string
        if (cell.includes('↑')) data.cell.styles.textColor = C.pos
        else if (cell.includes('↓')) data.cell.styles.textColor = C.neg
        else if (cell.includes('→')) data.cell.styles.textColor = C.brand
      }
    },
  })
  y = (pdf as any).lastAutoTable.finalY + 8

  // ── Detalhe por avaliação ──────────────────────────────────────────────
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i]
    if (y > 240) { pdf.addPage(); y = 16 }
    y = drawSection(pdf, `Avaliação ${i + 1} — ${a.studentInfo.date || '—'}`, y)

    const areaResults = AREAS.map(area => {
      const r = getAreaVal(area, a.responses as Record<string, ResponseType>)
      return [short(area), fmtAge(r.idadeDesenvAnos), `${r.totalItems > 0 ? Math.round((r.totalSim / r.totalItems) * 100) : 0}%`]
    })

    autoTable(pdf, {
      startY: y, margin: { left: 14, right: 14 }, theme: 'striped',
      headStyles: { fillColor: C.brand, textColor: C.white, fontSize: 8, fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: C.ink },
      columnStyles: { 1: { halign: 'center', fontStyle: 'bold', textColor: C.brand }, 2: { halign: 'center' } },
      head: [['Área', 'Idade Desenvolvimental', '% Acertos']],
      body: areaResults,
    })
    y = (pdf as any).lastAutoTable.finalY + 6
  }

  pdf.save(`Acompanhamento_${patient.name}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`)
}
