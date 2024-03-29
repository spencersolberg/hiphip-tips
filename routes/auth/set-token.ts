import { HandlerContext } from "$fresh/server.ts";
import { verifyToken } from "../../utils/jwt.ts";

export const handler = async (
	req: Request,
	_ctx: HandlerContext,
): Promise<Response> => {
	const url = new URL(req.url);
	const token = url.searchParams.get("token");

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
		await verifyToken(token);
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

	const headers = new Headers();
	const reqURL = new URL(req.url);
	const domain = reqURL.hostname;
	const secure = reqURL.protocol === "https:";
	headers.set("Location", "/");
	headers.set(
		"Set-Cookie",
		`token=${token}; Path=/; HttpOnly;${
			secure && " Secure;"
		} SameSite=Strict; Domain=.${domain};`,
	);
	return new Response(null, {
		status: 303,
		headers,
	});
};
