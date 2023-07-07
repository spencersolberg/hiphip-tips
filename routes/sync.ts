import { HandlerContext } from "$fresh/server.ts";
import { isHandshake } from "../utils/hip2.ts";
import { verifyToken } from "../utils/jwt.ts";

export const handler = (req: Request, _ctx: HandlerContext): Response => {
	const { ICANN_DOMAIN, HANDSHAKE_DOMAIN } = Deno.env.toObject();
	const headers = req.headers;
	const reqURL = new URL(req.url);
	const domain = reqURL.hostname;
	const cookie = headers.get("cookie");
	const token = cookie?.split("token=")[1]?.split(";")[0];

	if (!token) {
		// redirect to /login
		const headers = new Headers();
		headers.set("Location", "/login");
		return new Response(null, {
			status: 303,
			headers,
		});
	}

	try {
		verifyToken(token);
	} catch (_error) {
		const headers = new Headers();
		const reqURL = new URL(req.url);
		const domain = reqURL.hostname;
		const secure = reqURL.protocol === "https:";
		headers.set("Location", "/login");
		headers.set(
			"Set-Cookie",
			`token=; Path=/; HttpOnly;${
				secure && " Secure;"
			} SameSite=Strict; Domain=.${domain};`,
		);
		return new Response(null, {
			status: 303,
			headers,
		});
	}

	return new Response(null, {
		status: 303,
		headers: {
			Location: `https://${
				isHandshake(domain) ? ICANN_DOMAIN : HANDSHAKE_DOMAIN
			}/auth/set-token?token=${token}`,
		},
	});
};
