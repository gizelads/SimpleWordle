import { fromEvent, Subject, takeLast, takeUntil } from 'rxjs';
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
          const letters = [...letterRows[letterRowIndex].children];
          letters.forEach(element => element.classList.add('letter-green'));
          messageText.textContent = '🎉🪅You won!🎉🪅';
          userWinOrLose$.next();
        } else {
          giveUserHints();
          letterRowIndex++;
          letterColumnIndex = 0;
          userRowWord = [];
          messageText.textContent = '↪️Enter pressed';
        }
      } else {
        const lettersMissing = numberOfColumns - letterColumnIndex;
        messageText.textContent = lettersMissing === 1 ? 
          `⚠️ ${lettersMissing} - missing letter before enter!`:
          `⚠️ ${lettersMissing} - missing letters before enter!`;

        if(lettersMissing === 0){
          giveUserHints();
          messageText.innerHTML = 
            `😭❌You lost!😭❌<br>The word was: ${randomWord}`;
          userWinOrLose$.next();
        }
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

function giveUserHints() {
  const righWordArray = Array.from(randomWord);
  for (let i = 0; i < numberOfColumns; i++) {
    let letterColor = '';
    let letterBox = Array.from(letterRows)[letterRowIndex].children[i];
    console.log(letterBox);
    let letterPosition = righWordArray.indexOf(userRowWord[i]);
    console.log(letterPosition);
    if (letterPosition === -1) {
      letterColor = 'letter-grey';
    } else {
      if (righWordArray[i] === userRowWord[i]) {
        letterColor = 'letter-green';
      } else {
        letterColor = 'letter-yellow';
      }
    }
    letterBox.classList.add(letterColor);
  }
}

onKeyDown$.pipe(
  takeUntil(userWinOrLose$)
).subscribe(insertLetter);
onKeyDown$.pipe(
  takeUntil(userWinOrLose$)
).subscribe(deleteLetter);
onKeyDown$.pipe(
  takeUntil(userWinOrLose$)
).subscribe(checkWord);