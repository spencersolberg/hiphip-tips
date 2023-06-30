import { JSX } from "preact";
import { useState } from "preact/hooks";
import { startAuthentication } from "@simplewebauthn/browser";
import Error from "../components/Error.tsx";


export default function LogInForm() {
  const [subdomain, setSubdomain] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const handleChange = ({currentTarget}: JSX.TargetedEvent<HTMLInputElement, Event>) => setSubdomain(currentTarget.value);

  const logIn = async () => {
    // console.log("logging in");
    const generateResponse = await fetch(`/auth/generate-authentication?subdomain=${subdomain}`);

    const options = await generateResponse.json();
    if (options.error) {
      setError(options.error);
      return;
    }
    // console.log(options);
    let authentication;
    try {
      authentication = await startAuthentication(options);
    } catch (error) {
      // console.error(error);
      setError(error.message);
      throw error;
    }

    const verificationResponse = await fetch("/auth/verify-authentication", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({...authentication, user: options.user}),
    });

    const verification = await verificationResponse.json();

    // console.log(verification);

    const { token } = verification;

    if (token) {
      window.location.href = `/auth/set-token?token=${token}`;
    }
  }

  return (
    <form class="mx-auto w-full flex flex-col max-w-sm" onSubmit={e => e.preventDefault()}>
      <div class="flex mx-auto w-full max-w-sm">
        <input
          class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-right border-2 border-black text-black"
          placeholder="yoursubdomain"
          name="subdomain"
          autocorrect="off"
          spellcheck={false}
          autocapitalize="none"
          onInput={handleChange}
          autocomplete="username webauthn"
        />
        <h2 class="mt-9 ml-2 text-2xl">.{Deno.env.get("HANDSHAKE_DOMAIN")}</h2>
      </div>

      <div class="max-w-sm mx-auto px-2">
        <button
          class="rounded-md w-full text-3xl px-4 pb-1 pt-0.5 text-center border-2 border-black mt-4 bg-green-400 transition-transform transform-gpu md:motion-safe:hover:scale-110"
          onClick={logIn}
          type="submit"
        >
          log in
        </button>
      </div>
      <Error error={error} />
      <p class="text-center text-2xl mt-8">no account?</p>
      <a
        class="text-center text-2xl hover:italic hover:underline mt-2"
        href="/signup"
      >
        <p>sign up</p>
      </a>
    </form>
  );
}
