<script>
    import Bibliotek from './components/Bibliotek.svelte';
</script>

<style>
    main {
        text-align: center;
        padding: 1em;
        margin: 0 auto;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-weight: 100;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>

<main>
    <h1>Biblioteket Online - <i>Ditt bibliotek online</i></h1>
    <Bibliotek />
</main>
