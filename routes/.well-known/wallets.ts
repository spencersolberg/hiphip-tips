import { HandlerContext } from "$fresh/server.ts";
import { RouteConfig } from "$fresh/server.ts";
import { isHandshake } from "../../utils/hip2.ts";
// @ts-ignore: Strange error with the import
import { getSubdomainWallets, getOwnerOfDomain } from "../../utils/kv.ts";

export const config: RouteConfig = {
  routeOverride: "/.well-known/wallets",
};

const returnSubdomainWallets = async (domain: string): Promise<Response> => {
  const subdomain = domain.split(".")[0];
  try {
    const wallets = await getSubdomainWallets(subdomain);

    const symbols = wallets.map((wallet) => wallet.symbol);
    const body = symbols.join(",");
    return new Response(body);
  } catch (_err) {
    return new Response(null, { status: 404 });
  }
};

const returnDomainWallets = async (domain: string): Promise<Response> => {
  try {
    const subdomain = await getOwnerOfDomain(domain, "subdomain");
    const wallets = await getSubdomainWallets(subdomain);

    const symbols = wallets.map((wallet) => wallet.symbol);
    const body = symbols.join(",");
    return new Response(body);
  } catch (_err) {
    // console.error(_err);
    return new Response(null, { status: 404 });
  }
}

export const handler = async (req: Request, _ctx: HandlerContext): Promise<Response> => {
  const { ICANN_DOMAIN, HANDSHAKE_DOMAIN } = Deno.env.toObject();
  const domain = new URL(req.url).hostname;
  const levels = domain.split(".").reverse();
  // console.log({ domain, levels });

  switch (true) {
    case isHandshake(domain) && levels[0] === HANDSHAKE_DOMAIN: {
      // console.log(`${domain} is a handshake subdomain`);
      return await returnSubdomainWallets(domain);
    }
    case isHandshake(domain): {
      // console.log(`${domain} is a handshake domain`);
      return await returnDomainWallets(domain);
    }
    case !isHandshake(domain) && levels.slice(0, 2).reverse().join(".") === ICANN_DOMAIN: {
      // console.log(`${domain} is an icann subdomain`);
      return await returnSubdomainWallets(domain);
    }
    case !isHandshake(domain): {
      // console.log(`${domain} is an icann domain`);
      return await returnDomainWallets(domain);
    }
    default: {
      return new Response(null, { status: 404 });
    }
  }
}