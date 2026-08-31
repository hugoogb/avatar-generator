/**
 * TypeScript has no built-in understanding of `.svelte` files. The build does
 * not need one — the component is compiled by the consumer's Svelte toolchain,
 * not by tsc — but the test imports it directly, so give tsc a shape for it.
 */
declare module "*.svelte" {
    import type { SvelteComponent } from "svelte";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component: typeof SvelteComponent<any>;
    export default component;
}
