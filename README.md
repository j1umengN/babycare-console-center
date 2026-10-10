# BabyCare Console Center

> 单文件 · 零依赖 · 离线可用的宝宝成长记录工作台（v2.3）

**项目定位**：为新生儿至 3 岁家庭打造的开源育儿记录工具。整个应用就是一份 `index.html`——浏览器打开即用，不需要安装、注册、联网，数据完全由你掌控。适合想要「数据在自己手里、界面干净、功能够用」的家庭自托管使用。

[使用手册（MANUAL.md）](MANUAL.md) ｜ [License (MIT)](LICENSE)

---

## 项目特色

- **单文件架构**：全部功能（含产品手册、内联图标）集成在一个 HTML 文件里，复制即部署，离线可用（PWA，可添加到手机主屏当 App 用）。
- **数据主权**：所有记录默认存浏览器 localStorage，**不上传任何服务器**；可选云同步也是接你自己部署的后端。
- **全维度记录**：喂养（母乳/配方奶/辅食+过敏追踪）、排泄、洗澡、抚触、睡眠（夜睡/小睡计时）、补剂、疫苗、身高体重头围、早教活动。
- **智能日程**：疫苗一类免疫规划日程按出生日期自动推算；「今天要处理」聚合逾期/今日/临期事项。
- **WHO 生长曲线**：身高体重头围自动对照 WHO 百分位。
- **早教分龄方案**：按月龄给出六大领域亲子活动、发育里程碑与预警信号（参考 NHC-2024 / AAP-CDC / WHO-NCF）。
- **宝妈 Care**：妈妈状态采集、每日计划与安全提醒（非医疗诊断）。
- **家庭育儿医生（AI）**：接入任意 OpenAI 兼容接口的育儿问答，会结合宝宝近期记录；API Key 仅存本机。
- **多人共享（可选）**：自建 PostgREST 后端，房间口令作访问边界，LWW 合并 + 软删除传播，多照护人同时记录互不冲突。
- **摇篮曲**：本地音乐播放器 + 定时淡出。

## 运行方式

### 方式一：直接打开（最快）

下载 `index.html`，用手机或电脑浏览器打开即可。微信内请「用浏览器打开」。

### 方式二：静态托管（推荐）

把以下文件放到任意静态网站服务（nginx、GitHub Pages、Vercel、对象存储均可）：

```
index.html  sw.js  manifest.webmanifest  icon-192.png  icon-512.png
```

手机浏览器打开后「添加到主屏幕」，即可像原生 App 一样全屏使用（含离线缓存）。

### 方式三：云端同步（可选，多设备/多人）

自建 PostgreSQL + PostgREST 后端，建表：

```sql
create table baby_records (
  id text primary key,          -- 房间口令:表名
  room_id text not null,        -- 房间口令（家人共享边界）
  table_name text,
  payload jsonb not null,
  rev bigint not null default 1,
  updated_at timestamptz not null default now()
);
create index baby_records_room_idx on baby_records (room_id);
```

然后在 `index.html` 顶部把 `CLOUD_BACKEND` 填上你的服务地址与 anon key（或部署后在应用「设置 → 高级设置」里填写）。家人填同一套参数 + 相同房间口令即共享数据；没有口令的人打开页面也读不到任何数据。

## 使用方式

1. **首次打开**：自动弹出三步新手引导（确认宝宝档案 → 记录第一条 → 进阶功能），按提示走即可。
2. **自定义宝宝档案**：文本编辑器打开 `index.html`，搜索 `BABY_IDENTITY`，修改姓名、性别、出生日期、出生体重/身长。疫苗日程与生长曲线会自动按生日推算。
3. **日常记录**：首页快速宫格或底部「记录」页一键记录；右下角 `+` 任何页面都能快速记录。
4. **看进展**：「统计」页看 8 大分类趋势；「成长」页看 WHO 曲线；首页热力图看坚持情况。
5. **备份**：设置 → 导出全部数据（JSON），建议定期备份。

更多细节（各模块操作、FAQ、数据安全）见 [MANUAL.md](MANUAL.md)。

## 自定义指南

| 想改什么 | 怎么改 |
|---|---|
| 宝宝档案 | `index.html` 搜索 `BABY_IDENTITY` |
| 云同步后端 | `index.html` 搜索 `CLOUD_BACKEND`，或应用内设置页填写 |
| AI 接口 | 应用内 设置 → AI 大模型接入（Base URL / Key / 模型名，仅存本机） |
| 主题色 | `index.html` 顶部 CSS 变量 `:root` 段 |
| 应用名称 | 全局搜索 `BabyCare Console Center` 替换，并同步改 `manifest.webmanifest` |

## 技术栈

- 纯原生 HTML/CSS/JavaScript，**零 npm 依赖、零构建步骤**
- 存储：localStorage（记录）+ IndexedDB（摇篮曲音频 Blob）
- 同步协议：按 id upsert + LWW + 软删除传播（PostgREST / REST）
- PWA：Service Worker 预缓存外壳，network-first 导航

## 隐私与安全

- 不收集、不上传任何用户数据；仓库中不含任何真实个人信息（宝宝档案为示例数据）。
- AI 问答的 API Key 仅存本机浏览器，不参与云同步。
- 云同步以「房间口令」为访问边界，无账号体系。

## Roadmap

- [ ] 多宝宝支持
- [ ] 云同步自签名 token（替代 anon key）
- [ ] 报告导出 PDF 模板自定义
- [ ] 英文界面

## 贡献

欢迎 Issue 与 PR。提交前请确保：不引入任何个人信息、不新增外部依赖、保持单文件架构。

## License

[MIT](LICENSE)

## 免责声明

本应用仅供家庭记录与参考，不构成医疗建议。宝宝健康问题请咨询专业儿科医生。
