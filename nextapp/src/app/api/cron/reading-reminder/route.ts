import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'
import { CHAPTERS } from '@/lib/chapters'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: NextRequest) {
  if (req.headers.get('x-cron-secret') !== process.env.PUSH_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Current hour in El Salvador (UTC-6)
  const cstHour = ((new Date().getUTCHours() - 6) + 24) % 24

  // Get active subscriptions at this hour
  const { data: subs } = await supabase
    .from('reading_subscriptions')
    .select('user_id, reminder_time')
    .eq('active', true)

  const targets = (subs ?? []).filter((s: any) => {
    const h = parseInt((s.reminder_time as string).split(':')[0])
    return h === cstHour
  })

  if (targets.length === 0) return NextResponse.json({ sent: 0 })

  const userIds = targets.map((t: any) => t.user_id)

  // Get reading progress for all targets
  const { data: allProgress } = await supabase
    .from('reading_progress')
    .select('user_id, chapter_index')
    .in('user_id', userIds)

  // Get push subscriptions for all targets
  const { data: pushSubs } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', userIds)

  let totalSent = 0

  for (const target of targets) {
    const uid = target.user_id
    const readSet = new Set(
      (allProgress ?? []).filter((p: any) => p.user_id === uid).map((p: any) => p.chapter_index)
    )
    const next = CHAPTERS.find(c => !readSet.has(c.index))
    if (!next) continue // all done

    const userPush = (pushSubs ?? []).filter((p: any) => p.user_id === uid)
    if (!userPush.length) continue

    const payload = JSON.stringify({
      title: `Tiempo de lectura — ${next.label}`,
      body:  next.title,
      url:   `/formacion/adoracion/${next.index}`,
    })

    const results = await Promise.allSettled(
      userPush.map((sub: any) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
      )
    )
    totalSent += results.filter(r => r.status === 'fulfilled').length
  }

  return NextResponse.json({ sent: totalSent, targets: targets.length })
}
