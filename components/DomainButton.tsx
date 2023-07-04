import type { Domain } from "../utils/kv.ts";

interface DomainButtonProps {
	domain: Domain;
}

export default function DomainButton(props: DomainButtonProps) {
	const { domain } = props;
	return (
		<a
			href={`/domains/${domain.name}`}
			class={`flex rounded-md border border-white p-2 transition-transform transform-gpu hover:scale-110 text-black mb-4 ${
				domain.verified && domain.setup
					? "bg-green-200 border-green-400"
					: "bg-red-200 border-red-400"
			}`}
		>
			<div class="flex flex-col">
				<span class="text-2xl">{domain.name}/</span>

				<p class="text-sm">
					{!domain.verified
						? "❌ unverified"
						: !domain.setup
						? "❌ not configured"
						: "✅ verified & configured"}
				</p>
			</div>
		</a>
	);
}
