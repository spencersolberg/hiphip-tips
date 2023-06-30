import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";
import { getSubdomain } from "../utils/subdomains.ts";
import LogInForm from "../islands/LogInForm.tsx";

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
        <title>{Deno.env.get("HANDSHAKE_DOMAIN")} - login</title>
        <Style />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="/" />
        <meta name="twitter:title" content={Deno.env.get("HANDSHAKE_DOMAIN")} />
        <meta name="twitter:description" content="Easily send crypto to domain names" />
        <meta name="twitter:image" content="/favicon/apple-icon.png" />
        <meta content="#34D399" name="theme-color" />
      </Head>
      <div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white">
        <Header />
        <LogInForm />
      </div>
    </>
  )

}