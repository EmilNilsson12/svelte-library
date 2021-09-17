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

    label {
        display: flex;
        justify-content: space-between;
    }

    .outer {
        width: 100%;
        display: flex;
        justify-content: center;
    }
    div.inner {
        width: 200px;
    }
</style>

<h2>Välkommen till biblioteket!</h2>
<div class="outer">
    <div class="inner">
        <label>
            <span> Visa alla </span>
            <input
                name="toggleShowAll"
                bind:group={toggleShowAll}
                type="radio"
                value={true}
            />
        </label>
        <label>
            <span> Visa endast tillgängliga </span>
            <input
                name="toggleShowAll"
                bind:group={toggleShowAll}
                type="radio"
                value={false}
            />
        </label>
    </div>
</div>

{#if toggleShowAll}
    {#each libraryArticles as articleData}
        <Bibliotekartikel {articleData} />
    {/each}
{:else}
    {#each [...libraryArticles].filter((item) => !item.utlånad) as articleData}
        <Bibliotekartikel {articleData} />
    {/each}
{/if}

{#await promise}
    <p>Fetching data...</p>
{:then data}
    <pre>{JSON.stringify(data, null, 2)}</pre>
{:catch error}
    <p>Error...</p>
{/await}
