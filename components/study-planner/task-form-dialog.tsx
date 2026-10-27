'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { BookOpenCheck, Clock3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Subject, StudyTask, TaskFields } from '@/lib/study-planner'

interface TaskFormDialogProps {
  task: StudyTask | null
  subjects: Subject[]
  defaultSubjectId?: string
  onClose: () => void
  onOpenSubjects: () => void
  onSave: (fields: TaskFields) => void
}

export function TaskFormDialog({ task, subjects, defaultSubjectId, onClose, onOpenSubjects, onSave }: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [subjectId, setSubjectId] = useState(task?.subjectId ?? defaultSubjectId ?? subjects[0]?.id ?? '')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [priority, setPriority] = useState<StudyTask['priority']>(task?.priority ?? 'Medium')
  const [estimatedMinutes, setEstimatedMinutes] = useState(String(task?.estimatedMinutes ?? 30))
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
    const trimmedTitle = title.trim()
    const minutes = Number(estimatedMinutes)

    if (!trimmedTitle) {
      setError('Add a title so you can find this task later.')
      return
    }
    if (!subjectId || !subjects.some((subject) => subject.id === subjectId)) {
      setError('Choose a subject for this task.')
      return
    }
    if (!Number.isInteger(minutes) || minutes < 5 || minutes > 1440) {
      setError('Study time must be a whole number between 5 and 1,440 minutes.')
      return
    }

    onSave({
      title: trimmedTitle,
      description: description.trim(),
      subjectId,
      dueDate,
      priority,
      estimatedMinutes: minutes,
    })
  }

  return (
    <dialog aria-labelledby="task-dialog-title" className="sp-dialog" onCancel={onClose} ref={dialogRef}>
      <div className="sp-dialog-header">
        <div className="sp-dialog-heading-icon"><BookOpenCheck aria-hidden="true" /></div>
        <div>
          <p className="sp-eyebrow">TASK DETAILS</p>
          <h2 id="task-dialog-title">{task ? 'Edit task' : 'Create a task'}</h2>
          <p className="sp-dialog-description">Give your next study session a clear direction.</p>
        </div>
        <button aria-label="Close task form" className="sp-icon-button sp-dialog-close" onClick={onClose} type="button">
          <X aria-hidden="true" />
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="sp-dialog-empty">
          <p>Add a subject before creating a study task.</p>
          <Button className="sp-button-primary" onClick={onOpenSubjects} type="button">Create a subject</Button>
        </div>
      ) : (
        <form className="sp-form" onSubmit={handleSubmit}>
          <label className="sp-field sp-field-full" htmlFor="task-title">
            <span>Task title <span className="sp-required">*</span></span>
            <input
              autoFocus
              aria-invalid={Boolean(error && !title.trim())}
              id="task-title"
              maxLength={100}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Review normalization notes"
              required
              value={title}
            />
          </label>
          <label className="sp-field sp-field-full" htmlFor="task-description">
            <span>Description <span className="sp-field-optional">Optional</span></span>
            <textarea
              id="task-description"
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a note or break the task into a few steps…"
              rows={3}
              value={description}
            />
          </label>
          <div className="sp-form-grid">
            <label className="sp-field" htmlFor="task-subject">
              <span>Subject <span className="sp-required">*</span></span>
              <select id="task-subject" onChange={(event) => setSubjectId(event.target.value)} required value={subjectId}>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <label className="sp-field" htmlFor="task-due-date">
              <span>Due date <span className="sp-field-optional">Optional</span></span>
              <input id="task-due-date" onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} />
            </label>
            <label className="sp-field" htmlFor="task-priority">
              <span>Priority</span>
              <select id="task-priority" onChange={(event) => setPriority(event.target.value as StudyTask['priority'])} value={priority}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label className="sp-field" htmlFor="task-estimate">
              <span>Study time</span>
              <div className="sp-input-with-icon">
                <Clock3 aria-hidden="true" />
                <input
                  id="task-estimate"
                  max={1440}
                  min={5}
                  onChange={(event) => setEstimatedMinutes(event.target.value)}
                  required
                  type="number"
                  value={estimatedMinutes}
                />
                <span>min</span>
              </div>
            </label>
          </div>
          {error && <p className="sp-form-error" role="alert">{error}</p>}
          <div className="sp-dialog-footer">
            <Button className="sp-button-secondary" onClick={onClose} type="button" variant="outline">Cancel</Button>
            <Button className="sp-button-primary" type="submit">{task ? 'Save changes' : 'Add task'}</Button>
          </div>
        </form>
      )}
    </dialog>
  )
}
