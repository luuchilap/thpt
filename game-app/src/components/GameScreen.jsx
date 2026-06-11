import { useEffect, useState, useRef } from 'react';
import HUD from './HUD';

export default function GameScreen({ 
  currentQuestion, 
  score, 
  streak, 
  popKey, 
  onAnswer, 
  onTimeout 
}) {
  const [timeLeft, setTimeLeft] = useState(100);
  const [activeBtn, setActiveBtn] = useState(null);
  const timerRef = useRef(null);

  // Restart timer when a new question arrives
  useEffect(() => {
    clearInterval(timerRef.current);
    
    // Calculate total time: starts at 10s, drops 0.25s per streak, min 1.5s
    const totalTimeSeconds = Math.max(4, 10 - (streak * 0.1));
    const intervalStep = 50;
    const totalIntervals = (totalTimeSeconds * 1000) / intervalStep;
    const timeStep = 100 / totalIntervals;
    
    setTimeLeft(100);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev - timeStep <= 0) {
          clearInterval(timerRef.current);
          onTimeout();
          return 0;
        }
        return prev - timeStep;
      });
    }, intervalStep);

    return () => clearInterval(timerRef.current);
  }, [currentQuestion, streak, onTimeout]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        setActiveBtn(false);
        setTimeout(() => setActiveBtn(null), 150);
        handleAnswer(false);
      } else if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
        setActiveBtn(true);
        setTimeout(() => setActiveBtn(null), 150);
        handleAnswer(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, timeLeft]); // Re-bind when question or time changes so handler has fresh state

  const handleAnswer = (ans) => {
    clearInterval(timerRef.current);
    onAnswer(ans, timeLeft);
  };

  return (
    <div key={`game-${currentQuestion.q}`} className="animate-fade-in">
      <HUD score={score} streak={streak} popKey={popKey} />
      
      <div className="timer-container">
        <div 
          className={`timer-bar ${timeLeft < 30 ? 'timer-danger' : ''}`} 
          style={{ width: `${timeLeft}%` }}
        ></div>
      </div>

      <div className="question-box">
        <span dangerouslySetInnerHTML={{ __html: currentQuestion.q }}></span>
      </div>

      <div className="control-buttons">
        <button 
          className={`btn-game btn-false ${activeBtn === false ? 'active' : ''}`}
          onClick={() => handleAnswer(false)}
        >
          SAI
          <span>Phím A / &larr;</span>
        </button>
        <button 
          className={`btn-game btn-true ${activeBtn === true ? 'active' : ''}`}
          onClick={() => handleAnswer(true)}
        >
          ĐÚNG
          <span>Phím D / &rarr;</span>
        </button>
      </div>
    </div>
  );
}
