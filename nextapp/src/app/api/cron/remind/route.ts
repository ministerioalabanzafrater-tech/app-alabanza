import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.PUSH_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const now = new Date()

  // Events in exactly 7 days OR 2 days (same calendar day, any hour)
  const targets = [7, 2].map(d => {
    const day = new Date(now)
    day.setDate(day.getDate() + d)
    return {
      days: d,
      from: startOfDay(day).toISOString(),
      to:   endOfDay(day).toISOString(),
    }
  })

  const eventPromises = targets.map(t =>
    supabase
      .from('events')
      .select('id, title, starts_at')
      .gte('starts_at', t.from)
      .lte('starts_at', t.to)
      .then(({ data }) => (data ?? []).map(ev => ({ ...ev, daysLeft: t.days })))
  )

  const eventsNested = await Promise.all(eventPromises)
  const events = eventsNested.flat()

  if (events.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No events to remind' })
  }

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')

  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No subscriptions' })
  }

  let totalSent = 0

  for (const ev of events) {
    const evDate  = new Date(ev.starts_at)
    const label   = ev.daysLeft === 7 ? 'en 7 días' : 'en 2 días'
    const payload = JSON.stringify({
      title: `Recordatorio: ${ev.title}`,
      body:  `El evento es ${label} — ${evDate.toLocaleDateString('es-SV', { weekday: 'long', day: 'numeric', month: 'long' })}`,
      url:   `/eventos/${ev.id}`,
    })

    const results = await Promise.allSettled(
      subs.map((sub: any) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
      )
    )
    totalSent += results.filter(r => r.status === 'fulfilled').length
  }

  return NextResponse.json({ sent: totalSent, events: events.length })
}

function startOfDay(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r
}
function endOfDay(d: Date): Date {
  const r = new Date(d); r.setHours(23, 59, 59, 999); return r
}
