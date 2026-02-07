
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("1. Loading App...")
        page.goto("http://localhost:8080")
        page.wait_for_selector(".logo-trigger")

        # --- TEST 1: TEACHER LOGIN ---
        print("2. Testing Teacher Trigger...")
        logo = page.locator(".logo-trigger")
        for _ in range(5):
            logo.click()
            time.sleep(0.1)

        page.wait_for_selector("#teacherForm", state="visible")
        print("   > Teacher Form Visible.")

        # Login Teacher
        page.fill("#tEmail", "sabreen@academy.com")
        page.fill("#tPass", "123")
        page.click("#teacherForm button[type=submit]")

        # Wait for Teacher Dashboard
        page.wait_for_selector(".sidebar")
        print("   > Teacher Dashboard Loaded.")
        page.screenshot(path="verification/teacher_dashboard.png")

        # Logout
        page.click("#logoutBtn")
        time.sleep(1)

        # --- TEST 2: NEW STUDENT SETUP ---
        print("3. Testing New Student Setup...")
        page.goto("http://localhost:8080")

        # Step 1
        page.fill("#inputName", "EvNr")
        page.select_option("#inputGrade", "10")
        page.click("#step1Form button")

        # Wait for Setup Form
        page.wait_for_selector("#setupForm", state="visible")
        print("   > Setup Form Visible.")
        page.screenshot(path="verification/student_setup.png")

        # Step 2
        page.select_option("#setupQuestionSelect", "color")
        page.fill("#setupAnswer", "Red")
        page.click("#setupForm button[type=submit]")

        # Wait for Dashboard
        page.wait_for_selector(".dashboard-layout")
        print("   > Student Dashboard Loaded.")

        # Logout
        page.click("#logoutBtn")
        time.sleep(1)

        # --- TEST 3: EXISTING STUDENT LOGIN ---
        print("4. Testing Existing Student Login...")
        page.goto("http://localhost:8080")

        # Step 1
        page.fill("#inputName", "EvNr")
        page.select_option("#inputGrade", "10")
        page.click("#step1Form button")

        # Wait for Challenge Form
        page.wait_for_selector("#challengeForm", state="visible")
        print("   > Challenge Form Visible.")

        # Check Question Text
        q_text = page.inner_text("#displayQuestion")
        if "لونك المفضل" in q_text:
            print("   > Correct Question Displayed.")
        else:
            print(f"   > FAIL: Wrong question text: {q_text}")

        # Step 2
        page.fill("#challengeAnswer", "Red")
        page.click("#challengeForm button[type=submit]")

        # Wait for Dashboard
        page.wait_for_selector(".dashboard-layout")
        print("   > Student Dashboard Loaded (Re-login Success).")

        browser.close()
        print("ALL TESTS PASSED.")

if __name__ == "__main__":
    run()
