#!/usr/bin/python

# Based on http://git.io/unicode by @mathias

import math
import sys
import string
import re
from collections import defaultdict

def parseUnicodeDatabase(source):
	charDict = {}

	with open(source) as uni:
		flag = False
		first = 0
		for line in uni:
			d = string.split(line.strip(), ';')
			val = int(d[0], 16)
			if flag:
				if re.compile('<.+, Last>').match(d[1]):
					flag = False
					for t in range(first, val + 1):
						charDict[t] = str(d[2])
				else:
					raise 'Database exception'
			else:
				if re.compile('<.+, First>').match(d[1]):
					flag = True
					first = val
				else:
					charDict[val] = str(d[2])

	categoryDict = defaultdict(list)
	for i in range(0x10FFFF + 1):
		if charDict.get(i) == None:
			category = 'Cn'
		else:
			category = charDict[i]
		categoryDict[category].append(i)

	return categoryDict

def splitAtBMP(codePointList):
	bmp = []
	supplementary = defaultdict(list)

	for codePoint in codePointList:
		if codePoint <= 0xFFFF:
			bmp.append(codePoint)
		else:
			supplementary[highSurrogate(codePoint)].append(lowSurrogate(codePoint))

	supplementaryDictByLowRanges = defaultdict(list)
	for hi, lo in supplementary.items():
		supplementaryDictByLowRanges[createRange(lo)].append(hi)

	buf = []
	bmpRange = createRange(bmp)
	if bmpRange:
		buf.append(createRange(bmp))
	for lo, hi in supplementaryDictByLowRanges.items():
		buf.append(createRange(hi) + lo)

	return '|'.join(buf)

def highSurrogate(codePoint):
	return int(math.floor((codePoint - 0x10000) / 0x400) + 0xD800)

def lowSurrogate(codePoint):
	return int((codePoint - 0x10000) % 0x400 + 0xDC00)

def handleCodePoint(codePoint):
	if (codePoint >= 0x41 and codePoint <= 0x5A) or (codePoint >= 0x61 and codePoint <= 0x7A) or (codePoint >= 0x30 and codePoint <= 0x39): # alnum
		string = chr(codePoint)
	elif codePoint <= 0xFF: # hexadecimal escapes
		string = '\\x' + '%02X' % codePoint
	elif codePoint <= 0xFFFF: # Unicode escapes
		string = '\\u' + '%04X' % codePoint
	return string

def createRange(r):
	if len(r) == 0:
		return ''

	buf = []
	start = r[0]
	end = r[0]
	predict = start + 1
	r = r[1:]

	counter = 0
	for code in r:
		if predict == code:
			end = code
			predict = code + 1
			continue
		else:
			if start == end:
				buf.append(handleCodePoint(start))
				counter += 1
			elif end == start + 1:
				buf.append('%s%s' % (handleCodePoint(start), handleCodePoint(end)))
				counter += 2
			else:
				buf.append('%s-%s' % (handleCodePoint(start), handleCodePoint(end)))
				counter += 2
			start = code
			end = code
			predict = code + 1

	if start == end:
		buf.append(handleCodePoint(start))
		counter += 1
	elif end == start + 1:
		buf.append('%s%s' % (handleCodePoint(start), handleCodePoint(end)))
		counter += 2
	else:
		buf.append('%s-%s' % (handleCodePoint(start), handleCodePoint(end)))
		counter += 2

	if counter == 1:
		return ''.join(buf)
	else:
		return '[' + ''.join(buf) + ']'

def parseList(categoryName, categoryList):
	return categoryName + ': "' + splitAtBMP(categoryList) + '",'

def main(sourceFile):
	dictionary = parseUnicodeDatabase(sourceFile)
	for item in sorted(dictionary.items()):
		category = item[0]
		result = parseList(category, item[1])
		print result

if __name__ == '__main__':
	main(sys.argv[1])
