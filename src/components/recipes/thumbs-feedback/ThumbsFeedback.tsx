'use client'

import { useState, useEffect, useCallback } from 'react'
import type { FeedbackPayload, ThumbsFeedbackProps } from '@/components/recipes/thumbs-feedback/types'

type FeedbackState = 'idle' | 'role-picker' | 'text-input' | 'submitted'

export default function ThumbsFeedback({
  entityType,
  entityId,
  contextId,
  prompt = 'Was this helpful?',
  textPlaceholder = 'What went wrong?',
  roles,
  roleStorageKey = 'cb-feedback-role',
  endpoint = '/api/feedback',
  disableNetwork = false,
  onSubmit,
}: ThumbsFeedbackProps) {
  const [state, setState] = useState<FeedbackState>('idle')
  const [feedbackText, setFeedbackText] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (roles?.length && typeof window !== 'undefined') {
      setUserRole(localStorage.getItem(roleStorageKey))
    }
  }, [roles, roleStorageKey])

  const send = useCallback(
    async (rating: boolean, text?: string, role?: string) => {
      const payload: FeedbackPayload = {
        entityType,
        entityId,
        contextId: contextId || undefined,
        rating,
        feedbackText: text || undefined,
        userRole: role || userRole || undefined,
      }
      onSubmit?.(payload)
      if (disableNetwork) return
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        // Fire-and-forget — don't block the user
      }
    },
    [entityType, entityId, contextId, endpoint, onSubmit, userRole]
  )

  const handleThumbUp = () => {
    setState('submitted')
    void send(true)
  }

  const handleThumbDown = () => {
    if (roles?.length && !userRole) {
      setState('role-picker')
    } else {
      setState('text-input')
    }
  }

  const handleRoleSelect = (role: string) => {
    localStorage.setItem(roleStorageKey, role)
    setUserRole(role)
    setState('text-input')
  }

  const handleTextSubmit = () => {
    setState('submitted')
    void send(false, feedbackText)
  }

  const handleTextSkip = () => {
    setState('submitted')
    void send(false)
  }

  if (state === 'submitted') {
    return (
      <div className="text-xs text-center py-1 opacity-60">
        Thanks for the feedback
      </div>
    )
  }

  if (state === 'role-picker' && roles?.length) {
    return (
      <div className="py-2">
        <p className="text-xs opacity-60 mb-2 text-center">I&apos;m a...</p>
        <div className="flex justify-center gap-2">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSelect(role)}
              className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition-colors capitalize"
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (state === 'text-input') {
    return (
      <div className="flex items-center gap-2 justify-center">
        <input
          type="text"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder={textPlaceholder}
          className="px-2 py-1 text-xs border border-zinc-600 rounded bg-zinc-800 text-white w-48"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleTextSubmit()
            }
          }}
        />
        <button
          type="button"
          onClick={handleTextSubmit}
          className="text-xs px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-white"
        >
          Send
        </button>
        <button
          type="button"
          onClick={handleTextSkip}
          className="text-xs opacity-60 hover:opacity-100"
        >
          Skip
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 justify-center py-1">
      <span className="text-xs opacity-60">{prompt}</span>
      <button
        type="button"
        onClick={handleThumbUp}
        className="text-lg hover:scale-110 transition-transform"
        aria-label="Thumbs up"
      >
        👍
      </button>
      <button
        type="button"
        onClick={handleThumbDown}
        className="text-lg hover:scale-110 transition-transform"
        aria-label="Thumbs down"
      >
        👎
      </button>
    </div>
  )
}
