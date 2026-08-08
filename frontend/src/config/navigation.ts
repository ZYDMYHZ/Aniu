export interface AppNavItem {
  id: string
  name: string
  path: string
  icon: string
}

export const appNavigation: AppNavItem[] = [
  { id: 'overview', name: '总览', path: '/overview', icon: 'LayoutDashboard' },
  { id: 'tasks', name: 'AI分析', path: '/tasks', icon: 'Activity' },
  { id: 'chat', name: 'AI聊天', path: '/chat', icon: 'MessageSquareText' },
  { id: 'schedule', name: '定时任务', path: '/schedule', icon: 'CalendarClock' },
  { id: 'settings', name: '功能设置', path: '/settings', icon: 'Settings2' },
]
