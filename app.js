// LinkedIn Scraper
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const randomUserAgent = require('random-useragent');
// const userAgent = require('user-agents');

// Add stealth plugin
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Generate random integer between 1 and 10
function randomTimeout() {
    return Math.floor(Math.random() * 5) + 1;
}

// Get companies
function getCompanies() {
  // Read file with companies
  try {
    const data = fs.readFileSync('companies.txt', 'utf8');
    return data;
  } catch (err) {
    console.error(err);
  }
}

// Scrape a query
async function scrape(port, company) {
  const browser = await puppeteer.launch({headless: false,
                                          slowMo: 20,
                                          // args: ['--proxy-server=socks5://127.0.0.1:' + 9053]
                                        });
  const page = (await browser.pages())[0];
  // await page.setUserAgent(userAgent.toString());
  await page.setUserAgent(randomUserAgent.getRandom());
  // Change viewport
  await page.setViewport({width: 1366, height: 768});
  await page.goto('https://google.com');
  await page.$("#oneGoogleBar");
  // Type in query
  let query = `site:linkedin.com "@${company}.com" "recruiter" email`;
  await page.keyboard.type(query);
  // Search
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  // Create timeout to limit request frequency
  // await page.waitForTimeout(5000 * randomTimeout());
  await page.waitForTimeout(5000);
  // // Scrape query results
  // // let links = await page.$$eval("a[href*='tutor']", as => as.map(a => a.href));
  // // console.log(links);

  // // Close browser
  await browser.close();
}

// Scrape and store results over companies
async function main() {
    const companies = getCompanies().split(/\r?\n/);
    // const ports = [
    //   '9050',
    //   '9052',
    //   '9053',
    //   '9054'
    // ];
    // for (var i = 0; i < companies.length; ++i) {
    //     await scrape(ports[i % 4], companies[i]);
    // }

    const browser = await puppeteer.launch({headless: false,
      slowMo: 20
    });
    const page = (await browser.pages())[0];
    // await page.setUserAgent(userAgent.toString());
    await page.setUserAgent(randomUserAgent.getRandom());
    // Change viewport
    await page.setViewport({width: 1366, height: 768});
    await page.goto('https://google.com');
    await page.$("#oneGoogleBar");
    let halt = companies.length / 2;
    for (var i = 0; i < companies.length; ++i) {
        // Type in query
        let query = `site:linkedin.com "@${company}.com" "recruiter" email`;
        await page.keyboard.type(query);
        // Search
        await page.keyboard.press('Enter');
        await page.waitForNavigation();
        // Create timeout to limit request frequency
        // await page.waitForTimeout(5000 * randomTimeout());
        await page.waitForTimeout(5000);
        // Timeout for ten minutes if halfway through list
        if (i === half) {
          await page.waitForTimeout(60000 * 10);
        }
        // // Scrape query results
        // // let links = await page.$$eval("a[href*='tutor']", as => as.map(a => a.href));
        // // console.log(links);
        // Clear Search logic
        await page.focus("input[name=q");
        // Highlight query
        for (let i = 0; i < query.length; i++) {
              await page.keyboard.press('ArrowRight');
        }
        await page.keyboard.down('Shift');
        for (let i = 0; i < query.length; i++) {
              await page.keyboard.press('ArrowLeft');
        }
        await page.keyboard.up('Shift');
        // Backspace query
        await page.keyboard.press('Backspace');
    }
    

    // // Close browser
    await browser.close();
    return;
}

main();


// Clear Search logic
  // await page.focus("input[name=q");
  // // Highlight query
  // for (let i = 0; i < query.length; i++) {
  //       await page.keyboard.press('ArrowRight');
  // }
  // await page.keyboard.down('Shift');
  // for (let i = 0; i < query.length; i++) {
  //       await page.keyboard.press('ArrowLeft');
  // }
  // await page.keyboard.up('Shift');
  // // Backspace query
  // await page.keyboard.press('Backspace');

