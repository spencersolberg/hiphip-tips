import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";
import { getSubdomain } from "../utils/subdomains.ts";

import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
  error?: string;
}

export const handler: Handlers = {
  async GET(_, ctx) {
    return await ctx.render();
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const key = form.get("key") as string;
    if (key) {
      try {
        const subdomain = await getSubdomain(key);
        const reqURL = new URL(req.url);
        const domain = reqURL.hostname;
        const headers = new Headers();
        headers.set("Location", `/`);
        headers.set("Set-Cookie", `key=${key}; Path=/; HttpOnly; Secure; SameSite=Strict; Domain=.${domain};`);
        return new Response(null, {
          status: 303,
          headers,
        });
      } catch (error) {
        return ctx.render({ error: error.message });
      }

    }
    return ctx.render();

  }
}

export default function Login({ data }: PageProps<Data>) {
  const { error } = data ?? {};
  return (
    <>
      <Head>
        <title>hiphiptips - login</title>
        <Style />
      </Head>
      <div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white">
        <Header />


        <form class="mx-auto w-full flex flex-col max-w-sm" method="post">
          <input
            class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-center border-2 border-black text-black"
            placeholder="your super secret key"
            name="key"
            autocorrect="off"
            type="password"
          />
          <div class="max-w-sm mx-auto px-2">
            <button
              class="rounded-md w-full text-3xl px-4 pb-1 pt-0.5 text-center border-2 border-black mt-4 bg-green-400 transition-transform transform-gpu md:motion-safe:hover:scale-110"
              type="submit"
            >
              log in
            </button>
          </div>
        </form>
        {error && <div class="max-w-sm mx-auto">
        <h2 class="text-2xl text-red-500">error logging in</h2>
        <p class="text-center text-red-500 mt-4">{error}</p>
        </div>}
        <p class="text-center text-2xl mt-8">no account?</p>
        <a class="text-center text-2xl hover:italic hover:underline mt-2" href="/signup"><p>sign up</p></a>
      </div>
    </>
  )

}