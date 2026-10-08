# 架构

## 数据流

1. `SetupView` 验证自定义服务并读取 JMAP Session。
2. `AccountStore` 保存非敏感账户元数据，`KeychainStore` 独立保存密码。
3. `MailStore` 根据当前账户创建 `JMAPClient`，加载邮箱、查询邮件和提交发送。
4. `OTAConfigurationStore` 拉取签名配置，验证通过后才替换本地缓存。
5. SwiftUI 视图只消费可观察状态，不直接保存凭据或拼装网络请求。

应用停留在前台时会按照有效 OTA 配置的刷新周期自动同步，周期被限制在 60 到 3600 秒之间；用户也可下拉立即刷新。系统推送与离线后台同步不包含在首个版本中。

## OTA 边界

OTA 配置只能控制安全白名单内的数据：公告、支持链接、收件页大小、刷新周期和功能开关。配置载荷为 Base64 编码 JSON，外层携带 P-256 DER 签名。客户端不解释脚本、不加载动态库，也不从配置生成新的业务功能。

## JMAP 能力

第一阶段使用以下标准能力：

- `urn:ietf:params:jmap:core`
- `urn:ietf:params:jmap:mail`
- `urn:ietf:params:jmap:submission`

发送流程为 `Email/set` 创建草稿，再通过 `EmailSubmission/set` 提交。
