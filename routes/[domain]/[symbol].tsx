import { Handlers, PageProps } from "$fresh/server.ts";
import { getAddress } from "../../utils/hip2.ts";
import { getInfo } from "../../utils/coins.ts";
import { getSubdomain } from "../../utils/subdomains.ts";

import QRCode from "../../islands/QRCode.tsx";
import { Head } from "$fresh/runtime.ts";
import Style from "../../components/Style.tsx";
import Header from "../../components/Header.tsx";

import Address from "../../islands/Address.tsx";

interface WalletData {
  domain: string | null;
  symbol: string;
  address: string | undefined;
  color: string | undefined;
  coin: string | undefined;
  subdomain?: string;
}

const blobToBase64 = (blob: Blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve(reader.result);
    }
  })
}

export const handler: Handlers<WalletData> = {
  async GET(req, ctx) {
    const { domain, symbol } = ctx.params;
    const address = await getAddress(domain, symbol);

    const info = await getInfo(symbol);
    const color = info?.color;
    const coin = info?.name;

    // get key from cookie
    const headers = req.headers;
    const cookie = headers.get("cookie");
    const key = cookie?.split("key=")[1]?.split(";")[0];

    // if key exists, get subdomain
    if (key) {
      try {
        const subdomain = await getSubdomain(key);
        return ctx.render({ subdomain, domain, symbol, address, color, coin});
      } catch (error) {
        return ctx.render({ domain, symbol, address, color, coin});
      }
    }
    return await ctx.render({ domain, symbol, address, color, coin});
  }
}

export default function Name({ data }: PageProps<WalletData>) {

  return (
    <>
      <Head>
        <title>hiphiptips - {data.domain} - {data.symbol}</title>
        <Style />
      </Head>
      <div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white">
        <Header subdomain={data.subdomain} />
        <a href={`/${data.domain}`} class="text-2xl font-bold mx-auto mt-8">{data.domain}</a>
        { data.address ? (<>
          <h3 class="mx-auto text-3xl mt-8 font-medium">{data.coin} {`(${data.symbol})`}</h3>
          <div class="mx-auto mt-4 transition-transform transform-gpu hover:scale-110">
          <QRCode symbol={data.symbol} address={data.address ?? "hello world"} color={data.color ?? "#000000"} domain={data.domain!}/>
          </div>
          <Address address={data.address ?? "hello world"} />
        </>) : (<>
          <h3 class="mx-auto text-3xl mt-8 font-medium">No address found</h3>
        </>)}

      </div>
    </>
  )
}