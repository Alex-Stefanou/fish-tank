<Controls on:controls_apply={rerender} on:halt={halt}/>

<script>
	import Controls from './Controls.svelte';
	import boids from '../scripts/boids.js';
	boids.render(10);

	const halt = () => {
		boids.reset();
	};
	
	const rerender = (event) => {
		boids.reset();
		boids.render(event.detail);
	};

	window.onresize = () => location.reload();
</script>

<style>
</style>