'use client'

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Subject } from '@/lib/study-planner'

const subjectColors = ['#7774df', '#36a78d', '#e09b45', '#5c91cd', '#d77778', '#8d73bd']

interface SubjectFormDialogProps {
  subject: Subject | null
  subjects: Subject[]
  onClose: () => void
  onSave: (subject: Omit<Subject, 'id'>) => void
}

export function SubjectFormDialog({ subject, subjects, onClose, onSave }: SubjectFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState(subject?.name ?? '')
  const [color, setColor] = useState(subject?.color ?? subjectColors[0])
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Enter a subject name.')
      return
    }
    if (subjects.some((existing) => existing.id !== subject?.id && existing.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
      setError('A subject with that name already exists.')
      return
    }
    onSave({ name: trimmedName, color })
  }

  return (
    <dialog aria-labelledby="subject-dialog-title" className="sp-dialog sp-dialog-small" onCancel={onClose} ref={dialogRef}>
      <div className="sp-dialog-header">
        <div className="sp-dialog-heading-icon"><BookOpen aria-hidden="true" /></div>
        <div>
          <p className="sp-eyebrow">SUBJECT LIBRARY</p>
          <h2 id="subject-dialog-title">{subject ? 'Edit subject' : 'Add a subject'}</h2>
          <p className="sp-dialog-description">Keep your study plan organized by course.</p>
        </div>
        <button aria-label="Close subject form" className="sp-icon-button sp-dialog-close" onClick={onClose} type="button">
          <X aria-hidden="true" />
        </button>
      </div>
      <form className="sp-form" onSubmit={handleSubmit}>
        <label className="sp-field sp-field-full" htmlFor="subject-name">
          <span>Subject name <span className="sp-required">*</span></span>
          <input
            autoFocus
            id="subject-name"
            maxLength={40}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Discrete Mathematics"
            required
            value={name}
          />
        </label>
        <fieldset className="sp-color-fieldset">
          <legend>Choose a color</legend>
          <div className="sp-color-options">
            {subjectColors.map((subjectColor) => (
              <button
                aria-label={`Choose ${subjectColor} subject color`}
                aria-pressed={color === subjectColor}
                className={`sp-color-swatch ${color === subjectColor ? 'is-selected' : ''}`}
                key={subjectColor}
                onClick={() => setColor(subjectColor)}
                style={{ '--swatch-color': subjectColor } as CSSProperties}
                type="button"
              />
            ))}
            <label className="sp-custom-color" title="Choose a custom color">
              <span className="sr-only">Choose a custom subject color</span>
              <input aria-label="Choose a custom subject color" onChange={(event) => setColor(event.target.value)} type="color" value={color} />
            </label>
          </div>
        </fieldset>
        {error && <p className="sp-form-error" role="alert">{error}</p>}
        <div className="sp-dialog-footer">
          <Button className="sp-button-secondary" onClick={onClose} type="button" variant="outline">Cancel</Button>
          <Button className="sp-button-primary" type="submit">{subject ? 'Save changes' : 'Create subject'}</Button>
        </div>
      </form>
    </dialog>
  )
}
