<script>
    import { onMount } from 'svelte';

    import Bibliotekartikel from './Bibliotekartikel.svelte';

    async function getLibraryArticles() {
        const res = await fetch(`http://localhost:3000/content`);
        const data = await res.json();
        if (res.ok) {
            console.dir(data);
            console.log(data);
            libraryArticles = [...data];
            return data;
        } else {
            throw new Error(text);
        }
    }
    let promise;
    onMount(() => {
        promise = getLibraryArticles();
    });

    let toggleShowAll = true;

    $: console.log('Show all toggled to: ', toggleShowAll);

    let libraryArticles = [];
</script>

<style>
    pre {
        text-align: left;
    }
</style>

<div>
    <h2>Välkommen till biblioteket!</h2>
    <label>
        Visa alla
        <input
            name="toggleShowAll"
            bind:group={toggleShowAll}
            type="radio"
            value={true}
        />
    </label>
    <label>
        Visa endast utlånade
        <input
            name="toggleShowAll"
            bind:group={toggleShowAll}
            type="radio"
            value={false}
        />
    </label>
    {#each libraryArticles as articleData}
        <Bibliotekartikel {articleData} />
    {/each}

    {#await promise}
        <p>Fetching data...</p>
    {:then data}
        <pre>{JSON.stringify(data, null, 2)}</pre>
    {:catch error}
        <p>Error...</p>
    {/await}
</div>
