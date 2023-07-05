import { Handlers, PageProps } from "$fresh/server.ts";
import { getAddress, isHandshake } from "../../utils/hip2.ts";
import type { Security } from "../../utils/hip2.ts";
import { getInfo } from "../../utils/coins.ts";
// import { getSubdomain } from "../../utils/subdomains.ts";
import { getSubdomain } from "../../utils/kv.ts";
import { verifyToken } from "../../utils/jwt.ts";

import QRCode from "../../islands/QRCode.tsx";
import { Head } from "$fresh/runtime.ts";
import Style from "../../components/Style.tsx";
import Header from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";

import Address from "../../islands/Address.tsx";
import { RouteConfig } from "$fresh/server.ts";

export const config: RouteConfig = {
	routeOverride: "/@:domain/:symbol",
};

interface WalletData {
	domain: string | null;
	symbol: string;
	address: string | undefined;
	color: string | undefined;
	coin: string | undefined;
	subdomain?: string;
	security: Security;
}

const blobToBase64 = (blob: Blob) => {
	const reader = new FileReader();
	reader.readAsDataURL(blob);
	return new Promise((resolve) => {
		reader.onloadend = () => {
			resolve(reader.result);
		};
	});
};

export const handler: Handlers<WalletData> = {
	async GET(req, ctx) {
		// get token from cookie
		const headers = req.headers;
		const cookie = headers.get("cookie");
		const token = cookie?.split("token=")[1]?.split(";")[0];
		const security: Security =
			(cookie?.split("security=")[1]?.split(";")[0] as Security) ?? "handshake";

		const { domain, symbol } = ctx.params;

		if (isHandshake(domain) && security !== "handshake" && !token) {
			const headers = new Headers();
			const reqURL = new URL(req.url);
			const hostname = reqURL.hostname;
			const secure = reqURL.protocol === "https:";

			headers.set("Location", `/@${domain}`);
			headers.set(
				"Set-Cookie",
				`security=handshake; Path=/; HttpOnly;${
					secure && " Secure;"
				} SameSite=Strict; Domain=.${hostname};`,
			);
			return new Response(null, {
				status: 303,
				headers,
			});
		}
		const address = await getAddress(domain, symbol, security);

		const info = await getInfo(symbol);
		const color = info?.color;
		const coin = info?.name;

		// if token exists, verify it
		if (token) {
			try {
				const { uuid } = await verifyToken(token);
				const subdomain = await getSubdomain(uuid);

				return ctx.render({
					subdomain,
					domain,
					symbol,
					address,
					color,
					coin,
					security,
				});
			} catch (error) {
				console.error(error);
				return ctx.render({ domain, symbol, address, color, coin, security });
			}
		} else {
			return ctx.render({ domain, symbol, address, color, coin, security });
		}
	},
};

export default function Name({ data }: PageProps<WalletData>) {
	const twitterDescription = `Send ${data.coin} (${data.symbol}) to ${data.domain}/`;
	const { security } = data;

	return (
		<>
			<Head>
				<title>
					{data.symbol} | {data.domain} | {Deno.env.get("HANDSHAKE_DOMAIN")}
				</title>
				<Style />
				<meta name="twitter:card" content="summary" />
				<meta name="twitter:url" content={`/@${data.domain}/${data.symbol}`} />
				<meta
					name="twitter:title"
					content={`${data.symbol} | ${data.domain}/ | ${Deno.env.get(
						"HANDSHAKE_DOMAIN",
					)}`}
				/>
				<meta name="twitter:description" content={twitterDescription} />
				<meta
					name="twitter:image"
					content={`/api/v1/domains/${data.domain}/symbols/${data.symbol}/qrcode`}
				/>
				<meta content="#34D399" name="theme-color" />
			</Head>
			<div class="p-4 mx-auto flex max-w-screen-xl flex-col text-white min-h-screen">
				<Header subdomain={data.subdomain} />
				<a href={`/@${data.domain}`} class="text-2xl font-bold mx-auto mt-8">
					{data.domain}
				</a>
				{data.address ? (
					<>
						<h3 class="mx-auto text-3xl mt-8 font-medium">
							{data.coin} {`(${data.symbol})`}
						</h3>
						<div class="mx-auto mt-4 transition-transform transform-gpu hover:scale-110">
							<QRCode
								symbol={data.symbol}
								address={data.address ?? "hello world"}
								color={data.color ?? "#000000"}
								domain={data.domain ?? ""}
							/>
						</div>
						<Address address={data.address ?? "hello world"} />
					</>
				) : (
					<>
						<h3 class="mx-auto text-3xl mt-8 font-medium">No address found</h3>
						{security === "handshake" ? (
							<form method="POST" class="mx-auto" action="/security">
								<input
									type="hidden"
									name="path"
									value={`/@${data.domain}/${data.symbol}`}
								/>
								<input type="hidden" name="security" value="ca" />
								<button
									type="submit"
									class="mx-auto text-center text-lg mt-8 underline hover:italic"
								>
									<p>try with CA security (less secure)</p>
								</button>
							</form>
						) : null}
					</>
				)}

				<Footer />
			</div>
		</>
	);
}
