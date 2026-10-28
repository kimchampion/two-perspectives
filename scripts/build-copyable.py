"""Bring shared creative components into the copyable React HTML edition.

The rest of the saved single-file prototype remains independent of art3512026.
"""
from pathlib import Path
import argparse
import re
import json
import subprocess

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description='Build the optional copy-and-save HTML edition.')
parser.add_argument('--output', type=Path, default=root / 'dist/Two-Perspectives-copyable.html')
output = parser.parse_args().output
output.parent.mkdir(parents=True, exist_ok=True)
html = (root / 'templates/copyable.html').read_text()
presets = json.loads(subprocess.check_output([
    'node', '--input-type=module', '-e',
    f'import {{songs}} from {json.dumps((root / "src/data.js").as_uri())}; console.log(JSON.stringify(songs));'
], text=True))
html = re.sub(r'const SONGS=\[[\s\S]*?\];', lambda _: 'const SONGS=' + json.dumps([item['label'] for item in presets]) + ';', html, count=1)
begin = '<!-- SHARED CREATIVE STYLES -->'
end = '<!-- END SHARED CREATIVE STYLES -->'
html = re.sub(re.escape(begin) + r'[\s\S]*?' + re.escape(end), '', html)
styles = '''
.expression-picker{border:0;padding:0;margin:0}.expression-picker legend{font-size:12px;font-weight:bold;margin-bottom:12px}
.mode-tabs{display:flex;gap:4px;background:#f0eee7;padding:4px;border-radius:7px;margin:12px 0 18px}.mode-tabs button{flex:1;min-height:36px;background:none;border-radius:5px;font-size:12px;padding:5px}.mode-tabs .selected{background:#fffdf9;color:#725487}
.expression-options{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.expression-option{border:1px solid transparent;border-radius:7px;background:none;display:flex;align-items:center;flex-direction:column;gap:8px;font-size:11px;padding:9px 3px;color:#5a664d;min-width:0}.expression-option.chosen{border-color:#b59bc8;background:#f0e8f6}.expression-option>span:last-child{overflow-wrap:anywhere}
.color-option{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:#30342d}.symbol-option{font-size:30px;line-height:38px}.song-options{grid-template-columns:1fr 1fr}.song-options .expression-option{border:1px solid #ded4e6;background:#f4eef8;padding:13px 10px;text-align:left;align-items:flex-start}.song-options .chosen{border-color:#aa8bbf;background:#eae0f2}.song-note{font-size:20px;color:#775b8c}
.catalog-status{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:11px 13px;border:1px solid #e3dfeb;border-radius:7px;background:#f4eff8;margin-bottom:15px}.catalog-status p{font-size:11px;line-height:1.8;color:#6f587f}.catalog-status .text-button{font-size:10px;white-space:nowrap}.catalog-fallback{background:#f7f0e4;border-color:#e7dbc4}.catalog-fallback p{color:#75603b}.text-button{padding:4px 0;background:transparent;color:#705384;font-size:12px}
.image-mode-options{display:flex;gap:18px;margin:0 0 17px}.image-mode-options button[aria-pressed=true]{text-decoration:underline;font-weight:bold}.field-hint{font-size:11px;color:#626b55;margin:10px 0 20px}.sketch-pad canvas{display:block;width:100%;height:auto;background:#fcf9ff;border:1px dashed #b69fc9;border-radius:8px;touch-action:none;cursor:crosshair}.sketch-footer{display:flex;justify-content:space-between;font-size:11px;gap:10px;margin-top:8px;color:#626b55}.drawing-preview{width:150px;height:65px;object-fit:contain;background:#fff;border-radius:5px;margin-top:12px}
@media(max-width:650px){.mode-tabs button{font-size:11px}.expression-options{gap:4px}.expression-option{font-size:9px}.color-option{width:32px;height:32px}.song-options .expression-option{font-size:11px}.symbol-option{font-size:28px}.catalog-status{gap:9px;padding:10px}.catalog-status p{font-size:10px}}
'''
html = html.replace('</head>', begin + '<style>' + styles + '</style>' + end + '\n</head>')
start_marker = '// SHARED CREATIVE COMPONENTS'
end_marker = '// END SHARED CREATIVE COMPONENTS'
html = re.sub(re.escape(start_marker) + r'[\s\S]*?' + re.escape(end_marker), '', html)

def module(filename):
    text = (root / 'src' / filename).read_text()
    text = re.sub(r'^import\b[\s\S]*?;\s*', '', text, flags=re.M)
    text = text.replace('export default ', '').replace('export ', '')
    text = text.replace('import.meta.env.VITE_COLORMIND_CATALOG_URL', 'window.TWO_PERSPECTIVES_CATALOG_URLS?.colors')
    text = text.replace('import.meta.env.VITE_SONG_CATALOG_URL', 'window.TWO_PERSPECTIVES_CATALOG_URLS?.songs')
    return text

shared = '''
const {createContext,useCallback,useContext}=React;
const colors=COLORS.map(([label,value])=>({label,value}));
const symbols=SYMBOLS.map(([label,value])=>({label,value}));
const songs=SONGS.map(value=>({label:value,value}));
'''
shared += '\n'.join(module(name) for name in ['itunes-jsonp.js', 'creative-api.js', 'CreativeCatalog.jsx', 'SketchPad.jsx', 'CreativeChoice.jsx'])
shared += '\nfunction Picker({a,update}) { return <CreativeChoice response={a} setResponse={update}/>; }\n'
if 'function Picker({a,update,after})' in html:
    start = html.index('function Picker({a,update,after})')
    stop = html.index('function Compare(', start)
    html = html[:start] + html[stop:]
html = html.replace('function Compare(', start_marker + '\n' + shared + '\n' + end_marker + '\nfunction Compare(', 1)
html = html.replace('a.mode==="sketch"?"An original sketch":label', 'a.mode==="sketch"?"An original sketch":(a.choiceLabel||label||a.choice)')
html = html.replace('.render(<App/>);', '.render(<CreativeCatalogProvider><App/></CreativeCatalogProvider>);')
output.write_text(html)
print('Updated copyable HTML with shared creative components:', output)
