import type { Assessment } from '../types'
import type { AreaDevResult } from './ageCalc'
import { AGE_RANGE_LABEL, calcAgeMonths, formatDevAge } from './ageCalc'
import { formatQuestion } from './formatQuestion'
import { downloadPdf } from './exportHelpers'

const BRAND = '#2F64A0'
const BRAND_LIGHT = '#EBF2FB'
const BRAND_DARK = '#1A365D'
const POS = '#1E6B45'
const NEG = '#B91C1C'

const PRINT_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:210mm;background:#fff;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1A202C;line-height:1.55}
body{padding:18mm 16mm 20mm}

/* header */
.doc-header{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:3px solid ${BRAND};padding-bottom:10px;margin-bottom:6px}
.doc-title{font-size:15px;font-weight:700;color:${BRAND_DARK};letter-spacing:.03em;text-transform:uppercase}
.doc-sub{font-size:10px;color:#718096;margin-top:3px}
.doc-date{font-size:10px;color:#718096;text-align:right;white-space:nowrap;margin-left:16px}

/* section headings */
h2{font-size:10px;font-weight:700;color:${BRAND_DARK};background:${BRAND_LIGHT};padding:5px 10px;margin:16px 0 8px;border-radius:3px;text-transform:uppercase;letter-spacing:.06em;page-break-after:avoid}

/* tables */
table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:10.5px}
thead tr{background:${BRAND};color:#fff}
th{padding:6px 9px;text-align:left;font-weight:600;font-size:10px}
td{padding:5px 9px;border-bottom:1px solid #E2E8F0;vertical-align:top}
tr:nth-child(even) td{background:#F7FAFF}
.label{background:${BRAND_LIGHT};font-weight:600;width:22%;color:${BRAND_DARK}}
.total td{background:${BRAND_LIGHT};font-weight:700;color:${BRAND_DARK}}
.num{text-align:center}
.accent{color:${BRAND};font-weight:700}
.pos{color:${POS};font-weight:700}
.neg{color:${NEG};font-weight:700}

/* analysis box */
.box{background:#F0F7FF;border-left:3px solid ${BRAND};padding:9px 13px;margin-bottom:9px;font-size:10.5px;line-height:1.7;border-radius:0 4px 4px 0}

/* signature */
.sig-row{display:flex;gap:32px;margin-top:36px;page-break-inside:avoid}
.sig{flex:1;border-top:1.5px solid #4A5568;padding-top:8px;font-size:10px;color:#4A5568}

/* print */
@media print{
  html,body{width:100%;padding:0}
  h2{page-break-after:avoid}
  table{page-break-inside:auto}
  tr{page-break-inside:avoid}
  .box{page-break-inside:avoid}
  .sig-row{page-break-inside:avoid}
}
`

async function buildHtml(assessment: Assessment, areaResults: AreaDevResult[], mediaGeral: number): Promise<string> {
  const { studentInfo, responses } = assessment
  const { portageItems } = await import('../hooks/usePortageAssessment')
  const chronAnos = studentInfo.birthDate ? calcAgeMonths(studentInfo.birthDate) / 12 : null
  const defasagem = chronAnos !== null ? mediaGeral - chronAnos : null
  const ordered = [...areaResults].sort((a, b) => b.idadeDesenvAnos - a.idadeDesenvAnos)
  const strong = ordered[0], weak = ordered[ordered.length - 1]
  const naoItems = portageItems.filter(i => responses[i.id] === 'nao')
  const avItems  = portageItems.filter(i => responses[i.id] === 'as_vezes')
  const emitDate = new Date().toLocaleDateString('pt-BR')

  const areaRows = areaResults.map(r => `
    <tr>
      <td>${r.area}</td>
      <td class="num">${r.totalPontos.toFixed(1)}</td>
      <td class="num">${Math.round((r.totalSim / r.totalItems) * 100)}%</td>
      <td class="num accent">${r.idadeDesenvLabel}</td>
    </tr>`).join('')

  const detalheAreas = areaResults.map(r => `
    <h2 style="margin-top:20px">${r.area}</h2>
    <table>
      <thead><tr>
        <th>Faixa Etária</th><th class="num">Total</th><th class="num">Sim</th>
        <th class="num">Às vezes</th><th class="num">Não</th><th class="num">Pontos</th><th class="num">% Acertos</th>
      </tr></thead>
      <tbody>
        ${r.groups.map(g => `<tr>
          <td>${AGE_RANGE_LABEL[g.key] ?? g.label}</td>
          <td class="num">${g.total}</td>
          <td class="num" style="color:${POS};font-weight:600">${g.sim}</td>
          <td class="num" style="color:#C05621">${g.asVezes}</td>
          <td class="num" style="color:${NEG}">${g.nao}</td>
          <td class="num">${g.pontos.toFixed(1)}</td>
          <td class="num">${g.pctAcertos}%</td>
        </tr>`).join('')}
        <tr class="total">
          <td colspan="6">Idade Desenvolvimental</td>
          <td class="num">${r.idadeDesenvLabel}</td>
        </tr>
      </tbody>
    </table>`).join('')

  const itemRows = (items: typeof naoItems) => items.map(i => `
    <tr>
      <td style="width:28%">${i.area}</td>
      <td style="width:16%">${i.age_range}</td>
      <td>${formatQuestion(i.text)}</td>
    </tr>`).join('')

  const defStyle = defasagem !== null
    ? (defasagem >= 0 ? `class="pos"` : `class="neg"`)
    : ''

  return `<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Relatório — ${studentInfo.name}</title>
  <style>${PRINT_STYLE}</style>
  </head><body>

  <div class="doc-header">
    <div>
      <div class="doc-title">Relatório de Avaliação do Desenvolvimento Infantil</div>
      <div class="doc-sub">Inventário de Avaliação do Desenvolvimento Infantil — IADI</div>
    </div>
    <div class="doc-date">Emitido em ${emitDate}</div>
  </div>

  <h2>Identificação</h2>
  <table>
    <tr><td class="label">Nome</td><td>${studentInfo.name}</td><td class="label">Diagnóstico</td><td>${studentInfo.diagnosis || '—'}</td></tr>
    <tr><td class="label">Data de Nascimento</td><td>${studentInfo.birthDate || '—'}</td><td class="label">Idade na avaliação</td><td>${studentInfo.age || '—'}</td></tr>
    <tr><td class="label">Data da Avaliação</td><td>${studentInfo.date || '—'}</td><td class="label">Instrumento</td><td>IADI — Inventário de Avaliação Infantil</td></tr>
  </table>

  <h2>Síntese do Resultado</h2>
  <table>
    <thead><tr><th>Idade desenvolvimental (média)</th><th>Idade cronológica</th><th>Defasagem</th></tr></thead>
    <tbody><tr>
      <td class="num" style="font-size:15px;font-weight:700;color:${BRAND}">${formatDevAge(mediaGeral)}</td>
      <td class="num">${chronAnos !== null ? formatDevAge(chronAnos) : '—'}</td>
      <td class="num" ${defStyle}>${defasagem !== null ? `${defasagem >= 0 ? '+' : ''}${defasagem.toFixed(2)} anos` : '—'}</td>
    </tr></tbody>
  </table>

  <h2>Resultados por Área</h2>
  <table>
    <thead><tr><th>Área</th><th class="num">Pontos</th><th class="num">% Acertos</th><th class="num">Idade Desenvolvimental</th></tr></thead>
    <tbody>
      ${areaRows}
      <tr class="total"><td colspan="3">MÉDIA GERAL</td><td class="num">${formatDevAge(mediaGeral)}</td></tr>
    </tbody>
  </table>

  <h2>Detalhamento por Área e Faixa Etária</h2>
  ${detalheAreas}

  <h2 style="margin-top:20px">Análise Interpretativa</h2>
  <div class="box">
    A avaliação indica idade desenvolvimental média de <b>${formatDevAge(mediaGeral)}</b>${chronAnos !== null ? `, frente à idade cronológica de <b>${formatDevAge(chronAnos)}</b>` : ''}.
    O desempenho mais consolidado observa-se na área de <b>${strong.area}</b> (${strong.idadeDesenvLabel}),
    enquanto <b>${weak.area}</b> (${weak.idadeDesenvLabel}) constitui foco prioritário de intervenção.
  </div>
  <div class="box">
    Recomenda-se a elaboração de Plano de Ensino Individualizado (PEI) contemplando as habilidades não adquiridas e em desenvolvimento,
    com reavaliação periódica para monitoramento da progressão.
  </div>

  <h2>Habilidades Não Adquiridas — Alta Prioridade</h2>
  ${naoItems.length > 0
    ? `<table><thead><tr><th>Área</th><th>Faixa Etária</th><th>Habilidade</th></tr></thead><tbody>${itemRows(naoItems)}</tbody></table>`
    : `<p style="color:#718096;font-size:10.5px;padding:6px 0">Nenhuma habilidade marcada como "Não".</p>`}

  <h2>Habilidades em Desenvolvimento</h2>
  ${avItems.length > 0
    ? `<table><thead><tr><th>Área</th><th>Faixa Etária</th><th>Habilidade</th></tr></thead><tbody>${itemRows(avItems)}</tbody></table>`
    : `<p style="color:#718096;font-size:10.5px;padding:6px 0">Nenhuma habilidade marcada como "Às vezes".</p>`}

  <div class="sig-row">
    <div class="sig"><b>Profissional responsável</b><br>Assinatura / Registro profissional</div>
    <div class="sig"><b>Data</b><br>&nbsp;</div>
  </div>

  </body></html>`
}

export async function exportWordPdf(assessment: Assessment, areaResults: AreaDevResult[], mediaGeral: number) {
  const html = await buildHtml(assessment, areaResults, mediaGeral)
  downloadPdf(html, `Avaliacao_${assessment.studentInfo.name}_${assessment.studentInfo.date}.pdf`)
}
