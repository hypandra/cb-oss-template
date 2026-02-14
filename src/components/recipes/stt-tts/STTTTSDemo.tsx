'use client'

import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAudioRecorder } from '@/components/recipes/stt-tts/hooks/useAudioRecorder'
import { useTTS } from '@/components/recipes/stt-tts/hooks/useTTS'
import { PromptViewerDialog } from '@/components/recipes/prompt-transparency/PromptViewerDialog'
import ThumbsFeedback from '@/components/recipes/thumbs-feedback/ThumbsFeedback'

interface STTTTSDemoProps {
  hasOpenAi: boolean
}

interface BrowserSpeechRecognitionResult {
  0?: { transcript?: string }
}

interface BrowserSpeechRecognitionEvent {
  results: BrowserSpeechRecognitionResult[]
}

interface BrowserSpeechRecognition {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionCtor = new () => BrowserSpeechRecognition

export function STTTTSDemo({ hasOpenAi }: STTTTSDemoProps) {
  const [transcript, setTranscript] = useState('')
  const [ttsText, setTtsText] = useState('Great job sounding out each word. Let us try one more together.')
  const [isRecognizing, setIsRecognizing] = useState(false)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)

  const speechRecognitionSupported = useMemo(() => {
    if (typeof window === 'undefined') return false
    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor
      webkitSpeechRecognition?: SpeechRecognitionCtor
    }
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition)
  }, [])

  const { isPreparing, isRecording, error: recorderError, start, stop } = useAudioRecorder({
    maxDurationMs: 12_000,
    silenceDurationMs: 1_200,
    silenceThreshold: 0.02,
    onStop: async (audioBlob) => {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/demo/stt', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        setTranscript(data.text || '')
      }
    },
  })

  const { speak, isPlaying, isBrowserTtsAvailable } = useTTS({
    apiEndpoint: '/api/demo/tts',
    preferBrowser: !hasOpenAi,
    voice: 'nova',
    speed: 'normal',
  })

  const toggleBrowserRecognition = () => {
    if (typeof window === 'undefined') return

    if (isRecognizing) {
      recognitionRef.current?.stop()
      setIsRecognizing(false)
      return
    }

    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor
      webkitSpeechRecognition?: SpeechRecognitionCtor
    }
    const Recognition = (win.SpeechRecognition || win.webkitSpeechRecognition) as SpeechRecognitionCtor | undefined
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
      const text = event.results[0]?.[0]?.transcript || ''
      setTranscript(text)
    }
    recognition.onerror = () => {
      setIsRecognizing(false)
    }
    recognition.onend = () => {
      setIsRecognizing(false)
    }
    recognitionRef.current = recognition
    setIsRecognizing(true)
    recognition.start()
  }

  return (
    <div className="space-y-4">
      {!hasOpenAi ? (
        <p className="text-sm text-muted-foreground text-pretty">
          <code>OPENAI_API_KEY</code> is not set. STT/TTS are using browser-native speech APIs where available.
        </p>
      ) : null}

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold text-balance">Speech to text</h2>

          {hasOpenAi ? (
            <Button onClick={isRecording ? stop : start} disabled={isPreparing}>
              {isRecording ? 'Stop recording' : isPreparing ? 'Preparing...' : 'Start recording'}
            </Button>
          ) : (
            <Button onClick={toggleBrowserRecognition} disabled={!speechRecognitionSupported}>
              {isRecognizing ? 'Stop listening' : 'Start listening'}
            </Button>
          )}

          {!hasOpenAi && !speechRecognitionSupported ? (
            <p className="text-xs text-muted-foreground">Speech recognition is not supported in this browser.</p>
          ) : null}

          {recorderError ? <p className="text-xs text-destructive">{recorderError}</p> : null}

          <div className="relative rounded border bg-muted/30 p-3 text-sm text-pretty">
            {transcript ? (
              <span className="text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded mr-2">
                {hasOpenAi ? 'AI-transcribed · Whisper via OpenAI' : 'Browser speech recognition'}
              </span>
            ) : null}
            {transcript || 'Your transcript appears here.'}
          </div>
          {transcript ? (
            <div className="flex items-center justify-between">
              <PromptViewerDialog
                label="Speech to Text"
                description="How your speech was transcribed."
                prompt={{
                  systemPrompt: hasOpenAi
                    ? 'Audio sent to OpenAI Whisper-1 model for transcription. No system prompt — the model receives raw audio and returns text.'
                    : 'Using browser-native SpeechRecognition API (no external AI call). Language: en-US.',
                  context: hasOpenAi
                    ? 'Model: whisper-1\nProvider: OpenAI\nFormat: webm audio → JSON transcript\nNo prompt engineering — pure audio-to-text.'
                    : 'Provider: Browser built-in\nNo data sent to external servers.',
                }}
              />
              <ThumbsFeedback
                entityType="demo-stt"
                entityId={`stt-${Date.now()}`}
                prompt="Was the transcription accurate?"
                textPlaceholder="What was wrong?"
                endpoint="/api/demo/feedback"
                disableNetwork
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold text-balance">Text to speech</h2>
          <Input value={ttsText} onChange={(event) => setTtsText(event.target.value)} />
          <div className="flex items-center gap-2">
            <Button onClick={() => speak(ttsText)} disabled={!ttsText.trim() || isPlaying}>
              {isPlaying ? 'Playing...' : 'Speak'}
            </Button>
            <span className="text-[10px] text-muted-foreground">
              {hasOpenAi ? 'OpenAI TTS-1 · voice: nova' : 'Browser speech synthesis'}
            </span>
          </div>
          <PromptViewerDialog
            label="Text to Speech"
            description="How your text is converted to audio."
            prompt={{
              systemPrompt: hasOpenAi
                ? 'Text sent to OpenAI TTS-1 model. No system prompt — the model receives plain text and a voice selection, and returns audio.'
                : 'Using browser-native speechSynthesis API (no external AI call).',
              context: hasOpenAi
                ? 'Model: tts-1\nProvider: OpenAI\nVoice: nova\nSpeed: normal (1.0)\nOutput: MP3 audio'
                : 'Provider: Browser built-in\nNo data sent to external servers.',
            }}
          />
          {!isBrowserTtsAvailable ? (
            <p className="text-xs text-muted-foreground">Speech synthesis is not available in this browser.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
