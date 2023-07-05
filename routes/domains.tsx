import { Handlers, PageProps } from "$fresh/server.ts";
import { verifyToken } from "../utils/jwt.ts";
import {
	getSubdomain,
	validateDomain,
	getDomains,
	createDomain,
} from "../utils/kv.ts";

import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import ErrorBox from "../components/ErrorBox.tsx";
import DomainButton from "../components/DomainButton.tsx";
import type { Domain } from "../utils/kv.ts";

interface Data {
	subdomain?: string;
	error?: string;
	domains: Domain[];
}

export const handler: Handlers = {
	async GET(req, ctx) {
		const { headers } = req;
		const cookie = headers.get("cookie");
		const token = cookie?.split("token=")[1]?.split(";")[0];

		if (token) {
			try {
				const { uuid } = await verifyToken(token);
				const subdomain = await getSubdomain(uuid);
				const domains = await getDomains(uuid);
				return ctx.render({ subdomain, domains });
			} catch (_) {
				// redirect to /login
				return new Response(null, {
					status: 302,
					headers: {
						location: "/login",
					},
				});
			}
		} else {
			// redirect to /login
			return new Response(null, {
				status: 302,
				headers: {
					location: "/login",
				},
			});
		}
	},
	async POST(req, ctx) {
		const { headers } = req;
		const cookie = headers.get("cookie");
		const token = cookie?.split("token=")[1]?.split(";")[0];

		if (token) {
			try {
				const { uuid } = await verifyToken(token);
				const subdomain = await getSubdomain(uuid);
				let domains = await getDomains(uuid);
				try {
					const form = await req.formData();
					const domain = (form.get("domain") as string).toLowerCase();

					const newDomain = await validateDomain(domain, uuid);

					await createDomain(newDomain, uuid);

					domains = await getDomains(uuid);

					console.log({ subdomain, domain });

					return ctx.render({ subdomain, domains });
				} catch (error) {
					return ctx.render({ error: error.message, domains, subdomain });
				}
			} catch (_) {
				// redirect to /login
				return new Response(null, {
					status: 302,
					headers: {
						location: "/login",
					},
				});
			}
		} else {
			// redirect to /login
			return new Response(null, {
				status: 302,
				headers: {
					location: "/login",
				},
			});
		}
	},
};

export default function Domains({ data }: PageProps<Data>) {
	const { subdomain, error, domains } = data;
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
			<div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white min-h-screen">
				<Header subdomain={subdomain} />
				<form class="mx-auto w-full flex flex-col max-w-sm" method="post">
					<input
						class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-center border-2 border-black text-black"
						placeholder="yourdomain"
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
							Add
						</button>
					</div>
				</form>
				<div class="flex flex-col mt-8 max-w-sm mx-auto w-full">
					{domains.map((domain) => (
						<DomainButton domain={domain} />
					))}
				</div>
				<ErrorBox error={error} />
				<Footer />
			</div>
		</>
	);
}
