'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { t, Lang } from '@/lib/translations'

const FLAG_EN = '🇬🇧'
const FLAG_FR = '🇫🇷'

const positions = [
  'LOOSEHEAD_PROP','HOOKER','TIGHTHEAD_PROP',
  'LEFT_LOCK','RIGHT_LOCK',
  'BLINDSIDE_FLANKER','OPENSIDE_FLANKER','NUMBER_8',
  'SCRUMHALF','FLYHALF',
  'LEFT_WING','INSIDE_CENTRE','OUTSIDE_CENTRE','RIGHT_WING','FULLBACK'
]

const DOCUMENT_TYPES = [
  'Fitness Report',
  'Medical Clearance',
  'Coaching Certificate',
  'Training Assessment',
  'Academic Certificate',
  'Player Contract',
  'Other',
]

const COMPLETION_FIELDS = [
  { key: 'first_name', weight: 10 },
  { key: 'last_name', weight: 10 },
  { key: 'date_of_birth', weight: 10 },
  { key: 'nationality_primary', weight: 10 },
  { key: 'position_primary', weight: 10 },
  { key: 'height_cm', weight: 10 },
  { key: 'weight_kg', weight: 10 },
  { key: 'school_attended', weight: 5 },
  { key: 'bio', weight: 10 },
  { key: 'video_url', weight: 10 },
  { key: 'avatar_url', weight: 5 },
]

function calcCompletion(form: any) {
  const total = COMPLETION_FIELDS.reduce((sum, f) => sum + f.weight, 0)
  const earned = COMPLETION_FIELDS.reduce((sum, f) => sum + (form[f.key] && form[f.key] !== '' ? f.weight : 0), 0)
  return Math.round((earned / total) * 100)
}

function getMissingKeys(form: any) {
  return COMPLETION_FIELDS.filter(f => !form[f.key] || form[f.key] === '').map(f => f.key)
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [completion, setCompletion] = useState(0)
  const [missingKeys, setMissingKeys] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'media' | 'documents'>('profile')
  const [lang, setLang] = useState<Lang>('en')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [playerId, setPlayerId] = useState<string>('')
  const [documents, setDocuments] = useState<any[]>([])
  const [docUploading, setDocUploading] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState('Fitness Report')

  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', nationality_primary: '',
    position_primary: 'HOOKER', position_secondary: '', height_cm: '', weight_kg: '',
    school_attended: '', bio: '', video_url: '', video_url_2: '', video_url_3: '',
    avatar_url: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('gainline_lang') as Lang
    if (saved === 'en' || saved === 'fr') setLang(saved)

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: player } = await supabase.from('players').select('*').eq('profile_id', user.id).single()
      if (player) {
        setPlayerId(player.id)
        const loaded = {
          first_name: player.first_name || '', last_name: player.last_name || '',
          date_of_birth: player.date_of_birth || '', nationality_primary: player.nationality_primary || '',
          position_primary: player.position_primary || 'HOOKER', position_secondary: player.position_secondary || '',
          height_cm: player.height_cm || '', weight_kg: player.weight_kg || '',
          school_attended: player.school_attended || '', bio: player.bio || '',
          video_url: player.video_url || '', video_url_2: player.video_url_2 || '',
          video_url_3: player.video_url_3 || '', avatar_url: player.avatar_url || '',
        }
        setForm(loaded)
        setCompletion(calcCompletion(loaded))
        setMissingKeys(getMissingKeys(loaded))
        setShareUrl(`${window.location.origin}/cv/${player.share_token}`)

        // Load documents
        const { data: docs } = await supabase
          .from('player_documents')
          .select('*')
          .eq('player_id', player.id)
          .order('created_at', { ascending: false })
        setDocuments(docs || [])
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    setCompletion(calcCompletion(form))
    setMissingKeys(getMissingKeys(form))
  }, [form])

  function toggleLang(l: Lang) {
    setLang(l)
    localStorage.setItem('gainline_lang', l)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return }
    setAvatarUploading(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
    if (uploadError) { alert('Upload failed: ' + uploadError.message); setAvatarUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
    await supabase.from('players').update({ avatar_url: publicUrl }).eq('profile_id', userId)
    setForm(prev => ({ ...prev, avatar_url: publicUrl }))
    setAvatarUploading(false)
  }

  async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId || !playerId) return

    // Validate
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) { alert('Please upload a PDF or image file'); return }
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return }
    if (documents.length >= 5) { alert(lang === 'fr' ? 'Maximum 5 documents atteint' : 'Maximum of 5 documents reached'); return }

    setDocUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: false })

    if (uploadError) { alert('Upload failed: ' + uploadError.message); setDocUploading(false); return }

    // Get signed URL path (not public — private bucket)
    const { data: { signedUrl } } = await supabase.storage
      .from('documents')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year expiry

    // Save to database
    const { data: newDoc } = await supabase
      .from('player_documents')
      .insert({
        player_id: playerId,
        profile_id: userId,
        file_name: file.name,
        file_url: fileName, // store path, not URL
        document_type: selectedDocType,
        file_type: file.type,
        file_size_kb: Math.round(file.size / 1024),
      })
      .select()
      .single()

    if (newDoc) {
      setDocuments(prev => [{ ...newDoc, signed_url: signedUrl }, ...prev])
    }

    setDocUploading(false)
    // Reset file input
    if (docInputRef.current) docInputRef.current.value = ''
  }

  async function handleDeleteDocument(doc: any) {
    if (!confirm(lang === 'fr' ? 'Supprimer ce document ?' : 'Delete this document?')) return

    // Delete from storage
    await supabase.storage.from('documents').remove([doc.file_url])

    // Delete from database
    await supabase.from('player_documents').delete().eq('id', doc.id)

    setDocuments(prev => prev.filter(d => d.id !== doc.id))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: existing } = await supabase.from('players').select('id').eq('profile_id', user.id).single()
    const playerData = {
      profile_id: user.id, first_name: form.first_name, last_name: form.last_name,
      date_of_birth: form.date_of_birth, nationality_primary: form.nationality_primary,
      position_primary: form.position_primary, position_secondary: form.position_secondary || null,
      height_cm: form.height_cm ? parseInt(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      school_attended: form.school_attended, bio: form.bio,
      video_url: form.video_url || null, video_url_2: form.video_url_2 || null,
      video_url_3: form.video_url_3 || null, avatar_url: form.avatar_url || null,
      profile_visibility: 'PUBLIC',
    }
    let result
    if (existing) {
      result = await supabase.from('players').update(playerData).eq('profile_id', user.id).select().single()
    } else {
      result = await supabase.from('players').insert(playerData).select().single()
    }
    if (result.data) {
      setShareUrl(`${window.location.origin}/cv/${result.data.share_token}`)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  const T = t[lang]
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (completion / 100) * circ
  const ringColor = completion < 40 ? '#F0A500' : completion < 70 ? '#1D9E75' : '#0F6E56'

  const fieldLabels: Record<string, string> = {
    first_name: T.profile_first_name, last_name: T.profile_last_name,
    date_of_birth: T.profile_dob, nationality_primary: T.profile_nationality,
    position_primary: T.profile_position_primary, height_cm: T.profile_height,
    weight_kg: T.profile_weight, school_attended: T.profile_school,
    bio: T.profile_bio, video_url: T.profile_video_1,
    avatar_url: lang === 'fr' ? 'Photo de profil' : 'Profile photo',
  }

  const missingLabels = missingKeys.map(k => fieldLabels[k] || k).filter(Boolean)
  const initials = [form.first_name?.[0], form.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  const formatFileSize = (kb: number) => kb > 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, Arial, sans-serif; background: #F1EFE8; }
        .prof-nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .prof-logo { display: flex; align-items: center; gap: 10px; }
        .prof-logo-text { color: white; font-weight: 900; font-size: 18px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .prof-nav-right { display: flex; align-items: center; gap: 12px; }
        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 16px; width: 30px; height: 26px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .lang-btn-active { background: rgba(255,255,255,0.15); }
        .prof-back { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 14px; font-family: system-ui; white-space: nowrap; }
        .prof-content { max-width: 700px; margin: 0 auto; padding: 32px 20px; }
        .prof-title { font-size: 24px; font-weight: 700; color: #0D1B2E; margin-bottom: 6px; font-family: 'Arial Black', Arial, sans-serif; }
        .prof-subtitle { color: #888780; margin-bottom: 20px; font-size: 14px; }
        .share-box { background: rgba(29,158,117,0.08); border: 1px solid rgba(29,158,117,0.3); border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .share-box-inner { flex: 1; min-width: 0; }
        .share-label { font-size: 12px; font-weight: 700; color: #1D9E75; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .share-url { font-size: 13px; color: #0D1B2E; font-family: monospace; word-break: break-all; }
        .copy-btn { background: #1D9E75; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
        .tabs { display: flex; gap: 2px; background: white; padding: 3px; border-radius: 10px; border: 0.5px solid #D3D1C7; margin-bottom: 20px; }
        .tab { flex: 1; padding: 10px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; font-family: Arial, sans-serif; background: transparent; color: #888780; text-align: center; }
        .tab-active { background: #0D1B2E; color: white; }
        .prof-form { background: white; border-radius: 12px; padding: 28px; border: 1px solid #E8E4F0; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 600; color: #0D1B2E; }
        .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E8E4F0; border-radius: 8px; font-size: 14px; outline: none; font-family: system-ui; background: white; color: #0D1B2E; -webkit-text-fill-color: #0D1B2E; }
        .form-input:focus { border-color: #1D9E75; }
        .form-input::placeholder { color: #B4B2A9; -webkit-text-fill-color: #B4B2A9; }
        .form-full { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
        .form-textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #E8E4F0; border-radius: 8px; font-size: 14px; outline: none; font-family: system-ui; height: 100px; resize: none; color: #0D1B2E; }
        .form-textarea:focus { border-color: #1D9E75; }
        .form-textarea::placeholder { color: #B4B2A9; }
        .save-btn { width: 100%; padding: 13px; background: #1D9E75; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Arial Black', Arial, sans-serif; margin-top: 8px; }
        .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .section-title { font-size: 11px; color: #1D9E75; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 16px; }
        .video-hint { font-size: 12px; color: #888780; margin-top: 6px; }
        .avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #F1EFE8; }
        .avatar-preview { width: 80px; height: 80px; border-radius: 16px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-initials { color: white; font-size: 26px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .avatar-upload-area { flex: 1; }
        .avatar-upload-label { font-size: 13px; font-weight: 600; color: #0D1B2E; margin-bottom: 6px; display: block; }
        .avatar-upload-hint { font-size: 12px; color: #888780; margin-bottom: 10px; }
        .avatar-upload-btn { background: #F1EFE8; border: 1.5px solid #D3D1C7; color: #0D1B2E; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: Arial, sans-serif; display: inline-block; }
        .avatar-upload-btn:hover { border-color: #1D9E75; }

        /* Document styles */
        .doc-upload-area { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #F1EFE8; }
        .doc-type-row { display: flex; gap: 10px; margin-bottom: 12px; align-items: flex-end; flex-wrap: wrap; }
        .doc-type-select { flex: 1; padding: 10px 14px; border: 1.5px solid #E8E4F0; border-radius: 8px; font-size: 14px; outline: none; font-family: system-ui; background: white; color: #0D1B2E; min-width: 160px; }
        .doc-type-select:focus { border-color: #1D9E75; }
        .doc-upload-btn { background: #1D9E75; color: white; border: none; border-radius: 8px; padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; white-space: nowrap; flex-shrink: 0; }
        .doc-upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .doc-hint { font-size: 12px; color: #888780; }
        .doc-list { display: flex; flex-direction: column; gap: 10px; }
        .doc-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #F8F7F4; border-radius: 8px; border: 0.5px solid #D3D1C7; }
        .doc-icon { width: 36px; height: 36px; border-radius: 8px; background: #E1F5EE; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .doc-info { flex: 1; min-width: 0; }
        .doc-name { font-size: 13px; font-weight: 700; color: #0D1B2E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .doc-meta { font-size: 11px; color: #888780; margin-top: 2px; }
        .doc-delete { background: none; border: none; color: #C4C2BA; cursor: pointer; font-size: 18px; flex-shrink: 0; padding: 4px; }
        .doc-delete:hover { color: #E05555; }
        .doc-empty { text-align: center; padding: 32px 20px; color: #888780; font-size: 14px; }
        .doc-count { font-size: 12px; color: #888780; margin-bottom: 12px; }
        .doc-private-note { background: #F1EFE8; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: flex-start; gap: 10px; }
        .doc-private-note p { font-size: 12px; color: #5F5E5A; line-height: 1.6; }

        @media (max-width: 768px) {
          .prof-nav { padding: 0 16px; height: 56px; }
          .prof-logo-text { font-size: 16px; }
          .prof-back { font-size: 13px; }
          .prof-content { padding: 24px 16px; }
          .prof-title { font-size: 20px; }
          .form-row { grid-template-columns: 1fr; gap: 12px; }
          .prof-form { padding: 20px 16px; }
          .share-box { flex-direction: column; align-items: flex-start; }
          .copy-btn { width: 100%; text-align: center; }
          .avatar-section { flex-direction: column; align-items: flex-start; gap: 16px; }
          .doc-type-row { flex-direction: column; }
          .doc-upload-btn { width: 100%; text-align: center; }
        }
      `}</style>

      <nav className="prof-nav">
        <div className="prof-logo">
          <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="prof-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </div>
        <div className="prof-nav-right">
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('en')}>{FLAG_EN}</button>
            <button className={`lang-btn ${lang === 'fr' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('fr')}>{FLAG_FR}</button>
          </div>
          <button onClick={() => router.push('/dashboard')} className="prof-back">{T.nav_back_dashboard}</button>
        </div>
      </nav>

      <div className="prof-content">
        <h1 className="prof-title">{T.profile_title}</h1>
        <p className="prof-subtitle">{T.profile_sub}</p>

        {/* Completion ring */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', border: '0.5px solid #D3D1C7', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '88px', height: '88px', flexShrink: 0 }}>
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r={r} fill="none" stroke="#F1EFE8" strokeWidth="8"/>
              <circle cx="44" cy="44" r={r} fill="none" stroke={ringColor} strokeWidth="8"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 44 44)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#0D1B2E', fontFamily: 'Arial Black, Arial, sans-serif' }}>{completion}%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#0D1B2E', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '4px' }}>
              {completion === 100 ? T.completion_complete : completion >= 70 ? T.completion_strong : completion >= 40 ? T.completion_getting : T.completion_starting}
            </div>
            <div style={{ fontSize: '13px', color: '#5F5E5A', lineHeight: '1.5' }}>
              {completion === 100
                ? T.completion_done
                : missingLabels.length > 0
                  ? `${T.completion_missing} ${missingLabels.slice(0, 3).join(', ')}${missingLabels.length > 3 ? ` +${missingLabels.length - 3}` : ''}`
                  : T.completion_done
              }
            </div>
          </div>
        </div>

        {shareUrl && (
          <div className="share-box">
            <div className="share-box-inner">
              <div className="share-label">{T.profile_share_label}</div>
              <div className="share-url">{shareUrl}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert(lang === 'fr' ? 'Lien copié !' : 'Link copied!') }} className="copy-btn">
              {T.profile_copy}
            </button>
          </div>
        )}

        <div className="tabs">
          <button className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`} onClick={() => setActiveTab('profile')}>{T.profile_tab_profile}</button>
          <button className={`tab ${activeTab === 'media' ? 'tab-active' : ''}`} onClick={() => setActiveTab('media')}>{T.profile_tab_media}</button>
          <button className={`tab ${activeTab === 'documents' ? 'tab-active' : ''}`} onClick={() => setActiveTab('documents')}>{T.profile_tab_docs}</button>
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="prof-form">
            <div className="avatar-section">
              <div className="avatar-preview">
                {form.avatar_url ? <img src={form.avatar_url} alt="Profile" /> : <span className="avatar-initials">{initials}</span>}
              </div>
              <div className="avatar-upload-area">
                <label className="avatar-upload-label">{lang === 'fr' ? 'Photo de profil' : 'Profile photo'}</label>
                <p className="avatar-upload-hint">{lang === 'fr' ? 'JPG ou PNG, max 5MB' : 'JPG or PNG, max 5MB'}</p>
                {avatarUploading
                  ? <span style={{ fontSize: '13px', color: '#1D9E75' }}>{lang === 'fr' ? 'Téléversement...' : 'Uploading...'}</span>
                  : <button type="button" className="avatar-upload-btn" onClick={() => fileInputRef.current?.click()}>{form.avatar_url ? (lang === 'fr' ? 'Changer la photo' : 'Change photo') : (lang === 'fr' ? 'Ajouter une photo' : 'Add photo')}</button>
                }
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field"><label className="form-label">{T.profile_first_name}</label><input className="form-input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required placeholder="Abonga"/></div>
              <div className="form-field"><label className="form-label">{T.profile_last_name}</label><input className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required placeholder="Nkwelo"/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">{T.profile_dob}</label><input className="form-input" type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} required/></div>
              <div className="form-field"><label className="form-label">{T.profile_nationality}</label><input className="form-input" value={form.nationality_primary} onChange={e => setForm({ ...form, nationality_primary: e.target.value })} placeholder="South African"/></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">{T.profile_position_primary}</label>
                <select className="form-input" value={form.position_primary} onChange={e => setForm({ ...form, position_primary: e.target.value })}>
                  {positions.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-field"><label className="form-label">{T.profile_position_secondary}</label>
                <select className="form-input" value={form.position_secondary} onChange={e => setForm({ ...form, position_secondary: e.target.value })}>
                  <option value="">{T.profile_none}</option>
                  {positions.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">{T.profile_height}</label><input className="form-input" type="number" value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })} placeholder="187"/></div>
              <div className="form-field"><label className="form-label">{T.profile_weight}</label><input className="form-input" type="number" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} placeholder="110"/></div>
            </div>
            <div className="form-full"><label className="form-label">{T.profile_school}</label><input className="form-input" value={form.school_attended} onChange={e => setForm({ ...form, school_attended: e.target.value })} placeholder="St Andrews College"/></div>
            <div className="form-full"><label className="form-label">{T.profile_bio}</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Experienced front-row forward..."/>
            </div>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? T.profile_saving : saved ? T.profile_saved : T.profile_save}
            </button>
          </form>
        )}

        {activeTab === 'media' && (
          <form onSubmit={handleSave} className="prof-form">
            <p className="section-title">{T.profile_video_title}</p>
            <p style={{ fontSize: '13px', color: '#5F5E5A', marginBottom: '20px', lineHeight: '1.65' }}>{T.profile_video_sub}</p>
            <div className="form-full"><label className="form-label">{T.profile_video_1}</label><input className="form-input" type="url" value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..."/><p className="video-hint">{T.profile_video_1_hint}</p></div>
            <div className="form-full"><label className="form-label">{T.profile_video_2}</label><input className="form-input" type="url" value={form.video_url_2} onChange={e => setForm({ ...form, video_url_2: e.target.value })} placeholder="https://youtube.com/watch?v=..."/></div>
            <div className="form-full"><label className="form-label">{T.profile_video_3}</label><input className="form-input" type="url" value={form.video_url_3} onChange={e => setForm({ ...form, video_url_3: e.target.value })} placeholder="https://vimeo.com/..."/></div>
            <button type="submit" disabled={loading} className="save-btn">{loading ? T.profile_saving : saved ? T.profile_saved : T.profile_video_save}</button>
          </form>
        )}

        {activeTab === 'documents' && (
          <div className="prof-form">
            {/* Privacy note */}
            <div className="doc-private-note">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                <rect x="3" y="7" width="10" height="8" rx="2" stroke="#1D9E75" strokeWidth="1.5"/>
                <path d="M5 7V5a3 3 0 016 0v2" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p>{lang === 'fr'
                ? 'Vos documents sont privés et ne sont visibles que par les entraîneurs et agents vérifiés sur Gainline — jamais sur votre CV public.'
                : 'Your documents are private and only visible to verified coaches and agents on Gainline — never on your public CV.'
              }</p>
            </div>

            {/* Upload area */}
            <div className="doc-upload-area">
              <p className="section-title">{lang === 'fr' ? 'AJOUTER UN DOCUMENT' : 'ADD DOCUMENT'}</p>
              <div className="doc-type-row">
                <select className="doc-type-select" value={selectedDocType} onChange={e => setSelectedDocType(e.target.value)}>
                  {DOCUMENT_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                </select>
                <button type="button" className="doc-upload-btn" disabled={docUploading || documents.length >= 5} onClick={() => docInputRef.current?.click()}>
                  {docUploading ? (lang === 'fr' ? 'Téléversement...' : 'Uploading...') : (lang === 'fr' ? '+ Ajouter un fichier' : '+ Add file')}
                </button>
                <input ref={docInputRef} type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleDocumentUpload} />
              </div>
              <p className="doc-hint">{lang === 'fr' ? 'PDF ou image, max 10MB. Maximum 5 documents.' : 'PDF or image, max 10MB. Maximum 5 documents.'}</p>
            </div>

            {/* Document list */}
            <p className="doc-count">{documents.length}/5 {lang === 'fr' ? 'documents' : 'documents'}</p>
            {documents.length > 0 ? (
              <div className="doc-list">
                {documents.map(doc => (
                  <div key={doc.id} className="doc-item">
                    <div className="doc-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="1" width="10" height="14" rx="2" stroke="#1D9E75" strokeWidth="1.5"/>
                        <line x1="5" y1="5" x2="9" y2="5" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="5" y1="8" x2="9" y2="8" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="5" y1="11" x2="7" y2="11" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="doc-info">
                      <div className="doc-name">{doc.file_name}</div>
                      <div className="doc-meta">{doc.document_type} · {doc.file_size_kb ? formatFileSize(doc.file_size_kb) : '–'}</div>
                    </div>
                    <button className="doc-delete" onClick={() => handleDeleteDocument(doc)} title={lang === 'fr' ? 'Supprimer' : 'Delete'}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="doc-empty">
                <p>{lang === 'fr' ? 'Aucun document encore. Ajoutez vos certificats et rapports ci-dessus.' : 'No documents yet. Add your certificates and reports above.'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
