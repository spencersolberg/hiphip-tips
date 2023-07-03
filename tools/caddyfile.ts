import "$std/dotenv/load.ts";
import { exists } from "$std/fs/mod.ts";

const { ICANN_DOMAIN, HANDSHAKE_DOMAIN, PUBLIC_ICANN_CERT_PATH, PRIVATE_ICANN_KEY_PATH, PUBLIC_HANDSHAKE_CERT_PATH, PRIVATE_HANDSHAKE_KEY_PATH, PORT } = Deno.env.toObject();

if (!(await exists(".Caddyfile"))) {
  const config = `
  import caddyfiles/*.caddyfile

  ${ICANN_DOMAIN} {
    tls ${PUBLIC_ICANN_CERT_PATH} ${PRIVATE_ICANN_KEY_PATH}
    reverse_proxy localhost:8001
  }

  *.${ICANN_DOMAIN} {
    tls ${PUBLIC_ICANN_CERT_PATH} ${PRIVATE_ICANN_KEY_PATH}
    route {
      reverse_proxy /.well-known/* localhost:${PORT}
      redir * https://${ICANN_DOMAIN}/@{labels.2}.${ICANN_DOMAIN}
    }
  }
  
  ${HANDSHAKE_DOMAIN} {
    tls ${PUBLIC_HANDSHAKE_CERT_PATH} ${PRIVATE_HANDSHAKE_KEY_PATH}
    reverse_proxy localhost:8001
  }

  *.${HANDSHAKE_DOMAIN} {
    tls ${PUBLIC_HANDSHAKE_CERT_PATH} ${PRIVATE_HANDSHAKE_KEY_PATH}
    route {
      reverse_proxy /.well-known/* localhost:${PORT}
      redir * https://${HANDSHAKE_DOMAIN}/@{labels.2}.${HANDSHAKE_DOMAIN}
    }
  }
  `;

  await Deno.writeTextFile("./.Caddyfile", config);
}
