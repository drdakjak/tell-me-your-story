import time

from bs4 import BeautifulSoup
from selenium.webdriver.chrome.options import Options
from seleniumwire import webdriver

from config import WEB_DRIVER_WAIT

def extract_text(html_content: str) -> str:
    soup = BeautifulSoup(html_content, 'html.parser')
    
    for script in soup(["script", "style"]):
        script.decompose()
    
    text = soup.get_text()
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)
    
    return text

def get_chrome_options():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument('--single-process')
    chrome_options.add_argument("--disable-dev-shm-usage")
    return chrome_options

def get_page_source(url: str) -> str:
    with webdriver.Chrome(options=get_chrome_options()) as driver:

        driver.get(url)
        time.sleep(WEB_DRIVER_WAIT)
        page_source = driver.page_source

    return page_source

def extract_text_from_url(url: str):
    page_source = get_page_source(url)
    text = extract_text(page_source)
    return text
