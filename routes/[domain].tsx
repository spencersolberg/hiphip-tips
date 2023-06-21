import { Head } from "$fresh/runtime.ts";

import { Handlers, PageProps } from "$fresh/server.ts";

import { getSymbols } from "../utils/hip2.ts";
import { getName } from "../utils/coins.ts";
import CoinButton from "../components/CoinButton.tsx";

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
  }
}

export default function Name({ data }: PageProps<Domain | null>) {
  if (!data || !data.domain) {
    return <h1>Name not found</h1>
  }

  return (
    <>
    <Head>
      <title>HipHipTips - {data.domain}</title>
    </Head>
    <div class="p-4 mx-auto max-w-screen-md flex flex-col">
      <div class="flex mt-16">
        <a href="/" class="text-4xl font-bold mx-auto">HipHipTips</a>
      </div>
      <h2 class="text-2xl font-bold mx-auto mt-8">{data.domain}</h2>

        <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-8">
          {data.coins.map((coin) => (
            <CoinButton symbol={coin.symbol} name={coin.name} domain={data.domain!} />
          ))}
        </div>
      </div>
    </>
  )
}