import { HandlerContext } from "$fresh/server.ts";
import { RouteConfig } from "$fresh/server.ts";

export const config: RouteConfig = {
  routeOverride: "/.well-known/wallets",
};

export const handler = (req: Request, ctx: HandlerContext): Response => {
  const domain = new URL(req.url).hostname;
  switch (domain) {
    case "spencer.hiphiptips":
      return new Response("Hi spencer");
    default: 
      return new Response(`Hi ${domain}`);    
  }
  const body = "DFLT,CNS"

  return new Response(body);
};
