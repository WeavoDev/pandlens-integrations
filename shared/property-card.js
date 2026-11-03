'use strict';

const CREDIT = {
  nl: 'Pandlens combineert open data onder CC BY 4.0.',
  en: 'Pandlens combines open data under CC BY 4.0.',
};

const MESSAGES = {
  nl: {
    buildYear: 'Bouwjaar',
    floorArea: 'Woonoppervlakte',
    use: 'Gebruik',
    energyLabel: 'Energielabel',
    registered: 'Geregistreerd label',
    estimate: 'Geschat label',
    neighbourhood: 'Buurt',
    avgWoz: 'Gemiddelde WOZ',
    wozYear: 'peiljaar',
    yoy: 'WOZ jaar-op-jaar',
    solar: 'Zonnepanelen',
    insulation: 'Isolatie',
    solarYes: 'Waarschijnlijk aanwezig',
    solarNo: 'Geen indicatie op het dak',
    insulationGood: 'Redelijk tot goed geïsoleerd (indicatie)',
    insulationPoor: 'Mogelijk matige isolatie (indicatie)',
    insulationUnknown: 'Geen isolatie-indicatie',
    lookup: 'Zoek woning',
    postcode: 'Postcode',
    houseNumber: 'Huisnummer',
    suffix: 'Toevoeging (optioneel)',
    loading: 'Bezig met opzoeken…',
    notFound: 'Adres niet gevonden. Controleer postcode en huisnummer.',
    ambiguous: 'Meerdere adressen gevonden. Kies de juiste toevoeging:',
    rateLimit: 'Te veel verzoeken. Probeer het later opnieuw.',
    quota: 'Maandlimiet bereikt.',
    unauthorized: 'Widget is niet beschikbaar. Controleer de widget-sleutel.',
    origin: 'Deze site mag de widget niet gebruiken.',
  },
  en: {
    buildYear: 'Build year',
    floorArea: 'Floor area',
    use: 'Use',
    energyLabel: 'Energy label',
    registered: 'Registered label',
    estimate: 'Estimated label',
    neighbourhood: 'Neighbourhood',
    avgWoz: 'Average WOZ value',
    wozYear: 'reference year',
    yoy: 'WOZ year on year',
    solar: 'Solar panels',
    insulation: 'Insulation',
    solarYes: 'Likely present',
    solarNo: 'No indication on the roof',
    insulationGood: 'Likely reasonable insulation (indicative)',
    insulationPoor: 'May have limited insulation (indicative)',
    insulationUnknown: 'No insulation indication',
    lookup: 'Look up property',
    postcode: 'Postcode',
    houseNumber: 'House number',
    suffix: 'Suffix (optional)',
    loading: 'Looking up property…',
    notFound: 'Address not found. Check postcode and house number.',
    ambiguous: 'Multiple matches. Choose the correct suffix:',
    rateLimit: 'Too many requests. Please try again later.',
    quota: 'Monthly lookup limit reached.',
    unauthorized: 'Widget unavailable. Check the widget key.',
    origin: 'This site is not allowed to use the widget.',
  },
};

function normalizeLang(lang) {
  return String(lang || 'nl').toLowerCase().startsWith('en') ? 'en' : 'nl';
}

function t(lang, key) {
  const bucket = MESSAGES[normalizeLang(lang)] || MESSAGES.nl;
  return bucket[key] || key;
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function pickString(obj, key) {
  if (!obj || obj[key] == null) return null;
  const value = String(obj[key]).trim();
  return value === '' ? null : value;
}

function pickInt(obj, key) {
  if (!obj || obj[key] == null || !Number.isFinite(Number(obj[key]))) return null;
  return Math.round(Number(obj[key]));
}

function formatEuro(amount, lang) {
  if (amount == null || !Number.isFinite(Number(amount))) return null;
  const locale = normalizeLang(lang) === 'en' ? 'en-GB' : 'nl-NL';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatPercent(value, lang) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  const locale = normalizeLang(lang) === 'en' ? 'en-GB' : 'nl-NL';
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Number(value))}%`;
}

function resolveEnergy(payload) {
  const energy = asObject(payload.energyLabel);
  const derivedEnergy = asObject(asObject(payload.derived)?.energy);
  const derivedLabel = asObject(derivedEnergy?.labelClass);

  const registered = pickString(energy, 'labelClass');
  if (registered) {
    return {
      value: registered,
      kind: 'registered',
      badge: null,
    };
  }

  const estimatedValue = pickString(derivedLabel, 'value');
  const status = pickString(derivedLabel, 'status');
  if (estimatedValue && status && status !== 'observed') {
    return {
      value: estimatedValue,
      kind: 'estimate',
      badge: 'estimate',
    };
  }

  return null;
}

function resolveVerdicts(payload, lang) {
  const verdicts = [];
  const derived = asObject(payload.derived);
  const installation = asObject(derived?.installation);

  const solarFromApi = pickString(installation, 'solarVerdict') || pickString(installation, 'solar');
  const insulationFromApi =
    pickString(installation, 'insulationVerdict') || pickString(installation, 'insulation');

  if (solarFromApi) {
    verdicts.push({ id: 'solar', label: t(lang, 'solar'), text: solarFromApi });
  } else {
    const building3d = asObject(payload.building3d);
    if (building3d && typeof building3d.zonnepanelen === 'boolean') {
      verdicts.push({
        id: 'solar',
        label: t(lang, 'solar'),
        text: building3d.zonnepanelen ? t(lang, 'solarYes') : t(lang, 'solarNo'),
      });
    }
  }

  if (insulationFromApi) {
    verdicts.push({ id: 'insulation', label: t(lang, 'insulation'), text: insulationFromApi });
  } else {
    const ageCategory = pickString(asObject(derived?.property)?.ageCategory, 'value');
    if (ageCategory === 'modern_insulated') {
      verdicts.push({
        id: 'insulation',
        label: t(lang, 'insulation'),
        text: t(lang, 'insulationGood'),
      });
    } else if (ageCategory === 'pre_1945_uninsulated' || ageCategory === 'legacy_poor') {
      verdicts.push({
        id: 'insulation',
        label: t(lang, 'insulation'),
        text: t(lang, 'insulationPoor'),
      });
    }
  }

  return verdicts;
}

/**
 * @param {Record<string, unknown>} payload Pandlens address enrichment JSON
 * @param {{ lang?: string }} [options]
 */
function buildPropertyCardModel(payload, options = {}) {
  const lang = normalizeLang(options.lang);
  const address = asObject(payload.address) || {};
  const bag = asObject(payload.bag) || {};
  const verblijf = asObject(bag.verblijfsobject) || {};
  const pand = asObject(bag.pand) || {};
  const neighbourhood = asObject(payload.neighbourhood) || {};
  const derived = asObject(payload.derived) || {};
  const derivedWoz = asObject(derived.woz) || {};

  const street =
    pickString(address, 'straat') || pickString(verblijf, 'openbareRuimteNaam') || '';
  const city =
    pickString(address, 'woonplaats') || pickString(verblijf, 'woonplaatsNaam') || '';
  const postcode = pickString(address, 'postcode') || '';
  const huisnummer = address.huisnummer != null ? String(address.huisnummer) : '';

  const buildYear = pickInt(pand, 'bouwjaar') || pickInt(asObject(payload.energyLabel), 'constructionYear');
  const floorArea = pickInt(verblijf, 'oppervlakteM2');
  const use = pickString(verblijf, 'gebruiksdoel');

  const energy = resolveEnergy(payload);
  const verdicts = resolveVerdicts(payload, lang);

  const wozValue = pickInt(neighbourhood, 'gemiddeldeWozWaardeEur');
  const wozYear = pickInt(neighbourhood, 'wozPeiljaar');
  const yoy = asObject(derivedWoz.buurtYoYPercent)?.value;

  const buurtLines = [];
  const areaName =
    pickString(neighbourhood, 'buurtnaam') ||
    pickString(neighbourhood, 'wijknaam') ||
    pickString(neighbourhood, 'gemeentenaam');
  if (areaName) {
    buurtLines.push({ label: t(lang, 'neighbourhood'), value: areaName });
  }
  if (wozValue != null) {
    const formatted = formatEuro(wozValue, lang);
    const yearSuffix = wozYear != null ? ` (${t(lang, 'wozYear')} ${wozYear})` : '';
    buurtLines.push({
      label: t(lang, 'avgWoz'),
      value: `${formatted}${yearSuffix}`,
    });
  }
  const yoyFormatted = formatPercent(yoy, lang);
  if (yoyFormatted) {
    buurtLines.push({ label: t(lang, 'yoy'), value: yoyFormatted });
  }

  const facts = [];
  if (buildYear != null) {
    facts.push({ label: t(lang, 'buildYear'), value: String(buildYear) });
  }
  if (floorArea != null) {
    facts.push({ label: t(lang, 'floorArea'), value: `${floorArea} m²` });
  }
  if (use) {
    facts.push({ label: t(lang, 'use'), value: use });
  }

  const titleParts = [street, huisnummer].filter(Boolean).join(' ');
  const subtitle = [postcode, city].filter(Boolean).join(' · ');

  return {
    lang,
    title: titleParts || subtitle || '—',
    subtitle: titleParts ? subtitle : '',
    facts,
    energy: energy
      ? {
          label: t(lang, 'energyLabel'),
          value: energy.value,
          kind: energy.kind,
          kindLabel:
            energy.kind === 'estimate' ? t(lang, 'estimate') : t(lang, 'registered'),
        }
      : null,
    verdicts,
    neighbourhood: buurtLines,
    credit: CREDIT[lang] || CREDIT.nl,
  };
}

function widgetMessages(lang) {
  const code = normalizeLang(lang);
  return { ...MESSAGES[code], credit: CREDIT[code] };
}

module.exports = {
  buildPropertyCardModel,
  widgetMessages,
  normalizeLang,
  CREDIT,
};
