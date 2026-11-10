/** Pandlens Google Sheets add-on — configuration (API key in UserProperties). */

var PANDLENS_API_BASE = 'https://api.pandlens.nl';
var PANDLENS_USER_API_KEY = 'PANDLENS_API_KEY';
/** Cache full enrichment payloads per address (seconds). */
var PANDLENS_CACHE_TTL_SEC = 21600;
/** Minimum milliseconds between live API calls in this spreadsheet session. */
var PANDLENS_MIN_INTERVAL_MS = 250;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Pandlens')
    .addItem('Set API key…', 'pandlensShowSetApiKeyDialog')
    .addItem('Clear cached lookups', 'pandlensClearCache')
    .addItem('About / data credit', 'pandlensShowAbout')
    .addToUi();
}

function pandlensShowSetApiKeyDialog() {
  var ui = SpreadsheetApp.getUi();
  var current = pandlensGetApiKey() ? '(saved — leave blank to keep)' : '';
  var response = ui.prompt(
    'Pandlens API key',
  'Paste your Pandlens API key from https://pandlens.nl/en/signup . ' +
      current + '\nThe key is stored in your user properties (not in the sheet).',
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  var key = String(response.getResponseText() || '').trim();
  if (!key) {
    return;
  }
  PropertiesService.getUserProperties().setProperty(PANDLENS_USER_API_KEY, key);
  ui.alert('Pandlens API key saved for your account.');
}

function pandlensGetApiKey() {
  return PropertiesService.getUserProperties().getProperty(PANDLENS_USER_API_KEY) || '';
}

function pandlensShowAbout() {
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    'Pandlens for Google Sheets',
    'Each =PANDLENS() call looks up one Dutch address (postcode + house number).\n\n' +
      'Neighbourhood statistics include data from Statistics Netherlands (CBS), ' +
      'licensed under CC BY 4.0.\n\n' +
      'Documentation: https://github.com/WeavoDev/pandlens-integrations/tree/main/google-sheets',
    ui.ButtonSet.OK
  );
}

function pandlensClearCache() {
  var docProps = PropertiesService.getDocumentProperties();
  var next = String(Number(docProps.getProperty('PANDLENS_CACHE_GEN') || '0') + 1);
  docProps.setProperty('PANDLENS_CACHE_GEN', next);
  SpreadsheetApp.getActiveSpreadsheet().toast('Pandlens address cache cleared for this spreadsheet.');
}
