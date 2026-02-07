from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Capture Console Logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"ERROR: {exc}"))

        page.goto("http://localhost:8080")

        # Login
        print("Filling form...")
        page.click("#tabLogin")
        page.fill("#loginName", "EvNr")
        page.fill("#loginPass", "123")
        page.click("#loginForm button[type=submit]")

        print("Waiting...")
        page.wait_for_timeout(3000)

        page.screenshot(path="verification/debug_login_fail.png")
        print("Screenshot taken.")

        content = page.content()
        # Check if error message is visible
        if "بيانات الدخول غير صحيحة" in content:
            print("Login Failed: Credentials incorrect")
        elif "dashboard-layout" in content:
            print("Login Success")
        else:
            print("Unknown State")

        browser.close()

if __name__ == "__main__":
    run()
