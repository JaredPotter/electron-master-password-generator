import './Die.css';

type DieProperties = {
  isRolling: boolean;
  dieValue: number;
};

function Die(props: DieProperties) {
  function renderSides() {
    const sides = [1, 2, 3, 4, 5, 6].map((value) => {
      return (
        <div className="side" key={value}>
          {value}
        </div>
      );
    });

    return sides;
  }

  return (
    <div className="die-container">
      <div
        className={`die ${props.isRolling ? 'rolling d6' : 'd6'} ${
          props.dieValue ? 'd' + props.dieValue + '-roll' : ''
        }`}
      >
        {renderSides()}
      </div>
    </div>
  );
}

export default Die;
