import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";
import CoinButton from "../components/CoinButton.tsx";
import Error from "../components/Error.tsx";
import { getName } from "../utils/coins.ts";
import NewWallet from "../islands/NewWallet.tsx";
import AddPasskey from "../islands/AddPasskey.tsx";

import { Handlers, PageProps } from "$fresh/server.ts";
import { getSubdomain, deleteSubdomain, addSubdomainWallet, deleteSubdomainWallet, getSubdomainWallets, changeSubdomain, getAuthenticators, renameAuthenticator, deleteAuthenticator } from "../utils/kv.ts";
import { verifyToken } from "../utils/jwt.ts";

import type { NamedAuthenticatorDevice } from "../utils/kv.ts";
import type { Security } from "../utils/hip2.ts";

interface Data {
  subdomain?: string;
  wallets?: walletsWithNames[];
  error?: string;
  authenticators?: NamedAuthenticatorDevice[];
  currentAuthenticator?: string;
  security: Security;
}

interface walletsWithNames {
  symbol: string;
  name: string;
  address: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    // get token from cookie
    const headers = req.headers;
    const cookie = headers.get("cookie");
    const token = cookie?.split("token=")[1]?.split(";")[0];
    const security = cookie?.split("security=")[1]?.split(";")[0] as Security ?? "handshake";

    // if token exists, verify it
    if (token) {
      try {
        const { uuid, authenticatorName }= await verifyToken(token);
        const subdomain = await getSubdomain(uuid);
        const wallets = await getSubdomainWallets(subdomain);

        // get names for wallets
        const namePromises = wallets.map((wallet) => getName(wallet.symbol));
        const names = await Promise.all(namePromises);

        // add names to wallets

        const walletsWithNames = wallets.map((wallet, i) => ({ ...wallet, name: names[i] ?? "Unknown" }));

        const authenticators = await getAuthenticators(subdomain);
        
        return ctx.render({ subdomain, wallets: walletsWithNames, authenticators, currentAuthenticator: authenticatorName, security });
      } catch (error) {
        // return Response.redirect("/login");
        const headers = new Headers();
        headers.append("Location", "/login");
        return new Response(null, {
          status: 303,
          headers,
        });
      }
    } else {
      // return Response.redirect("/login");
      const headers = new Headers();
      headers.append("Location", "/login");
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
    const token = cookie?.split("token=")[1]?.split(";")[0];

    const form = await req.formData();
    const submit = form.get("submit") as string;

    if (token) {
      try {
        const { uuid } = await verifyToken(token);
        const subdomain = await getSubdomain(uuid);
        switch (submit) {
          case "deleteSubdomain": {
            await deleteSubdomain(subdomain);
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
            await addSubdomainWallet(subdomain, { symbol, address });
            return new Response(null, {
              status: 303,
              headers: {
                "Location": `/account`,
              },
            });
          }
          case "deleteSubdomainWallet": {
            const symbol = form.get("symbol") as string;
            await deleteSubdomainWallet(subdomain, symbol);
            return new Response(null, {
              status: 303,
              headers: {
                "Location": `/account`,
              },
            });
          }
          case "changeSubdomain": {
            const newSubdomain = form.get("newSubdomain") as string;
            await changeSubdomain(subdomain, newSubdomain);
            return new Response(null, {
              status: 303,
              headers: {
                "Location": `/account`,
              },
            });
          }
          case "renameAuthenticator": {
            const oldName = form.get("oldName") as string;
            const newName = form.get("newName") as string;
            await renameAuthenticator(uuid, oldName, newName);
            return new Response(null, {
              status: 303,
              headers: {
                "Location": `/account`,
              },
            });
          }
          case "deleteAuthenticator": {
            const oldName = form.get("oldName") as string;
            await deleteAuthenticator(uuid, oldName);
            return new Response(null, {
              status: 303,
              headers: {
                "Location": `/account`,
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
        let subdomain;
        try {
          const { uuid } = await verifyToken(token);
          subdomain = await getSubdomain(uuid);
        } catch (error) {
          console.error(error);
          return ctx.render({ error: error.message})
        }
        return ctx.render({ subdomain, error: error.message });
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
  const { subdomain, wallets, error, authenticators, currentAuthenticator, security } = data;

  return (
    <>
      <Head>
        <title>hiphiptips - </title>
        <Style />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="/" />
        <meta name="twitter:title" content="hiphiptips" />
        <meta name="twitter:description" content="Easily send crypto to domain names" />
        <meta name="twitter:image" content="/favicon/apple-icon.png" />
        <meta content="#34D399" name="theme-color" />
      </Head>
      <div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white">
        <Header subdomain={subdomain} />

      <Error error={error} />
      <div class="max-w-sm mx-auto w-full">

        <h1 class="text-4xl font-bold mt-8">your wallets</h1>

      </div>

      <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-8">
        {wallets?.length ? wallets.map((wallet) => {
          return (
            <form class="" method="post">
                  <input class="hidden" type="hidden" name="symbol" value={wallet.symbol} />
                    <CoinButton symbol={wallet.symbol} domain={subdomain + ".hiphiptips"} name={wallet.name} generic={wallet.name == "Unknown"} />
                  <button class="w-full text-xl  mt-2 text-center text-red-400 hover:underline hover:italic" type="submit" value="deleteSubdomainWallet" name="submit"><p>delete</p></button>
                </form>
          )
        }) : <p class="text-xl text-center mx-auto col-span-2">there's nothing here yet</p>}
      </div>

      <div class="max-w-sm mx-auto w-full">

        <h1 class="text-4xl font-bold mt-8">security options</h1>

      </div>

      <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-8">
        <form method="post" action="/security">
          <input type="hidden" name="path" value="/account" />
          <input type="hidden" name="security" value="handshake" />
          <p class="text-center text-md">most secure</p>
          <button type="submit" class={`w-full text-xl  mt-2 text-center underline hover:italic ${security === "handshake" ? "text-green-400" : "text-white"}`} value="handshake" name="submit"><p>HNS/DANE</p></button>
          {security === "handshake" && <p class="text-center text-sm">(active)</p>}
        </form>
        <form method="post" action="/security">
          <input type="hidden" name="path" value="/account" />
          <input type="hidden" name="security" value="ca" />
          <p class="text-center text-md">most compatible</p>
          <button type="submit" class={`w-full text-xl  mt-2 text-center underline hover:italic ${security === "ca" ? "text-green-400" : "text-white"}`} value="ca" name="submit"><p>ICANN/CA</p></button>
          {security === "ca" && <p class="text-center text-sm">(active)</p>}
        </form>
      </div>

      <NewWallet />

      <div class="max-w-sm mx-auto w-full">

        <h1 class="text-4xl font-bold mt-8">your account</h1>

      </div>

      <form class="mx-auto w-full flex flex-col max-w-sm" method="post">
        <label class="text-xl mt-4 -mb-6" for="newSubdomain"><p>change subdomain</p></label>
        <div class="flex mx-auto w-full max-w-sm">
          <input
            class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-right border-2 border-black text-black"
            placeholder="yoursubdomain"
            name="newSubdomain"
            autocorrect="off"
            spellcheck={false}
            autocapitalize="none"
          />
          <h2 class="mt-9 ml-2 text-2xl">.hiphiptips</h2>
        </div>
         <button class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-2 text-center border-2 border-black text-white bg-green-400 transition-transform transform-gpu hover:scale-110" type="submit" value="changeSubdomain" name="submit">change</button>
      </form>

      <div class="max-w-sm mx-auto w-full">

        <h1 class="text-4xl font-bold mt-8">passkeys</h1>
      </div>

      <div class="max-w-sm mx-auto mt-8">
      {authenticators?.map((authenticator) => {
        return (
          <form class="w-full mb-3" method="post">
            {/* <p class="text-xl text-center mx-auto col-span-2">{authenticator.name} {authenticator.name == currentAuthenticator && "(Current)" }</p> */}
            {/* <p class="text-md text-center mx-auto col-span-2 text-slate-400">{authenticator.counter} use{authenticator.counter == 1 ? "" : "s"}</p> */}
            <input class="hidden" type="hidden" name="oldName" value={authenticator.name} />
            <input type="text" class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 w-full border-2 border-black text-black" name="newName" value={authenticator.name} />
            <div class="grid grid-cols-3">
              <button class="w-full text-xl  mt-2 text-left text-green-400 hover:underline hover:italic" type="submit" value="renameAuthenticator" name="submit"><p>rename</p></button>
              <button class={`w-full text-xl  mt-2 text-center pr-2 text-red-400 hover:underline hover:italic ${authenticators.length > 1 ? "" : "hidden"}`} type="submit" value="deleteAuthenticator" name="submit"><p>delete</p></button>
              {authenticator.name == currentAuthenticator && <p class="w-full text-xl  mt-2 text-right text-slate-400">(current)</p>}
            </div>
          </form>
        )
      }
      )}
      <AddPasskey subdomain={subdomain} />
      </div>
    

      <form class="mx-auto w-full flex flex-col max-w-sm mt-2" method="post">
        <a href="/logout" class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-4 text-center border-2 border-black text-white bg-yellow-400 transition-transform transform-gpu hover:scale-110">logout</a>
        <button class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-2 text-center border-2 border-black text-white bg-red-400 transition-transform transform-gpu hover:scale-110" type="submit" value="deleteSubdomain" name="submit">delete account</button>
      </form>
      </div>
    </>
  )
}