#!/bin/bash

# Allow running this script from another directory
cd "$(dirname "$0")"

# List of all source files excluding backcompat.js
source_files="
    ../src/xregexp.js
    ./concatenate-source-files-fix.js
    $(find ../src/addons -name '*.js' -print)
"

# Filename of concatenated package
output_file="../xregexp-all.js"

# Remove output file to re-write it
rm -f $output_file

# Concatenate all source files
for file in $source_files
do
    echo ''                                >> $output_file
    echo "/***** $(basename $file) *****/" >> $output_file
    echo ''                                >> $output_file
    cat $file                              >> $output_file
done

echo "Succesfully created $(basename $output_file)"
