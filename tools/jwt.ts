import * as jose from "jose";

const { publicKey, privateKey } = await jose.generateKeyPair("RS256", { extractable: true });

const publicKeyString = await jose.exportSPKI(publicKey);
const privateKeyString = await jose.exportPKCS8(privateKey);

// console.log(publicKeyString);
// console.log(privateKeyString);

const publicJWK = await jose.exportJWK(publicKey);
// console.log(publicJWK);

const jwks = {
  keys: [
    {
      ...publicJWK,
      use: "sig",
      // generate UUID for kid
      kid: crypto.randomUUID(),
      alg: "RS256",
      "key_ops": ["verify"]
    }
  ]
}

// console.log(jwks);

// save private key, public key, and jwks to files
await Deno.writeTextFile("./jwt.key", privateKeyString);
await Deno.writeTextFile("./jwt.key.pub", publicKeyString);
await Deno.writeTextFile("./jwks.json", JSON.stringify(jwks));