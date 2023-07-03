export const generateCertificate = async (domain: string): Promise<void> => {
  // https://gist.github.com/buffrr/609285c952e9cb28f76da168ef8c2ca6
  const config = `
    [req]
    distinguished_name=req
    [ext]
    keyUsage=critical,digitalSignature,keyEncipherment
    extendedKeyUsage=serverAuth
    basicConstraints=critical,CA:FALSE
    subjectAltName=DNS:${domain},DNS:*.${domain}
  `;

  await Deno.writeTextFile(`certificates/${domain}.cnf`, config);

  const args = [
    "req",
    "-x509",
    "-newkey",
    "rsa:4096",
    "-sha256",
    "-days",
    "3650",
    "-nodes",
    "-keyout",
    `certificates/${domain}.key`,
    "-out",
    `certificates/${domain}.crt`,
    "-extensions",
    "ext",
    "-config",
    `certificates/${domain}.cnf`,
    "-subj",
    `/CN=*.${domain}`,
  ];

  const cmd = new Deno.Command("openssl", { args });

  
  const { code, stdout, stderr } = await cmd.output();

  await Deno.remove(`certificates/${domain}.cnf`);
  console.assert(code === 0);

  // console.log(new TextDecoder().decode(stdout));
  // console.log(new TextDecoder().decode(stderr));

  if (code !== 0) {
    throw new Error(new TextDecoder().decode(stderr));
  }
};

export const deleteCertificate = async (domain: string): Promise<void> => {
  await Deno.remove(`certificates/${domain}.key`);
  await Deno.remove(`certificates/${domain}.crt`);
}

export const generateTlsaRecord = async (domain: string): Promise<string> => {
  const scriptPath = "./certificates/tlsa.sh";
  const certPath = `certificates/${domain}.crt`;

  const cmd = new Deno.Command(scriptPath, { args: [certPath] });

  const { code, stdout, stderr } = await cmd.output();

  console.assert(code === 0);

  // console.log(new TextDecoder().decode(stdout));
  // console.log(new TextDecoder().decode(stderr));

  if (code !== 0) {
    throw new Error(new TextDecoder().decode(stderr));
  }

  return new TextDecoder().decode(stdout).trim();
}