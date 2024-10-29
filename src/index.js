import { fromEvent } from 'rxjs';

const letterRows = document.getElementsByClassName('letter-row');
let letterRowIndex = 0;
let letterColumnIndex = 0;

const onKeyDown$ = fromEvent(document, 'keydown');
const insertLetter = {
  next: (event) => {
    const pressedKey = event.key.toUpperCase();
    if (pressedKey.length === 1 && pressedKey.match(/[a-z]/i)) {
      let letterBox = Array.from(letterRows)[letterRowIndex].children[letterColumnIndex];
      if (letterBox) {
        letterBox.textContent = pressedKey;
        letterBox.classList.add('filled-letter');
        letterColumnIndex++;
      }
    }
  },
  complete: () => {
		console.warn("There are no more events");
	},
	error: (error) => {
		console.error("Something went wrong: ", error.message);
	}
};
const deleteLetter = {
  next: (event) => {
    const pressedKey = event.key;
    if (pressedKey === 'Backspace') {
      debugger
      let letterBox = Array.from(letterRows)[letterRowIndex].children[letterColumnIndex - 1];
      if (letterBox) {
        letterBox.classList.remove('filled-letter');
        letterColumnIndex--;
        letterBox.textContent = '';
      }
    }
  },
  complete: () => {
		console.warn("There are no more events");
	},
	error: (error) => {
		console.error("Something went wrong: ", error.message);
	}
};

onKeyDown$.subscribe(insertLetter);
onKeyDown$.subscribe(deleteLetter);