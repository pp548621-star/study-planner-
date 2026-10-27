'use client'

import type { CSSProperties } from 'react'
import { CalendarDays, Clock3, Pencil, Trash2 } from 'lucide-react'
import { formatDate, formatMinutes, isTaskOverdue, type StudyTask, type Subject } from '@/lib/study-planner'

interface TaskCardProps {
  task: StudyTask
  subject?: Subject
  compact?: boolean
  onToggle: (task: StudyTask) => void
  onEdit: (task: StudyTask) => void
  onDelete: (task: StudyTask) => void
}

export function TaskCard({ task, subject, compact = false, onToggle, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'Completed'
  const overdue = isTaskOverdue(task)
  const subjectStyle = subject ? ({ '--subject-color': subject.color } as CSSProperties) : undefined

  return (
    <article className={`sp-task-card ${compact ? 'is-compact' : ''} ${isCompleted ? 'is-completed' : ''}`}>
      <input
        aria-label={`Mark ${task.title} as ${isCompleted ? 'pending' : 'completed'}`}
        checked={isCompleted}
        className="sp-task-checkbox"
        onChange={() => onToggle(task)}
        type="checkbox"
      />
      <div className="sp-task-content">
        <div className="sp-task-heading-row">
          <h3 className="sp-task-title">{task.title}</h3>
          <span className={`sp-priority-chip priority-${task.priority.toLowerCase()}`}>
            <span aria-hidden="true" className="sp-priority-dot" />
            {task.priority}
          </span>
        </div>
        {!compact && task.description && <p className="sp-task-description">{task.description}</p>}
        <div className="sp-task-meta">
          <span className="sp-subject-tag" style={subjectStyle}>
            <span aria-hidden="true" className="sp-subject-dot" />
            {subject?.name ?? 'Unassigned'}
          </span>
          <span className={`sp-task-due ${overdue ? 'is-overdue' : ''}`}>
            <CalendarDays aria-hidden="true" />
            {overdue ? 'Overdue · ' : ''}{formatDate(task.dueDate)}
          </span>
          <span className="sp-task-duration">
            <Clock3 aria-hidden="true" />
            {formatMinutes(task.estimatedMinutes)}
          </span>
        </div>
      </div>
      <div className="sp-task-actions">
        <button aria-label={`Edit ${task.title}`} className="sp-icon-button" onClick={() => onEdit(task)} type="button">
          <Pencil aria-hidden="true" />
        </button>
        <button aria-label={`Delete ${task.title}`} className="sp-icon-button is-danger" onClick={() => onDelete(task)} type="button">
          <Trash2 aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
