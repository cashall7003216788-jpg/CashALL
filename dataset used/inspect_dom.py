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
        print("Loading iPhone 6 page...")
        await page.goto('https://www.cashify.in/sell-old-mobile-phone/used-iphone-6', wait_until='domcontentloaded', timeout=40000)
        await asyncio.sleep(4)
        
        # Get all buttons
        btns = await page.evaluate("""
            () => Array.from(document.querySelectorAll('button')).map(b => ({
                tag:'button', cls:b.className, txt:b.innerText.trim().substring(0,80),
                disabled: b.disabled, visible: b.offsetParent !== null
            }))
        """)
        
        # Get all labels
        labels = await page.evaluate("""
            () => Array.from(document.querySelectorAll('label')).map(l => ({
                tag:'label', cls:l.className, txt:l.innerText.trim().substring(0,80),
                visible: l.offsetParent !== null
            }))
        """)
        
        # Get all divs/spans/li with GB pattern (short text)
        divs_gb = await page.evaluate("""
            () => Array.from(document.querySelectorAll('div,span,li')).filter(el => {
                const t = el.innerText ? el.innerText.trim() : '';
                return /^\\d+\\s*(GB|TB)(\\/\\s*\\d+\\s*(GB|TB))?$/.test(t) && el.offsetParent !== null;
            }).map(el => ({
                tag:el.tagName, cls:el.className.substring(0,120), txt:el.innerText.trim(),
                parentTag: el.parentElement ? el.parentElement.tagName : '', 
                parentCls: el.parentElement ? el.parentElement.className.substring(0,80) : ''
            }))
        """)
        
        # Find Get Exact Value CTA
        cta = await page.evaluate("""
            () => Array.from(document.querySelectorAll('button,a')).filter(el => {
                const t = (el.innerText || el.textContent || '').toLowerCase();
                return t.includes('get exact') || t.includes('get price') || t.includes('sell now') || t.includes('get value');
            }).map(el => ({tag:el.tagName, cls:el.className.substring(0,120), txt:(el.innerText||'').trim().substring(0,80), href:el.href||'', disabled:el.disabled}))
        """)
        
        print('=== VISIBLE BUTTONS ===')
        for b in btns:
            if b['txt'] and b['visible']:
                print(f"  [{b['txt']}] cls={b['cls'][:80]} disabled={b['disabled']}")
        
        print('\n=== VISIBLE LABELS ===')
        for l in labels:
            if l['txt'] and l['visible']:
                print(f"  [{l['txt']}] cls={l['cls'][:80]}")
        
        print('\n=== PURE GB/TB ELEMENTS ===')
        for d in divs_gb:
            print(f"  tag={d['tag']} txt=[{d['txt']}] cls={d['cls']} | parent={d['parentTag']} parentCls={d['parentCls']}")
        
        print('\n=== CTA BUTTONS ===')
        for c in cta:
            print(f"  [{c['txt']}] tag={c['tag']} cls={c['cls'][:80]} disabled={c.get('disabled')}")
        
        await browser.close()

asyncio.run(inspect())
