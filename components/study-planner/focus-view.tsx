'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { BookOpenCheck, Check, Coffee, Lightbulb, Pause, Play, RotateCcw, Timer } from 'lucide-react'

const FOCUS_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60

type TimerMode = 'focus' | 'break'

export function FocusView() {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)

  useEffect(() => {
    if (!isRunning) return
    const interval = window.setInterval(() => {
      setSecondsLeft((remaining) => Math.max(0, remaining - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (!isRunning || secondsLeft !== 0) return
    setIsRunning(false)
    if (mode === 'focus') setCompletedSessions((count) => count + 1)
  }, [isRunning, mode, secondsLeft])

  const totalSeconds = mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100
  const timerStyle = { '--timer-progress': `${progress}%` } as CSSProperties
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')
  const isComplete = secondsLeft === 0

  function chooseMode(nextMode: TimerMode) {
    setMode(nextMode)
    setSecondsLeft(nextMode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS)
    setIsRunning(false)
  }

  function resetTimer() {
    setIsRunning(false)
    setSecondsLeft(totalSeconds)
  }

  return (
    <div className="sp-page-stack">
      <section className="sp-page-heading">
        <div>
          <p className="sp-eyebrow">MAKE SPACE TO THINK</p>
          <h1>Focus timer</h1>
          <p>A simple Pomodoro timer to help you start one study session at a time.</p>
        </div>
        <div className="sp-session-count"><Check aria-hidden="true" />{completedSessions} focus {completedSessions === 1 ? 'session' : 'sessions'} completed</div>
      </section>

      <section className="sp-focus-layout">
        <div className="sp-panel sp-focus-panel">
          <div className="sp-focus-mode-switch" role="group" aria-label="Timer mode">
            <button aria-pressed={mode === 'focus'} className={mode === 'focus' ? 'is-active' : ''} onClick={() => chooseMode('focus')} type="button">
              <BookOpenCheck aria-hidden="true" /> Focus
            </button>
            <button aria-pressed={mode === 'break'} className={mode === 'break' ? 'is-active' : ''} onClick={() => chooseMode('break')} type="button">
              <Coffee aria-hidden="true" /> Short break
            </button>
          </div>
          <div className="sp-focus-timer-area">
            <div className={`sp-timer-ring ${mode === 'break' ? 'is-break' : ''}`} style={timerStyle}>
              <div className="sp-timer-center">
                <Timer aria-hidden="true" />
                <strong aria-live="off">{minutes}:{seconds}</strong>
                <span>{mode === 'focus' ? 'FOCUS SESSION' : 'SHORT BREAK'}</span>
              </div>
            </div>
            <p aria-live="polite" className="sp-timer-caption">
              {isComplete
                ? mode === 'focus' ? 'Focus session complete. Take a breath before your next one.' : 'Break complete. Ready when you are.'
                : isRunning ? mode === 'focus' ? 'You’re in focus mode. Keep going.' : 'A little rest goes a long way.' : mode === 'focus' ? 'Settle in and work on one thing.' : 'Step away from your screen for a few minutes.'}
            </p>
            <div className="sp-timer-controls">
              <button aria-label="Reset timer" className="sp-icon-button sp-reset-timer" onClick={resetTimer} type="button"><RotateCcw aria-hidden="true" /></button>
              <button className="sp-timer-main-button" onClick={() => setIsRunning((running) => !running)} type="button">
                {isRunning ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                {isRunning ? 'Pause timer' : isComplete ? 'Start again' : 'Start focus'}
              </button>
              <span aria-hidden="true" className="sp-timer-control-spacer" />
            </div>
          </div>
        </div>

        <aside className="sp-focus-aside">
          <section className="sp-panel sp-focus-tip-card">
            <div className="sp-focus-tip-icon"><Lightbulb aria-hidden="true" /></div>
            <p className="sp-eyebrow">A GENTLE REMINDER</p>
            <h2>Make the next 25 minutes count.</h2>
            <p>Choose one task, silence distractions, and let the timer hold the time for you.</p>
          </section>
          <section className="sp-panel sp-focus-rhythm-card">
            <p className="sp-eyebrow">YOUR RHYTHM</p>
            <h2>A simple study cycle</h2>
            <div className="sp-rhythm-step">
              <span className="sp-rhythm-number">01</span>
              <div><strong>Focus</strong><span>25 minutes of focused study</span></div>
              <span className="sp-rhythm-duration">25 min</span>
            </div>
            <div className="sp-rhythm-step">
              <span className="sp-rhythm-number">02</span>
              <div><strong>Reset</strong><span>Stretch, hydrate, breathe</span></div>
              <span className="sp-rhythm-duration">5 min</span>
            </div>
            <p className="sp-rhythm-note">The timer runs only in this tab and is not saved between visits.</p>
          </section>
        </aside>
      </section>
    </div>
  )
}
