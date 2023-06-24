import { HandlerContext } from "$fresh/server.ts";
import { RouteConfig } from "$fresh/server.ts";
import { getSubdomainWallets } from "../../utils/subdomains.ts";

export const config: RouteConfig = {
  routeOverride: "/.well-known/wallets",
};

export const handler = async (req: Request, _ctx: HandlerContext): Promise<Response> => {
  const domain = new URL(req.url).hostname;
  const subdomain = domain.split(".")[0];

  try {
    const wallets = await getSubdomainWallets(subdomain);
    // Wallets = { symbol: string, address: string}[]
    const symbols = wallets.map((wallet) => wallet.symbol);
    const body = symbols.join(",");
    return new Response(body);
  } catch (_err) {
    return new Response(null, { status: 404 });
  }
};
