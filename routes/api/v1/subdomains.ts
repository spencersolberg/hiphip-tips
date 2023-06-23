import { HandlerContext } from "$fresh/server.ts";

export const handler = async (req: Request, _ctx: HandlerContext): Promise<Response> => {
  // if req isn't POST then return 405
  if (req.method !== "POST") {
    return new Response("Method not allowed. Only POST requests are allowed.", { status: 405 });
  }

  // if req doesn't have a body then return 400
  const body = await req.json();
  if (!body || !body.subdomain) {
    return new Response("Bad request. Request body must include a 'subdomain' field.", { status: 400 });
  }
  const { subdomain }: { subdomain: string } = body;

  // if subdomain is not a string then return 400
  if (typeof subdomain !== "string") {
    return new Response("Bad request. 'subdomain' field must be a string.", { status: 400 });
  }

  // if subdomain has characters except a-z, 0-9, and - then return 400
  if (!subdomain.match(/^[a-z0-9-]+$/)) {
    return new Response("Bad request. 'subdomain' field must only contain lowercase letters, numbers, and hyphens.", { status: 400 });
  }

  // if subdomain is longer than 63 characters then return 400
  if (subdomain.length > 63) {
    return new Response("Bad request. 'subdomain' field must be less than 63 characters.", { status: 400 });
  }
  const kv = await Deno.openKv();

  // if subdomain is already taken then return 409
  const res = await kv.get(["subdomains", subdomain]);
  if (res.value) {
    return new Response("Conflict. Subdomain is already taken.", { status: 409 });
  }

  // generate 16 random digits as key (password)
  const key = Math.random().toString().slice(2,18).toString();
  
  // store subdomain and key in KV
  await kv.set(["subdomains", subdomain], { key, wallets: []}).catch((err) => {
    console.error(err);
    return new Response("Internal server error.", { status: 500 });
  });

  // return 201 with key
  return new Response(JSON.stringify({ key }), { status: 201 });
}