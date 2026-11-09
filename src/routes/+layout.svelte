<script lang="ts">
	import '@fontsource/cormorant-garamond/400.css';
	import '@fontsource/cormorant-garamond/600.css';
	import '@fontsource/cormorant-garamond/700.css';
	import '@fontsource/caveat/400.css';
	import '@fontsource/caveat/700.css';
	import '../lib/styles/base.css';
	import '../lib/styles/paper.css';
	import PwaUpdate from '../lib/components/PwaUpdate.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>A Shop of Small Miracles</title>
	<meta
		name="description"
		content="Brew small miracles in a candlelit shop at the edge of a cold town."
	/>
</svelte:head>

{@render children()}
<PwaUpdate />
