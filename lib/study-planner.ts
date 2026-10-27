export type Priority = 'Low' | 'Medium' | 'High'
export type TaskStatus = 'Pending' | 'Completed'
export type ViewKey = 'dashboard' | 'tasks' | 'subjects' | 'agenda' | 'analytics' | 'focus'

export interface StudyTask {
  id: string
  title: string
  description: string
  subjectId: string
  dueDate: string
  priority: Priority
  status: TaskStatus
  estimatedMinutes: number
  createdAt: string
  completedAt?: string
}

export type TaskFields = Pick<
  StudyTask,
  'title' | 'description' | 'subjectId' | 'dueDate' | 'priority' | 'estimatedMinutes'
>

export interface Subject {
  id: string
  name: string
  color: string
}

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'subject-dbms', name: 'DBMS', color: '#7774df' },
  { id: 'subject-operating-systems', name: 'Operating Systems', color: '#36a78d' },
  { id: 'subject-java', name: 'Java', color: '#e09b45' },
  { id: 'subject-data-structures', name: 'Data Structures', color: '#5c91cd' },
]

export const VIEW_LABELS: Record<ViewKey, string> = {
  dashboard: 'Dashboard',
  tasks: 'My tasks',
  subjects: 'Subjects',
  agenda: 'Agenda',
  analytics: 'Progress',
  focus: 'Focus timer',
}

export function isSubjectList(value: unknown): value is Subject[] {
  return (
    Array.isArray(value) &&
    value.every(
      (subject) =>
        typeof subject?.id === 'string' &&
        typeof subject?.name === 'string' &&
        subject.name.trim().length > 0 &&
        typeof subject?.color === 'string' &&
        /^#[\da-f]{6}$/i.test(subject.color),
    )
  )
}

function isValidDateKey(value: string) {
  if (value === '') return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function isTaskList(value: unknown): value is StudyTask[] {
  return (
    Array.isArray(value) &&
    value.every((task) =>
      typeof task?.id === 'string' &&
      typeof task?.title === 'string' &&
      typeof task?.description === 'string' &&
      typeof task?.subjectId === 'string' &&
      typeof task?.dueDate === 'string' &&
      isValidDateKey(task.dueDate) &&
      (task?.priority === 'Low' || task?.priority === 'Medium' || task?.priority === 'High') &&
      (task?.status === 'Pending' || task?.status === 'Completed') &&
      Number.isFinite(task?.estimatedMinutes) &&
      task.estimatedMinutes > 0 &&
      typeof task?.createdAt === 'string' &&
      (task?.completedAt === undefined || typeof task.completedAt === 'string'),
    )
  )
}

export function createId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function dateKeyFromDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayKey() {
  return dateKeyFromDate(new Date())
}

export function addDaysToDateKey(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + amount)
  return dateKeyFromDate(date)
}

export function endOfWeekKey(dateKey = getTodayKey()) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + (6 - date.getDay()))
  return dateKeyFromDate(date)
}

export function formatDate(dateKey: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  if (!dateKey || !isValidDateKey(dateKey)) return 'No due date'
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date)
}

export function formatToday() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date())
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`
}

export function isTaskOverdue(task: StudyTask, today = getTodayKey()) {
  return task.status === 'Pending' && Boolean(task.dueDate) && task.dueDate < today
}
