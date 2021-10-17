import Die from './Die';
import './DiceColumn.css';

type RandomizedDiceColumnProperties = {
  columnIndex: number;
  isRolling: boolean;
  word: string;
  die1Value: number;
  die2Value: number;
  die3Value: number;
  die4Value: number;
  die5Value: number;
  disableButtons: boolean;
  handleReRollClick: (columnIndex: number) => void;
};

function DiceColumn(props: RandomizedDiceColumnProperties) {
  return (
    <div className="randomized-dice-column-container">
      <div className="dice-column">
        <span className="die-box">
          <Die isRolling={props.isRolling} dieValue={props.die1Value}></Die>
        </span>
        <span className="die-box">
          <Die isRolling={props.isRolling} dieValue={props.die2Value}></Die>
        </span>
        <span className="die-box">
          <Die isRolling={props.isRolling} dieValue={props.die3Value}></Die>
        </span>
        <span className="die-box">
          <Die isRolling={props.isRolling} dieValue={props.die4Value}></Die>
        </span>
        <span className="die-box">
          <Die isRolling={props.isRolling} dieValue={props.die5Value}></Die>
        </span>
      </div>

      {props.word ? (
        <div>
          <div className="result-word">
            {!props.isRolling && props.word ? props.word : '•••'}
          </div>
          <button
            onClick={() => props.handleReRollClick(props.columnIndex)}
            disabled={props.disableButtons}
          >
            Re-Roll
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default DiceColumn;
