import type { AuthenticatorDevice } from "@simplewebauthn/typescript-types";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { generateSlug, RandomWordOptions, totalUniqueSlugs } from "random-word-slugs"

export interface Subdomain {
  uuid: string;
  wallets: Wallet[];
}

export interface Wallet {
  symbol: string;
  address: string;
}

export interface NamedAuthenticatorDevice extends AuthenticatorDevice {
  name: string;
}

const kv = await Deno.openKv();

export const saveNewUserAuthenticator = async (uuid: string, authenticator: AuthenticatorDevice) => {
  await kv.set(["authenticators", uuid], [{ ...authenticator, name: generateAuthenticatorName() }]);
}

export const subdomainExists = async (subdomain: string): Promise<boolean> => {
  const res = await kv.get(["subdomains", subdomain]);
  if (res.value) {
    return true;
  }
  return false;
}

export const createSubdomain = async (subdomain: string, uuid: string): Promise<void> => {
  if (typeof subdomain !== "string") {
    throw new Error("your subdomain must be a string");
  }

  try {
    await checkSubdomain(subdomain);
  } catch (error) {
    throw error;
  }

  await kv.set(["subdomains", subdomain], { uuid, wallets: [] });
}

export const getAuthenticators = async (subdomain: string): Promise<AuthenticatorDevice[]> => {
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }
  const uuid = res.value.uuid;
  const authenticators = await kv.get<NamedAuthenticatorDevice[]>(["authenticators", uuid]);
  if (!authenticators.value) {
    throw new Error("No authenticators found.");
  }
  return authenticators.value;
}

export const setChallenge = async (uuid: string, challenge: string): Promise<void> => {
  await kv.set(["challenges", uuid], challenge);

  setTimeout(async () => {
    try {
      await kv.delete(["challenges", uuid]);
    } catch (error) {
      console.error('Failed to delete challenge:', error);
    }
  }, 5 * 60 * 1000);
}

export const getChallenge = async (uuid: string): Promise<string> => {
  const res = await kv.get<string>(["challenges", uuid]);
  if (!res.value) {
    throw new Error("Challenge does not exist.");
  }
  return res.value;
}

export const getUUID = async (subdomain: string): Promise<string> => {
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }
  return res.value.uuid;
}

export const getAuthenticator = async (uuid: string, credentialID: string): Promise<NamedAuthenticatorDevice> => {
  const res = await kv.get<NamedAuthenticatorDevice[]>(["authenticators", uuid]);
  if (!res.value) {
    throw new Error("No authenticators found.");
  }
  let authenticator;

  for (const _authenticator of res.value) {
    // this function's credentialID is a string, but the authenticator's credentialID is a Uint8Array
    // so we'll use the isoBase64URL function to convert the Uint8Array to a string

    const _credentialID = isoBase64URL.fromBuffer(_authenticator.credentialID);
    // console.log( { _credentialID, credentialID } );

    if (_credentialID === credentialID) {
      authenticator = _authenticator;
      break;
    }

  }
  if (!authenticator) {
    throw new Error("Authenticator does not exist.");
  }
  return authenticator;
}

export const updateAuthenticatorCounter = async (uuid: string, _authenticator: AuthenticatorDevice, newCounter: number): Promise<void> => {
  const res = await kv.get<AuthenticatorDevice[]>(["authenticators", uuid]);
  if (!res.value) {
    throw new Error("No authenticators found.");
  }
  const authenticators = res.value;
  const index = authenticators.findIndex((authenticator) => new TextDecoder().decode(authenticator.credentialID) === new TextDecoder().decode(_authenticator.credentialID));
  if (index === -1) {
    throw new Error("Authenticator does not exist.");
  }
  authenticators[index].counter = newCounter;
  await kv.set(["authenticators", uuid], authenticators);
}

export const getSubdomain = async (uuid: string): Promise<string> => {
  const iter = await kv.list<Subdomain>({ prefix: ["subdomains"]});
  for await (const { key, value } of iter) {
    if (value.uuid === uuid) {
      return key[1] as string;
    }
  }
  throw new Error("Subdomain does not exist.");
}

export const deleteSubdomain = async (subdomain: string): Promise<void> => {
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }
  await kv.delete(["subdomains", subdomain]);
}

export const addSubdomainWallet = async (subdomain: string, wallet: Wallet): Promise<void> => {
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }
  const _subdomain = res.value;
  _subdomain.wallets.push(wallet);
  await kv.set(["subdomains", subdomain], _subdomain);
}

export const deleteSubdomainWallet = async (subdomain: string, symbol: string): Promise<void> => {
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }
  const _subdomain = res.value;
  const index = _subdomain.wallets.findIndex((wallet) => wallet.symbol === symbol);
  if (index === -1) {
    throw new Error("Wallet does not exist.");
  }
  _subdomain.wallets.splice(index, 1);
  await kv.set(["subdomains", subdomain], _subdomain);
}

export const getSubdomainWallets = async (subdomain: string): Promise<Wallet[]> => {
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }
  return res.value.wallets;
}

export const changeSubdomain = async (subdomain: string, newSubdomain: string): Promise<void> => {
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (!res.value) {
    throw new Error("Subdomain does not exist.");
  }

  try {
    await checkSubdomain(newSubdomain);
  } catch (error) {
    throw error;
  }

  const _subdomain = res.value;
  await kv.atomic()
    .delete(["subdomains", subdomain])
    .set(["subdomains", newSubdomain], _subdomain)
    .commit();
}

export const checkSubdomain = async (subdomain: string): Promise<boolean> => {
  // check if subdomain is valid and not taken
  const res = await kv.get<Subdomain>(["subdomains", subdomain]);
  if (res.value) {
    throw new Error("that subdomain is taken");
  }

  // if subdomain has characters except a-Z, 0-9, and - throw error
  if (!subdomain.match(/^[a-z0-9-]+$/)) {
    throw new Error("your subdomain must only contain lowercase letters, numbers, and hyphens");
  }

  // if subdomain is longer than 63 characters throw error
  if (subdomain.length > 63) {
    throw new Error("your subdomain must be less than 63 characters");
  }

  return true;
}

const generateAuthenticatorName = (): string => {
  const options: RandomWordOptions<3> = {
    format: "title",
    partsOfSpeech: ["adjective", "adjective", "noun"],
    categories: {
      adjective: ["appearance", "color", "condition", "personality", "taste", "touch", "quantity"],
      noun: ["animals"]
    }
  }
  return generateSlug(3, options);
}

export const renameAuthenticator = async (uuid: string, oldName: string, newName: string): Promise<void> => {
  try {
    await checkAuthenticatorName(uuid, newName);
  } catch (error) {
    throw error;
  }

  const res = await kv.get<NamedAuthenticatorDevice[]>(["authenticators", uuid]);
  if (!res.value) {
    throw new Error("No authenticators found.");
  }
  const authenticators = res.value;
  const index = authenticators.findIndex((authenticator) => authenticator.name === oldName);
  if (index === -1) {
    throw new Error("Authenticator does not exist.");
  }
  authenticators[index].name = newName;
  await kv.set(["authenticators", uuid], authenticators);
}

export const deleteAuthenticator = async (uuid: string, name: string): Promise<void> => {
  const res = await kv.get<NamedAuthenticatorDevice[]>(["authenticators", uuid]);
  if (!res.value) {
    throw new Error("No authenticators found.");
  }
  const authenticators = res.value;

  if (authenticators.length < 2 ) {
    throw new Error("You must have at least one authenticator. You can delete your account instead.");
  }
  const index = authenticators.findIndex((authenticator) => authenticator.name === name);
  if (index === -1) {
    throw new Error("Authenticator does not exist.");
  }
  authenticators.splice(index, 1);
  await kv.set(["authenticators", uuid], authenticators);
}

const checkAuthenticatorName = async (uuid: string, name: string): Promise<boolean> => {
  // check if name is valid and not taken
  const res = await kv.get<NamedAuthenticatorDevice[]>(["authenticators", uuid]);
  if (!res.value) {
    throw new Error("No authenticators found.");
  }
  const authenticators = res.value;
  const index = authenticators.findIndex((authenticator) => authenticator.name === name);
  if (index !== -1) {
    throw new Error("that authenticator name is taken");
  }

  // if name has characters except a-Z (upper or lowercase), 0-9, -, spaces, and parantheses, throw error
  if (!name.match(/^[a-zA-Z0-9-() ]+$/)) {
    throw new Error("your authenticator name must only contain letters, numbers, hyphens, spaces, and parantheses");
  }
  

  // if name is longer than 20 characters throw error
  if (name.length > 20) {
    throw new Error("your authenticator name must be 20 characters or less");
  }

  return true;
}

export const addAuthenticator = async (uuid: string, authenticator: AuthenticatorDevice): Promise<void> => {
  const res = await kv.get<NamedAuthenticatorDevice[]>(["authenticators", uuid]);
  if (!res.value) {
    throw new Error("No authenticators found.");
  }
  const authenticators = res.value;
  const name = generateAuthenticatorName();
  authenticators.push({ ...authenticator, name });
  await kv.set(["authenticators", uuid], authenticators);
}

