// DASHBOARD SECTION SWITCHER

function showSection(id, linkEl) {
  ['home', 'saved', 'chef', 'planner', 'settings'].forEach(s => {
    const el = document.getElementById(`sec-${s}`);
    if (el) el.style.display = s === id ? '' : 'none';
  });

  document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');

  if (id === 'saved') renderSaved();
  if (id === 'planner') renderPlannerEmpty();
}

function renderSaved() {
  const grid = document.getElementById('savedGrid');
  const empty = document.getElementById('savedEmpty');
  if (!grid) return;

  const saved = JSON.parse(localStorage.getItem('rsc_saved') || '[]');

  if (!saved.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  grid.innerHTML = saved.map(m => `
    <div class="recipe-card" onclick="openModal('${m.idMeal}')">
      <img src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy" />
      <button class="saved-badge" onclick="unsaveFromList(event,'${m.idMeal}')" title="Remove">❤️</button>
      <div class="recipe-card-body">
        <h3>${m.strMeal}</h3>
        <div class="recipe-meta">
          <span>🌍 ${m.strArea || 'World'}</span>
          <span>🍽 ${m.strCategory}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function unsaveFromList(e, id) {
  e.stopPropagation();
  let saved = JSON.parse(localStorage.getItem('rsc_saved') || '[]');
  saved = saved.filter(s => s.idMeal !== id);
  localStorage.setItem('rsc_saved', JSON.stringify(saved));
  updateSavedCount();
  renderSaved();
}

// Keyboard shortcut: '/' focuses search
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    document.getElementById('dashSearch')?.focus();
  }
  if (e.key === 'Escape') {
    closeModal();
    if (chatOpen) toggleChat();
  }
});
