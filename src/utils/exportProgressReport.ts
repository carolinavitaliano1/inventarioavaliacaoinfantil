import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, WidthType, AlignmentType, BorderStyle,
  ShadingType,
} from 'docx'
import { saveAs } from 'file-saver'
import type { Patient, Assessment, PortageItem, ResponseType } from '../types'
import { AREAS } from '../types'
import { portageItems } from '../hooks/usePortageAssessment'
import { calcAreaDevResult } from './ageCalc'

// Nomes curtos das áreas para tabelas
const AREA_SHORT: Record<string, string> = {
  'I – ÁREA SOCIABILIZAÇÃO': 'Sociabilização',
  'II - ÁREA LINGUAGEM': 'Linguagem',
  'III – ÁREA CUIDADOS PRÓPRIOS': 'Cuidados Próprios',
  'IV- ÁREA COGNITIVA': 'Cognitiva',
  'V. ÁREA PSICOMOTORA': 'Psicomotora',
}
function shortArea(area: string) { return AREA_SHORT[area] ?? area }

// Largura da página utilizável em DXA (twips): ~10080 ≈ 17cm
const PAGE_W = 10080

function cell(
  text: string,
  opts: { bold?: boolean; shade?: string; size?: number; align?: typeof AlignmentType[keyof typeof AlignmentType]; w?: number } = {}
): TableCell {
  const { bold = false, shade, size = 18, align = AlignmentType.LEFT, w } = opts
  return new TableCell({
    width: w ? { size: w, type: WidthType.DXA } : undefined,
    shading: shade ? { fill: shade, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text: String(text || '—'), bold, size })],
    })],
  })
}

function hCell(text: string, w?: number): TableCell {
  return cell(text, { bold: true, shade: 'D6BCF7', size: 18, align: AlignmentType.CENTER, w })
}

function para(text: string, opts: { bold?: boolean; heading?: typeof HeadingLevel[keyof typeof HeadingLevel]; size?: number; align?: typeof AlignmentType[keyof typeof AlignmentType]; space?: number } = {}): Paragraph {
  const { bold = false, heading, size = 20, align, space } = opts
  if (heading) return new Paragraph({ text, heading, alignment: align, spacing: space ? { after: space } : undefined })
  return new Paragraph({
    alignment: align,
    spacing: space ? { after: space } : undefined,
    children: [new TextRun({ text, bold, size })],
  })
}

function divider(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D6BCF7' } },
    children: [],
    spacing: { after: 200 },
  })
}

function trendSymbol(diff: number): string {
  if (Math.abs(diff) < 0.05) return '→ Estável'
  return diff > 0 ? `↑ +${diff.toFixed(2)} anos` : `↓ ${diff.toFixed(2)} anos`
}

function trendColor(diff: number): string {
  if (Math.abs(diff) < 0.05) return '595959'
  return diff > 0 ? '15803D' : 'DC2626'
}

function trendCell(diff: number, isFirst: boolean, shade?: string): TableCell {
  const text = isFirst ? '—' : trendSymbol(diff)
  const color = isFirst ? '595959' : trendColor(diff)
  return new TableCell({
    shading: shade ? { fill: shade, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, color, bold: !isFirst, size: 18 })],
    })],
  })
}

export async function exportProgressReport(patient: Patient, assessments: Assessment[]) {
  const sorted = [...assessments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const children: any[] = []

  // ── CAPA ────────────────────────────────────────────────────────────────────
  children.push(para('INVENTÁRIO DE AVALIAÇÃO DO DESENVOLVIMENTO INFANTIL', {
    heading: HeadingLevel.HEADING_1, align: AlignmentType.CENTER,
  }))
  children.push(para('IADI – Escala Portage', { bold: false, size: 22, align: AlignmentType.CENTER }))
  children.push(para('', {}))
  children.push(para('RELATÓRIO DE ACOMPANHAMENTO CONTÍNUO', {
    bold: true, size: 28, align: AlignmentType.CENTER,
  }))
  children.push(para('', {}))
  children.push(para(`Paciente: ${patient.name}`, { bold: true, size: 24, align: AlignmentType.CENTER }))
  children.push(para(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, { size: 18, align: AlignmentType.CENTER }))
  children.push(para('', {}))
  children.push(divider())

  // ── SOBRE O INSTRUMENTO ──────────────────────────────────────────────────────
  children.push(para('O QUE É O IADI?', { heading: HeadingLevel.HEADING_2 }))
  children.push(para(
    'O Inventário de Avaliação do Desenvolvimento Infantil (IADI) é baseado na Escala Portage de Desenvolvimento ' +
    '(Portage Guide to Early Education, 1976) e em sua adaptação brasileira (Inventário Portage Operacionalizado – IPO). ' +
    'O instrumento avalia habilidades em 5 áreas do desenvolvimento para crianças de 0 a 6 anos.',
    { size: 18 }
  ))
  children.push(para('', {}))
  children.push(para(
    'COMO INTERPRETAR A IDADE DESENVOLVIMENTAL: A idade desenvolvimental (I.D.) indica o nível de desenvolvimento ' +
    'que a criança atingiu em cada área, expresso em anos/meses. Por exemplo, uma I.D. de "2 anos e 3 meses" na área ' +
    'Cognitiva significa que a criança apresenta desempenho equivalente ao esperado para essa faixa etária nessa área, ' +
    'independentemente da sua idade cronológica.',
    { size: 18 }
  ))
  children.push(para('', {}))
  children.push(para(
    'COMO LER AS SETAS DE PROGRESSÃO: ↑ indica evolução (a criança desenvolveu novas habilidades entre avaliações). ' +
    '↓ indica regressão (possível perda de habilidades ou maior rigor na avaliação). → indica estabilidade (resultado semelhante à avaliação anterior).',
    { size: 18 }
  ))
  children.push(para('', {}))
  children.push(divider())

  // ── DADOS DO PACIENTE ────────────────────────────────────────────────────────
  children.push(para('DADOS DO PACIENTE', { heading: HeadingLevel.HEADING_2 }))
  const col1 = Math.floor(PAGE_W * 0.3)
  const col2 = Math.floor(PAGE_W * 0.7)
  children.push(new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [
      new TableRow({ children: [hCell('Campo', col1), hCell('Informação', col2)] }),
      new TableRow({ children: [cell('Nome completo', { bold: true, w: col1 }), cell(patient.name, { w: col2 })] }),
      new TableRow({ children: [cell('Data de nascimento', { bold: true, w: col1 }), cell(patient.birthDate || '—', { w: col2 })] }),
      new TableRow({ children: [cell('Diagnóstico / CID', { bold: true, w: col1 }), cell(patient.diagnosis || '—', { w: col2 })] }),
      new TableRow({ children: [cell('Responsável', { bold: true, w: col1 }), cell(patient.responsibleName || '—', { w: col2 })] }),
      new TableRow({ children: [cell('Data de cadastro', { bold: true, w: col1 }), cell(new Date(patient.createdAt).toLocaleDateString('pt-BR'), { w: col2 })] }),
      new TableRow({ children: [cell('Total de avaliações', { bold: true, w: col1 }), cell(String(sorted.length), { w: col2 })] }),
    ],
  }))
  children.push(para('', {}))
  children.push(divider())

  // ── HISTÓRICO DE AVALIAÇÕES ──────────────────────────────────────────────────
  children.push(para('HISTÓRICO DETALHADO DAS AVALIAÇÕES', { heading: HeadingLevel.HEADING_2 }))
  children.push(para(
    'Cada avaliação apresenta o desempenho da criança por área, com a Idade Desenvolvimental (I.D.) calculada, ' +
    'o percentual de habilidades confirmadas ("Sim"), e a quantidade de habilidades Não adquiridas e Em desenvolvimento (Às vezes).',
    { size: 18 }
  ))
  children.push(para('', {}))

  // Widths for assessment tables: Area | I.D. | %Sim | Não | Às vezes
  const aw = [
    Math.floor(PAGE_W * 0.28),
    Math.floor(PAGE_W * 0.22),
    Math.floor(PAGE_W * 0.16),
    Math.floor(PAGE_W * 0.16),
    Math.floor(PAGE_W * 0.18),
  ]

  const allResults = sorted.map(a => {
    return AREAS.map(area => {
      const items = portageItems.filter(p => p.area === area)
      return calcAreaDevResult(area, items as PortageItem[], a.responses as Record<string, ResponseType>)
    })
  })

  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i]
    const areaResults = allResults[i]
    const answered = Object.values(a.responses).filter(Boolean).length
    const pct = Math.round((answered / portageItems.length) * 100)
    const mediaGeral = areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / areaResults.length
    const totalNao = areaResults.reduce((s, r) => s + r.totalNao, 0)
    const totalAv = areaResults.reduce((s, r) => s + r.totalAv, 0)

    children.push(para(`Avaliação ${i + 1}  |  Data: ${a.studentInfo.date}  |  Conclusão: ${pct}%  |  I.D. Média: ${mediaGeral.toFixed(2)} anos`, {
      heading: HeadingLevel.HEADING_3,
    }))

    if (pct < 80) {
      children.push(para(
        `Atenção: esta avaliação está ${pct < 50 ? 'pouco' : 'parcialmente'} concluída (${pct}% respondido). ` +
        'Os resultados abaixo refletem apenas os itens avaliados até o momento.',
        { size: 16, bold: false }
      ))
    }

    children.push(new Table({
      width: { size: PAGE_W, type: WidthType.DXA },
      rows: [
        new TableRow({ children: [
          hCell('Área de Desenvolvimento', aw[0]),
          hCell('Idade Desenvolvimental', aw[1]),
          hCell('% Sim (adquirido)', aw[2]),
          hCell('Não adquirido', aw[3]),
          hCell('Às vezes (em desenv.)', aw[4]),
        ]}),
        ...areaResults.map(r => new TableRow({ children: [
          cell(shortArea(r.area), { w: aw[0] }),
          cell(r.idadeDesenvLabel, { bold: true, w: aw[1], align: AlignmentType.CENTER }),
          cell(`${Math.round((r.totalSim / r.totalItems) * 100)}%`, { w: aw[2], align: AlignmentType.CENTER }),
          cell(String(r.totalNao), { w: aw[3], align: AlignmentType.CENTER,
            shade: r.totalNao > 5 ? 'FEE2E2' : undefined }),
          cell(String(r.totalAv), { w: aw[4], align: AlignmentType.CENTER,
            shade: r.totalAv > 5 ? 'FEF9C3' : undefined }),
        ]})),
        new TableRow({ children: [
          cell('TOTAL GERAL', { bold: true, shade: 'E9D5FF', w: aw[0] }),
          cell(`${mediaGeral.toFixed(2)} anos`, { bold: true, shade: 'E9D5FF', w: aw[1], align: AlignmentType.CENTER }),
          cell(`${pct}%`, { bold: true, shade: 'E9D5FF', w: aw[2], align: AlignmentType.CENTER }),
          cell(String(totalNao), { bold: true, shade: 'E9D5FF', w: aw[3], align: AlignmentType.CENTER }),
          cell(String(totalAv), { bold: true, shade: 'E9D5FF', w: aw[4], align: AlignmentType.CENTER }),
        ]}),
      ],
    }))
    children.push(para('', {}))
    children.push(para(
      `Interpretação: Nesta avaliação, a criança adquiriu habilidades correspondentes a uma idade ` +
      `desenvolvimental média de ${mediaGeral.toFixed(2)} anos. ` +
      `Foram identificadas ${totalNao} habilidades ainda não adquiridas (prioridade de intervenção) ` +
      `e ${totalAv} habilidades em desenvolvimento (que emergem parcialmente).`,
      { size: 17 }
    ))
    children.push(para('', {}))
  }

  children.push(divider())

  // ── TABELA DE PROGRESSÃO ─────────────────────────────────────────────────────
  if (sorted.length > 1) {
    children.push(para('TABELA DE PROGRESSÃO ENTRE AVALIAÇÕES', { heading: HeadingLevel.HEADING_2 }))
    children.push(para(
      'Esta tabela compara a Idade Desenvolvimental (I.D.) de cada área em todas as avaliações realizadas. ' +
      'A coluna "Tendência" mostra se houve progressão (↑), regressão (↓) ou estabilidade (→) em relação à avaliação anterior. ' +
      'A coluna "Variação Total" mostra o ganho ou perda acumulado entre a primeira e a última avaliação.',
      { size: 18 }
    ))
    children.push(para('', {}))

    // Dynamic widths based on number of assessments
    const n = sorted.length
    const areaW = Math.floor(PAGE_W * 0.22)
    const availW = PAGE_W - areaW
    // Per assessment: I.D. + Tendência = 2 sub-cols
    const colsPerAv = 2
    const avW = Math.floor(availW / (n * colsPerAv + 1))
    const varW = PAGE_W - areaW - avW * n * colsPerAv

    // Header row 1: Area | Av1 (span 2) | Av2 (span 2) | ... | Variação Total
    // Since docx doesn't easily span, we'll do two header rows
    const headerRow1 = new TableRow({ children: [
      hCell('Área', areaW),
      ...sorted.flatMap((a, i) => [
        hCell(`Avaliação ${i + 1}`, avW),
        hCell(`(${a.studentInfo.date})`, avW),
      ]),
      hCell('Variação Total', varW),
    ]})

    const headerRow2 = new TableRow({ children: [
      cell('', { shade: 'D6BCF7', w: areaW }),
      ...sorted.flatMap(() => [
        cell('I.D. calculada', { bold: true, shade: 'E9D5FF', w: avW, align: AlignmentType.CENTER }),
        cell('Tendência', { bold: true, shade: 'E9D5FF', w: avW, align: AlignmentType.CENTER }),
      ]),
      cell('1ª → última avaliação', { bold: true, shade: 'D6BCF7', w: varW, align: AlignmentType.CENTER }),
    ]})

    const dataRows: TableRow[] = []
    for (let aIdx = 0; aIdx < AREAS.length; aIdx++) {
      const area = AREAS[aIdx]
      const values = allResults.map(ar => ar[aIdx].idadeDesenvAnos)
      const labels = allResults.map(ar => ar[aIdx].idadeDesenvLabel)
      const totalVar = values[values.length - 1] - values[0]
      dataRows.push(new TableRow({ children: [
        cell(shortArea(area), { w: areaW }),
        ...sorted.flatMap((_, i) => {
          const diff = i === 0 ? 0 : values[i] - values[i - 1]
          return [
            cell(labels[i], { bold: true, w: avW, align: AlignmentType.CENTER }),
            trendCell(diff, i === 0, undefined),
          ]
        }),
        new TableCell({
          width: { size: varW, type: WidthType.DXA },
          shading: { fill: totalVar >= 0 ? 'DCFCE7' : 'FEE2E2', type: ShadingType.CLEAR, color: 'auto' },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: totalVar >= 0 ? `↑ +${totalVar.toFixed(2)} anos` : `↓ ${Math.abs(totalVar).toFixed(2)} anos`,
              bold: true, color: totalVar >= 0 ? '15803D' : 'DC2626', size: 18,
            })],
          })],
        }),
      ]}))
    }

    // Média geral row
    const mediaValues = allResults.map(ar => ar.reduce((s, r) => s + r.idadeDesenvAnos, 0) / ar.length)
    const totalMediaVar = mediaValues[mediaValues.length - 1] - mediaValues[0]
    dataRows.push(new TableRow({ children: [
      cell('MÉDIA GERAL', { bold: true, shade: 'E9D5FF', w: areaW }),
      ...sorted.flatMap((_, i) => {
        const diff = i === 0 ? 0 : mediaValues[i] - mediaValues[i - 1]
        return [
          cell(`${mediaValues[i].toFixed(2)} anos`, { bold: true, shade: 'E9D5FF', w: avW, align: AlignmentType.CENTER }),
          trendCell(diff, i === 0, 'E9D5FF'),
        ]
      }),
      new TableCell({
        width: { size: varW, type: WidthType.DXA },
        shading: { fill: totalMediaVar >= 0 ? 'DCFCE7' : 'FEE2E2', type: ShadingType.CLEAR, color: 'auto' },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: totalMediaVar >= 0 ? `↑ +${totalMediaVar.toFixed(2)} anos` : `↓ ${Math.abs(totalMediaVar).toFixed(2)} anos`,
            bold: true, color: totalMediaVar >= 0 ? '15803D' : 'DC2626', size: 20,
          })],
        })],
      }),
    ]}))

    children.push(new Table({
      width: { size: PAGE_W, type: WidthType.DXA },
      rows: [headerRow1, headerRow2, ...dataRows],
    }))
    children.push(para('', {}))

    // Narrative interpretation
    children.push(para('INTERPRETAÇÃO DA PROGRESSÃO', { heading: HeadingLevel.HEADING_3 }))
    const lastAvResults = allResults[allResults.length - 1]
    const firstAvResults = allResults[0]

    const improved = AREAS.filter((_, i) => lastAvResults[i].idadeDesenvAnos - firstAvResults[i].idadeDesenvAnos > 0.05)
    const regressed = AREAS.filter((_, i) => firstAvResults[i].idadeDesenvAnos - lastAvResults[i].idadeDesenvAnos > 0.05)
    const stable = AREAS.filter((_, i) => Math.abs(lastAvResults[i].idadeDesenvAnos - firstAvResults[i].idadeDesenvAnos) <= 0.05)

    if (improved.length > 0) {
      children.push(para(
        `✅ Áreas com progressão: ${improved.map(shortArea).join(', ')}. ` +
        'Nessas áreas, a criança demonstrou desenvolvimento de novas habilidades entre as avaliações.',
        { size: 18 }
      ))
    }
    if (stable.length > 0) {
      children.push(para(
        `➡️ Áreas estáveis: ${stable.map(shortArea).join(', ')}. ` +
        'O desempenho se manteve equivalente entre as avaliações.',
        { size: 18 }
      ))
    }
    if (regressed.length > 0) {
      children.push(para(
        `⚠️ Áreas com atenção especial: ${regressed.map(shortArea).join(', ')}. ` +
        'Recomenda-se revisar os critérios de avaliação e intensificar a intervenção nessas áreas.',
        { size: 18 }
      ))
    }

    const overallVar = totalMediaVar
    children.push(para('', {}))
    children.push(para(
      overallVar > 0
        ? `Conclusão geral: A criança apresentou evolução global de ${overallVar.toFixed(2)} anos na média desenvolvimental ` +
          `entre a primeira (${sorted[0].studentInfo.date}) e a última avaliação (${sorted[sorted.length - 1].studentInfo.date}). ` +
          'Esse resultado indica progresso no desenvolvimento geral.'
        : overallVar < 0
          ? `Conclusão geral: Observou-se uma variação negativa de ${Math.abs(overallVar).toFixed(2)} anos na média desenvolvimental. ` +
            'Recomenda-se análise detalhada das áreas afetadas e revisão do plano de intervenção (PEI).'
          : 'Conclusão geral: O desempenho global se manteve estável entre as avaliações.',
      { size: 18 }
    ))
    children.push(para('', {}))
    children.push(divider())
  }

  // ── LEGENDA FINAL ────────────────────────────────────────────────────────────
  children.push(para('LEGENDA E REFERÊNCIAS', { heading: HeadingLevel.HEADING_2 }))
  children.push(para('I.D. = Idade Desenvolvimental  |  % Sim = percentual de habilidades confirmadas como adquiridas', { size: 16 }))
  children.push(para('↑ = progressão entre avaliações  |  ↓ = regressão  |  → = estável (diferença < 0,05 anos)', { size: 16 }))
  children.push(para('Células em vermelho = 5 ou mais habilidades não adquiridas (alta prioridade de intervenção)', { size: 16 }))
  children.push(para('Células em amarelo = 5 ou mais habilidades em desenvolvimento', { size: 16 }))
  children.push(para('', {}))
  children.push(para('Instrumento baseado em: Bluma et al. (1976). Portage Guide to Early Education. / Williams & Aiello (2001). Inventário Portage Operacionalizado. São Paulo: Memnon.', { size: 16 }))

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Acompanhamento_${patient.name}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.docx`)
}
