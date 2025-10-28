import React, { useState, useEffect, useRef } from 'react';
import { Mail, Send, X, CheckCircle, Inbox, Zap, Clock, Star, Trophy, Target } from 'lucide-react';

const EmailProposalGame = () => {
  const [gameState, setGameState] = useState('start');
  const [playerName, setPlayerName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [chefsApproval, setChefsApproval] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [highlightedText, setHighlightedText] = useState([]);
  const [showHighlightMode, setShowHighlightMode] = useState(false);
  const [timer, setTimer] = useState(60); // 1 minute per question
  const [chefReaction, setChefReaction] = useState('');
  const timerRef = useRef(null);

  // Funny avatars for students
  const studentAvatars = {
    'Adrian': '🦁',
    'David': '🦊',
    'Kayla': '🦄',
    'Leanna': '🐼',
    'Marlene': '🦋',
    'Karol': '🐨',
    'Shauna': '🦉'
  };

  const questions = [
    // EASY - Quick wins (1-5)
    {
      id: 1,
      sender: 'Adrian',
      subject: 'Survey Results',
      text: "Our survey shows 83% of students throw away food this means most students waste lunch every day.",
      type: 'run-on',
      difficulty: 'easy',
      explanation: "RUN-ON! Two complete thoughts jammed together. They need a period or semicolon between 'food' and 'this'!",
      errorLocation: [52, 56], // character indices where error occurs
      fixes: [
        { text: "Our survey shows 83% of students throw away food. This means most students waste lunch every day.", correct: true },
        { text: "Our survey shows 83% of students throw away food, this means most students waste lunch every day.", correct: false },
        { text: "Our survey shows 83% of students throw away food and this means most students waste lunch every day.", correct: false }
      ]
    },
    {
      id: 2,
      sender: 'Kayla',
      subject: 'Hmong Food Request',
      text: "Because 39% of students want Hmong food like pho and egg rolls.",
      type: 'fragment',
      difficulty: 'easy',
      explanation: "FRAGMENT! Starts with 'because' but never tells us what should happen. What's the action?",
      errorLocation: [0, 7], // "Because" at start
      fixes: [
        { text: "Could you add Hmong food like pho and egg rolls because 39% of students requested these options?", correct: true },
        { text: "Because 39% of students want Hmong food. Like pho and egg rolls.", correct: false },
        { text: "Because 39% of students want Hmong food like pho and egg rolls, is important.", correct: false }
      ]
    },
    {
      id: 3,
      sender: 'Marlene',
      subject: 'Positive Feedback',
      text: "I wanted to share that 30% of students eat most of their lunch. This shows many students appreciate your cooking!",
      type: 'complete',
      difficulty: 'easy',
      explanation: "CORRECT! Clear sentences with proper punctuation. This is professional, positive communication.",
      errorLocation: null,
      fixes: []
    },
    {
      id: 4,
      sender: 'David',
      subject: 'Time Problem',
      text: "53% of students have less than 10 minutes to eat that's over half we need more time to enjoy lunch.",
      type: 'run-on',
      difficulty: 'easy',
      explanation: "RUN-ON! Three ideas squished together. Each needs its own sentence or proper connection!",
      errorLocation: [52, 88], // multiple run-on points
      fixes: [
        { text: "53% of students have less than 10 minutes to eat. That's over half! We need more time to enjoy lunch.", correct: true },
        { text: "53% of students have less than 10 minutes to eat, that's over half, we need more time to enjoy lunch.", correct: false },
        { text: "53% of students have less than 10 minutes to eat and that's over half and we need more time.", correct: false }
      ]
    },
    {
      id: 5,
      sender: 'Leanna',
      subject: 'Cultural Food Question',
      text: "When students see food from their culture on the menu.",
      type: 'fragment',
      difficulty: 'easy',
      explanation: "FRAGMENT! Starts with 'when' but never finishes. What HAPPENS when students see cultural food?",
      errorLocation: [0, 4], // "When" at start
      fixes: [
        { text: "When students see food from their culture on the menu, they eat lunch more often. 57% said this in our survey!", correct: true },
        { text: "When students see food from their culture on the menu. They like it.", correct: false },
        { text: "When students see food from their culture on the menu, is good.", correct: false }
      ]
    },

    // MEDIUM - Trickier (6-10)
    {
      id: 6,
      sender: 'Karol',
      subject: 'Mexican Food Data',
      text: "64% of students want Mexican food that's the top request tacos are especially popular.",
      type: 'run-on',
      difficulty: 'medium',
      explanation: "RUN-ON! Three statistics crammed together. Professional data needs clear separation!",
      errorLocation: [35, 65],
      fixes: [
        { text: "64% of students want Mexican food. That's the top request. Tacos are especially popular!", correct: true },
        { text: "64% of students want Mexican food, that's the top request, tacos are especially popular.", correct: false },
        { text: "64% of students want Mexican food and that's the top request and tacos are especially popular.", correct: false }
      ]
    },
    {
      id: 7,
      sender: 'Shauna',
      subject: 'Health Survey Results',
      text: "According to our data about healthy food with 56% of students saying balance matters.",
      type: 'fragment',
      difficulty: 'medium',
      explanation: "FRAGMENT! This starts describing data but never makes a point. What ABOUT the data?",
      errorLocation: [0, 13],
      fixes: [
        { text: "Our data shows that 56% of students care about healthy food. They said balance matters. Both nutrition and taste!", correct: true },
        { text: "According to our data about healthy food. With 56% of students saying balance matters.", correct: false },
        { text: "According to our data about healthy food with 56% of students saying balance matters, shows this.", correct: false }
      ]
    },
    {
      id: 8,
      sender: 'Adrian',
      subject: 'Wait Time Question',
      text: "Would it be possible to serve fresher food even if we wait 5 extra minutes? Our survey shows 70% of students would consider it, depending on quality.",
      type: 'complete',
      difficulty: 'medium',
      explanation: "CORRECT! A clear question with supporting data. The comma properly connects the second sentence's dependent clause.",
      errorLocation: null,
      fixes: []
    },
    {
      id: 9,
      sender: 'David',
      subject: 'Reducing Waste',
      text: "36% of students don't finish because of taste maybe we could try new recipes this might reduce our 83% waste rate.",
      type: 'run-on',
      difficulty: 'medium',
      explanation: "RUN-ON! Problem, solution, and result all jammed together. Each idea deserves its own sentence!",
      errorLocation: [48, 84],
      fixes: [
        { text: "36% of students don't finish because of taste. Maybe we could try new recipes? This might reduce our 83% waste rate.", correct: true },
        { text: "36% of students don't finish because of taste, maybe we could try new recipes, this might reduce waste.", correct: false },
        { text: "36% of students don't finish because of taste and maybe we could try new recipes and this might reduce waste.", correct: false }
      ]
    },
    {
      id: 10,
      sender: 'Kayla',
      subject: 'Dessert Request',
      text: "The reason 61% of students want desserts showing it's our second most popular category.",
      type: 'fragment',
      difficulty: 'medium',
      explanation: "FRAGMENT! 'The reason...' starts a thought but never completes it. What IS the reason, and what should happen?",
      errorLocation: [0, 10],
      fixes: [
        { text: "61% of students want desserts. That makes it our second most popular category! Could we add dessert options?", correct: true },
        { text: "The reason 61% of students want desserts. Showing it's our second most popular category.", correct: false },
        { text: "The reason 61% of students want desserts showing it's our second most popular category is important.", correct: false }
      ]
    },

    // HARD - Sophisticated (11-15)
    {
      id: 11,
      sender: 'Marlene',
      subject: 'Rating Analysis',
      text: "The cafeteria got 3.09 out of 5 stars this means it's okay but not great 38% of students don't like today's options and 38% don't have enough time.",
      type: 'run-on',
      difficulty: 'hard',
      explanation: "COMPLEX RUN-ON! Rating, interpretation, and two problems all without punctuation. Professional analysis needs structure!",
      errorLocation: [41, 80],
      fixes: [
        { text: "The cafeteria got 3.09 out of 5 stars. This means it's okay but not great. Specifically, 38% of students don't like today's options and 38% don't have enough time.", correct: true },
        { text: "The cafeteria got 3.09 out of 5 stars, this means okay but not great, 38% don't like options, 38% don't have time.", correct: false },
        { text: "The cafeteria got 3.09 out of 5 stars and this means it's okay and 38% don't like options and 38% don't have time.", correct: false }
      ]
    },
    {
      id: 12,
      sender: 'Leanna',
      subject: 'Cultural Diversity Idea',
      text: "By adding Mexican, Asian, and Hmong foods helping students feel connected through family flavors.",
      type: 'fragment',
      difficulty: 'hard',
      explanation: "COMPLEX FRAGMENT! 'By adding...' describes HOW but never says WHO should do it or WHAT will happen as the main point.",
      errorLocation: [0, 2],
      fixes: [
        { text: "You could help students feel connected by adding Mexican, Asian, and Hmong foods. This would benefit many students through family flavors!", correct: true },
        { text: "By adding Mexican, Asian, and Hmong foods. Helping students feel connected.", correct: false },
        { text: "By adding Mexican, Asian, and Hmong foods helping students feel connected, would be good.", correct: false }
      ]
    },
    {
      id: 13,
      sender: 'Karol',
      subject: 'Three-Step Plan',
      text: "I propose three changes based on our data. First, add requested items like tacos to help the 38% who dislike current options. Second, improve freshness since 70% will wait 5 minutes for quality. Third, offer smaller portions for students eating less than 25%. These could reduce our 83% waste rate significantly.",
      type: 'complete',
      difficulty: 'hard',
      explanation: "CORRECT! Sophisticated proposal with clear structure, transitions (First, Second, Third), and data support. Professional persuasive writing!",
      errorLocation: null,
      fixes: []
    },
    {
      id: 14,
      sender: 'Shauna',
      subject: 'Budget Analysis',
      text: "Mexican food makes financial sense 64% of students want it meaning more would eat lunch this cuts waste where 83% throw food away plus beans, rice, and tortillas are affordable.",
      type: 'run-on',
      difficulty: 'hard',
      explanation: "ADVANCED RUN-ON! Four logical points (demand, percentage, waste reduction, cost) need separation to be persuasive!",
      errorLocation: [35, 112],
      fixes: [
        { text: "Mexican food makes financial sense. First, 64% of students want it. That means more would eat lunch. This cuts waste where 83% throw food away. Plus, beans, rice, and tortillas are affordable!", correct: true },
        { text: "Mexican food makes sense, 64% want it, meaning more eat lunch, cuts waste, plus affordable.", correct: false },
        { text: "Mexican food makes sense and 64% want it and more eat lunch and cuts waste and it's affordable.", correct: false }
      ]
    },
    {
      id: 15,
      sender: 'Adrian',
      subject: 'Academic Connection',
      text: "Since research shows nutritious lunch improves academics and only 11% of students eat everything while 53% have under 10 minutes affecting afternoon focus.",
      type: 'fragment',
      difficulty: 'hard',
      explanation: "SOPHISTICATED FRAGMENT! Sets up research and problems with 'since...' but never requests action or completes the thought!",
      errorLocation: [0, 5],
      fixes: [
        { text: "Research shows nutritious lunch improves academics. Only 11% of students eat everything, while 53% have under 10 minutes. This affects afternoon focus. Can we discuss solutions?", correct: true },
        { text: "Since research shows nutritious lunch improves academics. And only 11% eat everything while 53% have under 10 minutes.", correct: false },
        { text: "Since research shows nutritious lunch improves academics and only 11% eat everything while 53% have under 10 minutes, is concerning.", correct: false }
      ]
    }
  ];

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && !showFeedback) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [gameState, currentQuestion, showFeedback]);

  const handleTimeUp = () => {
    setStreak(0);
    setAnswers([...answers, { correct: false, timedOut: true }]);
    setShowFeedback('result');
    setChefReaction('😰');
  };

  useEffect(() => {
    if (gameState === 'playing' && shuffledQuestions.length === 0) {
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
    }
  }, [gameState]);

  const handleStart = () => {
    if (playerName.trim()) {
      setGameState('playing');
    }
  };

  const handleChoice = (choice) => {
    setSelectedChoice(choice);
    if (choice === 'reject') {
      setShowHighlightMode(true);
    } else {
      setShowHighlightMode(false);
      setHighlightedText([]);
    }
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    const currentQ = shuffledQuestions[currentQuestion];
    const isCorrect =
      (currentQ.type === 'complete' && selectedChoice === 'approve') ||
      (currentQ.type !== 'complete' && selectedChoice === 'reject');

    if (isCorrect) {
      if (currentQ.type === 'complete') {
        // Correct approval of good sentence
        const points = chefsApproval ? 20 : 10;
        setScore(score + points);
        setStreak(streak + 1);
        setAnswers([...answers, { correct: true, needsFix: false }]);
        setShowFeedback('result');
        setShowConfetti(true);
        setChefReaction('🎉');
        setTimeout(() => setShowConfetti(false), 3000);

        // Award Chef's Approval after 3 streak
        if ((streak + 1) % 3 === 0) {
          setChefsApproval(true);
        }
      } else {
        // Correctly identified error - now choose fix
        setShowFeedback('choose-fix');
        setChefReaction('👨‍🍳');
      }
    } else {
      // Wrong identification
      setScore(Math.max(0, score - 5));
      setStreak(0);
      setChefsApproval(false);
      setAnswers([...answers, { correct: false }]);
      setShowFeedback('result');
      setChefReaction('😕');
    }
  };

  const handleFixChoice = (fixIndex) => {
    const currentQ = shuffledQuestions[currentQuestion];
    const isCorrect = currentQ.fixes[fixIndex].correct;

    if (isCorrect) {
      const points = chefsApproval ? 20 : 10;
      setScore(score + points);
      setStreak(streak + 1);
      setShowConfetti(true);
      setChefReaction('⭐');
      setTimeout(() => setShowConfetti(false), 3000);

      // Award Chef's Approval after 3 streak
      if ((streak + 1) % 3 === 0) {
        setChefsApproval(true);
      }
    } else {
      setScore(Math.max(0, score - 3));
      setStreak(0);
      setChefsApproval(false);
      setChefReaction('😬');
    }

    setAnswers([...answers, { correct: isCorrect }]);
    setShowFeedback('result');

    // Use Chef's Approval
    if (chefsApproval) {
      setChefsApproval(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < shuffledQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
      setHighlightedText([]);
      setShowHighlightMode(false);
      setTimer(60); // Reset timer
      setChefReaction('');
    } else {
      setGameState('results');
    }
  };

  const resetGame = () => {
    setGameState('start');
    setPlayerName('');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setAnswers([]);
    setShuffledQuestions([]);
    setStreak(0);
    setChefsApproval(false);
    setHighlightedText([]);
    setShowHighlightMode(false);
    setTimer(60);
    setChefReaction('');
    clearInterval(timerRef.current);
  };

  // Confetti Component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        >
          {['🎉', '⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );

  // START SCREEN
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full mb-4">
              <Mail className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📧 Chef Gabriel's Inbox</h1>
            <p className="text-gray-600">Review student emails before sending!</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-blue-700">Your Mission:</strong> Students want to email Chef Gabriel about cafeteria ideas.
              Review each email for <span className="font-semibold">run-ons</span> and <span className="font-semibold">fragments</span> before hitting send!
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-yellow-600" />
              <strong className="text-yellow-800">Daily Goal: 11/15 Correct</strong>
            </div>
            <p className="text-xs text-gray-600">Score 11 or more this week to master run-ons & fragments!</p>
          </div>

          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-lg focus:border-blue-500 focus:outline-none"
          />

          <button
            onClick={handleStart}
            disabled={!playerName.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-lg text-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Start Reviewing Emails →
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>✅ Approve good emails • ✏️ Highlight errors • 🎯 Earn Chef's Approval!</p>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  if (gameState === 'results') {
    const correctAnswers = answers.filter(a => a.correct).length;
    const percentage = Math.round((correctAnswers / answers.length) * 100);
    const metDailyGoal = correctAnswers >= 11;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className={`inline-block p-4 rounded-full mb-4 ${metDailyGoal ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}`}>
              {metDailyGoal ? <Trophy className="w-16 h-16 text-white" /> : <CheckCircle className="w-16 h-16 text-white" />}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {metDailyGoal ? '🏆 Goal Achieved!' : 'Inbox Cleared! 🎉'}
            </h1>
            <p className="text-xl text-gray-600">
              {metDailyGoal ? `Amazing work, ${playerName}! You hit the daily goal!` : `Great job, ${playerName}!`}
            </p>
          </div>

          {/* Daily Goal Progress */}
          <div className={`mb-6 p-4 rounded-xl border-2 ${metDailyGoal ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className={`w-5 h-5 ${metDailyGoal ? 'text-green-600' : 'text-yellow-600'}`} />
                <span className={`font-bold ${metDailyGoal ? 'text-green-800' : 'text-yellow-800'}`}>
                  Daily Goal: {correctAnswers}/11
                </span>
              </div>
              <span className="text-2xl">{metDailyGoal ? '✅' : '📊'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${metDailyGoal ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-yellow-500 to-yellow-600'}`}
                style={{ width: `${Math.min((correctAnswers / 11) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center">
              <div className="text-4xl font-bold mb-1">{score}</div>
              <div className="text-sm opacity-90">Total Points</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white text-center">
              <div className="text-4xl font-bold mb-1">{correctAnswers}/{answers.length}</div>
              <div className="text-sm opacity-90">Correct</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white text-center">
              <div className="text-4xl font-bold mb-1">{percentage}%</div>
              <div className="text-sm opacity-90">Accuracy</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">📝 Your Performance</h3>
            <div className="space-y-2 text-sm">
              {metDailyGoal && (
                <p className="text-green-700">🌟 <strong>Outstanding!</strong> You reached today's goal of 11+ correct! Keep this up all week!</p>
              )}
              {!metDailyGoal && percentage >= 60 && (
                <p className="text-blue-700">💪 <strong>Almost there!</strong> You got {correctAnswers} correct. Try again to reach 11/15!</p>
              )}
              {!metDailyGoal && percentage < 60 && (
                <p className="text-yellow-700">📚 <strong>Keep practicing!</strong> Review the feedback and try again. You can reach 11/15!</p>
              )}
            </div>
          </div>

          <button
            onClick={resetGame}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-lg text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
          >
            Review More Emails 🔄
          </button>
        </div>
      </div>
    );
  }

  // PLAYING SCREEN
  const currentQ = shuffledQuestions[currentQuestion];
  if (!currentQ) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-t-xl shadow-lg p-4 flex items-center justify-between border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Chef Gabriel's Inbox</h2>
              <p className="text-xs text-gray-500">Email Review Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Chef's Approval Badge */}
            {chefsApproval && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-2 rounded-full shadow-lg animate-pulse">
                <Star className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white">Chef's Approval!</span>
                <span className="text-xs text-white">2x Points</span>
              </div>
            )}
            {/* Streak */}
            {streak > 0 && !chefsApproval && (
              <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-600">{streak}x</span>
              </div>
            )}
            {/* Score */}
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-xs text-gray-500">points</div>
            </div>
          </div>
        </div>

        {/* PROGRESS & TIMER */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="text-sm text-gray-600">
            Email <span className="font-bold text-gray-800">{currentQuestion + 1}</span> of {shuffledQuestions.length}
          </div>
          <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
            />
          </div>
          {/* Timer */}
          {!showFeedback && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timer <= 30 ? 'bg-red-100 animate-pulse' : 'bg-blue-100'}`}>
              <Clock className={`w-4 h-4 ${timer <= 30 ? 'text-red-600' : 'text-blue-600'}`} />
              <span className={`text-sm font-bold ${timer <= 30 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timer)}
              </span>
            </div>
          )}
        </div>

        {/* DAILY GOAL MINI TRACKER */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-yellow-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-semibold text-gray-700">Daily Goal Progress:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-800">{answers.filter(a => a.correct).length}/11</span>
              <div className="w-20 bg-gray-200 rounded-full h-1.5 ml-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min((answers.filter(a => a.correct).length / 11) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* EMAIL CARD */}
        <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
          {/* Email Header with Avatar */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  {studentAvatars[currentQ.sender]}
                </div>
                <div>
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                    {currentQ.sender}
                    {chefReaction && <span className="text-2xl animate-bounce">{chefReaction}</span>}
                  </div>
                  <div className="text-xs text-gray-500">to: chef.gabriel@terronez.edu</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentQ.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentQ.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentQ.difficulty.toUpperCase()}
              </div>
            </div>
            <div className="font-semibold text-gray-700 text-sm">
              📧 {currentQ.subject}
            </div>
          </div>

          {/* Email Body */}
          <div className="p-6 bg-white">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
              <p className="text-gray-800 leading-relaxed text-xl font-medium">
                {currentQ.text}
              </p>
            </div>

            {!showFeedback && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-center">
                  <p className="text-sm font-semibold text-gray-800">
                    ✏️ Should this email be sent as-is, or does it need revision?
                  </p>
                </div>

                {showHighlightMode && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 animate-slideDown">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      👆 Optional: Where's the error?
                    </p>
                    <p className="text-xs text-gray-600">
                      Click on the email text above where you think the grammar error is located. This helps you identify problem spots!
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleChoice('approve')}
                    className={`py-4 px-6 rounded-xl font-bold text-base transition-all transform hover:scale-105 ${
                      selectedChoice === 'approve'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">✅</div>
                    <div>Send It!</div>
                  </button>
                  <button
                    onClick={() => handleChoice('reject')}
                    className={`py-4 px-6 rounded-xl font-bold text-base transition-all transform hover:scale-105 ${
                      selectedChoice === 'reject'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">✏️</div>
                    <div>Needs Edit</div>
                  </button>
                </div>

                {selectedChoice && (
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg transform hover:scale-105"
                  >
                    Submit Decision →
                  </button>
                )}
              </div>
            )}

            {showFeedback === 'choose-fix' && (
              <div className="space-y-4">
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                  <p className="font-bold text-orange-900 mb-2">✏️ Correct! This needs editing.</p>
                  <p className="text-sm text-gray-700">Choose the BEST way to fix it:</p>
                </div>
                <div className="space-y-3">
                  {currentQ.fixes.map((fix, index) => {
                    const colors = [
                      { border: 'border-purple-400', hover: 'hover:bg-purple-50 hover:border-purple-600', label: 'text-purple-600' },
                      { border: 'border-teal-400', hover: 'hover:bg-teal-50 hover:border-teal-600', label: 'text-teal-600' },
                      { border: 'border-pink-400', hover: 'hover:bg-pink-50 hover:border-pink-600', label: 'text-pink-600' }
                    ];
                    const colorScheme = colors[index];

                    return (
                      <button
                        key={index}
                        onClick={() => handleFixChoice(index)}
                        className={`w-full text-left py-4 px-5 rounded-lg bg-white border-3 ${colorScheme.border} ${colorScheme.hover} transition-all text-gray-800 leading-relaxed transform hover:scale-102 hover:shadow-lg`}
                      >
                        <span className={`font-bold text-base ${colorScheme.label}`}>Fix {index + 1}:</span>
                        <br />
                        <span className="text-lg">{fix.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showFeedback === 'result' && (
              <div className="space-y-4">
                <div className={`rounded-lg p-5 border-2 ${
                  answers[answers.length - 1].correct
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                }`}>
                  <p className={`text-xl font-bold mb-3 ${
                    answers[answers.length - 1].correct ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {answers[answers.length - 1].timedOut
                      ? '⏰ Time Up!'
                      : answers[answers.length - 1].correct
                        ? `✅ Correct! +${chefsApproval ? '20' : '10'} points${chefsApproval ? ' (Chef\'s Approval!)' : ''}`
                        : '❌ Incorrect'}
                  </p>
                  <p className="text-gray-800 leading-relaxed text-sm">
                    {currentQ.explanation}
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
                >
                  {currentQuestion + 1 < shuffledQuestions.length ? 'Next Email →' : 'See Results 🎉'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HELP */}
        <div className="mt-4 bg-white rounded-lg p-4 shadow">
          <details className="cursor-pointer">
            <summary className="font-semibold text-gray-700 text-center text-sm hover:text-blue-600">
              💡 Quick Grammar Reminder
            </summary>
            <div className="mt-3 space-y-2 text-xs text-gray-700 bg-gray-50 p-3 rounded">
              <p><strong>✅ Complete Sentence:</strong> Subject + verb + complete thought</p>
              <p><strong>🔴 Run-on:</strong> Two+ complete thoughts with no punctuation</p>
              <p><strong>🔴 Fragment:</strong> Missing subject, verb, or incomplete thought</p>
              <p><strong>⭐ Chef's Approval:</strong> Get 3 in a row correct for 2x points!</p>
            </div>
          </details>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmailProposalGame;
