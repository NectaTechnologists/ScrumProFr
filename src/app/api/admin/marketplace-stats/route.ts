import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service-role client — never exposed to the browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [cvStats, topViewed, appStats, vacPerf] = await Promise.all([
      supabaseAdmin.rpc('admin_cv_stats', { days: 30 }),
      supabaseAdmin.rpc('admin_top_viewed_players', { lim: 10 }),
      supabaseAdmin.rpc('admin_app_stats', { days: 30 }),
      supabaseAdmin.rpc('admin_vacancy_perf'),
    ])

    if (cvStats.error) throw cvStats.error
    if (appStats.error) throw appStats.error

    return NextResponse.json({
      cv: cvStats.data?.[0] ?? null,
      topViewed: topViewed.data ?? [],
      apps: appStats.data?.[0] ?? null,
      vacancyPerf: vacPerf.data ?? [],
    })
  } catch (err: any) {
    console.error('admin/marketplace-stats error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
