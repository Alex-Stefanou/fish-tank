<Controls on:controls_apply={rerender}/>

<script>
	import Controls from './Controls.svelte';
	import boids from '../scripts/boids.js';
	boids.render(60);

	const rerender = (event) => {
		boids.reset();
		boids.render(event.detail);
	}

	window.onresize = () => location.reload();
</script>

<style>
</style>