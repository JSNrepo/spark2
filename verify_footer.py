import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to the home page (the footer is on the home page as part of the Layout)
        await page.goto('http://localhost:5173/')

        # Wait for the footer to load
        await page.wait_for_selector('footer')

        # Scroll to the bottom to ensure footer is in view
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')

        # Wait a moment for scroll and any lazy loading
        await page.wait_for_timeout(1000)

        # Focus on the first social link (Facebook)
        await page.focus('a[aria-label="Visit our Facebook page"]')

        # Capture a screenshot of the footer with the focused link
        await page.locator('footer').screenshot(path='public/footer-social-focus.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())