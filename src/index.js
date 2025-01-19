import { filter, fromEvent, map, Subject, takeUntil } from 'rxjs';
import WORDS_LIST from './wordsList.json'

const letterRows = document.getElementsByClassName('letter-row');
const numberOfColumns = letterRows[0].children.length;
const messageText = document.getElementById('message-text');
const restartButton = document.getElementById('restart-button');
let letterRowIndex = 0;
let letterColumnIndex = 0;
let userRowWord = [];
const getRandomWord = () => WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
const randomWord = getRandomWord();
console.log('%cRandom word is:', 'color:green', randomWord);

const userWinOrLose$ = new Subject();
const onKeyDown$ = fromEvent(document, 'keydown');

const insertLetter$ = onKeyDown$.pipe(
  map(event => event.key.toUpperCase()),
  filter(pressedKey => pressedKey.length === 1 && pressedKey.match(/[A-Z]/))
);
const insertLetter = {
  next: (pressedKey) => {
      let letterBox = Array.from(letterRows)[letterRowIndex].children[letterColumnIndex];
      if (letterBox) {
        letterBox.textContent = pressedKey;
        letterBox.classList.add('filled-letter');
        letterColumnIndex++;
        userRowWord.push(pressedKey);
      }
    }
  ,complete: () => {
		console.warn("There are no more events");
	},
	error: (error) => {
		console.error("Something went wrong: ", error.message);
	}
};

const deleteLetter$ = onKeyDown$.pipe(
  filter(event => event.key === 'Backspace')
);
const deleteLetter = {
  next: (event) => {
    let letterBox = Array.from(letterRows)[letterRowIndex].children[letterColumnIndex - 1];
    if (letterBox) {
      letterBox.classList.remove('filled-letter');
      letterColumnIndex--;
      letterBox.textContent = '';
      userRowWord.pop();
    }
  },
  complete: () => {
		console.warn("There are no more events");
	},
	error: (error) => {
		console.error("Something went wrong: ", error.message);
	}
};

const checkWord$ = onKeyDown$.pipe(
  filter(event => event.key === 'Enter')
);
const checkWord = {
  next: (event) => {
    const isNotMaxRow = letterRowIndex <= letterRows.length - 1;
    const isRowFull = userRowWord.length === numberOfColumns;
    if (isNotMaxRow && isRowFull) {
      if (userRowWord.join('') === randomWord) {
        const letters = [...letterRows[letterRowIndex].children];
        letters.forEach(element => element.classList.add('letter-green'));
        messageText.textContent = '🎉🪅You won!🎉🪅';
        userWinOrLose$.next();
        restartButton.disabled = false;
      } else {
        giveUserHints();
        letterRowIndex++;
        letterColumnIndex = 0;
        const userAnswer = userRowWord.join('').toUpperCase();
        messageText.textContent = !WORDS_LIST.includes(userAnswer) ?
          `↪️Enter pressed. The word ${userAnswer} is not in the list.` :
          '↪️Enter pressed.';
        userRowWord = [];
      }
    } else {
      messageText.textContent = userRowWord.length === 4 ? 
        `⚠️ 1 - missing letter before enter!`:
        `⚠️ ${5 - userRowWord.length} - missing letters before enter!`;

      const lettersMissing = numberOfColumns - letterColumnIndex;
      if(lettersMissing === 0){
        giveUserHints();
        messageText.innerHTML = `😭❌You lost!😭❌<br>The word was: ${randomWord}`;
        userWinOrLose$.next();
        restartButton.disabled = false;
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
    let letterPosition = righWordArray.indexOf(userRowWord[i]);
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

insertLetter$.pipe(takeUntil(userWinOrLose$)).subscribe(insertLetter);
deleteLetter$.pipe(takeUntil(userWinOrLose$)).subscribe(deleteLetter);
checkWord$.pipe(takeUntil(userWinOrLose$)).subscribe(checkWord);