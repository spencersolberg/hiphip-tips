import { HandlerContext } from "$fresh/server.ts";
import { isHandshake } from "../utils/hip2.ts";

export const handler = (req: Request, _ctx: HandlerContext): Response => {
  const { ICANN_DOMAIN, HANDSHAKE_DOMAIN } = Deno.env.toObject();
  const headers = req.headers;
  const reqURL = new URL(req.url);
  const domain = reqURL.hostname;
  const cookie = headers.get("cookie");
  const token = cookie?.split("token=")[1]?.split(";")[0];

  return new Response(null, {
    status: 303,
    headers: {
      "Location": `https://${
        isHandshake(domain) ? ICANN_DOMAIN : HANDSHAKE_DOMAIN
      }/auth/set-token?token=${token}`,
    },
  });
};
