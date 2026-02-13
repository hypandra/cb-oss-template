'use client'

import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAudioRecorder } from '@/components/recipes/stt-tts/hooks/useAudioRecorder'
import { useTTS } from '@/components/recipes/stt-tts/hooks/useTTS'

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

          <div className="rounded border bg-muted/30 p-3 text-sm text-pretty">
            {transcript || 'Your transcript appears here.'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold text-balance">Text to speech</h2>
          <Input value={ttsText} onChange={(event) => setTtsText(event.target.value)} />
          <div className="flex gap-2">
            <Button onClick={() => speak(ttsText)} disabled={!ttsText.trim() || isPlaying}>
              {isPlaying ? 'Playing...' : 'Speak'}
            </Button>
          </div>
          {!isBrowserTtsAvailable ? (
            <p className="text-xs text-muted-foreground">Speech synthesis is not available in this browser.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
