import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import type { Assessment } from '../types'
import type { AreaDevResult } from './ageCalc'
import { AGE_RANGE_LABEL } from './ageCalc'
import { formatQuestion } from './formatQuestion'

function cell(text: string, bold = false, shade?: string): TableCell {
  return new TableCell({
    shading: shade ? { fill: shade, type: 'clear' as any } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: String(text), bold, size: 18 })] })],
  })
}

function headerRow(labels: string[]): TableRow {
  return new TableRow({ children: labels.map(l => cell(l, true, 'D6BCF7')) })
}

export async function exportWord(assessment: Assessment, areaResults: AreaDevResult[], mediaGeral: number) {
  const { studentInfo, responses } = assessment
  const { portageItems } = await import('../hooks/usePortageAssessment')

  const sections: any[] = []

  sections.push(new Paragraph({ text: 'ESCALA PORTAGE – AVALIAÇÃO DO DESENVOLVIMENTO INFANTIL', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }))
  sections.push(new Paragraph({ text: '' }))

  // ── Dados do aluno ───────────────────────────────────────────────────────
  sections.push(new Paragraph({ text: 'DADOS DO ALUNO', heading: HeadingLevel.HEADING_2 }))
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cell('Nome', true), cell(studentInfo.name)] }),
      new TableRow({ children: [cell('Data de Nascimento', true), cell(studentInfo.birthDate)] }),
      new TableRow({ children: [cell('Idade', true), cell(studentInfo.age)] }),
      new TableRow({ children: [cell('Diagnóstico', true), cell(studentInfo.diagnosis || '—')] }),
      new TableRow({ children: [cell('Data da Avaliação', true), cell(studentInfo.date)] }),
    ],
  }))
  sections.push(new Paragraph({ text: '' }))

  // ── Idade desenvolvimental ────────────────────────────────────────────────
  sections.push(new Paragraph({ text: 'RESULTADO – IDADES DESENVOLVIMENTAIS', heading: HeadingLevel.HEADING_2 }))
  const devRows: TableRow[] = [headerRow(['Área', 'Pontos Total', '% Acertos', 'Idade Desenvolvimental'])]
  for (const r of areaResults) {
    devRows.push(new TableRow({
      children: [
        cell(r.area),
        cell(r.totalPontos.toFixed(1)),
        cell(`${Math.round((r.totalSim / r.totalItems) * 100)}%`),
        cell(r.idadeDesenvLabel, true),
      ],
    }))
  }
  devRows.push(new TableRow({
    children: [cell('MÉDIA GERAL', true, 'E9D5FF'), cell('', true, 'E9D5FF'), cell('', true, 'E9D5FF'), cell(`${mediaGeral.toFixed(2)} anos`, true, 'E9D5FF')],
  }))
  sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: devRows }))
  sections.push(new Paragraph({ text: '' }))

  // ── Detalhamento por área e faixa etária ─────────────────────────────────
  sections.push(new Paragraph({ text: 'DETALHAMENTO POR ÁREA E FAIXA ETÁRIA', heading: HeadingLevel.HEADING_2 }))
  for (const result of areaResults) {
    sections.push(new Paragraph({ text: result.area, heading: HeadingLevel.HEADING_3 }))
    const rows: TableRow[] = [headerRow(['Faixa Etária', 'Total', 'Sim', 'Às vezes', 'Não', 'Pontos', '% Acertos'])]
    for (const g of result.groups) {
      rows.push(new TableRow({
        children: [cell(AGE_RANGE_LABEL[g.key] ?? g.label), cell(String(g.total)), cell(String(g.sim)), cell(String(g.asVezes)), cell(String(g.nao)), cell(g.pontos.toFixed(1)), cell(`${g.pctAcertos}%`)],
      }))
    }
    rows.push(new TableRow({
      children: [cell('Idade Desenvolvimental', true, 'E9D5FF'), cell('', false, 'E9D5FF'), cell('', false, 'E9D5FF'), cell('', false, 'E9D5FF'), cell('', false, 'E9D5FF'), cell('', false, 'E9D5FF'), cell(result.idadeDesenvLabel, true, 'E9D5FF')],
    }))
    sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }))
    sections.push(new Paragraph({ text: '' }))
  }

  // ── Habilidades não adquiridas ────────────────────────────────────────────
  const naoItems = portageItems.filter(i => responses[i.id] === 'nao')
  sections.push(new Paragraph({ text: 'HABILIDADES NÃO ADQUIRIDAS (ALTA PRIORIDADE)', heading: HeadingLevel.HEADING_2 }))
  if (naoItems.length > 0) {
    const rows: TableRow[] = [headerRow(['Área', 'Faixa Etária', 'Habilidade'])]
    for (const item of naoItems) {
      rows.push(new TableRow({ children: [cell(item.area), cell(item.age_range), cell(formatQuestion(item.text))] }))
    }
    sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }))
  } else {
    sections.push(new Paragraph({ text: 'Nenhuma habilidade marcada como "Não".' }))
  }
  sections.push(new Paragraph({ text: '' }))

  // ── Em desenvolvimento ────────────────────────────────────────────────────
  const avItems = portageItems.filter(i => responses[i.id] === 'as_vezes')
  sections.push(new Paragraph({ text: 'HABILIDADES EM DESENVOLVIMENTO', heading: HeadingLevel.HEADING_2 }))
  if (avItems.length > 0) {
    const rows: TableRow[] = [headerRow(['Área', 'Faixa Etária', 'Habilidade'])]
    for (const item of avItems) {
      rows.push(new TableRow({ children: [cell(item.area), cell(item.age_range), cell(formatQuestion(item.text))] }))
    }
    sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }))
  } else {
    sections.push(new Paragraph({ text: 'Nenhuma habilidade marcada como "Às vezes".' }))
  }

  const doc = new Document({ sections: [{ children: sections }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Portage_${studentInfo.name}_${studentInfo.date}.docx`)
}
