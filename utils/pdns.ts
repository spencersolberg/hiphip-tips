import { isHandshake } from "./hip2.ts";
import type { DNSRecord } from "./kv.ts";
import { generateCertificate, generateTlsaRecord, deleteCertificate } from "./certificates.ts";
import { generateCaddyfile, deleteCaddyfile } from "./caddyfiles.ts";

const { PDNS_URL, PDNS_API_KEY, ICANN_DOMAIN, HANDSHAKE_DOMAIN } = Deno.env
  .toObject();

const baseURL = `http://${PDNS_URL}/api/v1/servers/localhost/zones`;
const headers = new Headers({
  "X-API-Key": PDNS_API_KEY,
  "Content-Type": "application/json",
});

export const createZone = async (domain: string): Promise<DNSRecord[]> => {

  if (!isHandshake(domain)) {
    throw new Error("Only Handshake domains are supported");
  }

  await generateCaddyfile(domain);
  await generateCertificate(domain);

  const tlsaRecord = await generateTlsaRecord(domain);

  const nameserver = `ns1.${
    isHandshake(domain) ? HANDSHAKE_DOMAIN : ICANN_DOMAIN
  }.`;
  const zone = {
    name: `${domain}.`,
    kind: "Native",
    nameservers: [nameserver],
    dnssec: true,
    rrsets: [
      {
        name: `${domain}.`,
        type: "A",
        ttl: 3600,
        records: [
          {
            content: Deno.env.get("PUBLIC_IP")
          }
        ]
      },
      {
        name: `_443._tcp.${domain}.`,
        type: "TLSA",
        ttl: 3600,
        records: [
          {
            content: tlsaRecord
          }
        ]
      }
    ]
  }
  const res = await fetch(baseURL, {
    method: "POST",
    headers,
    body: JSON.stringify(zone),
  });

  if (!res.ok) throw new Error(res.statusText);

  const cryptoKeysURL = `${baseURL}/${domain}./cryptokeys`;

  const res2 = await fetch(cryptoKeysURL, {
    method: "GET",
    headers,
  });

  if (!res2.ok) throw new Error(res2.statusText);

  try {
    const { ds } = (await res2.json())[0];
    
    const dnsRecords: DNSRecord[] = [
      {
        type: "NS",
        data: nameserver
      },
      {
        type: "DS",
        data: ds[1]
      }
    ]
    
    return dnsRecords;
  } catch (e) {
    throw e;
  }
};

export const deleteZone = async (domain: string): Promise<void> => {
  const res = await fetch(`${baseURL}/${domain}.`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) throw new Error(res.statusText);

  await deleteCaddyfile(domain);
  await deleteCertificate(domain);
}