'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/study-planner/app-shell'
import { AgendaView } from '@/components/study-planner/agenda-view'
import { AnalyticsView } from '@/components/study-planner/analytics-view'
import { DashboardView } from '@/components/study-planner/dashboard-view'
import { FocusView } from '@/components/study-planner/focus-view'
import { SubjectsView } from '@/components/study-planner/subjects-view'
import { TaskFormDialog } from '@/components/study-planner/task-form-dialog'
import { TasksView } from '@/components/study-planner/tasks-view'
import { useLocalStorage } from '@/hooks/use-local-storage'
import {
  createId,
  DEFAULT_SUBJECTS,
  isSubjectList,
  isTaskList,
  type StudyTask,
  type Subject,
  type TaskFields,
  type ViewKey,
} from '@/lib/study-planner'

export function StudyPlannerApp() {
  const [tasks, setTasks, tasksReady, tasksStorageAvailable] = useLocalStorage<StudyTask[]>(
    'studyplanner-tasks-v1',
    [],
    isTaskList,
  )
  const [subjects, setSubjects, subjectsReady, subjectsStorageAvailable] = useLocalStorage<Subject[]>(
    'studyplanner-subjects-v1',
    DEFAULT_SUBJECTS,
    isSubjectList,
  )
  const [activeView, setActiveView] = useState<ViewKey>('dashboard')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState('all')
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null)
  const [draftSubjectId, setDraftSubjectId] = useState('')
  const [notice, setNotice] = useState('')
  const isStorageReady = tasksReady && subjectsReady
  const isStorageAvailable = tasksStorageAvailable && subjectsStorageAvailable
  const pendingCount = tasks.filter((task) => task.status === 'Pending').length

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function openTaskForm(task: StudyTask | null = null, subjectId?: string) {
    setEditingTask(task)
    setDraftSubjectId(subjectId ?? (selectedSubjectId !== 'all' ? selectedSubjectId : ''))
    setIsTaskDialogOpen(true)
  }

  function closeTaskForm() {
    setIsTaskDialogOpen(false)
    setEditingTask(null)
  }

  function saveTask(fields: TaskFields) {
    if (editingTask) {
      setTasks((current) => current.map((task) => task.id === editingTask.id ? { ...task, ...fields } : task))
      setNotice('Task updated.')
    } else {
      setTasks((current) => [
        {
          ...fields,
          id: createId(),
          status: 'Pending',
          createdAt: new Date().toISOString(),
        },
        ...current,
      ])
      setNotice('Task added to your plan.')
    }
    closeTaskForm()
  }

  function toggleTask(taskToToggle: StudyTask) {
    setTasks((current) => current.map((task) => {
      if (task.id !== taskToToggle.id) return task
      if (task.status === 'Pending') {
        return { ...task, status: 'Completed', completedAt: new Date().toISOString() }
      }
      const { completedAt: _completedAt, ...taskWithoutCompletionDate } = task
      return { ...taskWithoutCompletionDate, status: 'Pending' }
    }))
  }

  function deleteTask(task: StudyTask) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return
    setTasks((current) => current.filter((item) => item.id !== task.id))
    setNotice('Task deleted.')
  }

  function saveSubject(subjectFields: Omit<Subject, 'id'>, existingSubject: Subject | null) {
    if (existingSubject) {
      setSubjects((current) => current.map((subject) => subject.id === existingSubject.id ? { ...subject, ...subjectFields } : subject))
      return
    }
    setSubjects((current) => [...current, { ...subjectFields, id: createId() }])
  }

  function deleteSubject(subjectId: string, moveTasksToSubjectId?: string) {
    const linkedTasks = tasks.filter((task) => task.subjectId === subjectId)
    const validDestination = moveTasksToSubjectId && subjects.some((subject) => subject.id === moveTasksToSubjectId && subject.id !== subjectId)

    if (linkedTasks.length && !validDestination) return false

    if (validDestination) {
      setTasks((current) => current.map((task) => task.subjectId === subjectId ? { ...task, subjectId: moveTasksToSubjectId } : task))
    }
    setSubjects((current) => current.filter((subject) => subject.id !== subjectId))
    if (selectedSubjectId === subjectId) setSelectedSubjectId('all')
    return true
  }

  function resetWorkspace() {
    if (!window.confirm('Reset your StudyPlanner workspace? This removes all tasks and restores the starter subjects.')) return
    setTasks([])
    setSubjects(DEFAULT_SUBJECTS)
    setSelectedSubjectId('all')
    setActiveView('dashboard')
    setIsMobileNavOpen(false)
    setNotice('Workspace reset. Your starter subjects are ready.')
  }

  function openSubjectTasks(subjectId: string) {
    setSelectedSubjectId(subjectId)
    setActiveView('tasks')
    setIsMobileNavOpen(false)
  }

  function renderActiveView() {
    switch (activeView) {
      case 'tasks':
        return (
          <TasksView
            onAddTask={() => openTaskForm(null, selectedSubjectId === 'all' ? undefined : selectedSubjectId)}
            onDeleteTask={deleteTask}
            onEditTask={(task) => openTaskForm(task)}
            onSubjectFilterChange={setSelectedSubjectId}
            onToggleTask={toggleTask}
            selectedSubjectId={selectedSubjectId}
            subjects={subjects}
            tasks={tasks}
          />
        )
      case 'subjects':
        return <SubjectsView onDeleteSubject={deleteSubject} onOpenTasks={openSubjectTasks} onSaveSubject={saveSubject} subjects={subjects} tasks={tasks} />
      case 'agenda':
        return <AgendaView onAddTask={() => openTaskForm()} onDeleteTask={deleteTask} onEditTask={(task) => openTaskForm(task)} onToggleTask={toggleTask} subjects={subjects} tasks={tasks} />
      case 'analytics':
        return <AnalyticsView subjects={subjects} tasks={tasks} />
      case 'focus':
        return <FocusView />
      default:
        return (
          <DashboardView
            onAddTask={() => openTaskForm()}
            onDeleteTask={deleteTask}
            onEditTask={(task) => openTaskForm(task)}
            onNavigate={setActiveView}
            onToggleTask={toggleTask}
            subjects={subjects}
            tasks={tasks}
          />
        )
    }
  }

  return (
    <div className="sp-app">
      <AppShell
        activeView={activeView}
        isOpen={isMobileNavOpen}
        isStorageAvailable={isStorageAvailable}
        isStorageReady={isStorageReady}
        onClose={() => setIsMobileNavOpen(false)}
        onMenuToggle={() => setIsMobileNavOpen((isOpen) => !isOpen)}
        onNavigate={setActiveView}
        onReset={resetWorkspace}
        pendingCount={pendingCount}
        taskCount={tasks.length}
      >
        {!isStorageAvailable && isStorageReady && (
          <div className="sp-storage-warning" role="alert">
            Browser storage is unavailable. Your changes will work in this tab but may not be saved after you leave.
          </div>
        )}
        {renderActiveView()}
      </AppShell>
      {isTaskDialogOpen && (
        <TaskFormDialog
          defaultSubjectId={draftSubjectId}
          onClose={closeTaskForm}
          onOpenSubjects={() => {
            closeTaskForm()
            setActiveView('subjects')
          }}
          onSave={saveTask}
          subjects={subjects}
          task={editingTask}
        />
      )}
      {notice && <div aria-live="polite" className="sp-toast" role="status">{notice}</div>}
    </div>
  )
}
