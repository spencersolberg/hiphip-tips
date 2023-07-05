import { HandlerContext } from "$fresh/server.ts";

export const handler = (req: Request, _ctx: HandlerContext): Response => {
	const headers = new Headers();
	const reqURL = new URL(req.url);
	const domain = reqURL.hostname;
	const secure = reqURL.protocol === "https:";

	headers.set("Location", "/");
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
};
