import { useState, useEffect } from "preact/hooks";
import QRCodeStyling from "qr-code-styling";
import { constructURL } from "../utils/coins.ts";

export default function QRCode(props: { symbol: string, address: string, color: string, domain: string }) {
  const { symbol, address, color, domain } = props;
  const url = constructURL(symbol, address);

  const [qr, setQR] = useState<string>(`/api/v1/domains/${domain}/symbols/${symbol}/qrcode`);

  useEffect(() => {
    (async () => {
      const imageUrl = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${symbol.toLowerCase()}.svg`;
      

      const qrCode = new QRCodeStyling({
        width: 600,
        height: 600,
        type: "svg",
        data: url,
        dotsOptions: {
          type: "rounded",
          color
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color
          
        },
        cornersDotOptions: {
          type: "dot",
          color
        },
        image: imageUrl,
        margin: 10
      });

      const raw = await qrCode.getRawData("svg");
      if (!raw) {
        console.error("raw is null");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(raw);
      reader.onloadend = () => {
        setQR(reader.result as string);
      }


    })();
  }, []);

  return (
    <img src={qr} class="w-80 rounded-lg"/>
  )
}
