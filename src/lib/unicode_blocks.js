export function getUnicodeBlockByName(name) {
	// log(`getUnicodeBlockByName`, 'start');
	// log(`name: ${name}`);
	for (let b = 0; b < unicodeBlocks.length; b++) {
		if (unicodeBlocks[b].name === name) {
			// log(`found unicodeBlocks[b].name: ${unicodeBlocks[b].name}`);
			// log(`getUnicodeBlockByName`, 'end');
			return unicodeBlocks[b];
		}
	}
	// log(`returning FALSE`);
	// log(`getUnicodeBlockByName`, 'end');
	return false;
}

export const unicodeBlocks = [
	{ begin: 0x0000, end: 0x001f, name: 'Basic Latin Controls' },
	{ begin: 0x0020, end: 0x007f, name: 'Basic Latin' },
	{ begin: 0x0080, end: 0x009f, name: 'Latin-1 Supplement Controls' },
	{ begin: 0x00a0, end: 0x00ff, name: 'Latin-1 Supplement' },
	{ begin: 0x0100, end: 0x017f, name: 'Latin Extended-A' },
	{ begin: 0x0180, end: 0x024f, name: 'Latin Extended-B' },
	{ begin: 0x0250, end: 0x02af, name: 'IPA Extensions' },
	{ begin: 0x02b0, end: 0x02ff, name: 'Spacing Modifier Letters' },
	{ begin: 0x0300, end: 0x036f, name: 'Combining Diacritical Marks' },
	{ begin: 0x0370, end: 0x03ff, name: 'Greek and Coptic' },
	{ begin: 0x0400, end: 0x04ff, name: 'Cyrillic' },
	{ begin: 0x0500, end: 0x052f, name: 'Cyrillic Supplement' },
	{ begin: 0x0530, end: 0x058f, name: 'Armenian' },
	{ begin: 0x0590, end: 0x05ff, name: 'Hebrew' },
	{ begin: 0x0600, end: 0x06ff, name: 'Arabic' },
	{ begin: 0x0700, end: 0x074f, name: 'Syriac' },
	{ begin: 0x0750, end: 0x077f, name: 'Arabic Supplement' },
	{ begin: 0x0780, end: 0x07bf, name: 'Thaana' },
	{ begin: 0x07c0, end: 0x07ff, name: 'NKo' },
	{ begin: 0x0800, end: 0x083f, name: 'Samaritan' },
	{ begin: 0x0840, end: 0x085f, name: 'Mandaic' },
	{ begin: 0x0860, end: 0x086f, name: 'Syriac Supplement' },
	{ begin: 0x08a0, end: 0x08ff, name: 'Arabic Extended-A' },
	{ begin: 0x0900, end: 0x097f, name: 'Devanagari' },
	{ begin: 0x0980, end: 0x09ff, name: 'Bengali' },
	{ begin: 0x0a00, end: 0x0a7f, name: 'Gurmukhi' },
	{ begin: 0x0a80, end: 0x0aff, name: 'Gujarati' },
	{ begin: 0x0b00, end: 0x0b7f, name: 'Oriya' },
	{ begin: 0x0b80, end: 0x0bff, name: 'Tamil' },
	{ begin: 0x0c00, end: 0x0c7f, name: 'Telugu' },
	{ begin: 0x0c80, end: 0x0cff, name: 'Kannada' },
	{ begin: 0x0d00, end: 0x0d7f, name: 'Malayalam' },
	{ begin: 0x0d80, end: 0x0dff, name: 'Sinhala' },
	{ begin: 0x0e00, end: 0x0e7f, name: 'Thai' },
	{ begin: 0x0e80, end: 0x0eff, name: 'Lao' },
	{ begin: 0x0f00, end: 0x0fff, name: 'Tibetan' },
	{ begin: 0x1000, end: 0x109f, name: 'Myanmar' },
	{ begin: 0x10a0, end: 0x10ff, name: 'Georgian' },
	{ begin: 0x1100, end: 0x11ff, name: 'Hangul Jamo' },
	{ begin: 0x1200, end: 0x137f, name: 'Ethiopic' },
	{ begin: 0x1380, end: 0x139f, name: 'Ethiopic Supplement' },
	{ begin: 0x13a0, end: 0x13ff, name: 'Cherokee' },
	{ begin: 0x1400, end: 0x167f, name: 'Unified Canadian Aboriginal Syllabics' },
	{ begin: 0x1680, end: 0x169f, name: 'Ogham' },
	{ begin: 0x16a0, end: 0x16ff, name: 'Runic' },
	{ begin: 0x1700, end: 0x171f, name: 'Tagalog' },
	{ begin: 0x1720, end: 0x173f, name: 'Hanunoo' },
	{ begin: 0x1740, end: 0x175f, name: 'Buhid' },
	{ begin: 0x1760, end: 0x177f, name: 'Tagbanwa' },
	{ begin: 0x1780, end: 0x17ff, name: 'Khmer' },
	{ begin: 0x1800, end: 0x18af, name: 'Mongolian' },
	{
		begin: 0x18b0,
		end: 0x18ff,
		name: 'Unified Canadian Aboriginal Syllabics Extended',
	},
	{ begin: 0x1900, end: 0x194f, name: 'Limbu' },
	{ begin: 0x1950, end: 0x197f, name: 'Tai Le' },
	{ begin: 0x1980, end: 0x19df, name: 'New Tai Lue' },
	{ begin: 0x19e0, end: 0x19ff, name: 'Khmer Symbols' },
	{ begin: 0x1a00, end: 0x1a1f, name: 'Buginese' },
	{ begin: 0x1a20, end: 0x1aaf, name: 'Tai Tham' },
	{ begin: 0x1ab0, end: 0x1aff, name: 'Combining Diacritical Marks Extended' },
	{ begin: 0x1b00, end: 0x1b7f, name: 'Balinese' },
	{ begin: 0x1b80, end: 0x1bbf, name: 'Sundanese' },
	{ begin: 0x1bc0, end: 0x1bff, name: 'Batak' },
	{ begin: 0x1c00, end: 0x1c4f, name: 'Lepcha' },
	{ begin: 0x1c50, end: 0x1c7f, name: 'Ol Chiki' },
	{ begin: 0x1c80, end: 0x1c8f, name: 'Cyrillic Extended-C' },
	{ begin: 0x1c90, end: 0x1cbf, name: 'Georgian Extended' },
	{ begin: 0x1cc0, end: 0x1ccf, name: 'Sundanese Supplement' },
	{ begin: 0x1cd0, end: 0x1cff, name: 'Vedic Extensions' },
	{ begin: 0x1d00, end: 0x1d7f, name: 'Phonetic Extensions' },
	{ begin: 0x1d80, end: 0x1dbf, name: 'Phonetic Extensions Supplement' },
	{
		begin: 0x1dc0,
		end: 0x1dff,
		name: 'Combining Diacritical Marks Supplement',
	},
	{ begin: 0x1e00, end: 0x1eff, name: 'Latin Extended Additional' },
	{ begin: 0x1f00, end: 0x1fff, name: 'Greek Extended' },
	{ begin: 0x2000, end: 0x206f, name: 'General Punctuation' },
	{ begin: 0x2070, end: 0x209f, name: 'Superscripts and Subscripts' },
	{ begin: 0x20a0, end: 0x20cf, name: 'Currency Symbols' },
	{
		begin: 0x20d0,
		end: 0x20ff,
		name: 'Combining Diacritical Marks for Symbols',
	},
	{ begin: 0x2100, end: 0x214f, name: 'Letterlike Symbols' },
	{ begin: 0x2150, end: 0x218f, name: 'Number Forms' },
	{ begin: 0x2190, end: 0x21ff, name: 'Arrows' },
	{ begin: 0x2200, end: 0x22ff, name: 'Mathematical Operators' },
	{ begin: 0x2300, end: 0x23ff, name: 'Miscellaneous Technical' },
	{ begin: 0x2400, end: 0x243f, name: 'Control Pictures' },
	{ begin: 0x2440, end: 0x245f, name: 'Optical Character Recognition' },
	{ begin: 0x2460, end: 0x24ff, name: 'Enclosed Alphanumerics' },
	{ begin: 0x2500, end: 0x257f, name: 'Box Drawing' },
	{ begin: 0x2580, end: 0x259f, name: 'Block Elements' },
	{ begin: 0x25a0, end: 0x25ff, name: 'Geometric Shapes' },
	{ begin: 0x2600, end: 0x26ff, name: 'Miscellaneous Symbols' },
	{ begin: 0x2700, end: 0x27bf, name: 'Dingbats' },
	{ begin: 0x27c0, end: 0x27ef, name: 'Miscellaneous Mathematical Symbols-A' },
	{ begin: 0x27f0, end: 0x27ff, name: 'Supplemental Arrows-A' },
	{ begin: 0x2800, end: 0x28ff, name: 'Braille Patterns' },
	{ begin: 0x2900, end: 0x297f, name: 'Supplemental Arrows-B' },
	{ begin: 0x2980, end: 0x29ff, name: 'Miscellaneous Mathematical Symbols-B' },
	{ begin: 0x2a00, end: 0x2aff, name: 'Supplemental Mathematical Operators' },
	{ begin: 0x2b00, end: 0x2bff, name: 'Miscellaneous Symbols and Arrows' },
	{ begin: 0x2c00, end: 0x2c5f, name: 'Glagolitic' },
	{ begin: 0x2c60, end: 0x2c7f, name: 'Latin Extended-C' },
	{ begin: 0x2c80, end: 0x2cff, name: 'Coptic' },
	{ begin: 0x2d00, end: 0x2d2f, name: 'Georgian Supplement' },
	{ begin: 0x2d30, end: 0x2d7f, name: 'Tifinagh' },
	{ begin: 0x2d80, end: 0x2ddf, name: 'Ethiopic Extended' },
	{ begin: 0x2de0, end: 0x2dff, name: 'Cyrillic Extended-A' },
	{ begin: 0x2e00, end: 0x2e7f, name: 'Supplemental Punctuation' },
	{ begin: 0x2e80, end: 0x2eff, name: 'CJK Radicals Supplement' },
	{ begin: 0x2f00, end: 0x2fdf, name: 'Kangxi Radicals' },
	{ begin: 0x2ff0, end: 0x2fff, name: 'Ideographic Description Characters' },
	{ begin: 0x3000, end: 0x303f, name: 'CJK Symbols and Punctuation' },
	{ begin: 0x3040, end: 0x309f, name: 'Hiragana' },
	{ begin: 0x30a0, end: 0x30ff, name: 'Katakana' },
	{ begin: 0x3100, end: 0x312f, name: 'Bopomofo' },
	{ begin: 0x3130, end: 0x318f, name: 'Hangul Compatibility Jamo' },
	{ begin: 0x3190, end: 0x319f, name: 'Kanbun' },
	{ begin: 0x31a0, end: 0x31bf, name: 'Bopomofo Extended' },
	{ begin: 0x31c0, end: 0x31ef, name: 'CJK Strokes' },
	{ begin: 0x31f0, end: 0x31ff, name: 'Katakana Phonetic Extensions' },
	{ begin: 0x3200, end: 0x32ff, name: 'Enclosed CJK Letters and Months' },
	{ begin: 0x3300, end: 0x33ff, name: 'CJK Compatibility' },
	{ begin: 0x3400, end: 0x4dbf, name: 'CJK Unified Ideographs Extension A' },
	{ begin: 0x4dc0, end: 0x4dff, name: 'Yijing Hexagram Symbols' },
	{ begin: 0x4e00, end: 0x9fff, name: 'CJK Unified Ideographs' },
	{ begin: 0xa000, end: 0xa48f, name: 'Yi Syllables' },
	{ begin: 0xa490, end: 0xa4cf, name: 'Yi Radicals' },
	{ begin: 0xa4d0, end: 0xa4ff, name: 'Lisu' },
	{ begin: 0xa500, end: 0xa63f, name: 'Vai' },
	{ begin: 0xa640, end: 0xa69f, name: 'Cyrillic Extended-B' },
	{ begin: 0xa6a0, end: 0xa6ff, name: 'Bamum' },
	{ begin: 0xa700, end: 0xa71f, name: 'Modifier Tone Letters' },
	{ begin: 0xa720, end: 0xa7ff, name: 'Latin Extended-D' },
	{ begin: 0xa800, end: 0xa82f, name: 'Syloti Nagri' },
	{ begin: 0xa830, end: 0xa83f, name: 'Common Indic Number Forms' },
	{ begin: 0xa840, end: 0xa87f, name: 'Phags-pa' },
	{ begin: 0xa880, end: 0xa8df, name: 'Saurashtra' },
	{ begin: 0xa8e0, end: 0xa8ff, name: 'Devanagari Extended' },
	{ begin: 0xa900, end: 0xa92f, name: 'Kayah Li' },
	{ begin: 0xa930, end: 0xa95f, name: 'Rejang' },
	{ begin: 0xa960, end: 0xa97f, name: 'Hangul Jamo Extended-A' },
	{ begin: 0xa980, end: 0xa9df, name: 'Javanese' },
	{ begin: 0xa9e0, end: 0xa9ff, name: 'Myanmar Extended-B' },
	{ begin: 0xaa00, end: 0xaa5f, name: 'Cham' },
	{ begin: 0xaa60, end: 0xaa7f, name: 'Myanmar Extended-A' },
	{ begin: 0xaa80, end: 0xaadf, name: 'Tai Viet' },
	{ begin: 0xaae0, end: 0xaaff, name: 'Meetei Mayek Extensions' },
	{ begin: 0xab00, end: 0xab2f, name: 'Ethiopic Extended-A' },
	{ begin: 0xab30, end: 0xab6f, name: 'Latin Extended-E' },
	{ begin: 0xab70, end: 0xabbf, name: 'Cherokee Supplement' },
	{ begin: 0xabc0, end: 0xabff, name: 'Meetei Mayek' },
	{ begin: 0xac00, end: 0xd7af, name: 'Hangul Syllables' },
	{ begin: 0xd7b0, end: 0xd7ff, name: 'Hangul Jamo Extended-B' },
	{ begin: 0xd800, end: 0xdb7f, name: 'High Surrogates' },
	{ begin: 0xdb80, end: 0xdbff, name: 'High Private Use Surrogates' },
	{ begin: 0xdc00, end: 0xdfff, name: 'Low Surrogates' },
	{ begin: 0xe000, end: 0xf8ff, name: 'Private Use Area' },
	{ begin: 0xf900, end: 0xfaff, name: 'CJK Compatibility Ideographs' },
	{ begin: 0xfb00, end: 0xfb4f, name: 'Alphabetic Presentation Forms' },
	{ begin: 0xfb50, end: 0xfdff, name: 'Arabic Presentation Forms-A' },
	{ begin: 0xfe00, end: 0xfe0f, name: 'Variation Selectors' },
	{ begin: 0xfe10, end: 0xfe1f, name: 'Vertical Forms' },
	{ begin: 0xfe20, end: 0xfe2f, name: 'Combining Half Marks' },
	{ begin: 0xfe30, end: 0xfe4f, name: 'CJK Compatibility Forms' },
	{ begin: 0xfe50, end: 0xfe6f, name: 'Small Form Variants' },
	{ begin: 0xfe70, end: 0xfeff, name: 'Arabic Presentation Forms-B' },
	{ begin: 0xff00, end: 0xffef, name: 'Halfwidth and Fullwidth Forms' },
	{ begin: 0xfff0, end: 0xffff, name: 'Specials' },
];

export const unicodeNonCharPoints = [
	{ begin: 0x0000, end: 0x001f, name: 'Basic Latin Controls' },
	{ begin: 0x0080, end: 0x009f, name: 'Latin-1 Supplement Controls' },
];

export function isControlChar(char) {
	for (let r = 0; r < unicodeNonCharPoints.length; r++) {
		if (isCharInRange(char, unicodeNonCharPoints[r])) {
			return true;
		}
	}

	return false;
}

export function isCharInRange(char, range) {
	char = parseInt(char);
	if (isNaN(char)) return false;
	let result = char <= range.end && char >= range.begin;
	return result;
}

export function getParentRange(char) {
	for (let b = 0; b < unicodeBlocks.length; b++) {
		if (char <= unicodeBlocks[b].end && char >= unicodeBlocks[b].begin) {
			return unicodeBlocks[b];
		}
	}
	return false;
}
