import * as jose from "jose";

export const signToken = async (uuid: string, domain = "localhost:8001", authenticatorName: string): Promise<string> => {
  const privateKeyString = await Deno.readTextFile("./jwt.key");
  const privateKey = await jose.importPKCS8(privateKeyString, "RS256");

  const protocol = domain.startsWith("localhost") ? "http" : "https";

  // console.log(`Signing token for ${uuid} with authenticator ${authenticatorName}`)
  const token = await new jose.SignJWT({
    authenticatorName
  })
    .setProtectedHeader({
      typ: "JWT",
      alg: "RS256"
    })
    .setIssuer(`${protocol}://${domain}`)
    .setSubject(uuid)
    .setAudience(domain)
    .setExpirationTime("1d")
    .setIssuedAt()
    .sign(privateKey);

  return token;
}

interface Verified extends Awaited<ReturnType<typeof jose.jwtVerify>> {
  uuid: string;
}

export const verifyToken = async (token: string): Promise<Verified> => {
  const publicKeyString = await Deno.readTextFile("./jwt.key.pub");
  const publicKey = await jose.importSPKI(publicKeyString, "RS256");
  try {
    const { payload, _protectedHeader } = await jose.jwtVerify(token, publicKey);

    const expiration: number = payload.exp; // unix timestamp
    const now = Math.floor(Date.now() / 1000); // unix timestamp

    if (expiration < now) {
      throw new Error("Token expired");
    }

    // console.log({ ...payload, uuid: payload.sub });
    return { ...payload, uuid: payload.sub };
  } catch (error) {
    console.error(error);
    throw new Error("Invalid token");
  }
}