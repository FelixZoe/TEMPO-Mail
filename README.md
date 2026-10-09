# TEMPO Mail

TEMPO Mail 是面向 Stalwart 自托管服务的 iOS 邮件客户端与移动管理端。

## 架构边界

- TypeScript/React Native：账户流程、邮件内容、管理页、设置和业务状态，可通过 EAS Update OTA 更新。
- iOS 原生界面：Expo Router Native Tabs、原生 Stack 搜索、`@expo/ui` 的 Menu/Button/Picker。iOS 26 由系统绘制 Liquid Glass。
- `runtimeVersion` 固定为独立的 `native-1`，不再绑定 App 版本号或 IPA build number。
- 只有 Swift、权限、Expo 原生依赖或其他原生兼容面变化时才升级 `runtimeVersion` 并重新发 IPA；纯 TypeScript 更新始终复用 `production` OTA 通道。

## 产品行为

- 首次进入必须连接自定义 Stalwart/JMAP 服务。
- 首次配置页提供“不登录，预览界面”，只读取本地示例数据，不保存凭据也不触发网络权限。
- 顶部账户按钮展开原生小窗，列出已登录账户和“添加账户”。
- 普通邮箱显示收件箱、星标、已发送、设置。
- 拥有 `sysAccountGet` 与 `sysAccountQuery` 的邮箱额外显示“管理”底部导航。
- 管理权限来自服务器，客户端不会伪造管理员身份。

## 开源组件

协议、列表、缓存、状态和内容组件优先使用维护中的 GitHub 开源项目，详见 [OPEN_SOURCE.md](OPEN_SOURCE.md)。TEMPO 自己只实现 Stalwart 管理扩展适配与产品编排。

## 本地检查

```sh
npm ci
npm run typecheck
npx expo prebuild --platform ios --clean
```

## 自动发布

- `Build native iOS runtime`：仅在原生兼容面发生变化时生成 `native-1` 无签名 IPA，供你使用自己的证书重签。
- `Publish TypeScript OTA`：TypeScript 路由或 `src/**` 变化时先类型检查，再发布到 `production` 通道。
- OTA 发布需要仓库 Secrets：`EXPO_TOKEN` 与 `EXPO_PROJECT_ID`。未配置时工作流仍会完成类型检查并明确跳过发布。

无签名 IPA 不能直接安装；必须用包含当前设备 UDID 的有效描述文件和对应证书完整重签整个 App bundle。
