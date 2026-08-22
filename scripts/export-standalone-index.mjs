import { writeFile } from "node:fs/promises";

// Point this at a running dev/prod server: `npm run dev` (or `npm start`).
const origin = process.env.ORQESTRON_ORIGIN ?? "http://127.0.0.1:3000";

async function fetchSource(pathname) {
  const url = new URL(pathname, origin);
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error(`${url} responded ${response.status}`);
    return response.text();
  });
}

async function inlineStyles(source) {
  const hrefs = [...source.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)]
    .map((tag) => tag[0].match(/href="([^"]+)"/)?.[1])
    .filter((href) => href && !href.startsWith("http"));
  if (!hrefs.length) throw new Error("Could not find any stylesheet on the page.");
  return (
    await Promise.all(
      hrefs.map((href) =>
        fetch(new URL(href, origin)).then((response) => {
          if (!response.ok) throw new Error(`${href} responded ${response.status}`);
          return response.text();
        }),
      ),
    )
  ).join("\n");
}

// Take the rendered markup and drop the framework's hydration payload —
// this file ships its own vanilla script instead.
function extractBody(source) {
  const rendered = source.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1];
  if (!rendered) throw new Error("Could not extract the rendered page.");
  return rendered
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<template[\s\S]*?<\/template>/g, "")
    .trim();
}

const source = await fetchSource("/");
const css = await inlineStyles(source);
const body = extractBody(source);

const standaloneBody = body
  .replaceAll('href="/transactions"', 'href="transactions.html"')
  .replaceAll('href="/forms/', 'href="public/forms/')
  .replaceAll('src="/forms/', 'src="public/forms/')
  .replaceAll('src="/form-pages/', 'src="public/form-pages/')
  .replaceAll('src="/form-thumbnails/', 'src="public/form-thumbnails/');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Orqestron — Form Editor</title>
  <style>${css}</style>
</head>
<body>${standaloneBody}
<script>
document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    button.animate([{transform:'scale(.98)'},{transform:'scale(1)'}], {duration:140});
  });
});
function showNotice(message) {
  document.querySelector('.oq-toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'oq-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = '<span></span><button aria-label="Dismiss notification">×</button>';
  toast.querySelector('span').textContent = message;
  toast.querySelector('button').addEventListener('click', () => toast.remove());
  document.querySelector('.oq-editor').appendChild(toast);
}
function showPartyModal() {
  document.querySelector('.oq-party-backdrop')?.remove();
  const backdrop = document.createElement('div');
  backdrop.className = 'oq-party-backdrop';
  backdrop.innerHTML = '<section class="oq-party-modal" role="dialog" aria-modal="true"><header><b>Add Party</b><button aria-label="Close Add Party">×</button></header><div class="oq-party-scroll"><div class="oq-party-profile"><span>♙</span><div><h2>New Contact</h2><button>Upload photo</button></div></div><label>Transaction role(s)<select><option>Buyer 2</option><option>Buyer 1</option><option>Seller</option></select></label><label class="oq-party-invite"><input type="checkbox"> Invite to transaction <small>?</small></label><h3>Buyer Information</h3><label>Buyer entity type *<select><option>Please select type</option><option>Individual</option><option>Company</option><option>Trust</option></select></label><div class="oq-party-grid"><label>First name *<input></label><label>Last name<input></label></div><label>Title<input placeholder="ex. Principal"></label><div class="oq-party-grid"><label>Email<input type="email"></label><label>Phone number<input placeholder="(   )   -"></label></div><label>Fax number<input placeholder="(   )   -"></label><label>Buyer’s mailing address</label><div class="oq-party-grid"><input placeholder="Street address"><input placeholder="Unit #"></div><div class="oq-party-address"><input placeholder="City"><input placeholder="State"><input placeholder="Zip Code"></div></div><footer><button class="party-cancel">Cancel</button><button class="primary party-save">Save</button></footer></section>';
  const close = () => backdrop.remove();
  backdrop.querySelector('[aria-label="Close Add Party"]').addEventListener('click', close);
  backdrop.querySelector('.party-cancel').addEventListener('click', close);
  backdrop.querySelector('.party-save').addEventListener('click', close);
  backdrop.addEventListener('mousedown', (event) => { if (event.target === backdrop) close(); });
  document.querySelector('.oq-editor').appendChild(backdrop);
}
function staticFieldSuggestions(field) {
  const key = ((field.title || '') + ' ' + (field.getAttribute('aria-label') || '')).toLowerCase();
  if (field.dataset.fieldKind === 'date') return ['2026-08-18', '2026-08-31', '2026-09-17'];
  if (key.includes('dre_lic') || key.includes('dre lic')) return ['01914832', '01234567'];
  if (key.includes('e-mail') || key.includes('email')) return ['vu.nguyen@c0x12c.com', 'landaverderm@yahoo.com'];
  if (key.includes('phone') || key.includes('tel')) return ['8186747721', '3105550198'];
  if (key.includes('zip')) return ['90026', '91316'];
  if (key.includes('state')) return ['CA'];
  if (key.includes('county')) return ['LOS ANGELES', 'ORANGE', 'VENTURA'];
  if (key.includes('city')) return ['Los Angeles', 'Encino', 'Burbank'];
  if (key.includes('address')) return ['2458 Maplewood Ave 12B', '17327 Ventura Blvd'];
  if (key.includes('firm')) return ['Pinnacle Estate Properties, Inc.', 'Acme Realty'];
  if (key.includes('agent')) return ['Vu Nguyen', 'Marlene Sykes'];
  if (key.includes('buyer') || key.includes('signer') || key.includes('name')) return ['Ariya Anna', 'Vu Nguyen'];
  if (key.includes('property')) return ['2458 Maplewood Ave 12B', '17327 Ventura Blvd'];
  if (key.includes('compensation') && key.includes('percent')) return ['3'];
  if (key.includes('compensation') || key.includes('amount')) return ['24,600'];
  return [];
}
function staticDisplayFieldValue(kind, value) {
  if (kind !== 'date') return value;
  const match = value.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
  return match ? match[2] + '/' + match[3] + '/' + match[1] : value;
}
function showFieldPopover(field) {
  document.querySelector('.oq-field-popover')?.remove();
  const stage = field.closest('.oq-pdf-stage');
  if (!stage) return;
  const kind = field.dataset.fieldKind || 'text';
  const code = field.dataset.documentCode || (stage.dataset.page || '').split('-')[0];
  const page = (stage.dataset.page || '').split('-').pop();
  const label = field.title || 'Form field';
  const existing = field.dataset.fieldValue || field.querySelector(':scope > span')?.textContent || '';
  const popover = document.createElement('form');
  popover.className = 'oq-field-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Fill ' + label);
  popover.innerHTML = '<header><div><small></small><h3></h3></div><button type="button" aria-label="Close field editor">×</button></header><label><span></span><input></label><div class="oq-field-suggestions" aria-label="Suggested values"><small>Linked field values</small></div><p></p><footer><small></small><span><button type="button" class="field-cancel">Cancel</button><button type="submit" class="primary">Apply</button></span></footer>';
  popover.querySelector('header small').textContent = code + ' · PAGE ' + page;
  popover.querySelector('h3').textContent = label;
  popover.querySelector('label > span').textContent = kind === 'signature' ? 'Signer name' : 'Value';
  const input = popover.querySelector('input');
  input.type = kind === 'date' ? 'date' : 'text';
  input.value = existing;
  input.maxLength = kind === 'text' ? 120 : 524288;
  input.placeholder = kind === 'signature' ? 'Enter the signer’s full name' : 'Enter ' + label.toLowerCase();
  const suggestions = staticFieldSuggestions(field);
  const suggestionsNode = popover.querySelector('.oq-field-suggestions');
  if (!suggestions.length) suggestionsNode.remove();
  else suggestions.forEach((value, index) => {
    const badges = [
      ['From Transaction Details', 'transaction'],
      ['Updated by AI', 'ai'],
      ['Synced across 3 forms', 'synced']
    ];
    const badge = badges[Math.min(index, badges.length - 1)];
    const option = document.createElement('button');
    option.type = 'button';
    option.innerHTML = '<span></span><em class="oq-provenance-badge ' + badge[1] + '"></em>';
    option.querySelector('span').textContent = staticDisplayFieldValue(kind, value);
    option.querySelector('em').textContent = badge[0];
    option.addEventListener('click', () => { input.value = value; updateCount(); input.focus(); });
    suggestionsNode.appendChild(option);
  });
  const note = popover.querySelector('p');
  if (kind === 'signature') note.textContent = 'The typed name will be placed here. Final signatures are collected with Sign.';
  else note.remove();
  const count = popover.querySelector('footer > small');
  const updateCount = () => { count.textContent = input.value.length + (kind === 'text' ? ' / 120 characters' : ' characters'); };
  updateCount();
  input.addEventListener('input', updateCount);
  const top = parseFloat(field.style.top || '0');
  const height = parseFloat(field.style.height || '0');
  const left = parseFloat(field.style.left || '0');
  popover.style.top = (top > 68 ? top : top + height) + '%';
  popover.style.transform = top > 68 ? 'translateY(calc(-100% - 8px))' : 'translateY(8px)';
  if (left > 48) popover.style.right = '2%';
  else popover.style.left = Math.max(2, left) + '%';
  const close = () => popover.remove();
  popover.querySelector('[aria-label="Close field editor"]').addEventListener('click', close);
  popover.querySelector('.field-cancel').addEventListener('click', close);
  popover.addEventListener('click', (event) => event.stopPropagation());
  popover.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  popover.addEventListener('submit', (event) => {
    event.preventDefault();
    let valueNode = field.querySelector(':scope > span');
    if (!valueNode) { valueNode = document.createElement('span'); field.appendChild(valueNode); }
    field.dataset.fieldValue = input.value.trim();
    valueNode.textContent = staticDisplayFieldValue(kind, input.value.trim());
    field.classList.toggle('has-value', Boolean(input.value.trim()));
    close();
  });
  stage.appendChild(popover);
  requestAnimationFrame(() => input.focus());
}
document.querySelectorAll('.oq-pdf-field').forEach((field) => field.addEventListener('click', () => {
  if (field.classList.contains('is-checkbox')) {
    document.querySelector('.oq-field-popover')?.remove();
    field.classList.toggle('checked');
  } else showFieldPopover(field);
}));
const gripIcon = '<svg class="fe-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="8" cy="6" r="1"></circle><circle cx="16" cy="6" r="1"></circle><circle cx="8" cy="12" r="1"></circle><circle cx="16" cy="12" r="1"></circle><circle cx="8" cy="18" r="1"></circle><circle cx="16" cy="18" r="1"></circle></svg>';
const fileIcon = '<svg class="fe-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 3h11l3 3v15H5Z"></path><path d="M9 13h6M9 17h4"></path></svg>';
const closeIcon = '<svg class="fe-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 5l14 14M19 5L5 19"></path></svg>';
function createDocumentRow(name, status) {
  const item = document.createElement('div');
  item.className = 'oq-doc-row';
  item.draggable = true;
  item.tabIndex = 0;
  item.setAttribute('role', 'button');
  item.innerHTML = '<span class="oq-drag-handle" title="Drag to reorder">' + gripIcon + '</span><span class="oq-file-icon">' + fileIcon + '</span><div><b></b><small></small></div><button aria-label="Remove document">' + closeIcon + '</button>';
  item.querySelector('b').textContent = name;
  item.querySelector('small').textContent = status;
  item.querySelector('button').setAttribute('aria-label', 'Remove ' + name);
  item.querySelector('button').addEventListener('click', () => { item.remove(); updateCount(); });
  return item;
}
const documentSearch = document.querySelector('[aria-label="Search transaction documents"]');
documentSearch?.addEventListener('input', () => {
  document.querySelectorAll('.oq-doc-row').forEach((row) => row.style.display = row.textContent.toLowerCase().includes(documentSearch.value.toLowerCase()) ? '' : 'none');
});
document.querySelector('.oq-dropzone input')?.addEventListener('change', (event) => {
  Array.from(event.target.files || []).forEach((file) => {
    document.querySelector('.oq-doc-list').appendChild(createDocumentRow(file.name, 'Uploaded file'));
  });
  updateCount();
});
document.querySelectorAll('.oq-available-row > button').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.disabled) return;
    const row = button.closest('.oq-available-row');
    const name = row.querySelector('b').textContent;
    const list = document.querySelector('.oq-doc-list');
    list.appendChild(createDocumentRow(name, 'PDF form'));
    row.remove();
    updateCount();
  });
});
function updateCount() {
  const count = document.querySelectorAll('.oq-doc-list .oq-doc-row').length;
  const label = document.querySelector('.oq-doc-meta small');
  if (label) label.textContent = count + ' items';
}
let draggedDocument = null;
document.addEventListener('dragstart', (event) => {
  const row = event.target.closest('.oq-doc-row');
  if (row) { draggedDocument = row; row.classList.add('dragging'); }
});
document.addEventListener('dragover', (event) => {
  if (event.target.closest('.oq-doc-row')) event.preventDefault();
});
document.addEventListener('drop', (event) => {
  const target = event.target.closest('.oq-doc-row');
  if (target && draggedDocument && target !== draggedDocument) {
    const box = target.getBoundingClientRect();
    target.parentNode.insertBefore(draggedDocument, event.clientY < box.top + box.height / 2 ? target : target.nextSibling);
  }
  if (draggedDocument) draggedDocument.classList.remove('dragging');
  draggedDocument = null;
});

// The canvas is a continuous scroll of every page. Nothing swaps image
// sources any more — navigation is scrolling, and the toolbar just reports
// whichever page is currently nearest the top of the canvas.
const canvas = document.querySelector('.fe-canvas');
const stages = Array.from(document.querySelectorAll('.oq-pdf-stage'));
const railButtons = Array.from(document.querySelectorAll('.oq-page-rail > div > button'));
const titleNode = document.querySelector('.fe-title');
const counters = document.querySelectorAll('.oq-zoom > span');
const docTitles = {
  AD: '[AD] Disclosure Regarding Real Estate Agency Relationship (Buyer)',
  BRBC: '[BRBC] Buyer Representation and Broker Compensation Agreement',
  PRBS: '[PRBS] Possible Representation of More Than One Buyer or Seller'
};
const pageMeta = stages.map((stage) => {
  const key = stage.dataset.page || '';
  const dash = key.lastIndexOf('-');
  return { stage, key, label: key.slice(0, dash), page: Number(key.slice(dash + 1)) };
});
const pageCount = pageMeta.reduce((acc, item) => {
  acc[item.label] = (acc[item.label] || 0) + 1;
  return acc;
}, {});
let titleEdited = false;

function setActiveDocument(label) {
  document.querySelectorAll('.oq-doc-list .oq-doc-row').forEach((row) => {
    const name = row.querySelector('b')?.textContent || '';
    const active = name.indexOf('[' + label + ']') === 0;
    row.classList.toggle('active', active);
    row.setAttribute('aria-current', active ? 'true' : 'false');
    const status = row.querySelector('small');
    if (status && status.textContent !== 'Uploaded file') {
      status.textContent = active ? 'Currently open · PDF form' : 'PDF form';
    }
  });
}

let current = null;
function syncActivePage() {
  if (!canvas || !pageMeta.length) return;
  const canvasTop = canvas.getBoundingClientRect().top;
  let closest = pageMeta[0];
  let smallest = Infinity;
  pageMeta.forEach((item) => {
    const distance = Math.abs(item.stage.getBoundingClientRect().top - canvasTop - 16);
    if (distance < smallest) { smallest = distance; closest = item; }
  });
  if (current === closest.key) return;
  current = closest.key;
  railButtons.forEach((button, index) => button.classList.toggle('active', pageMeta[index] === closest));
  const railList = document.querySelector('.oq-page-rail > div');
  const activeThumb = railList?.querySelector('button.active');
  if (railList && activeThumb) {
    railList.scrollTo({ top: activeThumb.offsetTop - railList.clientHeight / 2 + activeThumb.offsetHeight / 2, behavior: 'smooth' });
  }
  if (counters[0]) counters[0].textContent = closest.page;
  if (counters[1]) counters[1].textContent = pageCount[closest.label] || 1;
  if (titleNode && !titleEdited) {
    titleNode.childNodes[0].textContent = docTitles[closest.label] || closest.label;
  }
  setActiveDocument(closest.label);
}

let scrollFrame = 0;
canvas?.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; syncActivePage(); });
}, { passive: true });

railButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    pageMeta[index]?.stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelector('.oq-doc-list')?.addEventListener('click', (event) => {
  if (event.target.closest('button[aria-label^="Remove"]')) return;
  const row = event.target.closest('.oq-doc-row');
  if (!row) return;
  const label = (row.querySelector('b')?.textContent || '').match(/^\\[([A-Z-]+)\\]/)?.[1];
  const target = pageMeta.find((item) => item.label === label);
  if (!target) {
    showNotice('Preview for this uploaded file requires server storage.');
    return;
  }
  target.stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const titleEditButton = titleNode?.querySelector('button');
titleEditButton?.addEventListener('click', () => {
  const next = window.prompt('Document title', titleNode.childNodes[0].textContent.trim());
  if (next && next.trim()) {
    titleEdited = true;
    titleNode.childNodes[0].textContent = next.trim();
  }
});

syncActivePage();

const addFormsButton = document.querySelector('.oq-add');
if (addFormsButton) {
  const chevronIcon = '<svg class="fe-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9l5 5 5-5"></path></svg>';
  const checkIcon = '<svg class="fe-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"></path></svg>';
  const oqLibraries = [{ key: 'car', name: 'California Association of REALTORS®' }, { key: 'statutory', name: 'California Statutory' }];
  const oqSections = [{"section": "Residential Forms", "tone": "warm", "items": [{"key": "purchase", "label": "Purchase Agreements"}, {"key": "supplements", "label": "Purchase Supplements & Addenda"}, {"key": "disclosures", "label": "Disclosure Forms"}, {"key": "listing", "label": "Listing Agreements"}, {"key": "construction", "label": "New Construction"}, {"key": "rental", "label": "Rental / Lease / Property Mgmt"}, {"key": "other", "label": "Other Agreements"}]}, {"section": "Non-Residential Forms", "tone": "sage", "items": [{"key": "cre-agreements", "label": "Listing & Purchase Agreements"}, {"key": "cre-exchange", "label": "Exchange Agreements and Lease"}, {"key": "cre-business", "label": "Business Opportunity"}]}, {"section": "Misc", "tone": "violet", "items": [{"key": "health", "label": "Health & Entry Advisories"}, {"key": "office", "label": "Office, Admin, Trust Fund"}]}];
  const oqCatalog = [{c:"RPA",t:"California Residential Purchase Agreement and Joint Escrow Instructions",g:"purchase",l:"car"},{c:"RIPA",t:"Residential Income Property Purchase Agreement",g:"purchase",l:"car"},{c:"VLPA",t:"Vacant Land Purchase Agreement and Joint Escrow Instructions",g:"purchase",l:"car"},{c:"MHPA",t:"Manufactured Home Purchase Agreement",g:"purchase",l:"car"},{c:"PPA",t:"Probate Purchase Agreement and Joint Escrow Instructions",g:"purchase",l:"car"},{c:"SCO",t:"Seller Counter Offer",g:"purchase",l:"car"},{c:"BCO",t:"Buyer Counter Offer",g:"purchase",l:"car"},{c:"SMCO",t:"Seller Multiple Counter Offer",g:"purchase",l:"car"},{c:"ADM-GEN",t:"Addendum \u2013 Generic",g:"supplements",l:"car"},{c:"ADM",t:"Addendum No. 1",g:"supplements",l:"car"},{c:"ADM",t:"Addendum No. 2",g:"supplements",l:"car"},{c:"ADM",t:"Addendum No. 3",g:"supplements",l:"car"},{c:"ADM",t:"Addendum No. 4",g:"supplements",l:"car"},{c:"AEA",t:"Amendment of Existing Agreement Terms \u2013 1",g:"supplements",l:"car"},{c:"AEA",t:"Amendment of Existing Agreement Terms \u2013 2",g:"supplements",l:"car"},{c:"AEA",t:"Amendment of Existing Agreement Terms \u2013 3",g:"supplements",l:"car"},{c:"AFA",t:"Assumed Financing Addendum",g:"supplements",l:"car"},{c:"AGAD",t:"Agricultural Addendum",g:"supplements",l:"car"},{c:"AOAA",t:"Assignment of Agreement Addendum",g:"supplements",l:"car"},{c:"APD",t:"Amendment to Prior Disclosure",g:"supplements",l:"car"},{c:"ASA",t:"Additional Signature Addendum \u2013 1",g:"supplements",l:"car"},{c:"ASA",t:"Additional Signature Addendum \u2013 2",g:"supplements",l:"car"},{c:"ATCA",t:"Animal Terms and Conditions Addendum",g:"supplements",l:"car"},{c:"COP",t:"Contingency for Sale of Buyer's Property",g:"supplements",l:"car"},{c:"CR",t:"Contingency Removal",g:"supplements",l:"car"},{c:"DCE",t:"Demand to Close Escrow",g:"supplements",l:"car"},{c:"EXTN",t:"Extension of Time Addendum",g:"supplements",l:"car"},{c:"NBP",t:"Notice to Buyer to Perform",g:"supplements",l:"car"},{c:"NSP",t:"Notice to Seller to Perform",g:"supplements",l:"car"},{c:"RR",t:"Request for Repair",g:"supplements",l:"car"},{c:"SIP",t:"Seller in Possession Addendum",g:"supplements",l:"car"},{c:"TOPA",t:"Tenant Occupied Property Addendum",g:"supplements",l:"car"},{c:"AD",t:"Disclosure Regarding Real Estate Agency Relationship (Buyer)",g:"disclosures",l:"car"},{c:"AD",t:"Disclosure Regarding Real Estate Agency Relationship (Seller)",g:"disclosures",l:"car"},{c:"AC",t:"Confirmation of Real Estate Agency Relationships",g:"disclosures",l:"car"},{c:"AB",t:"Buyer's Affidavit",g:"disclosures",l:"car"},{c:"AS",t:"Seller's Affidavit of Non-foreign Status (FIRPTA) \u2013 1",g:"disclosures",l:"car"},{c:"AS",t:"Seller's Affidavit of Non-foreign Status (FIRPTA) \u2013 2",g:"disclosures",l:"car"},{c:"AVID",t:"Agent Visual Inspection Disclosure",g:"disclosures",l:"car"},{c:"FLD",t:"Lead-Based Paint and Lead-Based Paint Hazards Disclosure",g:"disclosures",l:"car"},{c:"MCA",t:"Market Conditions Advisory",g:"disclosures",l:"car"},{c:"PRBS",t:"Possible Representation of More Than One Buyer or Seller",g:"disclosures",l:"car"},{c:"SBSA",t:"Statewide Buyer and Seller Advisory",g:"disclosures",l:"car"},{c:"SPQ",t:"Seller Property Questionnaire",g:"disclosures",l:"car"},{c:"WFA",t:"Wire Fraud and Electronic Funds Transfer Advisory",g:"disclosures",l:"car"},{c:"RLA",t:"Residential Listing Agreement (Exclusive Authorization and Right to Sell)",g:"listing",l:"car"},{c:"BRBC",t:"Buyer Representation and Broker Compensation Agreement",g:"listing",l:"car"},{c:"VLLA",t:"Vacant Land Listing Agreement",g:"listing",l:"car"},{c:"PLA",t:"Probate Listing Agreement",g:"listing",l:"car"},{c:"AAA",t:"Additional Agent Acknowledgment",g:"listing",l:"car"},{c:"ABA",t:"Additional Broker Acknowledgment",g:"listing",l:"car"},{c:"ACS",t:"Agent Commission Sharing Agreement",g:"listing",l:"car"},{c:"SELM",t:"Seller Instruction to Exclude Listing from the MLS",g:"listing",l:"car"},{c:"NCPA",t:"New Construction Purchase Agreement and Joint Escrow Instructions",g:"construction",l:"car"},{c:"ABSPA",t:"Already-Built Subdivision Purchase Agreement and Joint Escrow Instruction",g:"construction",l:"car"},{c:"SUBPA",t:"Subdivision Purchase Agreement Addendum",g:"construction",l:"car"},{c:"HOWA",t:"Home Warranty Advisory",g:"construction",l:"car"},{c:"LR",t:"Residential Lease or Month-to-Month Rental Agreement",g:"rental",l:"car"},{c:"PMA",t:"Property Management Agreement",g:"rental",l:"car"},{c:"LRA",t:"Lease / Rental Application",g:"rental",l:"car"},{c:"RLAS",t:"Residential Lease After Sale",g:"rental",l:"car"},{c:"MIMO",t:"Move In / Move Out Inspection",g:"rental",l:"car"},{c:"NTT",t:"Notice of Termination of Tenancy",g:"rental",l:"car"},{c:"KLI",t:"Keysafe / Lockbox Addendum",g:"rental",l:"car"},{c:"ARB",t:"Arbitration Agreement",g:"other",l:"car"},{c:"ARC",t:"Authorization to Receive and Convey Information",g:"other",l:"car"},{c:"CAN",t:"Cancellation of Contract, Disbursement of Deposit and Cancellation of Escrow",g:"other",l:"car"},{c:"RFA",t:"Referral Fee Agreement",g:"other",l:"car"},{c:"JCA",t:"Joint Escrow Cancellation Advisory",g:"other",l:"car"},{c:"CPA",t:"Commercial Property Purchase Agreement and Joint Escrow Instructions",g:"cre-agreements",l:"car"},{c:"CLA",t:"Commercial Listing Agreement",g:"cre-agreements",l:"car"},{c:"CIP",t:"Commercial Income Property Purchase Agreement",g:"cre-agreements",l:"car"},{c:"CL",t:"Commercial Lease Agreement",g:"cre-exchange",l:"car"},{c:"CLI",t:"Commercial Lease Tenant Improvements Addendum",g:"cre-exchange",l:"car"},{c:"EA",t:"Exchange Addendum (1031)",g:"cre-exchange",l:"car"},{c:"OPT",t:"Option to Purchase Addendum",g:"cre-exchange",l:"car"},{c:"BOPA",t:"Business Purchase Agreement and Joint Escrow Instructions",g:"cre-business",l:"car"},{c:"BOLA",t:"Business Listing Agreement",g:"cre-business",l:"car"},{c:"BODS",t:"Business Opportunity Disclosure Statement",g:"cre-business",l:"car"},{c:"PEAD-V",t:"Property Entry Advisory and Declaration",g:"health",l:"car"},{c:"HEA",t:"Health Entry Advisory Addendum",g:"health",l:"car"},{c:"ICA",t:"Independent Contractor Agreement",g:"office",l:"car"},{c:"TFR",t:"Trust Fund Records and Reconciliation",g:"office",l:"car"},{c:"ESA",t:"Electronic Signature and Delivery Consent",g:"office",l:"car"},{c:"BRR",t:"Broker Records Retention Checklist",g:"office",l:"car"},{c:"TDS",t:"Real Estate Transfer Disclosure Statement (Statutory Form)",g:"disclosures",l:"statutory"},{c:"MHTDS",t:"Manufactured Home Transfer Disclosure Statement",g:"disclosures",l:"statutory"},{c:"NHDS",t:"Natural Hazard Disclosure Statement (Statutory Form)",g:"disclosures",l:"statutory"},{c:"LPD",t:"Federal Lead-Based Paint Disclosure (Statutory Form)",g:"disclosures",l:"statutory"},{c:"WHSD",t:"Water Heater and Smoke Detector Statement of Compliance",g:"disclosures",l:"statutory"},{c:"MRD",t:"Mello-Roos and 1915 Bond Assessment Disclosure",g:"disclosures",l:"statutory"},{c:"MOD",t:"Military Ordnance Location Disclosure",g:"disclosures",l:"statutory"},{c:"WSD",t:"Window Security Bars and Safety Release Disclosure",g:"disclosures",l:"statutory"}];
  const formLabel = (item) => '[' + item.c + '] ' + item.t;
  addFormsButton.addEventListener('click', () => {
    const taken = Array.from(document.querySelectorAll('.oq-doc-row b')).map((node) => node.textContent);
    const selected = new Set();
    const groups = new Set();
    const libs = new Set();
    const collapsed = new Set();
    const backdrop = document.createElement('div');
    backdrop.className = 'oq-modal-backdrop';
    backdrop.innerHTML = '<section class="oq-modal" role="dialog" aria-modal="true"><header><h2>Add forms to this transaction</h2><button class="modal-close" aria-label="Close add forms">×</button></header><div class="oq-modal-main"><aside><div class="oq-filter-head"><p>Form libraries</p></div><div class="oq-filters"></div></aside><div class="oq-catalog"><label><svg class="fe-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="M16 16l5 5"></path></svg><input placeholder="Search forms by name or code"></label><div class="oq-catalog-title"><div></div><small></small></div><div class="oq-library-tree"></div></div></div><footer><span class="selected-count">' + checkIcon + ' 0 selected</span><div><button class="modal-cancel">Cancel</button><button class="primary modal-add" disabled>Add Documents</button></div></footer></section>';
    const filters = backdrop.querySelector('.oq-filters');
    const tree = backdrop.querySelector('.oq-library-tree');
    const libCount = backdrop.querySelector('.oq-catalog-title > div');
    const formCount = backdrop.querySelector('.oq-catalog-title small');
    const count = backdrop.querySelector('.selected-count');
    const confirm = backdrop.querySelector('.modal-add');
    const search = backdrop.querySelector('input');

    const drawFilters = () => {
      filters.innerHTML = '';
      const blocks = oqSections.concat([{ section: 'Library', tone: 'slate', items: oqLibraries.map((library) => ({ key: 'lib:' + library.key, label: library.name })) }]);
      blocks.forEach((block) => {
        const wrap = document.createElement('div');
        wrap.className = 'oq-filter-group';
        const label = document.createElement('b');
        label.className = 'oq-group-label tone-' + block.tone;
        label.textContent = block.section;
        wrap.appendChild(label);
        block.items.forEach((item) => {
          const isLib = item.key.indexOf('lib:') === 0;
          const store = isLib ? libs : groups;
          const key = isLib ? item.key.slice(4) : item.key;
          const on = store.has(key);
          const button = document.createElement('button');
          button.className = on ? 'active' : '';
          button.setAttribute('aria-pressed', on ? 'true' : 'false');
          button.textContent = item.label;
          button.addEventListener('click', () => {
            store.has(key) ? store.delete(key) : store.add(key);
            drawFilters();
            draw();
          });
          wrap.appendChild(button);
        });
        filters.appendChild(wrap);
      });
      const head = backdrop.querySelector('.oq-filter-head');
      head.querySelector('.oq-filter-clear')?.remove();
      const active = groups.size + libs.size;
      if (active) {
        const clear = document.createElement('button');
        clear.className = 'oq-filter-clear';
        clear.textContent = 'Clear (' + active + ')';
        clear.addEventListener('click', () => { groups.clear(); libs.clear(); drawFilters(); draw(); });
        head.appendChild(clear);
      }
    };

    const draw = () => {
      const term = search.value.trim().toLowerCase();
      const matches = oqCatalog.filter((item) => taken.indexOf(formLabel(item)) < 0
        && (!groups.size || groups.has(item.g))
        && (!libs.size || libs.has(item.l))
        && (!term || formLabel(item).toLowerCase().includes(term)));
      tree.innerHTML = '';
      let shown = 0;
      oqLibraries.forEach((library) => {
        const forms = matches.filter((item) => item.l === library.key);
        if (!forms.length) return;
        shown += 1;
        const open = !collapsed.has(library.key);
        const wrap = document.createElement('div');
        wrap.className = 'oq-library';
        const head = document.createElement('button');
        head.className = 'oq-library-head';
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
        head.innerHTML = '<span class="oq-caret' + (open ? ' is-open' : '') + '">' + chevronIcon + '</span><span class="oq-folder"></span><b></b><small>' + forms.length + '</small>';
        head.querySelector('b').textContent = library.name;
        head.addEventListener('click', () => {
          collapsed.has(library.key) ? collapsed.delete(library.key) : collapsed.add(library.key);
          draw();
        });
        wrap.appendChild(head);
        if (open) {
          const list = document.createElement('div');
          list.className = 'oq-form-list';
          forms.forEach((item) => {
            const name = formLabel(item);
            const on = selected.has(name);
            const row = document.createElement('button');
            row.className = on ? 'selected' : '';
            row.setAttribute('role', 'checkbox');
            row.setAttribute('aria-checked', on ? 'true' : 'false');
            row.innerHTML = '<span class="oq-checkbox">' + (on ? checkIcon : '') + '</span><span class="oq-form-name"><em>[' + item.c + ']</em> <span></span></span>';
            row.querySelector('.oq-form-name span').textContent = item.t;
            row.addEventListener('click', () => {
              const now = !selected.has(name);
              now ? selected.add(name) : selected.delete(name);
              row.className = now ? 'selected' : '';
              row.setAttribute('aria-checked', now ? 'true' : 'false');
              row.querySelector('.oq-checkbox').innerHTML = now ? checkIcon : '';
              count.innerHTML = checkIcon + ' ' + selected.size + ' selected';
              confirm.disabled = !selected.size;
            });
            list.appendChild(row);
          });
          wrap.appendChild(list);
        }
        tree.appendChild(wrap);
      });
      if (!shown) {
        const empty = document.createElement('p');
        empty.className = 'oq-empty';
        empty.textContent = 'No forms match these filters. Try clearing a category or changing your search.';
        tree.appendChild(empty);
      }
      libCount.textContent = shown + (shown === 1 ? ' library' : ' libraries');
      formCount.textContent = matches.length + ' forms';
    };

    const close = () => backdrop.remove();
    backdrop.querySelector('.modal-close').addEventListener('click', close);
    backdrop.querySelector('.modal-cancel').addEventListener('click', close);
    backdrop.addEventListener('mousedown', (event) => { if (event.target === backdrop) close(); });
    search.addEventListener('input', draw);
    confirm.addEventListener('click', () => {
      selected.forEach((name) => {
        document.querySelector('.oq-doc-list').appendChild(createDocumentRow(name, 'PDF form'));
      });
      updateCount();
      close();
    });
    document.querySelector('.oq-editor').appendChild(backdrop);
    drawFilters();
    draw();
    search.focus();
  });
}
const zoomButton = document.querySelector('.oq-zoom > button');
const zoomModes = ['Smaller', 'Normal', 'Larger', 'Fit width', 'Fit page'];
if (zoomButton) {
  zoomButton.addEventListener('click', () => {
    const existing = document.querySelector('.oq-zoom-menu');
    if (existing) { existing.remove(); return; }
    const menu = document.createElement('div');
    menu.className = 'oq-zoom-menu';
    zoomModes.forEach((mode) => {
      const option = document.createElement('button');
      option.textContent = mode;
      if (zoomButton.textContent.trim().startsWith(mode)) option.className = 'active';
      option.addEventListener('click', (event) => {
        event.stopPropagation();
        zoomButton.childNodes[0].textContent = mode;
        const editor = document.querySelector('.oq-editor');
        Array.from(editor.classList).filter((name) => name.startsWith('oq-zoom-')).forEach((name) => editor.classList.remove(name));
        editor.classList.add('oq-zoom-' + mode.toLowerCase().replace(' ', '-'));
        menu.remove();
      });
      menu.appendChild(option);
    });
    document.querySelector('.oq-zoom').appendChild(menu);
  });
}

const context = document.querySelector('.fe-context');
const modeButtons = document.querySelectorAll('.fe-mode-rail > button');
if (context && modeButtons.length >= 2) {
  const docsBody = context.firstElementChild;
  const assistantBody = document.createElement('div');
  assistantBody.className = 'oq-assistant';
  assistantBody.style.display = 'none';
  assistantBody.innerHTML = '<div class="oq-assistant-context"><span class="oq-assistant-mark">✦</span><span><b>Initial real estate inquiry</b><small>AD — Disclosure Regarding Real Estate Agency Relationship (Buyer)</small></span><button aria-label="New chat" title="New chat">＋</button><button aria-label="Chat history" title="Chat history" aria-expanded="false">↶</button></div><div class="oq-chat-history" hidden><b>Recent chats</b><button><span>Review AD fields</span><small>Current conversation</small></button><button><span>Start a clean conversation</span><small>New chat</small></button></div><div class="oq-thread" aria-live="polite"><div class="oq-ai-message">I’m ready to help with AD, page 1. Ask about a clause, check missing fields, or use voice to dictate transaction information.</div><div class="oq-form-context"><span>▧</span><span><b>AD — Disclosure Regarding Real Estate Agency Relationship (Buyer)</b><small>Current form context · page 1</small></span><button>Continue filling</button></div></div><div class="oq-assistant-footer"><div class="oq-chat-actions" aria-label="Quick actions"><button data-prompt="Continue to the next field">Continue</button><button data-prompt="Next form">Next form</button><button data-prompt="Check status and missing fields">Check status</button><button data-prompt="Summarize this page">Summarize</button><button data-prompt="What fields are missing?">What’s missing?</button><button data-prompt="Explain this form">Explain</button></div><div class="oq-voice-status" role="status" hidden><span></span><b>Listening…</b><button>Stop</button></div><div class="oq-compose"><textarea placeholder="Ask about a clause or field…"></textarea><button aria-label="Turn on voice mode" title="Speak naturally to fill form fields">●</button><button aria-label="Send message" disabled>➤</button></div><small>AI may make mistakes. Review before applying.</small></div>';
  context.appendChild(assistantBody);
  const assistantThread = assistantBody.querySelector('.oq-thread');
  const assistantInput = assistantBody.querySelector('.oq-compose textarea');
  const assistantSend = assistantBody.querySelector('[aria-label="Send message"]');
  const assistantVoice = assistantBody.querySelector('[aria-label="Turn on voice mode"]');
  const assistantVoiceStatus = assistantBody.querySelector('.oq-voice-status');
  const assistantHistory = assistantBody.querySelector('.oq-chat-history');
  const assistantHistoryButton = assistantBody.querySelector('[aria-label="Chat history"]');
  let assistantRecognition = null;
  let assistantThinking = false;
  let assistantReplyTimer = null;
  const assistantReply = (prompt) => {
    const query = prompt.toLowerCase();
    if (query.includes('missing') || query.includes('status')) return 'AD still needs the remaining unchecked roles, dates, and signature fields reviewed. I can take you through them in page order.';
    if (query.includes('summar')) return 'Page 1 of AD covers the agency relationship and the parties’ acknowledgements. Confirm the representation roles, license information, dates, and signatures before sending.';
    if (query.includes('next form')) return 'The next transaction document is BRBC — Buyer Representation and Broker Compensation Agreement. Open it when you are ready to continue.';
    if (query.includes('continue') || query.includes('next field')) return 'Let’s continue on AD, page 1. Select the next blue field in the PDF and I’ll help choose the correct transaction value.';
    if (query.includes('explain') || query.includes('clause')) return 'This form documents who each real estate agent represents. It should match the brokerage and agent roles recorded for this transaction; review the final language before applying it.';
    return 'I’ve captured that for the AD review. I can summarize the page, identify missing fields, or help map it to the transaction details.';
  };
  const appendAssistantMessage = (role, value) => {
    const message = document.createElement('div');
    message.className = role === 'user' ? 'oq-user-message' : 'oq-ai-message';
    message.textContent = value;
    assistantThread.insertBefore(message, assistantThread.querySelector('.oq-form-context'));
    assistantThread.scrollTop = assistantThread.scrollHeight;
  };
  const sendAssistantMessage = (value) => {
    const prompt = String(value || assistantInput.value).trim();
    if (!prompt || assistantThinking) return;
    appendAssistantMessage('user', prompt);
    assistantInput.value = '';
    assistantSend.disabled = true;
    assistantThinking = true;
    const thinking = document.createElement('div');
    thinking.className = 'oq-ai-message oq-thinking';
    thinking.setAttribute('aria-label', 'Assistant is responding');
    thinking.innerHTML = '<i></i><i></i><i></i>';
    assistantThread.insertBefore(thinking, assistantThread.querySelector('.oq-form-context'));
    assistantReplyTimer = window.setTimeout(() => {
      thinking.remove();
      appendAssistantMessage('assistant', assistantReply(prompt));
      assistantThinking = false;
      assistantSend.disabled = !assistantInput.value.trim();
    }, 520);
  };
  const resetAssistant = () => {
    if (assistantReplyTimer) window.clearTimeout(assistantReplyTimer);
    assistantRecognition?.stop();
    assistantThinking = false;
    assistantInput.value = '';
    assistantSend.disabled = true;
    assistantThread.querySelectorAll('.oq-ai-message, .oq-user-message').forEach((message) => message.remove());
    const welcome = document.createElement('div');
    welcome.className = 'oq-ai-message';
    welcome.textContent = 'I’m ready to help with AD, page 1. Ask about a clause, check missing fields, or use voice to dictate transaction information.';
    assistantThread.insertBefore(welcome, assistantThread.firstChild);
    assistantHistory.hidden = true;
    assistantHistoryButton.setAttribute('aria-expanded', 'false');
  };
  assistantInput.addEventListener('input', () => { assistantSend.disabled = !assistantInput.value.trim() || assistantThinking; });
  assistantInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendAssistantMessage(); }
  });
  assistantSend.addEventListener('click', () => sendAssistantMessage());
  assistantBody.querySelectorAll('.oq-chat-actions button').forEach((button) => button.addEventListener('click', () => sendAssistantMessage(button.dataset.prompt)));
  assistantBody.querySelector('.oq-form-context button').addEventListener('click', () => sendAssistantMessage('Continue to the next field'));
  assistantBody.querySelector('[aria-label="New chat"]').addEventListener('click', resetAssistant);
  assistantHistoryButton.addEventListener('click', () => {
    assistantHistory.hidden = !assistantHistory.hidden;
    assistantHistoryButton.setAttribute('aria-expanded', String(!assistantHistory.hidden));
  });
  assistantHistory.querySelectorAll('button').forEach((button, index) => button.addEventListener('click', () => index ? resetAssistant() : (assistantHistory.hidden = true)));
  const stopAssistantVoice = () => assistantRecognition?.stop();
  assistantVoiceStatus.querySelector('button').addEventListener('click', stopAssistantVoice);
  assistantVoice.addEventListener('click', () => {
    if (assistantRecognition) { stopAssistantVoice(); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { showNotice('Voice input is not supported in this browser.'); return; }
    const recognition = new Recognition();
    assistantRecognition = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    assistantVoice.classList.add('recording');
    assistantVoice.setAttribute('aria-label', 'Stop voice mode');
    assistantVoiceStatus.hidden = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(' ').trim();
      assistantInput.value = transcript;
      assistantVoiceStatus.querySelector('b').textContent = transcript || 'Listening…';
      assistantSend.disabled = !transcript;
    };
    recognition.onerror = (event) => {
      showNotice(event.error === 'not-allowed' ? 'Microphone access is required for voice input.' : 'Voice input stopped. Please try again.');
    };
    recognition.onend = () => {
      assistantRecognition = null;
      assistantVoice.classList.remove('recording');
      assistantVoice.setAttribute('aria-label', 'Turn on voice mode');
      assistantVoiceStatus.hidden = true;
    };
    recognition.start();
  });
  // ---- Details and Parties panels ----------------------------------------
  // Field definitions and PDF links are generated from app/page.tsx by
  // scripts/export-standalone-index.mjs. Re-run the export after changing them.
  const OQF = {"partyFields": [{"key": "partyFirstName", "label": "First name", "value": "Vu", "prefill": true}, {"key": "partyLastName", "label": "Last name", "value": "Nguyen", "prefill": true}, {"key": "partyEmail", "label": "Email", "value": "vu.nguyen@c0x12c.com", "prefill": true, "wide": true}, {"key": "partyRole", "label": "Transaction role", "value": "Buyer Agent", "wide": true, "kind": "select", "options": "ROLES"}], "agentContactFields": [{"key": "agentPhone", "label": "Phone", "value": "(213) 555-0148", "prefill": true}, {"key": "agentLicense", "label": "DRE / NMLS #", "value": "02114477", "prefill": true}], "agentBrokerageFields": [{"key": "brokerageFirm", "label": "Brokerage firm", "value": "Pinnacle Estate Properties", "prefill": true, "wide": true}, {"key": "brokerageLicense", "label": "Brokerage DRE license #", "value": "01234567", "prefill": true}, {"key": "brokerageFax", "label": "Fax", "value": ""}, {"key": "brokerageAddress", "label": "Office address", "value": "700 S Flower St", "prefill": true, "wide": true}, {"key": "brokerageCity", "label": "City", "value": "Los Angeles", "prefill": true}, {"key": "brokerageState", "label": "State", "value": "CA", "prefill": true}, {"key": "brokerageZip", "label": "ZIP", "value": "90017", "prefill": true}], "clientContactFields": [{"key": "firstName", "label": "First name", "value": "", "prefill": true}, {"key": "lastName", "label": "Last name", "value": "", "prefill": true}, {"key": "email", "label": "Email", "value": "", "prefill": true}, {"key": "phone", "label": "Phone", "value": "", "prefill": true}, {"key": "mailingAddress", "label": "Mailing address", "value": "", "wide": true}], "buyerDetailFields": [{"key": "occupation", "label": "Occupation / employer", "value": "", "wide": true}, {"key": "financingType", "label": "Financing type", "value": "", "kind": "select", "options": ["Cash", "Conventional", "FHA", "VA", "Other"]}, {"key": "preApprovalAmount", "label": "Pre-approval amount", "value": "", "prefix": "$"}, {"key": "preferredLender", "label": "Preferred lender", "value": "", "wide": true}], "agentContactFieldsGeneric": [{"key": "firstName", "label": "First name", "value": "", "prefill": true}, {"key": "lastName", "label": "Last name", "value": "", "prefill": true}, {"key": "email", "label": "Email", "value": "", "prefill": true, "wide": true}, {"key": "phone", "label": "Phone", "value": "", "prefill": true}, {"key": "license", "label": "DRE / NMLS #", "value": "", "prefill": true}], "propertyFields": [{"key": "propertyAddress", "label": "Property address", "value": "2458 Maplewood Ave", "prefill": true, "wide": true}, {"key": "unit", "label": "Unit #", "value": "12B"}, {"key": "city", "label": "City", "value": "Los Angeles", "prefill": true}, {"key": "state", "label": "State", "value": "CA", "prefill": true}, {"key": "zip", "label": "Zip Code", "value": "90026", "prefill": true}, {"key": "county", "label": "County", "value": "Los Angeles", "prefill": true}, {"key": "propertyType", "label": "Type", "value": "Commercial", "prefill": true, "kind": "select", "options": ["Commercial", "Condominium", "Single Family", "Multi-Family", "Land"]}, {"key": "yearBuilt", "label": "Year built or manufactured", "value": "2018"}, {"key": "apn", "label": "APN", "value": "5401-021-045", "prefill": true}, {"key": "lot", "label": "Lot", "value": "12"}, {"key": "block", "label": "Block", "value": "B"}, {"key": "subdivision", "label": "Subdivision", "value": "Maplewood Heights", "wide": true}, {"key": "taxes", "label": "Taxes", "value": "6,850", "prefix": "$"}, {"key": "legalDescription", "label": "Legal Description", "value": "Unit 12B of Maplewood Heights Condominium, City of Los Angeles, County of Los Angeles, State of California", "wide": true, "kind": "textarea"}], "listingFields": [{"key": "mlsNumber", "label": "MLS Number", "value": "CA12345678"}, {"key": "listingDate", "label": "Listing Date", "value": "08/18/2026"}, {"key": "expirationDate", "label": "Expiration Date", "value": "08/31/2026"}, {"key": "listingAgreementDate", "label": "Listing Agreement Date", "value": "08/15/2026"}, {"key": "previousPrice", "label": "Previous Price", "value": "845,000", "prefix": "$"}, {"key": "listedPrice", "label": "Listed Price", "value": "825,000", "prefill": true, "prefix": "$"}, {"key": "trustDeed1", "label": "Trust Deed Balance 1", "value": "350,000", "prefix": "$"}, {"key": "trustDeed2", "label": "Trust Deed Balance 2", "value": "", "prefix": "$"}, {"key": "trustDeed3", "label": "Trust Deed Balance 3", "value": "", "prefix": "$"}, {"key": "otherLiens", "label": "Other Liens", "value": "", "prefix": "$"}, {"key": "otherLiensDescription", "label": "Other Liens (Description)", "value": "", "wide": true}, {"key": "otherEncumbrances", "label": "Other Encumbrances", "value": "", "prefix": "$"}, {"key": "otherEncumbrancesDescription", "label": "Other Encumbrances (Description)", "value": "", "wide": true}, {"key": "includes", "label": "Includes", "value": "Refrigerator, washer, dryer, kitchen appliances", "wide": true, "kind": "textarea"}, {"key": "excludes", "label": "Excludes", "value": "Seller\u2019s personal furniture and staging items", "wide": true, "kind": "textarea"}, {"key": "listingRemarks", "label": "Listing Remarks", "value": "Bright 2-bedroom condo in a desirable Los Angeles neighborhood with updated kitchen and convenient access to shopping and transit.", "wide": true, "kind": "textarea"}], "purchaseFields": [{"key": "purchasePrice", "label": "Purchase Price", "value": "820,000", "prefix": "$"}, {"key": "escrowNumber", "label": "Escrow Number", "value": "ESC-2026-0818-2458"}, {"key": "cashBalance", "label": "Cash Balance", "value": "164,000", "prefix": "$"}, {"key": "transferFees", "label": "Transfer Fees", "value": "2,500", "prefix": "$"}, {"key": "deposit1", "label": "Deposit 1", "value": "10,000", "prefix": "$"}, {"key": "deposit2", "label": "Deposit 2", "value": "15,000", "prefix": "$"}, {"key": "appraisalWaived", "label": "Appraisal Contingency Waived", "value": "", "kind": "select", "options": ["Yes", "No"]}, {"key": "loanWaived", "label": "Loan Contingency Waived", "value": "", "kind": "select", "options": ["Yes", "No"]}, {"key": "purchaseRemarks", "label": "Purchase Remarks", "value": "Buyer to obtain conventional financing. Seller to provide standard disclosures.", "wide": true, "kind": "textarea"}, {"key": "financingTerms", "label": "Other Financing Terms", "value": "80% conventional loan, 30-year fixed", "wide": true, "kind": "textarea"}], "keyDateFields": [{"key": "offerAccepted", "label": "Offer Accepted", "value": "08/18/26"}, {"key": "purchaseAgreementDate", "label": "Purchase Agreement Date", "value": "08/18/26"}, {"key": "earnestMoneyDue", "label": "Earnest Money Deposit Due", "value": "08/21/26"}, {"key": "sellerDisclosureDue", "label": "Seller Disclosure Due", "value": "08/25/26"}, {"key": "possessionDate", "label": "Possession Date", "value": "08/31/26"}, {"key": "buyerPropertyContingency", "label": "Sale of Buyer Property Contingency", "value": "08/31/26"}, {"key": "appraisalDue", "label": "Appraisal Contingency Due", "value": "09/04/26"}, {"key": "inspectionDue", "label": "Inspection Contingency Due", "value": "09/04/26"}, {"key": "loanDue", "label": "Loan Contingency Due", "value": "09/08/26"}, {"key": "closeOfEscrow", "label": "Close of Escrow", "value": "09/17/26"}], "listingCommissionFields": [{"key": "listingCommissionAmount", "label": "Listing Commission Amount", "value": "24,600", "prefix": "$"}, {"key": "listingCommissionPercent", "label": "Listing Commission Percent", "value": "3", "suffix": "%"}, {"key": "listingNetOffice", "label": "Listing Net Office Commission", "value": "22,140", "prefix": "$"}, {"key": "listingTcFee", "label": "Listing TC Fee", "value": "350", "prefix": "$"}, {"key": "listingOtherDeductions", "label": "Listing Other Deductions", "value": "2,110", "prefix": "$"}, {"key": "listingDeductionDetails", "label": "Listing Deduction Details", "value": "Brokerage split and admin fee", "wide": true}, {"key": "listingAgent1Percent", "label": "Listing Agent 1 Split Percent", "value": "70", "suffix": "%"}, {"key": "listingAgent1Amount", "label": "Listing Agent 1 Split Amount", "value": "17,220", "prefix": "$"}, {"key": "listingAgent1Net", "label": "Listing Agent 1 Net Commission", "value": "17,220", "prefix": "$"}, {"key": "listingAgent2Percent", "label": "Listing Agent 2 Split Percent", "value": "30", "suffix": "%"}, {"key": "listingAgent2Amount", "label": "Listing Agent 2 Split Amount", "value": "7,380", "prefix": "$"}, {"key": "listingAgent2Net", "label": "Listing Agent 2 Net Commission", "value": "7,380", "prefix": "$"}], "purchaseCommissionFields": [{"key": "purchaseCommissionAmount", "label": "Purchase Commission Amount", "value": "24,600", "prefix": "$"}, {"key": "purchaseCommissionPercent", "label": "Purchase Commission Percent", "value": "3", "suffix": "%"}, {"key": "purchaseNetOffice", "label": "Purchase Net Office Commission", "value": "22,140", "prefix": "$"}, {"key": "purchaseTcFee", "label": "Purchase TC Fee", "value": "350", "prefix": "$"}, {"key": "purchaseOtherDeductions", "label": "Purchase Other Deductions", "value": "2,110", "prefix": "$"}, {"key": "purchaseDeductionDetails", "label": "Purchase Deduction Details", "value": "Brokerage split and admin fee", "wide": true}, {"key": "purchaseAgent1Percent", "label": "Purchase Agent 1 Split Percent", "value": "60", "suffix": "%"}, {"key": "purchaseAgent1Amount", "label": "Purchase Agent 1 Split Amount", "value": "14,760", "prefix": "$"}, {"key": "purchaseAgent1Net", "label": "Purchase Agent 1 Net Commission", "value": "14,760", "prefix": "$"}, {"key": "purchaseAgent2Percent", "label": "Purchase Agent 2 Split Percent", "value": "40", "suffix": "%"}, {"key": "purchaseAgent2Amount", "label": "Purchase Agent 2 Split Amount", "value": "9,840", "prefix": "$"}, {"key": "purchaseAgent2Net", "label": "Purchase Agent 2 Net Commission", "value": "9,840", "prefix": "$"}], "partyRoleField": [{"key": "role", "label": "Transaction role", "value": "", "kind": "select", "options": "ROLES", "wide": true}], "ROLES": ["Buyer Agent", "Listing Agent", "Buyer 1", "Buyer 2", "Seller", "Transaction Coordinator"]};
  const OQLINKS = [{"keys": ["partyFirstName", "partyLastName"], "form": "AD", "page": 1, "label": "Real estate agent name"}, {"keys": ["partyFirstName", "partyLastName"], "form": "AD", "page": 2, "label": "Buyer\u2019s agent name"}, {"keys": ["partyFirstName", "partyLastName"], "form": "BRBC", "page": 1, "label": "Agent acknowledgement"}, {"keys": ["partyFirstName", "partyLastName"], "form": "BRBC", "page": 7, "label": "Broker / agent name"}, {"keys": ["partyFirstName", "partyLastName"], "form": "PRBS", "page": 1, "label": "Buyer brokerage agent"}, {"keys": ["partyEmail"], "form": "BRBC", "page": 7, "label": "Broker / agent email"}, {"keys": ["propertyAddress", "unit", "city", "state", "zip"], "form": "BRBC", "page": 3, "label": "Specified property"}, {"keys": ["city"], "form": "BRBC", "page": 3, "label": "Property city"}, {"keys": ["county"], "form": "BRBC", "page": 3, "label": "Property county"}, {"keys": ["propertyType"], "form": "BRBC", "page": 3, "label": "Commercial property"}, {"keys": ["purchaseCommissionAmount"], "form": "BRBC", "page": 3, "label": "Broker compensation amount"}, {"keys": ["purchaseCommissionPercent"], "form": "BRBC", "page": 3, "label": "Broker compensation percent"}];
  const oqRoles = OQF.ROLES;
  const oqOptions = (field) => (field.options === 'ROLES' ? oqRoles : field.options || []);

  const oqSections = [
    { key: 'property', label: 'Property', title: 'Property information', sub: 'Address, parcel, tax, and legal property details.', prefill: true, groups: [{ fields: OQF.propertyFields }] },
    { key: 'listing', label: 'Listing', title: 'Listing information', sub: 'Listing dates, pricing, liens, and transaction notes.', prefill: true, groups: [{ fields: OQF.listingFields }] },
    { key: 'purchase', label: 'Purchase', title: 'Purchase information', sub: 'Offer terms, financing, contingencies, and key dates.', groups: [{ fields: OQF.purchaseFields }, { heading: 'Key dates', fields: OQF.keyDateFields }] },
    { key: 'commission', label: 'Commission', title: 'Commission details', sub: 'Listing and purchase commission allocations.', groups: [{ heading: 'Listing commission', fields: OQF.listingCommissionFields }, { heading: 'Purchase commission', fields: OQF.purchaseCommissionFields }] }
  ];

  const oqShared = {};
  [].concat(OQF.partyFields, OQF.propertyFields, OQF.listingFields, OQF.purchaseFields,
    OQF.keyDateFields, OQF.listingCommissionFields, OQF.purchaseCommissionFields)
    .forEach((field) => { oqShared[field.key] = field.value; });
  const oqSharedBaseline = Object.assign({}, oqShared);
  const oqSharedPartyKeys = OQF.partyFields.map((field) => field.key);

  const oqMakeParty = (id, fields, overrides) => {
    const values = {};
    fields.forEach((field) => { values[field.key] = field.value; });
    Object.assign(values, overrides || {});
    return { id: id, values: values, baseline: Object.assign({}, values) };
  };

  const oqParties = [
    oqMakeParty('primary', [].concat(OQF.agentContactFields, OQF.agentBrokerageFields)),
    oqMakeParty('buyer-1', [].concat(OQF.clientContactFields, OQF.buyerDetailFields), {
      role: 'Buyer 1', firstName: 'Alexis', lastName: 'Romero',
      email: 'alexis.romero@example.com', phone: '(310) 555-0132'
    }),
    oqMakeParty('seller', OQF.clientContactFields, {
      role: 'Seller', firstName: 'Dana', lastName: 'Whitfield',
      email: 'dana.whitfield@example.com', phone: '(323) 555-0177'
    }),
    oqMakeParty('listing-agent', [].concat(OQF.agentContactFieldsGeneric, OQF.agentBrokerageFields), {
      role: 'Listing Agent', firstName: 'Priya', lastName: 'Raman',
      email: 'priya.raman@example.com', phone: '(818) 555-0104',
      brokerageFirm: 'Harbor & Vine Realty'
    })
  ];

  const oqState = { section: 'property', openPartyId: null, openLinks: null, collapsedGroups: [] };

  const oqPartyDisplay = (party) => {
    const name = party.id === 'primary'
      ? [oqShared.partyFirstName, oqShared.partyLastName].filter(Boolean).join(' ')
      : [party.values.firstName, party.values.lastName].filter(Boolean).join(' ');
    const role = party.id === 'primary' ? oqShared.partyRole : party.values.role;
    const initials = name.split(/\\s+/).filter(Boolean).slice(0, 2)
      .map((part) => part[0].toUpperCase()).join('') || '?';
    return { name: name || 'New party', role: role || 'No role set', initials: initials };
  };

  const oqIsAgentRole = (role) => /agent|coordinator/i.test(role || '');

  // Roles group by side of the deal, not by exact title — otherwise a
  // four-party transaction becomes four groups of one.
  const oqPartyGroupOf = (role) => {
    if (oqIsAgentRole(role)) return 'agents';
    if (/buyer/i.test(role || '')) return 'buyers';
    if (/seller/i.test(role || '')) return 'sellers';
    return 'other';
  };
  const oqPartyGroupOrder = [
    { key: 'buyers', label: 'Buyers' },
    { key: 'sellers', label: 'Sellers' },
    { key: 'agents', label: 'Agents' },
    { key: 'other', label: 'Other' }
  ];

  // The field set follows the party's role, so the panel never shows more than
  // a dozen inputs even though the transaction carries six party records.
  const oqPartyGroups = (party) => {
    if (party.id === 'primary') {
      return [
        { fields: [].concat(OQF.partyFields, OQF.agentContactFields) },
        { heading: 'Brokerage', fields: OQF.agentBrokerageFields }
      ];
    }
    if (oqIsAgentRole(party.values.role)) {
      return [
        { fields: [].concat(OQF.agentContactFieldsGeneric, OQF.partyRoleField) },
        { heading: 'Brokerage', fields: OQF.agentBrokerageFields }
      ];
    }
    const groups = [{ fields: [].concat(OQF.clientContactFields, OQF.partyRoleField) }];
    if (/buyer/i.test(party.values.role || '')) {
      groups.push({ heading: 'Buyer details', fields: OQF.buyerDetailFields });
    }
    return groups;
  };

  const oqDestinations = (key) => OQLINKS.filter((link) => link.keys.indexOf(key) !== -1);

  const oqEl = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };
  const OQ_CLOSE_ICON = '<svg class="fe-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"></path></svg>';
  const OQ_PLUS_ICON = '<svg class="fe-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>';
  const OQ_CHEVRON_ICON = '<svg class="fe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9l5 5 5-5"></path></svg>';

  // A field reads as pre-filled while it still holds the value Create
  // Transaction supplied; editing it clears the marker.
  const oqPrefilled = (field, store) => {
    if (!field.prefill) return false;
    const seeded = store.baseline[field.key] !== undefined && store.baseline[field.key] !== null
      ? store.baseline[field.key]
      : field.value;
    return Boolean(seeded) && store.values[field.key] === seeded;
  };

  const oqRenderField = (field, store, rerender) => {
    const wrap = oqEl('div', 'oq-edit-field' + (field.wide ? ' wide' : '') + (oqPrefilled(field, store) ? ' is-prefilled' : ''));
    const id = 'detail-field-' + store.scope + '-' + field.key;
    const label = oqEl('label', 'oq-edit-label', field.label);
    label.setAttribute('for', id);
    wrap.appendChild(label);

    const dests = store.linked ? oqDestinations(field.key) : [];
    const control = oqEl('div', 'oq-edit-control' + (dests.length ? ' is-linked' : ''));
    if (field.prefix) control.appendChild(oqEl('i', null, field.prefix));

    let input;
    if (field.kind === 'select') {
      input = document.createElement('select');
      const blank = document.createElement('option');
      blank.value = '';
      blank.textContent = 'Not set';
      input.appendChild(blank);
      oqOptions(field).forEach((option) => {
        const node = document.createElement('option');
        node.textContent = option;
        input.appendChild(node);
      });
    } else if (field.kind === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 3;
    } else {
      input = document.createElement('input');
    }
    input.id = id;
    input.value = store.values[field.key] || '';
    input.addEventListener('input', (event) => {
      store.set(field.key, event.target.value);
      if (field.key === 'role' || field.key === 'partyRole') rerender();
      else wrap.classList.toggle('is-prefilled', oqPrefilled(field, store));
    });
    control.appendChild(input);
    if (field.suffix) control.appendChild(oqEl('i', null, field.suffix));
    wrap.appendChild(control);

    if (dests.length) {
      const line = oqEl('span', 'oq-field-destinations');
      line.appendChild(oqEl('small', null, 'Linked to'));
      const first = dests[0];
      const anchor = oqEl('a', null, first.form + ' · p.' + first.page);
      anchor.href = '#';
      anchor.title = 'Open ' + first.label + ' in ' + first.form + ', page ' + first.page;
      anchor.addEventListener('click', (event) => {
        event.preventDefault();
        showNotice('Opens ' + first.label + ' in ' + first.form + ', page ' + first.page + '.');
      });
      line.appendChild(anchor);
      if (dests.length > 1) {
        const more = oqEl('button', 'oq-destination-toggle', '+' + (dests.length - 1) + ' more');
        more.type = 'button';
        more.setAttribute('aria-expanded', String(oqState.openLinks === field.key));
        more.addEventListener('click', (event) => {
          event.stopPropagation();
          oqState.openLinks = oqState.openLinks === field.key ? null : field.key;
          rerender();
        });
        line.appendChild(more);
      }
      wrap.appendChild(line);

      if (oqState.openLinks === field.key) {
        const pop = oqEl('div', 'oq-destination-pop');
        pop.setAttribute('role', 'dialog');
        pop.setAttribute('aria-label', 'Linked fields for ' + field.label);
        const head = document.createElement('header');
        head.appendChild(oqEl('b', null, 'Linked fields'));
        head.appendChild(oqEl('small', null, String(dests.length)));
        const close = oqEl('button', null);
        close.type = 'button';
        close.setAttribute('aria-label', 'Close linked fields');
        close.innerHTML = OQ_CLOSE_ICON;
        close.addEventListener('click', () => { oqState.openLinks = null; rerender(); });
        head.appendChild(close);
        pop.appendChild(head);
        const list = document.createElement('ul');
        dests.forEach((dest) => {
          const item = document.createElement('li');
          const button = oqEl('button', null);
          button.type = 'button';
          button.appendChild(oqEl('em', null, dest.form));
          button.appendChild(oqEl('span', null, dest.label));
          button.appendChild(oqEl('small', null, 'p.' + dest.page));
          button.addEventListener('click', () => {
            oqState.openLinks = null;
            rerender();
            showNotice('Opens ' + dest.label + ' in ' + dest.form + ', page ' + dest.page + '.');
          });
          item.appendChild(button);
          list.appendChild(item);
        });
        pop.appendChild(list);
        wrap.appendChild(pop);
      }
    }
    return wrap;
  };

  const oqRenderGroups = (groups, store, rerender) => {
    const frag = document.createDocumentFragment();
    groups.forEach((group, index) => {
      const box = oqEl('div');
      if (group.heading) {
        box.appendChild(oqEl('h5', 'oq-form-subheading' + (index === 0 ? ' first' : ''), group.heading));
      }
      const grid = oqEl('div', 'oq-edit-grid');
      group.fields.forEach((field) => grid.appendChild(oqRenderField(field, store, rerender)));
      box.appendChild(grid);
      frag.appendChild(box);
    });
    return frag;
  };

  const oqLegend = () => {
    const legend = oqEl('span', 'oq-prefill-legend');
    legend.appendChild(oqEl('i'));
    legend.appendChild(document.createTextNode('Marked fields came from Create Transaction'));
    return legend;
  };

  const oqCloseButton = (label) => {
    const button = oqEl('button', 'oq-panel-close');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.innerHTML = OQ_CLOSE_ICON;
    return button;
  };

  // ---- Parties panel: roster, then one party at a time --------------------
  const partiesBody = document.createElement('div');
  partiesBody.className = 'oq-parties-panel';
  partiesBody.style.display = 'none';

  function oqRenderParties() {
    partiesBody.innerHTML = '';
    const openParty = oqParties.filter((party) => party.id === oqState.openPartyId)[0] || null;
    const bar = oqEl('div', 'oq-panel-bar oq-panel-heading');

    if (!openParty) {
      bar.appendChild(oqEl('h2', null, 'Parties'));
      const add = oqEl('button', 'oq-add-party');
      add.type = 'button';
      add.innerHTML = OQ_PLUS_ICON + 'Add party';
      add.addEventListener('click', () => showPartyModal());
      bar.appendChild(add);
      bar.appendChild(oqCloseButton('Close parties panel'));
      partiesBody.appendChild(bar);

      const list = oqEl('div', 'oq-party-list');
      oqPartyGroupOrder.forEach((group) => {
        const members = oqParties.filter(
          (party) => oqPartyGroupOf(oqPartyDisplay(party).role) === group.key
        );
        if (!members.length) return;
        const collapsed = oqState.collapsedGroups.indexOf(group.key) !== -1;
        const section = oqEl('section', 'oq-party-group' + (collapsed ? ' is-collapsed' : ''));
        const heading = oqEl('h3');
        const toggle = oqEl('button');
        toggle.type = 'button';
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.innerHTML = OQ_CHEVRON_ICON;
        toggle.appendChild(document.createTextNode(group.label));
        toggle.appendChild(oqEl('small', null, String(members.length)));
        toggle.addEventListener('click', () => {
          oqState.collapsedGroups = collapsed
            ? oqState.collapsedGroups.filter((key) => key !== group.key)
            : oqState.collapsedGroups.concat([group.key]);
          oqRenderParties();
        });
        heading.appendChild(toggle);
        section.appendChild(heading);
        if (collapsed) { list.appendChild(section); return; }
        members.forEach((party) => {
          const info = oqPartyDisplay(party);
          const card = oqEl('button', 'oq-party-summary');
          card.type = 'button';
          card.appendChild(oqEl('span', 'oq-party-avatar', info.initials));
          const copy = oqEl('span');
          copy.appendChild(oqEl('b', null, info.name));
          copy.appendChild(oqEl('small', null, info.role));
          card.appendChild(copy);
          const chevron = document.createElement('span');
          chevron.innerHTML = OQ_CHEVRON_ICON;
          card.appendChild(chevron.firstChild);
          card.addEventListener('click', () => {
            oqState.openPartyId = party.id;
            oqState.openLinks = null;
            oqRenderParties();
            partiesBody.scrollTop = 0;
          });
          section.appendChild(card);
        });
        list.appendChild(section);
      });
      partiesBody.appendChild(list);
      return;
    }

    const back = oqEl('button', 'oq-panel-back');
    back.type = 'button';
    back.innerHTML = OQ_CHEVRON_ICON;
    back.appendChild(document.createTextNode('Parties'));
    back.addEventListener('click', () => {
      oqState.openPartyId = null;
      oqState.openLinks = null;
      oqRenderParties();
      partiesBody.scrollTop = 0;
    });
    bar.appendChild(back);
    bar.appendChild(oqCloseButton('Close parties panel'));
    partiesBody.appendChild(bar);

    const info = oqPartyDisplay(openParty);
    const store = {
      scope: openParty.id,
      linked: openParty.id === 'primary',
      values: openParty.id === 'primary'
        ? Object.assign({}, openParty.values, oqShared)
        : openParty.values,
      baseline: openParty.baseline,
      set: (key, value) => {
        if (openParty.id === 'primary' && oqSharedPartyKeys.indexOf(key) !== -1) oqShared[key] = value;
        else openParty.values[key] = value;
      }
    };

    const body = oqEl('div', 'oq-panel-body');
    const intro = oqEl('header', 'oq-panel-intro');
    intro.appendChild(oqEl('h3', null, info.name));
    intro.appendChild(oqEl('p', null, info.role));
    intro.appendChild(oqLegend());
    body.appendChild(intro);
    body.appendChild(oqRenderGroups(oqPartyGroups(openParty), store, oqRenderParties));
    partiesBody.appendChild(body);
  }

  // ---- Details panel: one section at a time -------------------------------
  const detailsBody = document.createElement('div');
  detailsBody.className = 'oq-details-panel';
  detailsBody.style.display = 'none';

  function oqRenderDetails() {
    detailsBody.innerHTML = '';
    const section = oqSections.filter((item) => item.key === oqState.section)[0] || oqSections[0];

    const bar = oqEl('div', 'oq-panel-bar oq-panel-heading');
    bar.appendChild(oqEl('h2', null, 'Details'));
    bar.appendChild(oqCloseButton('Close details panel'));
    detailsBody.appendChild(bar);

    const tabs = oqEl('nav', 'oq-section-tabs');
    tabs.setAttribute('aria-label', 'Transaction detail sections');
    oqSections.forEach((item) => {
      const button = oqEl('button', null, item.label);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(oqState.section === item.key));
      button.addEventListener('click', () => {
        oqState.section = item.key;
        oqState.openLinks = null;
        oqRenderDetails();
        detailsBody.scrollTop = 0;
      });
      tabs.appendChild(button);
    });
    detailsBody.appendChild(tabs);

    const store = {
      scope: 'transaction',
      linked: true,
      values: oqShared,
      baseline: oqSharedBaseline,
      set: (key, value) => { oqShared[key] = value; }
    };
    const body = oqEl('div', 'oq-panel-body');
    const intro = oqEl('header', 'oq-panel-intro');
    intro.appendChild(oqEl('h3', null, section.title));
    intro.appendChild(oqEl('p', null, section.sub));
    if (section.prefill) intro.appendChild(oqLegend());
    body.appendChild(intro);
    body.appendChild(oqRenderGroups(section.groups, store, oqRenderDetails));
    detailsBody.appendChild(body);
  }

  document.addEventListener('mousedown', (event) => {
    if (!oqState.openLinks) return;
    if (event.target.closest('.oq-destination-pop, .oq-destination-toggle')) return;
    oqState.openLinks = null;
    oqRenderParties();
    oqRenderDetails();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && oqState.openLinks) {
      oqState.openLinks = null;
      oqRenderParties();
      oqRenderDetails();
    }
  });

  oqRenderParties();
  oqRenderDetails();
  context.appendChild(partiesBody);
  context.appendChild(detailsBody);
  // Rail order matches the app: 0 = Details, 1 = Parties, 2 = Docs, 3 = Assistant.
  const switchMode = (mode) => {
    modeButtons.forEach((button, index) => button.classList.toggle('active', index === mode));
    detailsBody.style.display = mode === 0 ? '' : 'none';
    partiesBody.style.display = mode === 1 ? '' : 'none';
    docsBody.style.display = mode === 2 ? '' : 'none';
    assistantBody.style.display = mode === 3 ? '' : 'none';
    if (mode !== 3) {
      context.querySelector('header')?.remove();
      context.classList.add('oq-context-headless');
      return;
    }
    context.classList.remove('oq-context-headless');
    let header = context.querySelector('header');
    if (!header) {
      header = document.createElement('header');
      context.insertBefore(header, context.firstChild);
    }
    header.className = 'oq-panel-heading';
    header.innerHTML = '<h2>Assistant</h2><button class="oq-panel-close" aria-label="Close panel">×</button>';
  };
  modeButtons.forEach((button, index) => button.addEventListener('click', () => switchMode(index)));
  modeButtons.forEach((button) => button.addEventListener('click', () => {
    context.style.display = '';
    document.querySelector('.oq-editor').classList.remove('oq-panel-collapsed');
  }));
  document.addEventListener('click', (event) => {
    if (event.target.closest('.oq-panel-close')) {
      context.style.display = 'none';
      document.querySelector('.oq-editor').classList.add('oq-panel-collapsed');
    }
  });
}

const toolAction = (label) =>
  Array.from(document.querySelectorAll('.fe-tool-actions > button'))
    .find((button) => button.textContent.trim() === label);
toolAction('Download')?.addEventListener('click', () => {
  const frame = document.querySelector('.oq-pdf-stage[data-page="' + (current || '') + '"] .oq-pdf-frame')
    || document.querySelector('.oq-pdf-frame');
  const link = document.createElement('a');
  link.href = frame.src.split('#')[0];
  link.download = 'orqestron-form.png';
  link.click();
});
toolAction('Sign')?.addEventListener('click', () => showNotice('Signing requires an e-signature provider integration.'));
document.querySelector('.fe-info')?.addEventListener('click', () => showNotice('Fillable PDF fields are highlighted in blue.'));
</script>
</body>
</html>`;

const transactionsSource = await fetchSource("/transactions");
const transactionsCss = await inlineStyles(transactionsSource);
const transactionsBody = extractBody(transactionsSource)
  .replaceAll('href="/transactions"', 'href="transactions.html"')
  .replaceAll('href="/"', 'href="index.html"');
const transactionsHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Transactions — Orqestron</title>
  <style>${transactionsCss}</style>
</head>
<body>${transactionsBody}</body>
</html>`;

await Promise.all([
  writeFile(new URL("../index.html", import.meta.url), html),
  writeFile(new URL("../transactions.html", import.meta.url), transactionsHtml),
]);
