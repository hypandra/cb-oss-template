import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { refineImage } from '@/components/recipes/image-refinement/utils/image-generation'
import { generatePromptVariations } from '@/components/recipes/image-refinement/utils/variations'

function bufferFromBase64(input: string): Buffer {
  if (input.startsWith('data:image/')) {
    const parts = input.split(',')
    return Buffer.from(parts[1] || '', 'base64')
  }
  return Buffer.from(input, 'base64')
}

function toDataUrlSvg(text: string, accent = '#22c55e') {
  const safe = text.slice(0, 100).replace(/[<>]/g, '')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='576'><rect width='100%' height='100%' fill='#f8fafc'/><rect x='40' y='40' width='944' height='496' rx='20' fill='white' stroke='${accent}' stroke-width='6'/><text x='512' y='250' font-size='32' text-anchor='middle' fill='#0f172a' font-family='Arial, sans-serif'>Refined variation</text><text x='512' y='308' font-size='18' text-anchor='middle' fill='#334155' font-family='Arial, sans-serif'>${safe}</text></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export async function POST(request: NextRequest) {
  const { image_url, image_base64, refinement_prompt } = await request.json()
  const trimmedPrompt = typeof refinement_prompt === 'string' ? refinement_prompt.trim() : ''

  if (!trimmedPrompt) {
    return NextResponse.json({ error: 'refinement_prompt is required' }, { status: 400 })
  }

  if (!image_url && !image_base64) {
    return NextResponse.json({ error: 'image_url or image_base64 is required' }, { status: 400 })
  }

  if (!process.env.OPENROUTER_API_KEY) {
    const mockVariations = [
      trimmedPrompt,
      `${trimmedPrompt}, with softer lighting`,
      `${trimmedPrompt}, with more texture detail`,
    ]
    return NextResponse.json({
      mode: 'mock',
      images: mockVariations.map((variation, index) => ({
        id: randomUUID(),
        url: toDataUrlSvg(variation, ['#22c55e', '#0ea5e9', '#f97316'][index] || '#22c55e'),
        refinement_prompt: variation,
      })),
    })
  }

  try {
    let imageBuffer: Buffer

    if (image_base64) {
      imageBuffer = bufferFromBase64(image_base64)
    } else {
      const imageResponse = await fetch(image_url)
      if (!imageResponse.ok) {
        const error = await imageResponse.text()
        return NextResponse.json(
          { error: `Failed to fetch source image: ${imageResponse.status} ${error}` },
          { status: 502 }
        )
      }
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    }

    const variations = await generatePromptVariations(trimmedPrompt)
    const refinedBuffers = await Promise.all(
      variations.map((variation) => refineImage({ imageBuffer, prompt: variation }))
    )

    const images = refinedBuffers.map((buffer, index) => ({
      id: randomUUID(),
      url: `data:image/png;base64,${buffer.toString('base64')}`,
      refinement_prompt: variations[index],
    }))

    return NextResponse.json({ mode: 'live', images })
  } catch (error) {
    console.error('Demo image refinement error:', error)
    return NextResponse.json({ error: 'Failed to refine image' }, { status: 500 })
  }
}
