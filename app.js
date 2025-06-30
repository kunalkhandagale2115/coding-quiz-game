// --- Coding Quiz Game ---
const QUESTIONS = [
  {
    code: `print(1 + 2)`,
    answer: '3',
  },
  {
    code: `for i in range(3):\n    print(i)`,
    answer: '0\n1\n2',
  },
  {
    code: `x = 5\nif x > 3:\n    print('Hi')\nelse:\n    print('Bye')`,
    answer: 'Hi',
  },
  {
    code: `print('A' * 3)`,
    answer: 'AAA',
  },
  {
    code: `for c in 'hi':\n    print(c)`,
    answer: 'h\ni',
  },
  {
    code: `print(2 ** 3)`,
    answer: '8',
  },
  {
    code: `for i in range(1, 4):\n    print(i * i)`,
    answer: '1\n4\n9',
  },
  {
    code: `x = 7\nif x % 2 == 0:\n    print('Even')\nelse:\n    print('Odd')`,
    answer: 'Odd',
  },
  {
    code: `print('Hello, ' + 'World!')`,
    answer: 'Hello, World!',
  },
  {
    code: `for i in range(2):\n    for j in range(2):\n        print(i + j)`,
    answer: '0\n1\n1\n2',
  },
  {
    code: `print(len('python'))`,
    answer: '6',
  },
  {
    code: `print('py' in 'python')`,
    answer: 'True',
  },
  {
    code: `x = 3\nprint(x == 3)`,
    answer: 'True',
  },
  {
    code: `print(10 // 3)`,
    answer: '3',
  },
  {
    code: `for i in range(1, 6, 2):\n    print(i)`,
    answer: '1\n3\n5',
  },
];

const TOTAL_ROUNDS = 20;
let state = {
  name: '',
  round: 0,
  correct: 0,
  current: null,
  order: [],
  feedback: '',
  feedbackType: '',
  timer: 0,
  timerId: null,
  answers: [],
};

const app = document.getElementById('app');

function shuffle(arr) {
  return arr.map(v => [Math.random(), v]).sort().map(a => a[1]);
}

function render() {
  app.innerHTML = '';
  if (!state.name) {
    renderStart();
  } else if (state.round >= TOTAL_ROUNDS) {
    renderResult();
  } else {
    renderQuiz();
  }
}

function renderStart() {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h1>🐍 Coding Quiz Game</h1>
    <p>Test your Python skills!<br>Enter your name to begin.</p>
    <input type="text" id="nameInput" placeholder="Your name..." maxlength="20" autofocus />
    <button id="startBtn">Start Game</button>
  `;
  app.appendChild(card);
  document.getElementById('startBtn').onclick = () => {
    const name = document.getElementById('nameInput').value.trim();
    if (name) {
      state.name = name;
      startGame();
    }
  };
  document.getElementById('nameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('startBtn').click();
  });
}

function startGame() {
  state.round = 0;
  state.correct = 0;
  state.feedback = '';
  state.feedbackType = '';
  state.answers = [];
  state.order = shuffle(QUESTIONS).slice(0, TOTAL_ROUNDS);
  nextQuestion();
}

function nextQuestion() {
  state.current = state.order[state.round];
  state.feedback = '';
  state.feedbackType = '';
  startTimer();
  render();
}

function renderQuiz() {
  const card = document.createElement('div');
  card.className = 'card';
  let showCorrect = state.feedbackType === 'wrong' && state.feedback;
  card.innerHTML = `
    <h2>Question ${state.round + 1} / ${TOTAL_ROUNDS}</h2>
    <div class="timer" id="timer">⏱️ <span id="timerVal">15</span>s</div>
    <div class="code-block">${escapeHtml(state.current.code)}</div>
    <form id="answerForm" autocomplete="off">
      <label for="answerInput">Expected Output:</label>
      <textarea id="answerInput" rows="${state.current.answer.split('\n').length}" placeholder="Type output..." autofocus></textarea>
      <div class="feedback ${state.feedbackType}">${state.feedback}</div>
      ${showCorrect ? `<div class="feedback correct">Correct answer:<br><pre>${escapeHtml(state.current.answer)}</pre></div>` : ''}
      <button type="submit">Submit</button>
    </form>
  `;
  app.appendChild(card);
  document.getElementById('answerForm').onsubmit = e => {
    e.preventDefault();
    checkAnswer();
  };
  document.getElementById('answerInput').focus();
  startTimerDisplay();
}

function checkAnswer() {
  stopTimer();
  const user = document.getElementById('answerInput').value.trim().replace(/\r/g, '');
  const correct = state.current.answer.trim();
  let isCorrect = normalize(user) === normalize(correct);
  if (isCorrect) {
    state.correct++;
    state.feedback = 'Correct!';
    state.feedbackType = 'correct';
  } else {
    state.feedback = 'Wrong!';
    state.feedbackType = 'wrong';
  }
  state.answers.push({
    code: state.current.code,
    user,
    correct,
    isCorrect,
  });
  render();
  setTimeout(() => {
    state.round++;
    if (state.round < TOTAL_ROUNDS) {
      nextQuestion();
    } else {
      render();
    }
  }, isCorrect ? 900 : 3000);
}

function renderResult() {
  const percent = Math.round((state.correct / TOTAL_ROUNDS) * 100);
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h1>Results</h1>
    <p><b>Player:</b> ${escapeHtml(state.name)}</p>
    <p><b>Score:</b> ${state.correct} / ${TOTAL_ROUNDS}</p>
    <p><b>Percentage:</b> ${percent}%</p>
    <button id="playAgainBtn">Play Again</button>
  `;
  app.appendChild(card);
  document.getElementById('playAgainBtn').onclick = () => {
    state.name = '';
    render();
  };
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, tag => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[tag]));
}

function normalize(str) {
  return str.replace(/\r/g, '').trim().replace(/\n+/g, '\n');
}

// --- Timer ---
function startTimer() {
  state.timer = 15;
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.timer--;
    if (state.timer <= 0) {
      stopTimer();
      state.feedback = 'Time\'s up!';
      state.feedbackType = 'wrong';
      state.answers.push({
        code: state.current.code,
        user: '',
        correct: state.current.answer,
        isCorrect: false,
      });
      render();
      setTimeout(() => {
        state.round++;
        if (state.round < TOTAL_ROUNDS) {
          nextQuestion();
        } else {
          render();
        }
      }, 3000);
    } else {
      updateTimerDisplay();
    }
  }, 1000);
}
function stopTimer() {
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
}
function startTimerDisplay() {
  updateTimerDisplay();
}
function updateTimerDisplay() {
  const el = document.getElementById('timerVal');
  if (el) el.textContent = state.timer;
}

// --- Init ---
render(); 