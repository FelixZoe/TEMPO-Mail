# 签名 OTA 配置

TEMPO Mail 的 OTA 不更新 Swift 代码，只更新明确允许的数据字段。

## 1. 生成密钥

```sh
node Tools/generate-ota-key.mjs private-key.pem public-key.txt
```

私钥只保存在发布环境。`public-key.txt` 的内容在添加账户时填入客户端。

## 2. 编写配置

```json
{
  "schemaVersion": 1,
  "expiresAt": "2027-01-01T00:00:00Z",
  "announcement": "邮件服务将在周日维护。",
  "supportURL": "https://example.com/support",
  "inboxPageSize": 50,
  "refreshIntervalSeconds": 300,
  "features": {
    "experimentalThreadView": false
  }
}
```

## 3. 签名并发布

```sh
node Tools/sign-ota-config.mjs config.json private-key.pem envelope.json
```

将 `envelope.json` 发布到 HTTPS 地址，并在账户配置中填写该 URL。客户端用 P-256 公钥验证 DER 签名；验证失败、配置过期或 schema 不匹配时继续使用上一次有效缓存或内置默认值。
