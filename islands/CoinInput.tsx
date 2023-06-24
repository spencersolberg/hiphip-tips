import { useState, useEffect } from "preact/hooks";
import { JSX } from "preact";
import { getInfo } from "../utils/coins.ts";

import CoinButton from "../components/CoinButton.tsx";

export default function CoinInput(props: { domain: string }) {
  const { domain } = props;
  
  const [symbol, setSymbol] = useState<string>("");
  const handleChange = ({currentTarget}: JSX.TargetedEvent<HTMLInputElement, Event>) => setSymbol(currentTarget.value);
  const [javascript, setJavascript] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [generic, setGeneric] = useState<boolean>(false);


  useEffect(() => {
    setJavascript(true);

    const info = getInfo(symbol);
    if (info) {
      setName(info.name);
      setGeneric(false);
    } else {
      setName("Generic");
      setGeneric(true);
    }

  }, [symbol]);

  return (
    <form class="mx-auto w-full flex flex-col max-w-sm" method="post">
    <input
      class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-4 text-center border-2 border-black text-black"
      placeholder="enter symbol (e.g. HNS, BTC)"
      name="symbol"
      autocorrect="off"
      spellcheck={false}
      autocapitalize="none"
      value={symbol}
      onInput={handleChange}
    />
    <div class="max-w-sm mx-auto px-2 mt-4">
      { javascript ? symbol && <CoinButton domain={domain} symbol={symbol} generic={generic} name={name} /> :       <button
        class="rounded-md w-full text-3xl px-4 pb-1 pt-0.5 text-center border-2 border-black  bg-green-400 transition-transform transform-gpu md:motion-safe:hover:scale-110"
        type="submit"
      >
        Go
      </button> }
      

    </div>
  </form>
  )
}
