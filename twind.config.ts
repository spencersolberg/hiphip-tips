import { Options } from "$fresh/plugins/twind.ts";

export default {
  selfURL: import.meta.url,
  preflight: (preflight, { theme }) => ({
    ...preflight,
    "@font-face": [
      {
        fontFamily: "Fluro Bold",
        fontWeight: "bold",
        src: "url(/FluroBold.woff) format('woff')"
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
