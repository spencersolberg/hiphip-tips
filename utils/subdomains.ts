export interface Subdomain {
  key: string;
  wallets: Wallet[];
}

export interface Wallet {
  symbol: string;
  address: string;
}

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

export const deleteSubdomain = async (subdomain: string, key: string): Promise<void> => {
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

  // if subdomain does not exist throw error
  const kv = await Deno.openKv();
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }

  // if key is incorrect throw error
  if (res.value.key !== key) {
    throw new Error("Key is incorrect.");
  }

  await kv.delete(["subdomains", subdomain]);
}

export const getSubdomain = async (key: string): Promise<string> => {
  const kv = await Deno.openKv();
  const iter = kv.list<Subdomain>({ prefix: ["subdomains"] });
  // subdomain structure: { key: string, wallets: { symbol: string, address: string }[] }
  for await (const { key: [_, subdomain], value } of iter) {
    if (value.key === key) {
      return subdomain as string;
    }
  }
  throw new Error("No subdomain found.");
}

export const getSubdomainWallets = async (subdomain: string): Promise<Wallet[]> => {
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

  // if subdomain does not exist throw error
  const kv = await Deno.openKv();
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }

  return res.value.wallets;
}

export const addSubdomainWallet = async (subdomain: string, wallet: Wallet, key: string): Promise<void> => {
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

  // if subdomain does not exist throw error
  const kv = await Deno.openKv();
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }

  // if key is incorrect throw error
  if (res.value.key !== key) {
    throw new Error("Key is incorrect.");
  }

  // if wallet already exists throw error
  const wallets = res.value.wallets;
  for (const w of wallets) {
    if (w.symbol === wallet.symbol) {
      throw new Error("Wallet already exists.");
    }
  }

  // add wallet to subdomain
  wallets.push(wallet);
  await kv.set(["subdomains", subdomain], { key: res.value.key, wallets });
}

export const deleteSubdomainWallet = async (subdomain: string, symbol: string, key: string): Promise<void> => {
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

  // if subdomain does not exist throw error
  const kv = await Deno.openKv();
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }

  // if key is incorrect throw error
  if (res.value.key !== key) {
    throw new Error("Key is incorrect.");
  }

  // if wallet does not exist throw error
  const wallets = res.value.wallets;
  let found = false;
  for (let i = 0; i < wallets.length; i++) {
    if (wallets[i].symbol === symbol) {
      found = true;
      wallets.splice(i, 1);
      break;
    }
  }
  if (!found) {
    throw new Error("Wallet does not exist.");
  }

  // update subdomain
  await kv.set(["subdomains", subdomain], { key: res.value.key, wallets });
}