# @humanspeak/svelte-diff-match-patch

A powerful, customizable diff-match-patch component for Svelte with TypeScript support.

[![NPM version](https://img.shields.io/npm/v/@humanspeak/svelte-diff-match-patch.svg)](https://www.npmjs.com/package/@humanspeak/svelte-diff-match-patch)
[![Build Status](https://github.com/humanspeak/svelte-diff-match-patch/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/humanspeak/svelte-diff-match-patch/actions/workflows/npm-publish.yml)
[![Coverage Status](https://coveralls.io/repos/github/humanspeak/svelte-diff-match-patch/badge.svg?branch=main)](https://coveralls.io/github/humanspeak/svelte-diff-match-patch?branch=main)
[![License](https://img.shields.io/npm/l/@humanspeak/svelte-diff-match-patch.svg)](https://github.com/humanspeak/svelte-diff-match-patch/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/@humanspeak/svelte-diff-match-patch.svg)](https://www.npmjs.com/package/@humanspeak/svelte-diff-match-patch)
[![CodeQL](https://github.com/humanspeak/svelte-diff-match-patch/actions/workflows/codeql.yml/badge.svg)](https://github.com/humanspeak/svelte-diff-match-patch/actions/workflows/codeql.yml)
[![Install size](https://packagephobia.com/badge?p=@humanspeak/svelte-diff-match-patch)](https://packagephobia.com/result?p=@humanspeak/svelte-diff-match-patch)
[![Code Style: Trunk](https://img.shields.io/badge/code%20style-trunk-blue.svg)](https://trunk.io)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Types](https://img.shields.io/npm/types/@humanspeak/svelte-diff-match-patch.svg)](https://www.npmjs.com/package/@humanspeak/svelte-diff-match-patch)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/humanspeak/svelte-diff-match-patch/graphs/commit-activity)

## Features

- 🚀 High-performance diff algorithm implementation
- 💪 Complete TypeScript support with strict typing
- 🎨 Customizable diff rendering with CSS classes OR svelte snippets
- 🔒 Safe and efficient text comparison
- 🎯 Configurable cleanup algorithms (semantic and efficiency)
- 🧪 Comprehensive test coverage (vitest and playwright)
- 🔄 Svelte 5 runes compatibility
- ⚡ Configurable timeout for large text comparisons
- 📊 Detailed timing and diff statistics
- 🎨 Customizable diff highlighting styles
- 🔍 Real-time diff updates

## Recent Updates

### New Features

- Added detailed timing information for diff operations
- Enhanced cleanup algorithms for better diff results
- Improved performance for large text comparisons
- Added TypeScript types for all component props and events
- Implemented proper state management with Svelte 5 runes

### Testing Improvements

- Enhanced Playwright E2E test coverage
- Added comprehensive tests for cleanup algorithms
- Improved test reliability with proper component mounting checks

## Installation

```bash
npm i -S @humanspeak/svelte-diff-match-patch
```

Or with your preferred package manager:

```bash
pnpm add @humanspeak/svelte-diff-match-patch
yarn add @humanspeak/svelte-diff-match-patch
```

## Basic Usage

```svelte
<script lang="ts">
    import SvelteDiffMatchPatch from '@humanspeak/svelte-diff-match-patch'

    let originalText = $state(`I am the very model of a modern Major-General,
I've information vegetable, animal, and mineral,
I know the kings of England, and I quote the fights historical,
From Marathon to Waterloo, in order categorical.`)

    let modifiedText = $state(`I am the very model of a cartoon individual,
My animation's comical, unusual, and whimsical,
I'm quite adept at funny gags, comedic theory I have read,
From wicked puns and stupid jokes to anvils that drop on your head.`)

    const onProcessing = (timing, diff) => {
        console.log('Diff timing:', timing)
        console.log('Diff result:', diff)
    }
</script>

<SvelteDiffMatchPatch
    {originalText}
    {modifiedText}
    timeout={1}
    cleanupSemantic={false}
    cleanupEfficiency={4}
    {onProcessing}
    rendererClasses={{
        remove: 'diff-remove',
        insert: 'diff-insert',
        equal: 'diff-equal'
    }}
/>

<style>
    :global(.diff-remove) {
        background-color: #ffd7d5;
        text-decoration: line-through;
    }
    :global(.diff-insert) {
        background-color: #d4ffd4;
    }
</style>
```

## TypeScript Support

The package is written in TypeScript and includes full type definitions:

```typescript
import type {
    SvelteDiffMatchPatchTiming,
    SvelteDiffMatchPatchDiff,
    SvelteDiffMatchPatchProps
} from '@humanspeak/svelte-diff-match-patch'
```

## Props

| Prop              | Type       | Default | Description                                    |
| ----------------- | ---------- | ------- | ---------------------------------------------- |
| originalText      | `string`   | -       | The original text to compare against           |
| modifiedText      | `string`   | -       | The modified text to compare with original     |
| timeout           | `number`   | 1       | Timeout in seconds for diff computation        |
| cleanupSemantic   | `boolean`  | false   | Enable semantic cleanup for better readability |
| cleanupEfficiency | `number`   | 4       | Efficiency cleanup level (0-4)                 |
| onProcessing      | `function` | -       | Callback for timing and diff information       |
| rendererClasses   | `object`   | -       | CSS classes for diff highlighting              |

## Custom Rendering with Snippets

You can customize how the diff is rendered using Svelte snippets. This gives you full control over the HTML structure and styling of each diff part.

```svelte
<script lang="ts">
    import SvelteDiffMatchPatch from '@humanspeak/svelte-diff-match-patch'

    let originalText = $state(`I am the very model of a modern Major-General,
I've information vegetable, animal, and mineral,
I know the kings of England, and I quote the fights historical,
From Marathon to Waterloo, in order categorical.`)

    let modifiedText = $state(`I am the very model of a cartoon individual,
My animation's comical, unusual, and whimsical,
I'm quite adept at funny gags, comedic theory I have read,
From wicked puns and stupid jokes to anvils that drop on your head.`)
</script>

<SvelteDiffMatchPatch {originalText} {modifiedText}>
    {#snippet remove(text: string)}
        <span class="diff-snippet-remove">{text}</span>
    {/snippet}
    {#snippet insert(text: string)}
        <span class="diff-snippet-insert">{text}</span>
    {/snippet}
    {#snippet equal(text: string)}
        <span class="diff-snippet-equal">{text}</span>
    {/snippet}
    {#snippet lineBreak()}
        <br /><br />
    {/snippet}
</SvelteDiffMatchPatch>

<style>
    :global(.diff-snippet-remove) {
        background-color: #ffd7d5;
        text-decoration: line-through;
    }
    :global(.diff-snippet-insert) {
        background-color: #d4ffd4;
    }
</style>
```

### Available Snippets

| Snippet   | Parameters | Description                                  |
| --------- | ---------- | -------------------------------------------- |
| remove    | `text`     | Renders removed text (in originalText only)  |
| insert    | `text`     | Renders inserted text (in modifiedText only) |
| equal     | `text`     | Renders unchanged text (in both texts)       |
| lineBreak | -          | Renders line breaks between diff sections    |

You can use these snippets to:

- Customize the HTML structure of each diff part
- Apply custom styling to different types of changes
- Add additional elements or attributes
- Implement custom animations or transitions
- Add tooltips or other interactive elements

If you don't provide snippets, the component will use the default rendering with the `rendererClasses` prop.

## Events

The component emits a `processing` event with timing and diff information:

```svelte
<script lang="ts">
    import type {
        SvelteDiffMatchPatchTiming,
        SvelteDiffMatchPatchDiff
    } from '@humanspeak/svelte-diff-match-patch'

    const onProcessing = (timing: SvelteDiffMatchPatchTiming, diff: SvelteDiffMatchPatchDiff) => {
        console.log('Diff computation time:', timing.computeTime)
        console.log('Cleanup time:', timing.cleanupTime)
        console.log('Total changes:', diff.length)
    }
</script>

<SvelteDiffMatchPatch {originalText} {modifiedText} {onProcessing} />
```

## Cleanup Algorithms

### Semantic Cleanup

When `cleanupSemantic` is enabled, the diff algorithm will:

- Factor out commonalities that are likely to be coincidental
- Improve human readability of the diff
- May increase computation time for large texts

### Efficiency Cleanup

The `cleanupEfficiency` level (0-4) controls how aggressively the algorithm:

- Factors out short commonalities
- Reduces computational overhead
- Higher values mean more aggressive cleanup

## Performance Considerations

- For large texts, consider increasing the `timeout` value
- Use `cleanupSemantic` for better readability in small to medium texts
- Use `cleanupEfficiency` for better performance in large texts
- Monitor the `onProcessing` callback for timing information

## License

MIT © [Humanspeak, Inc.](LICENSE)

## Credits

Made with ♥ by [Humanspeak](https://humanspeak.com)
