import { HandlerContext } from "$fresh/server.ts";

export const handler = async (req: Request, ctx: HandlerContext): Promise<Response> => {
  // if req isn't POST then return 405
  if (req.method !== "POST") {
    return new Response("Method not allowed. Only POST requests are allowed.", { status: 405 });
  }

  // if req doesn't have a body then return 400
  const body = await req.json();
  if (!body || !body.symbol || !body.key || !body.address) {
    return new Response("Bad request. Request body must include 'symbol', 'address', and 'key' fields.", { status: 400 });
  }
  const { symbol }: { symbol: string } = body;

  // if symbol is not a string then return 400
  if (typeof symbol !== "string") {
    return new Response("Bad request. 'symbol' field must be a string.", { status: 400 });
  }

  // if symbol has characters except a-Z, 0-9, and $ then return 400
  if (!symbol.match(/^[a-zA-Z0-9$]+$/)) {
    return new Response("Bad request. 'symbol' field must only contain letters, numbers, and dollar signs.", { status: 400 });
  }

  // if symbol is longer than 10 characters then return 400
  if (symbol.length > 10) {
    return new Response("Bad request. 'symbol' field must be less than 10 characters.", { status: 400 });
  }

  // if key is not a string then return 400
  const { key }: { key: string } = body;
  if (typeof key !== "string") {
    return new Response("Bad request. 'key' field must be a string.", { status: 400 });
  }

  // if key is not 16 characters then return 400
  if (key.length !== 16) {
    return new Response("Bad request. 'key' field must be 16 characters.", { status: 400 });
  }

  // if address is not a string then return 400
  const { address }: { address: string } = body;
  if (typeof address !== "string") {
    return new Response("Bad request. 'address' field must be a string.", { status: 400 });
  }

  // if address is longer than 128 characters then return 400
  if (address.length > 128) {
    return new Response("Bad request. 'address' field must be less than 128 characters.", { status: 400 });
  }



  const { subdomain } = ctx.params;

  const kv = await Deno.openKv();

  // if subdomain doesn't exist then return 404
  const res = await kv.get(["subdomains", subdomain]);
  if (!res.value) {
    return new Response("Not found. Subdomain does not exist.", { status: 404 });
  }

  // if key is incorrect then return 401
  // @ts-ignore
  if (res.value.key !== key) {
    return new Response("Unauthorized. Incorrect key.", { status: 401 });
  }

  // if symbol already exists then return 409
  // subdomain structure: { key: string, wallets: { symbol: string, address: string }[] }
  // @ts-ignore
  if (res.value.wallets.find((wallet) => wallet.symbol === symbol.toUpperCase())) {
    return new Response("Conflict. Wallet already exists.", { status: 409 });
  }

  // add symbol to subdomain
  // @ts-ignore
  await kv.set(["subdomains", subdomain], { ...res.value, wallets: [...res.value.wallets, { symbol: symbol.toUpperCase(), address }] }).catch((err) => {
    console.error(err);
    return new Response("Internal server error.", { status: 500 });
  }
  );

  // return 201
  return new Response(null, { status: 201 });

}