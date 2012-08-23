#!/bin/bash

# Allow running this script from another directory
cd "$(dirname "$0")"

# Ordered list of all source files
source_files='
    ./intro.js
    ../src/xregexp.js
    ../src/addons/build.js
    ../src/addons/matchrecursive.js
    ../src/addons/unicode/unicode-base.js
    ../src/addons/unicode/unicode-blocks.js
    ../src/addons/unicode/unicode-categories.js
    ../src/addons/unicode/unicode-properties.js
    ../src/addons/unicode/unicode-scripts.js
    ./outro.js
'

# Filename of concatenated package
output_file='../xregexp-all.js'

# Remove output file to re-write it
rm -f $output_file

# Concatenate all source files
for file in $source_files
do
    cat $file >> $output_file
    echo ''   >> $output_file
done

echo "Successfully created $(basename $output_file)"
