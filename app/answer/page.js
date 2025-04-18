export default function Answer({ choice, handleClick, isSelected, answerStatus, iscorrect }) {
  let buttonClass = "answer-button";

  if (answerStatus) {
    if (iscorrect) {
      buttonClass += " answer-button-correct"; 
    } else if (isSelected && answerStatus === "incorrect") {
      buttonClass += " answer-button-incorrect";
    }
  }

  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      disabled={!!answerStatus}
    >
      {choice}
    </button>
  );
}


