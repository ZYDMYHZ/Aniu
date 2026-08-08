<template>
  <div class="login-page">
    <section class="login-card aniu-card">
      <div class="login-avatar-shell">
        <img class="login-avatar" src="/aniu.ico" alt="Aniu avatar" />
      </div>

      <div class="login-copy">
        <h1>Aniu</h1>
        <p>输入密码登录 AI 模拟交易系统</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <label class="aniu-field">
          <span class="aniu-field-label">
            <Lock :size="14" />
            密码
          </span>
          <input
            v-model="password"
            type="password"
            class="aniu-input"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </label>

        <label class="login-remember-row">
          <input v-model="rememberCredentials" type="checkbox" class="aniu-checkbox" />
          <span>默认记住密码</span>
        </label>

        <p v-if="errorMessage" class="login-error aniu-text-danger">{{ errorMessage }}</p>

        <button class="aniu-btn aniu-btn-primary aniu-btn-lg login-submit" :disabled="submitting" type="submit">
          <span v-if="submitting" class="aniu-spinner"></span>
          <LogIn :size="16" />
          <span>登录</span>
        </button>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, LogIn } from 'lucide-vue-next'

import {
  api,
  clearStoredLoginFlag,
  clearStoredLoginNotice,
  clearStoredToken,
  consumeStoredLoginNotice,
  consumeStoredLoginRedirect,
  getStoredLoginFlag,
  getStoredToken,
  setStoredLoginFlag,
  setStoredToken,
} from '@/services/api'
import { REMEMBERED_PASSWORD_STORAGE_KEY } from '@/constants'

const router = useRouter()
const password = ref('')
const rememberCredentials = ref(true)
const errorMessage = ref('')
const submitting = ref(false)

function resolvePostLoginPath() {
  return consumeStoredLoginRedirect() || '/overview'
}

onMounted(() => {
  password.value = window.localStorage.getItem(REMEMBERED_PASSWORD_STORAGE_KEY) ?? ''
  const pendingNotice = consumeStoredLoginNotice()
  if (pendingNotice) {
    errorMessage.value = pendingNotice
  }

  if (getStoredLoginFlag() && getStoredToken()) {
    router.replace(resolvePostLoginPath())
  }
})

async function handleSubmit() {
  if (!password.value.trim()) {
    errorMessage.value = '请输入密码。'
    return
  }

  submitting.value = true
  try {
    const response = await api.login({
      password: password.value,
    })
    if (!response.authenticated || !response.token) {
      throw new Error('登录失败，请检查密码。')
    }
    setStoredToken(response.token)
    setStoredLoginFlag(response.authenticated)
    if (rememberCredentials.value) {
      window.localStorage.setItem(REMEMBERED_PASSWORD_STORAGE_KEY, password.value)
    } else {
      window.localStorage.removeItem(REMEMBERED_PASSWORD_STORAGE_KEY)
    }
    errorMessage.value = ''
    clearStoredLoginNotice()
    router.replace(resolvePostLoginPath())
  } catch (error) {
    clearStoredToken()
    clearStoredLoginFlag()
    errorMessage.value = (error as Error).message
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login-page {
  width: 100%;
  max-width: 400px;
  margin: var(--sp-6);
}

.login-card {
  padding: 40px 36px;
  text-align: center;
}

.login-avatar-shell {
  display: flex;
  justify-content: center;
  margin-bottom: var(--sp-5);
}

.login-avatar {
  width: 64px;
  height: 64px;
  border-radius: 16px;
}

.login-copy h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
}

.login-copy p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  margin-top: var(--sp-6);
  text-align: left;
}

.login-remember-row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  color: var(--text-secondary);
  font-size: 13.5px;
  cursor: pointer;
  min-height: 44px;
}

.login-remember-row input {
  accent-color: var(--accent);
}

.login-error {
  text-align: left;
  font-size: 13px;
}

.login-submit {
  justify-content: center;
}
</style>
