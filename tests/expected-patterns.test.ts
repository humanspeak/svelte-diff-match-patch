import { expect, test } from '@playwright/test'

test.describe('Expected Patterns', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tests/expected-patterns')
    })

    test('renders expected regions with distinct styling', async ({ page }) => {
        await expect(
            page.getByTestId('diff-result').locator('.diff-expected').first()
        ).toBeVisible()
    })

    test('expected regions have title attribute with group name', async ({ page }) => {
        await expect(page.getByTestId('diff-result').locator('span[title="year"]')).toBeVisible()
        await expect(page.getByTestId('diff-result').locator('span[title="holder"]')).toBeVisible()
    })

    test('non-captured deviations still show as insert/remove', async ({ page }) => {
        // Use a simple template where we can have both expected captures and deviations
        await page.getByTestId('text1').fill('Hello (?<name>.+) end')
        await page.getByTestId('text2').fill('Goodbye World end')
        // "World" is captured as expected, but "Hello" vs "Goodbye" is a real deviation
        // Actually regex won't match because "Hello" != "Goodbye" literal...
        // Use: template matches but has surrounding diffs from diff algorithm
        await page.getByTestId('text1').fill('(?<name>.+) likes coding')
        await page.getByTestId('text2').fill('Jason likes hacking')
        // "Jason" is captured, "coding" vs "hacking" is a real deviation
        await expect(
            page.getByTestId('diff-result').locator('.diff-expected').first()
        ).toBeVisible()
        await expect(page.getByTestId('diff-result').locator('.diff-remove').first()).toBeVisible()
        await expect(page.getByTestId('diff-result').locator('.diff-insert').first()).toBeVisible()
    })

    test('falls back to normal diff when regex does not match', async ({ page }) => {
        await page.getByTestId('text2').fill('This is not a license at all')
        await expect(page.getByTestId('diff-result').locator('.diff-expected')).toHaveCount(0)
        await expect(page.getByTestId('diff-result').locator('.diff-remove').first()).toBeVisible()
    })

    test('works like normal diff when no capture groups in original', async ({ page }) => {
        await page.getByTestId('text1').fill('hello world')
        await page.getByTestId('text2').fill('hello brave world')
        await expect(page.getByTestId('diff-result').locator('.diff-expected')).toHaveCount(0)
        await expect(page.getByTestId('diff-result')).toContainText('brave')
    })
})
