import { isHandshake } from "./hip2.ts"

export const generateCaddyfile = async (domain: string): Promise<void> => {
  const { ICANN_DOMAIN, HANDSHAKE_DOMAIN } = Deno.env.toObject();
  const cwd = Deno.cwd();
  const siteDomain = isHandshake(domain) ? HANDSHAKE_DOMAIN : ICANN_DOMAIN;
  if (!isHandshake(domain)) throw new Error("Only handshake domains are supported for now");
  const caddyfile = `
  ${domain} {
    tls ${cwd}/certificates/${domain}.crt ${cwd}/certificates/${domain}.key
    route {
      reverse_proxy /.well-known/* localhost:8001
      redir * https://{$SITE_DOMAIN:${siteDomain}}{uri}
    }
  }
  `;

  try {
    await Deno.mkdir("caddyfiles");
  } catch (err) {
    if (err.name !== "AlreadyExists") throw err;
  }

  await Deno.writeTextFile(`caddyfiles/${domain}.caddyfile`, caddyfile);
}

export const deleteCaddyfile = async (domain: string): Promise<void> => {
  try {
    await Deno.remove(`caddyfiles/${domain}.caddyfile`);
  } catch (err) {
    console.error(err);
  }
}