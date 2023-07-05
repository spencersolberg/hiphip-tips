import dig from "npm:node-dig-dns";
import type { DNSRecord } from "./kv.ts";

export const getRecords = async (domain: string): Promise<DNSRecord[]> => {
  const { HNSD_HOST, HNSD_PORT } = Deno.env.toObject();

  const args = [
    `@${HNSD_HOST}`,
    "-p", `${HNSD_PORT}`,
    "+dnssec",
    "+short",
    domain
  ]

  const nsCmd = new Deno.Command("dig", { args: [...args, "NS"] });
  const dsCmd = new Deno.Command("dig", { args: [...args, "DS" ]});

  const outputs = await Promise.all([ nsCmd.output(), dsCmd.output() ]);

  const records: DNSRecord[] = [
    {
      type: "NS",
      data: new TextDecoder().decode(outputs[0].stdout).trim().split("\n")[0]
    },
    {
      type: "DS",
      data: new TextDecoder().decode(outputs[1].stdout).trim().split("\n")[0].toLowerCase()
    }
  ]

  return records;
}

export const compareRecords = (first: DNSRecord[], second: DNSRecord[]): boolean => {
  if (first.length !== second.length) return false;

  for (let i = 0; i < first.length; i++) {
    if (first[i].type !== second[i].type) return false;
    if (first[i].data !== second[i].data) return false;
  }

  return true;
}