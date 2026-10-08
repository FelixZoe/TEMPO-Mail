# TEMPO Mail

TEMPO Mail 是一个从零实现、面向自托管邮件服务的原生 iOS 客户端。

## 产品边界

- 首次进入前必须配置自定义 JMAP 服务。
- 支持保存多个账户、快速切换账户、收取/搜索/阅读邮件以及发送邮件。
- 账户切换固定在页面顶部，点击后沿按钮弹出已登录账户列表和“添加账户”。
- 使用管理员邮箱登录时自动增加一个“管理”底部导航；普通邮箱不会显示管理入口。
- 管理模式支持添加、封禁、解封和删除服务器账户，并在服务器支持时管理临时邮箱。
- 凭据保存在系统 Keychain，普通账户元数据保存在应用容器。
- 导航栏、底部标签栏、按钮和搜索使用 iOS 26 原生 Liquid Glass。
- OTA 只更新经过 P-256 签名的配置和文案，不下载或执行代码。

## 为什么使用 JMAP

Stalwart 原生支持 JMAP。与分别维护 IMAP、SMTP 和 IDLE 状态机相比，JMAP 使用 HTTPS 和结构化 JSON，同时覆盖邮箱、邮件查询、正文和提交发送，更适合一个全新、可维护的客户端。

## 开发

要求 macOS、Xcode 26 与 XcodeGen：

```sh
xcodegen generate
open TEMPOMail.xcodeproj
```

部署目标为 iOS 26。当前仓库可在 Windows 上编辑，但最终编译、签名和真机验证必须在 macOS/Xcode 中完成。
应用图标的矢量主文件是 `Design/AppIcon.svg`，Xcode 使用由它导出的 1024×1024 `AppIcon.png`。
每次推送到 `main`、提交拉取请求或手动运行工作流时，GitHub Actions 会在 macOS 26/Xcode 26 上：

1. 使用 XcodeGen 重新生成工程；
2. 自动选择可用的 iPhone 模拟器并运行单元测试；
3. 构建 Release 设备版本并验证应用可执行文件；
4. 上传无签名 `TEMPOMail-unsigned.ipa`、SHA-256 校验文件及构建日志。

无签名 IPA 用于后续自签名或检查产物，不可直接作为 App Store 安装包。正式签名需要单独配置 Apple Distribution 证书和描述文件。

## 自定义服务

首次启动需要输入：

- 显示名称与邮箱地址
- 自托管服务器地址，例如 `https://mail.example.com`；客户端会自动发现 JMAP Session
- 登录用户名（可留空并使用邮箱地址）与密码
- 可选的 OTA 配置 URL 和 P-256 公钥

客户端只接受 HTTPS 服务（开发环境中的 `localhost` 除外）。

管理权限来自当前登录邮箱的 Stalwart 权限，不在客户端内伪造管理员身份。临时邮箱对应 Stalwart Masked Email；服务器版本或权限不支持时，界面会明确显示“未启用”。应用启动不会主动请求系统权限，只有用户点击连接本地服务器时才可能出现 iOS 的本地网络权限提示。
