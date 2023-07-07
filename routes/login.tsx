import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import { getSubdomain } from "../utils/subdomains.ts";
import LogInForm from "../islands/LogInForm.tsx";
import { isHandshake } from "../utils/hip2.ts";

import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
	error?: string;
	handshake: boolean;
}

export const handler: Handlers = {
	async GET(req, ctx) {
		const url = new URL(req.url);
		const domain = url.hostname;
		const handshake = isHandshake(domain);
		return await ctx.render({ handshake });
	},
};

export default function Login({ data }: PageProps<Data>) {
	const { error, handshake } = data ?? {};
	const { HANDSHAKE_DOMAIN, ICANN_DOMAIN } = Deno.env.toObject();
	return (
		<>
			<Head>
				<title>{Deno.env.get("HANDSHAKE_DOMAIN")} - login</title>
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
				<Header />
				<LogInForm>
					<>{HANDSHAKE_DOMAIN}</>
				</LogInForm>
				<a
					href={
						handshake
							? `https://${ICANN_DOMAIN}/sync`
							: `https://${HANDSHAKE_DOMAIN}/sync`
					}
					class="text-center text-xl mt-4 hover:underline hover:italic"
				>
					<p>
						alreay signed in on {handshake ? ICANN_DOMAIN : HANDSHAKE_DOMAIN}?
						<p>click here to sync</p>
					</p>
				</a>
				<Footer />
			</div>
		</>
	);
}
