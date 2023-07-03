import { useEffect, useState } from "preact/hooks";

export default function Message(props: { message: string }) {
  const { message } = props;

  const [copyText, setCopyText] = useState<string>("copy 📋");

  return (
    <>
      <p class="font-bold mt-2 break-word max-w-sm text-md w-full bg-blue-200 border-blue-400 border-2 mt-8 text-black rounded-md mx-auto p-2">
        {message}
      </p>
      <button
        onClick={() => {
          navigator.clipboard.writeText(message);
          setCopyText("copied!");
          setTimeout(() => {
            setCopyText("copy 📋");
          }, 1500)
        }}
        >
          <p class="mt-2 cursor-pointer transition-transform transform-gpu hover:scale-105 hover:underline">
            {copyText}
          </p>
        </button>
    </>
  );
}
