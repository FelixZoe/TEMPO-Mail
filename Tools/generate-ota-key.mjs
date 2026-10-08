import { generateKeyPairSync } from "node:crypto";
import { writeFileSync } from "node:fs";

const [privatePath, publicPath] = process.argv.slice(2);
if (!privatePath || !publicPath) {
  console.error("用法: node Tools/generate-ota-key.mjs private-key.pem public-key.txt");
  process.exit(1);
}

const { privateKey, publicKey } = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
});
const privatePEM = privateKey.export({ type: "pkcs8", format: "pem" });
const jwk = publicKey.export({ format: "jwk" });

function decodeBase64URL(value) {
  return Buffer.from(value.replaceAll("-", "+").replaceAll("_", "/"), "base64");
}

const x963 = Buffer.concat([
  Buffer.from([0x04]),
  decodeBase64URL(jwk.x),
  decodeBase64URL(jwk.y),
]);
writeFileSync(privatePath, privatePEM, { mode: 0o600 });
writeFileSync(publicPath, `${x963.toString("base64")}\n`);
console.log(`已生成私钥 ${privatePath} 与客户端公钥 ${publicPath}`);
