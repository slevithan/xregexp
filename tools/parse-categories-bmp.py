#!/usr/bin/python
# By Mathias Bynens <http://mathiasbynens.be/>
# Based on the work of Yusuke Suzuki <utatane.tea@gmail.com> in http://code.google.com/p/esprima/issues/detail?id=110

import sys
import string
import re

class RegExpGenerator(object):
	def __init__(self, detector):
		self.detector = detector

	def generate_category(self, category):
		r = [ ch for ch in range(0xFFFF + 1) if self.detector.is_category(ch, category) ]
		return self._generate_range(r)

	def _generate_range(self, r):
		if len(r) == 0:
			return ''

		buf = []
		start = r[0]
		end = r[0]
		predict = start + 1
		r = r[1:]

		for code in r:
			if predict == code:
				end = code
				predict = code + 1
				continue
			else:
				if start == end:
					buf.append('%04X' % start)
				elif end == start + 1:
					buf.append('%04X%04X' % (start, end))
				else:
					buf.append('%04X-%04X' % (start, end))
				start = code
				end = code
				predict = code + 1

		if start == end:
			buf.append('%04X' % start)
		elif end == start + 1:
			buf.append('%04X%04X' % (start, end))
		else:
			buf.append('%04X-%04X' % (start, end))
		return ''.join(buf)


class Detector(object):
	def __init__(self, data):
		self.data = data

	def is_category(self, ch, category):
		c = self.data[ch]
		if len(category) > 1:
			return c == category
		else:
			return c.startswith(category)

def analyze(source):
	data = []
	dictionary = {}
	with open(source) as uni:
		flag = False
		first = 0
		for line in uni:
			d = string.split(line.strip(), ';')
			val = int(d[0], 16)
			if flag:
				if re.compile('<.+, Last>').match(d[1]):
					# print '%s : u%X' % (d[1], val)
					flag = False
					for t in range(first, val+1):
						dictionary[t] = str(d[2])
				else:
					raise 'Database Exception'
			else:
				if re.compile('<.+, First>').match(d[1]):
					# print '%s : u%X' % (d[1], val)
					flag = True
					first = val
				else:
					dictionary[val] = str(d[2])
	for i in range(0xFFFF + 1):
		if dictionary.get(i) == None:
			data.append('Cn')
		else:
			data.append(dictionary[i])
	return RegExpGenerator(Detector(data))

def main(source):
	generator = analyze(source)
	for category in ['L', 'Ll', 'Lu', 'Lt', 'Lm', 'Lo', 'M', 'Mn', 'Mc', 'Me', 'N', 'Nd', 'Nl', 'No', 'P', 'Pd', 'Ps', 'Pe', 'Pi', 'Pf', 'Pc', 'Po', 'S', 'Sm', 'Sc', 'Sk', 'So', 'Z', 'Zs', 'Zl', 'Zp', 'C', 'Cc', 'Cf', 'Co', 'Cs', 'Cn']:
		print category + ': "' + generator.generate_category(category) + '",'

if __name__ == '__main__':
	main(sys.argv[1])
