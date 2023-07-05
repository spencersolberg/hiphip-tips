import { getInfo } from "../utils/coins.ts";

interface CoinButtonProps {
	symbol: string;
	name?: string;
	domain: string;
	generic?: boolean;
}

export default function CoinButton(props: CoinButtonProps) {
	const { symbol, name, domain, generic } = props;

	const imageUrl = !generic
		? `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${symbol.toLowerCase()}.svg`
		: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/generic.svg";
	return (
		<a
			href={`/@${domain}/${symbol.toUpperCase()}`}
			class="flex rounded-md border border-white p-2 transition-transform transform-gpu hover:scale-110 bg-black text-white"
		>
			<img src={imageUrl} class="w-8 h-8 mr-2" alt="" />
			<div class="flex flex-col">
				{generic ? (
					<span class="text-lg">
						{symbol === "" ? "…" : symbol.toUpperCase()}
					</span>
				) : (
					<>
						<span class="text-sm">{name}</span>
						<span class="text-xs">{symbol.toUpperCase()}</span>
					</>
				)}
			</div>
		</a>
	);
}
