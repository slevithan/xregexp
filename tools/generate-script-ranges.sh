#!/bin/bash

# Allow running this script from another directory
cd "$(dirname "$0")"

# The latest version of UnicodeData.txt can be found at:
# http://unicode.org/Public/UNIDATA/Scripts.txt
# Static, versioned copies have URLs similar to:
# http://www.unicode.org/Public/6.1.0/ucd/Scripts.txt
curl -# http://www.unicode.org/Public/6.1.0/ucd/Scripts.txt > data/Scripts-6.1.0.txt

# Generate the regular expressions
python parse-scripts.py data/Scripts-6.1.0.txt > output/script-ranges.txt

# Quick hack to remove the last comma
sed -i '' -e '$s/,$//' output/script-ranges.txt

# Display the result
cat output/script-ranges.txt
