import { useState, useEffect } from "preact/hooks";

export default function Address(props: { address: string }) {
  const {  address } = props;

  const [addressDisplay, setAddressDisplay] = useState<string>(address);
  const [javascript, setJavascript] = useState<boolean>(false);

  useEffect(() => {
    const first = address.slice(0, 6);
    const last = address.slice(-4);
    setAddressDisplay(`${first}...${last} 📋`);
    setJavascript(true);
  }, []);

  return (
    <p
      class={`text-lg mx-auto mt-4 text-gray-300 ${javascript ? "cursor-pointer transition-transform transform-gpu hover:scale-105 hover:underline" : ""}`}
      onClick={() => {
        if (javascript) {
          navigator.clipboard.writeText(address);
          setAddressDisplay("copied! 📋");
          setTimeout(() => {
            const first = address.slice(0, 6);
            const last = address.slice(-4);
            setAddressDisplay(`${first}...${last} 📋`);
          }, 1500);
        }
      }}
    >{addressDisplay}</p>
  )
}
