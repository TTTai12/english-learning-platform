
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'

interface AppLayoutProps {}

export default function AppLayout({}: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}