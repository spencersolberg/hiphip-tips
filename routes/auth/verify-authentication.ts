import { HandlerContext } from "$fresh/server.ts";
import { getChallenge, getAuthenticator, updateAuthenticatorCounter } from "../../utils/kv.ts";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { signToken } from "../../utils/jwt.ts";

export const handler = async (req: Request, _ctx: HandlerContext): Promise<Response> => {
  const host = new URL(req.url).hostname;
  const rpName = Deno.env.get("HANDSHAKE_DOMAIN");
  // const rpID = "hiphiptips";
  const rpID = host;
  const protocol = host === "localhost" ? "http" : "https";
  const origin = `${protocol}://${rpID}${host === "localhost" ? ":8001" : ""}`;
  const json = await req.json();
  // console.log(json);

  const uuid = json.user.id;
  const subdomain = json.user.name;


  let challenge: string;
  try {
    challenge = await getChallenge(uuid);
  } catch (error) {
    console.error(error);
    return new Response("Internal server error. (Challenge probably expired)", { status: 500 });
  }

  let authenticator: Awaited<ReturnType<typeof getAuthenticator>>;
  try {
    authenticator = await getAuthenticator(uuid, json.id);
  } catch (error) {
    console.error(error);
    return new Response("Internal server error. (Authenticator not registered)", { status: 500 });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: json,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator
    });
  } catch (error) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }

  const { verified } = verification;


  // console.log(verification);

  if (verified) {
    const { authenticationInfo } = verification;
    const { newCounter } = authenticationInfo;
    await updateAuthenticatorCounter(uuid, authenticator, newCounter);

    const token = await signToken(uuid, rpID, authenticator.name);

    return new Response(JSON.stringify({ verified, token }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ verified }), { status: 401 });
  }
}