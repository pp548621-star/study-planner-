'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, CalendarSearch, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/study-planner/task-card'
import {
  addDaysToDateKey,
  endOfWeekKey,
  formatDate,
  getTodayKey,
  type StudyTask,
  type Subject,
} from '@/lib/study-planner'

interface AgendaViewProps {
  tasks: StudyTask[]
  subjects: Subject[]
  onAddTask: () => void
  onEditTask: (task: StudyTask) => void
  onDeleteTask: (task: StudyTask) => void
  onToggleTask: (task: StudyTask) => void
}

export function AgendaView({ tasks, subjects, onAddTask, onEditTask, onDeleteTask, onToggleTask }: AgendaViewProps) {
  const today = getTodayKey()
  const tomorrow = addDaysToDateKey(today, 1)
  const weekEnd = endOfWeekKey(today)
  const [selectedDate, setSelectedDate] = useState(today)

  const groups = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    return [
      { key: 'overdue', title: 'Overdue', helper: 'Needs a new plan', tasks: sorted.filter((task) => task.status === 'Pending' && task.dueDate && task.dueDate < today) },
      { key: 'today', title: 'Today', helper: formatDate(today, { weekday: 'long', month: 'long', day: 'numeric' }), tasks: sorted.filter((task) => task.dueDate === today) },
      { key: 'tomorrow', title: 'Tomorrow', helper: formatDate(tomorrow, { month: 'long', day: 'numeric' }), tasks: sorted.filter((task) => task.dueDate === tomorrow) },
      { key: 'week', title: 'This week', helper: `Through ${formatDate(weekEnd, { month: 'short', day: 'numeric' })}`, tasks: sorted.filter((task) => task.dueDate > tomorrow && task.dueDate <= weekEnd) },
      { key: 'later', title: 'Later', helper: 'Coming up after this week', tasks: sorted.filter((task) => task.dueDate > weekEnd) },
      { key: 'completed', title: 'Completed earlier', helper: 'Past deadlines you have finished', tasks: sorted.filter((task) => task.status === 'Completed' && task.dueDate && task.dueDate < today) },
      { key: 'no-date', title: 'No due date', helper: 'Add a date whenever you are ready', tasks: sorted.filter((task) => !task.dueDate) },
    ].filter((group) => group.tasks.length > 0)
  }, [tasks, today, tomorrow, weekEnd])

  const selectedDateTasks = tasks
    .filter((task) => task.dueDate === selectedDate)
    .sort((a, b) => Number(a.status === 'Completed') - Number(b.status === 'Completed'))
  const taskSubject = (task: StudyTask) => subjects.find((subject) => subject.id === task.subjectId)

  return (
    <div className="sp-page-stack">
      <section className="sp-page-heading">
        <div>
          <p className="sp-eyebrow">DEADLINES, MADE CLEAR</p>
          <h1>Agenda</h1>
          <p>See what is due next and choose a date to review your plan.</p>
        </div>
        <Button className="sp-button-primary" onClick={onAddTask} type="button"><Plus aria-hidden="true" data-icon="inline-start" />New task</Button>
      </section>

      <section className="sp-agenda-date-panel">
        <div className="sp-agenda-date-copy">
          <div className="sp-agenda-date-icon"><CalendarSearch aria-hidden="true" /></div>
          <div><p className="sp-eyebrow">SELECT A DATE</p><h2>Look ahead at your schedule</h2></div>
        </div>
        <label className="sp-date-picker" htmlFor="agenda-date">
          <span className="sr-only">Choose a date to view tasks</span>
          <CalendarDays aria-hidden="true" />
          <input id="agenda-date" onChange={(event) => setSelectedDate(event.target.value)} type="date" value={selectedDate} />
        </label>
      </section>

      <div className="sp-agenda-grid">
        <section aria-label="Tasks on selected date" className="sp-panel sp-selected-date-panel">
          <div className="sp-panel-heading">
            <div>
              <p className="sp-eyebrow">DAY VIEW</p>
              <h2>{selectedDate === today ? 'Today' : formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
              <p className="sp-panel-subtitle">{selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'} scheduled</p>
            </div>
          </div>
          {selectedDateTasks.length ? (
            <div className="sp-task-list">
              {selectedDateTasks.map((task) => <TaskCard key={task.id} onDelete={onDeleteTask} onEdit={onEditTask} onToggle={onToggleTask} subject={taskSubject(task)} task={task} />)}
            </div>
          ) : (
            <div className="sp-empty-state sp-empty-state-compact">
              <div className="sp-empty-icon"><CalendarDays aria-hidden="true" /></div>
              <h3>No tasks on this date</h3>
              <p>Keep this day open or add a deadline to your plan.</p>
              <Button className="sp-button-secondary" onClick={onAddTask} type="button" variant="outline"><Plus aria-hidden="true" data-icon="inline-start" />Add a task</Button>
            </div>
          )}
        </section>

        <section aria-label="Tasks grouped by deadline" className="sp-panel sp-agenda-list-panel">
          <div className="sp-panel-heading">
            <div><p className="sp-eyebrow">YOUR DEADLINES</p><h2>Upcoming agenda</h2></div>
            <span className="sp-agenda-total">{tasks.length} total</span>
          </div>
          {groups.length ? (
            <div className="sp-agenda-groups">
              {groups.map((group) => (
                <section className="sp-agenda-group" key={group.key}>
                  <div className={`sp-agenda-group-marker marker-${group.key}`} />
                  <div className="sp-agenda-group-content">
                    <div className="sp-agenda-group-heading">
                      <div><h3>{group.title}</h3><p>{group.helper}</p></div>
                      <span>{group.tasks.length}</span>
                    </div>
                    <div className="sp-agenda-group-tasks">
                      {group.tasks.map((task) => (
                        <button className="sp-agenda-task-link" key={task.id} onClick={() => setSelectedDate(task.dueDate || today)} type="button">
                          <span className={`sp-agenda-task-status ${task.status === 'Completed' ? 'is-completed' : ''}`} />
                          <span className={task.status === 'Completed' ? 'is-struck' : ''}>{task.title}</span>
                          {task.dueDate && <time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time>}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="sp-empty-state sp-empty-state-compact">
              <div className="sp-empty-icon"><CalendarDays aria-hidden="true" /></div>
              <h3>Your agenda is clear</h3>
              <p>Add tasks to see deadlines grouped by day.</p>
              <Button className="sp-button-secondary" onClick={onAddTask} type="button" variant="outline"><Plus aria-hidden="true" data-icon="inline-start" />Add a task</Button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
