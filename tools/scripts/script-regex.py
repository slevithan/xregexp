#!/usr/bin/python
# Based on http://git.io/unicode by @mathias

from utils import *
import sys

def format(scriptName, bmpRange, astralRange, isBmpLast):
	buf = []
	if isBmpLast:
		buf.append('            isBmpLast: true')
	if bmpRange != '':
		buf.append('            bmp: \'' + bmpRange + '\'')
	if astralRange != '':
		buf.append('            astral: \'' + astralRange + '\'')
	return '        {\n            name: \'' + scriptName + '\',\n' + ',\n'.join(buf) + '\n        }'

def main(sourceFile):
	dictionary = parseScriptsOrProps(sourceFile)
	buf = []
	for item in sorted(dictionary.items()):
		script = item[0]
		ranges = createRange(item[1])
		buf.append(format(script, ranges[0], ranges[1], ranges[2]))
	print '[\n' + ',\n'.join(buf) + '\n]'

if __name__ == '__main__':
	main(sys.argv[1])