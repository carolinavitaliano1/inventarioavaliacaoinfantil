import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType, BorderStyle, ShadingType } from 'docx'
import { saveAs } from 'file-saver'
import type { Assessment } from '../types'
import { formatQuestion } from './formatQuestion'

const BLUE = '2F64A0'
const BLUE_LIGHT = 'DBE7F5'
const ORANGE = 'C05621'
const ORANGE_LIGHT = 'FEF0E6'
const GREEN = '276749'
const GREEN_LIGHT = 'E6F4EE'
const GRAY_LIGHT = 'F1F3F5'

interface PEIItem {
  id: string
  skill: string
  area: string
  ageRange: string
  prazo: 'curto' | 'medio' | 'longo'
  status: 'pendente' | 'em_andamento' | 'concluido'
  estrategias: string
}

const PRAZO_LABEL = {
  curto: 'Curto prazo (até 3 meses)',
  medio: 'Médio prazo (até 6 meses)',
  longo: 'Longo prazo (9–12 meses)',
}

const STATUS_LABEL = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

function cell(text: string, bold = false, fill?: string, color?: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: fill ? { fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: [new Paragraph({
      children: [new TextRun({ text: String(text), bold, size: 19, color: color ?? '2D3748' })],
    })],
  })
}

function headerRow(labels: string[]): TableRow {
  return new TableRow({
    tableHeader: true,
    children: labels.map(l => cell(l, true, BLUE, 'FFFFFF')),
  })
}

function sectionTitle(text: string, fill = BLUE_LIGHT): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    shading: { fill, type: ShadingType.CLEAR, color: 'auto' },
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 22, color: '1A365D' })],
  })
}

function prazoSection(label: string, fill: string, color: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: `● ${label}`, bold: true, size: 20, color })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: fill, space: 4 } },
  })
}

export async function exportPEI(assessment: Assessment, plan: PEIItem[]) {
  const { studentInfo } = assessment
  const sections: any[] = []

  // ── Cabeçalho ──
  sections.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: 'PLANO DE ENSINO INDIVIDUALIZADO — PEI', bold: true, size: 32, color: '1A365D' })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 8 } },
  }))
  sections.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 280 },
    children: [new TextRun({ text: 'Inventário de Avaliação do Desenvolvimento Infantil — IADI', size: 18, color: '718096' })],
  }))

  // ── Identificação ──
  sections.push(sectionTitle('1. IDENTIFICAÇÃO', BLUE_LIGHT))
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cell('Nome do aluno', true, GRAY_LIGHT, '2D3748', 25), cell(studentInfo.name, false, undefined, undefined, 75)] }),
      new TableRow({ children: [cell('Data de nascimento', true, GRAY_LIGHT, '2D3748', 25), cell(studentInfo.birthDate || '—', false, undefined, undefined, 25), cell('Idade', true, GRAY_LIGHT, '2D3748', 25), cell(studentInfo.age || '—', false, undefined, undefined, 25)] }),
      new TableRow({ children: [cell('Diagnóstico', true, GRAY_LIGHT, '2D3748', 25), cell(studentInfo.diagnosis || '—', false, undefined, undefined, 75)] }),
      new TableRow({ children: [cell('Data do PEI', true, GRAY_LIGHT, '2D3748', 25), cell(studentInfo.date || new Date().toLocaleDateString('pt-BR'), false, undefined, undefined, 25), cell('Profissional', true, GRAY_LIGHT, '2D3748', 25), cell('', false, undefined, undefined, 25)] }),
    ],
  }))
  sections.push(new Paragraph({ text: '' }))

  // ── Síntese do plano ──
  const done = plan.filter(p => p.status === 'concluido').length
  const pct = plan.length ? Math.round(done / plan.length * 100) : 0
  sections.push(sectionTitle('2. SÍNTESE DO PLANO', BLUE_LIGHT))
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [
        cell('Total de habilidades', true, BLUE_LIGHT, '1A365D'),
        cell('Concluídas', true, GREEN_LIGHT, '276749'),
        cell('Em andamento', true, 'EBF8FF', '2B6CB0'),
        cell('Progresso', true, GRAY_LIGHT),
      ] }),
      new TableRow({ children: [
        cell(String(plan.length), true),
        cell(String(done), true, undefined, GREEN),
        cell(String(plan.filter(p => p.status === 'em_andamento').length), true, undefined, '2B6CB0'),
        cell(`${pct}%`, true),
      ] }),
    ],
  }))
  sections.push(new Paragraph({ text: '' }))

  // ── Habilidades por prazo ──
  sections.push(sectionTitle('3. HABILIDADES E ESTRATÉGIAS DE INTERVENÇÃO', BLUE_LIGHT))

  const grouped: Record<string, PEIItem[]> = { curto: [], medio: [], longo: [] }
  plan.forEach(p => grouped[p.prazo].push(p))

  const prazoConfig = [
    { key: 'curto' as const, fill: ORANGE_LIGHT, color: ORANGE },
    { key: 'medio' as const, fill: BLUE_LIGHT, color: BLUE },
    { key: 'longo' as const, fill: GREEN_LIGHT, color: GREEN },
  ]

  for (const { key, fill, color } of prazoConfig) {
    const items = grouped[key]
    if (!items.length) continue

    sections.push(prazoSection(PRAZO_LABEL[key], fill, color))

    const rows: TableRow[] = [headerRow(['Habilidade', 'Área', 'Faixa etária', 'Status'])]
    for (const item of items) {
      rows.push(new TableRow({ children: [
        cell(formatQuestion(item.skill), false, undefined, undefined, 42),
        cell(item.area, false, undefined, undefined, 28),
        cell(item.ageRange, false, undefined, undefined, 15),
        cell(STATUS_LABEL[item.status], item.status === 'concluido', item.status === 'concluido' ? GREEN_LIGHT : item.status === 'em_andamento' ? 'EBF8FF' : GRAY_LIGHT, item.status === 'concluido' ? GREEN : item.status === 'em_andamento' ? '2B6CB0' : '718096', 15),
      ] }))

      // linha de estratégias
      rows.push(new TableRow({
        children: [new TableCell({
          columnSpan: 4,
          shading: { fill: 'FAFAFA', type: ShadingType.CLEAR, color: 'auto' },
          children: [
            new Paragraph({ spacing: { before: 60, after: 20 }, children: [new TextRun({ text: 'Estratégias de intervenção:', bold: true, size: 17, color: '4A5568' })] }),
            new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: item.estrategias, size: 17, color: '4A5568' })] }),
          ],
        })],
      }))
    }

    sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }))
    sections.push(new Paragraph({ text: '' }))
  }

  // ── Observações ──
  sections.push(sectionTitle('4. OBSERVAÇÕES / METAS GERAIS', BLUE_LIGHT))
  sections.push(new Paragraph({
    spacing: { after: 0 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E0', space: 4 },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E0', space: 4 },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E0', space: 4 },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E0', space: 4 },
    },
    children: [new TextRun({ text: '\n\n\n\n\n\n', size: 20 })],
  }))
  sections.push(new Paragraph({ text: '' }))

  // ── Assinaturas ──
  sections.push(sectionTitle('5. ASSINATURAS', BLUE_LIGHT))
  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({ spacing: { before: 600, after: 40 }, border: { top: { style: BorderStyle.SINGLE, size: 6, color: '2D3748', space: 4 } }, children: [new TextRun({ text: 'Profissional responsável', bold: true, size: 19 })] }),
            new Paragraph({ children: [new TextRun({ text: 'Assinatura / Registro', size: 17, color: '718096' })] }),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({ spacing: { before: 600, after: 40 }, border: { top: { style: BorderStyle.SINGLE, size: 6, color: '2D3748', space: 4 } }, children: [new TextRun({ text: 'Responsável pelo aluno', bold: true, size: 19 })] }),
            new Paragraph({ children: [new TextRun({ text: 'Assinatura', size: 17, color: '718096' })] }),
          ],
        }),
      ] }),
    ],
  }))

  const doc = new Document({ sections: [{ children: sections }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `PEI_${studentInfo.name}_${studentInfo.date || new Date().toLocaleDateString('pt-BR')}.docx`)
}
