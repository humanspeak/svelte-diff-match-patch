export interface CaptureRange {
    name: string
    start: number
    end: number
}

export interface DisplayDiff {
    operation: number // -1, 0, 1
    text: string
    expected?: string // capture group name if this is an expected region
}

export interface PatternMatchResult {
    resolvedText: string
    captures: Record<string, string>
    captureRanges: CaptureRange[]
}

interface ParsedGroup {
    name: string
    pattern: string
}

interface ParseResult {
    groups: ParsedGroup[]
    /** Literal parts interleaved with groups: [literal0, group0, literal1, group1, ..., literalN] */
    parts: string[]
}

const GROUP_REGEX =
    /\(\?<([a-zA-Z_][a-zA-Z0-9_]*)>((?:[^()]*|\((?!\?<)(?:[^()]*|\([^()]*\))*\))*)?\)/g

/**
 * Parses `(?<name>pattern)` named capture groups from text.
 *
 * Extracts all named capture groups and returns them along with the
 * interleaved literal parts of the text.
 *
 * @param text - The template text containing named capture group syntax.
 * @returns The parsed groups and parts, or null if no named groups are found.
 */
export const parseExpectedPatterns = (text: string): ParseResult | null => {
    const groupRegex = new RegExp(GROUP_REGEX.source, GROUP_REGEX.flags)
    const groups: ParsedGroup[] = []
    const parts: string[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = groupRegex.exec(text)) !== null) {
        parts.push(text.slice(lastIndex, match.index))
        groups.push({ name: match[1], pattern: match[2] ?? '' })
        parts.push(match[0]) // the full group match as a placeholder
        lastIndex = groupRegex.lastIndex
    }

    if (groups.length === 0) return null

    parts.push(text.slice(lastIndex))
    return { groups, parts }
}

/**
 * Replaces `(?<name>pattern)` groups with readable `<name>` placeholders.
 *
 * Used as a fallback when the regex doesn't match modifiedText, so users
 * see clean placeholder names instead of raw regex syntax.
 *
 * @param text - The template text containing named capture group syntax.
 * @returns The text with capture groups replaced by `<name>` placeholders.
 */
export const cleanTemplate = (text: string): string => {
    const groupRegex = new RegExp(GROUP_REGEX.source, GROUP_REGEX.flags)
    return text.replace(groupRegex, (_, name) => `<${name}>`)
}

/**
 * Escapes special regex characters in a string for use as a literal pattern.
 *
 * @param str - The string to escape.
 * @returns The escaped string safe for use in a RegExp constructor.
 */
const escapeRegExp = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Information about a group's position in the original template line.
 */
interface LineGroup {
    name: string
    pattern: string
    /** Index within the line where the full group syntax starts */
    indexInLine: number
}

/**
 * Groups parsed capture groups by which line of the original text they appear on.
 *
 * Scans the original text for capture group matches and maps each to its
 * corresponding line number, computing the index within that line.
 *
 * @param originalText - The full template text containing capture groups.
 * @param _parseResult - The parsed result (unused, groups are re-scanned from text).
 * @returns A map of line number to `{ lineText, groups[] }`.
 */
const groupByLine = (
    originalText: string,
    _parseResult: ParseResult
): Map<number, { lineText: string; groups: LineGroup[] }> => {
    const groupRegex = new RegExp(GROUP_REGEX.source, GROUP_REGEX.flags)
    const lines = originalText.split('\n')

    const lineMap = new Map<number, { lineText: string; groups: LineGroup[] }>()
    let match: RegExpExecArray | null

    while ((match = groupRegex.exec(originalText)) !== null) {
        const absIndex = match.index
        let charCount = 0
        let lineNum = 0
        for (let i = 0; i < lines.length; i++) {
            const lineEnd = charCount + lines[i].length
            if (absIndex >= charCount && absIndex <= lineEnd) {
                lineNum = i
                break
            }
            charCount += lines[i].length + 1 // +1 for '\n'
        }

        if (!lineMap.has(lineNum)) {
            lineMap.set(lineNum, { lineText: lines[lineNum], groups: [] })
        }

        let lineStartOffset = 0
        for (let i = 0; i < lineNum; i++) {
            lineStartOffset += lines[i].length + 1
        }

        lineMap.get(lineNum)!.groups.push({
            name: match[1],
            pattern: match[2] ?? '',
            indexInLine: absIndex - lineStartOffset
        })
    }

    return lineMap
}

/**
 * Computes the length of the full `(?<name>pattern)` syntax for a group.
 *
 * @param group - The line group whose syntax length to compute.
 * @returns The character length of the `(?<name>pattern)` string.
 */
const groupSyntaxLength = (group: LineGroup): number => {
    // (?< + name + > + pattern + )
    return 5 + group.name.length + group.pattern.length
}

/**
 * Builds a context-anchored, gap-flexible regex for a template line containing groups.
 *
 * The resulting regex:
 * - Uses the literal text before the first group as an escaped context anchor.
 * - Inserts a flexible `[\s\S]*?` gap between the prefix and the first group
 *   to tolerate extra content (e.g., "(c)") in text2.
 * - Preserves literal text between groups as escaped anchors.
 * - Keeps named groups as-is.
 * - Is unanchored (no `^`/`$`) so it can search anywhere in text2.
 * - Uses the `d` flag for `match.indices` (no `s` flag so `.` doesn't match `\n`).
 *
 * @param lineText - The template line text containing capture group syntax.
 * @param groups - The capture groups found on this line with their positions.
 * @returns A RegExp that can extract captures from text2.
 */
const buildLineRegex = (lineText: string, groups: LineGroup[]): RegExp => {
    const sorted = [...groups].sort((a, b) => a.indexInLine - b.indexInLine)

    let pattern = ''

    // Context anchor: literal text before the first group
    const firstGroup = sorted[0]
    const contextPrefix = lineText.slice(0, firstGroup.indexInLine)
    if (contextPrefix.length > 0) {
        pattern += escapeRegExp(contextPrefix)
    }

    // Flexible gap between context prefix and first group
    pattern += '[\\s\\S]*?'

    // First group
    pattern += `(?<${sorted[0].name}>${sorted[0].pattern})`

    // Subsequent groups with literal anchors between them
    for (let i = 1; i < sorted.length; i++) {
        const prevGroup = sorted[i - 1]
        const currGroup = sorted[i]

        const prevGroupEndIndex = prevGroup.indexInLine + groupSyntaxLength(prevGroup)
        const literalBetween = lineText.slice(prevGroupEndIndex, currGroup.indexInLine)

        if (literalBetween.length > 0) {
            pattern += escapeRegExp(literalBetween)
        }

        pattern += `(?<${currGroup.name}>${currGroup.pattern})`
    }

    return new RegExp(pattern, 'd')
}

interface ExtractResult {
    resolvedText: string
    captures: Record<string, string>
    captureRangesInText2: CaptureRange[]
}

/**
 * Extracts captures from modifiedText using context-anchored, gap-flexible regexes.
 *
 * Builds per-line regexes for template lines containing capture groups, searches
 * text2 with the `d` flag for `match.indices`, and builds resolvedText by
 * substituting captured values into the template.
 *
 * @param originalText - The template text containing named capture groups.
 * @param modifiedText - The actual text (text2) to extract captures from.
 * @param parseResult - The result of parsing capture groups from originalText.
 * @returns The resolved text, captures, and capture ranges in text2,
 *     or null if any line's regex fails to match.
 */
export const extractCaptures = (
    originalText: string,
    modifiedText: string,
    parseResult: ParseResult
): ExtractResult | null => {
    const lineMap = groupByLine(originalText, parseResult)

    const allCaptures: Record<string, string> = {}
    const captureRangesInText2: CaptureRange[] = []

    for (const [, { lineText, groups }] of lineMap) {
        const regex = buildLineRegex(lineText, groups)
        const match = regex.exec(modifiedText)

        if (!match || !match.groups || !match.indices?.groups) {
            return null
        }

        for (const group of groups) {
            const value = match.groups[group.name]
            if (value === undefined) return null

            allCaptures[group.name] = value

            const indices = match.indices.groups[group.name]
            if (!indices) return null

            captureRangesInText2.push({
                name: group.name,
                start: indices[0],
                end: indices[1]
            })
        }
    }

    const resolvedText = resolveTemplate(originalText, allCaptures)

    captureRangesInText2.sort((a, b) => a.start - b.start)

    return { resolvedText, captures: allCaptures, captureRangesInText2 }
}

/**
 * Replaces named capture group syntax in a template with actual captured values.
 *
 * Substitutes each `(?<name>pattern)` occurrence with the corresponding
 * captured value from the captures record.
 *
 * @param text - The template text containing capture group syntax.
 * @param captures - A record mapping group names to their captured values.
 * @returns The template with capture groups replaced by their captured values.
 */
const resolveTemplate = (text: string, captures: Record<string, string>): string => {
    const groupRegex = new RegExp(GROUP_REGEX.source, GROUP_REGEX.flags)
    return text.replace(groupRegex, (_, name) => captures[name] ?? '')
}

/**
 * Walks through diffs and tags segments that overlap with capture ranges in text2.
 *
 * Tracks position in text2 (modifiedText) as it processes each diff segment:
 * - **Equal (0):** Advances text2Pos. Splits at capture boundaries and tags
 *   overlapping parts with the capture group name.
 * - **Insert (1):** Advances text2Pos only. Checks for overlap with capture
 *   ranges and tags overlapping parts.
 * - **Remove (-1):** Does not advance text2Pos. Passes through as-is.
 *
 * @param diffs - The diff tuples from diff-match-patch (resolvedText vs modifiedText).
 * @param captureRanges - The capture ranges with positions in text2.
 * @returns An array of DisplayDiff objects with expected group tagging applied.
 */
export const tagExpectedRegions = (
    diffs: [number, string][],
    captureRanges: CaptureRange[]
): DisplayDiff[] => {
    if (captureRanges.length === 0) {
        return diffs.map(([operation, text]) => ({ operation, text }))
    }

    const result: DisplayDiff[] = []
    let text2Pos = 0

    for (const [operation, text] of diffs) {
        if (operation === -1) {
            result.push({ operation, text })
            continue
        }

        if (operation === 1) {
            const segStart = text2Pos
            const segEnd = text2Pos + text.length

            const overlapping = captureRanges.filter((cr) => cr.start < segEnd && cr.end > segStart)

            if (overlapping.length === 0) {
                result.push({ operation, text })
            } else {
                let cursor = segStart
                for (const cr of overlapping) {
                    if (cursor < cr.start) {
                        const beforeLen = cr.start - cursor
                        result.push({
                            operation: 1,
                            text: text.slice(cursor - segStart, cursor - segStart + beforeLen)
                        })
                        cursor = cr.start
                    }
                    const overlapStart = Math.max(cursor, cr.start)
                    const overlapEnd = Math.min(segEnd, cr.end)
                    if (overlapStart < overlapEnd) {
                        result.push({
                            operation: 0,
                            text: text.slice(overlapStart - segStart, overlapEnd - segStart),
                            expected: cr.name
                        })
                        cursor = overlapEnd
                    }
                }
                if (cursor < segEnd) {
                    result.push({
                        operation: 1,
                        text: text.slice(cursor - segStart)
                    })
                }
            }

            text2Pos = segEnd
            continue
        }

        // Equal (0): advance both positions, check text2 overlap
        const segStart = text2Pos
        const segEnd = text2Pos + text.length

        const overlapping = captureRanges.filter((cr) => cr.start < segEnd && cr.end > segStart)

        if (overlapping.length === 0) {
            result.push({ operation: 0, text })
        } else {
            let cursor = segStart
            for (const cr of overlapping) {
                if (cursor < cr.start) {
                    const beforeLen = cr.start - cursor
                    result.push({
                        operation: 0,
                        text: text.slice(cursor - segStart, cursor - segStart + beforeLen)
                    })
                    cursor = cr.start
                }
                const overlapStart = Math.max(cursor, cr.start)
                const overlapEnd = Math.min(segEnd, cr.end)
                if (overlapStart < overlapEnd) {
                    result.push({
                        operation: 0,
                        text: text.slice(overlapStart - segStart, overlapEnd - segStart),
                        expected: cr.name
                    })
                    cursor = overlapEnd
                }
            }
            if (cursor < segEnd) {
                result.push({
                    operation: 0,
                    text: text.slice(cursor - segStart)
                })
            }
        }

        text2Pos = segEnd
    }

    return result
}
