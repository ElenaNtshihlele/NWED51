
const API_URL = 'https://jsonplaceholder.typicode.com/posts';


function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => { el.hidden = true; }, 4000);
}

function formatShortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}


async function fetchApiItems() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();

    const campusLocations = ['Library', 'Cafeteria', 'Parking', 'Admin Block', 'Sports Hall'];
    const campusItems     = ['Phone', 'Keys', 'ID Card', 'Wallet', 'Laptop', 'Backpack', 'Earphones', 'Water Bottle'];

    return posts.slice(0, 10).map((post, i) => ({
      item:     campusItems[i % campusItems.length],
      location: campusLocations[i % campusLocations.length],
      date:     '2026',
      contact:  `user${post.id}@campus.edu`,
      source:   'api',   // flag so we can label it
    }));
  } catch (err) {
    console.error('API fetch error:', err);
    return [];
  }
}


function addTableRow(tbody, cells) {
  const tr = document.createElement('tr');
  cells.forEach((text) => {
    const td = document.createElement('td');
    td.textContent = text;
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
}

function getLocalListings() {
  const rows = [...document.querySelectorAll('#lost-tbody tr, #found-tbody tr')];
  return rows.map((tr) => {
    const cells = tr.querySelectorAll('td');
    return {
      item:     cells[0]?.textContent.trim() || '',
      location: cells[1]?.textContent.trim() || '',
      date:     cells[2]?.textContent.trim() || '',
      contact:  cells[3]?.textContent.trim() || '',
      source:   'local',
    };
  });
}


function displayResults(results) {
  const container = document.getElementById('search-results');

  if (results.length === 0) {
    container.innerHTML = '<p class="msg-warn">No items found matching your search.</p>';
    return;
  }

  const apiCount   = results.filter((r) => r.source === 'api').length;
  const localCount = results.filter((r) => r.source === 'local').length;

  const bannerHtml = `
    <div class="api-banner">
      <span class="api-badge">Live API</span>
      Showing ${results.length} result(s):
      ${localCount} local record(s) + ${apiCount} from JSONPlaceholder API.
    </div>`;

  const rows = results
    .map(
      (r) =>
        `<tr>
          <td>${escapeHtml(r.item)}</td>
          <td>${escapeHtml(r.location)}</td>
          <td>${escapeHtml(r.date)}</td>
          <td>${escapeHtml(r.contact)}</td>
        </tr>`
    )
    .join('');

  container.innerHTML = `
    ${bannerHtml}
    <h3 class="visually-hidden">Search results</h3>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Location</th>
            <th scope="col">Date</th>
            <th scope="col">Contact</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

async function searchItems() {
  const input     = document.getElementById('search-input');
  const container = document.getElementById('search-results');
  const term      = input.value.trim().toLowerCase();

  if (!term) {
    container.innerHTML = '<p class="msg-error">Please enter a search term.</p>';
    return;
  }

  container.innerHTML = '<p class="msg-info"><span class="spinner"></span> Searching…</p>';

  const localItems = getLocalListings();
  const apiItems   = await fetchApiItems();      // real async API call
  const all        = [...localItems, ...apiItems];

  const results = all.filter((r) => r.item.toLowerCase().includes(term));
  displayResults(results);
}


document.getElementById('search-btn').addEventListener('click', searchItems);
document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); searchItems(); }
});

document.getElementById('form-lost').addEventListener('submit', (e) => {
  e.preventDefault();
  const item     = document.getElementById('lost-item').value.trim();
  const location = document.getElementById('lost-location').value.trim();
  const email    = document.getElementById('lost-email').value.trim();
  const date     = document.getElementById('lost-date').value;

  if (!item || !location || !email || !date) {
    showToast('Please fill in all required fields.');
    return;
  }

  addTableRow(document.getElementById('lost-tbody'), [
    item, location, formatShortDate(date) || date, email,
  ]);

  e.target.reset();
  showToast('✓ Lost item added to the list below.');
});

// Report Found form
document.getElementById('form-found').addEventListener('submit', (e) => {
  e.preventDefault();
  const item     = document.getElementById('found-item').value.trim();
  const location = document.getElementById('found-location').value.trim();
  const email    = document.getElementById('found-email').value.trim();
  const date     = document.getElementById('found-date').value;

  if (!item || !location || !email || !date) {
    showToast('Please fill in all required fields.');
    return;
  }

  addTableRow(document.getElementById('found-tbody'), [
    item, location, formatShortDate(date) || date, email,
  ]);

  e.target.reset();
  showToast('✓ Found item added to the list below.');
});

document.getElementById('form-contact').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('contact-name').value.trim();
  e.target.reset();
  showToast(`Thanks, ${name || 'there'} — your message has been received (demo).`);
});

const navToggle = document.querySelector('.nav-toggle');
const navMenu   = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

navMenu.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});
