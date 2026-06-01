import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'quizAdminAppData';
const fallbackQuestions = [
  {
    question: 'Which language is used to style web pages?',
    choices: ['HTML', 'CSS', 'Python', 'SQL'],
    correctIndex: 1,
  },
  {
    question: 'Which planet is known as the Red Planet?',
    choices: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctIndex: 1,
  },
  {
    question: 'What is the common name for H2O?',
    choices: ['Hydrogen', 'Helium', 'Water', 'Oxygen'],
    correctIndex: 2,
  },
  {
    question: 'Which process do plants use to make food?',
    choices: ['Respiration', 'Digestion', 'Photosynthesis', 'Evaporation'],
    correctIndex: 2,
  },
  {
    question: 'What does CPU stand for?',
    choices: ['Central Process Unit', 'Computer Personal Unit', 'Central Processing Unit', 'Control Performance Unit'],
    correctIndex: 2,
  },
];

function loadStoredQuestions() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function App() {
  const [questions, setQuestions] = useState([]);
  const [view, setView] = useState('quiz');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', choices: ['', '', '', ''], correctIndex: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = loadStoredQuestions();
    if (stored) {
      setQuestions(stored);
      return;
    }

    fetch('/quiz-data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load quiz data');
        return res.json();
      })
      .then((data) => {
        setQuestions(Array.isArray(data) ? data : fallbackQuestions);
      })
      .catch(() => {
        setQuestions(fallbackQuestions);
      });
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    }
  }, [questions]);

  const currentQuestion = questions[currentIndex];
  const quizProgress = useMemo(() => `${currentIndex + 1} / ${questions.length}`, [currentIndex, questions.length]);

  function resetQuiz() {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setFeedback('');
    setCorrectCount(0);
    setShowResults(false);
  }

  function handleAnswer(index) {
    if (selectedIndex !== null || showResults) return;

    setSelectedIndex(index);
    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setCorrectCount((value) => value + 1);
      setFeedback('Correct! Nice work.');
    } else {
      setFeedback('Wrong answer. The correct option is highlighted in green.');
    }
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((value) => value + 1);
      setSelectedIndex(null);
      setFeedback('');
    } else {
      setShowResults(true);
    }
  }

  function handleAddQuestion(event) {
    event.preventDefault();
    const trimmed = newQuestion.question.trim();
    const choices = newQuestion.choices.map((choice) => choice.trim());

    if (!trimmed || choices.some((choice) => !choice)) {
      setError('Please enter a question and all four answer choices.');
      return;
    }

    const next = {
      question: trimmed,
      choices,
      correctIndex: Number(newQuestion.correctIndex),
    };

    setQuestions((prev) => [...prev, next]);
    setNewQuestion({ question: '', choices: ['', '', '', ''], correctIndex: 0 });
    setError('');
  }

  function handleRemoveQuestion(index) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= questions.length - 1 && currentIndex > 0) {
      setCurrentIndex((value) => Math.max(0, value - 1));
    }
  }

  function renderQuizView() {
    if (!questions.length) {
      return <div className="empty-state">Loading questions...</div>;
    }

    if (showResults) {
      const incorrect = questions.length - correctCount;
      const score = Math.round((correctCount / questions.length) * 100);
      return (
        <div className="result-card">
          <h2>Quiz Results</h2>
          <div className="summary">
            <div className="summary-item"><span>Total Questions</span><strong>{questions.length}</strong></div>
            <div className="summary-item"><span>Correct</span><strong>{correctCount}</strong></div>
            <div className="summary-item"><span>Incorrect</span><strong>{incorrect}</strong></div>
            <div className="summary-item"><span>Score</span><strong>{score}%</strong></div>
          </div>
          <div className="button-row">
            <button className="primary-button" onClick={resetQuiz}>Restart Quiz</button>
          </div>
        </div>
      );
    }

    return (
      <div className="quiz-card">
        <div className="quiz-header">
          <span className="label">Question {quizProgress}</span>
          <h2>{currentQuestion.question}</h2>
        </div>

        <div className="choices-grid">
          {currentQuestion.choices.map((choice, index) => {
            const isCorrect = index === currentQuestion.correctIndex;
            const isSelected = index === selectedIndex;
            const statusClass = selectedIndex !== null
              ? isCorrect
                ? 'choice correct'
                : isSelected
                  ? 'choice incorrect'
                  : 'choice disabled'
              : 'choice';

            return (
              <button
                key={choice}
                type="button"
                className={statusClass}
                onClick={() => handleAnswer(index)}
                disabled={selectedIndex !== null}
              >
                {choice}
              </button>
            );
          })}
        </div>

        <div className="feedback">{feedback}</div>
        <div className="button-row">
          <button
            className="secondary-button"
            onClick={handleNext}
            disabled={selectedIndex === null}
          >
            {currentIndex + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
          </button>
        </div>
      </div>
    );
  }

  function renderAdminView() {
    return (
      <div className="admin-card">
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <p>Manage quiz content and keep the question set up to date.</p>
        </div>

        <div className="admin-grid">
          <div className="admin-section">
            <h3>Current questions</h3>
            {questions.length ? (
              <ol className="question-list">
                {questions.map((item, index) => (
                  <li key={`${item.question}-${index}`}>
                    <div className="question-row">
                      <span>{item.question}</span>
                      <button className="text-button" type="button" onClick={() => handleRemoveQuestion(index)}>Remove</button>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No questions available yet.</p>
            )}
          </div>

          <div className="admin-section admin-form">
            <h3>Add a new question</h3>
            <form onSubmit={handleAddQuestion}>
              <label>
                Question
                <textarea
                  value={newQuestion.question}
                  onChange={(event) => setNewQuestion((prev) => ({ ...prev, question: event.target.value }))}
                  rows="3"
                />
              </label>

              {newQuestion.choices.map((choice, index) => (
                <label key={index}>
                  Choice {index + 1}
                  <input
                    type="text"
                    value={choice}
                    onChange={(event) => {
                      const nextChoices = [...newQuestion.choices];
                      nextChoices[index] = event.target.value;
                      setNewQuestion((prev) => ({ ...prev, choices: nextChoices }));
                    }}
                  />
                </label>
              ))}

              <label>
                Correct answer
                <select
                  value={newQuestion.correctIndex}
                  onChange={(event) => setNewQuestion((prev) => ({ ...prev, correctIndex: event.target.value }))}
                >
                  {newQuestion.choices.map((_, index) => (
                    <option key={index} value={index}>Choice {index + 1}</option>
                  ))}
                </select>
              </label>

              {error && <div className="form-error">{error}</div>}
              <button className="primary-button" type="submit">Add Question</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Quiz Admin Portal</h1>
          <p>Answer quiz questions or update the quiz from the admin panel.</p>
        </div>
        <div className="tabs">
          <button
            type="button"
            className={view === 'quiz' ? 'tab active' : 'tab'}
            onClick={() => setView('quiz')}
          >
            Quiz
          </button>
          <button
            type="button"
            className={view === 'admin' ? 'tab active' : 'tab'}
            onClick={() => setView('admin')}
          >
            Admin
          </button>
        </div>
      </header>

      <main className="app-content">
        {view === 'quiz' ? renderQuizView() : renderAdminView()}
      </main>
    </div>
  );
}

export default App;
