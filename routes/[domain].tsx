import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";

import { Handlers, PageProps } from "$fresh/server.ts";

import { getSymbols } from "../utils/hip2.ts";
import { getName } from "../utils/coins.ts";
import CoinButton from "../components/CoinButton.tsx";
import CoinInput from "../islands/CoinInput.tsx";

interface Domain {
  domain: string | null;
  coins: Coin[];
}

interface Coin {
  symbol: string;
  name: string;
}

export const handler: Handlers<Domain | null> = {
  async GET(_, ctx) {
    const { domain } = ctx.params;
    const symbols = await getSymbols(domain);
    const namePromises = symbols.map((symbol) => getName(symbol));
    const names = await Promise.all(namePromises);
    const coins = names.map((name, i) => ({ symbol: symbols[i], name: name ?? "Unknown" }));

    return ctx.render({ domain, coins });
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

export default function Name({ data }: PageProps<Domain | null>) {
  if (!data || !data.domain) {
    return <h1>Name not found</h1>
  }

  return (
    <>
    <Head>
      <title>hiphiptips - {data.domain}</title>
      <Style />
    </Head>
    <div class="p-4 mx-auto max-w-screen-md flex flex-col text-white">
      <div class="flex mt-16">
      <a href="/" class="text-6xl md:text-8xl dark:text-white text-center mt-4 break-all max-w-3xl mx-auto">
        hiphiptips
      </a>
      </div>
      <h2 class="text-4xl font-bold mx-auto mt-8">{data.domain}</h2>
      {data.coins.length > 0 ? (<>
        <h3 class="mx-auto text-3xl mt-8 font-medium">available wallets</h3>
        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-8">
          {data.coins.map((coin) => (
            <CoinButton symbol={coin.symbol} name={coin.name} domain={data.domain!} />
          ))}
        </div>
      </>) : (<>
        <h3 class="mx-auto text-3xl mt-8 font-medium">no wallets listed</h3>
      </>)}

      <h3 class="mx-auto text-3xl mt-8 font-medium">custom wallet</h3>

      <CoinInput domain={data.domain} />

      </div>
    </>
  )
}