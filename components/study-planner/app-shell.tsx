'use client'

import type { ReactNode } from 'react'
import {
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesCombined,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Menu,
  RotateCcw,
  ShieldCheck,
  Timer,
  X,
} from 'lucide-react'
import { formatToday, VIEW_LABELS, type ViewKey } from '@/lib/study-planner'

const navigationItems = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'tasks', icon: ListTodo, label: 'My tasks' },
  { key: 'subjects', icon: BookOpenCheck, label: 'Subjects' },
  { key: 'agenda', icon: CalendarDays, label: 'Agenda' },
  { key: 'analytics', icon: ChartNoAxesCombined, label: 'Progress' },
  { key: 'focus', icon: Timer, label: 'Focus timer' },
] as const satisfies { key: ViewKey; icon: typeof LayoutDashboard; label: string }[]

interface AppSidebarProps {
  activeView: ViewKey
  isOpen: boolean
  isStorageReady: boolean
  isStorageAvailable: boolean
  pendingCount: number
  taskCount: number
  onNavigate: (view: ViewKey) => void
  onClose: () => void
  onReset: () => void
}

export function AppSidebar({
  activeView,
  isOpen,
  isStorageReady,
  isStorageAvailable,
  pendingCount,
  taskCount,
  onNavigate,
  onClose,
  onReset,
}: AppSidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          aria-label="Close navigation"
          className="sp-sidebar-backdrop"
          onClick={onClose}
          type="button"
        />
      )}
      <aside aria-label="Primary navigation" className={`sp-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sp-brand-lockup">
          <div aria-hidden="true" className="sp-brand-mark">
            <GraduationCap />
          </div>
          <div className="sp-brand-name">
            <span>StudyPlanner</span>
            <small>STUDENT WORKSPACE</small>
          </div>
          <button
            aria-label="Close navigation"
            className="sp-sidebar-close"
            onClick={onClose}
            type="button"
          >
            <X />
          </button>
        </div>

        <p className="sp-nav-caption">WORKSPACE</p>
        <nav className="sp-nav">
          {navigationItems.map(({ key, icon: Icon, label }) => (
            <button
              aria-current={activeView === key ? 'page' : undefined}
              className={`sp-nav-item ${activeView === key ? 'is-active' : ''}`}
              key={key}
              onClick={() => onNavigate(key)}
              type="button"
            >
              <Icon aria-hidden="true" className="sp-nav-icon" />
              <span>{label}</span>
              {key === 'tasks' && taskCount > 0 && <span className="sp-nav-count">{taskCount}</span>}
            </button>
          ))}
        </nav>

        <div className="sp-sidebar-spacer" />
        <section aria-label="Study plan summary" className="sp-sidebar-plan">
          <div className="sp-sidebar-plan-icon">
            <Clock3 aria-hidden="true" />
          </div>
          <p className="sp-sidebar-plan-title">Your study plan</p>
          <p className="sp-sidebar-plan-copy">
            {pendingCount === 0
              ? 'A fresh page for your next goal.'
              : `${pendingCount} ${pendingCount === 1 ? 'task' : 'tasks'} ready for your attention.`}
          </p>
          <button className="sp-sidebar-reset" onClick={onReset} type="button">
            <RotateCcw aria-hidden="true" />
            Reset workspace
          </button>
        </section>
        <div className={`sp-storage-note ${isStorageAvailable ? '' : 'has-error'}`} role="status">
          <ShieldCheck aria-hidden="true" />
          <span>
            {!isStorageReady
              ? 'Loading your workspace…'
              : isStorageAvailable
                ? 'Saved on this device'
                : 'Browser storage unavailable'}
          </span>
        </div>
      </aside>
    </>
  )
}

interface AppShellProps extends AppSidebarProps {
  children: ReactNode
  onMenuToggle: () => void
}

export function AppShell({ children, activeView, isOpen, onNavigate, onMenuToggle, ...sidebarProps }: AppShellProps) {
  const handleNavigate = (view: ViewKey) => {
    onNavigate(view)
    sidebarProps.onClose()
  }

  return (
    <div className="sp-app-shell">
      <AppSidebar activeView={activeView} isOpen={isOpen} onNavigate={handleNavigate} {...sidebarProps} />
      <div className="sp-main-column">
        <header className="sp-topbar">
          <button
            aria-expanded={isOpen}
            aria-label="Open navigation"
            className="sp-mobile-menu"
            onClick={onMenuToggle}
            type="button"
          >
            <Menu aria-hidden="true" />
          </button>
          <div className="sp-breadcrumbs">
            <span>Workspace</span>
            <span aria-hidden="true" className="sp-breadcrumb-divider">/</span>
            <strong>{VIEW_LABELS[activeView]}</strong>
          </div>
          <div className="sp-topbar-actions">
            <div className="sp-date-chip">
              <CalendarDays aria-hidden="true" />
              <span>{formatToday()}</span>
            </div>
            <div aria-label="Student profile" className="sp-avatar" role="img">
              <span>SP</span>
            </div>
          </div>
        </header>
        <main className="sp-main-content">{children}</main>
      </div>
    </div>
  )
}
