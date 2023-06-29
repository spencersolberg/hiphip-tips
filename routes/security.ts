import { HandlerContext } from "$fresh/server.ts";
import type { Security } from "../utils/hip2.ts";


export const handler = async (req: Request, _ctx: HandlerContext): Promise<Response> => {
  const headers = new Headers();
  const reqURL = new URL(req.url);
  const domain = reqURL.hostname;
  const secure = reqURL.protocol === "https:";

  const form = await req.formData();
  const security = form.get("security") as Security;
  const path = form.get("path") as string;

  headers.set("Location", path);
  headers.set("Set-Cookie", `security=${security}; Path=/; HttpOnly;${secure && " Secure;"} SameSite=Strict; Domain=.${domain};`);
  return new Response(null, {
    status: 303,
    headers,
  });

}