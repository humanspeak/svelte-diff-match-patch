import { render, waitFor } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'
import SvelteDiffMatchPatch from './SvelteDiffMatchPatch.svelte'

// Note: Svelte 5 snippets cannot be directly tested as functions, so we focus on prop and DOM behavior

describe('SvelteDiffMatchPatch component', () => {
    it('renders a basic diff between two strings', () => {
        const { container } = render(SvelteDiffMatchPatch, {
            originalText: 'hello world',
            modifiedText: 'hello brave world'
        })
        expect(container.textContent).toContain('hello')
        expect(container.textContent).toContain('brave')
        expect(container.textContent).toContain('world')
    })

    it('applies rendererClasses for styling', () => {
        const { container } = render(SvelteDiffMatchPatch, {
            originalText: 'foo shoo',
            modifiedText: 'bar shoo',
            rendererClasses: {
                remove: 'test-remove',
                insert: 'test-insert',
                equal: 'test-equal'
            }
        })
        expect(container.querySelector('.test-remove')).toBeTruthy()
        expect(container.querySelector('.test-insert')).toBeTruthy()
        expect(container.querySelector('.test-equal')).toBeTruthy()
    })

    it('calls onProcessing with timing info', async () => {
        const onProcessing = vi.fn()
        render(SvelteDiffMatchPatch, {
            originalText: 'a',
            modifiedText: 'b',
            onProcessing
        })
        await waitFor(() => {
            expect(onProcessing).toHaveBeenCalled()
        })
        const timing = onProcessing.mock.calls[0][0]
        expect(typeof timing.main).toBe('number')
        expect(typeof timing.cleanup).toBe('number')
        expect(typeof timing.total).toBe('number')
    })

    it('uses default values for optional props', () => {
        const { component } = render(SvelteDiffMatchPatch, {
            originalText: 'foo',
            modifiedText: 'bar'
        })
        expect(component).toBeTruthy()
    })

    it('accepts all documented props', () => {
        const onProcessing = vi.fn()
        expect(() =>
            render(SvelteDiffMatchPatch, {
                originalText: 'a',
                modifiedText: 'b',
                timeout: 2,
                cleanupSemantic: true,
                cleanupEfficiency: 8,
                onProcessing,
                rendererClasses: { remove: 'del', insert: 'ins', equal: 'eq' },
                renderers: {}
            })
        ).not.toThrow()
    })
})
