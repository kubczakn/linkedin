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

// Scrape and store results over companies
async function main() {
    // Get companies 
    const companies = getCompanies().split(/\r?\n/);
    // Create a new workbook
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Recruiter LinkedIns');
    let columns = []
    // Add worksheet columns
    for (var i = 0; i < 2; ++i) {
      columns.push({header: `${companies[i]}`, 
                              key: `${companies[i]}`, 
                              width: 200});
    }
    worksheet.columns = columns;
    // Make headers bold  
    worksheet.getRow(1).font = {bold: true}

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
    for (var i = 0; i < 2; ++i) {
        // Type in query
        let query = `site:linkedin.com "@${companies[i]}.com" "recruiter" email`;
        await page.keyboard.type(query);
        // Search
        await page.keyboard.press('Enter');
        await page.waitForNavigation();
        // Scrape query results
        let links = await page.$$eval("a[href*='www.linkedin.com']", as => as.map(a => a.href));
        // Add links to company column in worksheet
        let col = worksheet.getColumn(`${companies[i]}`); 
        col.values = col.values.concat(links);
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

