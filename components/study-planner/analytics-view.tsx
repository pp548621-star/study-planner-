'use client'

import type { CSSProperties } from 'react'
import { Activity, BookOpenCheck, CheckCircle2, Target, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { getTodayKey, dateKeyFromDate, type StudyTask, type Subject } from '@/lib/study-planner'

interface AnalyticsViewProps {
  tasks: StudyTask[]
  subjects: Subject[]
}

export function AnalyticsView({ tasks, subjects }: AnalyticsViewProps) {
  const total = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 'Completed')
  const pendingCount = total - completedTasks.length
  const completionRate = total ? Math.round((completedTasks.length / total) * 100) : 0
  const today = getTodayKey()
  const dailyCompletions = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    const key = dateKeyFromDate(date)
    return {
      key,
      label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      count: tasks.filter((task) => task.status === 'Completed' && task.completedAt && dateKeyFromDate(new Date(task.completedAt)) === key).length,
    }
  })
  const subjectRows = subjects.map((subject) => {
    const subjectTasks = tasks.filter((task) => task.subjectId === subject.id)
    const completed = subjectTasks.filter((task) => task.status === 'Completed').length
    return {
      subject,
      subjectName: subject.name,
      total: subjectTasks.length,
      completed,
      pending: subjectTasks.length - completed,
    }
  })
  const dailyChartConfig = {
    count: { label: 'Completed tasks', color: 'var(--chart-2)' },
  } satisfies ChartConfig
  const subjectChartConfig = {
    completed: { label: 'Completed', color: 'var(--chart-2)' },
    pending: { label: 'Pending', color: 'var(--chart-1)' },
  } satisfies ChartConfig
  const priorityCount = {
    High: tasks.filter((task) => task.priority === 'High' && task.status === 'Pending').length,
    Medium: tasks.filter((task) => task.priority === 'Medium' && task.status === 'Pending').length,
    Low: tasks.filter((task) => task.priority === 'Low' && task.status === 'Pending').length,
  }
  const ringStyle = { '--progress': `${completionRate}%` } as CSSProperties
  const hasRecentCompletions = dailyCompletions.some((day) => day.count > 0)

  return (
    <div className="sp-page-stack">
      <section className="sp-page-heading">
        <div>
          <p className="sp-eyebrow">A VIEW OF YOUR MOMENTUM</p>
          <h1>Progress</h1>
          <p>Simple insights calculated from the tasks you have actually saved.</p>
        </div>
        <div className="sp-analytics-date"><Activity aria-hidden="true" />Updated today · {today}</div>
      </section>

      <section aria-label="Progress summary" className="sp-analytics-summary-grid">
        <article className="sp-analytics-summary-card">
          <div className="sp-analytics-summary-icon tone-indigo"><Target aria-hidden="true" /></div>
          <div className="sp-analytics-summary-copy"><p>Total tasks</p><strong>{total}</strong><span>Across all subjects</span></div>
        </article>
        <article className="sp-analytics-summary-card">
          <div className="sp-analytics-summary-icon tone-mint"><CheckCircle2 aria-hidden="true" /></div>
          <div className="sp-analytics-summary-copy"><p>Completed</p><strong>{completedTasks.length}</strong><span>{pendingCount} still pending</span></div>
        </article>
        <article className="sp-analytics-summary-card">
          <div className="sp-analytics-summary-icon tone-amber"><TrendingUp aria-hidden="true" /></div>
          <div className="sp-analytics-summary-copy"><p>Completion rate</p><strong>{completionRate}%</strong><span>Based on your task list</span></div>
        </article>
      </section>

      <div className="sp-analytics-grid">
        <section className="sp-panel sp-analytics-progress-panel">
          <div className="sp-panel-heading">
            <div><p className="sp-eyebrow">YOUR OVERALL PICTURE</p><h2>Task completion</h2></div>
            <div className="sp-analytics-icon"><BookOpenCheck aria-hidden="true" /></div>
          </div>
          <div className="sp-analytics-completion">
            <div aria-label={`${completionRate}% complete`} className="sp-progress-ring sp-progress-ring-large" role="img" style={ringStyle}>
              <div className="sp-progress-ring-center"><strong>{completionRate}%</strong><span>complete</span></div>
            </div>
            <div className="sp-analytics-completion-copy">
              <h3>{total ? `${completedTasks.length} of ${total} tasks completed` : 'Your progress starts with one task'}</h3>
              <p>{total ? 'Every finished task is one less thing to carry into your next study session.' : 'Add real tasks to see your progress take shape here.'}</p>
              <div className="sp-analytics-legend">
                <span><i className="legend-complete" />Completed <strong>{completedTasks.length}</strong></span>
                <span><i className="legend-pending" />Pending <strong>{pendingCount}</strong></span>
              </div>
            </div>
          </div>
        </section>

        <section className="sp-panel sp-daily-chart-panel">
          <div className="sp-panel-heading">
            <div><p className="sp-eyebrow">LAST 7 DAYS</p><h2>Daily completions</h2></div>
            <span className="sp-chart-unit">Tasks</span>
          </div>
          {hasRecentCompletions ? (
            <ChartContainer aria-label="Completed tasks per day over the last seven days" config={dailyChartConfig} className="sp-chart-container">
              <BarChart accessibilityLayer data={dailyCompletions} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} tickMargin={9} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="sp-chart-empty">
              <div className="sp-empty-icon"><Activity aria-hidden="true" /></div>
              <p>Daily completion history will appear after you finish tasks.</p>
            </div>
          )}
        </section>

        <section className="sp-panel sp-subject-chart-panel">
          <div className="sp-panel-heading">
            <div><p className="sp-eyebrow">WHERE YOU’RE STUDYING</p><h2>Tasks by subject</h2></div>
            <span className="sp-chart-unit">{total} total</span>
          </div>
          {subjectRows.length > 0 && total > 0 ? (
            <ChartContainer
              aria-label="Completed and pending task counts for each subject"
              config={subjectChartConfig}
              className="sp-chart-container sp-subject-chart-container"
              style={{ height: `${Math.max(190, subjectRows.length * 46)}px` }}
            >
              <BarChart accessibilityLayer data={subjectRows} layout="vertical" margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="subjectName" tickLine={false} axisLine={false} width={104} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="completed" stackId="tasks" fill="var(--color-completed)" radius={[4, 0, 0, 4]} />
                <Bar dataKey="pending" stackId="tasks" fill="var(--color-pending)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="sp-chart-empty"><div className="sp-empty-icon"><BookOpenCheck aria-hidden="true" /></div><p>{subjects.length ? 'Add tasks to see completed and pending work by subject.' : 'Add a subject to see how your work is distributed.'}</p></div>
          )}
        </section>

        <section className="sp-panel sp-analytics-priority-panel">
          <div className="sp-panel-heading">
            <div><p className="sp-eyebrow">NEXT UP</p><h2>Pending priorities</h2></div>
          </div>
          <div className="sp-analytics-priority-list">
            <div><span className="sp-priority-marker marker-high" /><span>High priority</span><strong>{priorityCount.High}</strong></div>
            <div><span className="sp-priority-marker marker-medium" /><span>Medium priority</span><strong>{priorityCount.Medium}</strong></div>
            <div><span className="sp-priority-marker marker-low" /><span>Low priority</span><strong>{priorityCount.Low}</strong></div>
          </div>
          <p className="sp-analytics-footnote">Only pending tasks are included in this priority summary.</p>
        </section>
      </div>
    </div>
  )
}
