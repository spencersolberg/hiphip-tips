import { HandlerContext } from "$fresh/server.ts";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";


import type { AuthenticatorDevice } from "@simplewebauthn/typescript-types";

import { createSubdomain, getAuthenticator, saveNewUserAuthenticator } from "../../utils/kv.ts";
import { signToken } from "../../utils/jwt.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
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

  const kv = await Deno.openKv();
  const challenge = await kv.get<string>(["challenges", uuid]);

  if (!challenge.value) {
    // timed out
    return new Response("Timed out.", { status: 408 });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: json,
      expectedChallenge: challenge.value,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error.", { status: 500 });
  }

  const { verified } = verification;

  // console.log(verification);

  if (verified) {
    const { registrationInfo } = verification;

    const _authenticator: AuthenticatorDevice = {
      credentialID: registrationInfo!.credentialID,
      credentialPublicKey: registrationInfo!.credentialPublicKey,
      counter: registrationInfo!.counter,
    };

    
    await saveNewUserAuthenticator(uuid, _authenticator);
    await createSubdomain(subdomain, uuid);
    const authenticator = await getAuthenticator(uuid, isoBase64URL.fromBuffer(_authenticator.credentialID))
    const token = await signToken(uuid, rpID, authenticator.name);

    return Response.json({ token, verified });
  } else {
    return Response.json({ verified });
  }
};
