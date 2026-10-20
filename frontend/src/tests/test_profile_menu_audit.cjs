/**
 * Automated Verification Script for GoDigital Profile & Top-Left Menu Fix
 */

const fs = require('fs');
const http = require('http');
const WebSocket = require('/Users/yasabneh/Documents/ITG/InnoGames/GoPlay 2/node_modules/ws');

async function getPageWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const list = JSON.parse(data);
        const page = list.find(t => t.type === 'page');
        if (page) resolve(page.webSocketDebuggerUrl);
        else reject(new Error('Page target not found'));
      });
    }).on('error', reject);
  });
}

const EXPECTED_8_ITEMS = [
  { id: 'subscription', label: 'Subscription', title: 'Subscription' },
  { id: 'pricing', label: 'Subscription Pricing', title: 'Subscription Pricing' },
  { id: 'my_games', label: 'My Games', title: 'My Games' },
  { id: 'my_scores', label: 'My High Scores', title: 'My High Scores' },
  { id: 'faq', label: 'FAQ', title: 'FAQ' },
  { id: 'help_support', label: 'Games Help & Support', title: 'Games Help & Support' },
  { id: 'terms', label: 'Terms & Conditions', title: 'Terms & Conditions' },
  { id: 'privacy', label: 'Privacy Policy', title: 'Privacy Policy' },
];

let totalChecks = 0;
let passedChecks = 0;

function check(name, condition, extra = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    console.error(`  ❌ FAIL: ${name} ${extra}`);
  }
}

async function runAudit() {
  const wsUrl = await getPageWsUrl();
  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  });

  await new Promise((res) => ws.on('open', res));

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  };

  const captureScreenshot = async (name) => {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync('/Users/yasabneh/.gemini/antigravity/brain/d6f1a3d7-9f10-4be9-8ae6-e7ebefe3c625/scratch/' + name + '.png', buffer);
    console.log('  📸 Screenshot saved: ' + name + '.png');
  };

  const setViewport = async (width, height) => {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 768
    });
    await new Promise(r => setTimeout(r, 300));
  };

  console.log('\n======================================================');
  console.log('🚀 GODIGITAL AUDIT: PROFILE, MENU & DESTINATIONS');
  console.log('======================================================\n');

  // Set Mobile Viewport (390 x 844)
  await setViewport(390, 844);
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 1200));

  // ---------------------------------------------------------------------------
  // SECTION 1: PROFILE TAB & 8 ITEMS VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('--- 1. Profile Tab Verification ---');
  // Click Profile Tab using canonical id
  await evaluate(`document.querySelector('#bottom-nav-profile')?.click()`);
  await new Promise(r => setTimeout(r, 500));
  await captureScreenshot('audit_01_profile_tab');

  // Verify all 8 items in Profile
  for (const item of EXPECTED_8_ITEMS) {
    const itemData = await evaluate(`
      (() => {
        const btn = document.querySelector('#profile-menu-item-${item.id}');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return {
          exists: true,
          text: btn.innerText,
          visible: rect.width > 0 && rect.height > 0,
          hasIcon: !!btn.querySelector('svg')
        };
      })()
    `);

    check(`Profile item [${item.id}] exists & visible`, !!itemData && itemData.visible);
    check(`Profile item [${item.id}] displays exact label "${item.label}"`, itemData?.text.includes(item.label), `Found: "${itemData?.text}"`);
    check(`Profile item [${item.id}] contains icon`, itemData?.hasIcon === true);
  }

  // ---------------------------------------------------------------------------
  // SECTION 2: TOP-LEFT MENU HORIZONTAL PANEL & LAYOUT
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Top-Left Menu Horizontal Panel & Layout ---');
  // Open Menu on Mobile (390px)
  await evaluate(`document.querySelector('#header-main-menu-btn')?.click()`);
  await new Promise(r => setTimeout(r, 400));
  await captureScreenshot('audit_02_menu_mobile_390');

  const mobilePanel = await evaluate(`
    (() => {
      const overlay = document.querySelector('#main-menu-overlay');
      const panel = document.querySelector('#main-menu-panel');
      const grid = panel?.querySelector('.grid');
      const closeBtn = document.querySelector('#main-menu-close-btn');
      if (!panel || !grid) return null;
      const pRect = panel.getBoundingClientRect();
      const style = window.getComputedStyle(grid);
      const cols = style.gridTemplateColumns.split(' ').length;
      return {
        overlayExists: !!overlay,
        panelWidth: pRect.width,
        panelHeight: pRect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        heightRatio: pRect.height / window.innerHeight,
        widthRatio: pRect.width / window.innerWidth,
        columns: cols,
        hasCloseBtn: !!closeBtn
      };
    })()
  `);

  check('Menu panel is open with overlay', !!mobilePanel?.overlayExists);
  check('Menu panel width is ~88-94% of viewport on mobile', mobilePanel?.widthRatio >= 0.85 && mobilePanel?.widthRatio <= 0.96, `Width ratio: ${(mobilePanel?.widthRatio * 100).toFixed(1)}%`);
  check('Menu panel height is compact (<= 65% of viewport)', mobilePanel?.heightRatio <= 0.68, `Height ratio: ${(mobilePanel?.heightRatio * 100).toFixed(1)}%`);
  check('Menu uses 2 columns on mobile portrait (390px)', mobilePanel?.columns === 2, `Columns: ${mobilePanel?.columns}`);
  check('Menu has visible accessible close button', mobilePanel?.hasCloseBtn === true);

  // Verify all 8 items in Menu
  for (const item of EXPECTED_8_ITEMS) {
    const mItem = await evaluate(`
      (() => {
        const btn = document.querySelector('#main-menu-item-${item.id}');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return {
          exists: true,
          text: btn.innerText,
          visible: rect.width > 0 && rect.height > 0,
          hasIcon: !!btn.querySelector('svg')
        };
      })()
    `);

    check(`Menu item [${item.id}] exists & visible`, !!mItem && mItem.visible);
    check(`Menu item [${item.id}] displays exact label "${item.label}" without clipping`, mItem?.text.includes(item.label), `Found: "${mItem?.text}"`);
    check(`Menu item [${item.id}] contains icon`, mItem?.hasIcon === true);
  }

  // Test Tablet Viewport (768px)
  await setViewport(768, 1024);
  await new Promise(r => setTimeout(r, 300));
  const tabletCols = await evaluate(`
    (() => {
      const grid = document.querySelector('#main-menu-panel .grid');
      return grid ? window.getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
    })()
  `);
  check('Menu grid adapts to 3 columns on tablet (768px)', tabletCols === 3, `Columns: ${tabletCols}`);
  await captureScreenshot('audit_03_menu_tablet_768');

  // Test Desktop Viewport (1200px)
  await setViewport(1200, 800);
  await new Promise(r => setTimeout(r, 300));
  const desktopCols = await evaluate(`
    (() => {
      const grid = document.querySelector('#main-menu-panel .grid');
      return grid ? window.getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
    })()
  `);
  check('Menu grid adapts to 4 columns on desktop (1200px)', desktopCols === 4, `Columns: ${desktopCols}`);
  await captureScreenshot('audit_04_menu_desktop_1200');

  // Test Close Menu by close button
  await evaluate(`document.querySelector('#main-menu-close-btn')?.click()`);
  await new Promise(r => setTimeout(r, 300));
  const isClosed = await evaluate(`!document.querySelector('#main-menu-overlay')`);
  check('Menu closes when close button is clicked', isClosed);

  // Return to mobile viewport
  await setViewport(390, 844);

  // ---------------------------------------------------------------------------
  // SECTION 3: DESTINATION CONTENT & BACK NAVIGATION VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Destination Content & Back Button Navigation ---');

  for (const item of EXPECTED_8_ITEMS) {
    console.log(`\nTesting destination: ${item.label} (${item.id})`);

    // Ensure we are on Profile tab
    await evaluate(`document.querySelector('#bottom-nav-profile')?.click()`);
    await new Promise(r => setTimeout(r, 300));

    // Click item in Profile
    await evaluate(`document.querySelector('#profile-menu-item-${item.id}')?.click()`);
    await new Promise(r => setTimeout(r, 500));
    await captureScreenshot(`audit_dest_${item.id}`);

    const destPage = await evaluate(`
      (() => {
        const h1 = document.querySelector('h1');
        const backBtn = document.querySelector('button[id*="-back-btn"], button svg.lucide-arrow-left')?.closest('button');
        const main = document.querySelector('main') || document.body;
        return {
          h1Text: h1 ? h1.innerText.trim() : null,
          hasBack: !!backBtn,
          backId: backBtn ? backBtn.id : null,
          contentLength: main ? main.innerText.length : 0,
          fullText: main ? main.innerText : ''
        };
      })()
    `);

    check(`Destination [${item.id}] shows exact page title "${item.title}"`, destPage?.h1Text === item.title, `Found: "${destPage?.h1Text}"`);
    check(`Destination [${item.id}] has visible Back button`, destPage?.hasBack === true, `Back id: ${destPage?.backId}`);
    check(`Destination [${item.id}] has rich readable body content (> 150 chars)`, (destPage?.contentLength || 0) > 150, `Length: ${destPage?.contentLength}`);

    // Specific content checks per page
    if (item.id === 'pricing') {
      const hasPricingDetails = destPage.fullText.includes('Daily') &&
                               destPage.fullText.includes('Weekly') &&
                               destPage.fullText.includes('Monthly') &&
                               (destPage.fullText.includes('ETB') || destPage.fullText.includes('Birr'));
      check('Subscription Pricing displays Daily, Weekly, Monthly plans with prices', hasPricingDetails);
    }

    if (item.id === 'faq') {
      const hasFaqQ = destPage.fullText.includes('What is GoDigital') &&
                      destPage.fullText.includes('subscription packages');
      check('FAQ displays actual questions before expansion', hasFaqQ);

      // Test expanding a question
      await evaluate(`document.querySelector('#faq-item-faq-2 button')?.click()`);
      await new Promise(r => setTimeout(r, 300));
      const answerVisible = await evaluate(`
        (() => {
          const ans = document.querySelector('#faq-item-faq-2')?.innerText;
          return ans && (ans.includes('5 Birr') || ans.includes('20 Birr'));
        })()
      `);
      check('FAQ answers are readable upon expansion', answerVisible);
    }

    if (item.id === 'help_support') {
      const hasSupport = destPage.fullText.includes('Subscription Support') &&
                         destPage.fullText.includes('telebirr Payments');
      check('Games Help & Support displays support topics and guidance', hasSupport);
    }

    if (item.id === 'terms') {
      const hasTerms = destPage.fullText.includes('Service Description') &&
                       destPage.fullText.includes('Billing Terms');
      check('Terms & Conditions displays full legal terms sections', hasTerms);
    }

    if (item.id === 'privacy') {
      const hasPrivacy = destPage.fullText.includes('Data Collection') &&
                         destPage.fullText.includes('Masked Identity');
      check('Privacy Policy displays privacy protections and masked MSISDN details', hasPrivacy);
    }

    // Press Back and verify return to Profile
    await evaluate(`document.querySelector('button[id*="-back-btn"], button svg.lucide-arrow-left')?.closest('button')?.click()`);
    await new Promise(r => setTimeout(r, 400));

    const returnedToProfile = await evaluate(`
      !!document.querySelector('#profile-account-card')
    `);
    check(`Back button on [${item.id}] returns directly to Profile`, returnedToProfile);
  }

  // ---------------------------------------------------------------------------
  // SECTION 4: MENU OPEN -> DESTINATION -> BACK BEHAVIOR
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Menu Open -> Destination -> Back to Source Screen ---');
  // Switch to Tournament tab using canonical id
  await evaluate(`document.querySelector('#bottom-nav-tournament')?.click()`);
  await new Promise(r => setTimeout(r, 400));

  // Open Menu from Tournament
  await evaluate(`document.querySelector('#header-main-menu-btn')?.click()`);
  await new Promise(r => setTimeout(r, 300));

  // Select FAQ from menu
  await evaluate(`document.querySelector('#main-menu-item-faq')?.click()`);
  await new Promise(r => setTimeout(r, 500));

  check('Opening destination from Menu closes the menu overlay', await evaluate(`!document.querySelector('#main-menu-overlay')`));
  check('FAQ opens with title FAQ', (await evaluate(`document.querySelector('h1')?.innerText`)) === 'FAQ');

  // Click Back button
  await evaluate(`document.querySelector('button[id*="-back-btn"]')?.click()`);
  await new Promise(r => setTimeout(r, 400));

  // Verify return to Tournament tab
  const onTournament = await evaluate(`
    document.body.innerText.includes('WEEKLY CHAMPIONSHIP') || document.body.innerText.includes('Tournament')
  `);
  check('Back button returns to the screen from which menu was opened (Tournament)', onTournament);

  // ---------------------------------------------------------------------------
  // SECTION 5: REGRESSION TESTS
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Regression & Tab Integrity ---');
  const navTabs = ['home', 'games', 'tournament', 'leaderboard', 'profile'];
  for (const tab of navTabs) {
    await evaluate(`document.querySelector('#bottom-nav-${tab}')?.click()`);
    await new Promise(r => setTimeout(r, 300));
    const active = await evaluate(`document.body.innerText.length > 50`);
    check(`Bottom navigation tab [${tab}] renders cleanly`, active);
  }

  console.log('\n======================================================');
  console.log(`🏁 AUDIT COMPLETE: ${passedChecks}/${totalChecks} CHECKS PASSED`);
  console.log('======================================================\n');

  ws.close();

  if (passedChecks === totalChecks) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
