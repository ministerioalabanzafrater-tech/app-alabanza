import { schedule } from '@netlify/functions'

// Runs every hour — checks which users have their reminder set for this CST hour
export const handler = schedule('0 * * * *', async () => {
  const siteUrl = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alabanzafratersvapp.com'

  await fetch(`${siteUrl}/api/cron/reading-reminder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': process.env.PUSH_SECRET ?? '',
    },
  })

  return { statusCode: 200 }
})
