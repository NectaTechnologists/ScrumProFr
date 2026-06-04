'use client'
import Image from 'next/image'

import { usePathname } from 'next/navigation'

type CoachData = { name: string; club: string; initials: string } | null

interface Props {
  coachData: CoachData
  newAppsCount: number
  onClose?: () => void
}

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/dashboard/coach/dashboard',         exact: false },
  { label: 'Players',      href: '/dashboard/coach',                   exact: true },
  { label: 'My Vacancies', href: '/dashboard/coach/vacancies',         exact: true },
  { label: 'Applications', href: '/dashboard/coach/applications',      exact: false, badge: true },
  { label: 'Post Vacancy', href: '/dashboard/coach/vacancies/new',     exact: false },
  { label: 'My Coach Card',href: '/dashboard/coach/card',              exact: false },
  { label: 'Settings',     href: '/dashboard/coach/settings',          exact: false },
]

export default function CoachSideNav({ coachData, newAppsCount, onClose }: Props) {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#12161F',
      borderRight: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Logo */}
      <a
        href="/dashboard/coach"
        onClick={onClose}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '18px 16px',
          textDecoration: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}
      >
        <Image src="/gainline-logo-final.svg" alt="Gainline" width={160} height={48} priority />
      </a>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 16px',
                textDecoration: 'none',
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: active ? 700 : 400,
                color: active ? '#F0EDE4' : '#9EA8B8',
                background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderLeft: active ? '3px solid #D4A843' : '3px solid transparent',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              {item.label}
              {item.badge && newAppsCount > 0 && (
                <span style={{
                  background: '#2ec97e',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  lineHeight: 1.4,
                }}>
                  {newAppsCount}
                </span>
              )}
            </a>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {coachData ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                background: '#1C2338',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#D4A843', fontSize: '11px', fontWeight: 900, fontFamily: 'Arial Black, Arial, sans-serif' }}>
                  {coachData.initials || '?'}
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#F0EDE4', fontFamily: 'Arial, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {coachData.name || 'Coach'}
                </div>
                {coachData.club && (
                  <div style={{ fontSize: '10px', color: '#5A564F', fontFamily: 'Arial, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {coachData.club}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ height: 36, marginBottom: 10 }} />
        )}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#5A564F',
              fontSize: '12px',
              fontFamily: 'Arial, sans-serif',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left',
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
