import { ThumbsFeedbackDemo } from '@/components/recipes/thumbs-feedback/ThumbsFeedbackDemo'

export default function ThumbsFeedbackPage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL)

  return <ThumbsFeedbackDemo hasDatabase={hasDatabase} />
}
