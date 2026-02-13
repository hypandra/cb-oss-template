import { NextRequest, NextResponse } from 'next/server'
import { generateImage, renderPromptTemplate } from '@/components/recipes/image-refinement/utils/image-generation'

function toDataUrlSvg(text: string, accent = '#0ea5e9') {
  const safe = text.slice(0, 120).replace(/[<>]/g, '')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='576'><rect width='100%' height='100%' fill='#f8fafc'/><rect x='48' y='48' width='928' height='480' rx='24' fill='white' stroke='${accent}' stroke-width='6'/><text x='512' y='260' font-size='34' text-anchor='middle' fill='#0f172a' font-family='Arial, sans-serif'>Demo image</text><text x='512' y='318' font-size='20' text-anchor='middle' fill='#334155' font-family='Arial, sans-serif'>${safe}</text></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export async function POST(request: NextRequest) {
  const { prompt, source_text, prompt_template } = await request.json()

  let finalPrompt: string | undefined = prompt
  if (!finalPrompt && source_text && prompt_template) {
    finalPrompt = renderPromptTemplate(prompt_template, source_text)
  }

  if (!finalPrompt) {
    return NextResponse.json({ error: 'prompt or prompt_template + source_text is required' }, { status: 400 })
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ url: toDataUrlSvg(finalPrompt, '#6366f1'), mode: 'mock' })
  }

  try {
    const imageBuffer = await generateImage({ prompt: finalPrompt })
    const base64 = imageBuffer.toString('base64')
    return NextResponse.json({
      url: `data:image/png;base64,${base64}`,
      mode: 'live',
    })
  } catch (error) {
    console.error('Demo image generation error:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
