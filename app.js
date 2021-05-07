// LinkedIn Scraper
const puppeteer = require('puppeteer-extra');
const fs = require('fs');

// Add stealth plugin
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

function getCompanies() {
  // Read file with companies
  try {
    const data = fs.readFileSync('companies.txt', 'utf8');
    return data;
  } catch (err) {
    console.error(err);
  }
}

// Search and store results
(async () => {
  let companies = getCompanies().split(/\r?\n/);
  const browser = await puppeteer.launch({headless: false,
                                          slowMo: 20,
                                        });
  const page = await browser.newPage();
  // Change viewport
  await page.setViewport({width: 1366, height: 768});
  await page.goto('https://google.com');
  await page.$("#oneGoogleBar");
  // Perform queries
  // Let i = 1 to limit # of requests while debugging
  // change to i < companies.length for production
  for (var i = 0; i < 1; i++) {
    // Type in query
    let query = `site:linkedin.com "@${companies[i]}.com" "recruiter" email`;
    await page.keyboard.type(query);
    // Search
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    // Create timeout to limit request frequency
    await page.waitForTimeout(5000);
    // Scrape query results
    // let links = await page.$$eval("a[href*='tutor']", as => as.map(a => a.href));
    // console.log(links);
    // Clear Search
    await page.focus("input[name=q");
    // Highlight query
    for (let i = 0; i < query.length; i++)
      await page.keyboard.press('ArrowRight');
    await page.keyboard.down('Shift');
    for (let i = 0; i < query.length; i++)
      await page.keyboard.press('ArrowLeft');
    await page.keyboard.up('Shift');
    // Backspace query
    await page.keyboard.press('Backspace');
  }
  // Close browser
  await browser.close(); 
})();

