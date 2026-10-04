# TEMPO Mail

TEMPO Mail 是专门为 [Stalwart Mail Server](https://stalw.art/) 适配的 iOS 邮件客户端与简体中文管理端，当前服务于 `@darker.one`。它是独立邮件项目，不属于 TEMPO 主应用，也不复用 TEMPO 主仓库的发布工作流。

仓库包含两部分：

- `ios/`：基于 [TabMail](https://github.com/TabMail/tabmail-ios) 二次开发的原生 SwiftUI 邮件客户端，默认连接 Stalwart 的 `mail.darker.one`，支持通用 IMAP/SMTP、本地邮件数据库、IMAP IDLE 和横屏，并提供受 Stalwart 自身权限系统保护的管理入口。
- `web-admin/`：基于 Stalwart WebAdmin 深度汉化和适配的管理端，用于域名、用户、队列、日志以及账号停用/恢复。
- `deploy/`：Stalwart WebAdmin 在 1Panel/OpenResty 下的入口和分包资源映射，避免管理端升级后出现动态模块哈希不一致。

## 已验证的邮件链路

2026-10-04 使用两个临时 `@darker.one` 账号完成了真实闭环测试：

1. 通过 SMTPS `465` 从账号 A 登录并发信；
2. 通过 IMAPS `993` 登录账号 B；
3. 在 B 的收件箱中校验发件人、主题和正文；
4. 删除两个临时账号。

测试不是端口探测，实际覆盖了认证、投递、存储和读取。

## iOS 快速开始

要求 macOS、Xcode 27、XcodeGen，部署目标 iOS 26。

```bash
cd ios
cp Secrets.xcconfig.example Secrets.xcconfig
./Scripts/xcodegen.sh
open TEMPOMail.xcodeproj
```

安装后进入“邮箱账户”，输入完整邮箱地址与密码即可。默认配置：

- IMAP：`mail.darker.one:993`（TLS）
- SMTP：`mail.darker.one:465`（TLS）

客户端不会内置管理员口令。进入“服务器管理”时，由 Stalwart 管理端自行完成登录和权限校验。

## 账号封禁与邮件查看边界

- 管理员可在中文管理端修改账号权限、停用或恢复登录，并查看邮件队列与日志。
- iOS 客户端原生展示当前已登录、明确授权的邮箱内容。
- 项目不实现管理员静默冒充用户读取任意邮箱，避免绕过认证和审计。

## Web 管理端

```bash
cd web-admin
npm ci
npm run typecheck
npm test
npm run build
```

构建产物位于 `web-admin/dist/`，生产环境由 `https://mail.darker.one/admin` 提供。

## 许可与来源

这是一个独立的开源组合项目：

- iOS 客户端沿用 MPL-2.0，保留原项目许可证与修改声明；TEMPO Mail 与 TabMail 官方无隶属关系。
- Web 管理端沿用 Stalwart 的 AGPL-3.0-only / SEL 双许可证文件。

详见 [NOTICE.md](NOTICE.md)、`ios/LICENSE`、`ios/TRADEMARKS.md` 与 `web-admin/LICENSES/`。
