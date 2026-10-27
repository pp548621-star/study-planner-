'use client'

import dynamic from 'next/dynamic'

const StudyPlannerApp = dynamic(
  () => import('@/components/study-planner/study-planner-app').then((mod) => mod.StudyPlannerApp),
  { ssr: false },
)

export default function Page() {
  return <StudyPlannerApp />
}
