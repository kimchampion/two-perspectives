"""Package the separate prototype without changing the original classroom repo."""
from pathlib import Path
import argparse
import shutil
import zipfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description='Package the app and editable source.')
parser.add_argument('--output', type=Path, default=root / 'dist/releases')
output = parser.parse_args().output
output.mkdir(parents=True, exist_ok=True)
for filename in ['Two-Perspectives.html', 'Two-Perspectives-updated.html']:
    shutil.copy2(root / 'dist/Two-Perspectives.html', output / filename)

instructions = '''TWO PERSPECTIVES — OPEN IN YOUR BROWSER

1. Download and unzip this package.
2. Open Two-Perspectives.html in Chrome, Edge, Firefox, or Safari.
3. Choose Create a session. Both participants take turns on the same device.
4. Enter two different nicknames and press We're both here.
   You can also select Just exploring? Try demo nicknames.
5. Choose a story, check the ground-rules box, and press Begin with... .
6. Confirm the first participant's turn to see the first question.

This version accepts browser-filled nickname fields and shows clear validation
messages if a name is missing or duplicated.

No installation, account, or server is needed for the single HTML file.
ColorMind palettes and Apple's public song chart require an internet connection.
Clearly labeled preset choices remain available when either API is unavailable.
Open the downloaded file in your computer's browser, outside ChatGPT's web preview.

To edit the React/Tailwind source, open the source folder and follow README.md.
This is the independent Two Perspectives project.
'''
with zipfile.ZipFile(output / 'Two-Perspectives.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('Two-Perspectives/OPEN-ME.txt', instructions)
    archive.write(output / 'Two-Perspectives.html', 'Two-Perspectives/Two-Perspectives.html')
    for file in sorted(root.rglob('*')):
        if not file.is_file():
            continue
        relative = file.relative_to(root)
        if file.name == '.env' or (file.name.startswith('.env.') and file.name != '.env.example'):
            continue
        if any(part in {'node_modules', 'dist', '.git', '.vite', 'test-results', '__pycache__'} for part in relative.parts):
            continue
        archive.write(file, Path('Two-Perspectives/source') / relative)
with zipfile.ZipFile(output / 'Two-Perspectives.zip') as archive:
    assert archive.testzip() is None
print('Updated HTML and verified source ZIP:', output)
