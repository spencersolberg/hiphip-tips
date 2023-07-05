export default function HandshakeDomain() {
	return <>{Deno.env.get("HANDSHAKE_DOMAIN")}</>;
}
