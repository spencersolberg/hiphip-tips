import { generateRegistrationOptions } from "@simplewebauthn/server";
import { HandlerContext } from "$fresh/server.ts";

import { subdomainExists, setChallenge, getUUID } from "../../utils/kv.ts";

// GET Request with subdomain query parameter
export const handler = async (req: Request, _ctx: HandlerContext): Promise<Response> => {
  const host = new URL(req.url).hostname;
  const rpName = "hiphiptips";
  // const rpID = "hiphiptips";
  const rpID = host;
  const origin = `https://${rpID}`;
  const url = new URL(req.url);
  const subdomain = url.searchParams.get("subdomain");
  if (!subdomain) {
    return new Response("missing subdomain", { status: 400 });
  }

  if (await !subdomainExists(subdomain)) {
    return new Response("subdomain does not exist", { status: 400 });
  }

  // Generate random UUID 
  let uuid;
  try {
    uuid = await getUUID(subdomain);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  // Generate registration options
  const options = generateRegistrationOptions({
    rpName,
    rpID,
    attestationType: "none",
    userName: subdomain,
    userID: uuid,
    userDisplayName: `${subdomain}.hiphiptips`
  });

  // store challenge in KV
  await setChallenge(uuid, options.challenge);

  // return registration options
  return Response.json(options);
}
