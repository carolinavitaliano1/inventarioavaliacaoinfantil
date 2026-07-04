import type { Assessment } from '../types'
import type { AreaDevResult } from './ageCalc'
import { AGE_RANGE_LABEL, calcAgeMonths, formatDevAge } from './ageCalc'
import { formatQuestion } from './formatQuestion'
import { safe, BASE_TABLE, drawHeader, drawSection, addPageNumbers, drawSignatures } from './exportHelpers'

export async function exportWordPdf(assessment: Assessment, areaResults: AreaDevResult[], mediaGeral: number) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const { portageItems } = await import('../hooks/usePortageAssessment')

  const { studentInfo, responses } = assessment
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const chronAnos = studentInfo.birthDate ? calcAgeMonths(studentInfo.birthDate) / 12 : null
  const defasagem = chronAnos !== null ? mediaGeral - chronAnos : null
  const ordered = [...areaResults].sort((a, b) => b.idadeDesenvAnos - a.idadeDesenvAnos)
  const strong = ordered[0], weak = ordered[ordered.length - 1]
  const naoItems = portageItems.filter(i => responses[i.id] === 'nao')
  const avItems  = portageItems.filter(i => responses[i.id] === 'as_vezes')

  let y = drawHeader(pdf, 'Relatorio de Avaliacao do Desenvolvimento Infantil',
    'Inventario de Avaliacao do Desenvolvimento Infantil - IADI')

  // Identificacao
  y = drawSection(pdf, 'Identificacao', y)
  autoTable(pdf, {
    ...BASE_TABLE,
    startY: y,
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 44 },
      2: { fontStyle: 'bold', cellWidth: 44 },
    },
    body: [
      [safe('Nome'), safe(studentInfo.name), safe('Diagnostico'), safe(studentInfo.diagnosis)],
      [safe('Data de Nascimento'), safe(studentInfo.birthDate), safe('Idade na avaliacao'), safe(studentInfo.age)],
      [safe('Data da Avaliacao'), safe(studentInfo.date), safe('Instrumento'), 'IADI'],
    ],
  })
  y = (pdf as any).lastAutoTable.finalY + 6

  // Sintese
  y = drawSection(pdf, 'Sintese do Resultado', y)
  autoTable(pdf, {
    ...BASE_TABLE,
    startY: y,
    headStyles: { ...BASE_TABLE.headStyles, halign: 'center' as const },
    styles: { ...BASE_TABLE.styles, halign: 'center' as const, fontStyle: 'bold' as const, fontSize: 11 },
    head: [['Idade desenvolvimental (media)', 'Idade cronologica', 'Defasagem']],
    body: [[
      safe(formatDevAge(mediaGeral)),
      chronAnos !== null ? safe(formatDevAge(chronAnos)) : '-',
      defasagem !== null ? `${defasagem >= 0 ? '+' : ''}${defasagem.toFixed(2)} anos` : '-',
    ]],
  })
  y = (pdf as any).lastAutoTable.finalY + 6

  // Resultados por area
  y = drawSection(pdf, 'Resultados por Area', y)
  autoTable(pdf, {
    ...BASE_TABLE,
    startY: y,
    columnStyles: {
      1: { halign: 'center' as const },
      2: { halign: 'center' as const },
      3: { halign: 'center' as const, fontStyle: 'bold' as const },
    },
    head: [['Area', 'Pontos', '% Acertos', 'Idade Desenvolvimental']],
    body: [
      ...areaResults.map(r => [
        safe(r.area),
        r.totalPontos.toFixed(1),
        `${r.totalItems > 0 ? Math.round((r.totalSim / r.totalItems) * 100) : 0}%`,
        safe(r.idadeDesenvLabel),
      ]),
      [{ content: 'MEDIA GERAL', colSpan: 3, styles: { fontStyle: 'bold' as const } }, { content: safe(formatDevAge(mediaGeral)), styles: { fontStyle: 'bold' as const, halign: 'center' as const } }],
    ],
  })
  y = (pdf as any).lastAutoTable.finalY + 6

  // Detalhamento por area e faixa etaria
  y = drawSection(pdf, 'Detalhamento por Area e Faixa Etaria', y)

  for (const r of areaResults) {
    if (y > 245) { pdf.addPage(); y = 16 }

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)
    pdf.text(safe(r.area), 20, y)
    y += 4

    autoTable(pdf, {
      ...BASE_TABLE,
      startY: y,
      columnStyles: {
        1: { halign: 'center' as const },
        2: { halign: 'center' as const },
        3: { halign: 'center' as const },
        4: { halign: 'center' as const },
        5: { halign: 'center' as const },
        6: { halign: 'center' as const },
      },
      head: [['Faixa Etaria', 'Total', 'Sim', 'As vezes', 'Nao', 'Pontos', '% Acertos']],
      body: [
        ...r.groups.map(g => [
          safe(AGE_RANGE_LABEL[g.key] ?? g.label),
          g.total,
          g.sim,
          g.asVezes,
          g.nao,
          g.pontos.toFixed(1),
          `${g.pctAcertos}%`,
        ]),
        [{ content: 'Idade Desenvolvimental', colSpan: 6, styles: { fontStyle: 'bold' as const } }, { content: safe(r.idadeDesenvLabel), styles: { fontStyle: 'bold' as const, halign: 'center' as const } }],
      ],
    })
    y = (pdf as any).lastAutoTable.finalY + 5
  }

  // Analise interpretativa
  if (y > 235) { pdf.addPage(); y = 16 }
  y = drawSection(pdf, 'Analise Interpretativa', y)

  const W = pdf.internal.pageSize.getWidth()
  const analysis1 = safe(`A avaliacao indica idade desenvolvimental media de ${formatDevAge(mediaGeral)}${chronAnos !== null ? `, frente a idade cronologica de ${formatDevAge(chronAnos)}` : ''}. O desempenho mais consolidado observa-se na area de ${strong.area} (${strong.idadeDesenvLabel}), enquanto ${weak.area} (${weak.idadeDesenvLabel}) constitui foco prioritario de intervencao.`)
  const analysis2 = 'Recomenda-se a elaboracao de Plano de Ensino Individualizado (PEI) contemplando as habilidades nao adquiridas e em desenvolvimento, com reavaliacao periodica para monitoramento da progressao.'

  const drawBox = (text: string, startY: number): number => {
    const lines = pdf.splitTextToSize(text, W - 46)
    const bh = lines.length * 4.5 + 6
    pdf.setFillColor(248, 248, 248)
    pdf.setDrawColor(180, 180, 180)
    pdf.setLineWidth(0.3)
    pdf.rect(20, startY, W - 40, bh, 'FD')
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(0, 0, 0)
    pdf.text(lines, 24, startY + 5)
    return startY + bh + 4
  }

  y = drawBox(analysis1, y)
  y = drawBox(analysis2, y)
  y += 2

  // Habilidades nao adquiridas
  if (y > 235) { pdf.addPage(); y = 16 }
  y = drawSection(pdf, 'Habilidades Nao Adquiridas - Alta Prioridade', y)
  if (naoItems.length > 0) {
    autoTable(pdf, {
      ...BASE_TABLE,
      startY: y,
      columnStyles: { 0: { cellWidth: 52 }, 1: { cellWidth: 30 } },
      head: [['Area', 'Faixa Etaria', 'Habilidade']],
      body: naoItems.map(i => [safe(i.area), safe(i.age_range), safe(formatQuestion(i.text))]),
    })
    y = (pdf as any).lastAutoTable.finalY + 6
  } else {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(120, 120, 120)
    pdf.text('Nenhuma habilidade marcada como "Nao".', 20, y + 4)
    y += 10
  }

  // Habilidades em desenvolvimento
  if (y > 235) { pdf.addPage(); y = 16 }
  y = drawSection(pdf, 'Habilidades em Desenvolvimento', y)
  if (avItems.length > 0) {
    autoTable(pdf, {
      ...BASE_TABLE,
      startY: y,
      columnStyles: { 0: { cellWidth: 52 }, 1: { cellWidth: 30 } },
      head: [['Area', 'Faixa Etaria', 'Habilidade']],
      body: avItems.map(i => [safe(i.area), safe(i.age_range), safe(formatQuestion(i.text))]),
    })
    y = (pdf as any).lastAutoTable.finalY + 6
  } else {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(120, 120, 120)
    pdf.text('Nenhuma habilidade marcada como "As vezes".', 20, y + 4)
    y += 10
  }

  // Assinaturas
  if (y > 255) { pdf.addPage(); y = 16 }
  drawSignatures(pdf, y,
    { label: 'Profissional responsavel', sub: 'Assinatura / Registro profissional' },
    { label: 'Responsavel pelo aluno', sub: 'Assinatura' },
  )

  addPageNumbers(pdf)
  pdf.save(`Avaliacao_${safe(studentInfo.name)}_${safe(studentInfo.date)}.pdf`)
}
