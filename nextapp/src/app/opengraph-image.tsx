import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Alabanza Frater — Gestión integral del equipo de músicos'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 48,
          fontFamily: 'sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alabanzafratersvapp.com'}/logo.png`}
          width={280}
          height={280}
          style={{ borderRadius: 24 }}
          alt=""
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: '#ffffff', fontSize: 56, fontWeight: 900, letterSpacing: -1 }}>
            Alabanza Frater
          </div>
          <div style={{ color: '#9ca3af', fontSize: 28, fontWeight: 400 }}>
            Gestión del equipo de músicos
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
