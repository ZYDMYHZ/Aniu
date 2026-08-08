# Aniu 逐页生图 Prompt · 优化版（GPT image2 · 一次一张）

> image2 生图引擎提示词优化要点（已内化到下面每段）：
> 1. 文字越短越好，关键文字用「直引号 + 中文」明确指定，避免模型画出乱码或英文。
> 2. 每张图只放清晰分区；次要区简化，避免系统级丢细节。
> 3. 色彩只锁定 5 个十六进制主色，其余交给模型按风格渲染，避免色彩失控。
> 4. 用「从左上到右下 + 大致占比」描述布局，不用架构术语。
> 5. 明确「这是扁平 UI 线框图级界面图，非照片、非3D、无贴图素材」。

---

## 第 0 段 · 全局风格锚点（每张都带上，可原样复制）

> A professional dark trading-terminal web app UI, flat vector style, not a photo, not 3D.
> Background: very dark indigo #0B1020 with subtle ambient glow. Panels are frosted-glass: semi-transparent dark blue-gray, hairline #94A3B8 border, soft shadow, rounded 16px corners.
> Color palette ONLY these: brand cyan #38BDF8, up-red #F8524D, down-green #22C55E, text #E6EDF7, muted text #A8B8D0.
> All icons are thin-line Lucide-style outline icons. NO emoji, NO emojis anywhere.
> Layout: a slim left sidebar with only vertical icon buttons, a top global bar, and a scrollable workspace on the right.
> Data-dense but clean: small two-line metric cards in a row, compact tables with right-aligned monospaced numbers.
> China stock convention: red UP, green DOWN. Chinese language labels.
> Premium design at Awwwards/FWA/CSS Design Awards level, restrained, crisp, high-end.

---

## 第 1 张 · 登录页 /login

> (第 0 段)
> A centered login card on the dark background. Inside the card, small line chart icon at top, large title text "Aniu", subtitle "AI 模拟交易系统". Then a password input field with a small lock icon, a small "记住密码" switch row, and a solid cyan button with label "登录". Below the card, one faint line of text "v0.4.0". Rest of the screen is calm empty dark background with a very subtle faint chart-grid pattern. Minimal, premium, nothing else. Keep total on-screen text to exactly: Aniu, AI 模拟交易系统, 记住密码, 登录, v0.4.0.

---

## 第 2 张 · 账户总览 /overview

> (第 0 段)
> Top bar title "账户总览", small refresh icon button top-right. Below: exactly 5 equal frosted-glass metric cards in one row, each card is two lines (big number on top, small label under it):
> 1 big "241,500" cyan, small "总资产"; 2 big "183,200", small "持仓市值"; 3 big "+41,500" red, small "总收益"; 4 big "+2,180" red, small "今日盈亏"; 5 big "76%", small "仓位".
> Under the cards, one compact stock position table: columns 名称/代码 · 市值 · 股数 · 当日盈亏 · 总盈亏 · 现价/成本 · 仓位占比, 6-8 realistic rows of fake data in Chinese stock names, red/green on profit cells. Keep it one clean table, do not add other tables. Chinese labels. Monospaced numbers.

---

## 第 3 张 · AI 分析 /tasks（含直播运行）

> (第 0 段)
> Top bar title "运行记录", two buttons top-right: "执行分析" and "执行交易". Below: a grid of small square run-cards (today group). Each card shows a small status dot, small label "分析"/"交易", a time, a duration. Make exactly one of them an active LIVE card: glowing cyan pulsing dot and elapsed timer.
> Below that: three side-by-side compact panels: ①"运行状态" with start/end times and token in/out counts; ②"接口调用" list of tool names with tiny status dots; ③"交易执行" list with small red BUY / green SELL chips. Keep these three panels narrow and collapsible-looking.
> Bottom: one large output panel with a short paragraph of markdown-style analysis text in Chinese. Chinese labels. Keep on-screen text short.

---

## 第 4 张 · AI 聊天 /chat

> (第 0 段)
> Two-column chat layout. Left narrow column: a "+" new-chat icon button, a small search box, and a stacked list of chat session titles (持久会话 / 今日 / 近7天 group headers), each with a short title and a small time. 
> Right main column: the message thread — one user bubble right-aligned dark, two AI bubbles left-aligned frosted-glass, one AI bubble containing a small tool-execution chip with a tool name and a status dot. Below: an input bar with a small paperclip icon on the left and a round cyan arrow-up send button on the right. Chinese labels, keep message text short.

---

## 第 5 张 · 定时任务 /schedule

> (第 0 段)
> Top bar title "当前定时任务". A row of small schedule cards, each with a category tag (orange "交易" or cyan "分析"), a task name, and a trading-day time. Below that one "下次运行" summary line with a timer icon.
> Below: two sections "分析任务" and "交易任务". 分析任务: three cards labeled 盘前分析 / 午间复盘 / 收盘分析. 交易任务: two cards labeled 上午运行 / 下午运行. Each card has a title, one short line of description, and a small switch toggle, some on and some off. Compact card grid. Chinese labels.

---

## 第 6 张 · 功能设置 /settings

> (第 0 段)
> Two-column settings layout. Left column: vertical stack of labeled input fields, each with a small icon: ① "Base URL" address box; ② "API Key" password box; ③ two side-by-side "模型名" and "最大上下文"; ④ "妙想密钥" password box; ⑤ "资金上限（元）" number box with one faint help line "模拟交易总资金上限，留空则不设限". At the bottom a solid cyan "保存设置" button.
> Right column: one large multi-line textarea labeled "系统提示词" containing a short Chinese trading instruction.
> Below the two columns, a separate "技能管理" section: small stats badges, an import input row, and compact skill cards each with a name, a source chip, one-line description, a switch and a trash icon.
> Chinese labels, compact but with clear breathing space between fields.
