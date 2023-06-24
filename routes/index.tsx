import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";

import { Handlers, PageProps } from "$fresh/server.ts";
import { getSubdomain } from "../utils/subdomains.ts";

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
  async POST(req, ctx) {
    const form = await req.formData();
    const domain = form.get("domain");
    if (domain) {
      const headers = new Headers();
      headers.set("Location", `/${domain}`);
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
        <title>hiphiptips</title>
        <Style />
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
