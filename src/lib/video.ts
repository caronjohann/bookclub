import 'server-only'

import { put } from '@vercel/blob'
import sharp from 'sharp'

export async function processAndUploadVideoThumbnail(file: File, id: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())

  const thumbBuffer = await sharp(buffer)
    .webp({ quality: 70 })
    .resize(800, undefined, { withoutEnlargement: true })
    .toBuffer()

  const { url: thumbnailUrl } = await put(`video-thumbnails/${id}_thumb.webp`, thumbBuffer, {
    access: 'public',
    contentType: 'image/webp',
  })

  return thumbnailUrl
}

function extractYouTubeId(url: string): string | null {
  const parsed = new URL(url)
  const host = parsed.hostname.replace('www.', '')
  if (host === 'youtu.be') return parsed.pathname.slice(1)
  if (host === 'youtube.com') {
    if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/')[2]
    if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/')[2]
    return parsed.searchParams.get('v')
  }
  return null
}

export async function getVideoUrlMeta(url: string): Promise<{
  provider: 'youtube' | 'vimeo' | null
  thumbnailUrl: string | null
  canonicalUrl: string
}> {
  const host = new URL(url).hostname.replace('www.', '')

  if (host === 'youtube.com' || host === 'youtu.be') {
    const videoId = extractYouTubeId(url)
    return {
      provider: 'youtube',
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
      canonicalUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : url,
    }
  }

  if (host === 'vimeo.com') {
    try {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const data = await res.json()
        return {
          provider: 'vimeo',
          thumbnailUrl: data.thumbnail_url ?? null,
          canonicalUrl: data.video_id ? `https://vimeo.com/${data.video_id}` : url,
        }
      }
    } catch (err) {
      console.error('Failed to fetch Vimeo oEmbed metadata:', err)
    }

    return { provider: 'vimeo', thumbnailUrl: null, canonicalUrl: url }
  }

  return { provider: null, thumbnailUrl: null, canonicalUrl: url }
}
