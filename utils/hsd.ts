import { NodeClient } from "https://esm.sh/hs-client@0.0.13";
// import { NodeClient } from "npm:hs-client";

const port = parseInt(Deno.env.get("HSD_PORT") ?? "12037");
const host = Deno.env.get("HSD_HOST") ?? "127.0.0.1";
const apiKey = Deno.env.get("HSD_API_KEY") ?? null;

const client = new NodeClient({
	port,
	host,
	apiKey,
});

export const verifyMessage = async (
	name: string,
	message: string,
	signature: string,
): Promise<boolean> => {
	return await client.execute("verifymessagewithname", [
		name,
		signature,
		message,
	]);
};
