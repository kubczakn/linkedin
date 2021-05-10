// LinkedIn Scraper
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const randomUserAgent = require('random-useragent');
const Excel = require('exceljs');

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
    // Get companies 
    const companies = getCompanies().split(/\r?\n/);
    // Create a new workbook
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Recruiter LinkedIns');
    let columns = []
    // Add worksheet columns
    for (var i = 0; i < 1; ++i) {
      columns.push({header: `${companies[i]}`, 
                              key: 'link', 
                              width: 200});
    }
    worksheet.columns = columns;
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
    await page.focus("input[name=q");
    // await page.$("#oneGoogleBar");
    // Checkpoint for every ten iterations
    let checkpoint = 10;
    // Use i < companies.length for production
    for (var i = 0; i < 1; ++i) {
        // Type in query
        let query = `site:linkedin.com "@${companies[i]}.com" "recruiter" email`;
        await page.keyboard.type(query);
        // Search
        await page.keyboard.press('Enter');
        await page.waitForNavigation();
        // Scrape query results
        // TOOD: Add scrolling to grab all links
        let links = await page.$$eval("a[href*='www.linkedin.com']", as => as.map(a => a.href));
        // console.log(links);
        // Add links to company column in worksheet 
        for (var j = 0; j < links.length; j++) {
          worksheet.getRow(j + 2).values = {
              link: links[j]
          };
        }
        // Create random timeout to limit request frequency
        await page.waitForTimeout(5000 * randomTimeout());
        // Timeout for ten minutes if checkpoint hit 
        if (((i % checkpoint) === 0) && (i !== 0)) {
          console.log('Checkpoint hit!')
          await page.waitForTimeout(60000 * 10); 
        }
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
    

    // Close browser
    await browser.close();

    // Save Excel file 
    workbook.xlsx.writeFile('Links.xlsx');
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

