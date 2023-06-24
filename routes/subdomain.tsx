import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";
import CoinButton from "../components/CoinButton.tsx";
import type { Wallet } from "../utils/subdomains.ts";
import { getName } from "../utils/coins.ts";

import { Handlers, PageProps } from "$fresh/server.ts";
import { getSubdomain, deleteSubdomain, addSubdomainWallet, deleteSubdomainWallet, getSubdomainWallets } from "../utils/subdomains.ts";

interface Data {
  subdomain?: string;
  wallets?: walletsWithNames[];
}

interface walletsWithNames {
  symbol: string;
  name: string;
  address: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    // get key from cookie
    const headers = req.headers;
    const cookie = headers.get("cookie");
    const key = cookie?.split("key=")[1]?.split(";")[0];

    // if key exists, get subdomain and wallets
    if (key) {
      try {
        const subdomain = await getSubdomain(key);
        const wallets = await getSubdomainWallets(subdomain);

        // get names for wallets
        const namePromises = wallets.map((wallet) => getName(wallet.symbol));
        const names = await Promise.all(namePromises);

        console.log(names);

        // add names to wallets

        const walletsWithNames = wallets.map((wallet, i) => ({ ...wallet, name: names[i] ?? "Unknown" }));


        return ctx.render({ subdomain, wallets: walletsWithNames });
      } catch (error) {
        // redirect to /login
        const headers = new Headers();
        headers.set("Location", `/login`);
        return new Response(null, {
          status: 303,
          headers,
        });
      }
    } else {
      // redirect to /login
      const headers = new Headers();
      headers.set("Location", `/login`);
      return new Response(null, {
        status: 303,
        headers,
      });
    }
 
  },
  async POST(req, ctx) {
    // get key from cookie
    const headers = req.headers;
    const cookie = headers.get("cookie");
    const key = cookie?.split("key=")[1]?.split(";")[0];

    const form = await req.formData();
    const submit = form.get("submit") as string;

    if (key) {
      try {
        const subdomain = await getSubdomain(key);
        switch (submit) {
          case "deleteSubdomain": {
            await deleteSubdomain(subdomain, key);
            return new Response(null, {
              status: 303,
              headers: {
                "Location": `/`,
              },
            });
          }
          case "createSubdomainWallet": {
            const symbol = form.get("symbol") as string;
            const address = form.get("address") as string;
            await addSubdomainWallet(subdomain, { symbol, address }, key);
            return new Response(null, {
              status: 303,
              headers: {
                "Location": `/subdomain`,
              },
            });
          }
          case "deleteSubdomainWallet": {
            const symbol = form.get("symbol") as string;
            await deleteSubdomainWallet(subdomain, symbol, key);
            return new Response(null, {
              status: 303,
              headers: {
                "Location": `/subdomain`,
              },
            });
          }
          default: {
            return new Response(null, {
              status: 303,
              headers: {
                "Location": `/`,
              },
            });
          }
          }
      } catch (error) {
        return new Response(null, {
          status: 303,
          headers: {
            "Location": `/login`,
          },
        });
      }
    } else {
      return new Response(null, {
        status: 303,
        headers: {
          "Location": `/login`,
        },
      });
    }

  }
}

export default function Subdomain({ data }: PageProps<Data>) {
  const { subdomain, wallets } = data;

  return (
    <>
      <Head>
        <title>hiphiptips - </title>
        <Style />
      </Head>
      <div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white">
        <Header subdomain={subdomain} />

      {/* Display wallets here */}

      {wallets && wallets.map((wallet) => {
        return (
          <form class="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-8" method="post">
                <input class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-center border-2 border-black hidden" type="hidden" name="symbol" value={wallet.symbol} />
                <div class="h-10 mt-8">
                  <CoinButton symbol={wallet.symbol} domain={subdomain + ".hiphiptips"} name={wallet.name} generic={wallet.name == "Unknown"} />
                  </div>
                <button class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-center h-14 border-2 border-black text-white bg-red-400 transition-transform transform-gpu hover:scale-110" type="submit" value="deleteSubdomainWallet" name="submit">delete</button>
              </form>
        )
      })}


      <form class="mx-auto w-full flex flex-col max-w-sm" method="post">
        <input class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-center border-2 border-black text-black" type="text" name="symbol" placeholder="symbol" />
        <input class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-center border-2 border-black text-black" type="text" name="address" placeholder="address" />
        <button class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-center border-2 border-black text-white bg-green-400 transition-transform transform-gpu hover:scale-110" type="submit" value="createSubdomainWallet" name="submit">create subdomain wallet</button>
      </form>

      <form class="mx-auto w-full flex flex-col max-w-sm" method="post">
        <button class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-center border-2 border-black text-white bg-red-400 transition-transform transform-gpu hover:scale-110" type="submit" value="deleteSubdomain" name="submit">delete subdomain</button>
      </form>
      </div>
    </>
  )
}