// const manifestURL = "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/manifest.json";

interface Coin {
	symbol: string;
	color: string;
	name: string;
	pattern?: string;
}
// const manifest: Coin[] = await fetch(manifestURL).then((res) => res.json());
import _manifest from "./manifest.json" assert { type: "json" };
const manifest: Coin[] = _manifest;

export const getName = (symbol: string): string | undefined => {
	const coin = manifest.find((coin) => coin.symbol === symbol.toUpperCase());

	return coin?.name;
};

export const getColor = (symbol: string): string | undefined => {
	const coin = manifest.find((coin) => coin.symbol === symbol.toUpperCase());

	return coin?.color;
};

export const getInfo = (symbol: string): Coin | undefined => {
	const coin = manifest.find((coin) => coin.symbol === symbol.toUpperCase());

	return coin;
};

export const constructURL = (symbol: string, address: string): string => {
	const name = getName(symbol);
	if (!name) {
		return address;
	} else if (name?.includes(" ")) {
		return address;
	} else {
		return `${name.toLowerCase()}:${address}`;
	}
};

export const validateAddress = (symbol: string, address: string): boolean => {
	const coin = manifest.find((coin) => coin.symbol === symbol.toUpperCase());

	if (!coin?.pattern) {
		return true;
	}

	const regex = new RegExp(coin.pattern);

	return regex.test(address);
};
