<script lang="ts">
    import '../app.css'
    import { ModeWatcher } from 'mode-watcher'
    import { page } from '$app/state'

    const { children } = $props()
    const imageLocation = `${page.url.origin}/`
</script>

<svelte:head>
    <title>Svelte Diff - High Performance Diff Match Patch for Svelte 5</title>
    <meta
        name="description"
        content="A powerful, customizable diff match patch for Svelte 5 with TypeScript support. Features include custom snippets, and extensive testing coverage."
    />

    <!-- Open Graph / Social Media -->
    <meta property="og:title" content="Svelte Diff - Modern Diff Match Patch for Svelte" />
    <meta
        property="og:description"
        content="Transform diff into Svelte components with support for custom snippets and TypeScript. Perfect for documentation, blogs, and content-rich applications."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://diff.svelte.page" />
    <meta property="og:image" content="{imageLocation}svelte-diff-opengraph.png" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Svelte Diff - TypeScript-Ready Parser" />
    <meta
        name="twitter:description"
        content="Build better documentation and content-rich applications with this modern Diff parser for Svelte 5"
    />
    <meta name="twitter:image" content="{imageLocation}svelte-diff-twitter.png" />

    <!-- Keywords -->
    <meta
        name="keywords"
        content="svelte, diff-match-patch, parser, typescript, svelte5, documentation, converter, component, sveltekit, formatting, content management"
    />

    <!-- Additional Meta -->
    <meta name="author" content="Humanspeak, Inc." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://diff.svelte.page" />

    <!-- JSON-LD structured data -->
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Svelte Diff",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "author": {
                "@type": "Organization",
                "name": "Humanspeak, Inc.",
                "url": "https://humanspeak.com"
            },
            "programmingLanguage": ["Svelte", "TypeScript"],
            "description": "A powerful diff parser for Svelte 5 that transforms text into diffs with TypeScript support and extensive testing coverage.",
            "license": "MIT",
            "url": "https://diff.svelte.page",
            "downloadUrl": "https://www.npmjs.com/package/@humanspeak/svelte-diff-match-patch",
            "requirements": "Svelte 5.0 or higher",
            "releaseNotes": "https://github.com/humanspeak/svelte-diff-match-patch/releases",
            "keywords": "svelte, diff-match-patch, parser, typescript, documentation"
        }
    </script>
</svelte:head>
<ModeWatcher />

{@render children?.()}
