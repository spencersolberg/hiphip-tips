import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";

import { Handlers, PageProps } from "$fresh/server.ts";

import { getSymbols } from "../utils/hip2.ts";
import { getName } from "../utils/coins.ts";
import { getSubdomain } from "../utils/subdomains.ts";

import CoinButton from "../components/CoinButton.tsx";
import CoinInput from "../islands/CoinInput.tsx";

interface DomainData {
  domain: string | null;
  coins: Coin[];
  subdomain?: string;
}

interface Coin {
  symbol: string;
  name: string;
}

export const handler: Handlers<DomainData | null> = {
  async GET(req, ctx) {
    const { domain } = ctx.params;
    const symbols = await getSymbols(domain);
    const namePromises = symbols.map((symbol) => getName(symbol));
    const names = await Promise.all(namePromises);
    const coins = names.map((name, i) => ({ symbol: symbols[i], name: name ?? "Unknown" }));

    // get key from cookie
    const headers = req.headers;
    const cookie = headers.get("cookie");
    const key = cookie?.split("key=")[1]?.split(";")[0];

    // if key exists, get subdomain
    if (key) {
      try {
        const subdomain = await getSubdomain(key);
        return ctx.render({ subdomain, domain, coins });
      } catch (error) {
        return ctx.render({ domain, coins });
      }
    }
    return await ctx.render({ domain, coins });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const symbol = form.get("symbol") as string;
    const { domain } = ctx.params;
    if (symbol) {
      const headers = new Headers();
      headers.set("Location", `/${domain}/${symbol.toUpperCase()}`);
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

  const { subdomain } = data;

  return (
    <>
    <Head>
      <title>hiphiptips - {data.domain}</title>
      <Style />
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
      </>)}

      <h3 class="mx-auto text-3xl mt-8 font-medium">custom wallet:</h3>

      <CoinInput domain={data.domain} />

      </div>
    </>
  )
}