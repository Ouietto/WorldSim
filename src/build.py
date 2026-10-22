"""Build the standalone simulator and GitHub Pages entry point."""

import argparse
from pathlib import Path


def main():
    source = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output-dir", type=Path, default=source.parent,
        help="Destination directory (defaults to the project root).",
    )
    args = parser.parse_args()
    read = lambda name: (source / name).read_text(encoding="utf-8")
    core = "\n".join(read(name) for name in (
        "world.js", "lang.js", "hist.js", "society.js", "dynamics.js", "ecology.js", "frontiers.js",
    ))
    assets = "\n".join(
        f'const {name}="{read(filename).strip()}";'
        for name, filename in (
            ("EARTH_ELEV_B64", "earth_elev.b64"),
            ("KOPPEN_B64", "koppen.b64"),
            ("EARTH_CLIMATE_B64", "earth_climate.b64"),
        )
    )
    page = (
        read("shell.html") + '\n<script id="assets">' + assets
        + '</script>\n<script id="core">\n' + core
        + '\n</script>\n<script>\n' + read("ui.js") + '\n</script>\n'
    ).encode("utf-8")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name in ("index.html", "asabiya.html"):
        # Identical bytes on Windows and CI; both URLs run the full simulator.
        (args.output_dir / name).write_bytes(page)
    (args.output_dir / ".nojekyll").write_bytes(b"")
    print(f"Built index.html and asabiya.html ({len(page) / 1e6:.3f} MB each)")


if __name__ == "__main__":
    main()
