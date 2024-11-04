import { fromEvent, Subject } from 'rxjs';
import WORDS_LIST from './wordsList.json'

const letterRows = document.getElementsByClassName('letter-row');
const numberOfColumns = letterRows[0].children.length;
const messageText = document.getElementById('message-text');
let letterRowIndex = 0;
let letterColumnIndex = 0;
let userRowWord = [];
const getRandomWord = () => WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
const randomWord = getRandomWord();
console.log('%cRandom word is:', 'color:green', randomWord);

const userWinOrLose$ = new Subject();
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
        userRowWord.push(pressedKey);
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
      let letterBox = Array.from(letterRows)[letterRowIndex].children[letterColumnIndex - 1];
      if (letterBox) {
        letterBox.classList.remove('filled-letter');
        letterColumnIndex--;
        letterBox.textContent = '';
        userRowWord.pop();
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
const checkWord = {
  next: (event) => {
    const pressedKey = event.key;
    if (pressedKey === 'Enter') {
      const isNotMaxRow = letterRowIndex < letterRows.length - 1;
      const isRowFull = userRowWord.length === numberOfColumns;
      if (isNotMaxRow && isRowFull) {
        if (userRowWord.join('') === randomWord) {
          //user wins
          userWinOrLose$.next();
        } else {
          letterRowIndex++;
          letterColumnIndex = 0;
          userRowWord = [];
          messageText.textContent = '↪️Enter pressed';
        }
      } else { messageText.textContent = '⚠️Missing letters before enter!';}
    }
  }
};

onKeyDown$.subscribe(insertLetter);
onKeyDown$.subscribe(deleteLetter);
onKeyDown$.subscribe(checkWord);
userWinOrLose$.subscribe(() => {
    console.log('user wins');
    let letters = [...letterRows[letterRowIndex].children];
    letters.forEach(element => element.classList.add('letter-green'));
    messageText.textContent = '🎉🪅You won!🎉🪅';
  }
);