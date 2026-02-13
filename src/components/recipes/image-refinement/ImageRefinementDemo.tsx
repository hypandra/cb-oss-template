'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ImageRefineDialog } from '@/components/recipes/image-refinement/components/ImageRefineDialog'

interface ImageRefinementDemoProps {
  hasOpenRouter: boolean
}

interface GeneratedImage {
  id: string
  url: string
  sourceText: string
}

export function ImageRefinementDemo({ hasOpenRouter }: ImageRefinementDemoProps) {
  const [prompt, setPrompt] = useState('A cozy reading corner with soft sunlight and picture books')
  const [image, setImage] = useState<GeneratedImage | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/demo/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setImage({
        id: crypto.randomUUID(),
        url: data.url,
        sourceText: prompt,
      })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Failed to generate image'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!hasOpenRouter ? (
        <p className="text-sm text-muted-foreground text-pretty">
          Set <code>OPENROUTER_API_KEY</code> to go live. This demo is using local placeholder generation.
        </p>
      ) : null}

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe an image" />
            <Button onClick={generate} disabled={isLoading || !prompt.trim()}>
              {isLoading ? 'Generating...' : 'Generate image'}
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {image ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <img src={image.url} alt="Generated" className="w-full rounded-md border" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground text-pretty">Source prompt: {image.sourceText}</p>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(true)}>
                Refine
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {image ? (
        <ImageRefineDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          image={image}
          refineEndpoint="/api/demo/images/refine"
          onSelectRefinement={async (selected) => ({
            suggestion: `Try appending this style note to your prompt: \"Prefer the composition and visual mood of refinement ${selected.id.slice(0, 6)}.\"`,
          })}
        />
      ) : null}
    </div>
  )
}
