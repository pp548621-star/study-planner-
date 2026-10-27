'use client'

import { useMemo, useState } from 'react'
import { ListFilter, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/study-planner/task-card'
import { getTodayKey, isTaskOverdue, type StudyTask, type Subject } from '@/lib/study-planner'

export type TaskDateFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'no-date'
export type TaskSort = 'deadline' | 'priority' | 'created'

interface TasksViewProps {
  tasks: StudyTask[]
  subjects: Subject[]
  selectedSubjectId: string
  onSubjectFilterChange: (subjectId: string) => void
  onAddTask: () => void
  onEditTask: (task: StudyTask) => void
  onDeleteTask: (task: StudyTask) => void
  onToggleTask: (task: StudyTask) => void
}

export function TasksView({
  tasks,
  subjects,
  selectedSubjectId,
  onSubjectFilterChange,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
}: TasksViewProps) {
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<TaskDateFilter>('all')
  const [sortBy, setSortBy] = useState<TaskSort>('deadline')
  const today = getTodayKey()

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const matchingTasks = tasks.filter((task) => {
      const subjectName = subjects.find((subject) => subject.id === task.subjectId)?.name ?? ''
      const matchesSearch = !normalizedSearch || `${task.title} ${task.description} ${subjectName}`.toLowerCase().includes(normalizedSearch)
      const matchesSubject = selectedSubjectId === 'all' || task.subjectId === selectedSubjectId
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'today' && task.dueDate === today) ||
        (dateFilter === 'upcoming' && task.status === 'Pending' && task.dueDate > today) ||
        (dateFilter === 'overdue' && isTaskOverdue(task, today)) ||
        (dateFilter === 'no-date' && !task.dueDate)
      return matchesSearch && matchesSubject && matchesPriority && matchesStatus && matchesDate
    })

    const priorityRank = { High: 0, Medium: 1, Low: 2 }
    return matchingTasks.sort((a, b) => {
      if (sortBy === 'created') return b.createdAt.localeCompare(a.createdAt)
      if (sortBy === 'priority') {
        return priorityRank[a.priority] - priorityRank[b.priority] || (a.dueDate || '9999').localeCompare(b.dueDate || '9999')
      }
      return (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || priorityRank[a.priority] - priorityRank[b.priority]
    })
  }, [dateFilter, priorityFilter, search, selectedSubjectId, sortBy, statusFilter, subjects, tasks, today])

  const hasActiveFilters = Boolean(
    search.trim() || priorityFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || selectedSubjectId !== 'all',
  )

  function clearFilters() {
    setSearch('')
    setPriorityFilter('all')
    setStatusFilter('all')
    setDateFilter('all')
    setSortBy('deadline')
    onSubjectFilterChange('all')
  }

  return (
    <div className="sp-page-stack">
      <section className="sp-page-heading">
        <div>
          <p className="sp-eyebrow">YOUR WORK, IN ONE PLACE</p>
          <h1>My tasks</h1>
          <p>Search, sort, and keep every study deadline moving.</p>
        </div>
        <Button className="sp-button-primary" onClick={onAddTask} type="button">
          <Plus aria-hidden="true" data-icon="inline-start" />
          New task
        </Button>
      </section>

      <section aria-label="Search and filter tasks" className="sp-panel sp-filter-panel">
        <div className="sp-filter-topline">
          <div className="sp-search-field">
            <Search aria-hidden="true" />
            <label className="sr-only" htmlFor="task-search">Search tasks</label>
            <input id="task-search" onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks or subjects" value={search} />
            {search && <button aria-label="Clear search" className="sp-search-clear" onClick={() => setSearch('')} type="button"><X /></button>}
          </div>
          <div className="sp-filter-caption"><SlidersHorizontal aria-hidden="true" /> Filters</div>
        </div>
        <div className="sp-filter-grid">
          <label className="sp-filter-control">
            <span className="sr-only">Filter by subject</span>
            <select aria-label="Filter by subject" onChange={(event) => onSubjectFilterChange(event.target.value)} value={selectedSubjectId}>
              <option value="all">All subjects</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </label>
          <label className="sp-filter-control">
            <span className="sr-only">Filter by priority</span>
            <select aria-label="Filter by priority" onChange={(event) => setPriorityFilter(event.target.value)} value={priorityFilter}>
              <option value="all">Any priority</option>
              <option value="High">High priority</option>
              <option value="Medium">Medium priority</option>
              <option value="Low">Low priority</option>
            </select>
          </label>
          <label className="sp-filter-control">
            <span className="sr-only">Filter by completion status</span>
            <select aria-label="Filter by completion status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">Any status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
          <label className="sp-filter-control">
            <span className="sr-only">Filter by due date</span>
            <select aria-label="Filter by due date" onChange={(event) => setDateFilter(event.target.value as TaskDateFilter)} value={dateFilter}>
              <option value="all">Any due date</option>
              <option value="today">Due today</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="no-date">No due date</option>
            </select>
          </label>
          <label className="sp-filter-control">
            <span className="sr-only">Sort tasks</span>
            <select aria-label="Sort tasks" onChange={(event) => setSortBy(event.target.value as TaskSort)} value={sortBy}>
              <option value="deadline">Sort: deadline</option>
              <option value="priority">Sort: priority</option>
              <option value="created">Sort: newest</option>
            </select>
          </label>
          {hasActiveFilters && (
            <button className="sp-clear-filters" onClick={clearFilters} type="button">
              <X aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
      </section>

      <section aria-live="polite" className="sp-task-results">
        <div className="sp-results-heading">
          <div>
            <h2>{selectedSubjectId !== 'all' ? subjects.find((subject) => subject.id === selectedSubjectId)?.name ?? 'Tasks' : 'All tasks'}</h2>
            <p>{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}{hasActiveFilters ? ' found' : ''}</p>
          </div>
          {hasActiveFilters && <span className="sp-filter-active"><ListFilter aria-hidden="true" /> Filters active</span>}
        </div>
        {filteredTasks.length ? (
          <div className="sp-task-list">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                onToggle={onToggleTask}
                subject={subjects.find((subject) => subject.id === task.subjectId)}
                task={task}
              />
            ))}
          </div>
        ) : (
          <div className="sp-panel sp-empty-state sp-results-empty">
            <div className="sp-empty-icon">{tasks.length ? <Search aria-hidden="true" /> : <ListFilter aria-hidden="true" />}</div>
            <h3>{tasks.length ? 'No tasks match these filters' : 'Your task list is ready'}</h3>
            <p>{tasks.length ? 'Try a different search or clear the filters to see all your work.' : 'Add your first task and give it a subject, priority, and due date.'}</p>
            {tasks.length ? (
              <Button className="sp-button-secondary" onClick={clearFilters} type="button" variant="outline">Clear filters</Button>
            ) : (
              <Button className="sp-button-primary" onClick={onAddTask} type="button"><Plus aria-hidden="true" data-icon="inline-start" />Add your first task</Button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
