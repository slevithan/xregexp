#!/usr/bin/python
# Based on http://git.io/unicode by @mathias

from utils import *
import sys

# NOTE: As of Unicode 2.1.3, General_Category property values won't be further subdivided
# See http://www.unicode.org/policies/stability_policy.html
aliases = {
	'L': 'Letter',
	'Ll': 'Lowercase_Letter',
	'Lu': 'Uppercase_Letter',
	'Lt': 'Titlecase_Letter',
	'Lm': 'Modifier_Letter',
	'Lo': 'Other_Letter',
	'M': 'Mark',
	'Mn': 'Nonspacing_Mark',
	'Mc': 'Spacing_Mark',
	'Me': 'Enclosing_Mark',
	'N': 'Number',
	'Nd': 'Decimal_Number',
	'Nl': 'Letter_Number',
	'No': 'Other_Number',
	'P': 'Punctuation',
	'Pd': 'Dash_Punctuation',
	'Ps': 'Open_Punctuation',
	'Pe': 'Close_Punctuation',
	'Pi': 'Initial_Punctuation',
	'Pf': 'Final_Punctuation',
	'Pc': 'Connector_Punctuation',
	'Po': 'Other_Punctuation',
	'S': 'Symbol',
	'Sm': 'Math_Symbol',
	'Sc': 'Currency_Symbol',
	'Sk': 'Modifier_Symbol',
	'So': 'Other_Symbol',
	'Z': 'Separator',
	'Zs': 'Space_Separator',
	'Zl': 'Line_Separator',
	'Zp': 'Paragraph_Separator',
	'C': 'Other',
	'Cc': 'Control',
	'Cf': 'Format',
	'Co': 'Private_Use',
	'Cs': 'Surrogate',
	'Cn': 'Unassigned'
}

def format(categoryName, bmpRange, astralRange, isBmpLast):
	buf = []
	if isBmpLast:
		buf.append('            isBmpLast: true')
	if bmpRange != '':
		buf.append('            bmp: \'' + bmpRange + '\'')
	if astralRange != '':
		buf.append('            astral: \'' + astralRange + '\'')
	return '        {\n            name: \'' + categoryName + '\',\n            alias: \'' + aliases[categoryName] + '\',\n' + ',\n'.join(buf) + '\n        }'

def main(sourceFile):
	dictionary = parseDatabase(sourceFile)
	buf = []
	for item in sorted(dictionary.items()):
		category = item[0]
		ranges = createRange(item[1])
		buf.append(format(category, ranges[0], ranges[1], ranges[2]))
	print '[\n' + ',\n'.join(buf) + '\n]'

if __name__ == '__main__':
	main(sys.argv[1])