import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Assessment } from '../types'
import type { AreaDevResult } from './ageCalc'
import { AGE_RANGE_LABEL } from './ageCalc'

export function exportExcel(assessment: Assessment, areaResults: AreaDevResult[], mediaGeral: number) {
  const wb = XLSX.utils.book_new()
  const { studentInfo, responses } = assessment

  // ── Sheet 1: Cadastro ────────────────────────────────────────────────────
  const info = [
    ['Nome', studentInfo.name],
    ['Data de Nascimento', studentInfo.birthDate],
    ['Idade', studentInfo.age],
    ['Diagnóstico', studentInfo.diagnosis],
    ['Data da Avaliação', studentInfo.date],
  ]
  const wsInfo = XLSX.utils.aoa_to_sheet(info)
  wsInfo['!cols'] = [{ wch: 22 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Cadastro')

  // ── Sheet 2: Resultado por Área ──────────────────────────────────────────
  const statRows: (string | number)[][] = [
    ['Área', 'Faixa Etária', 'Total', 'Sim', 'Às vezes', 'Não', 'Pontos', '% Acertos', 'Meses Desenv.'],
    [],
  ]
  for (const result of areaResults) {
    for (const g of result.groups) {
      statRows.push([
        result.groups.indexOf(g) === 0 ? result.area : '',
        AGE_RANGE_LABEL[g.key] ?? g.label,
        g.total,
        g.sim,
        g.asVezes,
        g.nao,
        parseFloat(g.pontos.toFixed(1)),
        `${g.pctAcertos}%`,
        parseFloat(g.mesesBracket.toFixed(2)),
      ])
    }
    statRows.push([
      result.area,
      'TOTAL / IDADE DESENV.',
      result.totalItems,
      result.totalSim,
      result.totalAv,
      result.totalNao,
      parseFloat(result.totalPontos.toFixed(1)),
      `${Math.round((result.totalSim / result.totalItems) * 100)}%`,
      parseFloat(result.idadeDesenvAnos.toFixed(2)) + ' anos',
    ])
    statRows.push([])
  }
  statRows.push(['MÉDIA GERAL DESENVOLVIMENTAL', '', '', '', '', '', '', '', parseFloat(mediaGeral.toFixed(2)) + ' anos'])

  const wsStats = XLSX.utils.aoa_to_sheet(statRows)
  wsStats['!cols'] = [{ wch: 30 }, { wch: 22 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, wsStats, 'Resultado por Área')

  // ── Sheet 3: Respostas completas ──────────────────────────────────────────
  // Import items inline to avoid circular dep issues in this util
  import('../hooks/usePortageAssessment').then(({ portageItems: items }) => {
    const RESPONSE_LABEL: Record<string, string> = { sim: 'Sim', nao: 'Não', as_vezes: 'Às vezes' }
    const rows: (string | number)[][] = [['Área', 'Faixa Etária', 'Nº', 'Habilidade', 'Resposta']]
    for (const item of items) {
      rows.push([item.area, item.age_range, item.number, item.text, RESPONSE_LABEL[responses[item.id] ?? ''] ?? '—'])
    }
    const wsResp = XLSX.utils.aoa_to_sheet(rows)
    wsResp['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 6 }, { wch: 60 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, wsResp, 'Respostas')

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Avaliacao_Infantil_${studentInfo.name}_${studentInfo.date}.xlsx`)
  })
}
