'use client'

import { Icon } from '@iconify/react'

const INSTRUMENT_ICON: Record<string, string> = {
  guitarra: 'mdi:guitar-electric',
  bajo:     'mdi:guitar-electric',
  bateria:  'mdi:drum',
  teclado:  'mdi:piano',
  piano:    'mdi:piano',
  violin:   'mdi:violin',
  cello:    'mdi:violin',
  trompeta: 'mdi:bugle',
  saxofon:  'mdi:saxophone',
  flauta:   'mdi:music-note',
  voz:      'mdi:microphone',
  director: 'mdi:music-clef-treble',
  otro:     'mdi:music',
}

export default function InstrumentIcon({
  instrument,
  size = 16,
  className,
}: {
  instrument?: string | null
  size?: number
  className?: string
}) {
  const icon = (instrument && INSTRUMENT_ICON[instrument]) ?? 'mdi:music'
  return <Icon icon={icon} width={size} height={size} className={className} />
}
