/** Shared dark-navy base layout for all Gainline transactional emails */
export function emailBase(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0C0F16;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px 48px;">

    <!-- Logo -->
    <div style="margin-bottom:32px;">
      <span style="font-family:'Arial Black',Arial,sans-serif;font-size:20px;font-weight:900;color:white;letter-spacing:-0.5px;">
        GAIN<span style="color:#3DBE72;">LINE</span>
      </span>
    </div>

    <!-- Content card -->
    <div style="background:#161C2A;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;margin-bottom:24px;">
      ${content}
    </div>

    <!-- Footer -->
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);text-align:center;line-height:1.8;">
      You received this from Gainline because you have an account.<br>
      <a href="https://gainline.pro" style="color:rgba(61,190,114,0.6);text-decoration:none;">gainline.pro</a>
    </p>

  </div>
</body>
</html>`
}

/** Reusable header band */
export function emailHeader(label: string, title: string): string {
  return `<div style="background:linear-gradient(160deg,#0D1B2E,#0F2E1E);padding:24px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#3DBE72;">${label}</p>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:white;line-height:1.2;">${title}</h1>
  </div>`
}

/** Reusable CTA button */
export function emailBtn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#3DBE72;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.3px;">${label} →</a>`
}

/** Reusable info box */
export function emailBox(rows: { label: string; value: string }[]): string {
  return `<div style="background:#1C2338;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;margin-bottom:20px;">
    ${rows.map(r => `
      <div style="margin-bottom:8px;">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">${r.label}</p>
        <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:white;">${r.value}</p>
      </div>`).join('')}
  </div>`
}

/** Reusable body text */
export function emailP(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">${text}</p>`
}
