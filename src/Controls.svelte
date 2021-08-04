<div id="controls">
	<h1>Controls</h1>
	<div class="slidecontainer">
		Number of fish: {num_fish}
		<input type=range bind:value={num_fish} min=1 max=1000 class="slider">
	  </div>
	<button on:click={render}>Apply</button>
	<p>
		<em>IF IT GETS SLOW, REFRESH PAGE! I don't clear the memory properly.</em>
	</p>
</div>

<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	let num_fish = 60;

	const render = () => {
		dispatch('controls_apply', num_fish);
	}
</script>

<style>
#controls {
	position: fixed;
	top: 20px;
	left: 20px;
	border-radius: 16px;

	background-color: rgba(255,255,255,0.7);
	padding: 1rem;
	width: 240px;
}
h1 {
	margin: 0;
}
.slidecontainer, .slider {
  width: 100%;
}
</style>