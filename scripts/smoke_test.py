"""Browser smoke checks. Start npm run dev first; uses installed Playwright/Chromium."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE_URL = os.environ.get('APP_URL', 'http://127.0.0.1:5173')
ARTIFACTS = Path('/tmp/two-perspectives-checks')
ARTIFACTS.mkdir(exist_ok=True)


def audit(page):
    if not page.evaluate('typeof window.axe !== "undefined"'):
        page.add_script_tag(path=str(Path(__file__).resolve().parents[1] / 'node_modules/axe-core/axe.min.js'))
    result = page.evaluate("async () => await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
    violations = [{ 'id': v['id'], 'nodes': [{ 'target': n['target'], 'reason': n.get('failureSummary', '') } for n in v['nodes']] } for v in result['violations']]
    assert not violations, violations


def no_overflow(page):
    assert not page.evaluate('document.documentElement.scrollWidth > window.innerWidth'), 'Horizontal page overflow'


def enter_story(page, via_join=False):
    if via_join:
        page.get_by_role('button', name='Join a session', exact=True).click()
        page.get_by_label('Session code', exact=True).fill('BAD123')
        page.get_by_role('button', name='Join local session').click()
        expect(page.get_by_role('alert')).to_contain_text('isn’t available')
        page.get_by_label('Session code', exact=True).fill('DEMO24')
        page.get_by_role('button', name='Join local session').click()
    else:
        page.get_by_role('button', name='Create a session', exact=True).click()
        expect(page.get_by_role('button', name='We’re both here')).to_be_enabled()
        page.get_by_role('button', name='Add demo participant').click()
    audit(page)
    page.locator('#nickname-a').fill('Moss')
    page.locator('#nickname-b').fill('Clover')
    page.get_by_role('button', name='We’re both here').click()
    expect(page.get_by_role('button', name='Begin with the shared playlist')).to_be_disabled()
    page.get_by_role('button', name='Surprise us').click()
    # Pick a known scenario after exercising random selection.
    page.get_by_role('button', name='FRIENDSHIP The shared playlist', exact=False).click()
    audit(page)
    page.get_by_role('checkbox').check()
    page.get_by_role('button', name='Begin with the shared playlist').click()
    page.get_by_role('button', name='I’m Moss', exact=True).click()


def complete_session(page, sketch=False):
    for step in range(4):
        print(f"Checking {page.viewport_size['width']}px card {step + 1}", flush=True)
        if step > 0:
            page.get_by_role('button', name='I’m Moss', exact=True).click()
        expect(page.get_by_role('button', name='I’m ready to share')).to_be_disabled()
        audit(page)
        for person in range(2):
            if person == 1:
                expect(page.locator('textarea')).to_have_count(0)
                expect(page.locator('.reveal')).to_have_count(0)
                page.get_by_role('button', name='I’m Clover', exact=True).click()
                expect(page.locator('#reflection')).to_have_value('')
            if step == 0:
                page.get_by_role('button', name='Lavender' if person == 0 else 'Sage', exact=True).click()
            elif step == 2:
                page.get_by_role('button', name='Repair Make a small gesture', exact=False).click() if person == 0 else page.get_by_role('button', name='Leave unresolved Let different views', exact=False).click()
            elif step == 3:
                if sketch and person == 1:
                    page.get_by_role('button', name='Image or Symbol', exact=True).click()
                    page.get_by_role('button', name='Draw your own', exact=True).click()
                    canvas = page.locator('canvas')
                    box = canvas.bounding_box()
                    page.mouse.move(box['x'] + 20, box['y'] + 20)
                    page.mouse.down()
                    page.mouse.move(box['x'] + 70, box['y'] + 50, steps=5)
                    page.mouse.move(box['x'] + 100, box['y'] + 20, steps=5)
                    page.mouse.up()
                elif person == 0:
                    page.get_by_role('button', name='Image or Symbol', exact=True).click()
                    page.get_by_role('button', name='Bloom', exact=False).click()
                else:
                    page.get_by_role('button', name='A song', exact=True).click()
                    page.get_by_role('button', name='Here Comes the Sun — The Beatles', exact=True).click()
            text = f'PRIVATE draft {step} from {"Moss" if person == 0 else "Clover"}: I can see another side.'
            page.locator('#reflection').fill(text)
            if step == 0 and person == 0:
                # Switching must unmount the draft and preserve it only in local state.
                page.locator('.participant-switcher').get_by_role('button', name='Clover').click()
                expect(page.locator('textarea')).to_have_count(0)
                assert text not in page.locator('body').inner_text()
                page.get_by_role('button', name='I’m Clover', exact=True).click()
                expect(page.locator('#reflection')).to_have_value('')
                page.locator('.participant-switcher').get_by_role('button', name='Moss').click()
                page.get_by_role('button', name='I’m Moss', exact=True).click()
                expect(page.locator('#reflection')).to_have_value(text)
                # The wording warning must allow editing without losing the answer.
                page.locator('#reflection').fill('You are stupid.')
                page.get_by_role('button', name='I’m ready to share').click()
                expect(page.get_by_role('dialog')).to_contain_text('A quick wording check.')
                page.get_by_role('button', name='Go back and edit').click()
                page.locator('#reflection').fill(text)
            page.get_by_role('button', name='I’m ready to share').click()
        expect(page.locator('.reveal-card')).to_have_count(2)
        audit(page)
        expect(page.locator('.reveal')).to_contain_text(f'PRIVATE draft {step} from Moss')
        expect(page.locator('.reveal')).to_contain_text(f'PRIVATE draft {step} from Clover')
        no_overflow(page)
        if step == 1:
            page.screenshot(path=str(ARTIFACTS / f'reveal-{page.viewport_size["width"]}.png'), full_page=True)
        page.get_by_role('button', name='See our reflection' if step == 3 else f'On to card {step + 2}').click()
    expect(page.locator('.summary-card')).to_have_count(2)
    audit(page)
    for step in range(4):
        expect(page.locator('.summary-card').first).to_contain_text(f'PRIVATE draft {step} from Moss')
    if sketch:
        expect(page.locator('.summary-card').last.locator('img')).to_have_count(1)
    no_overflow(page)
    page.screenshot(path=str(ARTIFACTS / f'summary-{page.viewport_size["width"]}.png'), full_page=True)


def leave_session(page):
    page.get_by_role('button', name='Take a pause').click()
    page.get_by_role('button', name='Leave this session', exact=True).click()
    page.get_by_role('button', name='End session', exact=True).click()
    page.get_by_role('button', name='Back to the beginning').click()


def check_room_submission(page):
    page.get_by_role('button', name='Create a session', exact=True).click()
    ready = page.get_by_role('button', name='We’re both here')
    ready.click()
    expect(page.get_by_role('alert')).to_contain_text('Enter a nickname for each person')
    expect(page.locator('#nickname-a')).to_be_focused()
    expect(page.locator('#nickname-b')).to_be_visible()
    audit(page)
    page.locator('#nickname-a').fill('Moss')
    ready.click()
    expect(page.locator('#nickname-b')).to_be_focused()
    page.locator('#nickname-b').fill(' moss ')
    ready.click()
    expect(page.get_by_role('alert')).to_contain_text('two different nicknames')
    expect(page.locator('#nickname-b')).to_be_focused()

    # Reproduce browser autofill without input/change events. The visible DOM
    # values must be accepted even though React still holds the old values.
    page.evaluate('''() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(document.getElementById('nickname-a'), 'River');
      setter.call(document.getElementById('nickname-b'), 'Sky');
    }''')
    expect(page.locator('#nickname-a')).to_have_value('River')
    expect(page.locator('#nickname-b')).to_have_value('Sky')
    ready.click()
    expect(page.locator('h1')).to_have_text('Let’s start with a story.')
    page.get_by_role('checkbox').check()
    page.get_by_role('button', name='Begin with the shared playlist').click()
    page.get_by_role('button', name='I’m River', exact=True).click()
    expect(page.locator('#reflection')).to_be_visible()
    expect(page.locator('.participant-switcher')).to_contain_text('Sky')
    leave_session(page)

    # Submitting the second nickname with Enter uses the same validation path.
    page.get_by_role('button', name='Create a session', exact=True).click()
    page.get_by_role('button', name='Add demo participant').click()
    page.locator('#nickname-a').fill('Moss')
    page.locator('#nickname-b').fill('Clover')
    page.locator('#nickname-b').press('Enter')
    expect(page.locator('h1')).to_have_text('Let’s start with a story.')
    leave_session(page)

    # A one-click demo path is available if users only want to try the app.
    page.get_by_role('button', name='Create a session', exact=True).click()
    page.get_by_role('button', name='Just exploring? Try demo nicknames').click()
    expect(page.locator('h1')).to_have_text('Let’s start with a story.')
    page.get_by_role('checkbox').check()
    page.get_by_role('button', name='Begin with the shared playlist').click()
    page.get_by_role('button', name='I’m Moss', exact=True).click()
    expect(page.locator('#reflection')).to_be_visible()
    leave_session(page)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None), headless=True, args=['--no-sandbox'])
    for width in [1440, 390]:
        context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
        page = context.new_page()
        page.route('https://colormind.io/api/', lambda route: route.fulfill(status=503, json={'error': 'offline fixture'}))
        page.route('https://itunes.apple.com/**', lambda route: route.abort('accessdenied'))
        page.route('https://rss.marketingtools.apple.com/**', lambda route: route.fulfill(status=401, json={'error': 'offline fixture'}))
        errors, external = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('request', lambda r: external.append(r.url) if not r.url.startswith(BASE_URL) else None)
        page.goto(BASE_URL, wait_until='networkidle')
        # The initial app is responsive down to a narrow phone.
        for check_width in [320, 390, 768, 1440]:
            page.set_viewport_size({'width': check_width, 'height': 900})
            no_overflow(page)
        page.set_viewport_size({'width': width, 'height': 900})
        page.screenshot(path=str(ARTIFACTS / f'home-{width}.png'), full_page=True)
        audit(page)
        page.get_by_role('button', name='The ground rules', exact=True).click()
        expect(page.get_by_role('dialog')).to_be_visible()
        audit(page)
        page.keyboard.press('Escape')
        expect(page.get_by_role('dialog')).to_have_count(0)
        check_room_submission(page)
        enter_story(page, via_join=width == 390)
        # Explicit pause must obscure the underlying main content.
        page.get_by_role('button', name='Take a pause').click()
        page.get_by_role('button', name='Pause and hide responses').click()
        expect(page.get_by_role('dialog')).to_contain_text('Your session is paused')
        assert page.locator('main').evaluate("el => getComputedStyle(el).visibility") == 'hidden'
        page.get_by_role('button', name='We’re ready to continue').click()
        complete_session(page, sketch=width == 390)
        page.get_by_role('button', name='Explore another story').click()
        page.get_by_role('button', name='Start over', exact=True).click()
        expect(page.locator('h1')).to_have_text('Let’s start with a story.')
        assert 'PRIVATE draft' not in page.locator('body').inner_text()
        page.get_by_role('button', name='Not today? Leave session').click()
        page.get_by_role('button', name='End session', exact=True).click()
        expect(page.locator('h1')).to_have_text('A little perspective goes a long way.')
        assert 'Moss' not in page.locator('body').inner_text()
        page.get_by_role('button', name='Back to the beginning').click()
        page.reload(wait_until='networkidle')
        expect(page.locator('h1')).to_contain_text('One story.')
        assert not errors, errors
        assert all(url == 'https://colormind.io/api/' or url == 'https://rss.marketingtools.apple.com/api/v2/us/music/most-played/10/songs.json' or url.startswith('https://itunes.apple.com/search?') for url in external), external
        print(f'PASS {width}px: create/join, privacy, four cards, reveals, pause, summary, reset, end, refresh; catalog-only external requests, fallback fixtures, no JS errors')
        context.close()
    browser.close()
