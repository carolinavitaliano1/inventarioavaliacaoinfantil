import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Assessment } from '../types'
import { portageItems } from '../hooks/usePortageAssessment'
import { AREAS } from '../types'
import { ageRangeOrder, AGE_RANGE_LABEL } from './ageCalc'

const RESPONSE_LABEL: Record<string, string> = { sim: 'Sim', nao: 'Não', as_vezes: 'Às vezes' }

export function exportExcel(assessment: Assessment) {
  const wb = XLSX.utils.book_new()
  const { studentInfo, responses } = assessment

  // ── Sheet 1: Dados do aluno ──────────────────────────────────────────────
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

  // ── Sheet 2: Respostas completas ─────────────────────────────────────────
  const rows = [['Área', 'Faixa Etária', 'Nº', 'Habilidade', 'Resposta']]
  for (const item of portageItems) {
    rows.push([item.area, item.age_range, item.number, item.text, RESPONSE_LABEL[responses[item.id] ?? ''] ?? '—'])
  }
  const wsResp = XLSX.utils.aoa_to_sheet(rows)
  wsResp['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 6 }, { wch: 60 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, wsResp, 'Respostas')

  // ── Sheet 3: Resultados por Área e Faixa Etária ──────────────────────────
  const statRows: string[][] = [['Área', 'Faixa Etária', 'Total', 'Sim', 'Às vezes', 'Não', '% Acertos', 'Idade Desenvolvimental']]
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
      const group = ageGroups[k]
      const sim = group.filter(i => responses[i.id] === 'sim').length
      const pct = Math.round((sim / group.length) * 100)
      if (pct >= 75) devAge = AGE_RANGE_LABEL[k]
    }
    let first = true
    for (const k of Object.keys(ageGroups).map(Number).sort((a, b) => a - b)) {
      const group = ageGroups[k]
      const sim = group.filter(i => responses[i.id] === 'sim').length
      const av = group.filter(i => responses[i.id] === 'as_vezes').length
      const nao = group.filter(i => responses[i.id] === 'nao').length
      const pct = `${Math.round((sim / group.length) * 100)}%`
      statRows.push([first ? area : '', AGE_RANGE_LABEL[k], String(group.length), String(sim), String(av), String(nao), pct, first ? devAge : ''])
      first = false
    }
  }
  const wsStats = XLSX.utils.aoa_to_sheet(statRows)
  wsStats['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 22 }]
  XLSX.utils.book_append_sheet(wb, wsStats, 'Resultados por Faixa Etária')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Portage_${studentInfo.name}_${studentInfo.date}.xlsx`)
}
