'use client'

import { useEffect, useState } from 'react'

type Platform = 'ios' | 'android' | 'desktop'

function getPlatform(): Platform {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

function isInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

// ── SVGs ──────────────────────────────────────────────────────────────────────
function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

function PlusSquareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

// ── STEPS ─────────────────────────────────────────────────────────────────────
function Step({ num, icon, text }: { num: number; icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-8 h-8 rounded-full bg-black text-white text-sm font-black flex items-center justify-center shrink-0">
        {num}
      </span>
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="p-1.5 bg-gray-100 rounded-lg shrink-0">{icon}</span>
        {text}
      </div>
    </div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function InstallPrompt() {
  const [show, setShow]               = useState(false)
  const [platform, setPlatform]       = useState<Platform>('ios')
  const [deferredPrompt, setDeferred] = useState<any>(null)
  const [installing, setInstalling]   = useState(false)

  useEffect(() => {
    if (isInstalled()) return

    setPlatform(getPlatform())
    setShow(true)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setShow(false))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function androidInstall() {
    if (!deferredPrompt) return
    setInstalling(true)
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setInstalling(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center py-4">
        {/* ponytail: plain img avoids /_next/image 415 on Netlify for local static files */}
        <img
          src="/logo.png"
          alt="Alabanza Frater"
          width={96}
          height={96}
          className="rounded-2xl mb-5 border-2 border-black"
        />

        <h1 className="font-black text-2xl text-center mb-1">Alabanza Frater</h1>
        <p className="text-gray-500 text-sm text-center mb-8 font-medium">
          Instala la app para continuar
        </p>

        <div className="w-full border-2 border-black rounded-2xl p-5 shadow-[6px_6px_0px_#000] mb-6">
          {platform === 'ios' && (
            <div className="flex flex-col gap-5">
              <p className="font-black text-sm text-center border-b-2 border-black pb-3">
                Instalar en iPhone / iPad
              </p>
              <Step num={1} icon={<ShareIcon />}
                text={<>Toca el botón <strong>Compartir</strong> en la barra de Safari</>} />
              <Step num={2} icon={<PlusSquareIcon />}
                text={<>Desplázate y toca <strong>"Agregar a pantalla de inicio"</strong></>} />
              <Step num={3} icon={<HomeIcon />}
                text={<>Toca <strong>"Agregar"</strong> y abre la app desde tu pantalla de inicio</>} />
            </div>
          )}

          {platform === 'android' && (
            <div className="flex flex-col gap-5">
              <p className="font-black text-sm text-center border-b-2 border-black pb-3">
                Instalar en Android
              </p>
              {deferredPrompt ? (
                <button
                  onClick={androidInstall}
                  disabled={installing}
                  className="brutal-btn flex items-center justify-center gap-2 w-full py-3 disabled:opacity-50"
                >
                  <DownloadIcon />
                  {installing ? 'Instalando...' : 'Instalar aplicación'}
                </button>
              ) : (
                <>
                  <Step num={1} icon={<DotsIcon />}
                    text={<>Toca el menú <strong>de Chrome</strong> (tres puntos arriba a la derecha)</>} />
                  <Step num={2} icon={<PlusSquareIcon />}
                    text={<>Selecciona <strong>"Añadir a pantalla de inicio"</strong></>} />
                  <Step num={3} icon={<HomeIcon />}
                    text={<>Toca <strong>"Añadir"</strong> y abre la app desde tu pantalla de inicio</>} />
                </>
              )}
            </div>
          )}

          {platform === 'desktop' && (
            <div className="flex flex-col gap-5">
              <p className="font-black text-sm text-center border-b-2 border-black pb-3">
                Instalar en computadora
              </p>
              {deferredPrompt ? (
                <button
                  onClick={androidInstall}
                  disabled={installing}
                  className="brutal-btn flex items-center justify-center gap-2 w-full py-3 disabled:opacity-50"
                >
                  <DownloadIcon />
                  {installing ? 'Instalando...' : 'Instalar aplicación'}
                </button>
              ) : (
                <>
                  <Step num={1} icon={<MonitorIcon />}
                    text={<>Busca el ícono de instalación en la <strong>barra de direcciones</strong> del navegador</>} />
                  <Step num={2} icon={<DownloadIcon />}
                    text={<>Haz clic en <strong>"Instalar"</strong> o <strong>"Agregar a aplicaciones"</strong></>} />
                  <Step num={3} icon={<HomeIcon />}
                    text={<>Abre la app desde el <strong>escritorio o menú de inicio</strong></>} />
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center max-w-xs font-medium">
          La app debe estar instalada para poder usarla correctamente.
        </p>
      </div>
    </div>
  )
}
