import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StudyPlanner — Make your next study session count',
  description: 'Plan assignments, track deadlines, organize subjects, and make focused study time part of your routine.',
  applicationName: 'StudyPlanner',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StudyPlanner',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#f5f6fa',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
