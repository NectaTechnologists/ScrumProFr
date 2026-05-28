'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import CoachSideNav from '@/components/CoachSideNav'

type CoachData = { name: string; club: string; initials: string } | null

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/coach':                  'Players',
  '/dashboard/coach/dashboard':        'Dashboard',
  '/dashboard/coach/applications':     'Applications',
  '/dashboard/coach/vacancies':        'My Vacancies',
  '/dashboard/coach/vacancies/new':    'Post Vacancy',
  '/dashboard/coach/card':             'My Coach Card',
  '/dashboard/coach/settings':         'Settings',
}

function getPageTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/dashboard/coach/vacancies/')) return 'Vacancy Applications'
  return 'Coach Portal'
}

const FLAG_EN = '🇬🇧'
const FLAG_FR = '🇫🇷'

export default function CoachPortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [coachData, setCoachData] = useState<CoachData>(null)
  const [newAppsCount, setNewAppsCount] = useState(0)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [lang, setLang] = useState<'en' | 'fr'>('en')

  useEffect(() => {
    const saved = localStorage.getItem('gainline_lang')
    if (saved === 'en' || saved === 'fr') setLang(saved)
    load()
  }, [])

  // Close mobile drawer on route change
  useEffect(() => { setShowMobileSidebar(false) }, [pathname])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const { data: prof } = await supabase
      .from('profiles')
      .select('is_coach, role')
      .eq('id', user.id)
      .single()
    if (!prof?.is_coach && prof?.role !== 'org_user') {
      router.replace('/dashboard')
      return
    }

    const { data: coach } = await supabase
      .from('coaches')
      .select('id, full_name, organisation')
      .eq('profile_id', user.id)
      .single()

    if (coach) {
      const name = coach.full_name || ''
      const initials = name.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('')
      setCoachData({ name, club: coach.organisation || '', initials })

      const { count } = await supabase
        .from('vacancy_applications')
        .select('id', { count: 'exact', head: true })
        .eq('coach_id', coach.id)
        .eq('status', 'new')
      setNewAppsCount(count || 0)
    }
  }

  function toggleLang(l: 'en' | 'fr') {
    setLang(l)
    localStorage.setItem('gainline_lang', l)
  }

  const pageTitle = getPageTitle(pathname || '')

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #0C0F16; }

        .coach-portal { display: flex; min-height: 100vh; }

        /* ── Sidebar ─────────────────────────────── */
        .coach-sidebar {
          width: 220px;
          flex-shrink: 0;
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          z-index: 50;
          display: none;
        }
        .coach-sidebar-mobile-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0,0,0,0.6);
          display: flex;
        }
        .coach-sidebar-mobile-drawer {
          width: 220px;
          height: 100%;
          flex-shrink: 0;
        }

        /* ── Main area ───────────────────────────── */
        .coach-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-width: 0;
        }

        /* ── Top bar ─────────────────────────────── */
        .coach-topbar {
          height: 52px;
          background: #0C0F16;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 40;
          flex-shrink: 0;
        }
        .coach-hamburger {
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
          flex-shrink: 0;
          display: flex;
        }
        .coach-topbar-title {
          font-size: 14px;
          font-weight: 700;
          color: #F0EDE4;
          font-family: Arial, sans-serif;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .coach-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .coach-lang-toggle {
          display: flex;
          gap: 2px;
          background: rgba(255,255,255,0.08);
          padding: 3px;
          border-radius: 8px;
        }
        .coach-lang-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
          width: 26px;
          height: 22px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .coach-lang-btn-active { background: rgba(255,255,255,0.15); }
        .coach-avatar {
          width: 28px;
          height: 28px;
          border-radius: '6px';
          background: #1C2338;
          border: 1px solid rgba(212,168,67,0.25);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .coach-avatar span {
          color: #D4A843;
          font-size: 10px;
          font-weight: 900;
          font-family: Arial Black, Arial, sans-serif;
        }

        /* ── Content ─────────────────────────────── */
        .coach-content {
          flex: 1;
          min-width: 0;
        }

        /* ── Desktop: show sidebar, offset main ─── */
        @media (min-width: 769px) {
          .coach-sidebar { display: block; }
          .coach-hamburger { display: none; }
          .coach-main { margin-left: 220px; }
        }
      `}</style>

      {/* Mobile sidebar overlay */}
      {showMobileSidebar && (
        <div className="coach-sidebar-mobile-overlay" onClick={() => setShowMobileSidebar(false)}>
          <div className="coach-sidebar-mobile-drawer" onClick={e => e.stopPropagation()}>
            <CoachSideNav
              coachData={coachData}
              newAppsCount={newAppsCount}
              onClose={() => setShowMobileSidebar(false)}
            />
          </div>
          {/* Tap outside to close */}
          <div style={{ flex: 1 }} />
        </div>
      )}

      <div className="coach-portal">
        {/* Desktop sidebar */}
        <aside className="coach-sidebar">
          <CoachSideNav coachData={coachData} newAppsCount={newAppsCount} />
        </aside>

        {/* Main area */}
        <div className="coach-main">
          {/* Top bar */}
          <div className="coach-topbar">
            <button className="coach-hamburger" onClick={() => setShowMobileSidebar(true)} aria-label="Open menu">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="2" y1="4" x2="16" y2="4"/>
                <line x1="2" y1="9" x2="16" y2="9"/>
                <line x1="2" y1="14" x2="16" y2="14"/>
              </svg>
            </button>
            <span className="coach-topbar-title">{pageTitle}</span>
            <div className="coach-topbar-right">
              <div className="coach-lang-toggle">
                <button
                  className={`coach-lang-btn${lang === 'en' ? ' coach-lang-btn-active' : ''}`}
                  onClick={() => toggleLang('en')}
                  title="English"
                >
                  {FLAG_EN}
                </button>
                <button
                  className={`coach-lang-btn${lang === 'fr' ? ' coach-lang-btn-active' : ''}`}
                  onClick={() => toggleLang('fr')}
                  title="Français"
                >
                  {FLAG_FR}
                </button>
              </div>
              {coachData && (
                <div className="coach-avatar">
                  <span>{coachData.initials || '?'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Page content */}
          <div className="coach-content">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
