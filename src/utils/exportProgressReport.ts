import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import type { Patient, Assessment, PortageItem, ResponseType } from '../types'
import { AREAS } from '../types'
import { portageItems } from '../hooks/usePortageAssessment'
import { calcAreaDevResult } from './ageCalc'

function cell(text: string, bold = false, shade?: string): TableCell {
  return new TableCell({
    shading: shade ? { fill: shade, type: 'clear' as any } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: String(text || '—'), bold, size: 18 })] })],
  })
}

function trend(prev: number, curr: number): string {
  if (prev === 0) return ''
  const diff = curr - prev
  if (Math.abs(diff) < 0.05) return '→'
  return diff > 0 ? `↑ +${diff.toFixed(1)}a` : `↓ ${diff.toFixed(1)}a`
}

export async function exportProgressReport(patient: Patient, assessments: Assessment[]) {
  const sorted = [...assessments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const sections: any[] = []

  sections.push(new Paragraph({
    text: 'RELATÓRIO DE ACOMPANHAMENTO CONTÍNUO',
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
  }))
  sections.push(new Paragraph({ text: 'Inventário de Avaliação do Desenvolvimento Infantil (IADI)', alignment: AlignmentType.CENTER }))
  sections.push(new Paragraph({ text: `Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, alignment: AlignmentType.CENTER }))
  sections.push(new Paragraph({ text: '' }))

  // Patient info
  sections.push(new Paragraph({ text: 'DADOS DO PACIENTE', heading: HeadingLevel.HEADING_2 }))
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cell('Nome', true), cell(patient.name), cell('Data de Nasc.', true), cell(patient.birthDate || '—')] }),
      new TableRow({ children: [cell('Diagnóstico', true), cell(patient.diagnosis || '—'), cell('Responsável', true), cell(patient.responsibleName || '—')] }),
      new TableRow({ children: [cell('Data de Cadastro', true), cell(new Date(patient.createdAt).toLocaleDateString('pt-BR')), cell('Nº de Avaliações', true), cell(String(sorted.length))] }),
    ],
  }))
  sections.push(new Paragraph({ text: '' }))

  // Each assessment summary
  sections.push(new Paragraph({ text: 'HISTÓRICO DE AVALIAÇÕES', heading: HeadingLevel.HEADING_2 }))
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i]
    const areaResults = AREAS.map(area => {
      const items = portageItems.filter(p => p.area === area)
      return calcAreaDevResult(area, items as PortageItem[], a.responses as Record<string, ResponseType>)
    })
    const answered = Object.values(a.responses).filter(Boolean).length
    const pct = Math.round((answered / portageItems.length) * 100)
    const mediaGeral = areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / areaResults.length

    sections.push(new Paragraph({ text: `Avaliação ${i + 1} – ${a.studentInfo.date}`, heading: HeadingLevel.HEADING_3 }))
    sections.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [cell('Data', true), cell(a.studentInfo.date), cell('Conclusão', true), cell(`${pct}%`), cell('Média Geral', true), cell(`${mediaGeral.toFixed(2)} anos`)] }),
        new TableRow({
          children: [
            cell('Área', true, 'E9D5FF'),
            cell('Idade Desenvolvimental', true, 'E9D5FF'),
            cell('% Sim', true, 'E9D5FF'),
            cell('Não', true, 'E9D5FF'),
            cell('Às vezes', true, 'E9D5FF'),
            cell('Total itens', true, 'E9D5FF'),
          ],
        }),
        ...areaResults.map(r => new TableRow({
          children: [
            cell(r.area),
            cell(r.idadeDesenvLabel, true),
            cell(`${Math.round((r.totalSim / r.totalItems) * 100)}%`),
            cell(String(r.totalNao)),
            cell(String(r.totalAv)),
            cell(String(r.totalItems)),
          ],
        })),
      ],
    }))
    sections.push(new Paragraph({ text: '' }))
  }

  // Progression table (only if more than 1 assessment)
  if (sorted.length > 1) {
    sections.push(new Paragraph({ text: 'TABELA DE PROGRESSÃO', heading: HeadingLevel.HEADING_2 }))
    sections.push(new Paragraph({ text: 'Comparação das idades desenvolvimentais entre avaliações (↑ progressão · ↓ regressão · → estável)' }))
    sections.push(new Paragraph({ text: '' }))

    // Build matrix: rows = areas, cols = assessments
    const allResults = sorted.map(a => {
      return AREAS.map(area => {
        const items = portageItems.filter(p => p.area === area)
        return calcAreaDevResult(area, items as PortageItem[], a.responses as Record<string, ResponseType>)
      })
    })

    const headerCells = [
      cell('Área', true, 'D6BCF7'),
      ...sorted.map((a, i) => cell(`Av. ${i + 1}\n${a.studentInfo.date}`, true, 'D6BCF7')),
      cell('Variação Total', true, 'D6BCF7'),
    ]

    const rows: TableRow[] = [new TableRow({ children: headerCells })]
    for (let aIdx = 0; aIdx < AREAS.length; aIdx++) {
      const area = AREAS[aIdx]
      const values = allResults.map(ar => ar[aIdx].idadeDesenvAnos)
      const labels = allResults.map(ar => ar[aIdx].idadeDesenvLabel)
      const totalVar = values[values.length - 1] - values[0]
      const varLabel = totalVar >= 0 ? `↑ +${totalVar.toFixed(1)} anos` : `↓ ${totalVar.toFixed(1)} anos`
      rows.push(new TableRow({
        children: [
          cell(area),
          ...labels.map((label, i) => {
            const t = i === 0 ? '' : trend(values[i - 1], values[i])
            return cell(`${label}${t ? `  ${t}` : ''}`)
          }),
          cell(varLabel, true, totalVar >= 0 ? 'D1FAE5' : 'FEE2E2'),
        ],
      }))
    }
    // Média geral row
    const mediaValues = sorted.map((_, si) => {
      const ar = allResults[si]
      return ar.reduce((s, r) => s + r.idadeDesenvAnos, 0) / ar.length
    })
    const totalMediaVar = mediaValues[mediaValues.length - 1] - mediaValues[0]
    rows.push(new TableRow({
      children: [
        cell('MÉDIA GERAL', true, 'E9D5FF'),
        ...mediaValues.map((v, i) => {
          const t = i === 0 ? '' : trend(mediaValues[i - 1], v)
          return cell(`${v.toFixed(2)} anos${t ? `  ${t}` : ''}`, true, 'E9D5FF')
        }),
        cell(totalMediaVar >= 0 ? `↑ +${totalMediaVar.toFixed(2)} anos` : `↓ ${totalMediaVar.toFixed(2)} anos`, true, totalMediaVar >= 0 ? 'D1FAE5' : 'FEE2E2'),
      ],
    }))
    sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }))
  }

  const doc = new Document({ sections: [{ children: sections }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Acompanhamento_${patient.name}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.docx`)
}
