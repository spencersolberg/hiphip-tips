import "$std/dotenv/load.ts";
import { assertEquals } from "$std/testing/asserts.ts";


import { verifyMessage } from "../utils/hsd.ts";

// console.log(await verifyMessage("spencersolberg", "my name is spencersolberg", "WwulSpFA2C6BMXma/diI/ntA5CgeAaxybSamKNyo/xFiKLJCfp06YcmYTtyYeJHRZJ86hlGv9qGG1cVHTOdBuQ=="));

Deno.test("Verify message true", async () => {
  const name = "spencersolberg";
  const message = "my name is spencersolberg";
  const signature = "WwulSpFA2C6BMXma/diI/ntA5CgeAaxybSamKNyo/xFiKLJCfp06YcmYTtyYeJHRZJ86hlGv9qGG1cVHTOdBuQ==";

  const result = await verifyMessage(name, message, signature);

  assertEquals(result, true);
})

Deno.test("Verfiy message false", async () => {
  const name = "spencersolberg";
  const message = "my name is not spencersolberg";
  const signature = "WwulSpFA2C6BMXma/diI/ntA5CgeAaxybSamKNyo/xFiKLJCfp06YcmYTtyYeJHRZJ86hlGv9qGG1cVHTOdBuQ==";

  const result = await verifyMessage(name, message, signature);

  assertEquals(result, false);
})
