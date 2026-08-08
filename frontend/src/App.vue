<template>
  <div v-if="isLoginPage" class="aniu-shell">
    <main class="aniu-login-standalone">
      <router-view></router-view>
    </main>
  </div>

  <div v-else class="aniu-shell">
    <div class="aniu-body">
      <!-- 侧栏 -->
      <aside
        class="aniu-sidebar"
        :class="{ 'is-collapsed': sidebarCollapsed && !mobileOpen, 'is-open': mobileOpen }"
      >
        <div class="aniu-sidebar-brand">
          <img src="/aniu.ico" alt="Aniu logo" />
          <div v-if="!sidebarCollapsed || mobileOpen" class="aniu-sidebar-brand-copy">
            <strong>Aniu</strong>
            <span>AI 模拟交易</span>
          </div>
        </div>

        <nav class="aniu-sidebar-nav">
          <router-link
            v-for="item in appNavigation"
            :key="item.id"
            :to="item.path"
            class="aniu-nav-link"
            :class="{ 'is-collapsed': sidebarCollapsed && !mobileOpen }"
            active-class="active"
            :title="sidebarCollapsed && !mobileOpen ? item.name : undefined"
            @click="mobileOpen = false"
          >
            <component :is="iconMap[item.icon]" :size="18" />
            <span v-if="!sidebarCollapsed || mobileOpen">{{ item.name }}</span>
          </router-link>
        </nav>

        <div class="aniu-sidebar-foot">
          <button
            class="aniu-nav-link aniu-sidebar-collapse"
            :class="{ 'is-collapsed': sidebarCollapsed && !mobileOpen }"
            type="button"
            @click="toggleSidebar"
          >
            <component :is="iconMap['PanelLeftClose']" :size="18" />
            <span v-if="!sidebarCollapsed || mobileOpen">收起侧栏</span>
          </button>
        </div>
      </aside>

      <div v-if="mobileOpen" class="aniu-overlay" @click="mobileOpen = false"></div>

      <!-- 主内容 -->
      <div class="aniu-main">
        <header class="aniu-topbar">
          <button class="aniu-menu-btn" type="button" @click="mobileOpen = true" aria-label="打开菜单">
            <component :is="iconMap['Menu']" :size="20" />
          </button>

          <div class="aniu-topbar-title">{{ currentPageTitle }}</div>

          <div class="aniu-topbar-spacer"></div>

          <div class="aniu-kpi-strip">
            <div class="aniu-kpi">
              <span class="aniu-kpi-label">总资产</span>
              <span class="aniu-kpi-value">{{ formatMoney(account?.total_assets) }}</span>
            </div>
            <div class="aniu-kpi">
              <span class="aniu-kpi-label">当日盈亏</span>
              <span class="aniu-kpi-value" :class="profitTone(account?.daily_profit)">
                {{ formatSignedMoney(account?.daily_profit) }}
              </span>
            </div>
            <div class="aniu-kpi">
              <span class="aniu-kpi-label">仓位</span>
              <span class="aniu-kpi-value">{{ formatPercent(account?.total_position_ratio) }}</span>
            </div>
          </div>

          <div class="aniu-topbar-actions">
            <button
              class="aniu-icon-btn"
              type="button"
              :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
              @click="toggleTheme"
            >
              <component :is="isDark ? iconMap['Sun'] : iconMap['Moon']" :size="19" />
            </button>
            <a
              class="aniu-icon-btn"
              href="https://github.com/AnacondaKC/Aniu"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <component :is="iconMap['Github']" :size="19" />
            </a>
            <span class="aniu-avatar" title="Aniu 用户">A</span>
            <button class="aniu-icon-btn" type="button" title="退出登录" @click="handleLogout">
              <component :is="iconMap['LogOut']" :size="19" />
            </button>
          </div>
        </header>

        <main class="aniu-content">
          <router-view></router-view>
        </main>

        <footer class="aniu-footer">
          <div class="aniu-footer-copy">© {{ currentYear }} Aniu · A股 AI 模拟交易</div>
          <a href="https://github.com/AnacondaKC/Aniu" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://github.com/AnacondaKC/Aniu/issues" target="_blank" rel="noopener noreferrer">Issues</a>
          <span class="aniu-version">v{{ appVersion }}</span>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  LayoutDashboard,
  Activity,
  MessageSquareText,
  CalendarClock,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Sun,
  Moon,
  LogOut,
  Github,
} from 'lucide-vue-next'

import appPackage from '../package.json'
import { appNavigation } from '@/config/navigation'
import { useAppStore } from '@/stores/legacy'
import { useTheme, initTheme } from '@/composables/useTheme'
import { formatMoney, formatPercent } from '@/utils/formatters'
import {
  clearStoredLoginFlag,
  clearStoredLoginNotice,
  clearStoredLoginRedirect,
  clearStoredToken,
} from '@/services/api'

const iconMap: Record<string, unknown> = {
  LayoutDashboard,
  Activity,
  MessageSquareText,
  CalendarClock,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Sun,
  Moon,
  LogOut,
  Github,
}

const store = useAppStore()
const router = useRouter()
const route = useRoute()
const { account } = storeToRefs(store)

// 主题（在 mount 前已 initTheme，装载时确保）
initTheme()
const { isDark, toggleTheme } = useTheme()

const appVersion = appPackage.version
const currentYear = new Date().getFullYear()

const isLoginPage = computed(() => route.path === '/login')
const mobileOpen = ref(false)
const sidebarCollapsed = ref(false)

const currentPageTitle = computed(() => {
  const match = appNavigation.find((item) => route.path.startsWith(item.path))
  return match ? match.name : 'Aniu'
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function formatSignedMoney(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '--'
  const formatted = formatMoney(Math.abs(value))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

function profitTone(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  if (value > 0) return 'aniu-tone-up'
  if (value < 0) return 'aniu-tone-down'
  return ''
}

function handleResize() {
  if (window.innerWidth > 768) {
    mobileOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function handleLogout() {
  clearStoredToken()
  clearStoredLoginFlag()
  clearStoredLoginNotice()
  clearStoredLoginRedirect()
  store.resetState()
  router.replace('/login')
}
</script>
