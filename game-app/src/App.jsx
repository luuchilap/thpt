import { useState, useCallback, useEffect } from 'react';
import './App.css';
import { supabase } from './lib/supabase';

import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';

export default function App() {
  const [screen, setScreen] = useState('start'); // 'start' | 'game' | 'gameover'
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [lastQuestion, setLastQuestion] = useState(null);
  const [lastUserAnswer, setLastUserAnswer] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [popKey, setPopKey] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase.from('questions').select('*');
        if (error) throw error;
        setAllQuestions(data || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load questions", err);
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const triggerShake = useCallback(() => {
    setIsShaking(false);
    setTimeout(() => setIsShaking(true), 10);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setScreen('game');
    
    // Setup question pool
    if (allQuestions.length === 0) return;
    const pool = [...allQuestions];
    const randIndex = Math.floor(Math.random() * pool.length);
    const nextQ = pool[randIndex];
    pool.splice(randIndex, 1);
    
    setAvailableQuestions(pool);
    setCurrentQuestion(nextQ);
  }, [allQuestions]);

  const handleNextQuestion = useCallback((currentPool) => {
    let pool = [...currentPool];
    if (pool.length === 0) {
      pool = [...allQuestions];
    }
    
    const randIndex = Math.floor(Math.random() * pool.length);
    const nextQ = pool[randIndex];
    pool.splice(randIndex, 1);
    
    setAvailableQuestions(pool);
    setCurrentQuestion(nextQ);
  }, [allQuestions]);

  const handleAnswer = useCallback((userAns, timeLeft) => {
    if (userAns === currentQuestion.a) {
      // Correct
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      
      const speedBonus = Math.round(timeLeft / 10);
      setScore(prev => prev + 10 + (newStreak * 2) + speedBonus);
      setPopKey(prev => prev + 1);
      
      handleNextQuestion(availableQuestions);
    } else {
      // Wrong
      triggerShake();
      setTimeout(() => {
        setLastQuestion(currentQuestion);
        setLastUserAnswer(userAns);
        setExplanation(currentQuestion.e);
        setScreen('gameover');
      }, 400);
    }
  }, [currentQuestion, streak, maxStreak, availableQuestions, handleNextQuestion, triggerShake, allQuestions]);

  const handleTimeout = useCallback(() => {
    triggerShake();
    setTimeout(() => {
      setLastQuestion(currentQuestion);
      setLastUserAnswer('timeout');
      setExplanation("Hết giờ rồi! Tốc độ phản xạ của bạn cần nhanh hơn nữa.");
      setScreen('gameover');
    }, 400);
  }, [triggerShake, currentQuestion]);

  return (
    <div className={`game-container ${isShaking ? 'animate-shake' : ''}`}>
      {screen === 'start' && <StartScreen onStart={startGame} isLoading={isLoading} />}
      
      {screen === 'game' && currentQuestion && (
        <GameScreen 
          currentQuestion={currentQuestion}
          score={score}
          streak={streak}
          popKey={popKey}
          onAnswer={handleAnswer}
          onTimeout={handleTimeout}
        />
      )}
      
      {screen === 'gameover' && (
        <GameOverScreen 
          score={score}
          maxStreak={maxStreak}
          lastQuestion={lastQuestion}
          userAnswer={lastUserAnswer}
          explanation={explanation}
          onRestart={startGame}
          onHome={() => setScreen('start')}
        />
      )}
    </div>
  );
}
