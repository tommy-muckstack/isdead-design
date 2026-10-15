#!/bin/bash
# mkfont.sh "<Google font dir name>" <ttf file name> <out.woff2>  : latin subset -> woff2 (variable axes kept)
set -e
SRC="/usr/share/fonts/truetype/sand-box/google/$1/$2"
/workspace/kt-venv2/bin/pyftsubset "$SRC" --output-file="$3" --flavor=woff2 --layout-features='*' --unicodes="U+0020-007E,U+00A0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+2192,U+2190,U+20AC,U+2122,U+00A9"
ls -la "$3"
