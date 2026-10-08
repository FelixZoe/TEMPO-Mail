import { createPrivateKey, sign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const [configPath, privateKeyPath, outputPath] = process.argv.slice(2);
if (!configPath || !privateKeyPath || !outputPath) {
  console.error("用法: node Tools/sign-ota-config.mjs config.json private-key.pem envelope.json");
  process.exit(1);
}

const parsed = JSON.parse(readFileSync(configPath, "utf8"));
const payload = Buffer.from(JSON.stringify(parsed));
const privateKey = createPrivateKey(readFileSync(privateKeyPath));
const signature = sign("sha256", payload, { key: privateKey, dsaEncoding: "der" });
const envelope = {
  payload: payload.toString("base64"),
  signature: signature.toString("base64"),
};

writeFileSync(outputPath, `${JSON.stringify(envelope, null, 2)}\n`);
console.log(`已写入签名配置 ${outputPath}`);
