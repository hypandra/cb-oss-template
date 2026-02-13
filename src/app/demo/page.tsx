import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const RECIPES = [
  {
    slug: 'prompt-transparency',
    title: 'Prompt Transparency',
    description: 'Reveal system prompts and runtime context in a click.',
  },
  {
    slug: 'thumbs-feedback',
    title: 'Thumbs Feedback',
    description: 'Collect quick thumbs up/down feedback with optional comments.',
  },
  {
    slug: 'changelog',
    title: 'Changelog',
    description: 'Show product updates with builder notes and explained terms.',
  },
  {
    slug: 'image-refinement',
    title: 'Image Refinement',
    description: 'Generate and iteratively refine images from prompt instructions.',
  },
  {
    slug: 'canvas',
    title: 'ReactFlow Canvas',
    description: 'Build editable graph canvases with auto-layout and CRUD routes.',
  },
  {
    slug: 'tts',
    title: 'STT + TTS',
    description: 'Record voice, transcribe speech, and speak generated text.',
  },
  {
    slug: 'multi-llm',
    title: 'Multi-LLM Orchestration',
    description: 'Plan queries, search web sources, and summarize results.',
  },
  {
    slug: 'feedback-review',
    title: 'Feedback Review CLI',
    description: 'Review, address, and aggregate feedback from the terminal.',
  },
]

export default function DemoIndexPage() {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-balance">All recipe demos</h2>
        <p className="text-sm text-muted-foreground text-pretty">
          These pages are public and ready to run after cloning the template.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RECIPES.map((recipe) => (
          <Card key={recipe.slug}>
            <CardHeader>
              <CardTitle className="text-base">{recipe.title}</CardTitle>
              <CardDescription className="text-pretty">{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link href={`/demo/${recipe.slug}`}>Open demo</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
