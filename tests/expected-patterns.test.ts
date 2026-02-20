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
        // Use \w+ instead of .+ so the capture is constrained to "Jason" only,
        // leaving "coding" vs "hacking" as a real deviation for insert/remove
        await page.getByTestId('text1').fill('(?<name>\\w+) likes coding')
        await page.getByTestId('text2').fill('Jason likes hacking')
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
