from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    context.add_cookies([{
        "name": "session-token",
        "value": "admin-session",
        "url": "http://localhost:3001"
    }])
    page = context.new_page()

    # Listen for all console events and print them to the terminal
    page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

    page.goto("http://localhost:3001/admin/catalog/products")

    try:
        page.wait_for_selector('table', timeout=15000) # shorter timeout for faster feedback
        page.screenshot(path="jules-scratch/verification/verification.png")
    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
