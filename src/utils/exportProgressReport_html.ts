import type { Patient, Assessment } from '../types'
import { AREAS } from '../types'
import { portageItems } from '../hooks/usePortageAssessment'
import { calcAreaDevResult } from './ageCalc'
import { downloadPdf } from './exportHelpers'

const BRAND = '#2F64A0'
const BRAND_LIGHT = '#EBF2FB'
const BRAND_DARK = '#1A365D'

const AREA_SHORT: Record<string, string> = {
  'I – ÁREA SOCIABILIZAÇÃO':      'Sociabilização',
  'IIa – LINGUAGEM RECEPTIVA':    'Ling. Receptiva',
  'IIb – LINGUAGEM EXPRESSIVA':   'Ling. Expressiva',
  'III – ÁREA CUIDADOS PRÓPRIOS': 'Cuidados Próprios',
  'IV- ÁREA COGNITIVA':           'Cognitiva',
  'V. ÁREA PSICOMOTORA':          'Psicomotora',
}
function short(a: string) { return AREA_SHORT[a] ?? a }

const PRINT_STYLE = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1A202C;line-height:1.55;padding:40px 48px;background:#fff;width:794px}
.doc-header{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:3px solid ${BRAND};padding-bottom:10px;margin-bottom:6px}
.doc-title{font-size:15px;font-weight:700;color:${BRAND_DARK};letter-spacing:.03em;text-transform:uppercase}
.doc-sub{font-size:10px;color:#718096;margin-top:3px}
.doc-date{font-size:10px;color:#718096;text-align:right;white-space:nowrap;margin-left:16px}
h2{font-size:10px;font-weight:700;color:${BRAND_DARK};background:${BRAND_LIGHT};padding:5px 10px;margin:16px 0 8px;border-radius:3px;text-transform:uppercase;letter-spacing:.06em}
table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:10.5px}
thead tr{background:${BRAND};color:#fff}
th{padding:6px 9px;text-align:left;font-weight:600;font-size:10px}
td{padding:5px 9px;border-bottom:1px solid #E2E8F0;vertical-align:middle}
tr:nth-child(even) td{background:#F7FAFF}
.label{background:${BRAND_LIGHT};font-weight:600;color:${BRAND_DARK}}
.num{text-align:center;font-size:12px;font-weight:700}
.total td{background:${BRAND_LIGHT};font-weight:700;color:${BRAND_DARK};text-align:center}
.box{background:#F0F7FF;border-left:3px solid ${BRAND};padding:9px 13px;margin-bottom:9px;font-size:10.5px;line-height:1.7;border-radius:0 4px 4px 0}
`

function buildHtml(patient: Patient, assessments: Assessment[]): string {
  const sorted = [...assessments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const emitDate = new Date().toLocaleDateString('pt-BR')

  const avHeaders = sorted.map((a, i) =>
    `<th style="text-align:center">Av. ${i + 1}<br><span style="font-weight:400;font-size:9px">${a.studentInfo.date || '—'}</span></th>`
  ).join('')

  const areaRows = AREAS.map(area => {
    const vals = sorted.map(a => {
      const items = portageItems.filter(pi => pi.area === area)
      const r = calcAreaDevResult(area, items as any, a.responses as any)
      return r.idadeDesenvAnos
    })
    const cells = vals.map((v, i) => {
      const prev = i > 0 ? vals[i - 1] : null
      const arrow = prev === null ? '' : v > prev + 0.01 ? ' ↑' : v < prev - 0.01 ? ' ↓' : ' →'
      const color = prev === null ? '#2D3748' : v > prev + 0.01 ? '#1E6B45' : v < prev - 0.01 ? '#B91C1C' : BRAND
      const y = Math.floor(v), m = Math.round((v - y) * 12)
      const label = v === 0 ? '—' : `${y}a ${m}m`
      return `<td style="text-align:center;color:${color};font-weight:700;font-size:12px">${label}${arrow}</td>`
    }).join('')
    return `<tr><td>${short(area)}</td>${cells}</tr>`
  }).join('')

  const mediaRows = sorted.map(a => {
    const results = AREAS.map(area => {
      const items = portageItems.filter(pi => pi.area === area)
      return calcAreaDevResult(area, items as any, a.responses as any)
    })
    const m = results.reduce((s, r) => s + r.idadeDesenvAnos, 0) / results.length
    const y = Math.floor(m), mo = Math.round((m - y) * 12)
    return `<td style="text-align:center;font-weight:700;color:${BRAND};font-size:13px;background:${BRAND_LIGHT}">${y}a ${mo}m</td>`
  }).join('')

  const avDetail = sorted.map((a, i) => {
    const areaRows2 = AREAS.map(area => {
      const items = portageItems.filter(pi => pi.area === area)
      const r = calcAreaDevResult(area, items as any, a.responses as any)
      const y = Math.floor(r.idadeDesenvAnos), m = Math.round((r.idadeDesenvAnos - y) * 12)
      const pct = r.totalItems > 0 ? Math.round((r.totalSim / r.totalItems) * 100) : 0
      return `<tr>
        <td>${short(area)}</td>
        <td style="text-align:center;color:${BRAND};font-weight:700">${r.idadeDesenvAnos === 0 ? '—' : `${y}a ${m}m`}</td>
        <td style="text-align:center">${pct}%</td>
      </tr>`
    }).join('')
    return `
    <h2 style="margin-top:20px">Avaliação ${i + 1} — ${a.studentInfo.date || '—'}</h2>
    <table>
      <thead><tr><th>Área</th><th style="text-align:center">Idade Desenvolvimental</th><th style="text-align:center">% Acertos</th></tr></thead>
      <tbody>${areaRows2}</tbody>
    </table>`
  }).join('')

  return `<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8">
  <title>Acompanhamento — ${patient.name}</title>
  <style>${PRINT_STYLE}</style>
  </head><body>

  <div class="doc-header">
    <div>
      <div class="doc-title">Relatório de Acompanhamento Contínuo</div>
      <div class="doc-sub">Inventário de Avaliação do Desenvolvimento Infantil — IADI</div>
    </div>
    <div class="doc-date">Emitido em ${emitDate}</div>
  </div>

  <h2>Dados do Paciente</h2>
  <table>
    <tr><td class="label">Nome</td><td>${patient.name}</td><td class="label">Diagnóstico</td><td>${patient.diagnosis || '—'}</td></tr>
    <tr><td class="label">Data de Nascimento</td><td>${patient.birthDate || '—'}</td><td class="label">Total de avaliações</td><td>${sorted.length}</td></tr>
  </table>

  <div class="box">
    <b>↑</b> Evolução &nbsp;·&nbsp; <b>↓</b> Regressão &nbsp;·&nbsp; <b>→</b> Estabilidade em relação à avaliação anterior.
  </div>

  <h2>Evolução da Idade Desenvolvimental por Área</h2>
  <div style="overflow-x:auto">
    <table style="min-width:420px">
      <thead>
        <tr>
          <th>Área</th>
          ${avHeaders}
        </tr>
      </thead>
      <tbody>
        ${areaRows}
        <tr class="total">
          <td style="text-align:left;background:${BRAND_LIGHT};font-weight:700;color:${BRAND_DARK}">Média geral</td>
          ${mediaRows}
        </tr>
      </tbody>
    </table>
  </div>

  ${avDetail}

  </body></html>`
}

export function exportProgressPdf(patient: Patient, assessments: Assessment[]) {
  const html = buildHtml(patient, assessments)
  downloadPdf(html, `Acompanhamento_${patient.name}.pdf`)
}
