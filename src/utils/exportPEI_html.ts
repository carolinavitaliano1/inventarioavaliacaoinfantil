import { saveAs } from 'file-saver'
import type { Assessment } from '../types'
import { formatQuestion } from './formatQuestion'

interface PEIItem {
  id: string; skill: string; area: string; ageRange: string
  prazo: 'curto' | 'medio' | 'longo'
  status: 'pendente' | 'em_andamento' | 'concluido'
  estrategias: string
}

const PRAZO_LABEL: Record<string, string> = {
  curto: 'Curto prazo (até 3 meses)',
  medio: 'Médio prazo (até 6 meses)',
  longo: 'Longo prazo (9–12 meses)',
}
const PRAZO_COLOR: Record<string, string> = {
  curto: '#C05621', medio: '#2F64A0', longo: '#276749',
}
const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído',
}
const STATUS_BG: Record<string, string> = {
  pendente: '#F1F3F5', em_andamento: '#DBE7F5', concluido: '#E6F4EE',
}
const STATUS_COLOR: Record<string, string> = {
  pendente: '#718096', em_andamento: '#2F64A0', concluido: '#276749',
}

function rows(items: PEIItem[]): string {
  return items.map(item => `
    <tr>
      <td>${formatQuestion(item.skill)}</td>
      <td>${item.area}</td>
      <td>${item.ageRange}</td>
      <td><span style="background:${STATUS_BG[item.status]};color:${STATUS_COLOR[item.status]};padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600">${STATUS_LABEL[item.status]}</span></td>
    </tr>
    <tr class="strat-row">
      <td colspan="4"><b>Estratégias:</b> ${item.estrategias}</td>
    </tr>
  `).join('')
}

export function exportPEIHtml(assessment: Assessment, plan: PEIItem[]) {
  const { studentInfo } = assessment
  const done = plan.filter(p => p.status === 'concluido').length
  const inProgress = plan.filter(p => p.status === 'em_andamento').length
  const pct = plan.length ? Math.round(done / plan.length * 100) : 0
  const date = studentInfo.date || new Date().toLocaleDateString('pt-BR')

  const grouped: Record<string, PEIItem[]> = { curto: [], medio: [], longo: [] }
  plan.forEach(p => grouped[p.prazo].push(p))

  const prazoSections = (['curto', 'medio', 'longo'] as const)
    .filter(k => grouped[k].length > 0)
    .map(k => `
      <h3 style="color:${PRAZO_COLOR[k]};border-bottom:2px solid ${PRAZO_COLOR[k]};padding-bottom:6px;margin-top:28px">
        ${PRAZO_LABEL[k]}
      </h3>
      <table>
        <thead>
          <tr>
            <th style="width:40%">Habilidade</th>
            <th style="width:28%">Área</th>
            <th style="width:16%">Faixa etária</th>
            <th style="width:16%">Status</th>
          </tr>
        </thead>
        <tbody>${rows(grouped[k])}</tbody>
      </table>
    `).join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PEI — ${studentInfo.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #2D3748; line-height: 1.5; padding: 24px; max-width: 860px; margin: 0 auto; }
  h1 { font-size: 22px; color: #1A365D; text-align: center; padding-bottom: 10px; border-bottom: 3px solid #2F64A0; margin-bottom: 4px; }
  .subtitle { text-align: center; color: #718096; font-size: 13px; margin-bottom: 28px; }
  h2 { font-size: 14px; font-weight: 700; color: #1A365D; background: #DBE7F5; padding: 8px 12px; margin: 24px 0 12px; border-radius: 4px; }
  h3 { font-size: 13px; font-weight: 700; margin-top: 20px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #2F64A0; color: #fff; text-align: left; padding: 8px 10px; font-size: 12px; }
  td { padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; vertical-align: top; }
  tr:nth-child(4n+1) td { background: #F7FAFC; }
  .strat-row td { background: #FAFAFA; color: #4A5568; font-size: 11.5px; padding: 6px 10px 10px; }
  .id-table td { padding: 7px 10px; }
  .id-table td:first-child { background: #F1F3F5; font-weight: 600; width: 30%; }
  .summary-table th { background: #2F64A0; }
  .summary-table td { text-align: center; font-size: 18px; font-weight: 700; }
  .obs-box { border: 1px solid #CBD5E0; border-radius: 6px; padding: 16px; min-height: 80px; margin-bottom: 24px; color: #A0AEC0; font-size: 12px; }
  .sig-row { display: flex; gap: 32px; margin-top: 32px; }
  .sig-cell { flex: 1; border-top: 1.5px solid #2D3748; padding-top: 8px; }
  .sig-cell b { font-size: 12px; }
  .sig-cell span { font-size: 11px; color: #718096; }
  @media print {
    body { padding: 12px; }
    button { display: none; }
  }
</style>
</head>
<body>
<h1>PLANO DE ENSINO INDIVIDUALIZADO — PEI</h1>
<p class="subtitle">Inventário de Avaliação do Desenvolvimento Infantil — IADI</p>

<h2>1. IDENTIFICAÇÃO</h2>
<table class="id-table">
  <tr><td>Nome do aluno</td><td colspan="3">${studentInfo.name}</td></tr>
  <tr>
    <td>Data de nascimento</td><td>${studentInfo.birthDate || '—'}</td>
    <td style="background:#F1F3F5;font-weight:600;width:20%">Idade</td><td>${studentInfo.age || '—'}</td>
  </tr>
  <tr><td>Diagnóstico</td><td colspan="3">${studentInfo.diagnosis || '—'}</td></tr>
  <tr>
    <td>Data do PEI</td><td>${date}</td>
    <td style="background:#F1F3F5;font-weight:600">Profissional</td><td></td>
  </tr>
</table>

<h2>2. SÍNTESE DO PLANO</h2>
<table class="summary-table">
  <thead><tr><th>Total de habilidades</th><th>Concluídas</th><th>Em andamento</th><th>Progresso</th></tr></thead>
  <tbody><tr>
    <td>${plan.length}</td>
    <td style="color:#276749">${done}</td>
    <td style="color:#2F64A0">${inProgress}</td>
    <td>${pct}%</td>
  </tr></tbody>
</table>

<h2>3. HABILIDADES E ESTRATÉGIAS DE INTERVENÇÃO</h2>
${prazoSections}

<h2>4. OBSERVAÇÕES / METAS GERAIS</h2>
<div class="obs-box">Espaço para anotações...</div>

<h2>5. ASSINATURAS</h2>
<div class="sig-row">
  <div class="sig-cell"><b>Profissional responsável</b><br><span>Assinatura / Registro</span></div>
  <div class="sig-cell"><b>Responsável pelo aluno</b><br><span>Assinatura</span></div>
</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, `PEI_${studentInfo.name}_${date}.html`)
}
