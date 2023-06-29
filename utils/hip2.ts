const letsDaneCert = await Deno.readTextFile("letsdane.crt");
const handshakeClient = Deno.createHttpClient({
  caCerts: [letsDaneCert],
  proxy: { url: "http://127.0.0.1:8080" },
});
const daneClient = Deno.createHttpClient({
  caCerts: [letsDaneCert],
  proxy: { url: "http://127.0.0.1:8079" },
})

export const isHandshake = (name: string): boolean => {
  const tld = name.split(".").slice(-1)[0];

  return !icannTLDs.includes(tld.toUpperCase());
}

export const parseText = (text: string): string[] => {
  if (!/^[a-zA-Z0-9,$]+$/.test(text)) {
    return [];
  }
  const symbols = text.trim().toUpperCase().split(",");

  return symbols;
}


export type Security = "handshake" | "dane" | "ca";
import _icannTLDS from "../icannTLDS.json" assert { type: "json" };

const icannTLDs: string[] = _icannTLDS;

const getHandshakeSymbols = async (name: string): Promise<string[]> => {
  const protocol = 
    name === "localhost:8001" || name.endsWith(".localhost:8001")
    ? "http"
    : "https";

  const url = `${protocol}://${name}/.well-known/wallets`;

  try {
    const res = await fetch(url, { client: handshakeClient}).then((res) => res.text());
    return parseText(res);
  } catch (error) {
    // console.error(error);
    return [];
  }
};

const getHandshakeAddress = async (name: string, symbol: string): Promise<string | undefined> => {
  const protocol =
    name === "localhost:8001" || name.endsWith(".localhost:8001")
    ? "http"
    : "https";

  const url = `${protocol}://${name}/.well-known/wallets/${symbol.toUpperCase()}`;

  try {
    const res = await fetch(url, { client: handshakeClient }).then((res) => res.text());
    return res.trim();
  } catch (error) {
    // console.error(error);
    return undefined;
  }
}

const getDaneSymbols = async (name: string): Promise<string[]> => {
  Deno.env.set("DENO_TLS_CA_STORE", "none");
  const url = `https://${name}/.well-known/wallets`;
  
  try {
    const res = await fetch(url, { client: daneClient }).then((res) => res.text());
    Deno.env.set("DENO_TLS_CA_STORE", "mozilla");
    return parseText(res);
  } catch (error) {
    // console.error(error);
    Deno.env.set("DENO_TLS_CA_STORE", "mozilla");
    return [];
  }
}

const getDaneAddress = async (name: string, symbol: string): Promise<string | undefined> => {
  const url = `https://${name}/.well-known/wallets/${symbol.toUpperCase()}`;

  try {
    const res = await fetch(url, { client: daneClient }).then((res) => res.text());
    return res.trim();
  } catch (error) {
    // console.error(error);
    return undefined;
  }
}

const getCaSymbols = async (name: string): Promise<string[]> => {
  const url = `https://${name}/.well-known/wallets`;

  try {
    const res = await fetch(url).then((res) => res.text());
    return parseText(res);
  } catch (error) {
    // console.error(error);
    return [];
  }
}

const getCaAddress = async (name: string, symbol: string): Promise<string | undefined> => {
  const url = `https://${name}/.well-known/wallets/${symbol.toUpperCase()}`;

  try {
    const res = await fetch(url).then((res) => res.text());
    return res.trim();
  } catch (error) {
    // console.error(error);
    return undefined;
  }
}

export const getSymbols = async (name: string, security: Security): Promise<string[]> => {
  switch (security) {
    case "handshake": {
      if (isHandshake(name)) {
        return await getHandshakeSymbols(name);
      } else {
        return [];
      }
    }
    case "dane": {
      if (isHandshake(name)) {
        return await getHandshakeSymbols(name);
      } else {
        return await getDaneSymbols(name);
      }
    }
    case "ca": {
      if (isHandshake(name)) {
        return await getHandshakeSymbols(name);
      } else {
        let symbols: string[];
        try {
          symbols = await getDaneSymbols(name);
          if (symbols.length == 0) {
            throw new Error("No DANE symbols");
          }
        } catch (_error) {
          try {
            symbols = await getCaSymbols(name);
          } catch (error) {
            // console.error(error);
            symbols = [];
          }
        }
        return symbols;
      }
    }
  }
};

export const getAddress = async (
  name: string,
  symbol: string,
  security: Security
): Promise<string | undefined> => {
  switch (security) {
    case "handshake": {
      if (isHandshake(name)) {
        return await getHandshakeAddress(name, symbol);
      } else {
        return undefined;
      }
    }
    case "dane": {
      if (isHandshake(name)) {
        return await getHandshakeAddress(name, symbol);
      } else {
        return await getDaneAddress(name, symbol);
      }
    }
    case "ca": {
      if (isHandshake(name)) {
        return await getHandshakeAddress(name, symbol);
      } else {
        let address: string | undefined;
        try {
          address = await getDaneAddress(name, symbol);
          if (!address) {
            throw new Error("No DANE address");
          }
        } catch (_error) {
          try {
            address = await getCaAddress(name, symbol);
          } catch (error) {
            // console.error(error);
            address = undefined;
          }
        }
        return address;
      }
    }
  }
};
