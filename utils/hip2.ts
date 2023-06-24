const letsDaneCert = await Deno.readTextFile("letsdane.crt");
const client = Deno.createHttpClient({
  caCerts: [letsDaneCert],
  proxy: { url: "http://127.0.0.1:8080" },
});

export const getSymbols = async (name: string): Promise<string[]> => {
  let protocol = "https";

  if (name === "localhost:8000" || name.endsWith(".localhost:8000")) {
    protocol = "http";
  }
  const url = `${protocol}://${name}/.well-known/wallets`;

  try {
    const res = await fetch(url, { client });
    const text = await res.text();
    // if text has characters other than a-Z, 0-9, and $, return []
    if (!/^[a-zA-Z0-9,$]+$/.test(text)) {
      return [];
    }
    const symbols = text.trim().toUpperCase().split(",");

    return symbols;
  } catch (error) {
    console.error(error);
    return [];
  }

};

export const getAddress = async (
  name: string,
  symbol: string,
): Promise<string | undefined> => {
  let protocol = "https";
  if (name === "localhost:8000" || name.endsWith(".localhost:8000")) {
    protocol = "http";
  }
  const url = `${protocol}://${name}/.well-known/wallets/${symbol}`;

  try {
    const res = await fetch(url, { client });
    // if 404, return undefined
    if (res.status === 404) {
      return undefined;
    }
    const text = await res.text();

    const address = text.trim();

    return address;
  } catch (error) {
    console.error(error);
    return undefined;
  }


};
