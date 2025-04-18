"use client";
import Link from "next/link";
import { useState, useEffect ,useRef} from "react";
import Answer from "../answer/page";

function decodeHtmlEntities(text) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
}

export default function Game() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;
  const [question, setQuestion] = useState([]);
  const [currentques, setCurrentques] = useState(0);
  const [allanswers, setAllanswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(""); 
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionnum,setQuestionum] = useState(1);
  const scrollRef = useRef(null);
  const [maxScore, setMaxScore] = useState(0);



  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const result = await fetch(
          "https://opentdb.com/api.php?amount=15&difficulty=easy&type=multiple"
        );
        const res = await result.json();

        if (res.results && Array.isArray(res.results)) {
          const decodedQuestions = res.results.map((item) => ({
            ...item,
            question: decodeHtmlEntities(item.question),
            correct_answer: decodeHtmlEntities(item.correct_answer),
            incorrect_answers: item.incorrect_answers.map((ans) =>
              decodeHtmlEntities(ans)
            ),
          }));
          setQuestion(decodedQuestions);
        } 
        
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);


  useEffect(() => {
    const localHighScore = localStorage.getItem("maxScore");
    if (localHighScore) {
      setMaxScore(parseInt(localHighScore));
    }
  
    const fetchMaxScore = async () => {
      try {
        const response = await fetch("http://localhost:3001/max-score", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.status === "success") setMaxScore(data.maxScore);
      } catch (err) {
        
      }
    };
    fetchMaxScore();
  }, []);
  

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const restartGame = async () => {
    setScore(0);
    setTimeLeft(10);
    setCurrentques(0);
    setSelectedAnswer(null);
    setAnswerStatus("");
    setIsAnswered(false);
    setQuestionum(1);

    const result = await fetch("https://opentdb.com/api.php?amount=15&difficulty=easy&type=multiple");
    const res = await result.json();

    const decodedQuestions = res.results.map((item) => ({
      ...item,
      question: decodeHtmlEntities(item.question),
      correct_answer: decodeHtmlEntities(item.correct_answer),
      incorrect_answers: item.incorrect_answers.map((ans) => decodeHtmlEntities(ans)),
    }));
    setQuestion(decodedQuestions);
  };

  const scrollToNextSection = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  

  const nextques = () => {
    if (currentques < question.length - 1) {
      setCurrentques(currentques + 1);
      setTimeLeft(10);
      setSelectedAnswer(null);
      setAnswerStatus("");
      setIsAnswered(false);
      setQuestionum(questionnum+1);
       
    } else {
      alert("Quiz complete!");
    }
  };

  const currentquestion = Array.isArray(question) && question.length > 0 ? question[currentques] : null;

  useEffect(() => {
    if (currentquestion) {
      const answers = [...currentquestion.incorrect_answers];
      const rand = Math.ceil(Math.random() * (answers.length + 1));
      answers.splice(rand - 1, 0, currentquestion.correct_answer);
      setAllanswers(answers);
    }
  }, [currentquestion]);

  const handleAnswer = async (answer) => {
    if (isAnswered || timeLeft === 0) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    setTimeLeft(0);
  
    if (answer === currentquestion.correct_answer) {
      const newScore = score + 1;
      setScore(newScore);
  
      if (newScore > maxScore) {
       
        setMaxScore(newScore);
        localStorage.setItem("maxScore", newScore);
  
       
        console.log(" Sending new high to server:", newScore);
  
        try {
          const res = await fetch("http://localhost:3001/update-score", {
            method: "POST",
            mode: "cors",                
            credentials: "include",     
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newScore }),
          });
          const data = await res.json();
          console.log("  update-score response:", data);
          if (data.status !== "success") {
            console.error(" Server failed to update max score");
          }
        } catch (err) {
          console.error(" Network error persisting max score:", err);
        }
      }
  
      setAnswerStatus("correct");
    } else {
      setAnswerStatus("incorrect");
    }
  
    scrollToNextSection();
  };
  
  

  const choices =
    allanswers.length > 0
      ? allanswers.map((answer, index) => (
          <Answer
            key={index}
            choice={answer}
            handleClick={() => handleAnswer(answer)}
            isSelected={selectedAnswer === answer}
            answerStatus={answerStatus}
            iscorrect ={answer===currentquestion.correct_answer}
          />
        ))
      : null;

      useEffect(() => {
        if (timeLeft === 0) {
          scrollToNextSection(); 
        }
      }, [timeLeft]);

      

  return (
    <div className="quizmain">
      <div className="circle-timer">
       <svg className="progress-ring" viewBox="0 0 100 100" width="100%" height="100%">
          <circle className="background-circle" cx="50" cy="50" r={circleRadius}></circle>
          <circle
            className="progress-circle"
            cx="50"
            cy="50"
            r={circleRadius}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: ((10 - timeLeft) / 10) * circumference,
            }}
          ></circle>
        </svg>
        <div className="time-text">{timeLeft}s</div>
      </div>
 <div className="mini">
      <h3 className="miniscore">Score:{score}/15</h3>
      <h3 className="miniscore">High Score: {maxScore}/15</h3>
      <h3 className="miniques">Question :{questionnum}/15</h3>
      </div>
      {currentquestion && (
        <div className="quesbox">
          <h4 className="question">{currentquestion.question}</h4>
        </div>
      )}

      <div>{choices}</div>

      {(timeLeft === 0 || isAnswered) && (
        <>
          <h2> Time's up!</h2>
          <div ref={scrollRef}>
          <button onClick={nextques}>Next question</button>
          </div>
        </>
      )}



      {timeLeft === 0 && currentques === question.length - 1 && (
        <div ref ={scrollRef}>
          <button onClick={restartGame}>Restart game</button>
          <Link href="/quizcom">
            <button>Back To Home</button>
          </Link>
          <h3 className="score">Score: {score}/15</h3>
        </div>
      )}

      
    </div>
  );
}
