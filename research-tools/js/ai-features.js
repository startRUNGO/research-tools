// ==================== AI Tools Search ====================

function searchAITools(query) {
    const section = document.getElementById('ai-tools');
    const categories = section.querySelectorAll('.resource-category');
    const noResults = document.getElementById('aiToolsNoResults');
    const q = query.toLowerCase().trim();
    let totalVisible = 0;

    categories.forEach(cat => {
        const links = cat.querySelectorAll('.resource-link');
        let visibleInCat = 0;
        links.forEach(link => {
            const text = link.textContent.toLowerCase();
            const match = !q || text.includes(q);
            link.style.display = match ? '' : 'none';
            if (match) visibleInCat++;
        });
        cat.style.display = visibleInCat > 0 ? '' : 'none';
        totalVisible += visibleInCat;
    });

    if (noResults) {
        noResults.style.display = (q && totalVisible === 0) ? 'block' : 'none';
    }
}

// ==================== AI Writing Assistant ====================

let favoritePrompts = JSON.parse(localStorage.getItem('favoritePrompts') || '[]');

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.prompt-card').forEach((card, i) => {
        if (!card.dataset.promptId) {
            card.dataset.promptId = card.dataset.category + '-' + i;
        }
        const header = card.querySelector('.prompt-card-header');
        if (header && !header.querySelector('.fav-btn')) {
            const favBtn = document.createElement('button');
            favBtn.className = 'fav-btn';
            favBtn.onclick = function() { toggleFavorite(this); };
            const isFav = favoritePrompts.includes(card.dataset.promptId);
            favBtn.textContent = isFav ? '♥' : '♡';
            if (isFav) favBtn.classList.add('favorited');
            header.insertBefore(favBtn, header.querySelector('.copy-btn'));
        }
    });
    updateFavCount();
});

function toggleFavorite(btn) {
    const card = btn.closest('.prompt-card');
    const id = card.dataset.promptId;
    const idx = favoritePrompts.indexOf(id);
    if (idx > -1) {
        favoritePrompts.splice(idx, 1);
        btn.textContent = '♡';
        btn.classList.remove('favorited');
    } else {
        favoritePrompts.push(id);
        btn.textContent = '♥';
        btn.classList.add('favorited');
    }
    localStorage.setItem('favoritePrompts', JSON.stringify(favoritePrompts));
    updateFavCount();
}

function updateFavCount() {
    const badge = document.getElementById('favCount');
    if (badge) {
        badge.textContent = favoritePrompts.length > 0 ? ` (${favoritePrompts.length})` : '';
    }
}

function filterPrompts(category, evt) {
    const cards = document.querySelectorAll('.prompt-card');
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (evt && evt.target) evt.target.classList.add('active');
    cards.forEach(card => {
        if (category === 'all') {
            card.classList.remove('hidden');
        } else if (category === 'favorites') {
            card.classList.toggle('hidden', !favoritePrompts.includes(card.dataset.promptId));
        } else if (card.dataset.category === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function copyPrompt(btn) {
    const card = btn.closest('.prompt-card');
    const content = card.querySelector('.prompt-content').textContent;
    navigator.clipboard.writeText(content).then(() => {
        const originalText = btn.textContent;
        btn.textContent = t('alert.copied');
        btn.style.background = '#27ae60';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        showToast(t('alert.copyFail') + err, 'error');
    });
}
