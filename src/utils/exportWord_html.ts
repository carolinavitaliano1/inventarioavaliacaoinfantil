import type { Assessment } from '../types'
import type { AreaDevResult } from './ageCalc'
import { AGE_RANGE_LABEL, calcAgeMonths, formatDevAge } from './ageCalc'
import { formatQuestion } from './formatQuestion'
import { downloadHtml, downloadPdf } from './exportHelpers'

const BASE_STYLE = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #2D3748; line-height: 1.5; padding: 24px; max-width: 900px; margin: 0 auto; background: #fff; }
h1 { font-size: 18px; font-weight: 700; color: #1A365D; text-align: center; padding-bottom: 8px; border-bottom: 3px solid #2F64A0; margin-bottom: 4px; }
.subtitle { text-align: center; color: #718096; font-size: 11px; margin-bottom: 20px; }
h2 { font-size: 12px; font-weight: 700; color: #1A365D; background: #DBE7F5; padding: 6px 10px; margin: 18px 0 8px; border-radius: 3px; text-transform: uppercase; letter-spacing: .05em; }
h3 { font-size: 11.5px; font-weight: 700; color: #2F64A0; margin: 14px 0 6px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
th { background: #2F64A0; color: #fff; text-align: left; padding: 6px 8px; font-size: 10.5px; font-weight: 700; }
td { padding: 6px 8px; border-bottom: 1px solid #E2E8F0; font-size: 11px; vertical-align: top; }
.label-cell { background: #F1F3F5; font-weight: 600; width: 22%; }
.total-row td { background: #DBE7F5; font-weight: 700; color: #1A365D; }
.analysis { background: #F7FAFC; border-left: 3px solid #2F64A0; padding: 10px 14px; margin-bottom: 12px; font-size: 11.5px; line-height: 1.6; }
.sig { border-top: 1.5px solid #2D3748; padding-top: 8px; margin-top: 40px; width: 48%; display: inline-block; }
@media print { body { padding: 10px; } }
`

async function buildHtml(assessment: Assessment, areaResults: AreaDevResult[], mediaGeral: number): Promise<string> {
  const { studentInfo, responses } = assessment
  const { portageItems } = await import('../hooks/usePortageAssessment')
  const chronAnos = studentInfo.birthDate ? calcAgeMonths(studentInfo.birthDate) / 12 : null
  const defasagem = chronAnos !== null ? mediaGeral - chronAnos : null
  const ordered = [...areaResults].sort((a, b) => b.idadeDesenvAnos - a.idadeDesenvAnos)
  const strong = ordered[0], weak = ordered[ordered.length - 1]
  const naoItems = portageItems.filter(i => responses[i.id] === 'nao')
  const avItems = portageItems.filter(i => responses[i.id] === 'as_vezes')

  const areaRows = areaResults.map(r => `
    <tr>
      <td>${r.area}</td>
      <td style="text-align:center">${r.totalPontos.toFixed(1)}</td>
      <td style="text-align:center">${Math.round((r.totalSim / r.totalItems) * 100)}%</td>
      <td style="text-align:center;font-weight:700;color:#2F64A0">${r.idadeDesenvLabel}</td>
    </tr>
  `).join('')

  const detalheAreas = areaResults.map(r => `
    <h3>${r.area}</h3>
    <table>
      <thead><tr>
        <th>Faixa Etária</th><th>Total</th><th>Sim</th><th>Às vezes</th><th>Não</th><th>Pontos</th><th>% Acertos</th>
      </tr></thead>
      <tbody>
        ${r.groups.map(g => `<tr>
          <td>${AGE_RANGE_LABEL[g.key] ?? g.label}</td>
          <td style="text-align:center">${g.total}</td>
          <td style="text-align:center;color:#276749;font-weight:600">${g.sim}</td>
          <td style="text-align:center;color:#C05621">${g.asVezes}</td>
          <td style="text-align:center;color:#c0392b">${g.nao}</td>
          <td style="text-align:center">${g.pontos.toFixed(1)}</td>
          <td style="text-align:center">${g.pctAcertos}%</td>
        </tr>`).join('')}
        <tr class="total-row">
          <td colspan="6">Idade Desenvolvimental</td>
          <td style="text-align:center">${r.idadeDesenvLabel}</td>
        </tr>
      </tbody>
    </table>
  `).join('')

  const itemRows = (items: typeof naoItems) => items.map(i => `
    <tr>
      <td style="width:30%">${i.area}</td>
      <td style="width:18%">${i.age_range}</td>
      <td>${formatQuestion(i.text)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Relatório — ${studentInfo.name}</title>
  <style>${BASE_STYLE}</style></head><body>

  <h1>RELATÓRIO DE AVALIAÇÃO DO DESENVOLVIMENTO INFANTIL</h1>
  <p class="subtitle">Inventário de Avaliação Infantil — IADI</p>

  <h2>Identificação</h2>
  <table>
    <tr><td class="label-cell">Nome</td><td>${studentInfo.name}</td><td class="label-cell">Diagnóstico</td><td>${studentInfo.diagnosis || '—'}</td></tr>
    <tr><td class="label-cell">Data de Nascimento</td><td>${studentInfo.birthDate}</td><td class="label-cell">Idade</td><td>${studentInfo.age}</td></tr>
    <tr><td class="label-cell">Data da Avaliação</td><td>${studentInfo.date}</td><td class="label-cell">Instrumento</td><td>Inventário de Avaliação Infantil</td></tr>
  </table>

  <h2>Síntese do Resultado</h2>
  <table>
    <thead><tr><th>Idade desenvolvimental (média)</th><th>Idade cronológica</th><th>Defasagem</th></tr></thead>
    <tbody><tr>
      <td style="text-align:center;font-weight:700;font-size:14px;color:#2F64A0">${formatDevAge(mediaGeral)}</td>
      <td style="text-align:center">${chronAnos !== null ? formatDevAge(chronAnos) : '—'}</td>
      <td style="text-align:center;font-weight:700;color:${defasagem !== null && defasagem >= 0 ? '#276749' : '#c0392b'}">${defasagem !== null ? `${defasagem >= 0 ? '+' : ''}${defasagem.toFixed(2)} anos` : '—'}</td>
    </tr></tbody>
  </table>

  <h2>Resultados por Área</h2>
  <table>
    <thead><tr><th>Área</th><th>Pontos Total</th><th>% Acertos</th><th>Idade Desenvolvimental</th></tr></thead>
    <tbody>
      ${areaRows}
      <tr class="total-row"><td colspan="3">MÉDIA GERAL</td><td style="text-align:center">${mediaGeral.toFixed(2)} anos</td></tr>
    </tbody>
  </table>

  <h2>Detalhamento por Área e Faixa Etária</h2>
  ${detalheAreas}

  <h2>Análise Interpretativa</h2>
  <div class="analysis">
    A avaliação indica idade desenvolvimental média de ${formatDevAge(mediaGeral)}${chronAnos !== null ? `, frente à idade cronológica de ${formatDevAge(chronAnos)}` : ''}.
    O desempenho mais consolidado observa-se na área de <b>${strong.area}</b> (${strong.idadeDesenvLabel}),
    enquanto a área de <b>${weak.area}</b> (${weak.idadeDesenvLabel}) demanda maior atenção e constitui foco prioritário de intervenção.
  </div>
  <div class="analysis">
    Recomenda-se a elaboração de Plano de Ensino Individualizado (PEI) contemplando as habilidades não adquiridas e em desenvolvimento, com reavaliação periódica para monitoramento da progressão.
  </div>

  <h2>Habilidades Não Adquiridas (Alta Prioridade)</h2>
  ${naoItems.length > 0 ? `<table><thead><tr><th>Área</th><th>Faixa Etária</th><th>Habilidade</th></tr></thead><tbody>${itemRows(naoItems)}</tbody></table>` : '<p style="color:#718096;font-size:11px">Nenhuma habilidade marcada como "Não".</p>'}

  <h2>Habilidades em Desenvolvimento</h2>
  ${avItems.length > 0 ? `<table><thead><tr><th>Área</th><th>Faixa Etária</th><th>Habilidade</th></tr></thead><tbody>${itemRows(avItems)}</tbody></table>` : '<p style="color:#718096;font-size:11px">Nenhuma habilidade marcada como "Às vezes".</p>'}

  <div style="margin-top:40px;display:flex;gap:40px">
    <div class="sig"><b>Profissional responsável</b><br><span style="font-size:10px;color:#718096">Assinatura / Registro profissional</span></div>
  </div>
  </body></html>`
}

export async function exportWordHtml(assessment: Assessment, areaResults: AreaDevResult[], mediaGeral: number) {
  const html = await buildHtml(assessment, areaResults, mediaGeral)
  const { studentInfo } = assessment
  downloadHtml(html, `Avaliacao_${studentInfo.name}_${studentInfo.date}.html`)
}

export async function exportWordPdf(assessment: Assessment, areaResults: AreaDevResult[], mediaGeral: number) {
  const html = await buildHtml(assessment, areaResults, mediaGeral)
  const { studentInfo } = assessment
  await downloadPdf(html, `Avaliacao_${studentInfo.name}_${studentInfo.date}.pdf`)
}
