#!/bin/bash
# Based on http://git.io/unicode by @mathias

# Allow running this script from another directory
cd "$(dirname "$0")"

# Unicode version
version="6.2.0"

function download() {
	url="$1"
	filename="$2"
	if [ -s "$filename" ]; then
		echo "Skipping ${filename}, as it has already been downloaded."
	else
		echo "Downloading ${url}..."
		curl -# "$url" > "$filename"
	fi
}

# Download Unicode database for each version
mkdir -p "data"
echo "Fetching Unicode data..."
download "http://unicode.org/Public/${version}/ucd/UnicodeData.txt" "data/${version}-database.txt"
download "http://unicode.org/Public/${version}/ucd/Scripts.txt" "data/${version}-scripts.txt"
download "http://unicode.org/Public/${version}/ucd/Blocks.txt" "data/${version}-blocks.txt"
download "http://unicode.org/Public/${version}/ucd/PropList.txt" "data/${version}-proplist.txt"

# Generate the category output data
echo "Parsing Unicode v${version} categories..."
python scripts/category-regex.py "data/${version}-database.txt" > "output/categories.js"

# Generate the scripts output data
echo "Parsing Unicode v${version} scripts..."
python scripts/script-regex.py "data/${version}-scripts.txt" > "output/scripts.js"

# Generate the blocks output data
echo "Parsing Unicode v${version} blocks..."
python scripts/block-regex.py "data/${version}-blocks.txt" > "output/blocks.js"

# Generate the properties output data
echo "Parsing Unicode v${version} properties..."
python scripts/property-regex.py > "output/properties.js"

echo "Done."