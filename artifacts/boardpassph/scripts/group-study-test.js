const { chromium } = require('playwright');

(async () => {
  const base = 'http://localhost:4173/';
  console.log('Launching browsers...');
  const browser = await chromium.launch({ headless: true });

  // First context: create room
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await page1.goto(base, { waitUntil: 'networkidle' });
  console.log('Page1 loaded');

  // Navigate to Focus Arena and Peer tab — this depends on app routing; try clicking header
  // Try to open Focus & Study Arena by locating its heading
  await page1.locator('text=Focus & Study Arena').first().click().catch(()=>{});

  // Open Peer tab button
  await page1.getByRole('button', { name: /Peer Duel|Peer Study/i }).click().catch(()=>{});

  // Switch to Group Study mode
  await page1.getByRole('button', { name: /Group Study/i }).click();

  // Fill study space name
  await page1.getByPlaceholder('E.g., Psych Boards Study Group A').fill('Playwright Auto Group');

  // Click create
  await page1.getByRole('button', { name: /Create Study Space & Generate Link/i }).click();

  // Wait for link to appear
  await page1.waitForTimeout(1500);

  // Grab the shareable link by searching for '#group-study=' in text
  const linkHandle = await page1.locator('text=/group-study=/').first();
  const link = (await linkHandle.textContent()) || '';
  console.log('Generated link (raw):', link);

  if (!link.includes('group-study=')) {
    console.error('Failed to find generated link on page1');
    await browser.close();
    process.exit(2);
  }

  // Extract url substring containing group-study=
  const match = link.match(/https?:\/\/[^\s#]+[^\s]*#group-study=[A-Za-z0-9\-]+/);
  let roomUrl = '';
  if (match) roomUrl = match[0];
  else {
    // fallback: try to extract the fragment and build full URL
    const frag = link.match(/group-study=[A-Za-z0-9\-]+/)[0];
    roomUrl = base.split('#')[0] + '#' + frag;
  }

  console.log('Room URL:', roomUrl);

  // Second context: join via link
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(roomUrl, { waitUntil: 'networkidle' });
  console.log('Page2 opened room link');

  // Wait a bit for Firestore updates to propagate
  await page2.waitForTimeout(2500);

  // On page1, read participants count text
  const participantsText1 = await page1.locator('text=/Participants:/').first().textContent().catch(()=>null);
  const participantsText2 = await page2.locator('text=/Participants:/').first().textContent().catch(()=>null);

  console.log('Participants label page1:', participantsText1);
  console.log('Participants label page2:', participantsText2);

  // Check participants length by extracting digits
  const num1 = participantsText1 ? (participantsText1.match(/\d+/) || [null])[0] : null;
  const num2 = participantsText2 ? (participantsText2.match(/\d+/) || [null])[0] : null;

  console.log('Participants counts parsed:', num1, num2);

  if ((num1 && parseInt(num1) >= 2) || (num2 && parseInt(num2) >= 2)) {
    console.log('SUCCESS: Both sessions see at least 2 participants (joined).');
    await browser.close();
    process.exit(0);
  } else {
    console.error('FAIL: participant counts did not reflect two sessions.');
    await browser.close();
    process.exit(3);
  }
})();
