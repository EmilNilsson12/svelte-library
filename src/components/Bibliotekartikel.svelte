<script>
    export let articleData = {};
    export let toggleAvailability;
</script>

<style>
    div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0;
        border: 2px dotted gray;
        border-radius: 20px;
        padding: 10px;
    }

    img {
        margin-right: 10px;
    }

    .outer-span {
        display: flex;
        justify-content: space-between;
        flex-grow: 1;
    }

    .id-span {
        width: 65px;
        height: 40px;
        white-space: nowrap;
        overflow-x: scroll;
        overflow-y: hidden;
    }

    .inner-span {
        margin-right: 10%;
    }

    button {
        min-width: 100px;
        margin: 0;
    }
</style>

<div>
    <img
        src={articleData.coverArt}
        height="30"
        width="30"
        alt={articleData.titel + articleData.color}
    />
    <span class="outer-span">
        <span class="id-span">id: {articleData['_id']}</span>
        <span class="inner-span">
            <em>{articleData.titel}</em> of type: <u>{articleData.type}</u>
        </span>
    </span>
    <button
        on:click={toggleAvailability(articleData)}
        disabled={articleData.utlånad}
        >{articleData.utlånad ? 'Utlånad' : 'Låna'}</button
    >
</div>
