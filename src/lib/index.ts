import type { Diff } from 'diff-match-patch-ts'
import type { Snippet } from 'svelte'
import SvelteDiffMatchPatch from './SvelteDiffMatchPatch.svelte'

export default SvelteDiffMatchPatch
export type Renderers = {
    remove?: Snippet<[string]>
    equal?: Snippet<[string]>
    insert?: Snippet<[string]>
    lineBreak?: Snippet<[]>
}
export type RendererClasses = {
    remove?: string
    equal?: string
    insert?: string
}
export type SvelteDiffMatchPatchTiming = { main: number; cleanup: number; total: number }
export type SvelteDiffMatchPatchDiff = Diff
export interface SvelteDiffMatchPatchProps {
    /**
     * The original (left-side) string to compare.
     *
     * This is typically the **"before"** or **"source"** text in a diff operation.
     *
     * ## Example
     * ```svelte
     * <SvelteDiffMatchPatch originalText={oldValue} ... />
     * ```
     */
    originalText: string
    /**
     * The modified (right-side) string to compare.
     *
     * This is typically the **"after"** or **"target"** text in a diff operation.
     *
     * ## Example
     * ```svelte
     * <SvelteDiffMatchPatch modifiedText={newValue} ... />
     * ```
     */
    modifiedText: string
    /**
     * Maximum time in seconds to spend computing the diff.
     *
     * Set to `0` for unlimited computation time. Default: `1`.
     *
     * Useful for very large texts or when you want to limit processing time for performance reasons.
     *
     * ## Example
     * ```svelte
     * <SvelteDiffMatchPatch timeout={2} ... />
     * ```
     */
    timeout?: number
    /**
     * If `true`, applies semantic cleanup to the diff for human readability.
     *
     * This makes the diff output easier to read by factoring out commonalities that are likely to be coincidental.
     * Default: `false`.
     *
     * ## Example
     * ```svelte
     * <SvelteDiffMatchPatch cleanupSemantic={true} ... />
     * ```
     */
    cleanupSemantic?: boolean
    /**
     * Edit cost for efficiency cleanup.
     *
     * Higher values make the diff more aggressive in factoring out trivial commonalities.
     * Default: `4`.
     *
     * ## Example
     * ```svelte
     * <SvelteDiffMatchPatch cleanupEfficiency={8} ... />
     * ```
     */
    cleanupEfficiency?: number
    /**
     * Callback invoked after diff computation, receiving timing information.
     *
     * The callback receives an object: `{ main, cleanup, total }` (all in milliseconds).
     *
     * ## Example
     * ```ts
     * function handleTiming(timing) {
     *   console.log('Diff timing:', timing);
     * }
     * ```
     * ```svelte
     * <SvelteDiffMatchPatch onProcessing={handleTiming} ... />
     * ```
     */
    /* trunk-ignore(eslint/no-unused-vars) */
    onProcessing?: (timing: SvelteDiffMatchPatchTiming, diffs: SvelteDiffMatchPatchDiff[]) => void
    /**
     * Custom Svelte snippets for rendering diff segments.
     *
     * Override the default rendering for `remove`, `insert`, `equal`, and `lineBreak` segments.
     *
     * If you provide this prop, you are responsible for all rendering and styling of diff segments.
     *
     * ## Example
     * ```svelte
     * <SvelteDiffMatchPatch ...>
     *   {#snippet remove(text: string)}<span class="my-remove">{text}</span>{/snippet}
     *   {#snippet insert(text: string)}<span class="my-insert">{text}</span>{/snippet}
     *   {#snippet equal(text: string)}<span class="my-equal">{text}</span>{/snippet}
     *   {#snippet lineBreak()}<br />{/snippet}
     * </SvelteDiffMatchPatch>
     * ```
     *
     * @see rendererClasses for simple CSS class-based styling
     */
    renderers?: Renderers
    /**
     * Custom CSS classes for each diff type (remove, insert, equal).
     *
     * ## Usage
     *
     * Pass an object with keys for each diff type you want to style:
     *
     * ```js
     * rendererClasses={{
     *   remove: 'bg-red-100 text-red-800',
     *   insert: 'bg-green-100 text-green-800',
     *   equal: 'text-gray-700'
     * }}
     * ```
     *
     * - `remove`: CSS class for removed segments (removed text)
     * - `insert`: CSS class for inserted segments (added text)
     * - `equal`:  CSS class for unchanged segments
     *
     * ## Important
     *
     * - **This only works if you do NOT specify the `renderers` prop.**
     *   If you provide custom `renderers`, you are responsible for all rendering and styling.
     * - If a class is not provided for a type, the component will fall back to its default inline style for that type.
     * - This is a convenient way to style the diff output using Tailwind, custom classes, or your own CSS framework.
     *
     * ## Example
     *
     * ```svelte
     * <SvelteDiffMatchPatch
     *   originalText={a}
     *   modifiedText={b}
     *   rendererClasses={{
     *     remove: 'bg-red-100 text-red-800',
     *     insert: 'bg-green-100 text-green-800',
     *     equal: 'text-gray-700'
     *   }}
     * />
     * ```
     *
     * @see renderers for full custom rendering
     */
    rendererClasses?: RendererClasses
}
