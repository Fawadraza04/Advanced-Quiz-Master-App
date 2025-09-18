let currentQuiz = {
  category: "",
  difficulty: "medium",
  numQuestions: 10,
  timerDuration: 20,
  questions: [],
  currentIndex: 0,
  score: 0,
  answers: [],
  timer: null,
};

// DOM Elements
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const categorySelect = document.getElementById("category-select");
const difficultySelect = document.getElementById("difficulty-select");
const numQuestionsInput = document.getElementById("num-questions");
const timerDurationInput = document.getElementById("timer-duration");
const startBtn = document.getElementById("start-btn");

const progressFill = document.getElementById("progress-fill");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const questionCount = document.getElementById("question-count");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const nextBtn = document.getElementById("next-btn");

const finalScore = document.getElementById("final-score");
const analysis = document.getElementById("analysis");
const restartBtn = document.getElementById("restart-btn");

// Event Listeners
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", handleNext);
restartBtn.addEventListener("click", restartQuiz);

optionsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("option")) {
    [...optionsContainer.children].forEach((opt) =>
      opt.classList.remove("selected")
    );
    e.target.classList.add("selected");
    nextBtn.disabled = false;
  }
});

function startQuiz() {
  currentQuiz.category = categorySelect.value;
  currentQuiz.difficulty = difficultySelect.value;
  currentQuiz.numQuestions = parseInt(numQuestionsInput.value) || 10;
  currentQuiz.timerDuration = parseInt(timerDurationInput.value) || 20;

  if (!currentQuiz.category || currentQuiz.category === "") {
    alert("Please select a category!");
    return;
  }
  if (currentQuiz.numQuestions < 5 || currentQuiz.numQuestions > 25) {
    alert("Number of questions must be between 5 and 25!");
    return;
  }
  if (currentQuiz.timerDuration < 10 || currentQuiz.timerDuration > 60) {
    alert("Timer duration must be between 10 and 60 seconds!");
    return;
  }

  prepareQuestions();
  if (currentQuiz.questions.length === 0) {
    alert(
      "No questions available for selected category or issue loading questions! Check console for details."
    );
    console.error(
      "Debug: Questions array length:",
      currentQuiz.questions.length,
      "Category:",
      currentQuiz.category
    );
    return;
  }

  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  loadQuestion();
}

function prepareQuestions() {
  const categoryData = questions.find(
    (cat) => cat.category.toLowerCase() === currentQuiz.category.toLowerCase()
  );
  if (categoryData && categoryData.questions) {
    currentQuiz.questions = shuffleArray([...categoryData.questions]).slice(
      0,
      currentQuiz.numQuestions
    );
    console.log("Prepared questions count:", currentQuiz.questions.length); // Debug
  } else {
    currentQuiz.questions = [];
    console.error("Category data not found or invalid:", currentQuiz.category);
  }
}

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function loadQuestion() {
  clearTimer();
  startTimer();

  const q = currentQuiz.questions[currentQuiz.currentIndex];
  if (!q) {
    alert(
      "No more questions available! This shouldn't happen with current setup."
    );
    console.log(
      "Debug: Current Index:",
      currentQuiz.currentIndex,
      "Num Questions:",
      currentQuiz.numQuestions
    );
    return;
  }
  questionText.textContent = q.question;
  optionsContainer.innerHTML = "";

  const shuffledOptions = shuffleArray([...q.options]);
  const correctIndex = q.options[q.correctAnswer];
  const shuffledCorrect = shuffledOptions.indexOf(correctIndex);

  shuffledOptions.forEach((opt, idx) => {
    const div = document.createElement("div");
    div.classList.add("option");
    div.textContent = opt;
    div.dataset.correct = idx === shuffledCorrect;
    optionsContainer.appendChild(div);
  });

  questionCount.textContent = `Question ${currentQuiz.currentIndex + 1} / ${
    currentQuiz.numQuestions
  }`;
  scoreEl.textContent = `Score: ${currentQuiz.score}`;
  progressFill.style.width = `${
    ((currentQuiz.currentIndex + 1) / currentQuiz.numQuestions) * 100
  }%`;
  nextBtn.disabled = true;
  nextBtn.textContent =
    currentQuiz.currentIndex === currentQuiz.numQuestions - 1
      ? "Finish"
      : "Next";
}

function startTimer() {
  let time = currentQuiz.timerDuration;
  timerEl.textContent = formatTime(time);
  currentQuiz.timer = setInterval(() => {
    time--;
    timerEl.textContent = formatTime(time);
    if (time <= 0) {
      clearTimer();
      handleNext(true);
    }
  }, 1000);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function clearTimer() {
  if (currentQuiz.timer) clearInterval(currentQuiz.timer);
}

function handleNext(timeout = false) {
  clearTimer();

  const selected = optionsContainer.querySelector(".selected");
  let isCorrect = false;

  if (!timeout && selected) {
    isCorrect = selected.dataset.correct === "true";
    if (isCorrect) currentQuiz.score++;
    selected.classList.add(isCorrect ? "correct" : "incorrect");
  }

  [...optionsContainer.children].forEach((opt) => {
    if (opt.dataset.correct === "true") opt.classList.add("correct");
    opt.style.pointerEvents = "none";
  });

  currentQuiz.answers.push({
    question: currentQuiz.questions[currentQuiz.currentIndex].question,
    correct:
      isCorrect || timeout
        ? timeout
          ? "Skipped/Timed out"
          : "Incorrect"
        : "Correct",
  });

  setTimeout(() => {
    currentQuiz.currentIndex++;
    if (currentQuiz.currentIndex < currentQuiz.numQuestions) {
      loadQuestion();
    } else {
      showResults();
    }
  }, 1500);
}

function showResults() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  finalScore.textContent = `Your Score: ${currentQuiz.score} / ${
    currentQuiz.numQuestions
  } (${Math.round((currentQuiz.score / currentQuiz.numQuestions) * 100)}%)`;

  analysis.innerHTML = "<h3>Analysis:</h3>";
  currentQuiz.answers.forEach((ans, idx) => {
    const div = document.createElement("div");
    div.classList.add("analysis-item");
    div.innerHTML = `<strong>Q${idx + 1}:</strong> ${
      ans.question
    }<br><span style="color: ${
      ans.correct === "Correct" ? "#28a745" : "#dc3545"
    }">${ans.correct}</span>`;
    analysis.appendChild(div);
  });
}

function restartQuiz() {
  resultScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  resetQuiz();
}

function resetQuiz() {
  currentQuiz = {
    category: "",
    difficulty: "medium",
    numQuestions: 10,
    timerDuration: 20,
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    timer: null,
  };
  categorySelect.value = "";
  numQuestionsInput.value = 10;
  timerDurationInput.value = 20;
}
