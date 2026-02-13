import { STTTTSDemo } from '@/components/recipes/stt-tts/STTTTSDemo'

export default function TTSDemoPage() {
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY)

  return <STTTTSDemo hasOpenAi={hasOpenAi} />
}
