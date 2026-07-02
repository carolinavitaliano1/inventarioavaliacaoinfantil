import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Plus, Trash2, Loader2, Send, MessageSquare, PlayCircle, BookOpen, ChevronDown, ChevronUp, X, Eye, EyeOff, Globe } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { useAuth } from '../hooks/useAuth'

type AuthHook = ReturnType<typeof useAuth>
interface Props { auth: AuthHook; onBack: () => void }

type PostType = 'tutorial' | 'video' | 'duvida'

interface Post {
  id: string
  user_id: string
  user_email: string
  created_at: string
  type: PostType
  title: string
  body: string
  video_url: string | null
  pinned: boolean
  published: boolean
}

interface Reply {
  id: string
  post_id: string
  user_id: string
  user_email: string
  created_at: string
  body: string
}

const ADMIN_EMAIL = 'carolinavitaliano1@gmail.com'

function initials(email: string) {
  return email.split('@')[0].slice(0, 2).toUpperCase()
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  return new Date(iso).toLocaleDateString('pt-BR')
}

function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

function VideoEmbed({ url }: { url: string }) {
  const vid = youtubeId(url)
  if (vid) {
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 'var(--r)', overflow: 'hidden', marginTop: 12 }}>
        <iframe
          src={`https://www.youtube.com/embed/${vid}`}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Vídeo tutorial"
        />
      </div>
    )
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 13, color: 'var(--primary-ink)', textDecoration: 'none', background: 'var(--primary-bg)', padding: '7px 13px', borderRadius: 'var(--r-sm)', border: '1px solid var(--primary-line)' }}>
      <PlayCircle size={15} /> Assistir vídeo
    </a>
  )
}

function PostTypeTag({ type }: { type: PostType }) {
  const cfg = {
    tutorial: { label: 'Tutorial', color: 'var(--primary-ink)', bg: 'var(--primary-bg)', border: 'var(--primary-line)', icon: BookOpen },
    video:    { label: 'Vídeo',    color: 'hsl(280 48% 38%)', bg: 'hsl(280 52% 96%)', border: 'hsl(280 42% 87%)', icon: PlayCircle },
    duvida:   { label: 'Dúvida',   color: 'var(--part)',       bg: 'var(--part-bg)',    border: 'hsl(36 50% 82%)', icon: MessageSquare },
  }[type]
  const Icon = cfg.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Icon size={11} /> {cfg.label}
    </span>
  )
}

function Avatar({ email }: { email: string }) {
  const isAdmin = email === ADMIN_EMAIL
  return (
    <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, color: isAdmin ? 'hsl(214 45% 38%)' : 'var(--ink-2)', background: isAdmin ? 'hsl(214 48% 92%)' : 'var(--surface-2)', border: `1px solid ${isAdmin ? 'hsl(214 42% 84%)' : 'var(--line-2)'}` }}>
      {initials(email)}
    </div>
  )
}

function RepliesSection({ post, currentEmail, currentUserId }: { post: Post; currentEmail: string; currentUserId: string }) {
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!open) return
    supabase.from('community_replies').select('*').eq('post_id', post.id).order('created_at', { ascending: true })
      .then(({ data }) => { setReplies(data ?? []); setLoading(false) })
  }, [open, post.id])

  const send = async () => {
    if (!body.trim() || sending) return
    setSending(true)
    const { data, error } = await supabase.from('community_replies').insert({
      post_id: post.id, user_id: currentUserId, user_email: currentEmail, body: body.trim(),
    }).select().single()
    setSending(false)
    if (!error && data) { setReplies(p => [...p, data]); setBody('') }
  }

  return (
    <div style={{ marginTop: 14, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <MessageSquare size={13} />
        {open ? 'Ocultar respostas' : `Ver respostas${replies.length > 0 ? ` (${replies.length})` : ''}`}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--ink-4)' }} />}
          {!loading && replies.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--ink-4)', margin: 0 }}>Nenhuma resposta ainda. Seja o primeiro!</p>}
          {replies.map(r => (
            <div key={r.id} style={{ display: 'flex', gap: 10 }}>
              <Avatar email={r.user_email} />
              <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', padding: '9px 12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{r.user_email === ADMIN_EMAIL ? 'IADI' : r.user_email.split('@')[0]}</span>
                  {r.user_email === ADMIN_EMAIL && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-ink)', background: 'var(--primary-bg)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--primary-line)' }}>Admin</span>}
                  <span style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 'auto' }}>{timeAgo(r.created_at)}</span>
                </div>
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{r.body}</p>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Avatar email={currentEmail} />
            <div style={{ flex: 1, display: 'flex', gap: 8 }}>
              <textarea
                className="field"
                rows={2}
                placeholder="Escreva uma resposta…"
                value={body}
                onChange={e => setBody(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                style={{ resize: 'none', flex: 1 }}
              />
              <button className="btn btn-primary btn-sm" onClick={send} disabled={sending || !body.trim()} style={{ alignSelf: 'flex-end' }}>
                {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Community({ auth, onBack }: Props) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'todos' | 'tutoriais' | 'duvidas' | 'pendentes'>('todos')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<PostType>('duvida')
  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formVideo, setFormVideo] = useState('')
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const email = auth.user?.email ?? ''
  const userId = auth.user?.id ?? ''
  const isAdmin = email === ADMIN_EMAIL

  useEffect(() => {
    let query = supabase.from('community_posts').select('*')
    if (isAdmin) {
      // admin sees everything, ordered: pinned first, then by date
      query = query.order('pinned', { ascending: false }).order('created_at', { ascending: false })
    } else {
      // regular users see: published posts OR their own unpublished questions
      query = query
        .or(`published.eq.true,and(user_id.eq.${userId},type.eq.duvida)`)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
    }
    query.then(({ data }) => { setPosts(data ?? []); setLoading(false) })
  }, [isAdmin, userId])

  const pendingCount = isAdmin ? posts.filter(p => p.type === 'duvida' && !p.published).length : 0

  const filtered = posts.filter(p => {
    if (tab === 'tutoriais') return (p.type === 'tutorial' || p.type === 'video') && p.published
    if (tab === 'duvidas') return p.type === 'duvida' && p.published
    if (tab === 'pendentes') return p.type === 'duvida' && !p.published
    // todos: published content + own pending questions
    if (!isAdmin) return p.published || (p.user_id === userId && p.type === 'duvida')
    return true
  })

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formBody.trim() || saving) return
    setSaving(true)
    // dúvidas de usuários comuns começam como não publicadas (precisam de aprovação)
    const published = isAdmin || formType !== 'duvida'
    const { data, error } = await supabase.from('community_posts').insert({
      user_id: userId,
      user_email: email,
      type: formType,
      title: formTitle.trim(),
      body: formBody.trim(),
      video_url: formVideo.trim() || null,
      pinned: isAdmin && (formType === 'tutorial' || formType === 'video'),
      published,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      setPosts(p => [data, ...p])
      setFormTitle(''); setFormBody(''); setFormVideo(''); setShowForm(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta publicação?')) return
    await supabase.from('community_posts').delete().eq('id', id)
    setPosts(p => p.filter(x => x.id !== id))
  }

  const handleTogglePublish = async (post: Post) => {
    const newVal = !post.published
    await supabase.from('community_posts').update({ published: newVal }).eq('id', post.id)
    setPosts(p => p.map(x => x.id === post.id ? { ...x, published: newVal } : x))
  }

  const openForm = (type: PostType) => { setFormType(type); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100) }

  return (
    <div className="shell">
      <div className="topbar">
        <div className="app-frame">
          <div className="topbar-inner">
            <button className="btn btn-ghost btn-sm" onClick={onBack}><ArrowLeft size={14} /> Painel</button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>Comunidade IADI</span>
            <div style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      <div className="app-frame screen" style={{ padding: '28px 24px 80px', maxWidth: 860 }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Comunidade</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 13.5, margin: 0 }}>Tire dúvidas, compartilhe experiências e acesse tutoriais sobre o IADI.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => openForm('duvida')}>
            <MessageSquare size={14} /> Fazer uma pergunta
          </button>
          {isAdmin && (
            <>
              <button className="btn btn-subtle" onClick={() => openForm('tutorial')}>
                <BookOpen size={14} /> Novo tutorial
              </button>
              <button className="btn btn-subtle" onClick={() => openForm('video')}>
                <PlayCircle size={14} /> Publicar vídeo
              </button>
            </>
          )}
        </div>

        {showForm && (
          <div ref={formRef} className="card card-pad" style={{ marginBottom: 24, borderColor: 'var(--primary-line)', background: 'var(--primary-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PostTypeTag type={formType} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {formType === 'duvida' ? 'Nova dúvida' : formType === 'tutorial' ? 'Novo tutorial' : 'Novo vídeo'}
                </span>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-4)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            {!isAdmin && formType === 'duvida' && (
              <div style={{ marginBottom: 12, padding: '9px 12px', background: 'hsl(214 48% 96%)', borderRadius: 'var(--r-sm)', fontSize: 12.5, color: 'hsl(214 45% 38%)', display: 'flex', gap: 7, alignItems: 'center', border: '1px solid hsl(214 42% 88%)' }}>
                <EyeOff size={13} /> Sua pergunta ficará visível apenas para mim até eu publicar para todos.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div className="label" style={{ marginBottom: 5 }}>Título *</div>
                <input className="field" placeholder={formType === 'duvida' ? 'Descreva sua dúvida em uma frase…' : 'Título do tutorial ou vídeo'} value={formTitle} onChange={e => setFormTitle(e.target.value)} />
              </div>
              <div>
                <div className="label" style={{ marginBottom: 5 }}>{formType === 'duvida' ? 'Detalhes' : 'Descrição'} *</div>
                <textarea className="field" rows={4} placeholder={formType === 'duvida' ? 'Explique com mais detalhes…' : 'Descreva o conteúdo deste tutorial…'} value={formBody} onChange={e => setFormBody(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              {(formType === 'video' || formType === 'tutorial') && (
                <div>
                  <div className="label" style={{ marginBottom: 5 }}>Link do vídeo (YouTube ou URL)</div>
                  <input className="field" placeholder="https://www.youtube.com/watch?v=…" value={formVideo} onChange={e => setFormVideo(e.target.value)} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !formTitle.trim() || !formBody.trim()}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Publicar
                </button>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <div className="seg" style={{ marginBottom: 20 }}>
          {([
            ['todos', 'Todos'],
            ['tutoriais', 'Tutoriais & Vídeos'],
            ['duvidas', 'Dúvidas'],
          ] as const).map(([k, l]) => (
            <button key={k} data-on={tab === k} onClick={() => setTab(k)}>{l}</button>
          ))}
          {isAdmin && (
            <button data-on={tab === 'pendentes'} onClick={() => setTab('pendentes')} style={{ position: 'relative' }}>
              Pendentes
              {pendingCount > 0 && (
                <span style={{ marginLeft: 6, background: 'var(--neg)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>{pendingCount}</span>
              )}
            </button>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Loader2 size={22} className="animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>
            <MessageSquare size={36} style={{ margin: '0 auto 12px', color: 'var(--ink-4)' }} />
            <p style={{ fontSize: 13.5, margin: '0 0 12px' }}>
              {tab === 'tutoriais' ? 'Nenhum tutorial publicado ainda.' : tab === 'duvidas' ? 'Nenhuma dúvida publicada ainda.' : tab === 'pendentes' ? 'Nenhuma pergunta aguardando aprovação.' : 'Nenhuma publicação ainda.'}
            </p>
            {tab !== 'tutoriais' && tab !== 'pendentes' && (
              <button className="btn btn-primary btn-sm" onClick={() => openForm('duvida')}><Plus size={13} /> Fazer uma pergunta</button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(post => {
            const isOwn = post.user_id === userId
            const isAdminPost = post.user_email === ADMIN_EMAIL
            const displayName = isAdminPost ? 'IADI' : post.user_email.split('@')[0]
            const isPending = !post.published

            return (
              <div key={post.id} className="card card-pad" style={{
                borderLeft: post.pinned ? '3px solid var(--primary)' : isPending ? '3px solid var(--part)' : undefined,
                boxShadow: post.pinned ? 'var(--shadow)' : 'var(--shadow-sm)',
                opacity: isPending && !isAdmin ? 0.85 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Avatar email={post.user_email} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{displayName}</span>
                      {isAdminPost && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-ink)', background: 'var(--primary-bg)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--primary-line)' }}>Admin</span>
                      )}
                      <PostTypeTag type={post.type} />
                      {post.pinned && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pos)', background: 'var(--pos-bg)', padding: '1px 7px', borderRadius: 99, border: '1px solid hsl(150 40% 84%)' }}>Fixado</span>}
                      {isPending && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--part)', background: 'var(--part-bg)', padding: '1px 7px', borderRadius: 99, border: '1px solid hsl(36 50% 82%)' }}>
                          {isAdmin ? 'Aguardando aprovação' : 'Aguardando publicação'}
                        </span>
                      )}
                      <span style={{ fontSize: 11.5, color: 'var(--ink-4)', marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
                      {isAdmin && post.type === 'duvida' && (
                        <button
                          onClick={() => handleTogglePublish(post)}
                          title={post.published ? 'Tornar privado' : 'Publicar para todos'}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: post.published ? 'var(--pos-bg)' : 'var(--primary-bg)', border: `1px solid ${post.published ? 'hsl(150 40% 84%)' : 'var(--primary-line)'}`, color: post.published ? 'var(--pos)' : 'var(--primary-ink)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                        >
                          {post.published ? <><Eye size={11} /> Visível</> : <><Globe size={11} /> Publicar</>}
                        </button>
                      )}
                      {(isOwn || isAdmin) && (
                        <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', color: 'var(--ink-4)', cursor: 'pointer', padding: 2 }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px', lineHeight: 1.35 }}>{post.title}</h3>
                    <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{post.body}</p>

                    {post.video_url && <VideoEmbed url={post.video_url} />}
                  </div>
                </div>

                <RepliesSection post={post} currentEmail={email} currentUserId={userId} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
