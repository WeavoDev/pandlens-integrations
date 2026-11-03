import { fetchProperty } from './api.js';
import { injectStyles, mountWidget } from './render.js';

const DEFAULT_BASE = 'https://api.pandlens.nl';

function readScriptOptions(script) {
  return {
    widgetKey: script.getAttribute('data-pandlens-key') || script.getAttribute('data-key') || '',
    lang: script.getAttribute('data-lang') || 'nl',
    accent: script.getAttribute('data-accent') || '',
    apiBase: script.getAttribute('data-api-base') || DEFAULT_BASE,
    mock: script.getAttribute('data-mock') === '1',
    target: script.getAttribute('data-target') || '',
  };
}

function initElement(el, config) {
  if (el.getAttribute('data-pl-init') === '1') return;
  el.setAttribute('data-pl-init', '1');

  const widgetKey =
    el.getAttribute('data-key') || el.getAttribute('data-pandlens-key') || config.widgetKey || '';
  const lang = el.getAttribute('data-lang') || config.lang || 'nl';
  const accent = el.getAttribute('data-accent') || config.accent || '';
  const apiBase = el.getAttribute('data-api-base') || config.apiBase || DEFAULT_BASE;
  const mock = el.getAttribute('data-mock') === '1' || config.mock;

  injectStyles(el.ownerDocument);
  mountWidget(el, {
    lang,
    accent,
    lookup: (parts) => {
      if (mock && window.__PANDLENS_WIDGET_MOCK__) {
        return Promise.resolve({ ok: true, status: 200, body: window.__PANDLENS_WIDGET_MOCK__ });
      }
      return fetchProperty(apiBase, widgetKey, parts);
    },
  });
}

function bootstrap() {
  const script = document.currentScript;
  const scriptConfig = script ? readScriptOptions(script) : {};

  injectStyles(document);

  document.querySelectorAll('pandlens-card').forEach((el) => initElement(el, scriptConfig));

  if (script && scriptConfig.widgetKey && scriptConfig.target) {
    const target = document.querySelector(scriptConfig.target);
    if (target && !target.querySelector('pandlens-card')) {
      const card = document.createElement('pandlens-card');
      card.setAttribute('data-key', scriptConfig.widgetKey);
      if (scriptConfig.lang) card.setAttribute('data-lang', scriptConfig.lang);
      if (scriptConfig.accent) card.setAttribute('data-accent', scriptConfig.accent);
      if (scriptConfig.mock) card.setAttribute('data-mock', '1');
      target.appendChild(card);
      initElement(card, scriptConfig);
    }
  }
}

class PandlensCardElement extends HTMLElement {
  connectedCallback() {
    initElement(this, {});
  }
}

if (!customElements.get('pandlens-card')) {
  customElements.define('pandlens-card', PandlensCardElement);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

export { fetchProperty, mountWidget, injectStyles };
