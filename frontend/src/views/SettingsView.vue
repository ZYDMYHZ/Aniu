<template>
  <div class="settings-page">
    <!-- 基础配置 -->
    <section class="aniu-card">
      <div class="aniu-sect-head">
        <div>
          <h2 class="aniu-section-title">功能设置</h2>
          <p class="aniu-section-kicker">Configuration</p>
        </div>
      </div>

      <div class="set-two-col">
        <div class="set-left">
          <label class="aniu-field">
            <span class="aniu-field-label"><Globe :size="14" /> Base URL</span>
            <input v-model="settings.llm_base_url" class="aniu-input" placeholder="https://api.openai.com/v1" />
            <p class="aniu-field-help">大模型 API 的基础地址，默认可填写 OpenAI 兼容地址。</p>
          </label>

          <label class="aniu-field">
            <span class="aniu-field-label"><KeyRound :size="14" /> API Key</span>
            <input v-model="settings.llm_api_key" class="aniu-input" type="password" placeholder="sk-..." />
            <p class="aniu-field-help">用于访问大模型 API 的密钥。</p>
          </label>

          <div class="set-inline">
            <label class="aniu-field">
              <span class="aniu-field-label"><Cpu :size="14" /> 模型名</span>
              <input v-model="settings.llm_model" class="aniu-input" />
              <p class="aniu-field-help">要使用的大模型名称，例如 `gpt-4o-mini`。</p>
            </label>
            <label class="aniu-field">
              <span class="aniu-field-label">最大上下文</span>
              <input v-model.number="settings.automation_context_window_tokens" class="aniu-input" type="number" min="4096" step="1024" />
              <p class="aniu-field-help">默认 128K。后端按 85% 触发压缩。</p>
            </label>
          </div>

          <label class="aniu-field">
            <span class="aniu-field-label"><Sparkles :size="14" /> 妙想密钥</span>
            <input v-model="settings.mx_api_key" class="aniu-input" type="password" placeholder="妙想接口 apikey" />
            <p class="aniu-field-help">用于访问东方财富妙想接口的密钥。</p>
          </label>

          <label class="aniu-field">
            <span class="aniu-field-label"><Coins :size="14" /> 资金上限（元）</span>
            <input v-model.number="settings.capital_limit" class="aniu-input" type="number" min="0" step="1000" placeholder="留空则不设上限" />
            <p class="aniu-field-help">模拟交易的总资金/总投入上限。配置后注入 AI 提示词，让其按此资金规模管理仓位，用于测试特定资金盈利。留空不注入。</p>
          </label>
        </div>

        <div class="set-right">
          <label class="aniu-field">
            <span class="aniu-field-label"><MessageSquareText :size="14" /> 系统提示词</span>
            <textarea v-model="settings.system_prompt" class="aniu-input" rows="14" />
            <p class="aniu-field-help">指导大模型行为的系统提示词，会影响 AI 的分析和决策方式。</p>
          </label>
        </div>
      </div>

      <div v-if="errorMessage" class="error-banner aniu-text-danger">{{ errorMessage }}</div>

      <div class="set-actions">
        <button class="aniu-btn aniu-btn-primary" :class="{ 'is-loading': busy }" :disabled="busy" @click="saveSettings">
          <span v-if="busy" class="aniu-spinner"></span>
          <Save :size="16" />
          保存设置
        </button>
      </div>
    </section>

    <!-- 技能管理 -->
    <section class="aniu-card">
      <div class="aniu-sect-head">
        <div>
          <h2 class="aniu-section-title">技能管理</h2>
          <p class="aniu-section-kicker">Skills</p>
        </div>
        <button class="aniu-btn aniu-btn-sm" :class="{ 'is-loading': skillsBusy }" :disabled="skillsBusy" @click="reloadSkills">
          <RefreshCw :size="15" :class="{ spin: skillsBusy }" />
          重新扫描
        </button>
      </div>

      <div class="set-skills-toolbar">
        <div class="set-skill-stat">
          <span class="aniu-field-label">已安装技能</span>
          <strong class="set-skill-stat-total">{{ installedOverview.total }}</strong>
          <div class="set-skill-stat-break">
            <span>运行时 {{ installedOverview.runtime }}</span>
            <span>标准 {{ installedOverview.standard }}</span>
          </div>
        </div>
        <div class="set-skill-stat">
          <span class="aniu-field-label">已启用技能</span>
          <strong class="set-skill-stat-total">{{ enabledOverview.total }}</strong>
          <div class="set-skill-stat-break">
            <span>运行时 {{ enabledOverview.runtime }}</span>
            <span>标准 {{ enabledOverview.standard }}</span>
          </div>
        </div>
        <div class="set-skill-import">
          <span class="aniu-field-label">输入 SkillHub 链接或添加本地 zip 技能包</span>
          <div class="set-import-inline">
            <div class="set-import-control" :class="{ 'is-disabled': skillsBusy }">
              <input
                v-model="importInput"
                class="aniu-input"
                placeholder="https://skillhub.cn链接或者技能名称"
                :disabled="skillsBusy"
                @input="handleImportInput"
              />
              <button type="button" class="aniu-btn aniu-btn-sm" :disabled="skillsBusy" @click="openImportFileDialog">
                {{ selectedArchive ? '更换文件' : '添加文件' }}
              </button>
            </div>
            <input
              ref="skillArchiveInputRef"
              class="set-file-native"
              type="file"
              accept=".zip,application/zip"
              :disabled="skillsBusy"
              @change="handleImportFileChange"
            />
            <button class="aniu-btn aniu-btn-primary aniu-btn-sm" :class="{ 'is-loading': skillsBusy }" :disabled="skillsBusy" @click="importSkill">
              导入技能
            </button>
          </div>
          <p v-if="selectedArchive" class="set-import-selected">已选择文件：{{ selectedArchive.name }}</p>
        </div>
      </div>

      <div v-if="skillsErrorMessage" class="error-banner aniu-text-danger">{{ skillsErrorMessage }}</div>

      <div v-if="skills.length" class="set-skill-list">
        <article v-for="skill in skills" :key="skill.id" class="aniu-card set-skill-card">
          <div class="set-skill-copy">
            <div class="set-skill-title-row">
              <strong>{{ skill.name }}</strong>
              <span class="set-skill-badge" :class="skill.role === 'runtime' ? 'is-system' : 'is-user'">
                {{ skill.role === 'runtime' ? '运行时技能' : skill.source === 'builtin' ? '内置技能' : '用户技能' }}
              </span>
            </div>
            <p class="set-skill-desc">{{ skill.description || '暂无技能描述。' }}</p>
          </div>

          <div class="set-skill-actions">
            <button v-if="skill.can_delete" type="button" class="aniu-btn aniu-btn-sm" :disabled="skillsBusy" @click="deleteSkill(skill)">
              <Trash2 :size="14" /> 删除
            </button>
            <button v-else type="button" class="aniu-btn aniu-btn-sm" disabled>不可删除</button>
            <label class="aniu-switch" :class="{ 'is-disabled': skillsBusy || !canToggleSkill(skill) }">
              <input
                type="checkbox"
                :checked="skill.enabled"
                :disabled="skillsBusy || !canToggleSkill(skill)"
                @change="toggleSkill(skill)"
              />
              <span class="aniu-switch-track"></span>
              <span class="set-skill-toggle-label">{{ skill.enabled ? '启用' : '停用' }}</span>
            </label>
          </div>
        </article>
      </div>
      <div v-else class="aniu-empty">当前还没有可展示的技能。</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Globe, KeyRound, Cpu, Sparkles, Coins, MessageSquareText, Save, RefreshCw, Trash2 } from 'lucide-vue-next'

import { useSkillManager } from '@/composables/useSkillManager'
import { useAppStore } from '@/stores/legacy'
import type { SkillListItem } from '@/types'

const store = useAppStore()
const { settings, busy, errorMessage } = storeToRefs(store)
const { saveSettings } = store
const {
  skills,
  importInput,
  selectedArchive,
  busy: skillsBusy,
  errorMessage: skillsErrorMessage,
  installedOverview,
  enabledOverview,
  loadSkills,
  setImportFile,
  importSkill: submitSkillImport,
  reloadSkills: reloadSkillList,
  toggleSkill: toggleManagedSkill,
  deleteSkill: deleteManagedSkill,
} = useSkillManager()
const skillArchiveInputRef = ref<HTMLInputElement | null>(null)

function openImportFileDialog() {
  if (skillArchiveInputRef.value) {
    skillArchiveInputRef.value.value = ''
    skillArchiveInputRef.value.click()
  }
}

function resetNativeSkillInput() {
  if (skillArchiveInputRef.value) {
    skillArchiveInputRef.value.value = ''
  }
}

function handleImportInput() {
  if (!importInput.value.trim()) {
    return
  }
  setImportFile(null)
  resetNativeSkillInput()
}

function handleImportFileChange(event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0] ?? null
  setImportFile(file)
}

async function importSkill() {
  const imported = await submitSkillImport()
  if (imported) {
    resetNativeSkillInput()
  }
}

async function reloadSkills() {
  await reloadSkillList()
}

async function toggleSkill(skill: SkillListItem) {
  if (!canToggleSkill(skill)) {
    return
  }
  await toggleManagedSkill(skill)
}

async function deleteSkill(skill: SkillListItem) {
  if (!skill.can_delete) {
    return
  }
  await deleteManagedSkill(skill)
}

function canToggleSkill(skill: SkillListItem) {
  return skill.can_disable
}

onMounted(async () => {
  try {
    await Promise.all([
      store.loadSettings(),
      loadSkills(),
    ])
  } catch (error) {
    errorMessage.value = (error as Error).message
  }
})
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.set-two-col {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--sp-6);
}

.set-left {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.set-right {
  display: flex;
  flex-direction: column;
}

.set-right .aniu-field {
  flex: 1;
}

.set-inline {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
}

.set-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--sp-5);
}

.set-skills-toolbar {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: var(--sp-5);
  align-items: start;
  padding: var(--sp-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
}

.set-skill-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 130px;
}

.set-skill-stat-total {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.set-skill-stat-break {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: var(--text-muted);
}

.set-skill-import {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  min-width: 0;
}

.set-import-inline {
  display: flex;
  gap: var(--sp-2);
  align-items: stretch;
}

.set-import-control {
  display: flex;
  gap: var(--sp-2);
  flex: 1;
  min-width: 0;
}

.set-import-control.is-disabled {
  opacity: 0.5;
}

.set-file-native {
  display: none;
}

.set-import-selected {
  margin: 0;
  font-size: 12.5px;
  color: var(--accent);
}

.set-skill-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-top: var(--sp-4);
}

.set-skill-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
}

.set-skill-copy {
  flex: 1 1 auto;
  min-width: 0;
}

.set-skill-title-row {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.set-skill-title-row strong {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.set-skill-badge {
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
}

.set-skill-badge.is-system {
  color: var(--accent);
  background: var(--accent-soft);
}

.set-skill-badge.is-user {
  color: var(--text-secondary);
  background: var(--surface-hover);
}

.set-skill-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.set-skill-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex: 0 0 auto;
}

.set-skill-toggle-label {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 32px;
}

.aniu-switch.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-banner {
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-sm);
  background: var(--up-soft);
  font-size: 13px;
  margin-top: var(--sp-4);
}

.spin {
  animation: set-spin 0.8s linear infinite;
}

@keyframes set-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .set-two-col { grid-template-columns: 1fr; }
  .set-skills-toolbar { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .set-inline { grid-template-columns: 1fr; }
  .set-skill-card { flex-direction: column; align-items: stretch; }
}
</style>
