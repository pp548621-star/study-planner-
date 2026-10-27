'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight, BookOpen, CheckCircle2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubjectFormDialog } from '@/components/study-planner/subject-form-dialog'
import type { StudyTask, Subject } from '@/lib/study-planner'

interface SubjectsViewProps {
  subjects: Subject[]
  tasks: StudyTask[]
  onSaveSubject: (subject: Omit<Subject, 'id'>, existingSubject: Subject | null) => void
  onDeleteSubject: (subjectId: string, moveTasksToSubjectId?: string) => boolean
  onOpenTasks: (subjectId: string) => void
}

export function SubjectsView({ subjects, tasks, onSaveSubject, onDeleteSubject, onOpenTasks }: SubjectsViewProps) {
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null)
  const [feedback, setFeedback] = useState('')

  function openCreateDialog() {
    setEditingSubject(null)
    setSubjectDialogOpen(true)
  }

  function openEditDialog(subject: Subject) {
    setEditingSubject(subject)
    setSubjectDialogOpen(true)
  }

  function saveSubject(subject: Omit<Subject, 'id'>) {
    onSaveSubject(subject, editingSubject)
    setSubjectDialogOpen(false)
    setEditingSubject(null)
    setFeedback(editingSubject ? 'Subject updated.' : 'Subject added.')
  }

  function confirmDelete(subjectId: string, moveTasksToSubjectId?: string) {
    const success = onDeleteSubject(subjectId, moveTasksToSubjectId)
    if (success) {
      setDeletingSubject(null)
      setFeedback('Subject removed. Your tasks were kept with the selected subject.')
    } else {
      setFeedback('Choose another subject to keep the linked tasks.')
    }
  }

  return (
    <div className="sp-page-stack">
      <section className="sp-page-heading">
        <div>
          <p className="sp-eyebrow">YOUR COURSE LIBRARY</p>
          <h1>Subjects</h1>
          <p>Group your work by course and see where your study time is going.</p>
        </div>
        <Button className="sp-button-primary" onClick={openCreateDialog} type="button">
          <Plus aria-hidden="true" data-icon="inline-start" />
          Add subject
        </Button>
      </section>

      {feedback && <p className="sp-sr-status" role="status">{feedback}</p>}
      <div className="sp-subject-summary">
        <div className="sp-subject-summary-icon"><BookOpen aria-hidden="true" /></div>
        <div><strong>{subjects.length}</strong><span>{subjects.length === 1 ? 'subject' : 'subjects'} in your workspace</span></div>
        <span className="sp-summary-separator" />
        <div><strong>{tasks.length}</strong><span>{tasks.length === 1 ? 'task' : 'tasks'} organized</span></div>
        <div className="sp-summary-decoration" aria-hidden="true"><CheckCircle2 /></div>
      </div>

      {subjects.length ? (
        <section aria-label="Your subjects" className="sp-subject-grid">
          {subjects.map((subject) => {
            const subjectTasks = tasks.filter((task) => task.subjectId === subject.id)
            const completedCount = subjectTasks.filter((task) => task.status === 'Completed').length
            const colorStyle = { '--subject-color': subject.color } as CSSProperties
            return (
              <article className="sp-subject-card" key={subject.id} style={colorStyle}>
                <div className="sp-subject-card-top">
                  <div className="sp-subject-symbol"><BookOpen aria-hidden="true" /></div>
                  <div className="sp-subject-card-actions">
                    <button aria-label={`Edit ${subject.name}`} className="sp-icon-button" onClick={() => openEditDialog(subject)} type="button">
                      <Pencil aria-hidden="true" />
                    </button>
                    <button aria-label={`Delete ${subject.name}`} className="sp-icon-button is-danger" onClick={() => setDeletingSubject(subject)} type="button">
                      <Trash2 aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <h2>{subject.name}</h2>
                <p className="sp-subject-card-meta">{subjectTasks.length} {subjectTasks.length === 1 ? 'task' : 'tasks'} · {completedCount} completed</p>
                <div aria-label={`${completedCount} of ${subjectTasks.length} tasks completed`} className="sp-subject-progress-track" role="img">
                  <span style={{ width: subjectTasks.length ? `${Math.round((completedCount / subjectTasks.length) * 100)}%` : '0%' }} />
                </div>
                <button className="sp-subject-open" onClick={() => onOpenTasks(subject.id)} type="button">
                  View tasks <ArrowRight aria-hidden="true" />
                </button>
              </article>
            )
          })}
        </section>
      ) : (
        <section className="sp-panel sp-empty-state sp-subject-empty">
          <div className="sp-empty-icon"><BookOpen aria-hidden="true" /></div>
          <h3>Start with a subject</h3>
          <p>Create your first course so every task has a place to belong.</p>
          <Button className="sp-button-primary" onClick={openCreateDialog} type="button"><Plus aria-hidden="true" data-icon="inline-start" />Add a subject</Button>
        </section>
      )}

      {subjectDialogOpen && (
        <SubjectFormDialog
          onClose={() => setSubjectDialogOpen(false)}
          onSave={saveSubject}
          subject={editingSubject}
          subjects={subjects}
        />
      )}
      {deletingSubject && (
        <DeleteSubjectDialog
          onClose={() => setDeletingSubject(null)}
          onConfirm={confirmDelete}
          subject={deletingSubject}
          subjects={subjects}
          taskCount={tasks.filter((task) => task.subjectId === deletingSubject.id).length}
        />
      )}
    </div>
  )
}

interface DeleteSubjectDialogProps {
  subject: Subject
  subjects: Subject[]
  taskCount: number
  onClose: () => void
  onConfirm: (subjectId: string, moveTasksToSubjectId?: string) => void
}

function DeleteSubjectDialog({ subject, subjects, taskCount, onClose, onConfirm }: DeleteSubjectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const otherSubjects = subjects.filter((item) => item.id !== subject.id)
  const [targetSubjectId, setTargetSubjectId] = useState(otherSubjects[0]?.id ?? '')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog aria-labelledby="delete-subject-title" className="sp-dialog sp-dialog-small" onCancel={onClose} ref={dialogRef}>
      <div className="sp-dialog-header">
        <div className="sp-dialog-heading-icon is-warning"><Trash2 aria-hidden="true" /></div>
        <div>
          <p className="sp-eyebrow">REMOVE SUBJECT</p>
          <h2 id="delete-subject-title">Delete {subject.name}?</h2>
          <p className="sp-dialog-description">
            {taskCount ? `Move ${taskCount} ${taskCount === 1 ? 'task' : 'tasks'} first so nothing gets lost.` : 'This subject has no tasks and can be safely removed.'}
          </p>
        </div>
        <button aria-label="Close delete dialog" className="sp-icon-button sp-dialog-close" onClick={onClose} type="button"><X aria-hidden="true" /></button>
      </div>
      {taskCount > 0 && otherSubjects.length > 0 && (
        <label className="sp-field sp-field-full sp-delete-subject-select" htmlFor="move-subject">
          <span>Move tasks to</span>
          <select id="move-subject" onChange={(event) => setTargetSubjectId(event.target.value)} value={targetSubjectId}>
            {otherSubjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      )}
      {taskCount > 0 && otherSubjects.length === 0 && (
        <p className="sp-form-error">Add another subject before deleting this one, so your tasks have somewhere to go.</p>
      )}
      <div className="sp-dialog-footer">
        <Button className="sp-button-secondary" onClick={onClose} type="button" variant="outline">Keep subject</Button>
        <Button
          className="sp-button-danger"
          disabled={taskCount > 0 && (!otherSubjects.length || !targetSubjectId)}
          onClick={() => onConfirm(subject.id, taskCount ? targetSubjectId : undefined)}
          type="button"
          variant="destructive"
        >
          <Trash2 aria-hidden="true" data-icon="inline-start" />
          Delete subject
        </Button>
      </div>
    </dialog>
  )
}
