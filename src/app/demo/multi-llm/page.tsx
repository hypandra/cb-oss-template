import { MultiLLMDemo } from '@/components/recipes/multi-llm/MultiLLMDemo'

export default function MultiLLMDemoPage() {
  const hasConfig = Boolean(process.env.OPENROUTER_API_KEY && process.env.PARALLEL_API_KEY)

  return <MultiLLMDemo hasConfig={hasConfig} />
}
