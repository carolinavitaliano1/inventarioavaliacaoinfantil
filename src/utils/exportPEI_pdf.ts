import type { Assessment } from '../types'
import { formatQuestion } from './formatQuestion'
import { downloadPdf } from './exportHelpers'

interface PEIItem {
  id: string; skill: string; area: string; ageRange: string
  prazo: 'curto' | 'medio' | 'longo'
  status: 'pendente' | 'em_andamento' | 'concluido'
  estrategias: string
}

const BRAND = '#2F64A0'
const BRAND_LIGHT = '#EBF2FB'
const BRAND_DARK = '#1A365D'

const PRAZO_LABEL: Record<string, string> = {
  curto: 'Curto prazo (até 3 meses)',
  medio: 'Médio prazo (até 6 meses)',
  longo: 'Longo prazo (9–12 meses)',
}
const PRAZO_COLOR: Record<string, string> = {
  curto: '#C05621', medio: BRAND, longo: '#1E6B45',
}
const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído',
}
const STATUS_BG: Record<string, string> = {
  pendente: '#F1F3F5', em_andamento: BRAND_LIGHT, concluido: '#E6F4EE',
}
const STATUS_COLOR: Record<string, string> = {
  pendente: '#718096', em_andamento: BRAND, concluido: '#1E6B45',
}

const PRINT_STYLE = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:210mm;background:#fff;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1A202C;line-height:1.55}
body{padding:18mm 16mm 20mm}
.doc-header{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:3px solid ${BRAND};padding-bottom:10px;margin-bottom:6px}
.doc-title{font-size:15px;font-weight:700;color:${BRAND_DARK};letter-spacing:.03em;text-transform:uppercase}
.doc-sub{font-size:10px;color:#718096;margin-top:3px}
.doc-date{font-size:10px;color:#718096;text-align:right;white-space:nowrap;margin-left:16px}
h2{font-size:10px;font-weight:700;color:${BRAND_DARK};background:${BRAND_LIGHT};padding:5px 10px;margin:16px 0 8px;border-radius:3px;text-transform:uppercase;letter-spacing:.06em;page-break-after:avoid}
table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:10.5px}
thead tr{background:${BRAND};color:#fff}
th{padding:6px 9px;text-align:left;font-weight:600;font-size:10px}
td{padding:5px 9px;border-bottom:1px solid #E2E8F0;vertical-align:top}
tr:nth-child(even) td{background:#F7FAFF}
.label{background:${BRAND_LIGHT};font-weight:600;color:${BRAND_DARK};width:24%}
.prazo-header{font-weight:700;font-size:11px;border-bottom-width:2px;border-bottom-style:solid;padding:8px 0 4px;margin:20px 0 8px}
.chip{display:inline-block;padding:2px 8px;border-radius:12px;font-size:9.5px;font-weight:700}
.strat{font-size:10px;color:#4A5568;background:#FAFAFA;padding:4px 9px 7px;border-bottom:1px solid #E2E8F0}
.summary td{text-align:center;font-size:16px;font-weight:700;padding:10px 9px}
.sig-row{display:flex;gap:32px;margin-top:36px;page-break-inside:avoid}
.sig{flex:1;border-top:1.5px solid #4A5568;padding-top:8px;font-size:10px;color:#4A5568}
@media print{
  html,body{width:100%;padding:0}
  h2{page-break-after:avoid}
  table{page-break-inside:auto}
  tr{page-break-inside:avoid}
  .sig-row{page-break-inside:avoid}
}
`

function buildHtml(assessment: Assessment, plan: PEIItem[]): string {
  const { studentInfo } = assessment
  const done = plan.filter(p => p.status === 'concluido').length
  const inProgress = plan.filter(p => p.status === 'em_andamento').length
  const pct = plan.length ? Math.round(done / plan.length * 100) : 0
  const date = studentInfo.date || new Date().toLocaleDateString('pt-BR')
  const emitDate = new Date().toLocaleDateString('pt-BR')

  const grouped: Record<string, PEIItem[]> = { curto: [], medio: [], longo: [] }
  plan.forEach(p => grouped[p.prazo].push(p))

  const prazoSections = (['curto', 'medio', 'longo'] as const)
    .filter(k => grouped[k].length > 0)
    .map(k => `
      <div class="prazo-header" style="color:${PRAZO_COLOR[k]};border-bottom-color:${PRAZO_COLOR[k]}">${PRAZO_LABEL[k]}</div>
      <table>
        <thead><tr>
          <th style="width:44%">Habilidade</th>
          <th style="width:28%">Área</th>
          <th style="width:14%">Faixa etária</th>
          <th style="width:14%">Status</th>
        </tr></thead>
        <tbody>
          ${grouped[k].map(item => `
            <tr>
              <td>${formatQuestion(item.skill)}</td>
              <td>${item.area}</td>
              <td>${item.ageRange}</td>
              <td><span class="chip" style="background:${STATUS_BG[item.status]};color:${STATUS_COLOR[item.status]}">${STATUS_LABEL[item.status]}</span></td>
            </tr>
            <tr><td colspan="4" class="strat"><b>Estratégias:</b> ${item.estrategias || '—'}</td></tr>
          `).join('')}
        </tbody>
      </table>`).join('')

  return `<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8">
  <title>PEI — ${studentInfo.name}</title>
  <style>${PRINT_STYLE}</style>
  </head><body>

  <div class="doc-header">
    <div>
      <div class="doc-title">Plano de Ensino Individualizado — PEI</div>
      <div class="doc-sub">Inventário de Avaliação do Desenvolvimento Infantil — IADI</div>
    </div>
    <div class="doc-date">Emitido em ${emitDate}</div>
  </div>

  <h2>Identificação</h2>
  <table>
    <tr><td class="label">Nome do aluno</td><td colspan="3">${studentInfo.name}</td></tr>
    <tr><td class="label">Data de Nascimento</td><td>${studentInfo.birthDate || '—'}</td><td class="label">Idade</td><td>${studentInfo.age || '—'}</td></tr>
    <tr><td class="label">Diagnóstico</td><td colspan="3">${studentInfo.diagnosis || '—'}</td></tr>
    <tr><td class="label">Data do PEI</td><td>${date}</td><td class="label">Profissional</td><td></td></tr>
  </table>

  <h2>Síntese do Plano</h2>
  <table>
    <thead><tr>
      <th>Total de habilidades</th>
      <th>Concluídas</th>
      <th>Em andamento</th>
      <th>Progresso</th>
    </tr></thead>
    <tbody><tr class="summary">
      <td>${plan.length}</td>
      <td style="color:#1E6B45">${done}</td>
      <td style="color:${BRAND}">${inProgress}</td>
      <td>${pct}%</td>
    </tr></tbody>
  </table>

  <h2>Habilidades e Estratégias de Intervenção</h2>
  ${prazoSections}

  <h2>Observações / Metas Gerais</h2>
  <div style="border:1px solid #CBD5E0;border-radius:4px;padding:14px;min-height:56px;font-size:10px;color:#A0AEC0">
    Espaço para anotações do profissional…
  </div>

  <div class="sig-row">
    <div class="sig"><b>Profissional responsável</b><br>Assinatura / Registro</div>
    <div class="sig"><b>Responsável pelo aluno</b><br>Assinatura</div>
  </div>

  </body></html>`
}

export async function exportPEIPdf(assessment: Assessment, plan: PEIItem[]) {
  const html = buildHtml(assessment, plan)
  downloadPdf(html, `PEI_${assessment.studentInfo.name}.pdf`)
}
