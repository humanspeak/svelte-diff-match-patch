import SvelteDiffMatchPatch from './SvelteDiffMatchPatch.svelte'
import type {
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
})
