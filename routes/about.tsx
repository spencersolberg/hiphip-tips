import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";

import { getSubdomain } from "../utils/subdomains.ts";

import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
  subdomain?: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    // get key from cookie
    const headers = req.headers;
    const cookie = headers.get("cookie");
    const key = cookie?.split("key=")[1]?.split(";")[0];

    // if key exists, get subdomain
    if (key) {
      try {
        const subdomain = await getSubdomain(key);
        return ctx.render({ subdomain });
      } catch (error) {
        return ctx.render();
      }
    }
    return await ctx.render();
  },
};

export default function About({ data }: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>about | hiphiptips</title>
        <Style />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="/" />
        <meta name="twitter:title" content="hiphiptips" />
        <meta
          name="twitter:description"
          content="Easily send crypto to domain names"
        />
        <meta name="twitter:image" content="/favicon/apple-icon.png" />
        <meta content="#34D399" name="theme-color" />
      </Head>
      <div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white">
        <Header subdomain={data?.subdomain} />
        <div class="flex flex-col max-w-sm mx-auto">
          <h1 class="text-4xl font-bold">about</h1>
          <p class="text-xl mt-4">
            hiphiptips is the easiest way to get started with{" "}
            <a class="underline hover:italic" href="https://github.com/handshake-org/HIPs/blob/master/HIP-0002.md">
              HIP-0002
            </a>, a simple protocol for aliasing wallet addresses with domain
            names.
          </p>
          <p class="text-xl mt-4">
            hiphiptips supports <a class="underline hover:italic" href="https://handshake.org">Handshake</a>
            {" "}
            domains secured through the{" "}
            <a class="underline hover:italic" href="https://en.wikipedia.org/wiki/DNS-based_Authentication_of_Named_Entities">
              DANE TLS
            </a>{" "}
            protocol.
          </p>
          <p class="text-xl mt-4">
            in addition to the standard HIP-0002 specification, hiphiptips
            utilizes an experimental <a class="underline hover:italic" href="https://github.com/handshake-org/HIPs/issues/43">available addresses endpoint</a> proposal
          </p>
          <p class="text-xl mt-4">
            users can provision their own HIP-0002 compliant, DANE secured subdomains by <a class="underline hover:italic" href="/signup">signing up</a> for hiphiptips
          </p>
          <p class="text-xl mt-4">
            hiphiptips is open source and available on <a class="underline hover:italic" href="https://github.com/spencersolberg/hiphip-tips">GitHub</a>
          </p>
        </div>
      </div>
    </>
  );
}
