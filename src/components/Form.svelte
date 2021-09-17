<script>
    import { v4 as uuidv4 } from 'uuid';
    let titel = '';
    let type = '';
    let color = '';
    let latefee = '50';

    export let addNewItem;

    function handleSubmit() {
        console.log('Done');

        addNewItem({
            titel,
            _id: uuidv4(),
            type,
            color,
            latefee,
            utlånad: false,
        });
    }
</script>

<style>
    input[type='number'] {
        width: 70px;
    }
    label.latefee::after {
        content: ' kr';
    }
    form {
        text-align: left;
    }
</style>

<form on:submit|preventDefault={handleSubmit}>
    <label>
        Namn på item
        <input bind:value={titel} required />
    </label>
    <label>
        Typ av item
        <input bind:value={type} required />
    </label>
    <label>
        Färg
        <input type="color" bind:value={color} required />
    </label>
    <label class="latefee">
        Böter för sen inlämning
        <input type="number" bind:value={latefee} required />
    </label>
    <!-- <label>
        Cover art
        <input type="file" bind:value={coverArt} />
    </label> -->
    <button type="submit">Lägg till i bibliotek</button>
</form>
