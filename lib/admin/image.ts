// Shrink a photo in the browser before upload: phone photos are often
// 5-10MB, well over the server's request limit. Output is WebP (JPEG on
// browsers that can't encode WebP), max 1600px on the long side.

const MAX = 1600

export async function prepareImage(file: File): Promise<{ data: string; contentType: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  const toBlob = (type: string) =>
    new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85))
  let blob = await toBlob('image/webp')
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg')
  if (!blob) throw new Error('Couldn’t read that image. Try a JPG or PNG.')

  const bytes = new Uint8Array(await blob.arrayBuffer())
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return { data: btoa(bin), contentType: blob.type }
}
