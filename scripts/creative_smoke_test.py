"""Verify live catalog fixtures, failure/retry, private state, and drawing."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('APP_URL', 'http://127.0.0.1:5173')
COLOR = 'https://colormind.io/api/'
SONGS = 'https://rss.marketingtools.apple.com/api/v2/us/music/most-played/10/songs.json'

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None), headless=True, args=['--no-sandbox'])
    for width in [1440, 390]:
        page = browser.new_page(viewport={'width': width, 'height': 900})
        errors, catalog_requests = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        color_calls, pending = [], []
        def color_route(route):
            color_calls.append(route.request)
            if len(color_calls) == 1:
                pending.append(route)
            elif len(color_calls) == 2:
                route.fulfill(json={'result': [[100, 150, 200], [120, 180, 160], [220, 190, 180]]})
            else:
                route.fulfill(json={'result': 'malformed fixture'})
        page.route(COLOR, color_route)
        page.route(SONGS, lambda route: route.fulfill(json={'feed': {'results': [
            {'id': '1', 'name': 'A shared title', 'artistName': 'Artist One'},
            {'id': '2', 'name': 'A shared title', 'artistName': 'Artist Two'},
            {'id': '2', 'name': 'A shared title', 'artistName': 'Artist Two'},
        ]}}))
        page.on('request', lambda request: catalog_requests.append(request) if request.url in [COLOR, SONGS] else None)
        page.goto(URL, wait_until='networkidle')
        page.get_by_role('button', name='Create a session', exact=True).click()
        page.get_by_role('button', name='Just exploring? Try demo nicknames').click()
        page.get_by_role('checkbox').check()
        page.get_by_role('button', name='Begin with the shared playlist', exact=False).click()
        page.get_by_role('button', name='I’m Moss', exact=False).click()
        expect(page.get_by_role('status').filter(has_text='Loading a ColorMind palette')).to_be_visible()
        page.get_by_role('button', name='Lavender', exact=True).click()
        page.locator('#reflection').fill('PRIVATE reflection that must stay on this page.')
        pending[0].fulfill(status=503, json={'error': 'fixture unavailable'})
        expect(page.get_by_role('status').filter(has_text='ColorMind is unavailable')).to_be_visible()
        page.get_by_role('button', name='Lavender', exact=True).click()
        page.locator('#reflection').fill('PRIVATE reflection that must stay on this page.')
        page.get_by_role('button', name='Try again', exact=True).click()
        expect(page.get_by_role('status').filter(has_text='Fresh palette from ColorMind')).to_be_visible()
        # An already selected preset is retained after a successful refresh.
        expect(page.get_by_role('button', name='Lavender', exact=True)).to_have_attribute('aria-pressed', 'true')
        page.get_by_role('button', name='Color #6496C8', exact=True).click()
        page.get_by_role('button', name='Refresh choices', exact=True).click()
        expect(page.get_by_role('status').filter(has_text='ColorMind is unavailable')).to_be_visible()
        # A previously selected live color is retained after malformed data.
        expect(page.get_by_role('button', name='Color #6496C8', exact=True)).to_have_attribute('aria-pressed', 'true')
        expect(page.locator('#reflection')).to_have_value('PRIVATE reflection that must stay on this page.')
        page.get_by_role('button', name='Image or Symbol', exact=True).click()
        page.get_by_role('button', name='Draw your own', exact=True).click()
        canvas = page.locator('canvas')
        box = canvas.bounding_box()
        page.mouse.move(box['x']+15,box['y']+15)
        page.mouse.down();page.mouse.move(box['x']+100,box['y']+60,steps=5);page.mouse.up()
        expect(page.get_by_role('img', name='Your current sketch preview')).to_be_visible()
        page.get_by_role('button', name='Clear drawing').click()
        expect(page.get_by_role('img', name='Your current sketch preview')).to_have_count(0)
        expect(page.get_by_role('button', name='I’m ready to share', exact=False)).to_be_disabled()
        page.mouse.move(box['x']+15,box['y']+15)
        page.mouse.down();page.mouse.move(box['x']+90,box['y']+55,steps=5);page.mouse.up()
        page.get_by_role('button', name='I’m ready to share', exact=False).click()
        expect(page.locator('textarea')).to_have_count(0)
        page.get_by_role('button', name='I’m Clover', exact=False).click()
        page.get_by_role('button', name='A song', exact=True).click()
        expect(page.get_by_role('status').filter(has_text='Popular songs from Apple')).to_be_visible()
        expect(page.locator('.song-options button')).to_have_count(2)
        page.get_by_role('button', name='A shared title — Artist Two', exact=False).click()
        page.locator('#reflection').fill('PRIVATE song meaning; it is never part of a catalog request.')
        page.get_by_role('button', name='I’m ready to share', exact=False).click()
        expect(page.locator('main')).to_contain_text('A shared title — Artist Two')
        expect(page.get_by_role('img', name="Participant's abstract sketch").or_(page.get_by_role('img', name='Participant’s abstract sketch'))).to_have_count(1)
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
        for request in catalog_requests:
            assert request.post_data in [None, '{"model":"default"}'], request.post_data
            assert 'PRIVATE' not in request.url
            assert 'authorization' not in request.headers
        assert not errors, errors
        print(f'PASS {width}px: Apple chart fixture, ColorMind retry/malformed fallback, retained selections, before-card sketch/clear, paired reveal, and catalog-only requests')
        page.close()
    browser.close()
