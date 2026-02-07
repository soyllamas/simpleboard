import adapter from 'svelte-adapter-bun';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        experimental: {
            remoteFunctions: true
        }
    }
};

export default config;
