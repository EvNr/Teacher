
from playwright.sync_api import sync_playwright
import time
import requests
from datetime import datetime, timezone, timedelta

# Helper to simulate Backend State Change
def send_alert_via_api():
    url = "http://localhost:8080/api/chat_write.php"
    # Add a small buffer to ensure it's "future" compared to browser load time
    future_time = datetime.now(timezone.utc) + timedelta(seconds=2)
    now_iso = future_time.isoformat()

    payload = {
        "type": "ALERT",
        "payload": {
            "title": "Test Alert",
            "message": "This is a real-time notification test.",
            "date": now_iso
        }
    }
    try:
        requests.post(url, json=payload)
        print(f"   > Simulated Teacher sending Alert via API at {now_iso}.")
    except Exception as e:
        print(f"   > API Error: {e}")

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Listen to console
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        # 1. Login as Student
        print("1. Logging in as Student...")
        page.goto("http://localhost:8080")
        page.fill("#inputName", "EvNr")
        page.select_option("#inputGrade", "10")
        page.click("#step1Form button")

        # Wait for either Setup or Challenge
        try:
            # Check if Setup Form appears
            setup = page.wait_for_selector("#setupForm", timeout=2000, state="visible")
            if setup:
                print("   > New User detected. Setting up...")
                page.select_option("#setupQuestionSelect", "color")
                page.fill("#setupAnswer", "Red")
                page.click("#setupForm button[type=submit]")
        except:
            # If not setup, maybe Challenge?
            print("   > Setup form not found, checking Challenge...")
            try:
                page.wait_for_selector("#challengeForm", timeout=2000, state="visible")
                print("   > Existing User detected. Answering challenge...")
                page.fill("#challengeAnswer", "Red")
                page.click("#challengeForm button[type=submit]")
            except:
                print("   > stuck on step 1?")

        page.wait_for_selector(".dashboard-layout")
        print("   > Student Dashboard Active.")

        # 2. Verify Floating Chat Button
        if page.is_visible("#fabChat"):
            print("   > SUCCESS: Floating Chat Button is visible.")
        else:
            print("   > FAIL: Floating Chat Button missing.")

        # 3. Trigger Real-time Alert
        print("2. Triggering External Alert...")
        time.sleep(2) # Ensure we are definitely after page load
        send_alert_via_api()

        # 4. Wait for Pop-up
        print("3. Waiting for Pop-up...")
        try:
            page.wait_for_selector("text=Test Alert", timeout=8000)
            print("   > SUCCESS: Alert Pop-up appeared!")
        except Exception as e:
            print(f"   > FAIL: Pop-up did not appear. {e}")
            page.screenshot(path="verification/alert_fail.png")

        # 5. Check Bell Icon
        print("4. Checking Bell Icon...")
        dot_visible = page.is_visible("#bellDot")
        if dot_visible:
             print("   > SUCCESS: Red notification dot is visible.")
        else:
             print("   > FAIL: Red dot not visible.")

        page.click("#bellIcon")
        page.wait_for_selector("#notifModal")
        if "real-time notification test" in page.inner_text("#notifList"):
            print("   > SUCCESS: Alert content present in Bell Menu.")
        else:
            print("   > FAIL: Alert content missing from Bell Menu.")

        browser.close()

if __name__ == "__main__":
    run()
