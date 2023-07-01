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
          <h1 class="text-4xl font-bold">about</h1>
          <p class="text-xl mt-4">
          {Deno.env.get("HANDSHAKE_DOMAIN")} is the easiest way to get started with{" "}
            <a class="underline hover:italic" href="https://github.com/handshake-org/HIPs/blob/master/HIP-0002.md">
              HIP-0002
            </a>, a simple protocol for aliasing wallet addresses with domain
            names
          </p>
          <p class="text-xl mt-4">
          {Deno.env.get("HANDSHAKE_DOMAIN")} supports <a class="underline hover:italic" href="https://handshake.org">Handshake</a>
            {" "}
            domains secured through the{" "}
            <a class="underline hover:italic" href="https://en.wikipedia.org/wiki/DNS-based_Authentication_of_Named_Entities">
              DANE TLS
            </a>{" "}
            protocol
          </p>
          <p class="text-xl mt-4">
            in addition to the standard HIP-0002 specification, {Deno.env.get("HANDSHAKE_DOMAIN")}
            {" "}utilizes an experimental <a class="underline hover:italic" href="https://github.com/handshake-org/HIPs/issues/43">available addresses endpoint</a> proposal
          </p>
          <p class="text-xl mt-4">
            users can provision their own HIP-0002 compliant, DANE secured subdomains by <a class="underline hover:italic" href="/signup">signing up</a> for {Deno.env.get("HANDSHAKE_DOMAIN")}
          </p>
          <p class="text-xl mt-4">
            {Deno.env.get("HANDSHAKE_DOMAIN")} offers a <a href="/api" class="underline hover:italic">REST API</a> for developers to integrate with
          </p>
          <p class="text-xl mt-4">
          {Deno.env.get("HANDSHAKE_DOMAIN")} is open source and available on <a class="underline hover:italic" href="https://github.com/spencersolberg/hiphip-tips">GitHub</a>
          </p>
        </div>
        <Footer />
      </div>
    </>
  );
}
