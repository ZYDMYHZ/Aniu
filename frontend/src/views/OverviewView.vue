<template>
  <div class="overview">
    <div class="aniu-sect-head">
      <div>
        <h2 class="aniu-section-title">账户总览</h2>
        <p class="aniu-section-kicker">Overview</p>
      </div>
      <button
        class="aniu-btn aniu-btn-sm"
        :class="{ 'is-loading': accountRefreshing }"
        :disabled="accountRefreshing || !canManualRefreshAccount"
        :title="canManualRefreshAccount ? '手动刷新账户信息' : `${accountRefreshCooldownText}后可刷新`"
        @click="handleManualRefresh"
      >
        <RefreshCw :size="15" :class="{ spin: accountRefreshing }" />
        <span>{{ canManualRefreshAccount ? '刷新' : '冷却中' }}</span>
      </button>
    </div>

    <!-- KPI 卡片 -->
    <div class="ov-kpis">
      <div class="aniu-card ov-kpi" v-for="kpi in kpis" :key="kpi.label">
        <component :is="kpi.icon" :size="17" class="ov-kpi-icon" :class="kpi.iconTone" />
        <div class="ov-kpi-copy">
          <span class="ov-kpi-label">{{ kpi.label }}</span>
          <span class="ov-kpi-value aniu-num" :class="kpi.valueClass">{{ kpi.value }}</span>
        </div>
        <span class="ov-kpi-sub" :class="kpi.subClass">{{ kpi.sub }}</span>
      </div>
    </div>

    <div v-if="errorMessage" class="error-banner aniu-text-danger">{{ errorMessage }}</div>

    <!-- 持仓看板 -->
    <section class="ov-block">
      <div class="aniu-sect-head">
        <div>
          <h3 class="ov-block-title">持仓看板</h3>
          <p class="aniu-section-kicker">Positions</p>
        </div>
      </div>

      <div v-if="displayPositions.length" class="ov-portfolio-grid">
        <div
          v-for="pos in displayPositions"
          :key="pos.symbol"
          class="aniu-card aniu-card-interactive ov-pos-card"
          @click="selectedPosition = selectedPosition === pos.symbol ? null : pos.symbol"
        >
          <div class="ov-pos-top">
            <div class="ov-pos-id">
              <strong class="ov-pos-name">{{ pos.name }}</strong>
              <span class="ov-pos-symbol">{{ pos.symbol }}</span>
            </div>
            <span class="ov-pos-ratio aniu-num" :class="pnlClass(pos.profit_ratio)">
              {{ formatPercent(pos.profit_ratio) }}
            </span>
          </div>

          <span class="ov-pos-value aniu-num">{{ formatMoney(pos.amount) }}</span>

          <svg class="ov-spark" :class="{ up: (pos.profit_ratio ?? 0) >= 0 }" viewBox="0 0 100 32" preserveAspectRatio="none">
            <path :d="sparkPath(pos)" fill="none" stroke-width="2" vector-effect="non-scaling-stroke" />
          </svg>

          <div class="ov-pos-meta">
            <span>现价 <b class="aniu-num">{{ formatMoney(pos.current_price) }}</b></span>
            <span>成本 <b class="aniu-num">{{ formatMoney(pos.cost_price) }}</b></span>
            <span>盈亏 <b class="aniu-num" :class="pnlClass(pos.profit)">{{ formatSignedMoney(pos.profit) }}</b></span>
          </div>

          <div v-if="selectedPosition === pos.symbol" class="ov-pos-detail">
            <div class="ov-pos-detail-row"><span>持仓股数</span><b class="aniu-num">{{ formatVolume(pos.volume) }}</b></div>
            <div class="ov-pos-detail-row"><span>可卖股数</span><b class="aniu-num">{{ formatVolume(pos.available_volume) }}</b></div>
            <div class="ov-pos-detail-row"><span>当日盈亏</span><b class="aniu-num" :class="pnlClass(pos.day_profit)">{{ formatSignedMoney(pos.day_profit) }}</b></div>
            <div class="ov-pos-detail-row"><span>当日收益率</span><b class="aniu-num" :class="pnlClass(pos.day_profit_ratio)">{{ formatPercent(pos.day_profit_ratio) }}</b></div>
            <div class="ov-pos-detail-row"><span>仓位占比</span><b class="aniu-num">{{ formatPercent(pos.position_ratio) }}</b></div>
          </div>
        </div>
      </div>
      <div v-else class="aniu-empty">
        {{ errorMessage || '账户接口暂未返回真实持仓数据。请检查后端账户接口或先执行一次任务刷新账户快照。' }}
      </div>
    </section>

    <!-- 交易信息 -->
    <section class="ov-block">
      <div class="aniu-sect-head">
        <div>
          <h3 class="ov-block-title">交易信息</h3>
          <p class="aniu-section-kicker">Trades</p>
        </div>
      </div>
      <div v-if="displayTradeSummaries.length" class="aniu-table-wrap">
        <table class="aniu-table">
          <thead>
            <tr>
              <th>名称 / 代码</th>
              <th class="num">成交股数</th>
              <th class="num">买入均价</th>
              <th class="num">卖出均价</th>
              <th class="num">买入时间</th>
              <th class="num">卖出时间</th>
              <th class="num">收益</th>
              <th class="num">收益率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in displayTradeSummaries" :key="`${t.symbol}-${t.closed_at || '--'}`">
              <td>
                <strong>{{ t.name }}</strong>
                <span class="ov-table-symbol">{{ t.symbol }}</span>
              </td>
              <td class="num aniu-num">{{ formatVolume(t.volume) }}</td>
              <td class="num aniu-num">{{ formatMoney(t.buy_price) }}</td>
              <td class="num aniu-num">{{ formatMoney(t.sell_price) }}</td>
              <td class="num">{{ formatMinuteTime(t.opened_at) }}</td>
              <td class="num">{{ formatMinuteTime(t.closed_at) }}</td>
              <td class="num aniu-num" :class="pnlClass(t.profit)">{{ formatSignedMoney(t.profit) }}</td>
              <td class="num aniu-num" :class="pnlClass(t.profit_ratio)">{{ formatPercent(t.profit_ratio) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="aniu-empty">当前还没有可展示的完整交易闭环。买入后全部卖出的股票会展示在这里。</div>
    </section>

    <!-- 委托信息 -->
    <section class="ov-block">
      <div class="aniu-sect-head">
        <div>
          <h3 class="ov-block-title">委托信息</h3>
          <p class="aniu-section-kicker">Orders</p>
        </div>
      </div>
      <div v-if="displayOrders.length" class="aniu-table-wrap">
        <table class="aniu-table">
          <thead>
            <tr>
              <th>名称 / 代码</th>
              <th>方向</th>
              <th class="num">委托价 / 数量</th>
              <th class="num">成交价 / 数量</th>
              <th class="num">委托时间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in displayOrders" :key="o.order_id">
              <td>
                <strong>{{ o.name }}</strong>
                <span class="ov-table-symbol">{{ o.symbol }}</span>
              </td>
              <td>
                <span class="ov-side-badge" :class="o.side === 'buy' ? 'is-buy' : 'is-sell'">
                  {{ o.side_text }}
                </span>
              </td>
              <td class="num aniu-num">{{ formatMoney(o.order_price) }} / {{ formatVolume(o.order_quantity) }}</td>
              <td class="num aniu-num">{{ formatMoney(o.filled_price) }} / {{ formatVolume(o.filled_quantity) }}</td>
              <td class="num">{{ o.order_time || '--' }}</td>
              <td>
                <span class="ov-status-badge" :class="o.status_text === '已成交' ? 'is-ok' : 'is-wait'">
                  {{ o.status_text || '--' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="aniu-empty">当前没有可展示的委托记录。完成一次买入、卖出或撤单后，委托信息会显示在这里。</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RefreshCw, Wallet, PieChart, TrendingUp, Zap, Activity } from 'lucide-vue-next'

import { useAppStore } from '@/stores/legacy'
import { formatMinuteTime, formatMoney, formatPercent, pnlClass } from '@/utils/formatters'

const store = useAppStore()
const { account, errorMessage, accountRefreshing, canManualRefreshAccount, accountRefreshCooldownText } = storeToRefs(store)

const selectedPosition = ref<string | null>(null)

const displayPositions = computed(() => account.value.positions.filter((p) => (p.volume ?? 0) > 0))
const displayOrders = computed(() => account.value.orders)
const displayTradeSummaries = computed(() => account.value.trade_summaries)

const tradeSuccessRate = computed(() => {
  const total = displayTradeSummaries.value.length
  if (total === 0) return null
  const profitable = displayTradeSummaries.value.filter((t) => t.profit > 0).length
  return profitable / total
})

const todayTradeCount = computed(() => {
  const now = new Date()
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return displayOrders.value.filter((o) => Boolean(o.order_time?.startsWith(prefix)) && (o.filled_quantity ?? 0) > 0).length
})

const assetDelta = computed(() => {
  const a = account.value.total_assets
  const i = account.value.initial_capital
  if (a === null || a === undefined || i === null || i === undefined || Number.isNaN(a) || Number.isNaN(i)) return null
  return a - i
})

const kpis = computed(() => {
  const a = account.value
  return [
    {
      label: '运作天数',
      value: a.operating_days != null ? `${a.operating_days} 天` : '--',
      sub: `交易成功率 ${tradeSuccessRate.value != null ? formatPercent(tradeSuccessRate.value) : '--'}`,
      icon: Activity, iconTone: '',
    },
    {
      label: '总资产',
      value: formatMoney(a.total_assets),
      sub: `初始资金 ${formatMoney(a.initial_capital)}`,
      icon: Wallet, iconTone: 'accent', valueClass: 'accent',
    },
    {
      label: '总持仓市值',
      value: formatMoney(a.total_market_value),
      sub: `现金 ${formatMoney(a.cash_balance)} · 仓位 ${formatPercent(a.total_position_ratio)}`,
      icon: PieChart, iconTone: '',
    },
    {
      label: '累计收益',
      value: formatSignedMoney(assetDelta.value),
      sub: `总收益率 ${formatPercent(a.total_return_ratio)}`,
      icon: TrendingUp, iconTone: '', valueClass: pnlClass(assetDelta.value) || undefined, subClass: pnlClass(a.total_return_ratio) || undefined,
    },
    {
      label: `今日盈亏 · ${a.daily_profit_trade_date || '--'}`,
      value: formatSignedMoney(a.daily_profit),
      sub: `收益率 ${formatPercent(a.daily_return_ratio)} · 今日 ${todayTradeCount} 次`,
      icon: Zap, iconTone: '', valueClass: pnlClass(a.daily_profit) || undefined, subClass: pnlClass(a.daily_return_ratio) || undefined,
    },
  ]
})

function formatSignedMoney(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return '--'
  const f = formatMoney(Math.abs(v))
  return v > 0 ? `+${f}` : v < 0 ? `-${f}` : f
}

function formatVolume(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return '--'
  return `${v.toLocaleString()}`
}

function sparkPath(pos: { profit_ratio?: number | null }) {
  const up = (pos.profit_ratio ?? 0) >= 0
  if (up) {
    return 'M0 24 C 20 24, 35 14, 50 13 C 65 12, 78 4, 100 3'
  }
  return 'M0 8 C 20 9, 35 18, 50 19 C 65 21, 78 26, 100 28'
}

let cooldownTimer: number | null = null

onMounted(async () => {
  const tasks: Promise<unknown>[] = []
  if (account.value.positions.length === 0) {
    tasks.push(store.refreshAccountData())
  }
  if (tasks.length > 0) {
    const results = await Promise.allSettled(tasks)
    const failed = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')
    if (failed) {
      errorMessage.value = failed.reason instanceof Error ? failed.reason.message : '总览数据加载失败'
    }
  }
  cooldownTimer = window.setInterval(() => store.touchAccountRefreshTick(), 60 * 1000)
})

onUnmounted(() => {
  if (cooldownTimer !== null) window.clearInterval(cooldownTimer)
})

async function handleManualRefresh() {
  if (!canManualRefreshAccount.value || accountRefreshing.value) return
  try {
    await store.refreshAccountDataWithCooldown()
  } catch {
    // handled by store
  }
}
</script>

<style scoped>
.overview {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.ov-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--sp-4);
}

.ov-kpi {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ov-kpi-icon {
  margin-bottom: var(--sp-2);
  color: var(--text-muted);
}

.ov-kpi-icon.accent {
  color: var(--accent);
}

.ov-kpi-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ov-kpi-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.1;
}

.ov-kpi-value.accent {
  color: var(--accent);
}

.ov-kpi-sub {
  font-size: 12px;
  color: var(--text-secondary);
}

.ov-block {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.ov-block-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.ov-portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--sp-4);
}

.ov-pos-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.ov-pos-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-2);
}

.ov-pos-id {
  display: flex;
  flex-direction: column;
}

.ov-pos-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.ov-pos-symbol {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.ov-pos-ratio {
  font-weight: 600;
  font-size: 14px;
}

.ov-pos-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.ov-spark {
  width: 100%;
  height: 32px;
}

.ov-spark path {
  stroke: var(--down);
}

.ov-spark.up path {
  stroke: var(--up);
}

.ov-pos-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  font-size: 12px;
  color: var(--text-muted);
}

.ov-pos-meta b {
  color: var(--text-secondary);
  font-weight: 600;
}

.ov-pos-detail {
  border-top: 1px solid var(--divider);
  padding-top: var(--sp-2);
  margin-top: var(--sp-2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ov-pos-detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--text-secondary);
}

.ov-pos-detail-row b {
  color: var(--text);
  font-weight: 600;
}

.ov-table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.aniu-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.aniu-table th {
  text-align: left;
  padding: var(--sp-3);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 1px solid var(--divider);
  white-space: nowrap;
}

.aniu-table th.num {
  text-align: right;
}

.aniu-table td {
  padding: var(--sp-3);
  border-bottom: 1px solid var(--divider);
  color: var(--text);
  vertical-align: middle;
}

.aniu-table tbody tr:last-child td {
  border-bottom: none;
}

.aniu-table td.num {
  text-align: right;
  white-space: nowrap;
}

.anu-table tbody tr:hover {
  background: var(--surface-hover);
}

.ov-table-symbol {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.ov-side-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
}

.ov-side-badge.is-buy {
  color: var(--up);
  background: var(--up-soft);
}

.ov-side-badge.is-sell {
  color: var(--down);
  background: var(--down-soft);
}

.ov-status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
}

.ov-status-badge.is-ok {
  color: var(--down);
  background: var(--down-soft);
}

.ov-status-badge.is-wait {
  color: var(--text-secondary);
  background: var(--surface-hover);
}

.error-banner {
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-sm);
  background: var(--up-soft);
  font-size: 13px;
}

.spin {
  animation: ov-spin 0.8s linear infinite;
}

@keyframes ov-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1100px) {
  .ov-kpis { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .ov-kpis { grid-template-columns: 1fr; }
  .ov-portfolio-grid { grid-template-columns: 1fr; }
  .aniu-content { padding: var(--sp-4); }
}
</style>
