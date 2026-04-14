# Shopify Schema Visual Builder

一个基于 Vue 3 + Vite 的可视化工具，用来编辑 Shopify Section 的 `{% schema %}` JSON。

它把 JSON 编辑器、可视化表单编辑器和 Theme Editor 风格预览放在同一个界面里，方便你在编写 schema 时实时查看结构变化，并快速生成可复制的配置结果。

## 功能特性

- JSON 与可视化表单双向同步，修改任一侧都会实时更新另一侧
- 支持编辑 Section 顶层元信息：`name`、`tag`、`class`
- 支持编辑 `settings`、`blocks`、`presets`
- 支持 Section settings 与 Block settings 的新增、删除、排序
- 内置 Monaco Editor，提供 JSON 高亮和语法校验
- 内置结构校验，能提示缺失字段、非法 range 配置、空选项等问题
- 提供 Theme Editor 风格的预览面板，便于模拟 Shopify 后台配置体验
- 支持复制最终 schema JSON
- 支持保留和编辑 setting 上的额外自定义字段
- 自带示例 schema，打开项目即可直接体验

## 支持的 Setting 类型

当前已支持以下 Shopify setting 类型：

- `header`
- `text`
- `textarea`
- `richtext`
- `image_picker`
- `select`
- `checkbox`
- `radio`
- `range`
- `color`

## 适用场景

- 可视化搭建 Shopify section schema
- 调试和校验已有 schema JSON
- 快速演示 section 配置结构给设计、运营或前端同事
- 在 Theme Editor 录入前先验证字段设计是否合理

## 技术栈

- `Vue 3`
- `Vite`
- `TypeScript`
- `Pinia`
- `Monaco Editor`
- `Vitest`

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

启动后打开终端提示的本地地址即可。

### 3. 运行测试

```bash
npm run test
```

### 4. 构建生产版本

```bash
npm run build
```

### 5. 本地预览构建结果

```bash
npm run preview
```

## 使用方式

1. 在左侧 `JSON Editor` 中粘贴或修改 Shopify schema 的 JSON 内容
2. 在右侧配置面板中直接编辑 section、settings、blocks 和 presets
3. 在 `Preview` 视图中查看模拟的 Theme Editor 表单效果
4. 处理下方错误面板中的 JSON 或结构校验问题
5. 点击 `复制 Schema` 获取最终 JSON

> 注意：当前编辑器处理的是 `{% schema %}` 标签内部的 JSON 内容，而不是完整的 `.liquid` 文件。

## 可校验内容

项目内置了一些常见校验规则，例如：

- section 的 `name` 和 `tag` 不能为空
- 非 `header` 字段的 `id` 和 `label` 不能为空
- `select` / `radio` 至少需要一个 `option`
- `range` 的 `min` 不能大于 `max`
- `range` 的 `step` 必须大于 `0`
- `preset.name` 不能为空

## 项目结构

```text
src/
  components/
    blocks/        # block 编辑相关组件
    builder/       # 表单与字段配置编辑器
    editor/        # Monaco 编辑器与错误面板
    fields/        # 各类 setting 字段编辑组件
    preview/       # Theme Editor 风格预览
  composables/     # schema 同步逻辑
  lib/schema/      # schema 默认值、解析、序列化、校验
  mocks/           # 示例 schema
  stores/          # Pinia 状态管理
  styles/          # 全局样式
```

## 开发命令

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run test:watch
```

## 当前实现范围

- 这是一个纯前端本地工具，不依赖后端服务
- 当前聚焦 Shopify section schema 的 JSON 建模与可视化编辑
- 若你需要支持更多 setting 类型或更贴近 Shopify 原生行为的校验，可以继续在 `src/lib/schema` 和 `src/components/fields` 中扩展
