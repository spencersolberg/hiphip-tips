import { Head } from "$fresh/runtime.ts";
import Style from "../components/Style.tsx";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Key from "../islands/Key.tsx";
import SignUpForm from "../islands/SignUpForm.tsx";
import { JSX } from "preact";
import { useState } from "preact/hooks";

import { Handlers, PageProps } from "$fresh/server.ts";

import { createSubdomain } from "../utils/subdomains.ts";
import { startRegistration } from "@simplewebauthn/browser";

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
	const {
		// subdomain = undefined,
		key = undefined,
		error = undefined,
	} = data ?? {};
	const [subdomain, setSubdomain] = useState<string | undefined>(undefined);
	const handleChange = ({
		currentTarget,
	}: JSX.TargetedEvent<HTMLInputElement, Event>) =>
		setSubdomain(currentTarget.value);

	const signUp = async () => {
		// console.log("signing up");
		const generateResponse = await fetch(
			`/auth/generate?subdomain=${subdomain}`,
		);

		const options = await generateResponse.json();
		let registration;
		try {
			registration = await startRegistration(options);
		} catch (error) {
			console.error(error);
			throw error;
		}

		const verificationResponse = await fetch("/auth/verify", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(registration),
		});

		const verification = await verificationResponse.json();

		// console.log(verification);
	};
	return (
		<>
			<Head>
				<title>{Deno.env.get("HANDSHAKE_DOMAIN")} - signup</title>
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

				<SignUpForm>
					<>{Deno.env.get("HANDSHAKE_DOMAIN")}</>
				</SignUpForm>

				<Footer />
			</div>
		</>
	);
}
