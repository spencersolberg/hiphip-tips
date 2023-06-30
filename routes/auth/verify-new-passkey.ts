import { HandlerContext } from "$fresh/server.ts";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

import type { AuthenticatorDevice } from "@simplewebauthn/typescript-types";

import { createSubdomain, getAuthenticator, saveNewUserAuthenticator, getChallenge, addAuthenticator } from "../../utils/kv.ts";
import { verifyToken } from "../../utils/jwt.ts";

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

  const headers = req.headers;
  const cookie = headers.get("cookie");
  const token = cookie?.split("token=")[1]?.split(";")[0];

  if (token) {
    try {
      const { uuid } = await verifyToken(token);
      if (uuid != json.user.id) {
        return Response.json({ error: "invalid token" }, { status: 400 });
      }
      const subdomain = json.user.name;
      const challenge = await getChallenge(uuid);
      if (!challenge) {
        return Response.json({ error: "invalid challenge" }, { status: 400 });
      }
      let verification;
      try {
        verification = await verifyRegistrationResponse({
          response: json,
          expectedChallenge: challenge,
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

        await addAuthenticator(uuid, _authenticator);

        return Response.json({ verified });
      } else {
        return Response.json({ verified });
      }
    } catch (error) {
      console.error(error);
      return Response.json({ error: "invalid token" }, { status: 400 });
    }
  } else {
    return Response.json({ error: "invalid token" }, { status: 400 });

  }
}