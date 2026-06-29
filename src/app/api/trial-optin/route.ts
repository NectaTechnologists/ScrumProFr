import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, organisationName, phone, notes, sourceRef } =
      await req.json()

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      )
    }

    let profileId: string | null = null
    if (sourceRef) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', sourceRef)
        .maybeSingle()
      if (profile) profileId = profile.id
    }

    const { error: insertError } = await supabaseAdmin
      .from('trial_optins')
      .insert({
        profile_id: profileId,
        full_name: fullName,
        email,
        organisation_name: organisationName || null,
        phone: phone || null,
        notes: notes || null,
        source_ref: sourceRef || null,
      })

    if (insertError) throw insertError

    const now = new Date()
    const expires = new Date(now)
    expires.setMonth(expires.getMonth() + 24)

    if (profileId) {
      await supabaseAdmin
        .from('profiles')
        .update({
          trial_status: 'opted_in',
          trial_opted_in_at: now.toISOString(),
          trial_expires_at: expires.toISOString(),
        })
        .eq('id', profileId)
    }

    const expiryDate = expires.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    await resend.emails.send({
      from: 'Gainline <hello@gainline.pro>',
      to: 'bruce@necta.co.za',
      subject: `Trial opt-in: ${fullName}${organisationName ? ` (${organisationName})` : ''}`,
      html: `
        <p><strong>${fullName}</strong> just opted into the 24-month coach trial.</p>
        <ul>
          <li>Email: ${email}</li>
          <li>Club/org: ${organisationName || '—'}</li>
          <li>Phone: ${phone || '—'}</li>
          <li>Notes: ${notes || '—'}</li>
          <li>Profile matched: ${profileId ? 'Yes — ' + profileId : 'No match found'}</li>
          ${profileId ? `<li>Trial expires: ${expiryDate}</li>` : ''}
        </ul>
        <p><a href="https://supabase.com/dashboard/project/vsfnjjxmkftdmcyygjca/editor?schema=public&table=trial_optins">View in Supabase →</a></p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('trial-optin error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
