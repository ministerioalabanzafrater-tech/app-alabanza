import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
  }

  try {
    const info   = await ytdl.getInfo(url)
    const format = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
      filter:  'audioonly',
    })

    const stream = ytdl.downloadFromInfo(info, { format })

    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        stream.on('data',  (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)))
        stream.on('end',   ()              => controller.close())
        stream.on('error', (err: Error)   => controller.error(err))
      },
      cancel() { stream.destroy() },
    })

    return new NextResponse(readable, {
      headers: { 'Content-Type': format.mimeType ?? 'audio/mp4' },
    })
  } catch (err: any) {
    console.error('[audio/extract]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
