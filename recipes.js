const API = 'https://www.themealdb.com/api/json/v1/1';
let allRecipes = [];
let savedRecipes = JSON.parse(localStorage.getItem('rsc_saved') || '[]');
let currentFilter = 'All';
let dashIngredients = [];
let demoIngredients = [];

// ─── DEMO PAGE ───────────────────────────────────────────────────────────────

function addIngredient() {
  const inp = document.getElementById('ingredientInput');
  const val = inp.value.trim();
  if (!val) return;
  demoIngredients.push(val);
  inp.value = '';
  renderDemoTags();
}

function renderDemoTags() {
  const row = document.getElementById('ingredientTags');
  if (!row) return;
  row.innerHTML = demoIngredients.map((t, i) =>
    `<div class="tag">${t}<span onclick="removeDemo(${i})">✕</span></div>`
  ).join('');
}

function removeDemo(i) {
  demoIngredients.splice(i, 1);
  renderDemoTags();
}

async function searchByIngredients() {
  const q = demoIngredients[0] || 'chicken';
  await fetchAndRender(q, 'recipesGrid', 'loadingSpinner', 'recipeStatus');
}

async function loadDefaultRecipes() {
  await fetchAndRender('chicken', 'recipesGrid', 'loadingSpinner', 'recipeStatus');
}

async function fetchAndRender(query, gridId, spinnerId, statusId) {
  const grid = document.getElementById(gridId);
  const spinner = document.getElementById(spinnerId);
  const status = document.getElementById(statusId);
  if (!grid) return;

  if (spinner) spinner.style.display = 'block';
  if (grid) grid.innerHTML = '';
  if (status) status.textContent = '';

  try {
    const res = await fetch(`${API}/search.php?s=${encodeURIComponent(query)}`);
    const data = await res.json();
    allRecipes = data.meals || [];

    if (spinner) spinner.style.display = 'none';

    if (!allRecipes.length) {
      grid.innerHTML = '<div class="empty-state"><div class="emoji">😕</div><p>No recipes found. Try another ingredient!</p></div>';
      return;
    }

    if (status) status.textContent = `Found ${allRecipes.length} recipes`;
    renderCards(allRecipes, grid, true);
  } catch (e) {
    if (spinner) spinner.style.display = 'none';
    grid.innerHTML = '<div class="empty-state"><div class="emoji">⚠️</div><p>Couldn\'t load recipes. Check your internet connection.</p></div>';
  }
}

function setFilter(btn, cat) {
  document.querySelectorAll('#filterRow .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = cat;
  const filtered = cat === 'All' ? allRecipes : allRecipes.filter(m => m.strCategory === cat);
  renderCards(filtered, document.getElementById('recipesGrid'), true);
}

// ─── SHARED CARD RENDERER ────────────────────────────────────────────────────

function renderCards(meals, grid, showSave = false) {
  if (!grid) return;
  if (!meals.length) {
    grid.innerHTML = '<div class="empty-state"><div class="emoji">🍽️</div><p>No recipes match this filter.</p></div>';
    return;
  }
  grid.innerHTML = meals.map(m => {
    const isSaved = savedRecipes.find(s => s.idMeal === m.idMeal);
    const time = Math.floor(Math.random() * 30) + 20;
    return `
      <div class="recipe-card" onclick="openModal('${m.idMeal}')">
        <img src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy" />
        ${showSave ? `<button class="saved-badge" onclick="toggleSave(event,'${m.idMeal}')" title="Save">${isSaved ? '❤️' : '🤍'}</button>` : ''}
        <div class="recipe-card-body">
          <h3>${m.strMeal}</h3>
          <div class="recipe-meta">
            <span>🌍 ${m.strArea || 'World'}</span>
            <span>⏱ ${time}m</span>
            <span>🍽 ${m.strCategory}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── MODAL ───────────────────────────────────────────────────────────────────

async function openModal(id) {
  try {
    const res = await fetch(`${API}/lookup.php?i=${id}`);
    const data = await res.json();
    const m = data.meals[0];

    document.getElementById('modalImg').src = m.strMealThumb;
    document.getElementById('modalTitle').textContent = m.strMeal;
    document.getElementById('modalTags').innerHTML = `
      <span class="modal-tag">${m.strCategory}</span>
      <span class="modal-tag">🌍 ${m.strArea || 'International'}</span>
      ${m.strTags ? m.strTags.split(',').map(t=>`<span class="modal-tag">${t.trim()}</span>`).join('') : ''}
    `;

    // Ingredients
    const ings = [];
    for (let i = 1; i <= 20; i++) {
      const ing = m[`strIngredient${i}`];
      const mea = m[`strMeasure${i}`];
      if (ing && ing.trim()) ings.push(`${mea ? mea.trim()+' ' : ''}${ing.trim()}`);
    }
    document.getElementById('modalIngredients').innerHTML = `
      <h4 style="font-family:var(--font-head);margin-bottom:0.7rem;font-size:1rem">Ingredients</h4>
      <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:1rem">
        ${ings.map(i=>`<span class="modal-tag">${i}</span>`).join('')}
      </div>
    `;

    const instructions = m.strInstructions || '';
    document.getElementById('modalDesc').textContent = '';
    document.getElementById('modalInstructions').innerHTML = `
      <h4 style="font-family:var(--font-head);margin-bottom:0.7rem;font-size:1rem">Instructions</h4>
      <p style="color:var(--muted);font-size:0.88rem;line-height:1.8">${instructions.substring(0, 600)}${instructions.length > 600 ? '...' : ''}</p>
    `;

    document.getElementById('modalOverlay').classList.add('open');
  } catch (e) {
    console.error(e);
  }
}

function closeModal(e) {
  if (!e || e.target.id === 'modalOverlay' || e.target.classList.contains('modal-close')) {
    document.getElementById('modalOverlay').classList.remove('open');
  }
}

// ─── SAVE / UNSAVE ───────────────────────────────────────────────────────────

function toggleSave(e, id) {
  e.stopPropagation();
  const meal = allRecipes.find(m => m.idMeal === id);
  if (!meal) return;
  const idx = savedRecipes.findIndex(s => s.idMeal === id);
  if (idx > -1) {
    savedRecipes.splice(idx, 1);
    e.target.textContent = '🤍';
  } else {
    savedRecipes.push(meal);
    e.target.textContent = '❤️';
  }
  localStorage.setItem('rsc_saved', JSON.stringify(savedRecipes));
  updateSavedCount();
}

function updateSavedCount() {
  const el = document.getElementById('savedCount');
  if (el) el.textContent = savedRecipes.length;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

async function initDashboard() {
  updateSavedCount();
  const grid = document.getElementById('dashGrid');
  const spinner = document.getElementById('dashLoading');
  if (!grid) return;

  if (spinner) spinner.style.display = 'block';
  try {
    const categories = ['chicken', 'pasta', 'beef', 'seafood', 'dessert'];
    const promises = categories.map(c =>
      fetch(`${API}/search.php?s=${c}`).then(r => r.json())
    );
    const results = await Promise.all(promises);
    allRecipes = results.flatMap(r => r.meals || []).filter(m => m);
    // deduplicate
    const seen = new Set();
    allRecipes = allRecipes.filter(m => { if (seen.has(m.idMeal)) return false; seen.add(m.idMeal); return true; });
    if (spinner) spinner.style.display = 'none';
    const count = document.getElementById('dashRecipeCount');
    if (count) count.textContent = `(${allRecipes.length})`;
    renderCards(allRecipes, grid, true);
  } catch {
    if (spinner) spinner.style.display = 'none';
  }
}

function dashAddIngredient() {
  const inp = document.getElementById('dashIngredient');
  const val = inp.value.trim();
  if (!val) return;
  dashIngredients.push(val);
  inp.value = '';
  renderDashTags();
}

function renderDashTags() {
  const row = document.getElementById('dashTags');
  if (!row) return;
  row.innerHTML = dashIngredients.map((t, i) =>
    `<div class="tag">${t}<span onclick="removeDashTag(${i})">✕</span></div>`
  ).join('');
}

function removeDashTag(i) {
  dashIngredients.splice(i, 1);
  renderDashTags();
}

async function dashSearch() {
  const q = dashIngredients[0] || document.getElementById('dashSearch')?.value || 'chicken';
  const grid = document.getElementById('dashGrid');
  const spinner = document.getElementById('dashLoading');
  if (!grid) return;
  if (spinner) spinner.style.display = 'block';
  grid.innerHTML = '';
  try {
    const res = await fetch(`${API}/search.php?s=${encodeURIComponent(q)}`);
    const data = await res.json();
    allRecipes = data.meals || [];
    if (spinner) spinner.style.display = 'none';
    renderCards(allRecipes, grid, true);
  } catch {
    if (spinner) spinner.style.display = 'none';
  }
}

function dashSearchRecipes(val) {
  if (!val) return;
  clearTimeout(window._dashTimer);
  window._dashTimer = setTimeout(async () => {
    const res = await fetch(`${API}/search.php?s=${encodeURIComponent(val)}`);
    const data = await res.json();
    allRecipes = data.meals || [];
    renderCards(allRecipes, document.getElementById('dashGrid'), true);
  }, 400);
}

function dashSetFilter(btn, cat) {
  document.querySelectorAll('#dashFilterRow .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = cat === 'All' ? allRecipes : allRecipes.filter(m => m.strCategory === cat || m.strMeal.toLowerCase().includes(cat.toLowerCase()));
  renderCards(filtered, document.getElementById('dashGrid'), true);
}

// ─── MEAL PLANNER ────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const EMOJIS = ['🥗','🍝','🍗','🥩','🌮','🍜','🍕'];

function renderPlannerEmpty() {
  const grid = document.getElementById('plannerGrid');
  if (!grid) return;
  grid.innerHTML = DAYS.map((d, i) => `
    <div class="feat-card" style="padding:1rem;text-align:center;min-height:120px">
      <div style="font-size:0.75rem;color:var(--orange);margin-bottom:0.5rem;font-weight:600">${d}</div>
      <div style="color:var(--muted);font-size:0.8rem" id="plan-${i}">No meal planned</div>
    </div>
  `).join('');
}

function generatePlan() {
  renderPlannerEmpty();
  const meals = [...allRecipes].sort(() => Math.random() - 0.5).slice(0, 7);
  DAYS.forEach((d, i) => {
    const el = document.getElementById(`plan-${i}`);
    if (el && meals[i]) {
      el.innerHTML = `<div style="font-size:1.2rem">${EMOJIS[i]}</div><div style="font-size:0.78rem;color:var(--text);margin-top:0.4rem">${meals[i].strMeal}</div>`;
    }
  });
}

// Init planner on load
setTimeout(() => { renderPlannerEmpty(); }, 200);
