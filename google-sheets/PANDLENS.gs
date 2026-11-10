/**
 * Return one Pandlens field for a single Dutch address.
 *
 * Example (Dutch locale): =PANDLENS("6101DB"; 19; "energyLabel_labelClass")
 * Example (US locale):    =PANDLENS("6101DB", 19, "energyLabel_labelClass")
 *
 * Optional 4th/5th arguments: house letter and suffix (toevoeging).
 * Each formula call performs at most one API lookup (cached per spreadsheet).
 */
function PANDLENS(postcode, huisnummer, field, huisletter, toevoeging) {
  if (postcode === '' || postcode === null || postcode === undefined) {
    return '';
  }
  if (huisnummer === '' || huisnummer === null || huisnummer === undefined) {
    return '';
  }
  if (field === '' || field === null || field === undefined) {
    return '';
  }

  try {
    var body = pandlensFetchEnrichment(postcode, huisnummer, huisletter, toevoeging);
    var flat = pandlensFlattenEnrichment(body);
    return pandlensResolveField(flat, field);
  } catch (err) {
    return '#PANDLENS! ' + (err && err.message ? err.message : String(err));
  }
}
