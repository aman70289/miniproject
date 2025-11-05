/* script.js
   - Adjust API_BASE if your backend is at a different host/port
*/
const API_BASE = 'https://miniproject-koc2.onrender.com'; // change if needed

// DOM
const categories = ['JavaScript','Science','History','Sports','Technology','Entertainment'];
const categoryList = document.getElementById('category-list');
const countInput = document.getElementById('count-input');
const startBtn = document.getElementById('start-btn');
const setupStatus = document.getElementById('setup-status');

const setupCard = document.getElementById('setup');
const quizCard = document.getElementById('quiz');
const resultCard = document.getElementById('result');

const questionText = document.getElementById('question-text');
const optionsDiv = document.getElementById('options');
const progressLabel = document.getElementById('progress');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const finishBtn = document.getElementById('finish-btn');
const quizStatus = document.getElementById('quiz-status');

const resultSummary = document.getElementById('result-summary');
const retryBtn = document.getElementById('retry-btn');
const newBtn = document.getElementById('new-btn');

let selectedCategory = null;
let questions = [];
let answers = []; // user's selected option string
let idx = 0;

// init categories
function renderCategories(){
  categoryList.innerHTML = '';
  categories.forEach(cat=>{
    const b = document.createElement('button');
    b.className = 'cat-btn';
    b.textContent = cat;
    b.onclick = () => {
      document.querySelectorAll('.cat-btn').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      selectedCategory = cat;
      setupStatus.textContent = '';
    };
    categoryList.appendChild(b);
  });
}
renderCategories();

function setActiveCard(card){
  [setupCard, quizCard, resultCard].forEach(c => c.classList.remove('active'));
  card.classList.add('active');
}

// fetch questions
async function fetchQuestions(category, count){
  const url = `${API_BASE}/api/quiz/${encodeURIComponent(category)}/${encodeURIComponent(count)}`;
  try{
    const r = await fetch(url);
    if(!r.ok) throw new Error(`Server returned ${r.status}`);
    const data = await r.json();
    // server returned { success: true, questions: [...] } per your backend
    if(data.success && Array.isArray(data.questions)) return data.questions;
    // some backends directly return array
    if(Array.isArray(data)) return data;
    throw new Error('Invalid response from server');
  } catch(err){
    throw err;
  }
}

// UI helpers
function showMessage(el, msg, isError=false){
  el.textContent = msg;
  el.style.color = isError ? '#ef4444' : '#374151';
}

function startQuiz(){
  const count = parseInt(countInput.value) || 10;
  if(!selectedCategory){
    showMessage(setupStatus, 'Please choose a category', true);
    return;
  }
  if(count < 1 || count > 50){
    showMessage(setupStatus, 'Choose a number between 1 and 50', true);
    return;
  }

  showMessage(setupStatus, 'Loading questions...');
  startBtn.disabled = true;

  fetchQuestions(selectedCategory, count)
    .then(qs => {
      questions = qs.map(q => normalizeQuestion(q));
      answers = new Array(questions.length).fill(null);
      idx = 0;
      setActiveCard(quizCard);
      renderQuestion();
      updateProgress();
      showMessage(setupStatus, '');
    })
    .catch(err=>{
      showMessage(setupStatus, 'Failed to load questions: '+err.message, true);
    })
    .finally(()=> startBtn.disabled = false);
}

function normalizeQuestion(q){
  // Ensure object has question text, options array, correctAnswer
  // Support the schema you showed: option1..option4 + correctAnswer
  const opts = [];
  if(q.option1) opts.push(q.option1);
  if(q.option2) opts.push(q.option2);
  if(q.option3) opts.push(q.option3);
  if(q.option4) opts.push(q.option4);
  // fallback: if there's an options array already
  if(Array.isArray(q.options) && q.options.length) {
    return { question: q.question || q.title || 'Question', options: q.options, correctAnswer: q.correctAnswer || q.answer || q.correct };
  }
  return {
    question: q.question || q.title || 'Question',
    options: opts.length ? opts : (q.options || []),
    correctAnswer: q.correctAnswer || q.answer || q.correct || null,
  };
}

function renderQuestion(){
  const q = questions[idx];
  if(!q) return;
  questionText.textContent = q.question;
  optionsDiv.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.innerHTML = `<span class="opt-label">${String.fromCharCode(65+i)}.</span><div>${opt}</div>`;
    if(answers[idx] === opt) btn.classList.add('selected');
    btn.onclick = () => {
      // select/deselect
      answers[idx] = (answers[idx] === opt) ? null : opt;
      // update UI
      optionsDiv.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
      if(answers[idx]) btn.classList.add('selected');
    };
    optionsDiv.appendChild(btn);
  });
  updateProgress();
}

function updateProgress(){
  progressLabel.textContent = `Question ${idx+1} / ${questions.length}`;
  prevBtn.disabled = idx === 0;
  nextBtn.disabled = idx === questions.length - 1;
}

prevBtn.onclick = ()=>{
  if(idx>0){ idx--; renderQuestion(); }
};
nextBtn.onclick = ()=>{
  if(idx < questions.length -1){ idx++; renderQuestion(); }
};
finishBtn.onclick = finishQuiz;

function finishQuiz(){
  // score
  let score = 0;
  const details = [];
  questions.forEach((q, i)=>{
    const user = answers[i];
    const correct = q.correctAnswer;
    const ok = (user !== null && String(user).trim() === String(correct).trim());
    if(ok) score++;
    details.push({ q: q.question, user, correct, ok });
  });

  // show result
  resultSummary.innerHTML = `
    <div class="score"> ${score} / ${questions.length} </div>
    <div>Percentage: ${Math.round((score/questions.length)*100)}%</div>
    <hr style="margin:12px 0;">
    <div>
      ${details.map((d, i)=>`
        <div style="padding:8px 0;border-bottom:1px solid #f3f4f6">
          <div style="font-weight:700">${i+1}. ${escapeHtml(d.q)}</div>
          <div style="margin-top:6px">Your answer: <strong style="color:${d.ok? '#059669' : '#ef4444'}">${escapeHtml(d.user||'—')}</strong></div>
          <div>Correct answer: <strong>${escapeHtml(d.correct||'—')}</strong></div>
        </div>`).join('')}
    </div>
  `;
  setActiveCard(resultCard);
}

// retry same
retryBtn.onclick = ()=>{
  answers = new Array(questions.length).fill(null);
  idx = 0;
  setActiveCard(quizCard);
  renderQuestion();
};

// new quiz
newBtn.onclick = ()=>{
  selectedCategory = null;
  document.querySelectorAll('.cat-btn').forEach(x=>x.classList.remove('selected'));
  setActiveCard(setupCard);
};

// small helper to avoid XSS in result render
function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// wire start
startBtn.addEventListener('click', startQuiz);

// on load: active setup
setActiveCard(setupCard);
