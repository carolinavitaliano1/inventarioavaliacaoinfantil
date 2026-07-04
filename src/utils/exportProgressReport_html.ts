import type { Patient, Assessment } from '../types'
import { AREAS } from '../types'
import { portageItems } from '../hooks/usePortageAssessment'
import { calcAreaDevResult } from './ageCalc'
import { downloadHtml, downloadPdf } from './exportHelpers'

const AREA_SHORT: Record<string, string> = {
  'I – ÁREA SOCIABILIZAÇÃO': 'Sociabilização',
  'IIa – LINGUAGEM RECEPTIVA': 'Ling. Receptiva',
  'IIb – LINGUAGEM EXPRESSIVA': 'Ling. Expressiva',
  'III – ÁREA CUIDADOS PRÓPRIOS': 'Cuidados Próprios',
  'IV- ÁREA COGNITIVA': 'Cognitiva',
  'V. ÁREA PSICOMOTORA': 'Psicomotora',
}
function short(a: string) { return AREA_SHORT[a] ?? a }

function buildHtml(patient: Patient, assessments: Assessment[]): string {
  const sorted = [...assessments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const emitDate = new Date().toLocaleDateString('pt-BR')

  // Cabeçalho das avaliações
  const avHeaders = sorted.map((a, i) =>
    `<th style="background:#2F64A0;color:#fff;padding:6px 8px;font-size:10.5px">Av. ${i + 1}<br><span style="font-weight:400">${a.studentInfo.date || '—'}</span></th>`
  ).join('')

  // Linhas por área
  const areaRows = AREAS.map(area => {
    const vals = sorted.map(a => {
      const r = calcAreaDevResult(area, portageItems, a.responses)
      return r.idadeDesenvAnos
    })
    const cells = vals.map((v, i) => {
      const prev = i > 0 ? vals[i - 1] : null
      const arrow = prev === null ? '' : v > prev + 0.01 ? ' ↑' : v < prev - 0.01 ? ' ↓' : ' →'
      const color = prev === null ? '#2D3748' : v > prev + 0.01 ? '#276749' : v < prev - 0.01 ? '#c0392b' : '#2F64A0'
      const years = Math.floor(v)
      const months = Math.round((v - years) * 12)
      const label = v === 0 ? '—' : `${years}a ${months}m`
      return `<td style="text-align:center;color:${color};font-weight:600;font-size:11px">${label}${arrow}</td>`
    }).join('')
    return `<tr><td style="font-size:11px;padding:6px 8px">${short(area)}</td>${cells}</tr>`
  }).join('')

  // Média geral por avaliação
  const mediaRows = sorted.map(a => {
    const results = AREAS.map(area => calcAreaDevResult(area, portageItems, a.responses))
    const m = results.reduce((s, r) => s + r.idadeDesenvAnos, 0) / results.length
    const y = Math.floor(m), mo = Math.round((m - y) * 12)
    return `<td style="text-align:center;font-weight:700;font-size:12px;color:#2F64A0;background:#DBE7F5">${y}a ${mo}m</td>`
  }).join('')

  return `<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Acompanhamento — ${patient.name}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Segoe UI',Arial,sans-serif; font-size:12px; color:#2D3748; padding:24px; max-width:900px; margin:0 auto; background:#fff; }
    h1 { font-size:17px; font-weight:700; color:#1A365D; text-align:center; padding-bottom:8px; border-bottom:3px solid #2F64A0; margin-bottom:4px; }
    h2 { font-size:11.5px; font-weight:700; color:#1A365D; background:#DBE7F5; padding:6px 10px; margin:16px 0 8px; border-radius:3px; text-transform:uppercase; letter-spacing:.05em; }
    .subtitle { text-align:center; color:#718096; font-size:11px; margin-bottom:20px; }
    table { width:100%; border-collapse:collapse; margin-bottom:12px; }
    th { background:#2F64A0; color:#fff; text-align:left; padding:6px 8px; font-size:10.5px; }
    td { padding:6px 8px; border-bottom:1px solid #E2E8F0; font-size:11px; vertical-align:top; }
    .label-cell { background:#F1F3F5; font-weight:600; width:28%; }
    .info-box { background:#F0F7FF; border-left:3px solid #2F64A0; padding:10px 14px; margin-bottom:12px; font-size:11px; line-height:1.65; }
    @media print { body { padding:10px; } }
  </style>
  </head><body>

  <h1>RELATÓRIO DE ACOMPANHAMENTO CONTÍNUO</h1>
  <p class="subtitle">Inventário de Avaliação do Desenvolvimento Infantil — IADI · Emitido em ${emitDate}</p>

  <h2>Dados do Paciente</h2>
  <table>
    <tr><td class="label-cell">Nome</td><td>${patient.name}</td><td class="label-cell">Diagnóstico</td><td>${patient.diagnosis || '—'}</td></tr>
    <tr><td class="label-cell">Data de nascimento</td><td>${patient.birthDate || '—'}</td><td class="label-cell">Total de avaliações</td><td>${sorted.length}</td></tr>
  </table>

  <h2>O que é o IADI?</h2>
  <div class="info-box">
    O Inventário de Avaliação do Desenvolvimento Infantil (IADI) avalia habilidades em 5 áreas do desenvolvimento para crianças de 0 a 6 anos, organizadas por faixa etária, gerando uma idade desenvolvimental por área e o acompanhamento da evolução entre avaliações.<br><br>
    <b>↑</b> Evolução · <b>↓</b> Regressão · <b>→</b> Estabilidade
  </div>

  <h2>Evolução da Idade Desenvolvimental por Área</h2>
  <div style="overflow-x:auto">
    <table style="min-width:500px">
      <thead>
        <tr>
          <th style="background:#2F64A0;color:#fff;padding:6px 8px;font-size:10.5px">Área</th>
          ${avHeaders}
        </tr>
      </thead>
      <tbody>
        ${areaRows}
        <tr>
          <td style="background:#DBE7F5;font-weight:700;font-size:11px">Média geral</td>
          ${mediaRows}
        </tr>
      </tbody>
    </table>
  </div>

  ${sorted.map((a, i) => `
    <h2>Avaliação ${i + 1} — ${a.studentInfo.date || '—'}</h2>
    <table>
      <thead><tr><th>Área</th><th>Idade desenvolvimental</th><th>% Acertos</th></tr></thead>
      <tbody>
        ${AREAS.map(area => {
          const r = calcAreaDevResult(area, portageItems, a.responses)
          const y = Math.floor(r.idadeDesenvAnos), m = Math.round((r.idadeDesenvAnos - y) * 12)
          return `<tr><td>${short(area)}</td><td style="color:#2F64A0;font-weight:600">${r.idadeDesenvAnos === 0 ? '—' : `${y}a ${m}m`}</td><td>${Math.round((r.totalSim / r.totalItems) * 100)}%</td></tr>`
        }).join('')}
      </tbody>
    </table>
  `).join('')}

  </body></html>`
}

export function exportProgressHtml(patient: Patient, assessments: Assessment[]) {
  const html = buildHtml(patient, assessments)
  const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
  downloadHtml(html, `Acompanhamento_${patient.name}_${date}.html`)
}

export async function exportProgressPdf(patient: Patient, assessments: Assessment[]) {
  const html = buildHtml(patient, assessments)
  const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
  await downloadPdf(html, `Acompanhamento_${patient.name}_${date}.pdf`)
}
