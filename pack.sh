#!/bin/sh

# This script is used to pack the extension into an xpi file.

FILE_LIST="content.js icon.svg LICENCE manifest.json README.md"
OUTPUT_FILE="extension.xpi"

rm -f $OUTPUT_FILE
zip -r $OUTPUT_FILE $FILE_LIST
