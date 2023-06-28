import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact";

import { validateAddress } from "../utils/coins.ts";

export default function NewWallet() {
  const [symbol, setSymbol] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [javascript, setJavascript] = useState<boolean>(false);
  const [warning, setWarning] = useState<boolean>(false);

  const handleSymbolChange = (
    event: JSX.TargetedEvent<HTMLInputElement, Event>,
  ) => {
    setSymbol(event.currentTarget.value);
  };
  const handleAddressChange = (
    event: JSX.TargetedEvent<HTMLInputElement, Event>,
  ) => {
    setAddress(event.currentTarget.value);
  };

  const checkAddress = () => {
    const valid = validateAddress(symbol, address);
    // console.log("valid", valid);
    if (!valid) {
      setWarning(true);
      return;
    }
    setWarning(false);
    // click submit button
    const submit = document.getElementById("submit");
    if (submit) {
      submit.click();
    }
  }

  useEffect(() => {
    setJavascript(true);
    addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
          if (!(e.target instanceof HTMLInputElement)) return;
          if (e.target.type=="text") {
            e.preventDefault();
          }
      }
  }, true);
  }, []);

  useEffect(() => {
    setWarning(false);
  }, [symbol, address]);
  return (
    <form class="mx-auto w-full flex flex-col max-w-sm" method="post">
      <h1 class="text-4xl font-bold mt-8">add wallet</h1>
      <div class="grid grid-cols-2">
        <label class="text-xl mt-2 mr-2 text-slate-400">
          <p>symbol</p>
        </label>
        <label class="text-xl mt-2 ml-2 text-slate-400">
          <p>address</p>
        </label>
      </div>
      <div class="flex justify-between">
        <input
          class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5  mr-2 text-left border-2 border-black text-black"
          type="text"
          name="symbol"
          placeholder="HNS"
          onInput={handleSymbolChange}
        />
        <input
          class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5  ml-2 text-left border-2 border-black text-black"
          type="text"
          name="address"
          placeholder="hs1..."
          onInput={handleAddressChange}
        />
      </div>
      <button
        class={`rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-2 text-center border-2 border-black text-white bg-green-400 transition-transform transform-gpu hover:scale-110 ${
          javascript && "hidden"
        }`}
        type="submit"
        value="createSubdomainWallet"
        name="submit"
        id="submit"
      >
        add wallet
      </button>
      <button
        class={`rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-2 text-center border-2 border-black text-white bg-green-400 transition-transform transform-gpu hover:scale-110 ${
          !javascript && "hidden"
        }`}
        onClick={checkAddress}
        type="button"
        id="check"
      >
        add wallet
      </button>
      {warning && (<>
        <p class="text-yellow-400 text-center text-xl mt-2">
          hey, this doesn't look like a valid {symbol.toUpperCase()} address!
        </p>
        <button
        class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-2 text-center border-2 border-black text-white bg-yellow-400 transition-transform transform-gpu hover:scale-110"
        type="submit"
        value="createSubdomainWallet"
        name="submit"
        id="addAnyway"
      >
        add anyway
      </button>
      </>)}
    </form>
  );
}
