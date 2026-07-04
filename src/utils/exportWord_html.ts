import type { Assessment } from '../types'
import type { AreaDevResult } from './ageCalc'
import { AGE_RANGE_LABEL, calcAgeMonths, formatDevAge } from './ageCalc'
import { formatQuestion } from './formatQuestion'
import { C, drawHeader, drawSection } from './exportHelpers'

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

  let y = drawHeader(pdf, 'Relatório de Avaliação do Desenvolvimento Infantil',
    'Inventário de Avaliação do Desenvolvimento Infantil — IADI')

  // ── Identificação ──────────────────────────────────────────────────────
  y = drawSection(pdf, 'Identificação', y)
  autoTable(pdf, {
    startY: y, margin: { left: 14, right: 14 }, theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: C.ink },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: C.brandLight, textColor: C.brandDark, cellWidth: 40 }, 2: { fontStyle: 'bold', fillColor: C.brandLight, textColor: C.brandDark, cellWidth: 40 } },
    body: [
      ['Nome', studentInfo.name, 'Diagnóstico', studentInfo.diagnosis || '—'],
      ['Data de Nascimento', studentInfo.birthDate || '—', 'Idade na avaliação', studentInfo.age || '—'],
      ['Data da Avaliação', studentInfo.date || '—', 'Instrumento', 'IADI'],
    ],
  })
  y = (pdf as any).lastAutoTable.finalY + 6

  // ── Síntese ────────────────────────────────────────────────────────────
  y = drawSection(pdf, 'Síntese do Resultado', y)
  autoTable(pdf, {
    startY: y, margin: { left: 14, right: 14 }, theme: 'grid',
    headStyles: { fillColor: C.brand, textColor: C.white, fontSize: 8, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 11, cellPadding: 4, halign: 'center', fontStyle: 'bold' },
    head: [['Idade desenvolvimental (média)', 'Idade cronológica', 'Defasagem']],
    body: [[
      formatDevAge(mediaGeral),
      chronAnos !== null ? formatDevAge(chronAnos) : '—',
      defasagem !== null ? `${defasagem >= 0 ? '+' : ''}${defasagem.toFixed(2)} anos` : '—',
    ]],
    didParseCell(data) {
      if (data.section === 'body') {
        if (data.column.index === 0) data.cell.styles.textColor = C.brand
        if (data.column.index === 2 && defasagem !== null)
          data.cell.styles.textColor = defasagem >= 0 ? C.pos : C.neg
      }
    },
  })
  y = (pdf as any).lastAutoTable.finalY + 6

  // ── Resultados por área ────────────────────────────────────────────────
  y = drawSection(pdf, 'Resultados por Área', y)
  autoTable(pdf, {
    startY: y, margin: { left: 14, right: 14 }, theme: 'striped',
    headStyles: { fillColor: C.brand, textColor: C.white, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.8, textColor: C.ink },
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center', fontStyle: 'bold', textColor: C.brand } },
    head: [['Área', 'Pontos', '% Acertos', 'Idade Desenvolvimental']],
    body: [
      ...areaResults.map(r => [r.area, r.totalPontos.toFixed(1), `${Math.round((r.totalSim / r.totalItems) * 100)}%`, r.idadeDesenvLabel]),
      ['MÉDIA GERAL', '', '', formatDevAge(mediaGeral)],
    ],
    didParseCell(data) {
      if (data.section === 'body' && data.row.index === areaResults.length) {
        data.cell.styles.fillColor = C.brandLight
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.textColor = C.brandDark
      }
    },
  })
  y = (pdf as any).lastAutoTable.finalY + 6

  // ── Detalhamento por área ──────────────────────────────────────────────
  y = drawSection(pdf, 'Detalhamento por Área e Faixa Etária', y)

  for (const r of areaResults) {
    if (y > 240) { pdf.addPage(); y = 16 }
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8.5)
    pdf.setTextColor(...C.brand)
    pdf.text(r.area, 14, y)
    y += 4

    autoTable(pdf, {
      startY: y, margin: { left: 14, right: 14 }, theme: 'striped',
      headStyles: { fillColor: C.brand, textColor: C.white, fontSize: 7.5, fontStyle: 'bold' },
      styles: { fontSize: 7.5, cellPadding: 2, textColor: C.ink },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center', textColor: C.pos as any }, 3: { halign: 'center', textColor: [192, 86, 33] as any }, 4: { halign: 'center', textColor: C.neg as any }, 5: { halign: 'center' }, 6: { halign: 'center' } },
      head: [['Faixa Etária', 'Total', 'Sim', 'Às vezes', 'Não', 'Pontos', '% Acertos']],
      body: [
        ...r.groups.map(g => [AGE_RANGE_LABEL[g.key] ?? g.label, g.total, g.sim, g.asVezes, g.nao, g.pontos.toFixed(1), `${g.pctAcertos}%`]),
        [{ content: 'Idade Desenvolvimental', colSpan: 6, styles: { fillColor: C.brandLight, fontStyle: 'bold', textColor: C.brandDark } }, { content: r.idadeDesenvLabel, styles: { fillColor: C.brandLight, fontStyle: 'bold', textColor: C.brandDark, halign: 'center' } }],
      ],
    })
    y = (pdf as any).lastAutoTable.finalY + 5
  }

  // ── Análise interpretativa ─────────────────────────────────────────────
  if (y > 230) { pdf.addPage(); y = 16 }
  y = drawSection(pdf, 'Análise Interpretativa', y)

  const W = pdf.internal.pageSize.getWidth()
  const analysis1 = `A avaliação indica idade desenvolvimental média de ${formatDevAge(mediaGeral)}${chronAnos !== null ? `, frente à idade cronológica de ${formatDevAge(chronAnos)}` : ''}. O desempenho mais consolidado observa-se na área de ${strong.area} (${strong.idadeDesenvLabel}), enquanto ${weak.area} (${weak.idadeDesenvLabel}) constitui foco prioritário de intervenção.`
  const analysis2 = 'Recomenda-se a elaboração de Plano de Ensino Individualizado (PEI) contemplando as habilidades não adquiridas e em desenvolvimento, com reavaliação periódica para monitoramento da progressão.'

  pdf.setFillColor(...C.brandLight)
  pdf.setDrawColor(...C.brand)
  pdf.setLineWidth(0.8)

  const drawBox = (text: string, startY: number) => {
    const lines = pdf.splitTextToSize(text, W - 34)
    const bh = lines.length * 4 + 6
    pdf.rect(14, startY, 1.5, bh, 'F')
    pdf.setFillColor(240, 247, 255)
    pdf.rect(15.5, startY, W - 29.5, bh, 'F')
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)
    pdf.setTextColor(...C.ink)
    pdf.text(lines, 19, startY + 5)
    return startY + bh + 4
  }

  y = drawBox(analysis1, y)
  y = drawBox(analysis2, y)
  y += 2

  // ── Habilidades não adquiridas ─────────────────────────────────────────
  if (y > 230) { pdf.addPage(); y = 16 }
  y = drawSection(pdf, 'Habilidades Não Adquiridas — Alta Prioridade', y)
  if (naoItems.length > 0) {
    autoTable(pdf, {
      startY: y, margin: { left: 14, right: 14 }, theme: 'striped',
      headStyles: { fillColor: C.brand, textColor: C.white, fontSize: 7.5, fontStyle: 'bold' },
      styles: { fontSize: 7.5, cellPadding: 2.2, textColor: C.ink, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 48 }, 1: { cellWidth: 28 } },
      head: [['Área', 'Faixa Etária', 'Habilidade']],
      body: naoItems.map(i => [i.area, i.age_range, formatQuestion(i.text)]),
    })
    y = (pdf as any).lastAutoTable.finalY + 6
  } else {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(...C.gray)
    pdf.text('Nenhuma habilidade marcada como "Não".', 14, y + 4)
    y += 10
  }

  // ── Habilidades em desenvolvimento ─────────────────────────────────────
  if (y > 230) { pdf.addPage(); y = 16 }
  y = drawSection(pdf, 'Habilidades em Desenvolvimento', y)
  if (avItems.length > 0) {
    autoTable(pdf, {
      startY: y, margin: { left: 14, right: 14 }, theme: 'striped',
      headStyles: { fillColor: C.brand, textColor: C.white, fontSize: 7.5, fontStyle: 'bold' },
      styles: { fontSize: 7.5, cellPadding: 2.2, textColor: C.ink, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 48 }, 1: { cellWidth: 28 } },
      head: [['Área', 'Faixa Etária', 'Habilidade']],
      body: avItems.map(i => [i.area, i.age_range, formatQuestion(i.text)]),
    })
    y = (pdf as any).lastAutoTable.finalY + 6
  } else {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(...C.gray)
    pdf.text('Nenhuma habilidade marcada como "Às vezes".', 14, y + 4)
    y += 10
  }

  // ── Assinaturas ────────────────────────────────────────────────────────
  if (y > 260) { pdf.addPage(); y = 16 }
  const midX = W / 2
  pdf.setDrawColor(...C.ink); pdf.setLineWidth(0.4)
  pdf.line(14, y + 16, midX - 8, y + 16)
  pdf.line(midX + 8, y + 16, W - 14, y + 16)
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); pdf.setTextColor(...C.ink)
  pdf.text('Profissional responsável', 14, y + 20)
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(...C.gray)
  pdf.text('Assinatura / Registro profissional', 14, y + 24)

  pdf.save(`Avaliacao_${studentInfo.name}_${studentInfo.date}.pdf`)
}
