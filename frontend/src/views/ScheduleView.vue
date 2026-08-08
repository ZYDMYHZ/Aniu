<template>
  <div class="schedule-page">
    <!-- 当前定时任务 -->
    <section class="aniu-card">
      <div class="aniu-sect-head">
        <div>
          <h2 class="aniu-section-title">当前定时任务</h2>
          <p class="aniu-section-kicker">Live Schedules</p>
        </div>
      </div>

      <div v-if="activeScheduleCards.length" class="sch-overview-list">
        <div v-for="task in activeScheduleCards" :key="task.id" class="sch-overview-card">
          <span class="sch-tag" :class="task.category === '交易任务' ? 'is-trade' : 'is-analysis'">
            <Clock3 :size="13" />{{ task.category }}
          </span>
          <strong class="sch-overview-name">{{ task.name }}</strong>
          <p class="sch-overview-time">交易日 {{ task.displayTime }}</p>
        </div>
      </div>
      <div v-else class="aniu-empty">当前没有已启用的定时任务。</div>

      <div v-if="nextScheduledTask" class="sch-next-run">
        <Timer :size="15" />
        <span class="sch-next-prefix">下次运行</span>
        <span class="sch-tag" :class="nextScheduledTask.category === '交易任务' ? 'is-trade' : 'is-analysis'">
          {{ nextScheduledTask.category }}
        </span>
        <strong>{{ nextScheduledTask.name }}</strong>
        <span class="sch-next-time aniu-num">{{ formatWeekdayMinuteTime(nextScheduledTask.nextRunAt) }}</span>
      </div>
    </section>

    <!-- 定时任务设置 -->
    <section class="aniu-card">
      <div class="aniu-sect-head">
        <div>
          <h2 class="aniu-section-title">定时任务设置</h2>
          <p class="aniu-section-kicker">Schedules</p>
        </div>
      </div>

      <div v-if="errorMessage" class="error-banner aniu-text-danger">{{ errorMessage }}</div>

      <div class="sch-settings">
        <!-- 分析任务 -->
        <section class="sch-section">
          <header class="sch-section-head">
            <h3 class="sch-section-title">分析任务</h3>
            <p class="sch-section-sub">配置自动执行的 AI 分析任务</p>
          </header>

          <div class="sch-task-grid">
            <article class="sch-task-card aniu-card" :class="{ 'is-active': scheduleSettings.preMarket.enabled }">
              <div class="sch-task-head">
                <div>
                  <h4 class="sch-task-name"><Sunrise :size="16" /> 盘前分析</h4>
                  <p class="sch-task-desc">开盘前的市场预测与策略建议</p>
                </div>
                <label class="aniu-switch">
                  <input type="checkbox" v-model="scheduleSettings.preMarket.enabled" />
                  <span class="aniu-switch-track"></span>
                </label>
              </div>
              <div class="sch-task-body" :class="{ 'is-disabled': !scheduleSettings.preMarket.enabled }">
                <div class="aniu-field">
                  <span class="aniu-field-label">执行时间</span>
                  <div class="sch-chip-group" :class="{ 'is-disabled': !scheduleSettings.preMarket.enabled }">
                    <button
                      v-for="option in fixedTaskTimeOptions.preMarket.options"
                      :key="`pre-${option.label}`"
                      type="button"
                      class="sch-chip"
                      :class="{ 'is-active': scheduleSettings.preMarket.hour === option.hour && scheduleSettings.preMarket.minute === option.minute }"
                      :disabled="!scheduleSettings.preMarket.enabled"
                      @click="setFixedTaskTime('preMarket', option)"
                    >{{ option.label }}</button>
                  </div>
                </div>
                <div class="aniu-field">
                  <span class="aniu-field-label">提示词 <small>{{ scheduleSettings.preMarket.prompt.length }}字</small></span>
                  <textarea
                    v-model="scheduleSettings.preMarket.prompt"
                    class="aniu-input"
                    rows="3"
                    @input="autoResizeTextarea($event)"
                    :disabled="!scheduleSettings.preMarket.enabled"
                  ></textarea>
                </div>
              </div>
            </article>

            <article class="sch-task-card aniu-card" :class="{ 'is-active': scheduleSettings.midday.enabled }">
              <div class="sch-task-head">
                <div>
                  <h4 class="sch-task-name"><Sun :size="16" /> 午间复盘</h4>
                  <p class="sch-task-desc">中午时段的市场动态追踪</p>
                </div>
                <label class="aniu-switch">
                  <input type="checkbox" v-model="scheduleSettings.midday.enabled" />
                  <span class="aniu-switch-track"></span>
                </label>
              </div>
              <div class="sch-task-body" :class="{ 'is-disabled': !scheduleSettings.midday.enabled }">
                <div class="aniu-field">
                  <span class="aniu-field-label">执行时间</span>
                  <div class="sch-chip-group" :class="{ 'is-disabled': !scheduleSettings.midday.enabled }">
                    <button
                      v-for="option in fixedTaskTimeOptions.midday.options"
                      :key="`mid-${option.label}`"
                      type="button"
                      class="sch-chip"
                      :class="{ 'is-active': scheduleSettings.midday.hour === option.hour && scheduleSettings.midday.minute === option.minute }"
                      :disabled="!scheduleSettings.midday.enabled"
                      @click="setFixedTaskTime('midday', option)"
                    >{{ option.label }}</button>
                  </div>
                </div>
                <div class="aniu-field">
                  <span class="aniu-field-label">提示词 <small>{{ scheduleSettings.midday.prompt.length }}字</small></span>
                  <textarea
                    v-model="scheduleSettings.midday.prompt"
                    class="aniu-input"
                    rows="3"
                    @input="autoResizeTextarea($event)"
                    :disabled="!scheduleSettings.midday.enabled"
                  ></textarea>
                </div>
              </div>
            </article>

            <article class="sch-task-card aniu-card" :class="{ 'is-active': scheduleSettings.postMarket.enabled }">
              <div class="sch-task-head">
                <div>
                  <h4 class="sch-task-name"><Sunset :size="16" /> 收盘分析</h4>
                  <p class="sch-task-desc">收盘后的全面总结与回顾</p>
                </div>
                <label class="aniu-switch">
                  <input type="checkbox" v-model="scheduleSettings.postMarket.enabled" />
                  <span class="aniu-switch-track"></span>
                </label>
              </div>
              <div class="sch-task-body" :class="{ 'is-disabled': !scheduleSettings.postMarket.enabled }">
                <div class="aniu-field">
                  <span class="aniu-field-label">执行时间</span>
                  <div class="sch-chip-group" :class="{ 'is-disabled': !scheduleSettings.postMarket.enabled }">
                    <button
                      v-for="option in fixedTaskTimeOptions.postMarket.options"
                      :key="`post-${option.label}`"
                      type="button"
                      class="sch-chip"
                      :class="{ 'is-active': scheduleSettings.postMarket.hour === option.hour && scheduleSettings.postMarket.minute === option.minute }"
                      :disabled="!scheduleSettings.postMarket.enabled"
                      @click="setFixedTaskTime('postMarket', option)"
                    >{{ option.label }}</button>
                  </div>
                </div>
                <div class="aniu-field">
                  <span class="aniu-field-label">提示词 <small>{{ scheduleSettings.postMarket.prompt.length }}字</small></span>
                  <textarea
                    v-model="scheduleSettings.postMarket.prompt"
                    class="aniu-input"
                    rows="3"
                    @input="autoResizeTextarea($event)"
                    :disabled="!scheduleSettings.postMarket.enabled"
                  ></textarea>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- 交易任务 -->
        <section class="sch-section">
          <header class="sch-section-head">
            <h3 class="sch-section-title">交易任务</h3>
            <p class="sch-section-sub">配置交易时段内的定时任务频率</p>
          </header>

          <div class="sch-run-list">
            <article class="sch-run-item aniu-card">
              <div class="sch-run-top">
                <div>
                  <h4 class="sch-task-name">上午运行</h4>
                  <p class="sch-task-desc">09:30 - 11:30</p>
                </div>
                <div class="sch-chip-group sch-count-group">
                  <button
                    v-for="count in runCountOptions"
                    :key="`morning-${count}`"
                    type="button"
                    class="sch-chip"
                    :class="{ 'is-active': scheduleSettings.morning.runCount === count }"
                    @click="scheduleSettings.morning.runCount = count"
                  >{{ count }}次</button>
                </div>
              </div>
              <div class="sch-run-sched">
                <span class="aniu-field-label">计划运行时间</span>
                <div class="sch-badges">
                  <span v-for="(time, i) in getMorningRunTimes().split(', ')" :key="'m'+i" class="sch-badge aniu-num">{{ time }}</span>
                </div>
              </div>
              <div class="aniu-field">
                <span class="aniu-field-label">提示词 <small>{{ scheduleSettings.morning.prompt.length }}字</small></span>
                <textarea v-model="scheduleSettings.morning.prompt" class="aniu-input" rows="2" @input="autoResizeTextarea($event)"></textarea>
              </div>
            </article>

            <article class="sch-run-item aniu-card">
              <div class="sch-run-top">
                <div>
                  <h4 class="sch-task-name">下午运行</h4>
                  <p class="sch-task-desc">13:00 - 15:00</p>
                </div>
                <div class="sch-chip-group sch-count-group">
                  <button
                    v-for="count in runCountOptions"
                    :key="`afternoon-${count}`"
                    type="button"
                    class="sch-chip"
                    :class="{ 'is-active': scheduleSettings.afternoon.runCount === count }"
                    @click="scheduleSettings.afternoon.runCount = count"
                  >{{ count }}次</button>
                </div>
              </div>
              <div class="sch-run-sched">
                <span class="aniu-field-label">计划运行时间</span>
                <div class="sch-badges">
                  <span v-for="(time, i) in getAfternoonRunTimes().split(', ')" :key="'a'+i" class="sch-badge aniu-num">{{ time }}</span>
                </div>
              </div>
              <div class="aniu-field">
                <span class="aniu-field-label">提示词 <small>{{ scheduleSettings.afternoon.prompt.length }}字</small></span>
                <textarea v-model="scheduleSettings.afternoon.prompt" class="aniu-input" rows="2" @input="autoResizeTextarea($event)"></textarea>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div class="sch-actions">
        <button class="aniu-btn aniu-btn-primary" :class="{ 'is-loading': busy }" :disabled="busy" @click="saveScheduleSettings">
          <span v-if="busy" class="aniu-spinner"></span>
          <Save :size="16" />
          保存设置
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Clock3, Timer, Sunrise, Sun, Sunset, Save } from 'lucide-vue-next'

import { useAppStore } from '@/stores/legacy'
import { useScheduleForm } from '@/composables/useScheduleForm'
import { formatWeekdayMinuteTime } from '@/utils/formatters'

const store = useAppStore()
const { busy, schedules, errorMessage, activeScheduleCards, nextScheduledTask } = storeToRefs(store)
const {
  scheduleSettings,
  fixedTaskTimeOptions,
  runCountOptions,
  syncFromSchedules,
  buildPayload,
  setFixedTaskTime,
  autoResizeTextarea,
  getMorningRunTimes,
  getAfternoonRunTimes,
} = useScheduleForm()

async function saveScheduleSettings() {
  await store.saveSchedule(buildPayload(schedules.value))
}

watch(
  schedules,
  (value) => {
    syncFromSchedules(value)
  },
  { immediate: true },
)

onMounted(async () => {
  if (schedules.value.length === 0) {
    await store.loadSchedule()
  }
})
</script>

<style scoped>
.schedule-page {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.sch-overview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--sp-3);
}

.sch-overview-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  padding: var(--sp-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
}

.sch-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
}

.sch-tag.is-analysis {
  color: var(--accent);
  background: var(--accent-soft);
}

.sch-tag.is-trade {
  color: var(--accent);
  background: var(--accent-soft);
}

.sch-overview-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.sch-overview-time {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
}

.sch-next-run {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-top: var(--sp-4);
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--accent-soft);
  color: var(--text);
  font-size: 14px;
  flex-wrap: wrap;
}

.sch-next-run svg {
  color: var(--accent);
}

.sch-next-prefix {
  color: var(--text-secondary);
}

.sch-next-time {
  color: var(--accent);
  font-weight: 600;
  margin-left: auto;
}

.sch-settings {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.sch-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.sch-section-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sch-section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.sch-section-sub {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
}

.sch-task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--sp-4);
}

.sch-task-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  border-color: var(--border);
}

.sch-task-card.is-active {
  border-color: var(--accent-border);
}

.sch-task-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-3);
}

.sch-task-name {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.sch-task-name svg {
  color: var(--accent);
}

.sch-task-desc {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: var(--text-muted);
}

.sch-task-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.sch-task-body.is-disabled {
  opacity: 0.5;
}

.sch-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.sch-chip-group.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.sch-chip {
  min-height: 34px;
  padding: 0 var(--sp-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--dur) var(--ease);
}

.sch-chip:hover {
  border-color: var(--border-strong);
  color: var(--text);
}

.sch-chip.is-active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}

.sch-chip:disabled {
  cursor: not-allowed;
}

.sch-run-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.sch-run-item {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.sch-run-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  flex-wrap: wrap;
}

.sch-count-group {
  gap: 4px;
}

.sch-count-group .sch-chip {
  padding: 0 10px;
  min-height: 30px;
}

.sch-run-sched {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.sch-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sch-badge {
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 12.5px;
}

.sch-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--sp-2);
}

@media (max-width: 640px) {
  .sch-task-grid { grid-template-columns: 1fr; }
}
</style>
