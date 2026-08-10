"""
Deep inspection: click variant, click Get Exact Value, walk through condition questions.
Reports exact DOM structure at each step.
"""
import asyncio
from playwright.async_api import async_playwright

async def inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
            locale='en-IN'
        )
        page = await ctx.new_page()

        print("=== STEP 1: Load iPhone 6 page ===")
        await page.goto('https://www.cashify.in/sell-old-mobile-phone/used-iphone-6', wait_until='domcontentloaded', timeout=40000)
        await asyncio.sleep(3)

        # Find all <a> tags wrapping variant divs (href contains the model slug + variant)
        variant_links = await page.evaluate("""
            () => Array.from(document.querySelectorAll('div.bg-surface.cursor-pointer')).map(d => {
                const a = d.closest('a');
                return {
                    txt: d.innerText.trim(),
                    href: a ? a.href : 'NO_HREF',
                    aCls: a ? a.className.substring(0,100) : ''
                };
            })
        """)
        print("Variant links found:")
        for v in variant_links:
            print(f"  txt=[{v['txt']}] href={v['href']} aCls={v['aCls']}")

        print("\n=== STEP 2: Click '16 GB' variant link ===")
        # Click the <a> that contains the 16 GB div
        clicked = False
        divs = await page.query_selector_all('div.bg-surface.cursor-pointer')
        for div in divs:
            txt = (await div.inner_text()).strip()
            if txt == '16 GB':
                parent_a = await div.evaluate_handle('el => el.closest("a")')
                if parent_a:
                    await parent_a.click()
                    print(f"  Clicked <a> containing '16 GB'")
                    clicked = True
                    break
        if not clicked:
            print("  FALLBACK: clicking div directly")
            for div in divs:
                txt = (await div.inner_text()).strip()
                if txt == '16 GB':
                    await div.click()
                    clicked = True
                    break

        await asyncio.sleep(2)
        print(f"  URL after click: {page.url}")

        # Check if Get Exact Value is now enabled
        gev_btn = await page.query_selector('button.bg-surface-light-3')
        if gev_btn:
            disabled = await gev_btn.get_attribute('disabled')
            cls = await gev_btn.get_attribute('class')
            txt = (await gev_btn.inner_text()).strip()
            print(f"  GEV button: txt=[{txt}] disabled={disabled} cls={cls[:80]}")
        else:
            # Try any button with the text
            btns = await page.query_selector_all('button')
            for b in btns:
                t = (await b.inner_text()).strip()
                if 'get exact' in t.lower() or 'get value' in t.lower():
                    disabled = await b.get_attribute('disabled')
                    cls = await b.get_attribute('class')
                    print(f"  GEV button: txt=[{t}] disabled={disabled} cls={cls[:80] if cls else ''}")

        print("\n=== STEP 3: Click 'Get Exact Value' ===")
        # Find enabled Get Exact Value button
        gev_clicked = False
        btns = await page.query_selector_all('button')
        for b in btns:
            t = (await b.inner_text()).strip().lower()
            if ('get exact' in t or 'get value' in t or 'get price' in t):
                disabled = await b.get_attribute('disabled')
                print(f"  Found button: [{t}] disabled={disabled}")
                if not disabled:
                    await b.click()
                    gev_clicked = True
                    print("  Clicked GEV!")
                    break

        if not gev_clicked:
            print("  GEV button was still disabled - trying anyway...")
            btns = await page.query_selector_all('button')
            for b in btns:
                t = (await b.inner_text()).strip().lower()
                if 'get exact' in t or 'get value' in t:
                    try:
                        await b.click(force=True)
                        gev_clicked = True
                        print("  Force-clicked GEV!")
                        break
                    except:
                        pass

        await asyncio.sleep(4)
        print(f"  URL after GEV click: {page.url}")

        # Save page HTML for inspection
        html = await page.content()
        with open(r'c:\Users\DELL\OneDrive\Desktop\CashALL\question_page.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("  Saved HTML to question_page.html")

        # Get all visible interactive elements
        print("\n=== STEP 4: Condition question page analysis ===")
        body_txt = await page.inner_text('body')
        print(f"  Page text preview (first 500 chars):\n{body_txt[:500]}")

        print("\n  All visible buttons:")
        btns = await page.query_selector_all('button')
        for b in btns:
            try:
                if await b.is_visible():
                    t = (await b.inner_text()).strip()
                    cls = await b.get_attribute('class') or ''
                    disabled = await b.get_attribute('disabled')
                    print(f"    [{t}] cls={cls[:80]} disabled={disabled}")
            except:
                pass

        print("\n  All visible divs that look like answer options:")
        divs = await page.evaluate("""
            () => Array.from(document.querySelectorAll('div')).filter(d => {
                const t = d.innerText ? d.innerText.trim() : '';
                return t.length > 1 && t.length < 50 && d.offsetParent !== null &&
                    (d.className.includes('cursor') || d.className.includes('option') ||
                     d.className.includes('answer') || d.className.includes('choice') ||
                     d.className.includes('card') || d.className.includes('select'));
            }).slice(0, 20).map(d => ({
                txt: d.innerText.trim(),
                cls: d.className.substring(0,100)
            }))
        """)
        for d in divs:
            print(f"    [{d['txt']}] cls={d['cls']}")

        print("\n  All visible labels:")
        labels = await page.query_selector_all('label')
        for l in labels:
            try:
                if await l.is_visible():
                    t = (await l.inner_text()).strip()
                    cls = await l.get_attribute('class') or ''
                    print(f"    [{t}] cls={cls[:80]}")
            except:
                pass

        print("\n  All visible radio/checkbox inputs:")
        inputs = await page.query_selector_all('input[type=radio], input[type=checkbox]')
        for inp in inputs:
            try:
                if await inp.is_visible():
                    iid = await inp.get_attribute('id') or ''
                    val = await inp.get_attribute('value') or ''
                    print(f"    input id={iid} value={val}")
            except:
                pass

        # Walk through multiple question rounds
        print("\n=== STEP 5: Attempting to answer questions and find price ===")
        for round_num in range(12):
            await asyncio.sleep(2)
            body_txt = await page.inner_text('body')
            url = page.url

            # Check for price
            import re
            price_m = re.search(r'(?:get\s+upto|you\s+can\s+get)[^\d]*([\d,]+)', body_txt, re.IGNORECASE)
            if price_m:
                print(f"\n  PRICE FOUND in round {round_num}: Rs.{price_m.group(1)}")
                print(f"  URL: {url}")
                break

            print(f"\n  Round {round_num}: URL={url}")
            print(f"  Body preview: {body_txt[:200]}")

            # Find clickable answer divs
            clickable = await page.evaluate("""
                () => Array.from(document.querySelectorAll('div,button,label,li,span')).filter(el => {
                    const t = el.innerText ? el.innerText.trim() : '';
                    return t.length > 1 && t.length < 60 && el.offsetParent !== null &&
                        (el.tagName === 'BUTTON' || el.className.includes('cursor-pointer'));
                }).map(el => ({
                    tag: el.tagName,
                    txt: el.innerText.trim(),
                    cls: el.className.substring(0,100)
                }))
            """)
            print(f"  Clickable elements ({len(clickable)}):")
            for c in clickable[:10]:
                print(f"    tag={c['tag']} [{c['txt']}] cls={c['cls'][:60]}")

            # Try clicking first positive-looking option
            POSITIVE = ['yes', 'working', 'good', 'perfect', 'original', 'functional', 'no damage', 'no crack', 'excellent']
            clicked_answer = False
            for opt in clickable:
                txt_low = opt['txt'].lower()
                if any(kw in txt_low for kw in POSITIVE):
                    # Find and click it
                    els = await page.query_selector_all(f"{opt['tag'].lower()}")
                    for el in els:
                        try:
                            t = (await el.inner_text()).strip()
                            if t == opt['txt'] and await el.is_visible():
                                await el.click(timeout=3000)
                                print(f"  Clicked answer: [{t}]")
                                clicked_answer = True
                                await asyncio.sleep(1)
                                break
                        except:
                            pass
                if clicked_answer:
                    break

            if not clicked_answer:
                # Try clicking first cursor-pointer element that's not navigation
                NAV_SKIP = ['services', 'company', 'help', 'support', 'sell device', 'more info', 'login', 'sign']
                for opt in clickable:
                    txt_low = opt['txt'].lower()
                    if any(s in txt_low for s in NAV_SKIP):
                        continue
                    if len(opt['txt']) > 2 and opt['tag'] in ('DIV', 'BUTTON', 'LI'):
                        els = await page.query_selector_all(f"{opt['tag'].lower()}")
                        for el in els:
                            try:
                                t = (await el.inner_text()).strip()
                                if t == opt['txt'] and await el.is_visible():
                                    await el.click(timeout=3000)
                                    print(f"  Clicked (fallback): [{t}]")
                                    clicked_answer = True
                                    await asyncio.sleep(1)
                                    break
                            except:
                                pass
                    if clicked_answer:
                        break

            if not clicked_answer:
                print(f"  Could not find anything to click in round {round_num}")
                # Try Next button
                btns = await page.query_selector_all('button')
                for b in btns:
                    try:
                        t = (await b.inner_text()).strip().lower()
                        if any(x in t for x in ['next', 'continue', 'proceed', 'submit']):
                            if await b.is_visible():
                                await b.click()
                                print(f"  Clicked next: [{t}]")
                                break
                    except:
                        pass

        await browser.close()
        print("\nDone.")

asyncio.run(inspect())
