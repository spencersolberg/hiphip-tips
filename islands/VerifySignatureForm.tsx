import { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import Error from "../components/Error.tsx";

declare global {
  interface Window {
    bob3: any | undefined;
  }
}

interface Props {
  name: string;
  message: string;
}

export default function VerifySignatureForm(props: Props) {
  const { name, message } = props;

  const [signature, setSignature] = useState<string>("");
  const [bob3, setBob3] = useState<any | undefined>();
  const [error, setError] = useState<string | undefined>();

  const handleChange = (
    { currentTarget }: JSX.TargetedEvent<HTMLInputElement, Event>,
  ) => setSignature(currentTarget.value);

  useEffect(() => {
    let hasBob = true;

    try {
      window.bob3;
    } catch (err: any) {
      if (err.name === "ReferenceError") {
        hasBob = false;
      }
    }

    if (typeof window.bob3 === "undefined") {
      hasBob = false;
    }

    if (hasBob) setBob3(window.bob3);
  }, []);

  const signWithBob = async () => {
    try {
      const wallet = await bob3.connect();
      const _signature = await wallet.signWithName(name, message);

      // setSignature(_signature);

      const signature = document.getElementById("signature") as HTMLInputElement;
      signature.value = _signature;

      const submit = document.getElementById("submit") as HTMLButtonElement;
      submit.click();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <form class="mx-auto w-full flex flex-col max-w-sm" method="post">
        {bob3 && (
          <button
            type="button"
            class="rounded-md w-full text-3xl px-4 pb-1 pt-0.5 text-center border-2 border-black mt-6 -mb-4 bg-blue-400 transition-transform transform-gpu md:motion-safe:hover:scale-110 flex"
            onClick={signWithBob}
          >
            Sign with Bob
            <img
              src="https://raw.githubusercontent.com/kyokan/bob-wallet/master/resources/icons/1024x1024.png"
              class="w-8 pt-1 ml-2"
              />
          </button>
        )}
        <input
          type="text"
          class="rounded-md w-full text-black text-2xl px-4 pb-1 pt-0.5 mt-8 border-2 border-black text-left"
          placeholder="signature"
          name="signature"
          value={signature}
          autocorrect="off"
          spellcheck={false}
          autocapitalize="none"
          id="signature"
          onInput={handleChange}
        />
        <button
          class="rounded-md w-full text-3xl px-4 pb-1 pt-0.5 text-left border-2 border-black mt-4 bg-green-400 transition-transform transform-gpu md:motion-safe:hover:scale-110"
          type="submit"
          name="submit"
          value="verifySignature"
          id="submit"
        >
          Verify
        </button>
      </form>
      <Error error={error} />
    </>
  );
}
