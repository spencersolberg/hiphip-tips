interface ErrorBoxProps {
	error?: string;
}

export default function ErrorBox(props: ErrorBoxProps) {
	const { error } = props;
	return (
		<>
			<div
				class={`${
					error ? "flex" : "hidden"
				} flex-col justify-center p-2 rounded-md bg-red-200 max-w-sm mx-auto w-full border border-red-400 border-4 mt-4 text-black`}
			>
				<h1 class="text-3xl font-bold">uh oh!</h1>
				<p class="text-xl">{error}</p>
			</div>
		</>
	);
}
