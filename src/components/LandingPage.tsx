interface Props { onGetStarted: () => void }

const CHECK = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
)
const ARROW = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
)
const CHEV = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
)

const BARS = [
  { label: 'Socialização',   w: 82, color: 'hsl(224 46% 50%)', val: '4a 1m',  vc: 'hsl(224 48% 40%)' },
  { label: 'Linguagem',      w: 64, color: 'hsl(190 46% 44%)', val: '3a 2m',  vc: 'hsl(190 48% 34%)' },
  { label: 'Cuidados Próp.', w: 88, color: 'hsl(150 46% 42%)', val: '4a 5m',  vc: 'hsl(150 48% 32%)' },
  { label: 'Cognição',       w: 71, color: 'hsl(40 70% 46%)',  val: '3a 7m',  vc: 'hsl(40 72% 34%)' },
  { label: 'Psicomotora',    w: 78, color: 'hsl(6 55% 52%)',   val: '3a 11m', vc: 'hsl(6 58% 42%)' },
]

const FEATURES = [
  { title: '5 áreas, 0 a 6 anos', desc: 'Socialização, Linguagem, Cuidados Próprios, Cognição e Psicomotora, por faixa etária.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg> },
  { title: 'Idade desenvolvimental', desc: 'O sistema calcula automaticamente a idade de desenvolvimento em cada área avaliada.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
  { title: 'Evolução entre avaliações', desc: 'Compare aplicações ao longo do tempo em gráficos claros e mostre o progresso à família.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"/></svg> },
  { title: 'Gráficos e relatórios prontos', desc: 'Síntese, gráficos por área e laudo interpretativo gerados na hora, sem formatar nada.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M18 9l-5 5-3-3-3 3"/></svg> },
  { title: 'Exportação Word · Excel · PDF', desc: 'Baixe relatórios editáveis em Word, dados em Excel ou um PDF pronto para entregar.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> },
  { title: 'Plano de Ensino (PEI)', desc: 'Transforme as habilidades prioritárias em um plano individualizado com metas e prazos.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/></svg> },
  { title: 'Economia de tempo', desc: 'O que levava horas em planilhas e editores de texto passa a levar minutos.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg> },
  { title: 'Dados seguros por profissional', desc: 'Cada conta acessa apenas os próprios pacientes, com informações privadas e organizadas.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
]

const STEPS = [
  { n: 1, title: 'Cadastre o paciente', desc: 'Registre a criança com data de nascimento e diagnóstico. A idade cronológica é calculada sozinha.' },
  { n: 2, title: 'Aplique o inventário', desc: 'Responda os itens por área e faixa etária, com marcação rápida e orientações de como avaliar.' },
  { n: 3, title: 'Veja os resultados', desc: 'Idade desenvolvimental, gráficos, prioridades e evolução aparecem automaticamente.' },
  { n: 4, title: 'Gere relatório e PEI', desc: 'Exporte o laudo em Word, PDF ou Excel e monte o plano individualizado.' },
]

const FAQS = [
  { q: 'Para quais profissionais o IADI é indicado?', a: 'Para todos os profissionais que atuam com desenvolvimento infantil — psicólogos, fonoaudiólogos, terapeutas ocupacionais, fisioterapeutas, pedagogos e psicopedagogos, em consultório ou clínica.' },
  { q: 'Preciso instalar algo?', a: 'Não. O IADI funciona direto no navegador, no computador ou no tablet. Você acessa com seu login e seus dados ficam salvos na sua conta.' },
  { q: 'Qual a diferença entre o plano trimestral e o anual?', a: 'Os recursos são exatamente os mesmos. O trimestral (R$ 37 a cada 3 meses) é ótimo para começar; o anual (R$ 87 por ano) sai bem mais barato por mês e reduz o número de renovações.' },
  { q: 'Os dados dos meus pacientes ficam seguros?', a: 'Sim. Cada conta acessa apenas os próprios pacientes, e as informações ficam vinculadas ao seu login profissional.' },
  { q: 'Posso exportar os relatórios?', a: 'Sim. Você gera relatórios em Word (editável), Excel (dados) e PDF (pronto para entregar), incluindo o Plano de Ensino Individualizado.' },
]

const w: React.CSSProperties = { maxWidth: 1120, margin: '0 auto', padding: '0 24px' }
const eyebrow: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--primary-ink)' }
const secHead: React.CSSProperties = { textAlign: 'center', maxWidth: 640, margin: '0 auto 52px' }

import { useState } from 'react'

export default function LandingPage({ onGetStarted }: Props) {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: "'IBM Plex Sans', system-ui, sans-serif", lineHeight: 1.6 }}>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'hsl(0 0% 100% / .82)', backdropFilter: 'saturate(1.5) blur(14px)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ ...w, display: 'flex', alignItems: 'center', gap: 20, height: 66 }}>
          {/* brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 1px 0 hsl(0 0% 100% / .25)' }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>IADI</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>Avaliação do Desenvolvimento Infantil</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 28, marginLeft: 18 }}>
            {[['#recursos','Recursos'],['#como','Como funciona'],['#planos','Planos'],['#faq','Dúvidas']].map(([h,l]) => (
              <a key={h} href={h} style={{ fontSize: 14.5, color: 'var(--ink-2)', fontWeight: 500 }}>{l}</a>
            ))}
          </nav>
          <div style={{ flex: 1 }} />
          <button onClick={onGetStarted} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 600, fontSize: 15, padding: '13px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px hsl(214 56% 40% / .3)' }}>
            3 dias grátis →
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '76px 0 84px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(720px 380px at 78% -8%, hsl(214 56% 92% / .8), transparent 60%), radial-gradient(600px 340px at 8% 110%, hsl(190 50% 92% / .55), transparent 60%)' }} />
        <div style={{ ...w, position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.02fr 0.98fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
              {['5 áreas do desenvolvimento', '0 a 6 anos'].map(p => (
                <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 500, color: 'var(--primary-ink)', background: 'var(--primary-bg)', border: '1px solid var(--primary-line)', padding: '5px 12px', borderRadius: 99 }}>{p}</span>
              ))}
            </div>
            <h1 style={{ fontSize: 50, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: 0 }}>
              A avaliação do desenvolvimento infantil, do questionário ao relatório.
            </h1>
            <p style={{ fontSize: 18.5, color: 'var(--ink-2)', marginTop: 22, maxWidth: '33ch' }}>
              Aplique, calcule a idade desenvolvimental por área, acompanhe a evolução e gere relatórios profissionais — sem planilhas soltas nem horas de trabalho manual.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              <button onClick={onGetStarted} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 600, fontSize: 16, padding: '16px 30px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px hsl(214 56% 40% / .3)' }}>
                Testar grátis por 3 dias {ARROW}
              </button>
              <a href="#como" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 600, fontSize: 16, padding: '16px 30px', borderRadius: 8, border: '1px solid var(--line-2)', cursor: 'pointer', background: 'var(--surface)', color: 'var(--ink)', textDecoration: 'none' }}>
                Ver como funciona
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, fontSize: 13.5, color: 'var(--ink-3)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--pos)' }}><path d="M20 6 9 17l-5-5"/></svg>
              3 dias grátis · depois a partir de <strong style={{ color: 'var(--ink-2)', margin: '0 3px' }}>R$ 7,25/mês</strong> · cancele quando quiser
            </div>
          </div>

          {/* Mock */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, boxShadow: '0 24px 60px hsl(220 35% 25% / .13), 0 8px 20px hsl(220 30% 30% / .06)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 15px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                {[1,2,3].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--line-2)', display: 'block' }} />)}
                <span style={{ marginLeft: 8, fontSize: 11.5, color: 'var(--ink-3)', fontFamily: "'IBM Plex Mono', monospace" }}>iadi · resultados</span>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Perfil desenvolvimental por área</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>Lívia, 4a 11m · avaliação de 18/02</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-ink)', background: 'var(--primary-bg)', padding: '3px 8px', borderRadius: 5 }}>Idade desenv.</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {BARS.map(b => (
                    <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 42px', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--ink-2)', fontWeight: 500 }}>{b.label}</span>
                      <span style={{ height: 8, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden', display: 'block' }}>
                        <span style={{ display: 'block', height: '100%', borderRadius: 99, background: b.color, width: `${b.w}%` }} />
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'right', color: b.vc, fontFamily: "'IBM Plex Mono', monospace" }}>{b.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Float 1 */}
            <div style={{ position: 'absolute', top: -22, right: -18, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 24px 60px hsl(220 35% 25% / .13)', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--pos-bg)', color: 'var(--pos)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evolução</div>
                <div style={{ fontWeight: 700, color: 'var(--pos)', fontFamily: "'IBM Plex Mono', monospace" }}>+0,42 ano</div>
              </div>
            </div>
            {/* Float 2 */}
            <div style={{ position: 'absolute', bottom: -24, left: -22, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 24px 60px hsl(220 35% 25% / .13)', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--primary-bg)', color: 'var(--primary-ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Relatório</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Word · PDF · Excel</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={{ ...w, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[['5','áreas avaliadas'],['0–6','anos de idade'],['589','habilidades mapeadas'],['3','formatos de relatório']].map(([n,l], i) => (
            <div key={l} style={{ padding: '26px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--primary-ink)', letterSpacing: '-0.02em' }}>{n}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <section style={{ padding: '84px 0' }}>
        <div style={w}>
          <div style={secHead}>
            <span style={eyebrow}>O trabalho manual custa caro</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: '14px 0 0' }}>Avaliar desenvolvimento não precisa ser exaustivo</h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 16 }}>Quem trabalha com desenvolvimento infantil conhece a rotina: aplicar a avaliação é só o começo.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v5M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>, t: 'Cálculos à mão', d: 'Somar pontos, converter em idade desenvolvimental por área e conferir tudo em planilha toma tempo — e abre espaço para erro.' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M18 9l-5 5-3-3-3 3"/></svg>, t: 'Evolução difícil de mostrar', d: 'Comparar avaliações ao longo do tempo e demonstrar progresso para a família raramente é simples.' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>, t: 'Relatórios do zero', d: 'Montar cada laudo manualmente, formatar tabelas e gráficos... horas que poderiam ser do atendimento.' },
            ].map(c => (
              <div key={c.t} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 26 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'hsl(6 60% 96%)', color: 'hsl(6 60% 50%)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>{c.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: 0 }}>{c.t}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ink-2)', marginTop: 9 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" style={{ padding: '84px 0', background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={w}>
          <div style={secHead}>
            <span style={eyebrow}>Tudo em um só lugar</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: '14px 0 0' }}>O que o IADI faz por você</h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 16 }}>Da aplicação ao plano de intervenção — um fluxo pensado para a prática clínica.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--primary-bg)', color: 'var(--primary-ink)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
                  <svg style={{ width: 22, height: 22 }} viewBox={f.icon.props.viewBox} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.icon.props.children}</svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: 0 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como" style={{ padding: '84px 0' }}>
        <div style={w}>
          <div style={secHead}>
            <span style={eyebrow}>Simples do início ao fim</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: '14px 0 0' }}>Como funciona</h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 16 }}>Quatro passos entre cadastrar a criança e ter o relatório na mão.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, counterReset: 'step' }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ position: 'relative', paddingTop: 8 }}>
                <div style={{ width: 42, height: 42, borderRadius: 99, background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 17, display: 'grid', placeItems: 'center', marginBottom: 16, boxShadow: '0 2px 8px hsl(214 56% 40% / .3)', position: 'relative' }}>
                  {s.n}
                  {i < STEPS.length - 1 && (
                    <span style={{ position: 'absolute', top: 20, left: 52, right: -12, height: 2, background: 'linear-gradient(90deg, var(--primary-line), transparent)', display: 'block' }} />
                  )}
                </div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: 0 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" style={{ padding: '84px 0', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div style={w}>
          <div style={secHead}>
            <span style={eyebrow}>Planos</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: '14px 0 0' }}>Escolha e comece hoje</h2>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 16 }}>3 dias grátis para testar. Acesso completo a todos os recursos em qualquer plano. Sem taxa de adesão.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 380px))', gap: 24, justifyContent: 'center' }}>
            {/* Trimestral */}
            <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 18, padding: '34px 30px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-ink)' }}>Trimestral</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 4, minHeight: 38 }}>Ideal para experimentar o IADI na sua rotina clínica.</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '18px 0 4px' }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink-2)' }}>R$</span>
                <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em' }}>37</span>
                <span style={{ fontSize: 15, color: 'var(--ink-3)' }}>/trimestre</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--pos)', fontWeight: 600, marginBottom: 22 }}>equivale a R$ 12,33 por mês</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Todos os recursos incluídos','Pacientes e avaliações ilimitados','Relatórios em Word, Excel e PDF','Renovação a cada 3 meses'].map(i => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: 'var(--ink-2)', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--pos)', flexShrink: 0, marginTop: 2 }}>{CHECK}</span> {i}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontWeight: 600, fontSize: 15, padding: '13px 24px', borderRadius: 8, border: '1px solid var(--line-2)', cursor: 'pointer', background: 'var(--surface)', color: 'var(--ink)' }}>
                Testar grátis · depois R$ 37/tri
              </button>
            </div>

            {/* Anual */}
            <div style={{ position: 'relative', background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: 18, padding: '34px 30px', boxShadow: '0 24px 60px hsl(220 35% 25% / .13), 0 8px 20px hsl(220 30% 30% / .06)' }}>
              <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '5px 14px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                Mais econômico · economize 35%
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-ink)' }}>Anual</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 4, minHeight: 38 }}>Melhor custo-benefício para quem já usa o IADI no dia a dia.</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '18px 0 4px' }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink-2)' }}>R$</span>
                <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em' }}>87</span>
                <span style={{ fontSize: 15, color: 'var(--ink-3)' }}>/ano</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--pos)', fontWeight: 600, marginBottom: 22 }}>equivale a R$ 7,25 por mês</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Tudo do plano trimestral',<><strong>12 meses</strong> pelo preço de ~7</>,'Menos renovações para gerenciar','Prioridade no suporte'].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: 'var(--ink-2)', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--pos)', flexShrink: 0, marginTop: 2 }}>{CHECK}</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontWeight: 600, fontSize: 15, padding: '13px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px hsl(214 56% 40% / .3)' }}>
                Testar grátis · depois R$ 87/ano
              </button>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-3)', marginTop: 30 }}>
            3 dias grátis · sem cobrança durante o período de teste · cancele quando quiser.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '84px 0' }}>
        <div style={w}>
          <div style={secHead}>
            <span style={eyebrow}>Dúvidas frequentes</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: '14px 0 0' }}>Perguntas comuns</h2>
          </div>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${openFaq === i ? 'var(--primary-line)' : 'var(--line)'}`, borderRadius: 12, padding: '4px 22px' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '18px 0', fontWeight: 600, fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, color: 'var(--ink)', textAlign: 'left' }}
                >
                  {f.q}
                  <span style={{ color: 'var(--ink-4)', flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>{CHEV}</span>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: 14.5, color: 'var(--ink-2)', paddingBottom: 20, margin: 0 }}>{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '30px 0' }}>
        <div style={w}>
          <div style={{ position: 'relative', background: 'linear-gradient(155deg, var(--primary-strong), hsl(230 52% 30%))', color: '#fff', borderRadius: 24, padding: '68px 56px', textAlign: 'center', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 300px at 85% -20%, hsl(0 0% 100% / .14), transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, margin: 0 }}>Ganhe tempo na avaliação e entregue mais valor</h2>
              <p style={{ fontSize: 18, opacity: 0.9, margin: '16px auto 32px', maxWidth: '46ch' }}>Comece hoje a aplicar, calcular e gerar relatórios do desenvolvimento infantil em um só lugar.</p>
              <button onClick={onGetStarted} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 600, fontSize: 16, padding: '16px 30px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#fff', color: 'var(--primary-strong)', boxShadow: '0 8px 24px hsl(220 40% 10% / .25)' }}>
                Testar grátis por 3 dias {ARROW}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '44px 0', borderTop: '1px solid var(--line)', color: 'var(--ink-3)' }}>
        <div style={{ ...w, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>IADI</div>
              <div style={{ fontSize: 11.5 }}>Inventário de Avaliação do Desenvolvimento Infantil</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 22, fontSize: 13.5 }}>
            {[['#recursos','Recursos'],['#planos','Planos'],['#faq','Dúvidas']].map(([h,l]) => (
              <a key={h} href={h} style={{ color: 'var(--ink-3)' }}>{l}</a>
            ))}
            <button onClick={onGetStarted} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, color: 'var(--ink-3)', padding: 0 }}>Entrar</button>
          </div>
          <div style={{ fontSize: 12.5 }}>© 2026 IADI · Todos os direitos reservados</div>
        </div>
      </footer>

    </div>
  )
}
