// const manifestURL = "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/manifest.json";

interface Coin {
  symbol: string;
  color: string;
  name: string;
}
// const manifest: Coin[] = await fetch(manifestURL).then((res) => res.json());
import _manifest from "./manifest.json" assert { type: "json" };
const manifest: Coin[] = _manifest;

export const getName = (symbol: string): string | undefined => {
  const coin = manifest.find((coin) => coin.symbol === symbol.toUpperCase());

  return coin?.name;
}

export const getColor = (symbol: string): string | undefined => {
  const coin = manifest.find((coin) => coin.symbol === symbol.toUpperCase());

  return coin?.color;
}

export const getInfo = (symbol: string): Coin | undefined => {
  const coin = manifest.find((coin) => coin.symbol === symbol.toUpperCase());

  return coin;
}

export const constructURL = (_symbol: string, address: string): string => {
  return address;
}