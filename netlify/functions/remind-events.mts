import { schedule } from '@netlify/functions'

// Runs every day at 8:00 AM UTC (3:00 AM El Salvador CST)
export const handler = schedule('0 8 * * *', async () => {
  const siteUrl = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alabanzafratersvapp.com'

  await fetch(`${siteUrl}/api/cron/remind`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': process.env.PUSH_SECRET ?? '',
    },
  })

  return { statusCode: 200 }
})
