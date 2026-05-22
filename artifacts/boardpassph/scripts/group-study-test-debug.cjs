const { chromium } = require('playwright');

(async () => {
  const base = 'http://localhost:4173/';
  const timestamp = Date.now();
  const user1Email = `playwright_user1_${timestamp}@test.local`;
  const user2Email = `playwright_user2_${timestamp}@test.local`;
  const password = 'Test@1234';

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const page1 = await context.newPage();
  page1.on('console', (msg) => console.log('PAGE1 CONSOLE:', msg.text()));
  await page1.goto(base, { waitUntil: 'networkidle' });

  await page1.waitForSelector('button:has-text("Sign Up")', { timeout: 20000 });
  await page1.click('button:has-text("Sign Up")');
  await page1.fill('input[type="email"]', user1Email);
  await page1.fill('input[type="password"]', password);
  await page1.fill('input[placeholder="e.g. My puppy name / mom bday"]', 'playwright hint 1');
  await page1.click('button:has-text("Create Credentials")');

  await page1.waitForSelector('button[aria-label="Open navigation"]', { timeout: 20000 });
  console.log('Signed up user1:', user1Email);

  await page1.click('button[aria-label="Open navigation"]');
  await page1.click('button:has-text("Focus Arena")');
  await page1.click('button:has-text("Peer Duel")');
  await page1.waitForSelector('button:has-text("Group Study")', { timeout: 20000 });

  await page1.click('button:has-text("Group Study")');
  await page1.fill('input[placeholder="E.g., Psych Boards Study Group A"]', 'Playwright Auto Group');
  await page1.click('button:has-text("Create Study Space & Generate Link")');

  const linkHandle = await page1.waitForSelector('text=group-study=', { timeout: 20000 });
  const linkText = await linkHandle.textContent();
  console.log('Generated link raw:', linkText);

  if (!linkText || !linkText.includes('group-study=')) {
    throw new Error('Generated link does not contain group-study');
  }

  const match = linkText.match(/https?:\/\/[^\s#]+[^\s]*#group-study=[A-Za-z0-9\-]+/);
  const roomUrl = match ? match[0] : `${base.split('#')[0]}#${linkText.match(/group-study=[A-Za-z0-9\-]+/)[0]}`;
  console.log('Room URL:', roomUrl);

  const page2 = await context.newPage();
  page2.on('console', (msg) => console.log('PAGE2 CONSOLE:', msg.text()));
  await page2.goto(roomUrl, { waitUntil: 'networkidle' });

  await page2.waitForSelector('button:has-text("Sign Up")', { timeout: 20000 });
  await page2.click('button:has-text("Sign Up")');
  await page2.fill('input[type="email"]', user2Email);
  await page2.fill('input[type="password"]', password);
  await page2.fill('input[placeholder="e.g. My puppy name / mom bday"]', 'playwright hint 2');
  await page2.click('button:has-text("Create Credentials")');

  await page2.waitForSelector('button[aria-label="Open navigation"]', { timeout: 20000 });
  await page2.click('button[aria-label="Open navigation"]');
  await page2.click('button:has-text("Focus Arena")');
  await page2.click('button:has-text("Peer Duel")');

  const participantsLocator = page1.locator('text=Participants:');
  const joined = await participantsLocator.first().waitFor({ timeout: 20000 }).then(() => true).catch(() => false);

  const participantsText1 = joined ? await participantsLocator.first().textContent() : null;
  const participantsText2 = await page2.locator('text=Participants:').first().textContent().catch(() => null);

  console.log('Participants page1:', participantsText1);
  console.log('Participants page2:', participantsText2);

  const num1 = participantsText1 ? (participantsText1.match(/\d+/) || [null])[0] : null;
  const num2 = participantsText2 ? (participantsText2.match(/\d+/) || [null])[0] : null;

  console.log('Counts parsed:', num1, num2);
  if ((num1 && parseInt(num1, 10) >= 2) || (num2 && parseInt(num2, 10) >= 2)) {
    console.log('SUCCESS');
    await browser.close();
    process.exit(0);
  }

  console.error('FAILED: participants count not 2');
  await browser.close();
  process.exit(1);
})();
