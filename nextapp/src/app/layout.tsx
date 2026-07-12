import type { Metadata, Viewport } from 'next'
import { Lexend } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alabanzafratersvapp.com'

export const metadata: Metadata = {
  title: {
    default: 'Alabanza Frater',
    template: '%s · Alabanza Frater',
  },
  description: 'Gestión integral del equipo de músicos de iglesia',
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.json',

  // Favicons — Next.js también auto-detecta src/app/icon.png y apple-icon.png
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192.png',
  },

  // PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Alabanza',
  },

  // Open Graph
  openGraph: {
    title: 'Alabanza Frater',
    description: 'Gestión integral del equipo de músicos de iglesia',
    url: SITE_URL,
    siteName: 'Alabanza Frater',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Alabanza Frater — Gestión del equipo de músicos',
      },
    ],
    locale: 'es_SV',
    type: 'website',
  },

  // Twitter / X card
  twitter: {
    card: 'summary_large_image',
    title: 'Alabanza Frater',
    description: 'Gestión integral del equipo de músicos de iglesia',
    images: ['/opengraph-image'],
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={lexend.className}>
      <body className="min-h-screen bg-white text-black">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}
