# performance-sdk

前端性能监控 SDK 的教学实现，用 TypeScript 编写。采集 Web Vitals 与页面加载各阶段耗时，附带设备/网络上下文，按优先级上报到指定后端。

## 用法

```ts
import Yideng from "performance-sdk";

new Yideng({
  logUrl: "https://your-backend/log", // 必填，不传直接抛错
  captureError: true, // 开启错误捕获
  resourceTiming: true, // 采集资源加载耗时
  elementTiming: true, // 采集关键元素渲染耗时
  maxMeasureTime: 15000, // 采集窗口上限，默认 15s
  analyticsTracker: (opts) => {}, // 自定义消费数据，不传走内置实现
});
```

构造函数即入口，`new` 出来就开始采集，没有额外的 `start()`。

## 采集了什么

**Web Vitals** — 全部基于 `PerformanceObserver`：

| 指标     | 说明                                   | 阈值来源      |
| -------- | -------------------------------------- | ------------- |
| FP / FCP | 首次绘制 / 首次内容绘制                | 1000 / 2500ms |
| LCP      | 最大内容绘制                           | 2500 / 4000ms |
| FID      | 首次输入延迟                           | 100 / 300ms   |
| CLS      | 累计布局偏移                           | 0.1 / 0.25    |
| TBT      | 总阻塞时间（含 5s / 10s / final 分段） | 300 / 600ms   |

每个指标经 `helpers/vitalsScore.ts` 打分为 `good` / `needsImprovement` / `poor`，阈值取自 [web.dev/vitals](https://web.dev/vitals/)。

**NavigationTiming** — DNS 查询、TCP 连接、TTFB、白屏时间、DOM 解析、load 完成等各阶段耗时。

**运行环境上下文** — 这部分是这个 SDK 比较有意思的地方，它不只报数字，还报「这个数字是在什么环境下测出来的」：

- 网络：`navigator.connection` 的 downlink / effectiveType / rtt / saveData
- 设备：`deviceMemory`、`hardwareConcurrency`、低端设备判定（`isLowEnd.ts`）
- 存储：`navigator.storage.estimate()` 的离线缓存占用

**错误监控**（`captureError: true` 时启用）— `window.onerror` 捕获同步/异步错误，捕获阶段监听 `error` 事件拿资源加载失败（如图片 404），配合 sourcemap 还原源码位置。

## 值得看的几个点

**上报优先级**（`data/ReportData.ts`）— 按 `AskPriority` 分级：`URGENT` 走 `fetch(..., { keepalive: true })`，不支持则降级 XHR；`IDLE` 走空闲时段上报。页面要卸载了还想把数据送出去，这是标准解法。

**生命周期管理**（`performance/observe.ts`）— 监听 `visibilitychange`，页面隐藏时断开 observer 并结算指标。性能数据必须在页面隐藏前落地，等 `unload` 就晚了。

**observer 的注册与断开**（`performance/performanceObserver.ts`）— `po()` / `poDisconnect()` 配合 `perfObservers` 数组管理实例，FCP 触发后才注册 `longtask` observer 去算 TBT，指标之间有依赖顺序。

## 构建

```bash
yarn build          # microbundle，输出 ESM / CJS / UMD
yarn dev            # watch 模式
yarn example:run    # parcel 起 examples/index.html
yarn api:run        # api-extractor 生成 API 报告
yarn api:doc        # typedoc 生成文档到 docs/
```

`examples/` 下有四个：`performance`（性能采集）、`error`（错误捕获）、`sourcemap`（webpack + 服务端还原源码位置）、`playback`（rrweb 录制回放，**未实现，只有 TODO**）。
