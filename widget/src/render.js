import { buildPropertyCardModel, widgetMessages } from '../../shared/property-card.js';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyTheme(host, accent) {
  if (accent) {
    host.style.setProperty('--pl-accent', accent);
  }
}

export function mountWidget(host, options) {
  const lang = options.lang || 'nl';
  const messages = widgetMessages(lang);
  applyTheme(host, options.accent);

  host.classList.add('pl-widget');
  host.innerHTML = `
    <form class="pl-widget__form" novalidate>
      <div class="pl-widget__fields">
        <label class="pl-widget__field">
          <span>${escapeHtml(messages.postcode)}</span>
          <input type="text" name="postcode" autocomplete="postal-code" required class="pl-widget__postcode" />
        </label>
        <label class="pl-widget__field">
          <span>${escapeHtml(messages.houseNumber)}</span>
          <input type="text" name="huisnummer" inputmode="numeric" required class="pl-widget__huisnummer" />
        </label>
        <label class="pl-widget__field pl-widget__field--optional">
          <span>${escapeHtml(messages.suffix)}</span>
          <input type="text" name="toevoeging" class="pl-widget__toevoeging" />
        </label>
      </div>
      <button type="submit" class="pl-widget__submit">${escapeHtml(messages.lookup)}</button>
    </form>
    <div class="pl-widget__status" role="status" aria-live="polite"></div>
    <div class="pl-widget__candidates" hidden></div>
    <div class="pl-widget__card" hidden></div>
    <p class="pl-widget__credit">${escapeHtml(messages.credit)}</p>
  `;

  const form = host.querySelector('.pl-widget__form');
  const statusEl = host.querySelector('.pl-widget__status');
  const cardEl = host.querySelector('.pl-widget__card');
  const candidatesEl = host.querySelector('.pl-widget__candidates');

  function setStatus(text, type) {
    statusEl.textContent = text || '';
    statusEl.className = 'pl-widget__status' + (type ? ` pl-widget__status--${type}` : '');
  }

  function renderCardModel(model) {
    let energyHtml = '';
    if (model.energy) {
      const badge =
        model.energy.kind === 'estimate'
          ? `<span class="pl-widget__badge">${escapeHtml(model.energy.kindLabel)}</span>`
          : '';
      energyHtml = `
        <div class="pl-widget__energy">
          <span class="pl-widget__energy-label">${escapeHtml(model.energy.label)}</span>
          <span class="pl-widget__energy-value" aria-label="${escapeHtml(model.energy.kindLabel)}">${escapeHtml(model.energy.value)}</span>
          ${badge}
        </div>`;
    }

    const facts = model.facts
      .map(
        (row) =>
          `<div class="pl-widget__fact"><dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(row.value)}</dd></div>`,
      )
      .join('');

    const verdicts = model.verdicts
      .map(
        (row) =>
          `<li><strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.text)}</li>`,
      )
      .join('');

    const buurt = model.neighbourhood
      .map(
        (row) =>
          `<div class="pl-widget__fact"><dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(row.value)}</dd></div>`,
      )
      .join('');

    cardEl.innerHTML = `
      <article class="pl-widget__card-inner">
        <header>
          <h2 class="pl-widget__title">${escapeHtml(model.title)}</h2>
          ${model.subtitle ? `<p class="pl-widget__subtitle">${escapeHtml(model.subtitle)}</p>` : ''}
        </header>
        ${energyHtml}
        <dl class="pl-widget__facts">${facts}</dl>
        ${
          verdicts
            ? `<section class="pl-widget__verdicts"><h3 class="pl-widget__section-title">${escapeHtml(messages.solar)} / ${escapeHtml(messages.insulation)}</h3><ul>${verdicts}</ul></section>`
            : ''
        }
        ${
          buurt
            ? `<section class="pl-widget__buurt"><h3 class="pl-widget__section-title">${escapeHtml(messages.neighbourhood)}</h3><dl class="pl-widget__facts">${buurt}</dl></section>`
            : ''
        }
      </article>`;
    cardEl.hidden = false;
  }

  function renderCandidates(candidates, onPick) {
    candidatesEl.innerHTML = '';
    if (!candidates || !candidates.length) {
      candidatesEl.hidden = true;
      return;
    }
    const intro = document.createElement('p');
    intro.textContent = messages.ambiguous;
    candidatesEl.appendChild(intro);
    candidates.forEach((candidate) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pl-widget__candidate';
      const parts = [];
      if (candidate.huisletter) parts.push(candidate.huisletter);
      if (candidate.toevoeging) parts.push(candidate.toevoeging);
      btn.textContent = parts.length ? parts.join(' / ') : '—';
      btn.addEventListener('click', () => onPick(candidate));
      candidatesEl.appendChild(btn);
    });
    candidatesEl.hidden = false;
  }

  async function runLookup(parts) {
    setStatus(messages.loading, 'info');
    cardEl.hidden = true;
    renderCandidates([], () => {});

    const result = await options.lookup(parts);
    if (result.ok && result.body) {
      setStatus('', '');
      renderCardModel(buildPropertyCardModel(result.body, { lang }));
      return;
    }

    const code = result.body && (result.body.error || result.body.code);
    if (code === 'address_ambiguous' && result.body.candidates) {
      renderCandidates(result.body.candidates, (candidate) => {
        runLookup({
          ...parts,
          huisletter: candidate.huisletter || parts.huisletter,
          toevoeging: candidate.toevoeging || parts.toevoeging,
        });
      });
      setStatus('', '');
      return;
    }

    let message = messages.notFound;
    if (code === 'rate_limit_exceeded' || result.status === 429) message = messages.rateLimit;
    else if (code === 'monthly_quota_exceeded' || result.status === 402) message = messages.quota;
    else if (code === 'invalid_widget_key' || result.status === 401) message = messages.unauthorized;
    else if (code === 'origin_not_allowed' || result.status === 403) message = messages.origin;
    setStatus(message, 'error');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    runLookup({
      postcode: data.get('postcode'),
      huisnummer: data.get('huisnummer'),
      toevoeging: data.get('toevoeging'),
    });
  });
}

export function injectStyles(doc) {
  if (doc.getElementById('pandlens-widget-styles')) return;
  const style = doc.createElement('style');
  style.id = 'pandlens-widget-styles';
  style.textContent = `
.pl-widget{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--pl-text,#1a1a1a);max-width:28rem;line-height:1.45}
.pl-widget__fields{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem}
.pl-widget__field{display:flex;flex-direction:column;gap:.25rem;font-size:.875rem}
.pl-widget__field--optional{grid-column:1/-1}
.pl-widget input{border:1px solid #c8c8c8;border-radius:.375rem;padding:.5rem .625rem;font:inherit}
.pl-widget input:focus{outline:2px solid var(--pl-accent,#0b5fff);outline-offset:1px}
.pl-widget__submit{background:var(--pl-accent,#0b5fff);color:#fff;border:0;border-radius:.375rem;padding:.625rem 1rem;font:inherit;cursor:pointer;width:100%}
.pl-widget__submit:focus-visible{outline:2px solid #000;outline-offset:2px}
.pl-widget__status{min-height:1.25rem;font-size:.875rem;margin:.25rem 0}
.pl-widget__status--error{color:#b00020}
.pl-widget__card-inner{border:1px solid #e2e2e2;border-radius:.5rem;padding:1rem;background:var(--pl-bg,#fff);margin-top:.75rem}
.pl-widget__title{font-size:1.125rem;margin:0 0 .25rem}
.pl-widget__subtitle{margin:0;color:#555;font-size:.875rem}
.pl-widget__energy{display:flex;align-items:center;gap:.5rem;margin:.75rem 0}
.pl-widget__energy-value{font-size:1.75rem;font-weight:700;color:var(--pl-accent,#0b5fff)}
.pl-widget__badge{font-size:.75rem;background:#fff3cd;border:1px solid #ffecb5;border-radius:999px;padding:.125rem .5rem}
.pl-widget__facts{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin:0}
.pl-widget__fact dt{font-size:.75rem;color:#555;margin:0}
.pl-widget__fact dd{margin:0;font-weight:600}
.pl-widget__section-title{font-size:.875rem;margin:1rem 0 .25rem}
.pl-widget__verdicts ul{margin:0;padding-left:1.1rem;font-size:.875rem}
.pl-widget__candidate{display:block;width:100%;text-align:left;margin:.25rem 0;padding:.5rem;border:1px solid #ddd;border-radius:.375rem;background:#fafafa;cursor:pointer}
.pl-widget__credit{font-size:.75rem;color:#666;margin-top:.75rem}
`;
  doc.head.appendChild(style);
}
