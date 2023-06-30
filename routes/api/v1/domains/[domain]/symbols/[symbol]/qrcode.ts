import { imageSync } from "qr_image_color";

import { constructURL, getColor } from "../../../../../../../utils/coins.ts";
import { getAddress } from "../../../../../../../utils/hip2.ts";

import { HandlerContext } from "$fresh/server.ts";
import type { Security } from "../../../../../../../utils/hip2.ts";

export const handler = async (
  req: Request,
  ctx: HandlerContext,
): Promise<Response> => {
  const reqUrl = new URL(req.url);
  const security: Security = reqUrl.searchParams.get("security") as Security ??
    "handshake";

  const { domain, symbol } = ctx.params;
  const address = await getAddress(domain, symbol, security);

  if (!address) {
    return new Response("Not found", { status: 404 });
  }

  const url = constructURL(symbol, address);
  const color = getColor(symbol);

  const qr = await imageSync(url, { color, size: 20, margin: 2 }) as Uint8Array;
  const body = qr.buffer;

  // const base64 = await qrcode(url) as unknown as string;
  // const stripped = base64.replace("data:image/gif;base64,", "");
  // // convert to actual image
  // const binaryData = Uint8Array.from(atob(stripped), (c) => c.charCodeAt(0));
  // const body = binaryData.buffer;

  return new Response(body, {
    headers: {
      "Content-Type": "image/gif",
    },
  });
};
