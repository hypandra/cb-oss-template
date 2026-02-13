import { ImageRefinementDemo } from '@/components/recipes/image-refinement/ImageRefinementDemo'

export default function ImageRefinementDemoPage() {
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY)

  return <ImageRefinementDemo hasOpenRouter={hasOpenRouter} />
}
