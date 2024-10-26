document.addEventListener('DOMContentLoaded', () => {
  const summarizeBtn = document.getElementById('summarizeBtn');
  const translateBtn = document.getElementById('translateBtn');
  const quizBtn = document.getElementById('quizBtn');
  const submitQuizBtn = document.getElementById('submitQuizBtn');
  const loader = document.querySelector('.loader-container');

  function showLoader() {
    loader.style.display = 'flex';
  }

  function hideLoader() {
    loader.style.display = 'none';
  }

  summarizeBtn.addEventListener('click', async () => {
    showLoader();
    const formData = new FormData(document.getElementById('textForm'));
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      document.getElementById('summaryText').textContent = data.summary;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      hideLoader();
    }
  });

  translateBtn.addEventListener('click', async () => {
    showLoader();
    const summaryText = document.getElementById('summaryText').textContent;
    const targetLanguage = document.getElementById('targetLanguage').value;
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summaryText,
          targetLanguage
        })
      });
      const data = await response.json();
      document.getElementById('translatedSummaryText').textContent = data.translatedSummary;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      hideLoader();
    }
  });

  quizBtn.addEventListener('click', async () => {
    showLoader();
    try {
      const response = await fetch('/api/quizgenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: document.getElementById('textInput').value
        })
      });
      const data = await response.json();
      renderQuiz(data.quizData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      hideLoader();
    }
  });

  function renderQuiz(questions) {
    const quizForm = document.getElementById('quizForm');
    quizForm.innerHTML = '';

    questions.forEach((q, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'quiz-question';
      
      questionDiv.innerHTML = `
        <p>${q.question}</p>
        ${q.options.map((option, i) => `
          <label class="quiz-option">
            <input type="radio" name="q${index}" value="${option}">
            ${option}
          </label>
        `).join('')}
      `;
      
      quizForm.appendChild(questionDiv);
    });

    // Store correct answers
    quizForm.dataset.answers = JSON.stringify(questions.map(q => q.correctAnswer));
  }

  submitQuizBtn.addEventListener('click', () => {
    const quizForm = document.getElementById('quizForm');
    const correctAnswers = JSON.parse(quizForm.dataset.answers);
    let score = 0;
    
    correctAnswers.forEach((answer, index) => {
      const selected = document.querySelector(`input[name="q${index}"]:checked`);
      if (selected && selected.value === answer) {
        score++;
      }
    });
    
    document.getElementById('quizScore').innerHTML = `
      <div class="score-summary">
        Your score: ${score} out of ${correctAnswers.length}
      </div>
    `;
  });
});