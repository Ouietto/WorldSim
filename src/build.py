# Builds the single-file app: python3 build.py  ->  ../asabiya.html
import pathlib
d=pathlib.Path(__file__).resolve().parent
shell=(d/'shell.html').read_text()
core=(d/'world.js').read_text()+(d/'lang.js').read_text()+(d/'hist.js').read_text(); ui=(d/'ui.js').read_text()
assets=f'const EARTH_ELEV_B64="{(d/"earth_elev.b64").read_text().strip()}";\nconst KOPPEN_B64="{(d/"koppen.b64").read_text().strip()}";'
out=shell+'\n<script id="assets">'+assets+'</script>\n<script id="core">\n'+core+'\n</script>\n<script>\n'+ui+'\n</script>\n'
(d.parent/'asabiya.html').write_text(out)
print(len(out)/1e6,'MB')
