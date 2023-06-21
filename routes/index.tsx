import { Head } from "$fresh/runtime.ts";

import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_, ctx) {
    return await ctx.render();
  },
  async POST(req, ctx) {
    console.log("POST")
    const form = await req.formData();
    const domain = form.get("domain");
    console.log(domain)
    if (domain) {
      const headers = new Headers();
      headers.set("Location", `/${domain}`);
      return new Response(null, {
        status: 303,
        headers
      });
    }
    return ctx.render();
  }
}


export default function Home() {
  return (
    <>
      <Head>
        <title>HipHipTips</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md flex flex-col">
        <div class="flex mt-16">
          <h1 class="text-4xl font-bold mx-auto">HipHipTips</h1>
        </div>
        <form class="mx-auto w-full flex flex-col" method="post">
          <input class="rounded-md border px-2 py-1 mt-8 w-full text-2xl" placeholder="Enter domain" name="domain"/>
          <button class="rounded-md border border-white px-2 py-1 mt-8 mx-auto text-2xl bg-green-300 transition-transform transform-gpu hover:scale-110 text-black" type="submit">Tip</button>
        </form>
      </div>
    </>
  );
}
