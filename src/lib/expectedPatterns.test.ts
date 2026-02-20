import { describe, expect, it } from 'vitest'
import {
    cleanTemplate,
    extractCaptures,
    parseExpectedPatterns,
    tagExpectedRegions
} from './expectedPatterns.js'

describe('parseExpectedPatterns', () => {
    it('returns null when no groups are present', () => {
        expect(parseExpectedPatterns('hello world')).toBeNull()
    })

    it('returns null for plain parentheses without named groups', () => {
        expect(parseExpectedPatterns('foo (bar) baz')).toBeNull()
    })

    it('parses a single named group', () => {
        const result = parseExpectedPatterns('Copyright (?<year>\\d{4}) MIT')
        expect(result).not.toBeNull()
        expect(result!.groups).toHaveLength(1)
        expect(result!.groups[0]).toEqual({ name: 'year', pattern: '\\d{4}' })
    })

    it('parses multiple named groups', () => {
        const result = parseExpectedPatterns('(?<year>.*?) (?<holder>.*?)')
        expect(result).not.toBeNull()
        expect(result!.groups).toHaveLength(2)
        expect(result!.groups[0].name).toBe('year')
        expect(result!.groups[1].name).toBe('holder')
    })

    it('handles groups at the start and end of text', () => {
        const result = parseExpectedPatterns('(?<start>\\w+) middle (?<end>\\w+)')
        expect(result).not.toBeNull()
        expect(result!.groups).toHaveLength(2)
        expect(result!.groups[0].name).toBe('start')
        expect(result!.groups[1].name).toBe('end')
    })

    it('handles groups with dotAll pattern', () => {
        const result = parseExpectedPatterns('(?<content>.*)')
        expect(result).not.toBeNull()
        expect(result!.groups[0].pattern).toBe('.*')
    })
})

describe('extractCaptures', () => {
    it('returns null when capture patterns are genuinely absent', () => {
        const text = 'Copyright (?<year>\\d{4}) MIT'
        const parsed = parseExpectedPatterns(text)!
        const result = extractCaptures(text, 'completely different text', parsed)
        expect(result).toBeNull()
    })

    it('extracts captures on a perfect match', () => {
        const original = 'Copyright (?<year>\\d{4}) (?<holder>.+)'
        const modified = 'Copyright 2024 Jason Kummerl'
        const parsed = parseExpectedPatterns(original)!
        const result = extractCaptures(original, modified, parsed)

        expect(result).not.toBeNull()
        expect(result!.captures.year).toBe('2024')
        expect(result!.captures.holder).toBe('Jason Kummerl')
        expect(result!.resolvedText).toBe('Copyright 2024 Jason Kummerl')
    })

    it('computes correct capture ranges in text2', () => {
        const original = 'Copyright (?<year>\\d{4}) MIT'
        const modified = 'Copyright 2024 MIT'
        const parsed = parseExpectedPatterns(original)!
        const result = extractCaptures(original, modified, parsed)

        expect(result).not.toBeNull()
        expect(result!.captureRangesInText2).toHaveLength(1)
        // "Copyright " is 10 chars, then "2024" at [10, 14]
        expect(result!.captureRangesInText2[0]).toEqual({ name: 'year', start: 10, end: 14 })
    })

    it('handles partial match with extra content in text2', () => {
        const original = 'Copyright (?<year>\\d{4}) (?<holder>.+)'
        const modified = 'MIT License\n\nCopyright (c) 2024 Jason Kummerl'
        const parsed = parseExpectedPatterns(original)!
        const result = extractCaptures(original, modified, parsed)

        expect(result).not.toBeNull()
        expect(result!.captures.year).toBe('2024')
        expect(result!.captures.holder).toBe('Jason Kummerl')
        // Verify ranges point into modified text
        expect(
            modified.slice(
                result!.captureRangesInText2[0].start,
                result!.captureRangesInText2[0].end
            )
        ).toBe('2024')
        expect(
            modified.slice(
                result!.captureRangesInText2[1].start,
                result!.captureRangesInText2[1].end
            )
        ).toBe('Jason Kummerl')
    })

    it('handles multiple groups on same line', () => {
        const original = '(?<a>\\w+) and (?<b>\\w+)'
        const modified = 'foo and bar'
        const parsed = parseExpectedPatterns(original)!
        const result = extractCaptures(original, modified, parsed)

        expect(result).not.toBeNull()
        expect(result!.captures.a).toBe('foo')
        expect(result!.captures.b).toBe('bar')
        expect(
            modified.slice(
                result!.captureRangesInText2[0].start,
                result!.captureRangesInText2[0].end
            )
        ).toBe('foo')
        expect(
            modified.slice(
                result!.captureRangesInText2[1].start,
                result!.captureRangesInText2[1].end
            )
        ).toBe('bar')
    })

    it('handles groups on different lines', () => {
        const original = 'Name: (?<name>.+)\nYear: (?<year>\\d{4})'
        const modified = 'Name: Alice\nYear: 2025'
        const parsed = parseExpectedPatterns(original)!
        const result = extractCaptures(original, modified, parsed)

        expect(result).not.toBeNull()
        expect(result!.captures.name).toBe('Alice')
        expect(result!.captures.year).toBe('2025')
        expect(
            modified.slice(
                result!.captureRangesInText2[0].start,
                result!.captureRangesInText2[0].end
            )
        ).toBe('Alice')
        expect(
            modified.slice(
                result!.captureRangesInText2[1].start,
                result!.captureRangesInText2[1].end
            )
        ).toBe('2025')
    })

    it('builds resolvedText by substituting captures into template', () => {
        const original = 'START (?<val>\\d+) END'
        const modified = 'START 42 END'
        const parsed = parseExpectedPatterns(original)!
        const result = extractCaptures(original, modified, parsed)

        expect(result).not.toBeNull()
        expect(result!.resolvedText).toBe('START 42 END')
    })
})

describe('tagExpectedRegions', () => {
    it('passes through when no capture ranges', () => {
        const diffs: [number, string][] = [
            [0, 'hello '],
            [-1, 'world'],
            [1, 'there']
        ]
        const result = tagExpectedRegions(diffs, [])
        expect(result).toEqual([
            { operation: 0, text: 'hello ' },
            { operation: -1, text: 'world' },
            { operation: 1, text: 'there' }
        ])
    })

    it('tags an equal segment that overlaps a capture range in text2', () => {
        // resolvedText: "Copyright 2024 MIT" vs text2: "Copyright 2024 MIT"
        // Both identical, so single equal diff. Capture at [10,14] in text2.
        const diffs: [number, string][] = [[0, 'Copyright 2024 MIT']]
        const ranges = [{ name: 'year', start: 10, end: 14 }]
        const result = tagExpectedRegions(diffs, ranges)

        expect(result).toEqual([
            { operation: 0, text: 'Copyright ' },
            { operation: 0, text: '2024', expected: 'year' },
            { operation: 0, text: ' MIT' }
        ])
    })

    it('handles inserts before equal segments (text2 position tracking)', () => {
        // resolvedText: "Hello World"
        // text2:        "PREFIX Hello World"
        // diffs: [1, "PREFIX "], [0, "Hello World"]
        // Capture range in text2: "World" at [13, 18]
        const diffs: [number, string][] = [
            [1, 'PREFIX '],
            [0, 'Hello World']
        ]
        const ranges = [{ name: 'g', start: 13, end: 18 }]
        const result = tagExpectedRegions(diffs, ranges)

        expect(result).toEqual([
            { operation: 1, text: 'PREFIX ' },
            { operation: 0, text: 'Hello ' },
            { operation: 0, text: 'World', expected: 'g' }
        ])
    })

    it('preserves remove diffs without advancing text2 position', () => {
        // resolvedText: "ab cd"
        // text2:        "cd"
        // diffs: [-1, "ab "], [0, "cd"]
        // Capture at text2 [0, 2] ("cd")
        const diffs: [number, string][] = [
            [-1, 'ab '],
            [0, 'cd']
        ]
        const ranges = [{ name: 'g', start: 0, end: 2 }]
        const result = tagExpectedRegions(diffs, ranges)

        expect(result).toEqual([
            { operation: -1, text: 'ab ' },
            { operation: 0, text: 'cd', expected: 'g' }
        ])
    })

    it('handles multiple captures in one equal segment', () => {
        // text2: "A B C" — captures at [0,1] and [4,5]
        const diffs: [number, string][] = [[0, 'A B C']]
        const ranges = [
            { name: 'first', start: 0, end: 1 },
            { name: 'second', start: 4, end: 5 }
        ]
        const result = tagExpectedRegions(diffs, ranges)

        expect(result).toEqual([
            { operation: 0, text: 'A', expected: 'first' },
            { operation: 0, text: ' B ' },
            { operation: 0, text: 'C', expected: 'second' }
        ])
    })

    it('splits at capture boundaries correctly', () => {
        // text2: "hello2024world"
        const diffs: [number, string][] = [[0, 'hello2024world']]
        const ranges = [{ name: 'year', start: 5, end: 9 }]
        const result = tagExpectedRegions(diffs, ranges)

        expect(result).toEqual([
            { operation: 0, text: 'hello' },
            { operation: 0, text: '2024', expected: 'year' },
            { operation: 0, text: 'world' }
        ])
    })
})

describe('cleanTemplate', () => {
    it('replaces named groups with readable placeholders', () => {
        expect(cleanTemplate('Copyright (?<year>\\d{4}) (?<holder>.+)')).toBe(
            'Copyright <year> <holder>'
        )
    })

    it('returns text unchanged when no groups present', () => {
        expect(cleanTemplate('hello world')).toBe('hello world')
    })

    it('handles groups with complex patterns', () => {
        expect(cleanTemplate('(?<name>.*?) end')).toBe('<name> end')
    })
})
