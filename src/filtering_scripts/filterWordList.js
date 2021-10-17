const fs = require('fs');

const wordListObject = require('./original_wordlist.json');
const fingerKeyMap = require('./fingerKeyMap.json');
const handKeyMap = require('./handKeyMap.json');

function isNewWordAllow(previousCharacter, newCharacter) {
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

(() => {
  let wordListKeys = Object.keys(wordListObject);

  // Remove words with
  for (const wordKey of wordListKeys) {
    const word = wordListObject[wordKey];

    let previousCharacter;

    for (const character of word) {
      if (previousCharacter) {
        if (character === previousCharacter) {
          delete wordListObject[wordKey];
          previousCharacter = character;
          break;
        }
      }

      previousCharacter = character;
    }
  }

  wordListKeys = Object.keys(wordListObject);

  // Remove words with repeated characters and repeated finger use
  for (const wordKey of wordListKeys) {
    const word = wordListObject[wordKey];

    let previousCharacter;

    for (const character of word) {
      const isNewWordAllowHere = isNewWordAllow(previousCharacter, character);

      if (!isNewWordAllowHere) {
        console.log('REMOVING: ' + word);
        delete wordListObject[wordKey];
        previousCharacter = character;
        break;
      }

      previousCharacter = character;
    }
  }

  fs.writeFileSync('filtered_wordlist.json', JSON.stringify(wordListObject));
})();
