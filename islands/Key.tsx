import { useState, useEffect } from "preact/hooks";

export default function Key(props: { keyValue: string }) {
  const { keyValue } = props;
  const [keyDisplay, setkeyDisplay] = useState<string>(keyValue);
  const [javascript, setJavascript] = useState<boolean>(false);

  useEffect(() => {
    console.log("key", keyValue);

    setkeyDisplay("•••••••••••••••• 📋")
    setJavascript(true);
  }, []);

  return (<>
    <p
      class={`text-lg mx-auto mt-4 text-slate-400 ${javascript ? "cursor-pointer transition-transform transform-gpu hover:scale-105 hover:underline" : ""}`}
      onClick={() => {
        if (javascript) {
          navigator.clipboard.writeText(keyValue);
          setkeyDisplay("copied! 📋");
          setTimeout(() => {
            setkeyDisplay("•••••••••••••••• 📋");
          }, 1500);
        }
      }}
    >{keyDisplay}</p>
    <p class={`${javascript ? "" : "hidden"} mx-auto mt-4 text-slate-400`}>click to copy</p>
  </>)
}
