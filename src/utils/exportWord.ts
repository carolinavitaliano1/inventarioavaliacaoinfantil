import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import type { Assessment } from '../types'
import { portageItems } from '../hooks/usePortageAssessment'
import { AREAS } from '../types'
import { ageRangeOrder, AGE_RANGE_LABEL } from './ageCalc'


function cell(text: string, bold = false, shade?: string): TableCell {
  return new TableCell({
    shading: shade ? { fill: shade, type: 'clear' as any } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text, bold, size: 18 })] })],
  })
}

function headerRow(labels: string[]): TableRow {
  return new TableRow({ children: labels.map(l => cell(l, true, 'D6BCF7')) })
}

export async function exportWord(assessment: Assessment) {
  const { studentInfo, responses } = assessment

  const sections: any[] = []

  // ── Título ──────────────────────────────────────────────────────────────
  sections.push(new Paragraph({ text: 'ESCALA PORTAGE – AVALIAÇÃO DO DESENVOLVIMENTO INFANTIL', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }))
  sections.push(new Paragraph({ text: '' }))

  // ── Dados do aluno ───────────────────────────────────────────────────────
  sections.push(new Paragraph({ text: 'DADOS DO ALUNO', heading: HeadingLevel.HEADING_2 }))
  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cell('Nome', true), cell(studentInfo.name)] }),
      new TableRow({ children: [cell('Data de Nascimento', true), cell(studentInfo.birthDate)] }),
      new TableRow({ children: [cell('Idade', true), cell(studentInfo.age)] }),
      new TableRow({ children: [cell('Diagnóstico', true), cell(studentInfo.diagnosis || '—')] }),
      new TableRow({ children: [cell('Data da Avaliação', true), cell(studentInfo.date)] }),
    ],
  })
  sections.push(infoTable)
  sections.push(new Paragraph({ text: '' }))

  // ── Resultados por área / faixa etária ───────────────────────────────────
  sections.push(new Paragraph({ text: 'RESULTADOS POR ÁREA E FAIXA ETÁRIA', heading: HeadingLevel.HEADING_2 }))

  const statRows: TableRow[] = [headerRow(['Área', 'Faixa Etária', 'Total', 'Sim', 'Às vezes', 'Não', '% Acertos', 'Idade Desenv.'])]
  for (const area of AREAS) {
    const areaItems = portageItems.filter(i => i.area === area)
    const ageGroups: Record<number, typeof portageItems> = {}
    for (const item of areaItems) {
      const k = ageRangeOrder(item.age_range)
      if (!ageGroups[k]) ageGroups[k] = []
      ageGroups[k].push(item)
    }
    let devAge = '—'
    for (const k of Object.keys(ageGroups).map(Number).sort((a, b) => a - b)) {
      const g = ageGroups[k]
      const sim = g.filter(i => responses[i.id] === 'sim').length
      if ((sim / g.length) * 100 >= 75) devAge = AGE_RANGE_LABEL[k]
    }
    let first = true
    for (const k of Object.keys(ageGroups).map(Number).sort((a, b) => a - b)) {
      const g = ageGroups[k]
      const sim = g.filter(i => responses[i.id] === 'sim').length
      const av = g.filter(i => responses[i.id] === 'as_vezes').length
      const nao = g.filter(i => responses[i.id] === 'nao').length
      const pct = `${Math.round((sim / g.length) * 100)}%`
      statRows.push(new TableRow({ children: [cell(first ? area : ''), cell(AGE_RANGE_LABEL[k]), cell(String(g.length)), cell(String(sim)), cell(String(av)), cell(String(nao)), cell(pct), cell(first ? devAge : '')] }))
      first = false
    }
  }
  sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: statRows }))
  sections.push(new Paragraph({ text: '' }))

  // ── Lista de habilidades não adquiridas ───────────────────────────────────
  sections.push(new Paragraph({ text: 'HABILIDADES NÃO ADQUIRIDAS (PRIORIDADE)', heading: HeadingLevel.HEADING_2 }))
  const naoItems = portageItems.filter(i => responses[i.id] === 'nao')
  if (naoItems.length > 0) {
    const naoRows: TableRow[] = [headerRow(['Área', 'Faixa Etária', 'Habilidade'])]
    for (const item of naoItems) {
      naoRows.push(new TableRow({ children: [cell(item.area), cell(item.age_range), cell(item.text)] }))
    }
    sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: naoRows }))
  } else {
    sections.push(new Paragraph({ text: 'Nenhuma habilidade marcada como "Não".' }))
  }
  sections.push(new Paragraph({ text: '' }))

  // ── Habilidades em desenvolvimento ────────────────────────────────────────
  sections.push(new Paragraph({ text: 'HABILIDADES EM DESENVOLVIMENTO', heading: HeadingLevel.HEADING_2 }))
  const avItems = portageItems.filter(i => responses[i.id] === 'as_vezes')
  if (avItems.length > 0) {
    const avRows: TableRow[] = [headerRow(['Área', 'Faixa Etária', 'Habilidade'])]
    for (const item of avItems) {
      avRows.push(new TableRow({ children: [cell(item.area), cell(item.age_range), cell(item.text)] }))
    }
    sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: avRows }))
  } else {
    sections.push(new Paragraph({ text: 'Nenhuma habilidade marcada como "Às vezes".' }))
  }

  const doc = new Document({ sections: [{ children: sections }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Portage_${studentInfo.name}_${studentInfo.date}.docx`)
}
