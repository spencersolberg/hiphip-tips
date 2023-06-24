import { HandlerContext } from "$fresh/server.ts";
import { RouteConfig } from "$fresh/server.ts";
import { getSubdomainWallets } from "../../../utils/subdomains.ts";

export const config: RouteConfig = {
  routeOverride: "/.well-known/wallets/:symbol",
};

export const handler = async (req: Request, ctx: HandlerContext): Promise<Response> => {
  const domain = new URL(req.url).hostname;
  const subdomain = domain.split(".")[0];

  const { symbol } = ctx.params;

  try {
    const wallets = await getSubdomainWallets(subdomain);
    // Wallets = { symbol: string, address: string}[]
    const wallet = wallets.find((wallet) => wallet.symbol === symbol);
    if (!wallet) {
      return new Response(null, { status: 404 });
    }
    const body = wallet.address;
    console.log(body);
    return new Response(body);
  } catch (_err) {
    return new Response(null, { status: 404 });
  }
};
