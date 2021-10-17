import { useEffect, useRef, useState } from 'react';
import './App.css';
import DiceColumn from './components/DiceColumn';

const wordList = require('./filtering_scripts/filtered_wordlist.json');
const fingerKeyMap = require('./filtering_scripts/fingerKeyMap.json');
const handKeyMap = require('./filtering_scripts/handKeyMap.json');

function App() {
  const [wordCount, setWordCount] = useState(6);
  const [fingerMapType, setFingerMapType] = useState('jared');
  const [showDice, setShowDice] = useState(true); // todo: remove
  const [passPhase, setPassPhase] = useState('');
  const [practicePassPhase, setPracticePassPhase] = useState('');
  const [isColumnRollingMap, setIsColumnRollingMap] = useState(
    new Map<number, boolean>()
  );
  const updateIsColumnRollingMap = (
    columnIndex: number,
    isRolling: boolean
  ) => {
    setIsColumnRollingMap(
      new Map(isColumnRollingMap.set(columnIndex, isRolling))
    );
  };
  const [diceValueMap, setDiceValueMap] = useState(
    new Map<number, Map<number, number>>()
  );
  const updateDiceValueMap = (
    columnIndex: number,
    dieIndex: number,
    value: number
  ) => {
    let diceColumnMap = diceValueMap.get(columnIndex);

    if (diceColumnMap) {
      diceColumnMap.set(dieIndex, value);
    } else {
      const dieMap = new Map<number, number>();
      dieMap.set(dieIndex, value);
      diceValueMap.set(columnIndex, dieMap);
    }

    diceColumnMap = diceValueMap.get(columnIndex);

    setDiceValueMap(new Map(diceValueMap.set(columnIndex, diceColumnMap!)));
  };
  const [wordMap, setWordMap] = useState(new Map<number, string>());
  const updateWordMap = (wordIndex: number, word: string) => {
    setWordMap(new Map(wordMap.set(wordIndex, word)));
  };
  const [isMounted, setIsMounted] = useState(false);
  const practicePassPhaseInputElement: React.RefObject<HTMLInputElement> =
    useRef(null);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      handleRollDiceClick();
    }
  }, []);

  function handleWordCountClick(count: number) {
    setWordCount(count);
    handleRollDiceClick();
  }

  function handlePassPhraseChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPracticePassPhase(event.target.value);
  }

  async function handleRollDiceClick() {
    setIsRolling(true);

    for (let i = 0; i < wordCount; i++) {
      updateIsColumnRollingMap(i, true);
    }

    setShowDice(true);

    let previousWordLastCharacter = '';

    for (let i = 0; i < wordCount; i++) {
      const dieResultMap: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      let wordFound = false;

      while (!wordFound) {
        for (let j = 0; j < 5; j++) {
          const rollResult = Math.floor(Math.random() * 6) + 1;
          const dieId = j + 1;
          dieResultMap[dieId] = rollResult;
          updateDiceValueMap(i, j, rollResult);
        }

        const wordNumber =
          +`${dieResultMap[1]}${dieResultMap[2]}${dieResultMap[3]}${dieResultMap[4]}${dieResultMap[5]}`;
        const newWord = wordList[wordNumber];

        if (newWord) {
          const newWordFirstCharacter = newWord.substring(0, 1);

          const isNewWordAllowed = isNewWordAllow(
            previousWordLastCharacter,
            newWordFirstCharacter
          );

          if (isNewWordAllowed) {
            previousWordLastCharacter = newWord.substring(newWord.length - 1);
            console.log(newWord);

            updateWordMap(i, newWord);
            wordFound = true;
          } else {
            console.log('word not allowed - ' + newWord);
          }
        }
      }

      await sleep(200);

      updateIsColumnRollingMap(i, false);
    }

    const result = Array.from(wordMap.entries())
      .reduce((wordList, wordEntry) => {
        wordList.push(wordEntry[1]);

        return wordList;
      }, [] as string[])
      .join('');

    if (
      practicePassPhaseInputElement &&
      practicePassPhaseInputElement.current
    ) {
      practicePassPhaseInputElement.current.focus();
    }

    setPassPhase(result);
    setIsRolling(false);
  }

  function getSeparateWordCharacterClass(
    wordIndex: number,
    character: string,
    characterIndex: number
  ): string {
    let characterClass = '';

    const word = wordMap.get(wordIndex);

    if (word) {
      const startingIndex = passPhase.indexOf(word);

      if (
        startingIndex === -1 ||
        passPhase === '' ||
        startingIndex + characterIndex >= practicePassPhase.length
      ) {
        characterClass = '';
      } else if (
        character === practicePassPhase[startingIndex + characterIndex]
      ) {
        characterClass = 'correct-character';
      } else if (
        character !== practicePassPhase[startingIndex + characterIndex]
      ) {
        characterClass = 'incorrect-character';
      }
    }

    return characterClass;
  }

  function getCharacterClass(
    character: string,
    characterIndex: number
  ): string {
    let characterClass = '';

    if (characterIndex >= practicePassPhase.length) {
      characterClass = '';
    } else if (character === practicePassPhase[characterIndex]) {
      characterClass = 'correct-character';
    } else if (character !== practicePassPhase[characterIndex]) {
      characterClass = 'incorrect-character';
    }

    return characterClass;
  }

  function isNewWordAllow(
    previousCharacter: string,
    newCharacter: string
  ): boolean {
    // Check for Repeated character
    if (previousCharacter === newCharacter) {
      return false;
    }

    // Check for Repeated Finger Use
    const previousCharacterFingerValue = fingerKeyMap[previousCharacter];
    const newCharacterFingerValue = fingerKeyMap[newCharacter];

    if (previousCharacterFingerValue === newCharacterFingerValue) {
      return false;
    }

    // Check for Repeated Hand Use
    // const previousCharacterHandValue = handKeyMap[previousCharacter];
    // const newCharacterHandValue = handKeyMap[newCharacter];

    // if (previousCharacterHandValue === newCharacterHandValue) {
    //   return false;
    // }

    return true;
  }

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  async function handleReRollClick(columnIndex: number) {
    setIsRolling(true);
    updateIsColumnRollingMap(columnIndex, true);

    for (let j = 0; j < 5; j++) {
      updateDiceValueMap(columnIndex, j, 0);
    }

    await sleep(750);

    const dieResultMap: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let wordFound = false;

    while (!wordFound) {
      for (let j = 0; j < 5; j++) {
        const rollResult = Math.floor(Math.random() * 6) + 1;
        const dieId = j + 1;
        dieResultMap[dieId] = rollResult;
        updateDiceValueMap(columnIndex, j, rollResult);
      }

      const wordNumber =
        +`${dieResultMap[1]}${dieResultMap[2]}${dieResultMap[3]}${dieResultMap[4]}${dieResultMap[5]}`;
      const newWord = wordList[wordNumber];

      if (newWord) {
        const newWordFirstCharacter = newWord.substring(0, 1);
        const newWordLastCharacter = newWord.substring(newWord.length - 1);
        const previousWord = wordMap.get(columnIndex - 1);
        let previousWordLastCharacter = '';

        if (previousWord) {
          previousWordLastCharacter = previousWord.substring(
            previousWord.length - 1
          );
        }

        const nextWord = wordMap.get(columnIndex + 1);
        let nextWordFirstCharacter = '';

        if (nextWord) {
          nextWordFirstCharacter = nextWord.substring(0, 1);
        }

        const isNewWordAllowed =
          isNewWordAllow(previousWordLastCharacter, newWordFirstCharacter) &&
          isNewWordAllow(newWordLastCharacter, nextWordFirstCharacter);

        if (isNewWordAllowed) {
          previousWordLastCharacter = newWord.substring(newWord.length - 1);
          console.log(newWord);

          updateWordMap(columnIndex, newWord);
          wordFound = true;
        } else {
          console.log('word not allowed - ' + newWord);
        }
      }
    }

    const result = Array.from(wordMap.entries())
      .reduce((wordList, wordEntry) => {
        wordList.push(wordEntry[1]);

        return wordList;
      }, [] as string[])
      .join('');

    setIsRolling(false);
    setPassPhase(result);
    updateIsColumnRollingMap(columnIndex, false);
  }

  return (
    <div className="App">
      <h1>Master Passphrase Generator</h1>
      <h3>
        A simple tool for securely generating a user friendly typing optimized
        Passphrase
      </h3>
      <div className="description">
        This tool is strictly an offline tool. It does *<strong>not</strong>*
        connect to the internet for greater security.
      </div>
      <div className="description">
        How many words would you like in your passphrase?
      </div>
      <div>
        <button
          type="button"
          disabled={isRolling}
          className={
            wordCount === 3
              ? 'selected-word-count-button word-count-button'
              : 'word-count-button'
          }
          onClick={() => handleWordCountClick(3)}
        >
          3
        </button>
        <button
          type="button"
          disabled={isRolling}
          className={
            wordCount === 4
              ? 'selected-word-count-button word-count-button'
              : 'word-count-button'
          }
          onClick={() => handleWordCountClick(4)}
        >
          4
        </button>
        <button
          type="button"
          disabled={isRolling}
          className={
            wordCount === 5
              ? 'selected-word-count-button word-count-button'
              : 'word-count-button'
          }
          onClick={() => handleWordCountClick(5)}
        >
          5
        </button>
        <button
          type="button"
          disabled={isRolling}
          className={
            wordCount === 6
              ? 'selected-word-count-button word-count-button'
              : 'word-count-button'
          }
          onClick={() => handleWordCountClick(6)}
        >
          6
        </button>
        <button
          type="button"
          disabled={isRolling}
          className={
            wordCount === 7
              ? 'selected-word-count-button word-count-button'
              : 'word-count-button'
          }
          onClick={() => handleWordCountClick(7)}
        >
          7
        </button>
      </div>
      <div className="finger-key-mapping">
        <label>
          Finger Key Mappings
          <select
            value={fingerMapType}
            onChange={(e) => setFingerMapType(e.target.value)}
          >
            <option value="jared">jared</option>
            <option value="standard" disabled>
              COMING SOON - standard
            </option>
          </select>
        </label>
      </div>
      <div className="roll-all-dice-box">
        <button
          type="button"
          className="roll-all-dice"
          disabled={isRolling}
          onClick={handleRollDiceClick}
        >
          ROLL DICE!
        </button>
      </div>
      {showDice ? (
        <div className="column-box">
          <div className="columns">
            {new Array(wordCount).fill(0).map((value, index) => {
              return (
                <div key={index}>
                  <DiceColumn
                    columnIndex={index}
                    isRolling={!!isColumnRollingMap.get(index)}
                    word={wordMap.get(index) ? wordMap.get(index)! : ''}
                    die1Value={diceValueMap.get(index)?.get(0)!}
                    die2Value={diceValueMap.get(index)?.get(1)!}
                    die3Value={diceValueMap.get(index)?.get(2)!}
                    die4Value={diceValueMap.get(index)?.get(3)!}
                    die5Value={diceValueMap.get(index)?.get(4)!}
                    disableButtons={isRolling}
                    handleReRollClick={handleReRollClick}
                  ></DiceColumn>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {wordMap.size === wordCount ? (
        <div className="word-results">
          <div className="separate-words">
            {wordMap.size === wordCount
              ? Array.from(wordMap.entries()).map(
                  (value: [number, string], index) => {
                    const word = value[1];

                    return (
                      <div className="separate-word" key={word + '_' + index}>
                        {word.split('').map((character, characterIndex) => {
                          return (
                            <span
                              key={
                                character +
                                '_' +
                                word +
                                '_' +
                                index +
                                '_' +
                                characterIndex
                              }
                              className={`character ${getSeparateWordCharacterClass(
                                index,
                                character,
                                characterIndex
                              )}`}
                            >
                              {character}
                            </span>
                          );
                        })}
                      </div>
                    );
                  }
                )
              : null}
          </div>
          <div>
            {wordMap.size === wordCount
              ? passPhase.split('').map((character, characterIndex) => {
                  return (
                    <span
                      className={`character ${getCharacterClass(
                        character,
                        characterIndex
                      )}`}
                      key={character + '_' + characterIndex}
                    >
                      {character}
                    </span>
                  );
                })
              : null}
          </div>
          <h3>Practice new Pass-Phase</h3>
          <input
            type="text"
            className="pass-phase-practice-input"
            value={practicePassPhase}
            onChange={handlePassPhraseChange}
            ref={practicePassPhaseInputElement}
          />
        </div>
      ) : (
        <div className="result-placeholder"></div>
      )}

      <div>
        <h3>Inspired By:</h3>
        <a href="https://diceware.dmuth.org">Diceware Dmuth</a>
      </div>
    </div>
  );
}

export default App;
