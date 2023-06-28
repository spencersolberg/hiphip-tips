import { useEffect, useState } from "preact/hooks";
import { startRegistration } from "@simplewebauthn/browser";

interface Props {
  subdomain?: string;
}

export default function AddPasskey({ subdomain }: Props) {
  const addPasskey = async () => {
    console.log("adding passkey");
    console.log(subdomain)
    const generateResponse = await fetch(`/auth/generate-new-passkey?subdomain=${subdomain}`);
    const options = await generateResponse.json();
    if (options.error) {
      // setError(options.error);
      throw options.error;
    }

    let registration;
    try {
      registration = await startRegistration(options);
    } catch (error) {
      // setError(error.message)
      throw error;
    }

    const verificationResponse = await fetch("/auth/verify-new-passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...registration, user: options.user }),
    });

    const verification = await verificationResponse.json();

    if (verification.error) {
      throw verification.error;
    }

    const { verified } = verification;

    if (verified) {
      window.location.href = `/account`;
    }

  }
  return (
    <button class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 mt-2 text-center border-2 border-black text-white bg-green-400 transition-transform transform-gpu hover:scale-110" onClick={addPasskey}>add passkey</button>
  )
}