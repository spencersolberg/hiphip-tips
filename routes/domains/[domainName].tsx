import { Handlers, PageProps } from "$fresh/server.ts";
import { verifyToken } from "../../utils/jwt.ts";
import {
	getDomain,
	getSubdomain,
	removeDomain,
	verifyDomainWithSignature,
	confirmDomainSetup,
} from "../../utils/kv.ts";
import { getRecords, compareRecords } from "../../utils/dns.ts";

import { Head } from "$fresh/runtime.ts";
import Style from "../../components/Style.tsx";
import Header from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";
import Error from "../../components/Error.tsx";
import Message from "../../islands/Message.tsx";
import VerifySignatureForm from "../../islands/VerifySignatureForm.tsx";
import type { Domain } from "../../utils/kv.ts";

interface Data {
	domain: Domain;
	subdomain: string;
	error?: string;
}

export const handler: Handlers = {
	async GET(req, ctx) {
		const { headers } = req;
		const cookie = headers.get("cookie");
		const token = cookie?.split("token=")[1]?.split(";")[0];

		if (!token) {
			return new Response(null, {
				status: 302,
				headers: {
					location: "/login",
				},
			});
		}

		try {
			const { uuid } = await verifyToken(token);
			const subdomain = await getSubdomain(uuid);

			try {
				const { domainName } = ctx.params;

				const domain = await getDomain(uuid, domainName.toLowerCase());

				return ctx.render({ domain, subdomain });
			} catch (_) {
				return new Response(null, {
					status: 302,
					headers: {
						location: "/domains",
					},
				});
			}
		} catch (_) {
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

		if (!token) {
			return new Response(null, {
				status: 302,
				headers: {
					location: "/login",
				},
			});
		}

		try {
			const { uuid } = await verifyToken(token);
			const subdomain = await getSubdomain(uuid);

			try {
				const { domainName } = ctx.params;
				const domain = await getDomain(uuid, domainName.toLowerCase());

				try {
					const form = await req.formData();
					const submit = form.get("submit") as string;

					switch (submit) {
						case "verifySignature": {
							const signature = form.get("signature") as string;

							if (!signature) {
								return ctx.render({
									domain,
									subdomain,
									error: "signature required",
								});
							}

							const verifiedDomain = await verifyDomainWithSignature(
								uuid,
								domainName.toLowerCase(),
								signature,
							);

							return ctx.render({ subdomain, domain: verifiedDomain });
						}
						case "removeDomain": {
							await removeDomain(uuid, domainName.toLowerCase());

							return new Response(null, {
								status: 302,
								headers: {
									location: "/domains",
								},
							});
						}
						case "checkDomain": {
							if (!domain.setupRecords) {
								return ctx.render({
									subdomain,
									domain,
									error: "no setup records",
								});
							}
							const currentRecords = await getRecords(domainName);

							if (!compareRecords(domain.setupRecords, currentRecords)) {
								return ctx.render({
									subdomain,
									domain,
									error: `records do not match: ${JSON.stringify(
										currentRecords,
										undefined,
										4,
									)}`,
								});
							}

							try {
								await confirmDomainSetup(uuid, domainName.toLowerCase());
							} catch (err) {
								return ctx.render({ subdomain, domain, error: err.message });
							}

							return ctx.render({ subdomain, domain });
						}
						default: {
							return ctx.render({ subdomain, domain });
						}
					}
				} catch (err) {
					return ctx.render({ subdomain, domain, error: err.message });
				}
			} catch (_) {
				return new Response(null, {
					status: 302,
					headers: {
						location: "/domains",
					},
				});
			}
		} catch (_) {
			return new Response(null, {
				status: 302,
				headers: {
					location: "/login",
				},
			});
		}
	},
};

export default function DomainName({ data }: PageProps<Data>) {
	const { domain, subdomain, error } = data;

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
				<div class="flex flex-col max-w-sm md:max-w-md lg:max-w-lg mx-auto mt-4">
					<h2 class="text-2xl font-bold">
						<a href="/domains">domains</a>
					</h2>
					<h1 class="text-4xl font-bold">{domain.name}/</h1>
					<p>{domain.verified ? "✅ verified" : "❌ unverified"}</p>

					<Error error={error} />
					{!domain.verified && domain.signable && (
						<>
							<h2 class="text-3xl font-bold mt-4">verification - signature</h2>
							<p>
								you can verify this domain by signing the following message with
								name {domain.name}/
							</p>
							<Message message={domain.message} />
							<VerifySignatureForm
								name={domain.name}
								message={domain.message}
							/>
						</>
					)}
					{domain.verified && !domain.setup && domain.setupRecords && (
						<>
							<h2 class="text-3xl font-bold mt-4">setup</h2>
							<p>
								you can setup this domain by adding the following records to
								your handshake domain
							</p>
							<table>
								<thead>
									<tr>
										{/* <th>name</th> */}
										<th>type</th>
										<th>data</th>
									</tr>
								</thead>
								<tbody>
									{domain.setupRecords.map((record) => (
										<tr class="border-1 border-white">
											{/* <td class="border-1 border-white px-2 w-16">
                        <p class="text-center">@</p>
                      </td> */}
											<td class="border-1 border-white px-2 w-16">
												<p class="text-center">{record.type}</p>
											</td>
											<td class="break-all border-1 border-white px-2">
												<p class="text-center">{record.data}</p>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							<form method="post">
								<button
									class="w-full max-w-domain text-xl mt-4 text-center underline hover:italic"
									type="submit"
									value="checkDomain"
									name="submit"
								>
									<p>check records now</p>
								</button>
							</form>
						</>
					)}
					{domain.verified && domain.setup && (
						<>
							<h2 class="text-3xl font-bold mt-4">setup</h2>
							<p>your domain is configured correctly</p>
							<p>
								check it out at{" "}
								<a
									href={`https://${domain.name}`}
									class="underline hover:italic"
								>
									https://{domain.name}/
								</a>
							</p>
						</>
					)}
					<form method="post">
						<button
							class="w-full max-w-domain text-xl mt-4 text-center text-red-400 hover:underline hover:italic"
							type="submit"
							value="removeDomain"
							name="submit"
						>
							<p>remove domain</p>
						</button>
					</form>
				</div>
				<Footer />
			</div>
		</>
	);
}
