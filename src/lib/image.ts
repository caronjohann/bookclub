import 'server-only'

import { put } from '@vercel/blob'
import sharp from 'sharp'

export async function processAndUploadImage(
  file: File,
  id: string,
): Promise<{
  imageUrl: string
  thumbnailUrl: string
}> {
  const buffer = Buffer.from(await file.arrayBuffer())

  const [fullBuffer, thumbBuffer] = await Promise.all([
    sharp(buffer)
      .webp({ quality: 80 })
      .resize(1600, undefined, { withoutEnlargement: true })
      .toBuffer(),
    sharp(buffer)
      .webp({ quality: 70 })
      .resize(800, undefined, { withoutEnlargement: true })
      .toBuffer(),
  ])

  const [{ url: imageUrl }, { url: thumbnailUrl }] = await Promise.all([
    put(`images/${id}.webp`, fullBuffer, { access: 'public', contentType: 'image/webp' }),
    put(`images/${id}_thumb.webp`, thumbBuffer, { access: 'public', contentType: 'image/webp' }),
  ])

  return { imageUrl, thumbnailUrl }
}
