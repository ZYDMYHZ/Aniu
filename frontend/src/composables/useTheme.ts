import { onMounted, ref } from 'vue'

const THEME_STORAGE_KEY = 'aniu-theme'
const DARK = 'dark'
const LIGHT = 'light'

export type Theme = typeof DARK | typeof LIGHT

const isDark = ref(true)

function applyTheme(theme: Theme) {
  isDark.value = theme === DARK
  const root = document.documentElement
  if (theme === LIGHT) {
    root.setAttribute('data-theme', LIGHT)
  } else {
    root.removeAttribute('data-theme')
  }
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') {
    return DARK
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === LIGHT || stored === DARK) {
    return stored
  }
  // 默认跟随系统，未匹配则深色
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return LIGHT
  }
  return DARK
}

export function initTheme() {
  applyTheme(readStoredTheme())
}

export function useTheme() {
  function toggleTheme() {
    const next: Theme = isDark.value ? LIGHT : DARK
    applyTheme(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    }
  }

  onMounted(() => {
    initTheme()
  })

  return {
    isDark,
    toggleTheme,
  }
}
