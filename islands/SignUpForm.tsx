import { JSX, FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import { startRegistration } from "@simplewebauthn/browser";
import Error from "../components/Error.tsx";

interface Props {
}

const SignUpForm: FunctionalComponent<Props> = function({ children }) {
  const [subdomain, setSubdomain] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const handleChange = ({currentTarget}: JSX.TargetedEvent<HTMLInputElement, Event>) => setSubdomain(currentTarget.value);

  const signUp = async () => {
    // console.log("signing up");
    const generateResponse = await fetch(`/auth/generate-registration?subdomain=${subdomain}`);

    const options = await generateResponse.json();
    if (options.error) {
      setError(options.error);
      throw options.error;
    }
    // console.log(options);
    let registration;
    try {
      registration = await startRegistration(options);
    } catch (error) {
      setError(error.message)
      throw error;
    }

    const verificationResponse = await fetch("/auth/verify-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({...registration, user: options.user}),
    });

    const verification = await verificationResponse.json();

    // console.log(verification);

    const { token } = verification;

    if (token) {
      window.location.href = `/auth/set-token?token=${token}`;
    }
  }

  return (
    <div class="mx-auto w-full flex flex-col max-w-sm">
      <div class="flex mx-auto w-full max-w-sm">
        <input
          class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-8 text-right border-2 border-black text-black"
          placeholder="yoursubdomain"
          name="subdomain"
          autocorrect="off"
          spellcheck={false}
          autocapitalize="none"
          onInput={handleChange}
        />
        <h2 class="mt-9 ml-2 text-2xl">.{children}</h2>
      </div>

      <div class="max-w-sm mx-auto px-2">
        <button
          class="rounded-md w-full text-3xl px-4 pb-1 pt-0.5 text-center border-2 border-black mt-4 bg-green-400 transition-transform transform-gpu md:motion-safe:hover:scale-110"
          onClick={signUp}
        >
          sign up
        </button>
      </div>
      <Error error={error} />
      <p class="text-center text-2xl mt-8">already have an account?</p>
      <a
        class="text-center text-2xl hover:italic hover:underline mt-2"
        href="/login"
      >
        <p>log in</p>
      </a>
    </div>
  );
}

export default SignUpForm;