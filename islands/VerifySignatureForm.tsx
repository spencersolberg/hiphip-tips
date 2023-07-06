import { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import ErrorBox from "../components/ErrorBox.tsx";

declare global {
	interface Window {
		bob3: {
      connect: () => Promise<wallet>;
    } | undefined;
	}
}

interface wallet {
  signWithName: (name: string, message: string) => Promise<string>;
}

interface Props {
	name: string;
	message: string;
	handshake: boolean;
}

export default function VerifySignatureForm(props: Props) {
	const { name, message, handshake } = props;

	const [signature, setSignature] = useState<string>("");
	const [bob3, setBob3] = useState<Window["bob3"] | undefined>();
	const [error, setError] = useState<string | undefined>();

	const handleChange = ({
		currentTarget,
	}: JSX.TargetedEvent<HTMLInputElement, Event>) =>
		setSignature(currentTarget.value);

	useEffect(() => {
		let hasBob = true;

		try {
			window.bob3;
		} catch (err) {
			if (err.name === "ReferenceError") {
				hasBob = false;
			}
		}

		if (typeof window.bob3 === "undefined") {
			hasBob = false;
		}

		if (hasBob) setBob3(window.bob3);
	}, []);

	const signWithBob = async () => {
		if (!bob3) return;
		try {
			const wallet = await bob3.connect();
			const _signature = await wallet.signWithName(name, message);

			// setSignature(_signature);

			const signature = document.getElementById(
				"signature",
			) as HTMLInputElement;
			signature.value = _signature;

			const submit = document.getElementById("submit") as HTMLButtonElement;
			submit.click();
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<>
			<form class="mx-auto w-full flex flex-col max-w-sm" method="post">
				{bob3 && (
					<button
						type="button"
						class="rounded-md w-full text-3xl px-4 pb-1 pt-0.5 text-center border-2 border-black mt-6 -mb-4 bg-blue-400 transition-transform transform-gpu md:motion-safe:hover:scale-110 flex"
						onClick={signWithBob}
					>
						<img
							src="https://raw.githubusercontent.com/kyokan/bob-wallet/master/resources/icons/1024x1024.png"
							class="w-8 pt-1 mr-2"
							alt="bob logo"
						/>
						Sign with Bob
					</button>
				)}
				<a href={`https://shakestation${handshake ? "" : ".io"}/manage/${name}`} target="_blank" rel="noopener noreferrer"
				class="rounded-md w-full text-2xl px-4 pb-1 pt-0.5 text-center border-2 border-black mt-6 -mb-4 text-black transition-tranform transform-gpu md:motion-safe:hover:scale-110 flex"
				style="background-color: #94f9c3;">
					<img
						src="https://shakestation.io/assets/img/logo"
						class="w-8 h-8 pt-1 mr-2"
						alt="shakestation logo"
					/>
					Sign with ShakeStation
					</a>

				<input
					type="text"
					class="rounded-md w-full text-black text-2xl px-4 pb-1 pt-0.5 mt-6 border-2 border-black text-left"
					placeholder="signature"
					name="signature"
					value={signature}
					autocorrect="off"
					spellcheck={false}
					autocapitalize="none"
					id="signature"
					onInput={handleChange}
				/>
				<button
					class="rounded-md w-full text-3xl px-4 pb-1 pt-0.5 text-left border-2 border-black mt-4 bg-green-400 transition-transform transform-gpu md:motion-safe:hover:scale-110"
					type="submit"
					name="submit"
					value="verifySignature"
					id="submit"
				>
					Verify
				</button>
			</form>
			<ErrorBox error={error} />
		</>
	);
}
