<!--
@component

A Svelte component that visually compares two strings and renders their differences using the diff-match-patch algorithm.
Supports character-level diffing, semantic and efficiency cleanup, custom rendering via Svelte snippets, and flexible styling.

@example
```svelte
<SvelteDiffMatchPatch
  originalText={oldValue}
  modifiedText={newValue}
  timeout={2}
  cleanupSemantic={true}
  cleanupEfficiency={4}
  rendererClasses={{
    remove: 'bg-red-100 text-red-800',
    insert: 'bg-green-100 text-green-800',
    equal: 'text-gray-700'
  }}
/>

<SvelteDiffMatchPatch
  originalText={a}
  modifiedText={b}
>
  {#snippet remove(text: string)}<span class="my-remove">{text}</span>{/snippet}
  {#snippet insert(text: string)}<span class="my-insert">{text}</span>{/snippet}
  {#snippet equal(text: string)}<span class="my-equal">{text}</span>{/snippet}
  {#snippet lineBreak()}<br />{/snippet}
</SvelteDiffMatchPatch>
```

@property {string} originalText - The original (left-side) string to compare (the "before" or source text)
@property {string} modifiedText - The modified (right-side) string to compare (the "after" or target text)
@property {number} [timeout=1] - Maximum time in seconds to spend computing the diff (0 for unlimited)
@property {boolean} [cleanupSemantic=false] - If true, applies semantic cleanup for human readability
@property {number} [cleanupEfficiency=4] - Edit cost for efficiency cleanup; higher values are more aggressive
@property {function} [onProcessing] - Callback invoked after diff computation, receiving timing info ({ main, cleanup, total } in ms)
@property {Partial<Renderers>} [renderers] - Custom Svelte snippets for rendering diff segments (remove, insert, equal, lineBreak)
@property {RendererClasses} [rendererClasses] - Custom CSS classes for each diff type (remove, insert, equal); only works if renderers is not set
-->

<script lang="ts">
    import { DiffMatchPatch, type Diff } from 'diff-match-patch-ts'
    import type { SvelteDiffMatchPatchProps } from './index.js'

    const {
        originalText,
        modifiedText,
        timeout = 1,
        cleanupSemantic = false,
        cleanupEfficiency = 4,
        onProcessing,
        renderers = {},
        rendererClasses = {}
    }: SvelteDiffMatchPatchProps = $props()

    let displayDiffs = $state<Diff[]>([])
    const dmp = $state<DiffMatchPatch>(new DiffMatchPatch())

    const computeDiff = (text1: string, text2: string) => {
        // trunk-ignore(eslint/camelcase)
        dmp.Diff_Timeout = timeout
        // trunk-ignore(eslint/camelcase)
        dmp.Diff_EditCost = cleanupEfficiency

        const startTotal = performance.now()
        const diffs = dmp.diff_main(text1, text2)
        const endMain = performance.now()

        const startCleanup = performance.now()
        if (cleanupSemantic) {
            dmp.diff_cleanupSemantic(diffs)
        } else if (cleanupEfficiency > 0) {
            dmp.diff_cleanupEfficiency(diffs)
        }
        const endTotal = performance.now()

        const timing = {
            main: endMain - startTotal,
            cleanup: endTotal - startCleanup,
            total: endTotal - startTotal
        }
        onProcessing?.(timing, diffs)
        displayDiffs = diffs
    }

    $effect(() => {
        computeDiff(originalText, modifiedText)
    })

    const displayRenderers = $derived({
        ...{
            remove: removeFallback,
            insert: insertFallback,
            equal: equalFallback,
            lineBreak: lineBreakFallback
        },
        ...renderers
    })
</script>

{#each displayDiffs as diff, index (index)}
    {@const [operation, text] = diff}
    {#if text.includes('\n')}
        {#each text.split('\n') as line, lineIndex (lineIndex)}
            {#if lineIndex > 0}{@render displayRenderers.lineBreak()}{/if}{#if line.length > 0}{@const renderer =
                    operation === 0
                        ? displayRenderers.equal
                        : operation === -1
                          ? displayRenderers.remove
                          : displayRenderers.insert}{@render renderer(line)}{/if}
        {/each}
    {:else if operation === 0}
        {@render displayRenderers.equal(text)}
    {:else if operation === -1}
        {@render displayRenderers.remove(text)}
    {:else if operation === 1}
        {@render displayRenderers.insert(text)}
    {/if}
{/each}

{#snippet removeFallback(text: string)}
    <span
        class={rendererClasses.remove}
        style={rendererClasses.remove ? '' : 'background-color: red;text-decoration: line-through;'}
        >{text}</span
    >
{/snippet}

{#snippet insertFallback(text: string)}
    <span
        class={rendererClasses.insert}
        style={rendererClasses.insert ? '' : 'background-color: green;'}>{text}</span
    >
{/snippet}

{#snippet equalFallback(text: string)}
    <span class={rendererClasses.equal}>{text}</span>
{/snippet}

{#snippet lineBreakFallback()}
    <br />
{/snippet}
