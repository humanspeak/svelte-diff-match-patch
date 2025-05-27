<script lang="ts">
    import { localStore } from '$lib/state/localStore.svelte'
    import { Textarea } from '$lib/shadcn/components/ui/textarea/index.js'
    import SvelteDiffMatchPatch from '@humanspeak/svelte-diff-match-patch'
    import * as Card from '$lib/shadcn/components/ui/card/index.js'
    import MainContainer from '$lib/components/MainContainer.svelte'

    const ogText = `# Welcome to My Markdown Playground! 🎨

Hey there! This is a *fun* example of mixing **Markdown** and <em>HTML</em> together.

## Things I Love:
1. Writing in <strong>bold</strong> and _italic_
2. Making lists (like this one!)
3. Using emojis 🚀 ✨ 🌈

| Feature | Markdown | HTML |
|---------|:--------:|-----:|
| Bold | **text** | <strong>text</strong> |
| Italic | *text* | <em>text</em> |
| Links | [text](url) | <a href="url">text</a> |

Here's a quote for you:
> "The best of both worlds" - <cite>Someone who loves markdown & HTML</cite>

You can even use <sup>superscript</sup> and <sub>subscript</sub> text!

---

<details>
<summary>Want to see something cool?</summary>
Here's a hidden surprise! 🎉
</details>

Happy coding! <span style="color: hotpink">♥</span>`

    const text = localStore<string>('markdown', ogText)
    let text1 = $state(text.value)
    let text2 = $state(text.value)
    let timeout: number | null = null
    let diffTimeout = $state(1)
    let cleanupSemantic = $state(false)
    let cleanupEfficiency = $state(4)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onChangeTextArea = (_event: Event) => {
        if (!window) return
        if (timeout) clearTimeout(timeout)
        timeout = window.setTimeout(() => {
            text1 = text.value
        }, 500)
    }
</script>

<MainContainer>
    <div class="h-full w-full">
        <div class="flex h-full justify-center p-8">
            <div class="grid h-full w-full grid-cols-[25%_auto] gap-8">
                <div class="h-full space-y-4">
                    <Card.Root class="flex h-full flex-col">
                        <Card.Header>
                            <Card.Title>Editor</Card.Title>
                            <Card.Description>Edit the text to see the diff 🥰</Card.Description>
                        </Card.Header>
                        <Card.Content class="flex flex-1 flex-col">
                            <Textarea
                                onkeyupcapture={onChangeTextArea}
                                bind:value={text.value}
                                id="markdown"
                                class="w-full flex-1 resize-none"
                            />
                        </Card.Content>
                    </Card.Root>

                    <Card.Root class="flex flex-col">
                        <Card.Header>
                            <Card.Title>Diff Settings</Card.Title>
                            <Card.Description>Configure the diff behavior ⚙️</Card.Description>
                        </Card.Header>
                        <Card.Content class="space-y-4">
                            <div>
                                <label for="diff-timeout" class="block text-sm font-medium mb-2">
                                    Diff timeout (seconds):
                                </label>
                                <input
                                    id="diff-timeout"
                                    type="number"
                                    bind:value={diffTimeout}
                                    min="0"
                                    step="0.1"
                                    class="w-24 p-2 border rounded"
                                />
                                <p class="text-sm text-muted-foreground mt-1">
                                    Timeout for diff computation. '0' allows unlimited computation.
                                </p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Post-diff cleanup:</label>
                                <div class="space-y-2">
                                    <label class="flex items-center">
                                        <input type="radio" bind:group={cleanupSemantic} value={true} class="mr-2" />
                                        Semantic Cleanup
                                    </label>
                                    <p class="text-sm text-muted-foreground ml-6">
                                        Increase human readability by factoring out commonalities.
                                    </p>

                                    <label class="flex items-center">
                                        <input type="radio" bind:group={cleanupSemantic} value={false} class="mr-2" />
                                        Efficiency Cleanup
                                    </label>
                                    <div class="ml-6">
                                        <label for="edit-cost" class="text-sm">Edit cost:</label>
                                        <input
                                            id="edit-cost"
                                            type="number"
                                            bind:value={cleanupEfficiency}
                                            min="0"
                                            class="w-24 p-2 border rounded ml-2"
                                            disabled={cleanupSemantic}
                                        />
                                        <p class="text-sm text-muted-foreground mt-1">
                                            Higher values mean more aggressive cleanup.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card.Root>
                </div>

                <div class="h-auto min-h-max">
                    <Card.Root class="flex h-full w-full flex-col">
                        <Card.Header>
                            <Card.Title>Diff Result</Card.Title>
                            <Card.Description>See the changes in real-time 👩🏼‍💻</Card.Description>
                        </Card.Header>
                        <Card.Content class="flex-1">
                            <div class="h-full w-full overflow-y-auto rounded-md border p-4 prose max-w-none">
                                <SvelteDiffMatchPatch
                                    originalText={text1}
                                    modifiedText={text2}
                                    timeout={diffTimeout}
                                    {cleanupSemantic}
                                    {cleanupEfficiency}
                                    rendererClasses={{
                                        remove: 'diff-remove',
                                        insert: 'diff-insert',
                                        equal: 'diff-equal'
                                    }}
                                />
                            </div>
                        </Card.Content>
                    </Card.Root>
                </div>
            </div>
        </div>
    </div>
</MainContainer>

<style>
    :global(.diff-remove) {
        background-color: #ffd7d5;
        text-decoration: line-through;
    }
    :global(.diff-insert) {
        background-color: #d4ffd4;
    }
</style>
