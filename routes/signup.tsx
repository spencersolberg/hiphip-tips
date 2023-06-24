import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";

import { Handlers, PageProps } from "$fresh/server.ts";

import { createSubdomain } from "../utils/subdomains.ts";

interface Data {
  subdomain?: string;
  key?: string;
  error?: string;
}

export const handler: Handlers = {
  async GET(_, ctx) {
    return await ctx.render();
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const subdomain = form.get("subdomain") as string;
    if (subdomain) {
      try {
        const key = await createSubdomain(subdomain);
        return ctx.render({ subdomain, key });
      } catch (error) {
        return ctx.render({ subdomain, error: error.message });
      }
    }
    return ctx.render();
    // return await ctx.render();
    
  },
};

export default function SignUp({ data }: PageProps<Data>) {
  const { subdomain = undefined, key = undefined, error = undefined } = data ?? {};
  return (
    <>
      <Head>
        <title>hiphiptips - signup</title>
        <Style />
      </Head>
      <div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white">
        <Header />
        {!subdomain ?
        <form class="mx-auto w-full flex flex-col max-w-sm" method="post">

          <div class="flex mx-auto w-full max-w-sm">

          <input
            class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-right border-2 border-black text-black"
            placeholder="yoursubdomain"
            name="subdomain"
            autocorrect="off"
            spellcheck={false}
            autocapitalize="none"
          />
          <h2 class="mt-9 ml-2 text-2xl">.hiphiptips</h2>

          </div>

          <div class="max-w-sm mx-auto px-2">
            <button
              class="rounded-md w-full text-3xl px-4 pb-1 pt-0.5 text-center border-2 border-black mt-4 bg-green-400 transition-transform transform-gpu md:motion-safe:hover:scale-110"
              type="submit"
            >
              sign up
            </button>
          </div>
        </form>
        : error ?
        <div class="mx-auto w-full flex flex-col max-w-sm">
          <h2 class="text-2xl text-center mt-8">error registering {subdomain}.hiphiptips:</h2>
          <p class="text-lg dark:text-white text-center mt-4 break-all max-w-3xl mx-auto">
            {error}
          </p>
        </div>
        :
        <div class="mx-auto w-full flex flex-col max-w-sm">
          <h2 class="text-2xl text-center mt-8">Your subdomain is:</h2>
          <h1 class="text-6xl md:text-8xl dark:text-white text-center mt-4 break-all max-w-3xl mx-auto">
            {subdomain}.hiphiptips
          </h1>
          <h2 class="text-2xl text-center mt-8">Your key is:</h2>
          <h1 class="text-6xl md:text-8xl dark:text-white text-center mt-4 break-all max-w-3xl mx-auto">
            {key}
          </h1>
          <h2 class="text-2xl text-center mt-8">Save this key somewhere safe!</h2>
          <h2 class="text-2xl text-center mt-8">You will need it to login.</h2>
      </div>
        }
      </div>
    </>
  );
}