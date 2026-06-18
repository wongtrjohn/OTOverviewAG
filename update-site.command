#!/bin/bash
cd "$(dirname "$0")"
command -v python3 >/dev/null 2>&1 || { echo "Install Python 3 from python.org first."; exit 1; }
python3 -m pip install --quiet openpyxl
python3 build_site_data.py
echo
echo "Done. Open GitHub Desktop, Commit, then Push to publish."
