export const createSubdomain = async (subdomain: string): Promise<string> => {
  if (typeof subdomain !== "string") {
    throw new Error("Subdomain must be a string.");
  }

  // if subdomain has characters except a-Z, 0-9, and - throw error
  if (!subdomain.match(/^[a-z0-9-]+$/)) {
    throw new Error("Subdomain must only contain lowercase letters, numbers, and hyphens.");
  }

  // if subdomain is longer than 63 characters throw error
  if (subdomain.length > 63) {
    throw new Error("Subdomain must be less than 63 characters.");
  }

  // if subdomain is already taken throw error
  const kv = await Deno.openKv();
  const res = await kv.get(["subdomains", subdomain]);
  if (res.value) {
    throw new Error("Subdomain is already taken.");
  }

  // generate 16 random digits as key (password)
  const key = Math.random().toString().slice(2,18).toString();

  // store subdomain and key in KV
  await kv.set(["subdomains", subdomain], { key, wallets: []}).catch((err) => {
    console.error(err);
    throw new Error("Internal server error.");
  }
  );

  return key;
}