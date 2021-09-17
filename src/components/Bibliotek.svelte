<script>
    import Form from './Form.svelte';
    import { onMount } from 'svelte';

    import Bibliotekartikel from './Bibliotekartikel.svelte';

    async function getLibraryArticles() {
        const res = await fetch(`http://localhost:3000/content`);
        const data = await res.json();
        if (res.ok) {
            libraryArticles = [...data];
            return libraryArticles;
        } else {
            throw new Error(res);
        }
    }
    let promise;
    let triggerNewRender = 0;
    onMount(() => {
        promise = getLibraryArticles();
    });

    $: {
        console.log('Data mutated:', triggerNewRender);
        promise = getLibraryArticles();
    }

    function toggleAvailability(articleData) {
        console.log('articleData: ', articleData.utlånad);

        const newData = {
            ...articleData,
            utlånad: !articleData.utlånad,
        };

        console.log('newData: ', newData.utlånad);

        fetch(`http://localhost:3000/content/${articleData['id']}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(newData),
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log('type: ', data.type);
                console.log('data: ', data.utlånad);
                console.table(data);
                triggerNewRender += 1;
            });
    }

    function addNewItem(articleData) {
        fetch(`http://localhost:3000/content`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(articleData),
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.table(data);
                triggerNewRender += 1;
            });
    }

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
<Form {addNewItem} />
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
        <Bibliotekartikel {toggleAvailability} {articleData} />
    {/each}
{:else}
    {#each [...libraryArticles].filter((item) => !item.utlånad) as articleData}
        <Bibliotekartikel {toggleAvailability} {articleData} />
    {/each}
{/if}

<!-- {#await promise}
    <p>Fetching data...</p>
{:then data}
    <pre>{JSON.stringify(data, null, 2)}</pre>
{:catch error}
    <p>Error...</p>
{/await} -->
