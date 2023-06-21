import { Handlers, PageProps } from "$fresh/server.ts";
import { getAddress } from "../../utils/hip2.ts";
import { getInfo } from "../../utils/coins.ts";
import QRCode from "../../islands/QRCode.tsx";
import { Head } from "$fresh/runtime.ts";

interface Wallet {
  domain: string | null;
  symbol: string;
  address: string | undefined;
  color: string | undefined;
  coin: string | undefined;
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

export const handler: Handlers<Wallet> = {
  async GET(_, ctx) {
    const { domain, symbol } = ctx.params;
    const address = await getAddress(domain, symbol);

    const info = await getInfo(symbol);
    const color = info?.color;
    const coin = info?.name;

    return ctx.render({ domain, symbol, address, color, coin });

  }
}

export default function Name({ data }: PageProps<Wallet>) {

  return (
    <>
      <Head>
        <title>HipHipTips - {data.domain} - {data.symbol}</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md flex flex-col">
      <div class="flex mt-16">
        <a href="/" class="text-4xl font-bold mx-auto">HipHipTips</a>
      </div>
      <a href={`/${data.domain}`} class="text-2xl font-bold mx-auto mt-8">{data.domain}</a>
        <h3 class="mx-auto text-3xl mt-8 font-medium">{data.coin} {`(${data.symbol})`}</h3>
        <div class="mx-auto mt-4 transition-transform transform-gpu hover:scale-110">
        <QRCode symbol={data.symbol} address={data.address ?? "hello world"} color={data.color ?? "#000000"} domain={data.domain!}/>
        </div>
        <p class="text-lg mx-auto mt-4 text-gray-600">{data.address}</p>
      </div>
    </>
  )
}