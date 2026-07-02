import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'
import type { Assessment } from '../types'
import type { AreaDevResult } from './ageCalc'
import { AGE_RANGE_LABEL, calcAgeMonths, formatDevAge } from './ageCalc'
import { formatQuestion } from './formatQuestion'

// ── paleta clínica (mesma do app) ──
const HEAD_FILL = '2F64A0'   // azul clínico 600 (fundo de cabeçalho)
const SUB_FILL  = 'DBE7F5'   // azul clínico 100 (linhas de total)
// const LINE = 'C5CBD4' -- used in border styling

function cell(text: string, bold = false, shade?: string, color?: string): TableCell {
  return new TableCell({
    shading: shade ? { fill: shade, type: 'clear' as any } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: String(text), bold, size: 18, color })] })],
  })
}

function headerRow(labels: string[]): TableRow {
  return new TableRow({ tableHeader: true, children: labels.map(l => cell(l, true, HEAD_FILL, 'FFFFFF')) })
}

export async function exportWord(assessment: Assessment, areaResults: AreaDevResult[], mediaGeral: number) {
  const { studentInfo, responses } = assessment
  const { portageItems } = await import('../hooks/usePortageAssessment')

  const sections: any[] = []

  sections.push(new Paragraph({
    children: [new TextRun({ text: 'RELATÓRIO DE AVALIAÇÃO DO DESENVOLVIMENTO INFANTIL', bold: true, size: 26, color: '23466C' })],
    alignment: AlignmentType.CENTER,
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: HEAD_FILL, space: 6 } },
  }))
  sections.push(new Paragraph({
    children: [new TextRun({ text: 'Inventário de Avaliação Infantil', size: 18, color: '6C7480' })],
    alignment: AlignmentType.CENTER,
  }))
  sections.push(new Paragraph({ text: '' }))

  // ── Dados do aluno ───────────────────────────────────────────────────────
  sections.push(new Paragraph({ text: 'IDENTIFICAÇÃO', heading: HeadingLevel.HEADING_2 }))
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cell('Nome', true), cell(studentInfo.name), cell('Diagnóstico', true), cell(studentInfo.diagnosis || '—')] }),
      new TableRow({ children: [cell('Data de Nascimento', true), cell(studentInfo.birthDate), cell('Idade na avaliação', true), cell(studentInfo.age)] }),
      new TableRow({ children: [cell('Data da Avaliação', true), cell(studentInfo.date), cell('Instrumento', true), cell('Inventário de Avaliação Infantil')] }),
    ],
  }))
  sections.push(new Paragraph({ text: '' }))

  // Síntese: idade desenvolvimental × cronológica × defasagem
  const chronAnos = studentInfo.birthDate ? calcAgeMonths(studentInfo.birthDate) / 12 : null
  const defasagem = chronAnos !== null ? mediaGeral - chronAnos : null
  sections.push(new Paragraph({ text: 'SÍNTESE DO RESULTADO', heading: HeadingLevel.HEADING_2 }))
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [
        cell('Idade desenvolvimental (média)', true, SUB_FILL),
        cell('Idade cronológica', true, SUB_FILL),
        cell('Defasagem', true, SUB_FILL),
      ] }),
      new TableRow({ children: [
        cell(formatDevAge(mediaGeral)),
        cell(chronAnos !== null ? formatDevAge(chronAnos) : '—'),
        cell(defasagem !== null ? `${defasagem >= 0 ? '+' : ''}${defasagem.toFixed(2)} anos` : '—', true),
      ] }),
    ],
  }))
  sections.push(new Paragraph({ text: '' }))

  // ── Idade desenvolvimental ────────────────────────────────────────────────
  sections.push(new Paragraph({ text: 'RESULTADOS POR ÁREA', heading: HeadingLevel.HEADING_2 }))
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
    children: [cell('MÉDIA GERAL', true, SUB_FILL), cell('', true, SUB_FILL), cell('', true, SUB_FILL), cell(`${mediaGeral.toFixed(2)} anos`, true, SUB_FILL)],
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
      children: [cell('Idade Desenvolvimental', true, SUB_FILL), cell('', false, SUB_FILL), cell('', false, SUB_FILL), cell('', false, SUB_FILL), cell('', false, SUB_FILL), cell('', false, SUB_FILL), cell(result.idadeDesenvLabel, true, SUB_FILL)],
    }))
    sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }))
    sections.push(new Paragraph({ text: '' }))
  }

  // ── Habilidades não adquiridas ────────────────────────────────────────────
  const naoItems = portageItems.filter(i => responses[i.id] === 'nao')

  // ── Análise interpretativa (gerada automaticamente) ──
  const ordered = [...areaResults].sort((a, b) => b.idadeDesenvAnos - a.idadeDesenvAnos)
  const strong = ordered[0], weak = ordered[ordered.length - 1]
  sections.push(new Paragraph({ text: 'ANÁLISE INTERPRETATIVA', heading: HeadingLevel.HEADING_2 }))
  sections.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ size: 20, text: `A avaliação indica idade desenvolvimental média de ${formatDevAge(mediaGeral)}${chronAnos !== null ? `, frente à idade cronológica de ${formatDevAge(chronAnos)}` : ''}. O desempenho mais consolidado observa-se na área de ${strong.area} (${strong.idadeDesenvLabel}), enquanto a área de ${weak.area} (${weak.idadeDesenvLabel}) demanda maior atenção e constitui foco prioritário de intervenção.` })] }))
  sections.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ size: 20, text: 'Recomenda-se a elaboração de Plano de Ensino Individualizado (PEI) contemplando as habilidades não adquiridas e em desenvolvimento, com reavaliação periódica para monitoramento da progressão.' })] }))
  sections.push(new Paragraph({ text: '' }))

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

  // ── Assinatura ──
  sections.push(new Paragraph({ text: '' }))
  sections.push(new Paragraph({ text: '' }))
  sections.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: '262B33', space: 4 } },
    children: [new TextRun({ text: 'Profissional responsável', bold: true, size: 20 })],
  }))
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Terapeuta / Registro profissional', size: 16, color: '6C7480' })] }))

  const doc = new Document({ sections: [{ children: sections }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Avaliacao_Infantil_${studentInfo.name}_${studentInfo.date}.docx`)
}
