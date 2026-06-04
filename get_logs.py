import urllib.request
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(options=options)

driver.get('http://localhost:8080')
time.sleep(1)

# Click the button
try:
    start_btn = driver.find_element("id", "start-btn")
    start_btn.click()
    time.sleep(1)
except Exception as e:
    print(f"Failed to click: {e}")

logs = driver.get_log('browser')
for log in logs:
    print(f"LOG: {log}")

driver.quit()
