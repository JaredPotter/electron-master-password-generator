A simple tool for generating an optimal master password based on Diceware (https://en.wikipedia.org/wiki/Diceware).

Optimal means easier to type

- no repeated characters
- no repeated finger use

LIVE DEMO: [Master Password Generator](https://jaredpotter.github.io/electron-master-password-generator)

Maybe:

- optional no repeated hand use (left hand, right hand alternation)
  ^ currently disabled

Built using Electron, React, and TypeScript.

Wordlist sourced from:

- https://theworld.com/~reinhold/diceware.wordlist.asc

Words containing repeated letters and repeated typing finger are filtered out.

Inspired partly by:
Diceware Dmuth
https://diceware.dmuth.org/
