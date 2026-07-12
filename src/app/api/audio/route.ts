import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { createWriteStream, existsSync } from 'fs'
import { mkdir, unlink, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { createClient } from '@/lib/supabase/server'

const TMP = join(tmpdir(), 'alabanza-audio')

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: 'pipe' })
    let stderr = ''
    proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} exited ${code}: ${stderr.slice(-500)}`))
    })
  })
}

function semitoneRatio(semitones: number): number {
  return Math.pow(2, semitones / 12)
}

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { youtubeUrl, semitones } = await req.json() as {
    youtubeUrl: string
    semitones: number
  }

  if (!youtubeUrl || typeof semitones !== 'number') {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }
  if (semitones < -12 || semitones > 12) {
    return NextResponse.json({ error: 'Semitonos fuera de rango (-12 a +12)' }, { status: 400 })
  }

  await mkdir(TMP, { recursive: true })

  const id = `${user.id}-${Date.now()}`
  const rawPath  = join(TMP, `${id}-raw.%(ext)s`)
  const mp3Path  = join(TMP, `${id}-raw.mp3`)
  const outPath  = join(TMP, `${id}-shifted.mp3`)

  try {
    // 1. Descargar audio con yt-dlp
    await run('yt-dlp', [
      '-x', '--audio-format', 'mp3', '--audio-quality', '0',
      '--no-playlist', '-o', rawPath,
      '--ffmpeg-location', '/opt/homebrew/bin/ffmpeg',
      youtubeUrl,
    ])

    if (!existsSync(mp3Path)) {
      throw new Error('yt-dlp no generó el archivo MP3 esperado')
    }

    // 2. Pitch shift con ffmpeg rubberband
    const ratio = semitoneRatio(semitones)
    await run('/opt/homebrew/bin/ffmpeg', [
      '-i', mp3Path,
      '-af', `rubberband=pitch=${ratio}`,
      '-q:a', '2',
      '-y', outPath,
    ])

    // 3. Subir a Supabase Storage
    const fileBuffer = await readFile(outPath)
    const storagePath = `audio/${user.id}/${id}-shifted.mp3`

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(storagePath, fileBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(storagePath)

    // 4. Registrar job en DB
    await supabase.from('audio_jobs').insert({
      user_id: user.id,
      youtube_url: youtubeUrl,
      semitones,
      status: 'done',
      output_url: publicUrl,
    } as never)

    // Limpiar temporales
    await Promise.allSettled([unlink(mp3Path), unlink(outPath)])

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    await Promise.allSettled([
      unlink(mp3Path).catch(() => {}),
      unlink(outPath).catch(() => {}),
    ])
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    await supabase.from('audio_jobs').insert({
      user_id: user.id,
      youtube_url: youtubeUrl,
      semitones,
      status: 'error',
      error_msg: msg,
    } as never)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
