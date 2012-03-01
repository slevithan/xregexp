#!/bin/bash

# Allow running this script from another directory
cd "$(dirname "$0")"

# The latest version of UnicodeData.txt can be found at:
# http://unicode.org/Public/UNIDATA/UnicodeData.txt
# Static, versioned copies have URLs similar to:
# http://www.unicode.org/Public/6.1.0/ucd/UnicodeData.txt
curl -# http://www.unicode.org/Public/6.1.0/ucd/UnicodeData.txt > data/UnicodeData-6.1.0.txt

# Generate the regular expressions
python parse-categories.py data/UnicodeData-6.1.0.txt > output/category-ranges.txt

# Quick hack to remove the last comma
sed -i '' -e '$s/,$//' output/category-ranges.txt

# Display the result
cat output/category-ranges.txt
