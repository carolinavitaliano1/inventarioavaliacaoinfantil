interface Props { onGetStarted: () => void }

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    title: 'Questionário Portage guiado',
    desc: 'As 5 áreas completas — Socialização, Linguagem, Cognição, Motor Fino e Motor Grosso — num fluxo digital simples de marcar.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: 'Relatório Word profissional',
    desc: 'Exportado automaticamente com formatação profissional, pronto para entregar ao responsável ou incluir no prontuário.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: 'PEI automático',
    desc: 'Plano de Ensino Individualizado gerado a partir das prioridades identificadas na avaliação, com estratégias por prazo.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Gráficos de progressão',
    desc: 'Evolução do paciente em formato de radar e barras por área — visual para mostrar ao responsável.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Pacientes ilimitados',
    desc: 'Cadastre e acompanhe quantos pacientes precisar, com histórico completo de todas as avaliações.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    title: 'Comunidade e tutoriais',
    desc: 'Tire dúvidas, troque experiências e acesse tutoriais em vídeo publicados pela equipe IADI.',
  },
]

const FAQS = [
  { q: 'Preciso instalar algum aplicativo?', a: 'Não. O IADI funciona 100% no navegador — no celular, tablet ou computador. Basta criar sua conta e começar.' },
  { q: 'Os dados dos meus pacientes estão seguros?', a: 'Sim. Todos os dados são armazenados com criptografia na infraestrutura AWS. Cada usuário acessa apenas seus próprios pacientes.' },
  { q: 'Posso cancelar quando quiser?', a: 'Sim, sem burocracia. Cancele a qualquer momento pelo portal do Stripe, sem taxas e sem fidelidade.' },
  { q: 'O relatório gerado é adequado para uso profissional?', a: 'Sim. O relatório é exportado em .docx com formatação profissional, incluindo resultados por área, gráficos e resumo da avaliação.' },
  { q: 'Quantos pacientes posso cadastrar?', a: 'Ilimitados. Não existe restrição de número de pacientes ou avaliações em nenhum dos planos.' },
]

const AREAS = [
  { label: 'Socialização',  pct: 84, color: '#18D47A' },
  { label: 'Linguagem',     pct: 62, color: '#F7A826' },
  { label: 'Cognição',      pct: 71, color: '#18D47A' },
  { label: 'Motor Fino',    pct: 48, color: '#FF6B6B' },
  { label: 'Motor Grosso',  pct: 79, color: '#18D47A' },
]

const navy = '#07112B'
const navy2 = '#0E1E3D'
const blue = '#4C6BF5'
const amber = '#F7A826'
const green = '#18D47A'
const light = '#F2F5FF'
const ink2 = '#3A4F68'
const ink3 = '#62788F'
const onDark = '#C8D6EE'
const onDark2 = '#8BA3C3'
const line = '#DDE4EF'

export default function LandingPage({ onGetStarted }: Props) {
  return (
    <div style={{ fontFamily: "system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif", background: '#fff', color: '#0C1A30', lineHeight: 1.6, WebkitFontSmoothing: 'antialiased' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(7,17,43,.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', height: 62, gap: 28 }}>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.03em', color: '#fff' }}>
            IA<span style={{ color: blue }}>DI</span>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={onGetStarted} style={{ fontSize: 13.5, fontWeight: 500, color: onDark2, background: 'none', border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 10 }}>
            Entrar
          </button>
          <button onClick={onGetStarted} style={{ fontSize: 13.5, fontWeight: 700, background: amber, color: navy, border: 'none', cursor: 'pointer', padding: '8px 18px', borderRadius: 10 }}>
            Começar grátis →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: navy, padding: '76px 0 96px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 60% at 78% 50%,rgba(76,107,245,.14) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 400px', gap: 56, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: blue, marginBottom: 18 }}>
                Para terapeutas e educadores especializados
              </div>
              <h1 style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: 'clamp(38px,4.8vw,56px)', fontWeight: 700, lineHeight: 1.06, letterSpacing: '-.01em', color: '#fff', marginBottom: 22 }}>
                Avaliação Portage digital.<br />
                Relatório profissional<br />
                <em style={{ color: amber, fontStyle: 'italic' }}>em 1 clique.</em>
              </h1>
              <p style={{ fontSize: 16.5, color: onDark, lineHeight: 1.68, marginBottom: 34, maxWidth: 460 }}>
                Você cuida do desenvolvimento infantil. O IADI cuida da burocracia.
                Questionário guiado, relatório Word automático e PEI completo — num app simples, seguro e que cabe no bolso.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
                <button onClick={onGetStarted} style={{ fontSize: 15, fontWeight: 700, background: amber, color: navy, border: 'none', cursor: 'pointer', padding: '13px 26px', borderRadius: 10 }}>
                  Começar por R$ 7,25/mês →
                </button>
                <button onClick={onGetStarted} style={{ fontSize: 15, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)', cursor: 'pointer', padding: '13px 24px', borderRadius: 10 }}>
                  Ver como funciona
                </button>
              </div>
              <div style={{ fontSize: 12.5, color: onDark2, display: 'flex', gap: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                Sem cartão para testar <span style={{ margin: '0 8px', opacity: .3 }}>·</span> Cancele quando quiser <span style={{ margin: '0 8px', opacity: .3 }}>·</span> Funciona no celular
              </div>
            </div>

            {/* Mockup */}
            <div style={{ background: navy2, borderRadius: 16, border: '1px solid rgba(255,255,255,.1)', overflow: 'hidden', boxShadow: '0 32px 72px rgba(0,0,0,.4)' }}>
              <div style={{ background: 'rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.07)', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
                <span style={{ fontSize: 11.5, color: onDark2, marginLeft: 6, fontWeight: 500 }}>IADI — Avaliação Portage</span>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(76,107,245,.22)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, color: blue }}>SM</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      Sofia M. <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, background: 'rgba(24,212,122,.15)', color: green, padding: '2px 8px', borderRadius: 99, marginLeft: 6 }}>Nova avaliação</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: onDark2 }}>4 anos e 2 meses · Avaliação #3</div>
                  </div>
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: onDark2, marginBottom: 11 }}>Resultado por área Portage</div>
                {AREAS.map(a => (
                  <div key={a.label} style={{ marginBottom: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: onDark2, marginBottom: 4 }}>
                      <b style={{ color: onDark, fontWeight: 600 }}>{a.label}</b>
                      <span style={{ color: a.color, fontWeight: 700 }}>{a.pct}%</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, background: a.color, width: `${a.pct}%` }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: green, color: '#082818', fontSize: 13, fontWeight: 700, padding: 11, borderRadius: 9, marginTop: 18 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Exportar relatório Word
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ background: light, padding: '18px 28px', borderBottom: `1px solid ${line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: ink2, fontWeight: 500 }}>Usado por:</span>
        {['Terapeutas Ocupacionais','Fonoaudiólogos','Psicopedagogos','Professores de Educação Especial','Psicólogos Infantis'].map(l => (
          <span key={l} style={{ fontSize: 12, fontWeight: 600, color: ink2, background: '#fff', border: `1px solid ${line}`, padding: '4px 12px', borderRadius: 99 }}>{l}</span>
        ))}
      </div>

      {/* PAIN */}
      <section style={{ background: light, padding: '84px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: blue, marginBottom: 12 }}>O problema que resolvemos</div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, letterSpacing: '-.01em', lineHeight: 1.15, color: '#0C1A30', marginBottom: 14 }}>Você ainda faz assim?</h2>
          <p style={{ fontSize: 16, color: ink2, lineHeight: 1.65, maxWidth: 520, marginBottom: 52 }}>A rotina de avaliação infantil ainda é manual para a maioria — e isso custa tempo, energia e precisão.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
            {[
              { t: 'Questionários em papel', d: 'Difícil de localizar, sujeito a perda, impossível de comparar entre avaliações.' },
              { t: 'Planilhas manuais', d: 'Erros de digitação, sem padronização, nenhuma visualização do progresso.' },
              { t: 'Relatório feito do zero', d: 'Horas para formatar, digitar resultados e organizar o documento para o responsável.' },
              { t: 'PEI criado manualmente', d: 'Sem base estruturada de habilidades e estratégias, cada PEI começa do zero.' },
            ].map(c => (
              <div key={c.t} style={{ background: '#fff', border: `1px solid ${line}`, borderRadius: 10, padding: 24 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', fontSize: 12, fontWeight: 900, marginBottom: 14 }}>✕</div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#0C1A30', marginBottom: 6 }}>{c.t}</h3>
                <p style={{ fontSize: 13, color: ink3, lineHeight: 1.55, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: '#fff', padding: '84px 0' }} id="funcionalidades">
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: blue, marginBottom: 12 }}>Funcionalidades</div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, letterSpacing: '-.01em', lineHeight: 1.15, color: '#0C1A30', marginBottom: 14 }}>Com o IADI, tudo muda.</h2>
          <p style={{ fontSize: 16, color: ink2, lineHeight: 1.65, maxWidth: 520, marginBottom: 52 }}>Uma ferramenta completa pensada para a rotina real de quem avalia desenvolvimento infantil.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, background: line, border: `1px solid ${line}`, borderRadius: 16, overflow: 'hidden' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#fff', padding: '28px 24px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EEF1FF', display: 'grid', placeItems: 'center', marginBottom: 16, color: blue }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0C1A30', marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: ink3, lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: light, padding: '84px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: blue, marginBottom: 12 }}>Simples assim</div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, letterSpacing: '-.01em', lineHeight: 1.15, color: '#0C1A30', marginBottom: 14 }}>Do cadastro ao relatório em menos de uma hora.</h2>
          <p style={{ fontSize: 16, color: ink2, lineHeight: 1.65, maxWidth: 520, marginBottom: 52 }}>Sem curva de aprendizado. Se você já fez o Portage em papel, o IADI vai ser natural desde a primeira sessão.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 36 }}>
            {[
              { n: 1, t: 'Cadastre o paciente', d: 'Nome, data de nascimento e informações básicas. Em segundos o perfil está criado e pronto para avaliações.' },
              { n: 2, t: 'Aplique o questionário', d: 'Marque as habilidades presentes ou ausentes nas 5 áreas do Portage. O app calcula tudo automaticamente.' },
              { n: 3, t: 'Exporte o relatório e o PEI', d: 'Com um clique, o relatório Word e o PEI ficam prontos para download — formatados e completos.' },
            ].map(s => (
              <div key={s.n}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: blue, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 800, marginBottom: 20, border: `4px solid ${light}` }}>{s.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0C1A30', marginBottom: 8 }}>{s.t}</h3>
                <p style={{ fontSize: 13.5, color: ink2, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: navy, padding: '84px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: blue, marginBottom: 12 }}>Quem já usa o IADI</div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, letterSpacing: '-.01em', color: '#fff', marginBottom: 48 }}>O que os profissionais dizem.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[
              { q: '"Eu gastava em média 3 horas por paciente só para organizar o relatório. Agora levo 20 minutos do início ao fim. O IADI mudou completamente minha rotina."', n: 'Ana Paula R.', r: 'Terapeuta Ocupacional · SP', av: 'AP' },
              { q: '"O PEI gerado automaticamente é impressionante. Ainda personalizo algumas partes, mas a estrutura já vem pronta com as habilidades priorizadas."', n: 'Carla B.', r: 'Psicopedagoga · MG', av: 'CB' },
              { q: '"Mostro os gráficos de progressão para os pais e a reação é sempre muito positiva. Visualizar a evolução da criança torna o trabalho muito mais concreto."', n: 'Fernanda M.', r: 'Fonoaudióloga · RS', av: 'FM' },
            ].map(t => (
              <div key={t.n} style={{ background: navy2, border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 28 }}>
                <div style={{ color: amber, fontSize: 14, letterSpacing: '.05em', marginBottom: 14 }}>★★★★★</div>
                <p style={{ fontSize: 14.5, color: onDark, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>{t.q}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 35, height: 35, borderRadius: '50%', background: 'rgba(76,107,245,.2)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: blue }}>{t.av}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.n}</div>
                    <div style={{ fontSize: 11.5, color: onDark2 }}>{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ background: '#fff', padding: '84px 0' }} id="precos">
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: blue, marginBottom: 12 }}>Preços</div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, letterSpacing: '-.01em', color: '#0C1A30', marginBottom: 14 }}>Menos que um café por semana.</h2>
          <p style={{ fontSize: 16, color: ink2, lineHeight: 1.65, maxWidth: 520, marginBottom: 52 }}>Ambos os planos incluem todas as funcionalidades — sem restrição de pacientes ou recursos.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 660 }}>
            <div style={{ border: `1px solid ${line}`, borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: ink3, marginBottom: 16 }}>Trimestral</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 46, fontWeight: 700, letterSpacing: '-.025em', lineHeight: 1 }}>R$&nbsp;37</div>
              <div style={{ fontSize: 13, color: ink3, margin: '4px 0 6px' }}>a cada 3 meses</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: blue, marginBottom: 28 }}>R$ 12,33 por mês</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 28 }}>
                {['Pacientes ilimitados','Questionário Portage completo','Relatório Word automático','PEI completo','Gráficos de progressão','Comunidade e tutoriais'].map(i => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: ink2 }}>
                    <span style={{ width: 17, height: 17, borderRadius: '50%', background: '#DCFCE7', color: '#15803D', display: 'grid', placeItems: 'center', fontSize: 9.5, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {i}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} style={{ padding: 13, borderRadius: 10, background: blue, color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Assinar trimestral</button>
            </div>

            <div style={{ border: 'none', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', background: navy, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: amber, color: navy, fontSize: 10, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', padding: '3px 14px', borderRadius: 99, whiteSpace: 'nowrap' }}>Melhor valor — economize 35%</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 16 }}>Anual</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 46, fontWeight: 700, letterSpacing: '-.025em', lineHeight: 1, color: '#fff' }}>R$&nbsp;87</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', margin: '4px 0 6px' }}>por ano</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: amber, marginBottom: 28 }}>R$ 7,25 por mês · menos de R$ 0,25/dia</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 28 }}>
                {['Tudo do plano trimestral','Prioridade no suporte','Acesso antecipado a novas funcionalidades','1 mês grátis em relação ao trimestral'].map(i => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: onDark }}>
                    <span style={{ width: 17, height: 17, borderRadius: '50%', background: 'rgba(247,168,38,.18)', color: amber, display: 'grid', placeItems: 'center', fontSize: 9.5, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {i}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} style={{ padding: 13, borderRadius: 10, background: amber, color: navy, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Assinar anual →</button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: ink3, marginTop: 24 }}>Pagamento seguro via Stripe · Cancele quando quiser · Sem contrato de fidelidade</p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: light, padding: '84px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: blue, marginBottom: 12 }}>Dúvidas frequentes</div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, letterSpacing: '-.01em', color: '#0C1A30', marginBottom: 48 }}>Respostas rápidas.</h2>
          <div style={{ maxWidth: 660 }}>
            {FAQS.map(f => (
              <div key={f.q} style={{ borderBottom: `1px solid ${line}`, padding: '20px 0' }}>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0C1A30', marginBottom: 10 }}>{f.q}</div>
                <div style={{ fontSize: 14, color: ink2, lineHeight: 1.7 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: navy, padding: '96px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px' }}>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 'clamp(30px,4vw,50px)', fontWeight: 700, color: '#fff', letterSpacing: '-.015em', marginBottom: 16 }}>
            Comece a economizar tempo<br />já na próxima avaliação.
          </h2>
          <p style={{ fontSize: 16, color: onDark, marginBottom: 42, lineHeight: 1.6 }}>
            Junte-se a terapeutas e educadores que transformaram sua rotina de avaliação com o IADI.
          </p>
          <button onClick={onGetStarted} style={{ fontSize: 16, fontWeight: 700, background: amber, color: navy, border: 'none', cursor: 'pointer', padding: '15px 32px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Criar minha conta gratuitamente →
          </button>
          <div style={{ fontSize: 12.5, color: onDark2, marginTop: 16 }}>
            A partir de R$ 7,25/mês <span style={{ margin: '0 8px', opacity: .3 }}>·</span> Cancele quando quiser <span style={{ margin: '0 8px', opacity: .3 }}>·</span> Sem cartão para começar
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#040E21', padding: '36px 0', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>IA<span style={{ color: blue }}>DI</span></div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.28)' }}>© 2025 IADI · Inventário de Avaliação e Desenvolvimento Infantil</div>
        </div>
      </footer>

    </div>
  )
}
