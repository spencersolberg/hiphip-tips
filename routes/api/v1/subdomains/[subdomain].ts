import { HandlerContext } from "$fresh/server.ts";


export const handler = async (req: Request, ctx: HandlerContext): Promise<Response> => {

  // if req isn't DELETE then return 405
  if (req.method !== "DELETE") {
    return new Response("Method not allowed. Only DELETE requests are allowed.", { status: 405 });
  }

  // if req doesn't have a body then return 400
  const body = await req.json();
  if (!body || !body.key) {
    return new Response("Bad request. Request body must include a 'key' field.", { status: 400 });
  }

  // if key is not a string then return 400
  const { key }: { key: string } = body;
  if (typeof key !== "string") {
    return new Response("Bad request. 'key' field must be a string.", { status: 400 });
  }

  // if key is not 16 digits then return 400
  if (!key.match(/^\d{16}$/)) {
    return new Response("Bad request. 'key' field must be 16 digits.", { status: 400 });
  }

  const { subdomain } = ctx.params;

  const kv = await Deno.openKv();

  // if subdomain doesn't exist then return 404
  const res = await kv.get(["subdomains", subdomain]);
  if (!res.value) {
    return new Response("Not found.", { status: 404 });
  }

  // if key is incorrect then return 401
  // @ts-ignore
  if (res.value.key !== key) {
    return new Response("Unauthorized. Incorrect key.", { status: 401 });
  }

  // delete subdomain from KV
  await kv.delete(["subdomains", subdomain]).catch((err) => {
    console.error(err);
    return new Response("Internal server error.", { status: 500 });
  }
  );

  // return 204
  return new Response(null, { status: 204 });
}