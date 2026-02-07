from playwright.sync_api import sync_playwright

def verify_vision_theme():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # 1. Load Homepage (Login)
        print("Loading Login Page...")
        page.goto("http://localhost:8080")
        page.wait_for_selector(".split-screen")
        page.screenshot(path="verification/vision_login.png")
        print("Login Page Captured.")

        # 2. Register Flow
        print("Testing Register Tab...")
        page.click("#tabRegister")
        page.wait_for_selector("#registerForm", state="visible")
        page.screenshot(path="verification/vision_register.png")

        print("Registering EvNr...")
        page.fill("#regName", "EvNr")
        page.select_option("#regGrade", "10")
        # Grade 10 has no section, so skip #regSection
        page.fill("#regPass", "123")
        page.click("#registerForm button[type=submit]")

        # Wait for Dashboard (Auto-login after register)
        print("Waiting for Dashboard...")
        try:
            page.wait_for_selector(".dashboard-layout", timeout=5000)
            page.screenshot(path="verification/vision_dashboard.png")
            print("Dashboard Captured.")
        except:
            print("Dashboard timeout. Taking screenshot of failure.")
            page.screenshot(path="verification/dashboard_fail.png")
            raise

        # 4. Check Resources
        print("Checking Resources...")
        page.click(".nav-item[data-tab='resources']")
        page.wait_for_selector("text=الرياضيات 1-1")
        page.screenshot(path="verification/vision_resources.png")
        print("Resources Captured.")

        # 5. Check Chat
        print("Checking Chat...")
        page.click(".nav-item[data-tab='chat']")
        page.wait_for_selector(".chat-header")
        page.wait_for_timeout(2000) # Wait for poll
        page.screenshot(path="verification/vision_chat.png")
        print("Chat Captured.")

        browser.close()

if __name__ == "__main__":
    verify_vision_theme()
