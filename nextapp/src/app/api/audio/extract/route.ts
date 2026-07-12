import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
  }

  try {
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
    })

    const format = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
      filter:  'audioonly',
    })

    // Return the signed CDN URL so the client can fetch directly
    // (avoids server-side proxying and Netlify IP blocks)
    return NextResponse.json({
      audioUrl:      format.url,
      mimeType:      format.mimeType ?? 'audio/mp4',
      contentLength: format.contentLength,
    })
  } catch (err: any) {
    console.error('[audio/extract]', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Error desconocido' }, { status: 500 })
  }
}
