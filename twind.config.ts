import { Options } from "$fresh/plugins/twind.ts";

const convertToBase64 = (file: Uint8Array): string => {
  let binary = "";
  const len = file.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(file[i]);
  }

  return btoa(binary);
}
const fontFile = await Deno.readFile("./static/FluroBold.woff");

export default {
  selfURL: import.meta.url,
  preflight: (preflight) => ({
    ...preflight,
    "@font-face": [
      {
        fontFamily: "Fluro Bold",
        fontWeight: "bold",
        // src: "url(/FluroBold.woff) format('woff')",
        src: `url(data:font/woff;charset=utf-8;base64,${convertToBase64(fontFile)}) format('woff')`,
        fontDisplay: "swap"
      }
    ],
    body: {
      fontFamily: "Fluro Bold"
    },
    p: {
      fontFamily: "Courier New"
    }
  })
} as Options;
