import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";

import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_, ctx) {
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

export default function Home() {
  return (
    <>
      <Head>
        <title>hiphiptips</title>
        <Style />
      </Head>
      <div class="p-4 mx-auto max-w-screen-md flex flex-col text-white">
        <div class="flex mt-16">
          {/* <a href="http://about.hiphiptips:8000/" class="text-2xl font-bold mx-auto">About</a> */}
          <h1 class="text-6xl md:text-8xl dark:text-white text-center mt-4 break-all max-w-3xl mx-auto">
            hiphiptips
          </h1>
          {/* <a href="http://login.hiphiptips/" class="text-2xl font-bold mx-auto">Login</a> */}
        </div>
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
