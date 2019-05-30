class WordSearch {
	constructor() {
		// Initialize orientation configs
		//	horizontalShift:	which direction does the word move horizontally?
		//	verticalShift:		which direction does the word move vertically?
		this._orientations = {
			horizontal_right:	{ horizontalShift: 1,	verticalShift: 0	},
			vertical_down:		{ horizontalShift: 0,	verticalShift: 1	},
			diagonal_right_down:	{ horizontalShift: 1,	verticalShift: 1	},
			diagonal_left_down:	{ horizontalShift: -1,	verticalShift: 1	},

			horizontal_left:	{ horizontalShift: -1,	verticalShift: 0	},
			vertical_up:		{ horizontalShift: 0,	verticalShift: -1	},
			diagonal_left_up:	{ horizontalShift: -1,	verticalShift: -1	},
			diagonal_right_up:	{ horizontalShift: 1,	verticalShift: -1	}
		};

		this._wordField = null;
		this._wordList = null;

		return this;
	}
	setWordField(inputWordField) {
		// re-initialize these in case setWordField has been called more than once
		this._wordField = null;
		this._rowLength = null;

		let wordFieldLineCount = (inputWordField.match(/\n/g) || []).length;
		if (!(typeof inputWordField === 'string' && (new RegExp('^(([A-Z],){' + wordFieldLineCount + '}[A-Z]\\n){' + wordFieldLineCount + '}(([A-Z],){' + wordFieldLineCount + '}[A-Z])$')).test(inputWordField))) {
			throw new Error("Word field should be a square of uppercase characters that is horizontally comma-separated and vertically newline-separated, as such:\n\tA,B,C\n\tD,E,F\n\tG,H,I");
			return false;
		}

		let rows = inputWordField.split('\n'); // Split into array by newline

		this._rowLength = rows[0].replace(/,/g, '').length;
		this._wordField = rows.join('').replace(/,/g, '');

		return true;
	}
	setWordList(inputWordList) {
		// re-initialize this in case setWordList has been called more than once
		this._wordList = null;

		if (!(typeof inputWordList === 'string' && (new RegExp('^[A-Z][A-Z]+(,[A-Z][A-Z]+)*$')).test(inputWordList))) {
			throw new Error("Word list should comprise a set of 1 or more comma-separated uppercase words of minimum 2 characters");
			return false;
		}

		this._wordList = inputWordList.split(',');

		return true;
	}
	setPuzzle(inputPuzzle) {
		let rows = inputPuzzle.split('\n');

		let inputWordList = rows.shift();
		let inputWordField = rows.join("\n");

		if (!(this.setWordField(inputWordField) && this.setWordList(inputWordList))) {
			return false;
		}

		return true;
	}
	_buildRegex(word, orientationConfig) {
		return new RegExp(
			'^(' // Initialize offset capture group, anchored to beginning of wordfield
				+ '(?:.{' + this._rowLength + '})*' // Begin offset with any number of full rows

				+ '.{' // Once at the desired row, offset any number of columns that would allow the word to be found in the correct orientation without wrapping around
					+ (orientationConfig.horizontalShift < 0 ? word.length - 1 : 0) // If the match moves right-to-left horizontally (-1), there needs to be enough horizontal room ahead of the first matched letter to accommodate the previous letters without wrapping; otherwise, no extra lead is required.
				+ ','
					+ (orientationConfig.horizontalShift > 0 ? this._rowLength - word.length : this._rowLength - 1) // If the match moves left-to-right horizontally (1), there needs to be enough horizontal room after of the first matched letter to accommodate the subsequent letters without wrapping; otherwise, no extra lag is required.
				+ '}'

			+ ')' // Close offset capture group

			+ word.split('')
				.join('.{' + (orientationConfig.verticalShift * this._rowLength - (1 - orientationConfig.horizontalShift)) + '}') // Look for letters separated by N characters
					/*
					explanation: how many characters apart will subsequent letters be in the wordfield-converted-to-string?

					this is visualized in the below grid (rowLength = 3); as read naturally (ltr-writing systems):
					
						A,B,C
						D,E,F
						G,H,I
					
					B and E are separated by 2 characters (3 - 1)
					B and F are separated by 3 characters (3 - 0)
					B and D are separated by 1 character (3 - 2)

					of course, if the word is oriented such that the final letter is encountered first in a regular expression, it needs to be searched in reverse (thus the computation and use of wordDirection)
					*/
		);
	}
}
module.exports = WordSearch
