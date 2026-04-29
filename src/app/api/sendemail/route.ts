import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  const { fullName, email, organisation, role, country, message } = body

  try {
    // Email to you (admin notification)
    await resend.emails.send({
      from: 'Gainline <noreply@gainline.pro>',
      to: 'bruce@necta.co.za',
      subject: `New coach registration — ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0D1B2E; padding: 24px 28px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; font-size: 20px; margin: 0;">New coach registration</h1>
          </div>
          <div style="background: #F1EFE8; padding: 28px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #888780; width: 140px;">Name</td><td style="padding: 8px 0; color: #0D1B2E; font-weight: bold;">${fullName}</td></tr>
              <tr><td style="padding: 8px 0; color: #888780;">Email</td><td style="padding: 8px 0; color: #0D1B2E;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #888780;">Organisation</td><td style="padding: 8px 0; color: #0D1B2E;">${organisation}</td></tr>
              <tr><td style="padding: 8px 0; color: #888780;">Role</td><td style="padding: 8px 0; color: #0D1B2E;">${role}</td></tr>
              <tr><td style="padding: 8px 0; color: #888780;">Country</td><td style="padding: 8px 0; color: #0D1B2E;">${country}</td></tr>
              ${message ? `<tr><td style="padding: 8px 0; color: #888780; vertical-align: top;">Message</td><td style="padding: 8px 0; color: #0D1B2E;">${message}</td></tr>` : ''}
            </table>
            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #D3D1C7;">
              <a href="https://supabase.com/dashboard/project/vsfnjjxmkftdmcyygjca/editor/17739?schema=public&table=profiles&filter=approved%3Aeq%3Afalse" style="background: #1D9E75; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">Review in Supabase →</a>
            </div>
          </div>
        </div>
      `,
    })

    // Confirmation email to the coach
    await resend.emails.send({
      from: 'Gainline <noreply@gainline.pro>',
      to: email,
      subject: 'Your Gainline coach application has been received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0D1B2E; padding: 24px 28px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; font-size: 20px; margin: 0;">Thanks for registering, ${fullName.split(' ')[0]}!</h1>
          </div>
          <div style="background: #F1EFE8; padding: 28px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #5F5E5A; line-height: 1.7; margin-bottom: 16px;">
              We've received your application to join Gainline as a coach or recruiter. Our team will review your details and get back to you within 1–2 business days.
            </p>
            <p style="font-size: 14px; color: #5F5E5A; line-height: 1.7; margin-bottom: 16px;">
              Once approved, you'll be able to log in and access the full player browser, shortlist players, and view their documents.
            </p>
            <p style="font-size: 14px; color: #5F5E5A; line-height: 1.7;">
              In the meantime, if you have any questions feel free to reply to this email.
            </p>
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #D3D1C7; font-size: 12px; color: #888780;">
              Gainline · gainline.pro
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}