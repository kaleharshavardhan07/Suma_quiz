
//MAKING JAVA SCRIPT FOR UI 
document.getElementById('1').classList.add('notshow');

document.getElementById('2').classList.add('notshow');

document.getElementById('3').classList.add('notshow');

// File input enhancement
document.getElementById('pdfFile').addEventListener('change', function (e) {
  const fileName = e.target.files[0]?.name || 'No file chosen';
  e.target.parentElement.querySelector('.file-name').textContent = fileName;
});


const summarizeBtn = document.getElementById('summarizeBtn');
const translateBtn = document.getElementById('translateBtn');
const quizbtn = document.getElementById('quizBtn');
let currentSummary = '';
let textdata = '';

// Show/hide loader function
function toggleLoader(show) {
  document.querySelector('.loader-container').style.display = show ? 'flex' : 'none';
}

summarizeBtn.onclick = async function () {
  toggleLoader(true);
  const textInput = document.getElementById('textInput').value.trim();
  const pdfFile = document.getElementById('pdfFile').files.length;

  if (!textInput && pdfFile === 0) {
    alert('Please enter text or upload a PDF file.');
    toggleLoader(false);
    return;
  }

  try {
    const formData = new FormData(document.getElementById('textForm'));

    const response = await fetch('/summarize', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to summarize text');
    }

    const result = await response.json();
    currentSummary = result.summary;
    const md = window.markdownit();
    document.getElementById('summaryText').innerHTML = md.render(currentSummary);
    document.getElementById('1').classList.remove('notshow');
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('1').classList.remove('notshow');
    document.getElementById('summaryText').innerHTML = `<span class="error">${error.message}</span>`;
  } finally {
    toggleLoader(false);
  }
};

translateBtn.onclick = async function () {
  toggleLoader(true);
  try {
    const response = await fetch('/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summaryText: currentSummary, targetLanguage: document.getElementById('targetLanguage').value })
    });

    if (!response.ok) {
      throw new Error('Failed to translate summary');
    }

    const result = await response.json();
    document.getElementById('2').classList.remove('notshow');
    document.getElementById('translatedSummaryText').innerText = result.translatedSummary;
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('2').classList.remove('notshow');
    document.getElementById('translatedSummaryText').innerHTML = `<span class="error">${error.message}</span>`;
  } finally {
    toggleLoader(false);
  }
};
// Frontend JavaScript code
let quizData = []; // Store quiz data globally

quizBtn.onclick = async function () {
  toggleLoader(true);
  try {
    const formData = new FormData(document.getElementById('textForm'));
    const response = await fetch('/quizgenerate', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to generate quiz');
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }

    quizData = result.quizData; // Store quiz data
    document.getElementById('3').classList.remove('notshow');
    displayQuiz(quizData);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('3').classList.remove('notshow');
    document.getElementById('quizForm').innerHTML =
      `<div class="error">Error generating quiz: ${error.message}</div>`;
  } finally {
    toggleLoader(false);
  }
};

function displayQuiz(questions) {
  const quizForm = document.getElementById('quizForm');
  quizForm.innerHTML = '';

  questions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'quiz-question';

    // Create question header
    const questionHeader = document.createElement('h3');
    questionHeader.textContent = `Question ${index + 1}: ${question.question}`;
    questionDiv.appendChild(questionHeader);

    // Create options
    question.options.forEach((option, optionIndex) => {
      const label = document.createElement('label');
      label.className = 'quiz-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `question${index}`;
      input.value = option;
      input.id = `q${index}o${optionIndex}`;

      const optionText = document.createElement('span');
      optionText.textContent = option;

      label.appendChild(input);
      label.appendChild(optionText);
      questionDiv.appendChild(label);
    });

    quizForm.appendChild(questionDiv);
  });

  // Show submit button and reset score
  document.getElementById('submitQuizBtn').style.display = 'block';
  document.getElementById('quizScore').textContent = '';
}

document.getElementById('submitQuizBtn').onclick = function () {
  const quizForm = document.getElementById('quizForm');
  let score = 0;
  let totalQuestions = quizData.length;
  let results = [];

  quizData.forEach((question, index) => {
    const selectedOption = document.querySelector(`input[name="question${index}"]:checked`);
    const isCorrect = selectedOption && selectedOption.value === question.correctAnswer;

    if (isCorrect) {
      score++;
    }

    // Highlight correct and incorrect answers
    const questionDiv = quizForm.children[index];
    const options = questionDiv.querySelectorAll('.quiz-option');

    options.forEach(option => {
      const radio = option.querySelector('input');
      const isSelected = radio.checked;
      const isCorrectOption = radio.value === question.correctAnswer;

      option.classList.remove('correct', 'incorrect');
      if (isCorrectOption) {
        option.classList.add('correct');
      } else if (isSelected && !isCorrectOption) {
        option.classList.add('incorrect');
      }
    });

    results.push({
      question: question.question,
      userAnswer: selectedOption ? selectedOption.value : 'No answer',
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect
    });
  });

  // Display score and feedback
  const scoreDiv = document.getElementById('quizScore');
  scoreDiv.innerHTML = `
<div class="score-summary">
  <h3>Quiz Results</h3>
  <p>Score: ${score}/${totalQuestions} (${Math.round(score / totalQuestions * 100)}%)</p>
  <div class="feedback">
    ${results.map((result, index) => `
      <div class="question-feedback ${result.isCorrect ? 'correct' : 'incorrect'}">
        <p><strong>Question ${index + 1}:</strong> ${result.question}</p>
        <p>Your answer: ${result.userAnswer}</p>
        ${!result.isCorrect ? `<p>Correct answer: ${result.correctAnswer}</p>` : ''}
      </div>
    `).join('')}
  </div>
</div>
`;
};

