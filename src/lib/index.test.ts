import SvelteDiffMatchPatch from './SvelteDiffMatchPatch.svelte'
import type {
    CaptureRange,
    DisplayDiff,
    PatternMatchResult,
    RendererClasses,
    Renderers,
    SvelteDiffMatchPatchProps,
    SvelteDiffMatchPatchTiming
} from './index.js'

describe('index exports', () => {
    it('should export SvelteDiffMatchPatch as default', () => {
        expect(SvelteDiffMatchPatch).toBeDefined()
    })

    it('should export Renderers type', () => {
        const renderers: Renderers = {}
        expect(renderers).toBeDefined()
    })

    it('should export RendererClasses type', () => {
        const classes: RendererClasses = {}
        expect(classes).toBeDefined()
    })

    it('should export SvelteDiffMatchPatchTiming type', () => {
        const timing: SvelteDiffMatchPatchTiming = { main: 0, cleanup: 0, total: 0 }
        expect(timing).toBeDefined()
    })

    it('should export SvelteDiffMatchPatchProps type', () => {
        const props: SvelteDiffMatchPatchProps = {
            originalText: '',
            modifiedText: ''
        }
        expect(props).toBeDefined()
    })

    it('should export CaptureRange type', () => {
        const range: CaptureRange = { name: 'year', start: 0, end: 4 }
        expect(range).toBeDefined()
    })

    it('should export DisplayDiff type', () => {
        const diff: DisplayDiff = { operation: 0, text: 'hello' }
        expect(diff).toBeDefined()
        const expectedDiff: DisplayDiff = { operation: 0, text: '2024', expected: 'year' }
        expect(expectedDiff).toBeDefined()
    })

    it('should export PatternMatchResult type', () => {
        const result: PatternMatchResult = {
            resolvedText: 'hello',
            captures: { year: '2024' },
            captureRanges: [{ name: 'year', start: 0, end: 4 }]
        }
        expect(result).toBeDefined()
    })
})
