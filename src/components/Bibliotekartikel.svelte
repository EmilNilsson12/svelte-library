<script>
    export let articleData = {};
</script>

<style>
    div {
        border: 1px solid black;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    span {
        margin-left: 16px;
    }

    button {
        min-width: 100px;
        margin: 0;
    }
</style>

<div>
    <span>
        <em>{articleData.titel}</em> of type: <u>{articleData.type}</u>
    </span>
    <button disabled={articleData.utlånad}
        >{articleData.utlånad ? 'Utlånad' : 'Låna'}</button
    >
</div>
