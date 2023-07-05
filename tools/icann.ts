const icannTLDListURL = "https://data.iana.org/TLD/tlds-alpha-by-domain.txt";

const icannTLDList = await fetch(icannTLDListURL).then((res) => res.text());

const icannTLDs = icannTLDList.split("\n").slice(1, -1);

await Deno.writeTextFile(
	"./icannTLDs.json",
	JSON.stringify(icannTLDs, null, 4),
);
