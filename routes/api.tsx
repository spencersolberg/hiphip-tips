import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

// import { getSubdomain } from "../utils/subdomains.ts";
import { getSubdomain } from "../utils/kv.ts";
import { verifyToken } from "../utils/jwt.ts";

import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
  subdomain?: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    // get token from cookie
    const headers = req.headers;
    const cookie = headers.get("cookie");
    const token = cookie?.split("token=")[1]?.split(";")[0];

    // if token exists, verify it
    if (token) {
      try {
        const { uuid } = await verifyToken(token);
        const subdomain = await getSubdomain(uuid);
        return ctx.render({ subdomain });
      } catch (error) {
        return ctx.render();
      }
    } else {
      return ctx.render();
    }
  },
};

export default function About({ data }: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>about | {Deno.env.get("HANDSHAKE_DOMAIN")}</title>
        <Style />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="/" />
        <meta name="twitter:title" content={Deno.env.get("HANDSHAKE_DOMAIN")} />
        <meta
          name="twitter:description"
          content="Easily send crypto to domain names"
        />
        <meta name="twitter:image" content="/favicon/apple-icon.png" />
        <meta content="#34D399" name="theme-color" />
      </Head>
      <div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white min-h-screen">
        <Header subdomain={data?.subdomain} />
        <div class="flex flex-col max-w-sm md:max-w-md lg:max-w-lg mx-auto mt-4">
          <h1 class="text-5xl font-bold">api</h1>
          <p class="text-xl mt-4">
            {Deno.env.get("HANDSHAKE_DOMAIN")}{" "}
            offers a free API for GETting information about HIP-0002 domains
          </p>
          <h2 class="text-4xl mt-4 mb-2">
            Endpoints
          </h2>
          <hr />
          <h2 class="text-3xl mt-4 font-bold">
            Symbols
          </h2>
          <p class="text-lg mt-4 font-bold md:break-normal">
            /api/v1/domains/{"{domain}"}/symbols
          </p>
          <p class="text-lg mt-2">GET</p>
          <p class="text-xl mt-4">
            returns a list of{" "}
            <a
              class="underline hover:italic"
              href="https://github.com/handshake-org/HIPs/issues/43"
            >
              available symbols
            </a>{" "}
            for the given domain
          </p>
          <h3 class="text-2xl mt-4 font-bold">
            Example
          </h3>
          <p class="text-xl mt-4 break-all md:break-normal">
            <a
              class="underline hover:italic"
              href="/api/v1/domains/spencersolberg/symbols"
            >
              /api/v1/domains/spencersolberg/symbols
            </a>{" "}
            {`=> {"symbols":["HNS","BTC"]}`}
          </p>
          <h2 class="text-3xl mt-4 font-bold">
            Address
          </h2>
          <p class="text-lg mt-4 font-bold break-all md:break-normal">
            /api/v1/domains/{"{domain}"}/symbols/{"{symbol}"}
          </p>
          <p class="text-lg mt-2">GET</p>

          <p class="text-xl mt-4">
            returns the address (if any) for the given domain and symbol
          </p>
          <h3 class="text-2xl mt-4 font-bold">
            Example
          </h3>
          <p class="text-xl mt-4 break-all md:break-normal">
            <a
              class="underline hover:italic"
              href="/api/v1/domains/spencersolberg/symbols/HNS"
            >
              /api/v1/domains/spencersolberg/symbols/HNS
            </a>{" "}
            {`=> {"address":"hs1...."}`}
          </p>
          <h2 class="text-3xl mt-4 font-bold">
            QR Code
          </h2>
          <p class="text-lg mt-4 font-bold break-all md:break-normal">
            /api/v1/domains/{"{domain}"}/symbols/{"{symbol}"}/qrcode
          </p>
          <p class="text-lg mt-2">GET</p>
          <p class="text-xl mt-4">
            this endpoint generates a QR code for the given domain and symbol
          </p>
          <p class="text-xl mt-4">
            the QR code is returned directly as an image
          </p>
          <h3 class="text-2xl mt-4 font-bold">
            Example
          </h3>
          <p class="text-xl mt-4 break-all md:break-normal">
            <a
              class="underline hover:italic"
              href="/api/v1/domains/spencersolberg/symbols/HNS/qrcode"
            >
              /api/v1/domains/spencersolberg/symbols/HNS/qrcode
            </a>
          </p>
          <h2 class="text-4xl mt-4 mb-2">
            Options
          </h2>
          <hr />
          <h2 class="text-3xl mt-4 font-bold">
            Security
          </h2>
          <p class="text-lg mt-4 font-bold md:break-normal">
            /api/v1/{"{endpoint}"}?security={"{handshake | ca}"}
          </p>
          <p class="text-lg mt-2">GET</p>
          <p class="text-xl mt-4">
            allows you to specify the security model used to verify TLS
          </p>
          <p class="text-xl mt-4">
            "handshake" (default) is the most secure
          </p>
          <p class="text-xl mt-4">
            "ca" is the most compatible
          </p>
          <h3 class="text-2xl mt-4 font-bold">
            Example
          </h3>
          <p class="text-xl mt-4 break-all md:break-normal">
            <a
              class="underline hover:italic"
              href="/api/v1/domains/spencersolberg.com/symbols/HNS?security=ca"
            >
              /api/v1/domains/spencersolberg.com/symbols/HNS?security=ca
            </a>{" "}
            {`=> {"address":"hs1...."}`}
          </p>
        </div>
        <Footer />
      </div>
    </>
  );
}
