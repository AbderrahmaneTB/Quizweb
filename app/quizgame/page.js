"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Answer from "../answer/page"; // Make sure this path is correct

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
  const [questionnum, setQuestionum] = useState(1);
  const scrollRef = useRef(null);
  const [maxScore, setMaxScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

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
      } catch (err) {}
    };
    fetchMaxScore();
  }, []);
  
  useEffect(() => {
    if (timeLeft === 0 || isAnswered || quizFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, quizFinished]);

  const restartGame = async () => {
    setScore(0);
    setTimeLeft(10);
    setCurrentques(0);
    setSelectedAnswer(null);
    setAnswerStatus("");
    setIsAnswered(false);
    setQuestionum(1);
    setQuizFinished(false); 

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
      setQuestionum(questionnum + 1);
    } else {
      setQuizFinished(true);
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
  
    if (answer === currentquestion.correct_answer) {
      const newScore = score + 1;
      setScore(newScore);
  
      if (newScore > maxScore) {
        setMaxScore(newScore);
        localStorage.setItem("maxScore", newScore);
  
        try {
          await fetch("http://localhost:3001/update-score", {
            method: "POST",
            mode: "cors",                
            credentials: "include",     
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newScore }),
          });
        } catch (err) {
          console.error("Network error persisting max score:", err);
        }
      }
  
      setAnswerStatus("correct");
    } else {
      setAnswerStatus("incorrect");
    }
  
    setTimeout(() => scrollToNextSection(), 100);
  };
  
  const choices = allanswers.length > 0 ? allanswers.map((answer, index) => (
    <Answer
      key={index}
      choice={answer}
      handleClick={() => handleAnswer(answer)}
      isSelected={selectedAnswer === answer}
      answerStatus={answerStatus}
      iscorrect={answer === currentquestion.correct_answer}
    />
  )) : null;

  useEffect(() => {
    if (timeLeft === 0 && !isAnswered) {
      scrollToNextSection(); 
    }
  }, [timeLeft, isAnswered]);

  // ─── FINAL SCORE SCREEN ─────────────────────────────
  if (quizFinished) {
    return (
      <div className="quizmain">
        <h1 className="result-heading">Quiz Complete!</h1>
        <p className="result-sub">You have answered all 15 questions.</p>
        
        <div className="score">Score: {score}/15</div>
        
        {/* Uses your new CSS classes for perfect button alignment */}
        <div className="result-actions" style={{ marginTop: '20px' }}>
          <button className="btn-result-secondary" onClick={restartGame}>Restart Game</button>
          <Link href="/quizcom" style={{ display: 'flex', flex: '1 1 140px' }}>
            <button className="btn-result-secondary" style={{ width: '100%', margin: '0' }}>Back To Home</button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── ACTIVE GAME SCREEN ─────────────────────────────
  return (
    <div className="quizmain">
      
      {/* Wrapped timer in your new .timer-wrapper and added missing gradient <defs> */}
      <div className="timer-wrapper">
        <div className={`circle-timer ${timeLeft <= 5 && !isAnswered ? 'timer-urgent' : ''}`}>
         <svg className="progress-ring" viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <circle className="background-circle" cx="50" cy="50" r={circleRadius}></circle>
            <circle
              className="progress-circle"
              cx="50"
              cy="50"
              r={circleRadius}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: ((10 - timeLeft) / 10) * circumference,
                stroke: timeLeft <= 5 && !isAnswered ? '#ef4444' : 'url(#timerGradient)' // Turns red when < 5s
              }}
            ></circle>
          </svg>
          <div className="time-text">{timeLeft}s</div>
        </div>
      </div>
      
      <div className="mini">
        <div className="miniscore">Score: {score}/15</div>
        <div className="miniscore">High Score: {maxScore}/15</div>
        <div className="miniques">Question: {questionnum}/15</div>
      </div>
      
      {currentquestion && (
        <div className="quesbox">
          <h4 className="question">{currentquestion.question}</h4>
        </div>
      )}

      {/* Applied your .answers-grid class here for the perfect 2x2 layout */}
      <div className="answers-grid">
        {choices}
      </div>

      {/* ACTION AREA (Next Question) */}
      {(timeLeft === 0 || isAnswered) && (
        <div ref={scrollRef} style={{ width: "100%", marginTop: "20px" }}>
          
          {timeLeft === 0 && !isAnswered && (
            <h2 className="result-heading" style={{ color: "#ef4444", marginBottom: "15px" }}>Time's up!</h2>
          )}
          
          <div className="result-actions">
            <button className="btn-result-primary" onClick={nextques}>
              {currentques === question.length - 1 ? "See Results" : "Next question"}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}