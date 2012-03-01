#!/usr/bin/python
# By Mathias Bynens <http://mathiasbynens.be/>,
# who is obviously not very good at Python

import sys
import string
from collections import defaultdict
from itertools import groupby

def sub(x):
	return x[1] - x[0]

def hexify(number):
	return hex(number)[2:].zfill(4).upper()

def optimize(dict):
	for key, value in dict.items():
		ranges = []
		for k, iterable in groupby(enumerate(sorted(value)), sub):
			rng = list(iterable)
			if len(rng) == 1:
				s = hexify(rng[0][1])
			else:
				start = rng[0][1]
				end = rng[-1][1]
				if end == start + 1:
					s = '%s%s' % (hexify(start), hexify(end))
				else:
					s = '%s-%s' % (hexify(start), hexify(end))
			ranges.append(s)
		dict[key] = ''.join(ranges)
	return dict

def analyze(source):
	dictionary = defaultdict(list)
	with open(source) as uni:
		for line in uni:
			if not ' ; ' in line:
				continue
			data = string.split(line.strip(), ';')
			charRange = data[0].replace('..', '-').strip()
			length = len(charRange)
			# Ignore characters outside the BMP for now
			if length != 4 and length != 9:
				continue
			# Safety check
			if length == 10:
				print 'Character range starts in BMP but ends outside BMP: %s' % charRange
				sys.exit(1)
			script = data[1].split('#')[0].strip()
			rangeParts = charRange.split('-')
			if len(rangeParts) == 2:
				dictionary[script].extend(range(int(rangeParts[0], 16), int(rangeParts[1], 16) + 1))
			else:
				dictionary[script].append(int(charRange, 16))
	return optimize(dictionary)

def main(source):
	dictionary = analyze(source)
	for script in ['Arabic', 'Armenian', 'Balinese', 'Bamum', 'Batak', 'Bengali', 'Bopomofo', 'Braille', 'Buginese', 'Buhid', 'Canadian_Aboriginal', 'Cham', 'Cherokee', 'Common', 'Coptic', 'Cyrillic', 'Devanagari', 'Ethiopic', 'Georgian', 'Glagolitic', 'Greek', 'Gujarati', 'Gurmukhi', 'Han', 'Hangul', 'Hanunoo', 'Hebrew', 'Hiragana', 'Inherited', 'Javanese', 'Kannada', 'Katakana', 'Kayah_Li', 'Khmer', 'Lao', 'Latin', 'Lepcha', 'Limbu', 'Lisu', 'Malayalam', 'Mandaic', 'Meetei_Mayek', 'Mongolian', 'Myanmar', 'New_Tai_Lue', 'Nko', 'Ogham', 'Ol_Chiki', 'Oriya', 'Phags_Pa', 'Rejang', 'Runic', 'Samaritan', 'Saurashtra', 'Sinhala', 'Sundanese', 'Syloti_Nagri', 'Syriac', 'Tagalog', 'Tagbanwa', 'Tai_Le', 'Tai_Tham', 'Tai_Viet', 'Tamil', 'Telugu', 'Thaana', 'Thai', 'Tibetan', 'Tifinagh', 'Vai', 'Yi']:
		print '\t' + script + ': "' + dictionary[script] + '",'

if __name__ == '__main__':
	main(sys.argv[1])
