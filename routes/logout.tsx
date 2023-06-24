import { HandlerContext } from "$fresh/server.ts";


export const handler = (req: Request, _ctx: HandlerContext): Response => {
  const headers = new Headers();
  headers.set("Location", `/`);
  headers.set("Set-Cookie", `key=; Path=/; HttpOnly; Secure; SameSite=Strict; Domain=localhost`);
  return new Response(null, {
    status: 303,
    headers,
  });

}