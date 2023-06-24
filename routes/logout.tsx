import { HandlerContext } from "$fresh/server.ts";


export const handler = (req: Request, _ctx: HandlerContext): Response => {
  const headers = new Headers();
  const reqURL = new URL(req.url);
  const domain = reqURL.hostname;
  headers.set("Location", `/`);
  headers.set("Set-Cookie", `key=; Path=/; HttpOnly; Secure; SameSite=Strict; Domain=.${domain};`);
  return new Response(null, {
    status: 303,
    headers,
  });

}