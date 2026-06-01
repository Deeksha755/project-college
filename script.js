const startButton = document.getElementById('start-button');
const nextButton = document.getElementById('next-button');
const restartButton = document.getElementById('restart-button');
const startView = document.getElementById('start-view');
const quizView = document.getElementById('quiz-view');
const resultView = document.getElementById('result-view');
const questionCounter = document.getElementById('question-counter');
const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices');
const feedback = document.getElementById('feedback');
const resultSummary = document.getElementById('result-summary');
const confettiContainer = document.getElementById('confetti-container');

let quizData = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let quizStarted = false;
let answered = false;

const fallbackData = [
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
    question: 'Which element do plants use to make food?',
    choices: ['Photosynthesis', 'Nitrogen', 'Sunlight', 'Chlorophyll'],
    correctIndex: 3,
  },
  {
    question: 'What does CPU stand for?',
    choices: ['Central Process Unit', 'Computer Personal Unit', 'Central Processing Unit', 'Control Performance Unit'],
    correctIndex: 2,
  },
];

async function loadQuiz() {
  try {
    const response = await fetch('quiz-data.json');
    if (!response.ok) {
      throw new Error('Quiz data not found');
    }
    quizData = await response.json();
  } catch (error) {
    console.warn('Falling back to embedded quiz data.', error);
    quizData = fallbackData;
  }
}

function showView(view) {
  [startView, quizView, resultView].forEach((section) => {
    section.hidden = section !== view;
  });
}

function startQuiz() {
  if (!quizData.length) return;
  currentQuestionIndex = 0;
  correctAnswers = 0;
  quizStarted = true;
  answered = false;
  showView(quizView);
  nextButton.hidden = true;
  feedback.textContent = '';
  renderQuestion();
}

function renderQuestion() {
  const question = quizData[currentQuestionIndex];
  questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
  questionText.textContent = question.question;
  choicesContainer.innerHTML = '';
  question.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-button';
    button.textContent = choice;
    button.dataset.index = index;
    button.addEventListener('click', () => onChoiceSelected(index));
    choicesContainer.appendChild(button);
  });
}

function onChoiceSelected(selectedIndex) {
  if (answered) return;
  answered = true;
  const question = quizData[currentQuestionIndex];
  const buttons = Array.from(choicesContainer.children);
  const isCorrect = selectedIndex === question.correctIndex;

  buttons.forEach((button) => {
    const index = Number(button.dataset.index);
    button.classList.add('disabled');
    if (index === question.correctIndex) {
      button.classList.add('correct');
    }
    if (index === selectedIndex && !isCorrect) {
      button.classList.add('incorrect');
    }
  });

  if (isCorrect) {
    correctAnswers += 1;
    feedback.textContent = 'Correct! Great job.';
    triggerConfetti();
  } else {
    feedback.textContent = 'Wrong answer. The correct choice is highlighted in green.';
  }

  nextButton.hidden = false;
  nextButton.textContent = currentQuestionIndex < quizData.length - 1 ? 'Next Question' : 'Finish Quiz';
}

function showResults() {
  showView(resultView);
  const incorrectAnswers = quizData.length - correctAnswers;
  const score = Math.round((correctAnswers / quizData.length) * 100);
  resultSummary.innerHTML = `
    <div class="summary-item"><span>Total Questions</span><span>${quizData.length}</span></div>
    <div class="summary-item"><span>Correct Answers</span><span>${correctAnswers}</span></div>
    <div class="summary-item"><span>Incorrect Answers</span><span>${incorrectAnswers}</span></div>
    <div class="summary-item"><span>Final Score</span><span>${score}%</span></div>
  `;
}

function nextQuestion() {
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex += 1;
    answered = false;
    feedback.textContent = '';
    nextButton.hidden = true;
    renderQuestion();
  } else {
    showResults();
  }
}

function restartQuiz() {
  showView(startView);
}

function triggerConfetti() {
  confettiContainer.innerHTML = '';
  const count = 40;
  for (let i = 0; i < count; i += 1) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.setProperty('--x', `${Math.random() * 180 - 90}vw`);
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.background = `hsl(${Math.random() * 360}, 90%, 65%)`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(confetti);
  }
  setTimeout(() => {
    confettiContainer.innerHTML = '';
  }, 2200);
}

startButton.addEventListener('click', startQuiz);
nextButton.addEventListener('click', nextQuestion);
restartButton.addEventListener('click', restartQuiz);

loadQuiz();
