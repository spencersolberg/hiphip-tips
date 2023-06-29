import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";

import { Handlers, PageProps } from "$fresh/server.ts";

import { getSymbols, isHandshake } from "../utils/hip2.ts";
import type { Security } from "../utils/hip2.ts";
import { getName } from "../utils/coins.ts";
// import { getSubdomain } from "../utils/subdomains.ts";
import { getSubdomain } from "../utils/kv.ts";
import { verifyToken } from "../utils/jwt.ts";

import CoinButton from "../components/CoinButton.tsx";
import CoinInput from "../islands/CoinInput.tsx";
import { RouteConfig } from "$fresh/server.ts";

export const config: RouteConfig = {
  routeOverride: "/@:domain",
};

interface DomainData {
  domain: string | null;
  coins: Coin[];
  subdomain?: string;
  security: Security;
}

interface Coin {
  symbol: string;
  name: string;
}

export const handler: Handlers<DomainData | null> = {
  async GET(req, ctx) {
    const headers = req.headers;
    const cookie = headers.get("cookie");
    const token = cookie?.split("token=")[1]?.split(";")[0];
    const security: Security = cookie?.split("security=")[1]?.split(";")[0] as Security ?? "handshake";

    const { domain } = ctx.params;

    if (isHandshake(domain) && security !== "handshake" && !token) {
      const headers = new Headers();
      const reqURL = new URL(req.url);
      const hostname = reqURL.hostname;
      const secure = reqURL.protocol === "https:";
  
    
      headers.set("Location", `/@${domain}`);
      headers.set("Set-Cookie", `security=handshake; Path=/; HttpOnly;${secure && " Secure;"} SameSite=Strict; Domain=.${hostname};`);
      return new Response(null, {
        status: 303,
        headers,
      });
    }

    const symbols = await getSymbols(domain, security) ?? [];
    const namePromises = symbols.map((symbol) => getName(symbol));
    const names = await Promise.all(namePromises);
    const coins = names.map((name, i) => ({ symbol: symbols[i], name: name ?? "Unknown" }));

    // if token exists, verify it
    if (token) {
      try {
        const { uuid } = await verifyToken(token);
        const subdomain = await getSubdomain(uuid);

        return ctx.render({ subdomain, domain, coins, security });
      } catch (error) {
        console.error(error);
        return ctx.render({ domain, coins, security });
      }
    } else {
      return ctx.render({ domain, coins, security });
    }
    
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const symbol = form.get("symbol") as string;
    const { domain } = ctx.params;
    if (symbol) {
      const headers = new Headers();
      headers.set("Location", `/@${domain}/${symbol.toUpperCase()}`);
      return new Response(null, {
        status: 303,
        headers,
      });
    }
    return ctx.render();
  }
}

export default function Name({ data }: PageProps<DomainData | null>) {
  if (!data || !data.domain) {
    return <h1>Name not found</h1>
  }

  const { subdomain, security } = data;

  const descriptionCurrencies = data.coins.length > 1 
  ? data.coins[0].symbol + ", " + data.coins[1].symbol
  : data.coins.length === 1 ? data.coins[0].symbol : "crypto" 

  const twitterDescription = `Send ${descriptionCurrencies} to ${data.domain}/`

  return (
    <>
    <Head>
      <title>{data.domain} | hiphiptips</title>
      <Style />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content={`/@${data.domain}`} />
      <meta name="twitter:title" content={`${data.domain}/ | hiphiptips`} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content="/favicon/apple-icon.png" />
      <meta content="#34D399" name="theme-color" />
    </Head>
    <div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white">
      <Header subdomain={subdomain} />
      <h2 class="text-4xl font-bold mx-auto mt-8">{data.domain}</h2>
      {data.coins.length > 0 ? (<>
        <h3 class="mx-auto text-3xl mt-8 font-medium">available wallets</h3>
        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-8">
          {data.coins.map((coin) => (
            <CoinButton symbol={coin.symbol} name={coin.name} domain={data.domain!} />
          ))}
        </div>
      </>) : (<>
        <h3 class="mx-auto text-3xl mt-8 font-medium">no wallets listed!</h3>
        {security === "handshake" ? 
        <form method="POST" class="mx-auto" action="/security">
          <input type="hidden" name="path" value={`/@${data.domain}`} />
          <input type="hidden" name="security" value="ca" />
          <button type="submit" class="mx-auto text-center text-lg mt-8 underline hover:italic"><p>try with CA security (less secure)</p></button>
        </form> : null}

      </>)}

      <h3 class="mx-auto text-3xl mt-8 font-medium">custom wallet:</h3>

      <CoinInput domain={data.domain} />

      </div>
    </>
  )
}