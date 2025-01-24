export default function Answer({ choice, handleClick, isSelected, answerStatus }) {
    
    let buttonClass = "answer-button"; 
  
    if (isSelected) {
      if (answerStatus === "correct") {
        buttonClass += "-correct"; 
      } else if (answerStatus === "incorrect") {
        buttonClass += "-incorrect";
      }
    }
  
    return (
      <button className={buttonClass} onClick={handleClick} disabled={isSelected}>
        {choice}
      </button>
    );
  }
  