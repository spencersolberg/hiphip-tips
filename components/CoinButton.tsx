interface CoinButtonProps {
  symbol: string;
  name: string;
  domain: string;
}

export default function CoinButton(props: CoinButtonProps) {
  const { symbol, name, domain } = props;

  const imageUrl = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${symbol.toLowerCase()}.svg`;
  return (
    <a href={`/${domain}/${symbol.toUpperCase()}`} class="flex rounded-md border border-white p-2 transition-transform transform-gpu hover:scale-110 bg-black text-white">
      <img src={imageUrl} class="w-8 h-8 mr-2" />
      <div class="flex flex-col">
        <span class="text-sm">{name}</span>
        <span class="text-xs">{symbol.toUpperCase()}</span>
      </div>
    </a>
  )
}