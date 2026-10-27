'use client'

import type { CSSProperties } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  CircleAlert,
  CircleCheck,
  Clock3,
  Flame,
  ListTodo,
  Plus,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/study-planner/task-card'
import {
  formatDate,
  getTodayKey,
  isTaskOverdue,
  type StudyTask,
  type Subject,
  type ViewKey,
} from '@/lib/study-planner'

interface DashboardViewProps {
  tasks: StudyTask[]
  subjects: Subject[]
  onAddTask: () => void
  onEditTask: (task: StudyTask) => void
  onDeleteTask: (task: StudyTask) => void
  onToggleTask: (task: StudyTask) => void
  onNavigate: (view: ViewKey) => void
}

export function DashboardView({
  tasks,
  subjects,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
  onNavigate,
}: DashboardViewProps) {
  const today = getTodayKey()
  const total = tasks.length
  const completed = tasks.filter((task) => task.status === 'Completed').length
  const pending = total - completed
  const overdue = tasks.filter((task) => isTaskOverdue(task, today)).length
  const completionRate = total ? Math.round((completed / total) * 100) : 0
  const todayTasks = tasks
    .filter((task) => task.dueDate === today)
    .sort((a, b) => Number(a.status === 'Completed') - Number(b.status === 'Completed'))
    .slice(0, 4)
  const upcomingTasks = tasks
    .filter((task) => task.status === 'Pending' && task.dueDate > today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)
  const highPriority = tasks.filter((task) => task.status === 'Pending' && task.priority === 'High').length
  const mediumPriority = tasks.filter((task) => task.status === 'Pending' && task.priority === 'Medium').length
  const lowPriority = tasks.filter((task) => task.status === 'Pending' && task.priority === 'Low').length
  const progressStyle = { '--progress': `${completionRate}%` } as CSSProperties
  const subjectFor = (task: StudyTask) => subjects.find((subject) => subject.id === task.subjectId)

  const statCards = [
    {
      label: 'Total tasks',
      value: total,
      detail: 'Across your subjects',
      icon: ListTodo,
      tone: 'indigo',
    },
    {
      label: 'To do',
      value: pending,
      detail: pending ? 'Ready for your next session' : 'Nothing waiting right now',
      icon: Clock3,
      tone: 'amber',
    },
    {
      label: 'Completed',
      value: completed,
      detail: total ? `${completionRate}% of your task list` : 'Your progress starts here',
      icon: CircleCheck,
      tone: 'mint',
    },
    {
      label: 'Overdue',
      value: overdue,
      detail: overdue ? 'Worth a quick review' : 'You’re all caught up',
      icon: CircleAlert,
      tone: 'rose',
    },
  ]

  return (
    <div className="sp-page-stack">
      <section className="sp-welcome-card">
        <div className="sp-welcome-copy">
          <p className="sp-eyebrow sp-eyebrow-light">A LITTLE PROGRESS ADDS UP</p>
          <h1>Make today a focused one.</h1>
          <p>Keep your deadlines in view and give your next study session a clear direction.</p>
          <div className="sp-welcome-actions">
            <Button className="sp-button-light" onClick={onAddTask} type="button">
              <Plus aria-hidden="true" data-icon="inline-start" />
              Add a task
            </Button>
            <button className="sp-welcome-link" onClick={() => onNavigate('focus')} type="button">
              Start a focus session <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
        <div aria-hidden="true" className="sp-welcome-art">
          <div className="sp-welcome-orbit sp-welcome-orbit-one" />
          <div className="sp-welcome-orbit sp-welcome-orbit-two" />
          <div className="sp-welcome-note">
            <div className="sp-welcome-note-icon"><Target /></div>
            <span>One step at a time</span>
            <strong>{pending ? `${pending} tasks to go` : 'Ready when you are'}</strong>
          </div>
          <span className="sp-welcome-spark sp-welcome-spark-one">+</span>
          <span className="sp-welcome-spark sp-welcome-spark-two">+</span>
        </div>
      </section>

      <section aria-label="Task statistics" className="sp-stats-grid">
        {statCards.map(({ label, value, detail, icon: Icon, tone }) => (
          <article className="sp-stat-card" key={label}>
            <div className={`sp-stat-icon tone-${tone}`}><Icon aria-hidden="true" /></div>
            <div className="sp-stat-copy">
              <p>{label}</p>
              <strong>{value}</strong>
              <span>{detail}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="sp-dashboard-grid">
        <section className="sp-panel sp-today-panel">
          <div className="sp-panel-heading">
            <div>
              <p className="sp-eyebrow">YOUR PLAN</p>
              <h2>Today’s tasks</h2>
              <p className="sp-panel-subtitle">{formatDate(today, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <button className="sp-text-button" onClick={() => onNavigate('tasks')} type="button">
              View all <ArrowRight aria-hidden="true" />
            </button>
          </div>
          {todayTasks.length ? (
            <div className="sp-task-list">
              {todayTasks.map((task) => (
                <TaskCard
                  compact
                  key={task.id}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                  onToggle={onToggleTask}
                  subject={subjectFor(task)}
                  task={task}
                />
              ))}
            </div>
          ) : (
            <div className="sp-empty-state sp-empty-state-compact">
              <div className="sp-empty-icon"><BookOpenCheck aria-hidden="true" /></div>
              <h3>Your day is open</h3>
              <p>Add a task with today’s date and it will show up here.</p>
              <Button className="sp-button-secondary" onClick={onAddTask} type="button" variant="outline">
                <Plus aria-hidden="true" data-icon="inline-start" />
                Add today’s task
              </Button>
            </div>
          )}
        </section>

        <div className="sp-dashboard-side-column">
          <section className="sp-panel sp-progress-panel">
            <div className="sp-panel-heading sp-panel-heading-tight">
              <div>
                <p className="sp-eyebrow">AT A GLANCE</p>
                <h2>Overall progress</h2>
              </div>
              <button aria-label="Open progress analytics" className="sp-icon-button" onClick={() => onNavigate('analytics')} type="button">
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
            <div className="sp-progress-overview">
              <div aria-label={`${completionRate}% complete`} className="sp-progress-ring" role="img" style={progressStyle}>
                <div className="sp-progress-ring-center">
                  <strong>{completionRate}%</strong>
                  <span>complete</span>
                </div>
              </div>
              <div className="sp-progress-stats">
                <div><span className="sp-progress-legend legend-complete" />Completed <strong>{completed}</strong></div>
                <div><span className="sp-progress-legend legend-pending" />Pending <strong>{pending}</strong></div>
                <div><span className="sp-progress-legend legend-overdue" />Overdue <strong>{overdue}</strong></div>
              </div>
            </div>
          </section>

          <section className="sp-panel sp-priority-panel">
            <div className="sp-panel-heading sp-panel-heading-tight">
              <div>
                <p className="sp-eyebrow">STAY IN BALANCE</p>
                <h2>Priority overview</h2>
              </div>
              <Flame aria-hidden="true" className="sp-panel-heading-icon" />
            </div>
            <div className="sp-priority-summary">
              <div><span className="sp-priority-marker marker-high" /><span>High priority</span><strong>{highPriority}</strong></div>
              <div><span className="sp-priority-marker marker-medium" /><span>Medium priority</span><strong>{mediumPriority}</strong></div>
              <div><span className="sp-priority-marker marker-low" /><span>Low priority</span><strong>{lowPriority}</strong></div>
            </div>
          </section>
        </div>
      </div>

      <section className="sp-panel sp-upcoming-panel">
        <div className="sp-panel-heading">
          <div>
            <p className="sp-eyebrow">COMING UP</p>
            <h2>Next deadlines</h2>
          </div>
          <button className="sp-text-button" onClick={() => onNavigate('agenda')} type="button">
            Open agenda <ArrowRight aria-hidden="true" />
          </button>
        </div>
        {upcomingTasks.length ? (
          <div className="sp-task-list">
            {upcomingTasks.map((task) => (
              <TaskCard
                compact
                key={task.id}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                onToggle={onToggleTask}
                subject={subjectFor(task)}
                task={task}
              />
            ))}
          </div>
        ) : (
          <div className="sp-inline-empty">
            <Check aria-hidden="true" />
            <p>{tasks.length ? 'No upcoming deadlines. Add a due date to plan ahead.' : 'Your upcoming deadlines will appear here once you add tasks.'}</p>
            <button aria-label="Add a task" className="sp-icon-button" onClick={onAddTask} type="button"><Plus aria-hidden="true" /></button>
          </div>
        )}
      </section>
    </div>
  )
}
