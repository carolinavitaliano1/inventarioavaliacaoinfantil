import { useState, useEffect, useRef } from 'react'

interface Props { onGetStarted: () => void; onLogin?: () => void }

/* ── static data ─────────────────────────────────────────────────────── */

const BARS = [
  { label: 'Socialização',     w: 82, h: 224, val: '4a 1m'  },
  { label: 'Ling. Receptiva',  w: 58, h: 190, val: '2a 11m' },
  { label: 'Ling. Expressiva', w: 64, h: 210, val: '3a 2m'  },
  { label: 'Cuidados Próp.',   w: 88, h: 150, val: '4a 5m'  },
  { label: 'Cognição',         w: 71, h: 40,  val: '3a 7m'  },
  { label: 'Psicomotora',      w: 78, h: 6,   val: '3a 11m' },
]

const PROBLEMS = [
  {
    title: 'Cálculos à mão',
    desc: 'Somar pontos, cruzar com tabelas de referência, converter em idade desenvolvimental por área — tudo feito em planilha, sujeito a erro e retrabalho.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    title: 'Evolução difícil de mostrar',
    desc: 'Comparar avaliações ao longo do tempo e apresentar gráficos de progresso à família raramente é simples quando os dados ficam em arquivos separados.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18M18 9l-5 5-3-3-3 3"/>
      </svg>
    ),
  },
  {
    title: 'Relatórios do zero',
    desc: 'Montar o laudo, formatar tabelas, inserir gráficos, revisar texto — horas que poderiam ser de atendimento, supervisão ou simplesmente descanso.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
  },
]

const SZ = { width: 21, height: 21, fill: 'none' as const, stroke: 'currentColor', strokeWidth: 2 as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24' }

const FEATURES = [
  {
    title: '6 áreas · 589 habilidades',
    desc: 'Inventário de Avaliação do Desenvolvimento Infantil completo — Socialização, Linguagem Receptiva, Linguagem Expressiva, Cuidados, Cognição e Psicomotora, de 0 a 6 anos.',
    icon: <svg {...SZ}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  },
  {
    title: 'Idade desenvolvimental automática',
    desc: 'O sistema calcula a idade de desenvolvimento em cada área com base nas respostas — sem fórmulas manuais, sem planilha.',
    icon: <svg {...SZ}><path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"/></svg>,
  },
  {
    title: 'Evolução entre avaliações',
    desc: 'Compare aplicações ao longo do tempo em gráficos de linha. Mostre em segundos quanto a criança evoluiu desde a última avaliação.',
    icon: <svg {...SZ}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  },
  {
    title: 'Relatório em Word em 1 clique',
    desc: 'Laudo interpretativo com síntese, detalhamento por área e análise gerado automaticamente. Editável, pronto para entregar.',
    icon: <svg {...SZ}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>,
  },
  {
    title: 'Plano de Ensino Individualizado',
    desc: 'Selecione habilidades prioritárias e gere o PEI com metas por prazo, estratégias de intervenção e acompanhamento de status.',
    icon: <svg {...SZ}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/></svg>,
  },
  {
    title: 'Gráficos para download em PNG',
    desc: 'Radar do perfil desenvolvimental, curvas de progressão por área e distribuição de aquisição — baixe em PNG para apresentações.',
    icon: <svg {...SZ}><path d="M3 3v18h18M18 9l-5 5-3-3-3 3"/></svg>,
  },
  {
    title: 'Dados por profissional',
    desc: 'Cada conta acessa apenas os seus pacientes, com histórico completo de avaliações. Privado, organizado, acessível de qualquer navegador.',
    icon: <svg {...SZ}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    title: 'Sem instalação, sem configuração',
    desc: 'Funciona no navegador, no computador ou tablet. Abra, entre com seu login e comece a avaliar — sem downloads, sem setup.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>,
  },
]

const STEPS = [
  { title: 'Cadastre a criança', desc: 'Nome, data de nascimento, diagnóstico. A idade cronológica é calculada automaticamente.' },
  { title: 'Aplique o inventário', desc: 'Responda os 589 itens por área e faixa etária, no seu ritmo e forma habitual de trabalho.' },
  { title: 'Veja os resultados', desc: 'Idade desenvolvimental por área, gráficos, habilidades prioritárias e comparativo com a idade cronológica.' },
  { title: 'Exporte e planeje', desc: 'Gere o relatório em Word, baixe os gráficos em PNG e monte o PEI com metas e estratégias.' },
]

const PROFILES = [
  {
    role: 'Fonoaudióloga',
    context: 'Clínica de linguagem · consultório próprio',
    desc: 'Aplica o inventário a cada avaliação e usa os gráficos de Linguagem Receptiva e Expressiva para mostrar à família a curva de evolução mês a mês. O relatório Word sai em minutos.',
    color: 'hsl(190 56% 42%)',
    bg: 'hsl(190 55% 96%)',
  },
  {
    role: 'Terapeuta Ocupacional',
    context: 'Equipe multidisciplinar · atendimento domiciliar',
    desc: 'Avalia as 6 áreas na admissão e gera o relatório para enviar à escola e ao neuropediatra. Usa o PEI para alinhar metas com os outros terapeutas da equipe.',
    color: 'hsl(224 56% 45%)',
    bg: 'hsl(224 55% 96%)',
  },
  {
    role: 'Psicopedagoga',
    context: 'Consultório particular · atendimento infantil',
    desc: 'Estrutura o plano de intervenção com o PEI e acompanha quais metas foram concluídas ao longo dos meses. A evolução documentada fortalece o trabalho com a família.',
    color: 'hsl(150 48% 37%)',
    bg: 'hsl(150 48% 95%)',
  },
]

const FAQS = [
  { q: 'Qual instrumento o IADI usa?', a: 'O Inventário de Avaliação do Desenvolvimento Infantil, com 589 habilidades em 6 áreas: Socialização, Linguagem Receptiva, Linguagem Expressiva, Cuidados Próprios, Cognição e Psicomotora, do nascimento aos 6 anos. O instrumento é baseado no Inventário Portage de Desenvolvimento (referência bibliográfica: Bluma et al., 1976; Williams & Aiello, 2001).' },
  { q: 'Para quais profissionais o IADI é indicado?', a: 'Para todos que atuam com desenvolvimento infantil: psicólogos, fonoaudiólogos, terapeutas ocupacionais, fisioterapeutas, pedagogos e psicopedagogos, em consultório, clínica ou escola.' },
  { q: 'Preciso instalar algo?', a: 'Não. Funciona direto no navegador, no computador ou tablet. Acesse com seu login de qualquer lugar.' },
  { q: 'Qual a diferença entre os planos?', a: 'Os recursos são idênticos. O trimestral (R$ 37 a cada 3 meses) é ótimo para começar; o anual (R$ 87 por ano, ~R$ 7,25/mês) sai mais barato e reduz o número de renovações.' },
  { q: 'Os dados dos pacientes ficam seguros?', a: 'Sim. Cada conta acessa apenas os próprios pacientes. Nenhuma informação é compartilhada entre profissionais.' },
  { q: 'Posso cancelar quando quiser?', a: 'Sim. Não há fidelidade nem taxa de cancelamento. Você cancela pela plataforma de pagamento quando quiser, sem precisar entrar em contato.' },
]

/* ── CSS string injected as <style> ──────────────────────────────────── */
const ANIM_CSS = `
  @keyframes barFill {
    from { width: 0 }
    to   { width: var(--bar-w) }
  }
  @keyframes floatY {
    0%,100% { transform: translateY(0) }
    50%     { transform: translateY(-7px) }
  }
  @keyframes floatY2 {
    0%,100% { transform: translateY(0) }
    50%     { transform: translateY(6px) }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px) }
    to   { opacity: 1; transform: translateY(0) }
  }
  @keyframes heroIn {
    from { opacity: 0; transform: translateY(16px) }
    to   { opacity: 1; transform: translateY(0) }
  }
  @keyframes ctaGlow {
    0%,100% { box-shadow: 0 2px 12px hsl(214 56% 40% / .32) }
    50%     { box-shadow: 0 4px 22px hsl(214 56% 40% / .55) }
  }
  .lp-reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1);
  }
  .lp-reveal.lp-in { opacity: 1; transform: none }
  .lp-reveal-d1 { transition-delay: .08s }
  .lp-reveal-d2 { transition-delay: .16s }
  .lp-reveal-d3 { transition-delay: .24s }
  .lp-hero-h { animation: heroIn .7s cubic-bezier(.22,1,.36,1) both }
  .lp-hero-sub { animation: heroIn .7s .14s cubic-bezier(.22,1,.36,1) both }
  .lp-hero-cta { animation: heroIn .7s .26s cubic-bezier(.22,1,.36,1) both }
  .lp-hero-trust { animation: heroIn .7s .38s cubic-bezier(.22,1,.36,1) both }
  .lp-mock { animation: heroIn .8s .1s cubic-bezier(.22,1,.36,1) both }
  .lp-float-1 { animation: floatY 3.4s ease-in-out infinite }
  .lp-float-2 { animation: floatY2 4s .6s ease-in-out infinite }
  .lp-bar {
    height: 100%;
    border-radius: 99px;
    animation: barFill .9s cubic-bezier(.22,1,.36,1) both;
  }
  .lp-bar-0 { animation-delay: .55s }
  .lp-bar-1 { animation-delay: .65s }
  .lp-bar-2 { animation-delay: .73s }
  .lp-bar-3 { animation-delay: .81s }
  .lp-bar-4 { animation-delay: .89s }
  .lp-bar-5 { animation-delay: .97s }
  .lp-btn-primary {
    display: inline-flex; align-items: center; gap: 9px;
    font-family: inherit; font-weight: 600; font-size: 15px;
    padding: 14px 26px; border-radius: 9px;
    border: none; cursor: pointer;
    background: var(--primary); color: #fff;
    animation: ctaGlow 2.6s 1.2s ease-in-out infinite;
    transition: transform .15s, opacity .15s;
  }
  .lp-btn-primary:hover { transform: translateY(-1px); opacity: .92 }
  .lp-btn-primary:active { transform: none; opacity: 1 }
  .lp-btn-primary-lg {
    font-size: 16px; padding: 16px 32px; border-radius: 10px;
  }
  .lp-btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: inherit; font-weight: 500; font-size: 14.5px;
    padding: 13px 24px; border-radius: 9px;
    border: 1px solid var(--line-2); cursor: pointer;
    background: var(--surface); color: var(--ink);
    transition: border-color .15s, background .15s;
    text-decoration: none;
  }
  .lp-btn-ghost:hover { background: var(--surface-2); border-color: var(--line) }
  .lp-feat-card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 13px;
    padding: 22px 20px;
    transition: border-color .18s, box-shadow .18s, transform .18s;
  }
  .lp-feat-card:hover {
    border-color: var(--primary-line);
    box-shadow: 0 4px 22px hsl(214 56% 40% / .09);
    transform: translateY(-2px);
  }
  .lp-step-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; font-weight: 600;
    letter-spacing: .09em; text-transform: uppercase;
    color: var(--primary-ink); background: var(--primary-bg);
    border: 1px solid var(--primary-line);
    border-radius: 6px; padding: 4px 9px;
    display: inline-block; margin-bottom: 14px;
  }
  .lp-profile-card {
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 26px 24px;
    background: var(--surface);
    transition: border-color .2s, box-shadow .2s;
  }
  .lp-profile-card:hover {
    border-color: var(--primary-line);
    box-shadow: 0 6px 24px hsl(214 56% 40% / .09);
  }
  .lp-price-card {
    border-radius: 18px; padding: 32px 28px;
    transition: transform .2s, box-shadow .2s;
  }
  .lp-price-card:hover { transform: translateY(-3px) }
  .lp-faq-answer {
    max-height: 0; overflow: hidden;
    transition: max-height .3s cubic-bezier(.22,1,.36,1);
  }
  .lp-faq-answer.open { max-height: 200px }
  .lp-nav-link {
    font-size: 14px; color: var(--ink-2); font-weight: 500;
    text-decoration: none; transition: color .15s;
    white-space: nowrap;
  }
  .lp-nav-link:hover { color: var(--ink) }
  /* ── Carrossel de relatórios ─────────────────────────────────────── */
  .lp-carousel-track {
    display: flex;
    transition: transform .45s cubic-bezier(.22,1,.36,1);
  }
  .lp-carousel-slide {
    flex: 0 0 100%;
    width: 100%;
  }
  .lp-carousel-btn {
    width: 44px; height: 44px; border-radius: 50%;
    border: 1px solid var(--line-2); background: var(--surface);
    color: var(--ink-2); cursor: pointer;
    display: grid; place-items: center;
    transition: border-color .15s, background .15s, color .15s;
    flex-shrink: 0;
  }
  .lp-carousel-btn:hover { border-color: var(--primary-line); background: var(--primary-bg); color: var(--primary-ink); }
  .lp-carousel-dot {
    width: 8px; height: 8px; border-radius: 99px;
    border: none; cursor: pointer; padding: 0;
    background: var(--line-2);
    transition: background .2s, width .2s;
  }
  .lp-carousel-dot.active { background: var(--primary); width: 22px; }

  @media (prefers-reduced-motion: reduce) {
    .lp-reveal, .lp-feat-card, .lp-profile-card, .lp-price-card { transition: none }
    .lp-float-1, .lp-float-2, .lp-btn-primary { animation: none }
    .lp-bar { animation: none; width: var(--bar-w) }
    .lp-hero-h, .lp-hero-sub, .lp-hero-cta, .lp-hero-trust, .lp-mock { animation: none; opacity: 1 }
  }
`

/* ── helpers ─────────────────────────────────────────────────────────── */
const w: React.CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }
const eyebrow: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em',
  color: 'var(--primary-ink)',
  background: 'var(--primary-bg)',
  border: '1px solid var(--primary-line)',
  borderRadius: 99, padding: '4px 12px',
  marginBottom: 16,
}
const CHECK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--pos)' }}>
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)
const ARROW = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const CHEV = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
)

/* ── ReportCarousel ──────────────────────────────────────────────────── */
const REPORTS = [
  {
    type: 'Relatório de Avaliação',
    icon: '📋',
    patient: 'Lucas · 4 anos e 8 meses · TEA',
    date: '02/07/2026',
    color: 'hsl(214 56% 45%)',
    colorBg: 'hsl(214 56% 96%)',
    sections: [
      {
        title: 'SÍNTESE DO RESULTADO',
        rows: [
          ['Idade desenvolvimental (média)', '3 meses'],
          ['Idade cronológica', '4 anos e 9 meses'],
          ['Defasagem', '-4,49 anos'],
        ],
      },
      {
        title: 'RESULTADOS POR ÁREA',
        rows: [
          ['I – Sociabilização', '0%', '0 meses'],
          ['IIa – Ling. Receptiva', '5%', '7 meses'],
          ['IIb – Ling. Expressiva', '11%', '1 ano'],
          ['III – Cuidados Próprios', '0%', '0 meses'],
          ['IV – Cognitiva', '0%', '0 meses'],
          ['V – Psicomotora', '0%', '0 meses'],
        ],
        headers: ['Área', '% Acertos', 'Idade Desenv.'],
      },
    ],
  },
  {
    type: 'PEI — Plano de Ensino Individualizado',
    icon: '📝',
    patient: 'Lucas · 4 anos e 8 meses · TEA',
    date: '02/07/2026',
    color: 'hsl(150 48% 37%)',
    colorBg: 'hsl(150 45% 95%)',
    sections: [
      {
        title: 'SÍNTESE DO PLANO',
        rows: [
          ['Total de habilidades', '2'],
          ['Concluídas', '0'],
          ['Em andamento', '1'],
          ['Progresso geral', '0%'],
        ],
      },
      {
        title: 'HABILIDADES — MÉDIO PRAZO (até 6 meses)',
        items: [
          { hab: 'A criança arrulha e sussurra quando contente?', area: 'IIa – Ling. Receptiva', status: 'Em andamento', strat: 'Estimule a compreensão através de instruções simples, apontamento e rotinas previsíveis.' },
          { hab: 'A criança repete os próprios sons?', area: 'IIa – Ling. Receptiva', status: 'Pendente', strat: 'Use imitação de sons e turnos comunicativos para estimular a produção vocal.' },
        ],
      },
    ],
  },
  {
    type: 'Relatório de Acompanhamento Contínuo',
    icon: '📈',
    patient: 'Lucas · TEA',
    date: '03/07/2026',
    color: 'hsl(36 78% 44%)',
    colorBg: 'hsl(40 85% 94%)',
    sections: [
      {
        title: 'PROGRESSÃO ENTRE AVALIAÇÕES',
        rows: [
          ['Ling. Receptiva', '3 meses → 7 meses', '↑ +0,35a'],
          ['Ling. Expressiva', '6 meses → 12 meses', '↑ +0,42a'],
          ['Socialização', '0 meses → 0 meses', '→ estável'],
          ['Cuidados Próprios', '0 meses → 0 meses', '→ estável'],
          ['Cognitiva', '0 meses → 0 meses', '→ estável'],
          ['Psicomotora', '0 meses → 0 meses', '→ estável'],
        ],
        headers: ['Área', 'Av.1 → Av.2', 'Variação'],
      },
      {
        title: 'LEGENDA',
        rows: [
          ['↑', 'Evolução — novas habilidades desenvolvidas'],
          ['→', 'Estabilidade — resultado semelhante à avaliação anterior'],
          ['↓', 'Regressão — possível perda ou maior rigor'],
        ],
      },
    ],
  },
  {
    type: 'PEI — Plano de Ensino Individualizado',
    icon: '📝',
    patient: 'Liz · 15 anos e 8 meses · TEA',
    date: '03/07/2026',
    color: 'hsl(280 45% 45%)',
    colorBg: 'hsl(280 45% 95%)',
    sections: [
      {
        title: 'SÍNTESE DO PLANO',
        rows: [
          ['Total de habilidades', '14'],
          ['Concluídas', '0'],
          ['Em andamento', '1'],
          ['Progresso geral', '0%'],
        ],
      },
      {
        title: 'HABILIDADES — CURTO PRAZO (até 3 meses)',
        items: [
          { hab: 'A criança segura e examina o objeto oferecido pela mãe por um minuto?', area: 'I – Sociabilização', status: 'Pendente', strat: 'Utilize situações naturais de brincadeira e rotina para estimular as habilidades sociais.' },
        ],
      },
    ],
  },
]

function ReportCarousel() {
  const [idx, setIdx] = useState(0)
  const total = REPORTS.length
  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)

  return (
    <section style={{ padding: '88px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div style={{ ...{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' } }}>
        <div className="lp-reveal" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
          <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--primary-ink)', background: 'var(--primary-bg)', border: '1px solid var(--primary-line)', borderRadius: 99, padding: '4px 12px', marginBottom: 16 }}>Relatórios reais</span>
          <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px', textWrap: 'balance' as never }}>Veja os documentos gerados</h2>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0 }}>O IADI gera relatórios profissionais com um clique — prontos para compartilhar com a família ou equipe.</p>
        </div>

        {/* carrossel */}
        <div style={{ position: 'relative' }}>
          {/* setas sobrepostas nas laterais */}
          <button className="lp-carousel-btn" onClick={prev} aria-label="Anterior"
            style={{ position: 'absolute', left: -22, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button className="lp-carousel-btn" onClick={next} aria-label="Próximo"
            style={{ position: 'absolute', right: -22, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* slide container */}
          <div style={{ overflow: 'hidden', borderRadius: 18, margin: '0 12px' }}>
            <div className="lp-carousel-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
              {REPORTS.map((rep, i) => (
                <div key={i} className="lp-carousel-slide">
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 32px hsl(220 25% 20% / .08)' }}>
                    {/* header do documento */}
                    <div style={{ background: rep.colorBg, borderBottom: `1px solid ${rep.color}22`, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' as const }}>
                      <div style={{ fontSize: 28 }}>{rep.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.08em', color: rep.color, marginBottom: 3 }}>{rep.type}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Inventário de Avaliação do Desenvolvimento Infantil — IADI</div>
                      </div>
                      <div style={{ textAlign: 'right' as const }}>
                        <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 2 }}>Paciente</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{rep.patient}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{rep.date}</div>
                      </div>
                    </div>

                    {/* conteúdo em 2 colunas */}
                    <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                      {rep.sections.map((sec, si) => (
                        <div key={si}>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: rep.color, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${rep.color}33` }}>{sec.title}</div>
                          {'items' in sec && sec.items ? (
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                              {sec.items.map((item, ii) => (
                                <div key={ii} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--line)' }}>
                                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, lineHeight: 1.4 }}>{item.hab}</div>
                                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' as const }}>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: rep.color, background: rep.colorBg, padding: '2px 8px', borderRadius: 99 }}>{item.area}</span>
                                    <span style={{ fontSize: 10, color: 'var(--ink-4)', background: 'var(--surface)', border: '1px solid var(--line)', padding: '2px 8px', borderRadius: 99 }}>{item.status}</span>
                                  </div>
                                  <div style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.5 }}>💡 {item.strat}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              {'headers' in sec && sec.headers ? (
                                <div style={{ display: 'grid', gridTemplateColumns: sec.headers.length === 3 ? '2fr 1fr 1fr' : '1fr 1fr', gap: 0, marginBottom: 4 }}>
                                  {sec.headers.map((h: string) => (
                                    <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase' as const, letterSpacing: '.06em', padding: '0 0 6px' }}>{h}</div>
                                  ))}
                                </div>
                              ) : null}
                              {(sec.rows || []).map((row, ri) => (
                                <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'headers' in sec && sec.headers?.length === 3 ? '2fr 1fr 1fr' : '1fr 1fr', gap: 0, padding: '7px 0', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
                                  <div style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>{row[0]}</div>
                                  <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600 }}>{row[1]}</div>
                                  {row[2] && <div style={{ fontSize: 12, color: row[2].startsWith('↑') ? 'var(--pos)' : row[2].startsWith('↓') ? 'var(--neg)' : 'var(--ink-3)', fontWeight: 600 }}>{row[2]}</div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* rodapé */}
                    <div style={{ padding: '12px 28px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Gerado automaticamente pelo IADI · inventarioavaliacaoinfantil.vercel.app</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: rep.color }}>{rep.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* controles — apenas pontos */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, alignItems: 'center' }}>
            {REPORTS.map((_, i) => (
              <button key={i} className={`lp-carousel-dot${i === idx ? ' active' : ''}`} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--ink-4)' }}>{idx + 1} de {total}</div>
        </div>
      </div>
    </section>
  )
}

/* ── component ───────────────────────────────────────────────────────── */
export default function LandingPage({ onGetStarted, onLogin }: Props) {
  const [openFaq, setOpenFaq] = useState(-1)
  const statsRef = useRef<HTMLDivElement>(null)
  const countDoneRef = useRef(false)
  const [statVals, setStatVals] = useState({ h: 0, r: 0 })

  useEffect(() => {
    // scroll reveals
    const els = document.querySelectorAll('.lp-reveal')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-in'); io.unobserve(e.target) } }),
      { threshold: 0.12 },
    )
    els.forEach(el => io.observe(el))

    // counter animation
    const cio = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting || countDoneRef.current) return
        countDoneRef.current = true
        const dur = 1100
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setStatVals({ h: Math.round(ease * 589), r: Math.round(ease * 6) })
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    if (statsRef.current) cio.observe(statsRef.current)

    return () => { io.disconnect(); cio.disconnect() }
  }, [])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: "'IBM Plex Sans', system-ui, sans-serif", lineHeight: 1.6, overflowX: 'hidden' }}>
      <style>{ANIM_CSS}</style>

      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'hsl(220 22% 98% / .88)', backdropFilter: 'saturate(1.6) blur(16px)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ ...w, display: 'flex', alignItems: 'center', gap: 18, height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: 'inset 0 1px 0 hsl(0 0% 100%/.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', lineHeight: 1.1 }}>IADI</div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.02em', lineHeight: 1.2 }}>Desenvolvimento Infantil</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 26, marginLeft: 16, flex: 1 }}>
            {[['#recursos','Recursos'],['#como','Como funciona'],['#planos','Planos'],['#faq','Dúvidas']].map(([h,l]) => (
              <a key={h} href={h} className="lp-nav-link">{l}</a>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={onLogin ?? onGetStarted} className="lp-btn-ghost" style={{ fontSize: 13.5, padding: '9px 18px' }}>Entrar</button>
            <button onClick={onGetStarted} className="lp-btn-primary" style={{ padding: '10px 20px' }}>3 dias grátis {ARROW}</button>
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 0 96px' }}>
        {/* background blobs */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, hsl(214 80% 90% / .55) 0%, transparent 68%)', filter: 'blur(2px)' }} />
          <div style={{ position: 'absolute', bottom: '-25%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, hsl(190 60% 88% / .4) 0%, transparent 65%)', filter: 'blur(2px)' }} />
        </div>

        <div style={{ ...w, position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52, alignItems: 'center' }}>
          {/* copy */}
          <div>
            <div className="lp-hero-h">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--primary-ink)', background: 'var(--primary-bg)', border: '1px solid var(--primary-line)', borderRadius: 99, padding: '5px 13px', marginBottom: 22 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--primary)', display: 'inline-block' }} />
                Inventário de Avaliação do Desenvolvimento Infantil · 0 a 6 anos
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.08, margin: 0, color: 'var(--ink)' }}>
                Do questionário<br />
                <span style={{ fontWeight: 700 }}>ao relatório.</span>
              </h1>
            </div>
            <p className="lp-hero-sub" style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 20, lineHeight: 1.6, maxWidth: '36ch' }}>
              Aplique o inventário, veja a idade desenvolvimental por área em segundos e gere um laudo profissional — sem planilhas, sem cálculos manuais.
            </p>
            <div className="lp-hero-cta" style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={onGetStarted} className="lp-btn-primary lp-btn-primary-lg">
                Testar grátis por 3 dias {ARROW}
              </button>
              <a href="#como" className="lp-btn-ghost">Ver como funciona</a>
            </div>
            <div className="lp-hero-trust" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, fontSize: 13, color: 'var(--ink-3)' }}>
              {CHECK}
              3 dias grátis · depois a partir de{' '}
              <strong style={{ color: 'var(--ink-2)', margin: '0 2px' }}>R$ 7,25/mês</strong>
              · cancele quando quiser
            </div>
          </div>

          {/* mock */}
          <div style={{ position: 'relative' }} className="lp-mock">
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, boxShadow: '0 28px 64px hsl(220 35% 22% / .14), 0 8px 20px hsl(220 30% 30% / .06)', overflow: 'hidden' }}>
              {/* titlebar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 14px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                {[1,2,3].map(i => <span key={i} style={{ width: 9, height: 9, borderRadius: 99, background: i === 1 ? 'hsl(6 60% 72%)' : i === 2 ? 'hsl(40 75% 70%)' : 'hsl(150 45% 65%)', display: 'block' }} />)}
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-3)', fontFamily: "'IBM Plex Mono', monospace" }}>iadi · resultados · Lívia · 4a 11m</span>
              </div>
              <div style={{ padding: '18px 20px' }}>
                {/* headline row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 2 }}>Idade desenvolvimental · média</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--primary-ink)' }}>
                      3,82 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink-3)' }}>anos</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'hsl(150 48% 37%)', background: 'hsl(150 45% 95%)', border: '1px solid hsl(150 40% 87%)', padding: '3px 9px', borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
                    ↑ +0,42 anos
                  </div>
                </div>
                {/* separator */}
                <div style={{ height: 1, background: 'var(--line)', margin: '13px 0' }} />
                {/* bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {BARS.map((b, i) => (
                    <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 40px', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 500 }}>{b.label}</span>
                      <span style={{ height: 7, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden', display: 'block' }}>
                        <span
                          className={`lp-bar lp-bar-${i}`}
                          style={{ '--bar-w': `${b.w}%`, background: `hsl(${b.h} 46% 47%)` } as React.CSSProperties}
                        />
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600, textAlign: 'right', color: `hsl(${b.h} 48% 38%)` }}>{b.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* floating badge 1: evolução */}
            <div className="lp-float-1" style={{ position: 'absolute', top: -20, right: -22, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 12px 32px hsl(220 35% 22% / .14)', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'hsl(150 45% 95%)', color: 'hsl(150 48% 37%)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Evolução</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, color: 'hsl(150 48% 37%)' }}>+0,42 ano</div>
              </div>
            </div>

            {/* floating badge 2: relatório */}
            <div className="lp-float-2" style={{ position: 'absolute', bottom: -22, left: -24, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 12px 32px hsl(220 35% 22% / .14)', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-bg)', color: 'var(--primary-ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Relatório Word</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Gerado em 1 clique</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────── */}
      <div ref={statsRef} style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={{ ...w, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { n: statVals.r || '—', suffix: '', label: 'áreas de desenvolvimento' },
            { n: '0–6', suffix: '', label: 'anos de idade' },
            { n: statVals.h || '—', suffix: '', label: 'habilidades mapeadas' },
            { n: '< 5', suffix: ' min', label: 'para gerar um relatório' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '26px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--primary-ink)', lineHeight: 1 }}>
                {s.n}<span style={{ fontSize: 18 }}>{s.suffix}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ───────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 0' }}>
        <div style={w}>
          <div className="lp-reveal" style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 52px' }}>
            <span style={eyebrow}>O trabalho manual custa caro</span>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 16px', textWrap: 'balance' as never }}>
              Avaliar desenvolvimento não precisa ser exaustivo
            </h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0 }}>Aplicar o inventário é só o começo. O que vem depois — calcular, interpretar, documentar — é onde se perde tempo.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {PROBLEMS.map((p, i) => (
              <div key={p.title} className={`lp-reveal lp-reveal-d${i + 1}`} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 13, padding: 26 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'hsl(6 60% 96%)', color: 'hsl(6 58% 46%)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                  {p.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 10px' }}>{p.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>

          {/* before / after */}
          <div className="lp-reveal" style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '28px 30px', background: 'hsl(6 40% 98%)', borderRight: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--neg)', display: 'inline-block' }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--neg)' }}>Antes do IADI</span>
              </div>
              {['Aplicar o questionário no papel ou planilha', 'Somar pontos manualmente por área', 'Calcular e conferir a idade desenvolvimental', 'Montar o relatório do zero no Word', 'Formatar tabelas e gráficos à mão', 'Arquivar tudo espalhado em pastas'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10, fontSize: 14, color: 'hsl(6 40% 38%)' }}>
                  <span style={{ marginTop: 3, flexShrink: 0, color: 'var(--neg)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </span>
                  {t}
                </div>
              ))}
            </div>
            <div style={{ padding: '28px 30px', background: 'hsl(150 30% 98%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--pos)', display: 'inline-block' }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--pos)' }}>Com o IADI</span>
              </div>
              {['Responder os itens direto no sistema', 'Idade desenvolvimental calculada automaticamente', 'Gráficos de perfil e evolução gerados na hora', 'Relatório Word completo com 1 clique', 'PEI com metas e estratégias estruturadas', 'Todos os pacientes e históricos organizados'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10, fontSize: 14, color: 'hsl(150 40% 28%)' }}>
                  <span style={{ marginTop: 3, flexShrink: 0, color: 'var(--pos)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section id="recursos" style={{ padding: '84px 0', background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={w}>
          <div className="lp-reveal" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
            <span style={eyebrow}>Tudo em um só lugar</span>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px', textWrap: 'balance' as never }}>O que o IADI faz por você</h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0 }}>Da aplicação ao plano de intervenção — um fluxo pensado para a prática clínica.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`lp-feat-card lp-reveal lp-reveal-d${(i % 3) + 1}`}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary-bg)', color: 'var(--primary-ink)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: 1.2 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: 0, lineHeight: 1.58 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="como" style={{ padding: '88px 0' }}>
        <div style={w}>
          <div className="lp-reveal" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 56px' }}>
            <span style={eyebrow}>Simples do início ao fim</span>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px', textWrap: 'balance' as never }}>Como funciona</h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0 }}>Quatro passos entre cadastrar a criança e ter o relatório na mão.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
            {/* connector line */}
            <div aria-hidden style={{ position: 'absolute', top: 20, left: '12.5%', right: '12.5%', height: 1, background: 'linear-gradient(90deg, var(--primary-line), var(--primary-line) 70%, transparent)', zIndex: 0 }} />
            {STEPS.map((s, i) => (
              <div key={s.title} className={`lp-reveal lp-reveal-d${i % 3 + 1}`} style={{ padding: '0 20px 0 0', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: 99, background: 'var(--primary)', color: '#fff', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 15, display: 'grid', placeItems: 'center', marginBottom: 20, boxShadow: '0 2px 12px hsl(214 56% 40% / .3)' }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 9px', lineHeight: 1.2 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA entre seções */}
      <div style={{ textAlign: 'center', padding: '32px 24px', borderTop: '1px solid var(--line)' }}>
        <a href="#planos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 15, padding: '13px 28px', borderRadius: 99, textDecoration: 'none', boxShadow: '0 4px 16px hsl(220 80% 50% / .22)', transition: 'opacity .15s' }} onMouseOver={e => (e.currentTarget.style.opacity='.88')} onMouseOut={e => (e.currentTarget.style.opacity='1')}>
          Conheça nossos planos →
        </a>
      </div>

      {/* ── CARROSSEL DE RELATÓRIOS ───────────────────────────────────── */}
      <ReportCarousel />

      {/* CTA após carrossel */}
      <div style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <a href="#planos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 15, padding: '13px 28px', borderRadius: 99, textDecoration: 'none', boxShadow: '0 4px 16px hsl(220 80% 50% / .22)', transition: 'opacity .15s' }} onMouseOver={e => (e.currentTarget.style.opacity='.88')} onMouseOut={e => (e.currentTarget.style.opacity='1')}>
          Conheça nossos planos →
        </a>
      </div>

      {/* ── GALERIA / SCREENSHOTS ─────────────────────────────────────── */}
      <section style={{ padding: '88px 0', background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={w}>
          <div className="lp-reveal" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
            <span style={eyebrow}>Veja por dentro</span>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px', textWrap: 'balance' as never }}>O app na prática</h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0 }}>Cada tela foi pensada para economizar tempo e entregar clareza clínica.</p>
          </div>

          {/* Grade de cards — mockups SVG fiéis ao app */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

            {/* Card 1 — Painel clínico */}
            <div className="lp-reveal" style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px hsl(220 25% 20% / .07)', background: 'var(--bg)' }}>
              <div style={{ background: '#f8f9fb', borderBottom: '1px solid var(--line)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'monospace' }}>inventarioavaliacaoinfantil.vercel.app</span>
              </div>
              <div style={{ padding: 20 }}>
                {/* Topbar mock */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Painel clínico</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Acompanhe avaliações e a evolução de cada criança.</div>
                  </div>
                  <div style={{ background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: 8, padding: '5px 10px' }}>+ Novo paciente</div>
                </div>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                  {[['2','PACIENTES'],['21','AVALIAÇÕES'],['1','ACOMP.'],['7','ESTE MÊS']].map(([n, l]) => (
                    <div key={l} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{n}</div>
                      <div style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.04em' }}>{l}</div>
                    </div>
                  ))}
                </div>
                {/* Patient list */}
                {[['Lucas','4a 8m · TEA','0a 3m','-4.5a'],['Liz','15a 8m · TEA','0a 1m','-15.7a']].map(([name, sub, dev, gap]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{sub}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{dev}</div>
                      <div style={{ fontSize: 10, color: '#e03' }}>{gap}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 20px 14px', fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>Painel clínico — visão geral dos pacientes</div>
            </div>

            {/* Card 2 — Síntese por área */}
            <div className="lp-reveal lp-reveal-d1" style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px hsl(220 25% 20% / .07)', background: 'var(--bg)' }}>
              <div style={{ background: '#f8f9fb', borderBottom: '1px solid var(--line)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Desempenho por área e faixa etária</div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 14 }}>% de aquisição · verde ≥ 75% · âmbar 50–74% · vermelho &lt; 50%</div>
                {[
                  ['I – Socialização', '#4c7ef3', '0%','0%','0%','0%','0%','0%','0 meses'],
                  ['IIa – Ling. Receptiva', '#20b8a0', '18%','0%','0%','0%','0%','0%','7 meses'],
                  ['IIb – Ling. Expressiva', '#7c5cbf', '92%','0%','0%','0%','0%','0%','1 ano'],
                  ['III – Cuidados', '#2da44e', '0%','0%','0%','0%','0%','0%','0 meses'],
                  ['IV – Cognitiva', '#e09b00', '0%','0%','0%','0%','0%','0%','0 meses'],
                  ['V – Psicomotora', '#c0392b', '0%','0%','0%','0%','0%','0%','0 meses'],
                ].map(([area, color, v1, , , , , , dev]) => (
                  <div key={area} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '1px solid var(--line)', fontSize: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1, color: 'var(--ink)', fontWeight: 500 }}>{area}</div>
                    <div style={{ color: parseFloat(v1) >= 75 ? '#2da44e' : parseFloat(v1) >= 50 ? '#e09b00' : parseFloat(v1) > 0 ? '#c0392b' : 'var(--ink-4)', fontWeight: 600, width: 28, textAlign: 'right' }}>{v1}</div>
                    <div style={{ color: 'var(--primary)', fontWeight: 600, width: 40, textAlign: 'right' }}>{dev}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 20px 14px', fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>Síntese — resultado por área e faixa etária</div>
            </div>

            {/* Card 3 — Progressão */}
            <div className="lp-reveal lp-reveal-d2" style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px hsl(220 25% 20% / .07)', background: 'var(--bg)' }}>
              <div style={{ background: '#f8f9fb', borderBottom: '1px solid var(--line)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Idade desenvolvimental por área</div>
                {[
                  ['Social',         '0a 0m','0a 0m','— +0.00a', 'neutral'],
                  ['Ling. Rec.',     '0a 3m','0a 7m','↑ +0.35a', 'pos'],
                  ['Ling. Exp.',     '0a 6m','0a 12m','↑ +0.42a','pos'],
                  ['Cuidados',       '0a 0m','0a 0m','— +0.00a', 'neutral'],
                  ['Cognitiva',      '0a 0m','0a 0m','— +0.00a', 'neutral'],
                  ['Psicomotora',    '0a 0m','0a 0m','— +0.00a', 'neutral'],
                  ['Média geral',    '0a 2m','0a 3m','↑ +0.13a', 'pos'],
                ].map(([area, av1, av2, var_, type]) => (
                  <div key={area} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', gap: 4, padding: '5px 0', borderBottom: '1px solid var(--line)', fontSize: 10, alignItems: 'center' }}>
                    <div style={{ color: type === 'pos' ? 'var(--primary)' : 'var(--ink)', fontWeight: type === 'pos' ? 700 : 400 }}>{area}</div>
                    <div style={{ color: 'var(--ink-3)' }}>{av1}</div>
                    <div style={{ color: type === 'pos' ? 'var(--primary)' : 'var(--ink-3)' }}>{av2}</div>
                    <div style={{ color: type === 'pos' ? '#2da44e' : 'var(--ink-4)', fontWeight: 600, textAlign: 'right' }}>{var_}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 20px 14px', fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>Progressão — evolução entre avaliações</div>
            </div>

            {/* Card 4 — Prioridades */}
            <div className="lp-reveal lp-reveal-d3" style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px hsl(220 25% 20% / .07)', background: 'var(--bg)' }}>
              <div style={{ background: '#f8f9fb', borderBottom: '1px solid var(--line)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#e09b00', marginBottom: 10, letterSpacing: '0.06em' }}>EM DESENVOLVIMENTO — ÀS VEZES · 15</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', padding: '6px 10px', background: 'hsl(214 56% 95%)', borderRadius: 6, marginBottom: 10 }}>IIa – LINGUAGEM RECEPTIVA</div>
                {[
                  'A criança arrulha e sussurra quando contente?',
                  'A criança repete os próprios sons?',
                  'A criança ri?',
                  'A criança mostra reconhecimento de seu meio, por meio de sorriso ou parando de chorar?',
                  'A criança sorri em resposta à atenção dada pelo adulto?',
                ].map((q, i) => (
                  <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink)', lineHeight: 1.4 }}>{q}</div>
                    <div style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 2, letterSpacing: '0.06em' }}>IDADE 0 A 1 ANO</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 20px 14px', fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>Prioridades — habilidades em desenvolvimento</div>
            </div>

            {/* Card 5 — Gráfico Evolução por área (largo, ocupa 2 colunas) */}
            <div className="lp-reveal lp-reveal-d1" style={{ gridColumn: 'span 2', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px hsl(220 25% 20% / .07)', background: 'var(--bg)' }}>
              <div style={{ background: '#f8f9fb', borderBottom: '1px solid var(--line)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Gráfico 1 — Evolução por área */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Evolução por área</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 12 }}>Idade desenvolvimental (anos) em cada avaliação</div>
                  <svg viewBox="0 0 320 160" width="100%" style={{ display: 'block' }}>
                    {/* Grid lines */}
                    {[0,40,80,120,160].map((y, i) => (
                      <g key={y}>
                        <line x1="40" y1={y + 4} x2="310" y2={y + 4} stroke="var(--line)" strokeDasharray="4 4" strokeWidth="1" />
                        <text x="36" y={y + 8} fontSize="9" fill="var(--ink-4)" textAnchor="end">{['1a','0.75a','0.5a','0.25a','0a'][i]}</text>
                      </g>
                    ))}
                    {/* X labels */}
                    <text x="50" y="155" fontSize="9" fill="var(--ink-4)">02/07/2026</text>
                    <text x="240" y="155" fontSize="9" fill="var(--ink-4)">02/07/2026</text>
                    {/* Lines — Ling. Expressiva (azul escuro): 0.54a → 0.96a */}
                    <line x1="50" y1={164 - 0.54*160} x2="300" y2={164 - 0.96*160} stroke="#4c7ef3" strokeWidth="2" />
                    <circle cx="50" cy={164 - 0.54*160} r="4" fill="#4c7ef3" />
                    <circle cx="300" cy={164 - 0.96*160} r="4" fill="#4c7ef3" />
                    {/* Lines — Ling. Receptiva (ciano): 0.24a → 0.59a */}
                    <line x1="50" y1={164 - 0.24*160} x2="300" y2={164 - 0.59*160} stroke="#20b8a0" strokeWidth="2" />
                    <circle cx="50" cy={164 - 0.24*160} r="4" fill="#20b8a0" />
                    <circle cx="300" cy={164 - 0.59*160} r="4" fill="#20b8a0" />
                    {/* Lines — demais áreas em 0 */}
                    {['#c0392b','#e09b00','#2da44e','#7c5cbf'].map((color) => (
                      <g key={color}>
                        <line x1="50" y1="164" x2="300" y2="164" stroke={color} strokeWidth="1.5" opacity="0.5" />
                        <circle cx="50" cy="164" r="3" fill={color} opacity="0.5" />
                        <circle cx="300" cy="164" r="3" fill={color} opacity="0.5" />
                      </g>
                    ))}
                  </svg>
                  {/* Legenda */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8 }}>
                    {[['#4c7ef3','Ling. Expressiva'],['#20b8a0','Ling. Receptiva'],['#c0392b','Psicomotora'],['#e09b00','Cognição'],['#2da44e','Cuidados'],['#7c5cbf','Socialização']].map(([c, l]) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'var(--ink-3)' }}>
                        <div style={{ width: 16, height: 2, background: c, borderRadius: 1 }} />
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gráfico 2 — Média geral vs cronológica */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Evolução da idade desenvolvimental — média geral</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 12 }}>2 avaliações</div>
                  <svg viewBox="0 0 320 160" width="100%" style={{ display: 'block' }}>
                    {[0,32,64,96,128,160].map((y, i) => (
                      <g key={y}>
                        <line x1="40" y1={y + 4} x2="310" y2={y + 4} stroke="var(--line)" strokeDasharray="4 4" strokeWidth="1" />
                        <text x="36" y={y + 8} fontSize="9" fill="var(--ink-4)" textAnchor="end">{['8a','6a','4a','2a','1a','0a'][i]}</text>
                      </g>
                    ))}
                    {/* X labels */}
                    <text x="50" y="155" fontSize="9" fill="var(--ink-4)">02/07/2026</text>
                    <text x="240" y="155" fontSize="9" fill="var(--ink-4)">02/07/2026</text>
                    {/* Cronológica — linha tracejada cinza: 4.75a (escala 0-8a) */}
                    <line x1="50" y1={164 - (4.75/8)*160} x2="300" y2={164 - (4.75/8)*160} stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.6" />
                    <circle cx="50" cy={164 - (4.75/8)*160} r="3" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" opacity="0.6" />
                    <circle cx="300" cy={164 - (4.75/8)*160} r="3" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" opacity="0.6" />
                    {/* Média geral — azul: 0.2a → 0.25a */}
                    <line x1="50" y1={164 - (0.2/8)*160} x2="300" y2={164 - (0.25/8)*160} stroke="#4c7ef3" strokeWidth="2" />
                    <circle cx="50" cy={164 - (0.2/8)*160} r="4" fill="#4c7ef3" />
                    <circle cx="300" cy={164 - (0.25/8)*160} r="4" fill="#4c7ef3" />
                  </svg>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    {[['var(--ink-3)','Cronológica',true],['#4c7ef3','Média geral',false]].map(([c, l, dashed]) => (
                      <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'var(--ink-3)' }}>
                        <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke={c as string} strokeWidth="2" strokeDasharray={dashed ? '4 3' : undefined} /></svg>
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabela comparativa */}
              <div style={{ borderTop: '1px solid var(--line)', padding: '16px 24px 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>Comparativo entre avaliações</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 0, fontSize: 10 }}>
                  <div style={{ color: 'var(--ink-4)', padding: '4px 0', borderBottom: '1px solid var(--line)' }}>Área</div>
                  <div style={{ color: 'var(--ink-4)', padding: '4px 0', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>02/07/2026</div>
                  <div style={{ color: 'var(--ink-4)', padding: '4px 0', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>02/07/2026</div>
                  <div style={{ color: 'var(--ink-4)', padding: '4px 0', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>Δ total</div>
                  {[
                    ['Socialização',    '#7c5cbf','0.00a','0.00a','→ 0.00a','neutral'],
                    ['Ling. Receptiva', '#20b8a0','0.24a','0.59a','↑ 0.35a','pos'],
                    ['Ling. Expressiva','#4c7ef3','0.54a','0.96a','↑ 0.42a','pos'],
                    ['Cuidados Próprios','#2da44e','0.00a','0.00a','→ 0.00a','neutral'],
                    ['Cognição',        '#e09b00','0.00a','0.00a','→ 0.00a','neutral'],
                    ['Psicomotora',     '#c0392b','0.00a','0.00a','→ 0.00a','neutral'],
                  ].map(([area, color, v1, v2, delta, type]) => (
                    <>
                      <div key={area} style={{ color, fontWeight: 600, padding: '5px 0', borderBottom: '1px solid var(--line)' }}>{area}</div>
                      <div style={{ color: 'var(--ink-3)', padding: '5px 0', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>{v1}</div>
                      <div style={{ color: type === 'pos' ? 'var(--primary)' : 'var(--ink-3)', padding: '5px 0', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>{v2}</div>
                      <div style={{ color: type === 'pos' ? '#2da44e' : 'var(--ink-4)', fontWeight: type === 'pos' ? 700 : 400, padding: '5px 0', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{delta}</div>
                    </>
                  ))}
                </div>
              </div>
              <div style={{ padding: '10px 24px 14px', fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>Progressão — gráficos e comparativo entre avaliações</div>
            </div>

            {/* Card 6 — Gráficos da aba Gráficos (largo, 3 colunas) */}
            <div className="lp-reveal lp-reveal-d2" style={{ gridColumn: '1 / -1', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px hsl(220 25% 20% / .07)', background: 'var(--bg)' }}>
              <div style={{ background: '#f8f9fb', borderBottom: '1px solid var(--line)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-4)' }}>Aba: Gráficos</span>
              </div>
              <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>

                {/* Radar — Perfil desenvolvimental */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Perfil desenvolvimental</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 12 }}>Idade desenv. (anos) vs. cronológica</div>
                  <svg viewBox="0 0 220 210" width="100%" style={{ display: 'block' }}>
                    {/* Radar hexagonal — 6 áreas, centro 110,105, raio max 80 */}
                    {(() => {
                      const cx = 110, cy = 108, R = 78
                      const angles = [270, 330, 30, 90, 150, 210].map(d => d * Math.PI / 180)
                      const labels = ['Socialização','Ling. Receptiva','Ling. Expressiva','Cuidados Próprios','Cognição','Psicomotora']
                      const labelOffsets = [[0,-14],[22,0],[22,0],[0,14],[-22,0],[-22,0]]
                      // Cronológica: raio proporcional a 4.75/8 = 0.59
                      const rCron = R * 0.59
                      // Desenvolvimental: [0, 0.59, 0.96, 0, 0, 0] / 8 * R
                      const devVals = [0, 0.59/8, 0.96/8, 0, 0, 0]
                      const rDev = devVals.map(v => v * R * 8)
                      // Grid rings
                      const rings = [0.25,0.5,0.75,1].map(f => angles.map(a => [cx + R*f*Math.cos(a), cy + R*f*Math.sin(a)]))
                      return (
                        <>
                          {/* Grid rings */}
                          {rings.map((pts, ri) => (
                            <polygon key={ri} points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="var(--line)" strokeWidth="1" />
                          ))}
                          {/* Spokes */}
                          {angles.map((a, i) => (
                            <line key={i} x1={cx} y1={cy} x2={cx + R*Math.cos(a)} y2={cy + R*Math.sin(a)} stroke="var(--line)" strokeWidth="1" />
                          ))}
                          {/* Ring labels */}
                          {[2,4,6].map((v, i) => (
                            <text key={v} x={cx + 3} y={cy - R*(i+1)/4 - 1} fontSize="8" fill="var(--ink-4)">{v}</text>
                          ))}
                          {/* Cronológica polygon */}
                          <polygon points={angles.map(a => [cx + rCron*Math.cos(a), cy + rCron*Math.sin(a)].join(',')).join(' ')} fill="hsl(220 15% 60% / .12)" stroke="hsl(220 15% 60% / .7)" strokeWidth="1.5" strokeDasharray="5 3" />
                          {/* Desenvolvimental polygon */}
                          <polygon points={angles.map((a, i) => [cx + rDev[i]*Math.cos(a), cy + rDev[i]*Math.sin(a)].join(',')).join(' ')} fill="hsl(214 56% 50% / .18)" stroke="#4c7ef3" strokeWidth="2" />
                          {/* Area labels */}
                          {angles.map((a, i) => (
                            <text key={i} x={cx + (R+14)*Math.cos(a) + labelOffsets[i][0]} y={cy + (R+14)*Math.sin(a) + labelOffsets[i][1]} fontSize="9" fill="var(--ink-3)" textAnchor="middle">{labels[i]}</text>
                          ))}
                        </>
                      )
                    })()}
                  </svg>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'var(--ink-3)' }}>
                      <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke="hsl(220 15% 60%)" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
                      Cronológica
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'var(--ink-3)' }}>
                      <div style={{ width: 14, height: 10, background: 'hsl(214 56% 50% / .25)', border: '2px solid #4c7ef3', borderRadius: 2 }} />
                      Idade desenv.
                    </div>
                  </div>
                </div>

                {/* Barras horizontais — Aquisição por área */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Aquisição por área</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 14 }}>% de itens adquiridos (Sim)</div>
                  <svg viewBox="0 0 260 190" width="100%" style={{ display: 'block' }}>
                    {/* Grid lines */}
                    {[0,25,50,75,100].map((pct) => {
                      const x = 70 + (pct / 100) * 180
                      return (
                        <g key={pct}>
                          <line x1={x} y1="0" x2={x} y2="165" stroke="var(--line)" strokeDasharray="4 4" strokeWidth="1" />
                          <text x={x} y="178" fontSize="9" fill="var(--ink-4)" textAnchor="middle">{pct}%</text>
                        </g>
                      )
                    })}
                    {/* Bars */}
                    {[
                      ['Socialização',   0,     '#7c5cbf'],
                      ['Ling.\nReceptiva', 18,  '#20b8a0'],
                      ['Ling.\nExpressiva', 92, '#4c7ef3'],
                      ['Cuidados\nPróprios', 0, '#2da44e'],
                      ['Cognição',       0,     '#e09b00'],
                      ['Psicomotora',    0,     '#c0392b'],
                    ].map(([label, pct, color], i) => {
                      const y = i * 27 + 4
                      const bw = (Number(pct) / 100) * 180
                      return (
                        <g key={String(label)}>
                          <text x="65" y={y + 14} fontSize="9" fill="var(--ink-3)" textAnchor="end">{String(label).split('\n').map((t, j) => <tspan key={j} x="65" dy={j === 0 ? 0 : 10}>{t}</tspan>)}</text>
                          {bw > 0 && <rect x="70" y={y + 2} width={bw} height="16" rx="3" fill={String(color)} opacity="0.85" />}
                          {bw === 0 && <line x1="70" y1={y+10} x2="73" y2={y+10} stroke={String(color)} strokeWidth="2" />}
                          {bw > 2 && <text x={70 + bw + 4} y={y + 13} fontSize="9" fill="var(--ink-3)">{Number(pct) > 0 ? pct : ''}</text>}
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Linha — % de aquisição por faixa etária */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>% de aquisição por faixa etária</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 12 }}>Uma linha por área de desenvolvimento</div>
                  <svg viewBox="0 0 260 170" width="100%" style={{ display: 'block' }}>
                    {/* Y grid */}
                    {[0,25,50,75,100].map((pct) => {
                      const y = 4 + (1 - pct/100) * 130
                      return (
                        <g key={pct}>
                          <line x1="30" y1={y} x2="255" y2={y} stroke="var(--line)" strokeDasharray="4 4" strokeWidth="1" />
                          <text x="26" y={y + 4} fontSize="8" fill="var(--ink-4)" textAnchor="end">{pct}%</text>
                        </g>
                      )
                    })}
                    {/* X labels */}
                    {['0–1a','1–2a','2–3a','3–4a','4–5a','5–6a'].map((l, i) => (
                      <text key={l} x={30 + i * 45} y="152" fontSize="8" fill="var(--ink-4)" textAnchor="middle">{l}</text>
                    ))}
                    {/* Ling. Expressiva: 92% at 0-1a, 0% rest */}
                    {(() => {
                      const xs = [30, 75, 120, 165, 210, 255]
                      const expY = [4 + (1 - 0.92)*130, ...Array(5).fill(4 + 130)]
                      const recY = [4 + (1 - 0.18)*130, ...Array(5).fill(4 + 130)]
                      return (
                        <>
                          <polyline points={xs.map((x, i) => `${x},${expY[i]}`).join(' ')} fill="none" stroke="#4c7ef3" strokeWidth="2" />
                          {xs.map((x, i) => <circle key={i} cx={x} cy={expY[i]} r="3" fill="#4c7ef3" />)}
                          <polyline points={xs.map((x, i) => `${x},${recY[i]}`).join(' ')} fill="none" stroke="#20b8a0" strokeWidth="2" />
                          {xs.map((x, i) => <circle key={i} cx={x} cy={recY[i]} r="3" fill="#20b8a0" />)}
                          {/* demais em 0 */}
                          {['#c0392b','#e09b00','#2da44e','#7c5cbf'].map(color => (
                            <g key={color}>
                              <polyline points={xs.map(x => `${x},${4+130}`).join(' ')} fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
                              {xs.map((x, i) => <circle key={i} cx={x} cy={4+130} r="2.5" fill={color} opacity="0.5" />)}
                            </g>
                          ))}
                        </>
                      )
                    })()}
                  </svg>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', marginTop: 4, justifyContent: 'center' }}>
                    {[['#e09b00','Cognição'],['#2da44e','Cuidados'],['#4c7ef3','Ling. Expressiva'],['#20b8a0','Ling. Receptiva'],['#c0392b','Psicomotora'],['#7c5cbf','Socialização']].map(([c,l]) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, color: 'var(--ink-3)' }}>
                        <div style={{ width: 14, height: 2, background: c, borderRadius: 1 }} />{l}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              <div style={{ padding: '10px 24px 14px', fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>Gráficos — radar, barras e % de aquisição por faixa etária</div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PARA QUEM É ───────────────────────────────────────────────── */}
      <section style={{ padding: '84px 0', background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={w}>
          <div className="lp-reveal" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
            <span style={eyebrow}>Para quem é o IADI</span>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px', textWrap: 'balance' as never }}>Feito para profissionais que avaliam desenvolvimento</h2>
            <p style={{ fontSize: 16, color: 'var(--ink-2)', margin: 0 }}>Psicólogos, fonoaudiólogos, terapeutas ocupacionais, fisioterapeutas, pedagogos e psicopedagogos.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {PROFILES.map((p, i) => (
              <div key={p.role} className={`lp-profile-card lp-reveal lp-reveal-d${i + 1}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: p.bg, color: p.color, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 22 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: p.color }}>{p.role}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.context}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0, lineHeight: 1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA após "Para quem é" */}
      <div style={{ textAlign: 'center', padding: '32px 24px', borderTop: '1px solid var(--line)' }}>
        <a href="#planos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 15, padding: '13px 28px', borderRadius: 99, textDecoration: 'none', boxShadow: '0 4px 16px hsl(220 80% 50% / .22)', transition: 'opacity .15s' }} onMouseOver={e => (e.currentTarget.style.opacity='.88')} onMouseOut={e => (e.currentTarget.style.opacity='1')}>
          Conheça nossos planos →
        </a>
      </div>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <section id="planos" style={{ padding: '88px 0' }}>
        <div style={w}>
          <div className="lp-reveal" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 52px' }}>
            <span style={eyebrow}>Planos</span>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px', textWrap: 'balance' as never }}>Conheça nossos planos</h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: 0 }}>
              Crie sua conta, cadastre sua forma de pagamento e explore o IADI completo por 3 dias. Você só é cobrado se decidir continuar — cancele antes e não paga nada.
            </p>
          </div>

          <div className="lp-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 400px))', gap: 22, justifyContent: 'center' }}>
            {/* Trimestral */}
            <div className="lp-price-card" style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', boxShadow: '0 4px 20px hsl(220 25% 20% / .06)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Trimestral</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 20, minHeight: 36 }}>Ideal para começar e testar o IADI na sua rotina.</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-2)' }}>R$</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 54, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>37</span>
                <span style={{ fontSize: 15, color: 'var(--ink-3)' }}>/trimestre</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--pos)', fontWeight: 600, marginBottom: 24 }}>≈ R$ 12,33 por mês</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {['Todos os recursos incluídos','Pacientes e avaliações ilimitados','Relatório Word + PEI Word','Gráficos em PNG','Renovação a cada 3 meses'].map(item => (
                  <li key={item} style={{ display: 'flex', gap: 9, fontSize: 14, color: 'var(--ink-2)', alignItems: 'flex-start' }}>
                    {CHECK} {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Anual */}
            <div className="lp-price-card" style={{ background: 'var(--surface)', border: '2px solid var(--primary)', boxShadow: '0 8px 32px hsl(214 56% 40% / .14)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', padding: '5px 16px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                Mais econômico · economize 35%
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-ink)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Anual</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 20, minHeight: 36 }}>Melhor custo-benefício para quem já usa o IADI no dia a dia.</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-2)' }}>R$</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 54, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--primary-ink)' }}>87</span>
                <span style={{ fontSize: 15, color: 'var(--ink-3)' }}>/ano</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--pos)', fontWeight: 600, marginBottom: 24 }}>≈ R$ 7,25 por mês</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {['Tudo do plano trimestral', <>12 meses pelo preço de ~7</>, 'Menos renovações para gerenciar', 'Suporte prioritário'].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: 9, fontSize: 14, color: 'var(--ink-2)', alignItems: 'flex-start' }}>
                    {CHECK} {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA único abaixo dos cards */}
          <div className="lp-reveal" style={{ textAlign: 'center', marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <button onClick={onGetStarted} className="lp-btn-primary lp-btn-primary-lg" style={{ fontSize: 17, padding: '15px 40px' }}>
              Teste grátis por 3 dias · faça seu cadastro grátis e escolha seu plano {ARROW}
            </button>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
              Cobrança só após os 3 dias de teste · cancele antes e não paga nada · pagamento via Mercado Pago
            </p>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div style={w}>
          <div className="lp-reveal" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 48px' }}>
            <span style={eyebrow}>Depoimentos</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0, textWrap: 'balance' as never }}>Quem já usa o IADI</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 860, margin: '0 auto 52px' }}>
            {[
              { text: 'Em 20 minutos eu tenho o relatório pronto. Antes levava horas montando tudo no Word manualmente.', name: 'Fernanda R.', role: 'Fonoaudióloga · SP' },
              { text: 'O PEI integrado economiza muito tempo. Consigo mostrar a evolução da criança para a família de forma visual e clara.', name: 'Carla M.', role: 'Terapeuta Ocupacional · MG' },
              { text: 'Uso em consultório e em escola. Os gráficos de progressão fizeram diferença nas reuniões com a equipe multidisciplinar.', name: 'Juliana P.', role: 'Psicóloga · RJ' },
            ].map(t => (
              <div key={t.name} className="lp-reveal" style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 16, padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#f59e0b', fontSize: 15 }}>★</span>)}
                </div>
                <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>"{t.text}"</p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{t.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Selos de segurança */}
          <div className="lp-reveal" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', borderTop: '1px solid var(--line)', paddingTop: 36 }}>
            {[
              { emoji: '🔒', label: 'Pagamento criptografado' },
              { emoji: '🛡️', label: 'Dados protegidos' },
              { emoji: '💳', label: 'Mercado Pago' },
              { emoji: '✅', label: 'Cobrança só após 3 dias' },
              { emoji: '↩️', label: 'Cancele quando quiser' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 99, padding: '7px 16px', fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>
                <span>{s.emoji}</span>{s.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '84px 0', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={w}>
          <div className="lp-reveal" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 48px' }}>
            <span style={eyebrow}>Dúvidas frequentes</span>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0, textWrap: 'balance' as never }}>Perguntas comuns</h2>
          </div>
          <div style={{ maxWidth: 740, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((f, i) => (
              <div key={i} className={`lp-faq-item lp-reveal ${openFaq === i ? 'open' : ''}`} style={{ background: 'var(--bg)', border: `1px solid ${openFaq === i ? 'var(--primary-line)' : 'var(--line)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '19px 22px', fontWeight: 600, fontSize: 15.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, color: 'var(--ink)', textAlign: 'left', fontFamily: 'inherit' }}
                >
                  {f.q}
                  <span style={{ color: 'var(--ink-4)', flexShrink: 0, display: 'flex', transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}>
                    {CHEV}
                  </span>
                </button>
                <div className={`lp-faq-answer ${openFaq === i ? 'open' : ''}`}>
                  <p style={{ fontSize: 14.5, color: 'var(--ink-2)', margin: '0', padding: '0 22px 20px', lineHeight: 1.65 }}>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section style={{ padding: '36px 0 44px' }}>
        <div style={w}>
          <div className="lp-reveal" style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', padding: '72px 56px', textAlign: 'center', background: 'hsl(214 60% 22%)' }}>
            {/* decorative blobs inside CTA */}
            <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: '-40%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, hsl(214 80% 60% / .22) 0%, transparent 65%)' }} />
              <div style={{ position: 'absolute', bottom: '-40%', left: '-5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, hsl(190 60% 55% / .18) 0%, transparent 65%)' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'hsl(214 60% 72%)', margin: '0 0 18px' }}>Comece hoje</p>
              <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 18px', color: '#fff', textWrap: 'balance' as never, maxWidth: 580, marginLeft: 'auto', marginRight: 'auto' }}>
                Ganhe horas por semana. Entregue mais para cada paciente.
              </h2>
              <p style={{ fontSize: 17.5, color: 'hsl(214 30% 78%)', margin: '0 auto 36px', maxWidth: '44ch', lineHeight: 1.6 }}>
                Aplique, calcule e gere relatórios do desenvolvimento infantil em um só lugar. 3 dias grátis — você só é cobrado se decidir continuar.
              </p>
              <button onClick={onGetStarted} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'inherit', fontWeight: 700, fontSize: 17, padding: '17px 36px', borderRadius: 11, border: 'none', cursor: 'pointer', background: '#fff', color: 'hsl(214 60% 28%)', boxShadow: '0 8px 28px hsl(220 40% 8% / .28)', transition: 'transform .15s, box-shadow .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 36px hsl(220 40% 8% / .36)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px hsl(220 40% 8% / .28)' }}
              >
                Testar grátis por 3 dias {ARROW}
              </button>
              <div style={{ marginTop: 18, fontSize: 13, color: 'hsl(214 20% 65%)' }}>
                Cobrança só após os 3 dias · cancele antes e não paga nada
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ padding: '48px 0 36px', borderTop: '1px solid var(--line)' }}>
        <div style={{ ...w, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 36 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>IADI</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Inventário de Avaliação do Desenvolvimento Infantil</div>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--ink-4)', lineHeight: 1.6, margin: 0 }}>© 2026 IADI · Todos os direitos reservados</p>
          </div>

          {/* Nav */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 14 }}>Navegação</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['#recursos','Recursos'],['#como','Como funciona'],['#planos','Planos'],['#faq','Dúvidas']].map(([h,l]) => (
                <a key={h} href={h} style={{ color: 'var(--ink-3)', textDecoration: 'none', fontSize: 13.5 }}>{l}</a>
              ))}
              <button onClick={onLogin ?? onGetStarted} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, color: 'var(--ink-3)', padding: 0, fontFamily: 'inherit', textAlign: 'left' }}>Entrar</button>
            </div>
          </div>

          {/* Contato */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--ink-3)', marginBottom: 14 }}>Contato</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="mailto:prof.carolgurgel@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--ink-2)', textDecoration: 'none', fontSize: 13.5 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                prof.carolgurgel@gmail.com
              </a>
              <a href="https://www.instagram.com/institutoprofcarolgurgel/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--ink-2)', textDecoration: 'none', fontSize: 13.5 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                @institutoprofcarolgurgel
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
