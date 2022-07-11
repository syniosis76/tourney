from playwright.sync_api import sync_playwright

def test_browser(browser_name):
    playwright = sync_playwright().start()
    if browser_name == 'webkit':
        browser = playwright.webkit.launch()
    else:
        browser = playwright.chromium.launch()
    
    page = browser.new_page()

    page.goto('https://www.tourney.nz/')
    page.wait_for_timeout(3000) # Todo
    #with page.expect_request("**/*logo*.png") as first:
    #    page.goto("https://wikipedia.org")
    #print(first.value.url)
    page.screenshot(path = browser_name + '_01_root.png')

    page.goto('https://www.tourney.nz/#/')
    page.wait_for_timeout(3000) # Todo
    page.screenshot(path = browser_name + '_02_tournaments.png')

    page.goto('https://www.tourney.nz/#/6HFv9HVjv68D7Pn2KwHtXB')
    page.wait_for_timeout(3000) # Todo
    page.screenshot(path = browser_name + '_03_tournament.png')

    browser.close()
    playwright.stop()
    
test_browser('chromium')
test_browser('webkit')