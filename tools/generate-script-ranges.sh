#!/bin/bash

# Allow running this script from another directory
cd "$(dirname "$0")"

# The latest version of UnicodeData.txt can be found at:
# http://unicode.org/Public/UNIDATA/Scripts.txt
# Static, versioned copies have URLs similar to:
# http://www.unicode.org/Public/6.1.0/ucd/Scripts.txt
#curl -# http://www.unicode.org/Public/6.1.0/ucd/Scripts.txt > Scripts-6.1.0.txt

# Generate the regular expressions
python parse-scripts.py Scripts-6.1.0.txt > script-ranges.txt

# Dirty hack to replace `Nko` with `NKo`
sed -i '' -e 's/Nko:/NKo:/' script-ranges.txt
# Quick hack to remove the last comma
sed -i '' -e '$s/,$//' script-ranges.txt

# Display the result
cat script-ranges.txt
