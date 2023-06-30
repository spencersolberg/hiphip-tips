import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";

import { Handlers, PageProps } from "$fresh/server.ts";
// import { getSubdomain } from "../utils/subdomains.ts";
import { getSubdomain } from "../utils/kv.ts";
import { verifyToken } from "../utils/jwt.ts";

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
  async POST(req, ctx) {
    const form = await req.formData();
    const domain = form.get("domain");
    if (domain) {
      const headers = new Headers();
      headers.set("Location", `/@${domain}`);
      return new Response(null, {
        status: 303,
        headers,
      });
    }
    return ctx.render();
  },
};

export default function Home({ data }: PageProps<Data>) {
  const { subdomain } = data ?? {};
  return (
    <>
      <Head>
        <title>{Deno.env.get("HANDSHAKE_DOMAIN")}</title>
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
      <div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white">
        <Header subdomain={subdomain} />
        <form class="mx-auto w-full flex flex-col max-w-sm" method="post">
          <input
            class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-center border-2 border-black text-black"
            placeholder="enter domain"
            name="domain"
            autocorrect="off"
            spellcheck={false}
            autocapitalize="none"
          />
          <div class="max-w-sm mx-auto px-2">
            <button
              class="rounded-md w-full text-3xl px-4 pb-1 pt-0.5 text-center border-2 border-black mt-4 bg-green-400 transition-transform transform-gpu md:motion-safe:hover:scale-110"
              type="submit"
            >
              Go
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
