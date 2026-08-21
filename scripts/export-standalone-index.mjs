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
  const detailsBody = document.createElement('div');
  detailsBody.className = 'oq-details-parties';
  detailsBody.style.display = 'none';
  const staticParty = [
    ['First name', 'Vu'], ['Last name', 'Nguyen'],
    ['Email', 'vu.nguyen@c0x12c.com', true],
    ['Transaction role', 'Buyer Agent', true, '', '', 'select', ['Buyer Agent', 'Seller Agent', 'Buyer', 'Seller', 'Transaction Coordinator']]
  ];
  const staticProperty = [
    ['Property address', '2458 Maplewood Ave', true], ['Unit #', '12B'], ['City', 'Los Angeles'],
    ['State', 'CA'], ['Zip Code', '90026'], ['County', 'LOS ANGELES'],
    ['Type', 'Commercial', false, '', '', 'select', ['Commercial', 'Condominium', 'Single Family', 'Multi-Family', 'Land']],
    ['Year built or manufactured', '2018'], ['APN', '5401-021-045'], ['Lot', '12'], ['Block', 'B'],
    ['Subdivision', 'Maplewood Heights', true], ['Taxes', '6,850', false, '$'],
    ['Legal Description', 'Unit 12B of Maplewood Heights Condominium, City of Los Angeles, County of Los Angeles, State of California', true, '', '', 'textarea']
  ];
  const staticListing = [
    ['MLS Number', 'CA12345678'], ['Listing Date', '08/18/2026'], ['Expiration Date', '08/31/2026'],
    ['Listing Agreement Date', '08/15/2026'], ['Previous Price', '845,000', false, '$'],
    ['Listed Price', '825,000', false, '$'], ['Trust Deed Balance 1', '350,000', false, '$'],
    ['Trust Deed Balance 2', '', false, '$'], ['Trust Deed Balance 3', '', false, '$'],
    ['Other Liens', '', false, '$'], ['Other Liens (Description)', '', true],
    ['Other Encumbrances', '', false, '$'], ['Other Encumbrances (Description)', '', true],
    ['Includes', 'Refrigerator, washer, dryer, kitchen appliances', true, '', '', 'textarea'],
    ['Excludes', 'Seller’s personal furniture and staging items', true, '', '', 'textarea'],
    ['Listing Remarks', 'Bright 2-bedroom condo in a desirable Los Angeles neighborhood with updated kitchen and convenient access to shopping and transit.', true, '', '', 'textarea']
  ];
  const staticPurchase = [
    ['Purchase Price', '820,000', false, '$'], ['Escrow Number', 'ESC-2026-0818-2458'],
    ['Cash Balance', '164,000', false, '$'], ['Transfer Fees', '2,500', false, '$'],
    ['Deposit 1', '10,000', false, '$'], ['Deposit 2', '15,000', false, '$'],
    ['Appraisal Contingency Waived', '', false, '', '', 'select', ['Yes', 'No']],
    ['Loan Contingency Waived', '', false, '', '', 'select', ['Yes', 'No']],
    ['Purchase Remarks', 'Buyer to obtain conventional financing. Seller to provide standard disclosures.', true, '', '', 'textarea'],
    ['Other Financing Terms', '80% conventional loan, 30-year fixed', true, '', '', 'textarea']
  ];
  const staticDates = [
    ['Offer Accepted', '08/18/26'], ['Purchase Agreement Date', '08/18/26'],
    ['Earnest Money Deposit Due', '08/21/26'], ['Seller Disclosure Due', '08/25/26'],
    ['Possession Date', '08/31/26'], ['Sale of Buyer Property Contingency', '08/31/26'],
    ['Appraisal Contingency Due', '09/04/26'], ['Inspection Contingency Due', '09/04/26'],
    ['Loan Contingency Due', '09/08/26'], ['Close of Escrow', '09/17/26']
  ];
  const staticListingCommission = [
    ['Listing Commission Amount', '24,600', false, '$'], ['Listing Commission Percent', '3', false, '', '%'],
    ['Listing Net Office Commission', '22,140', false, '$'], ['Listing TC Fee', '350', false, '$'],
    ['Listing Other Deductions', '2,110', false, '$'], ['Listing Deduction Details', 'Brokerage split and admin fee', true],
    ['Listing Agent 1 Split Percent', '70', false, '', '%'], ['Listing Agent 1 Split Amount', '17,220', false, '$'],
    ['Listing Agent 1 Net Commission', '17,220', false, '$'], ['Listing Agent 2 Split Percent', '30', false, '', '%'],
    ['Listing Agent 2 Split Amount', '7,380', false, '$'], ['Listing Agent 2 Net Commission', '7,380', false, '$']
  ];
  const staticPurchaseCommission = [
    ['Purchase Commission Amount', '24,600', false, '$'], ['Purchase Commission Percent', '3', false, '', '%'],
    ['Purchase Net Office Commission', '22,140', false, '$'], ['Purchase TC Fee', '350', false, '$'],
    ['Purchase Other Deductions', '2,110', false, '$'], ['Purchase Deduction Details', 'Brokerage split and admin fee', true],
    ['Purchase Agent 1 Split Percent', '60', false, '', '%'], ['Purchase Agent 1 Split Amount', '14,760', false, '$'],
    ['Purchase Agent 1 Net Commission', '14,760', false, '$'], ['Purchase Agent 2 Split Percent', '40', false, '', '%'],
    ['Purchase Agent 2 Split Amount', '9,840', false, '$'], ['Purchase Agent 2 Net Commission', '9,840', false, '$']
  ];
  const escapeStaticValue = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const staticDestinations = (label) => {
    if (label === 'First name' || label === 'Last name') return [['AD', '1, 2'], ['BRBC', '1, 7, 8'], ['PRBS', '1']];
    if (label === 'Email') return [['BRBC', '7']];
    if (label === 'Transaction role') return [['AD', '1, 2'], ['BRBC', '1'], ['PRBS', '1']];
    if (['Property address', 'Unit #', 'City', 'State', 'Zip Code', 'County', 'Type'].includes(label)) return [['BRBC', '3']];
    if (label === 'Purchase Commission Amount' || label === 'Purchase Commission Percent') return [['BRBC', '3']];
    return [];
  };
  const staticDestinationMarkup = (destinations) => destinations.length
    ? '<span class="oq-field-destinations"><small>Appears in</small>' + destinations.map((destination) => '<em>' + destination[0] + ' · p.' + destination[1] + '</em>').join('') + '</span>'
    : '<span class="oq-field-destinations"><small>Transaction record only</small></span>';
  const staticGrid = (fields) => '<div class="oq-edit-grid">' + fields.map((field) => {
    const options = field[6] || [];
    const destinations = staticDestinations(field[0]);
    const control = field[5] === 'textarea'
      ? '<textarea rows="3">' + escapeStaticValue(field[1]) + '</textarea>'
      : field[5] === 'select'
        ? '<select><option value="">Not set</option>' + options.map((option) => '<option' + (option === field[1] ? ' selected' : '') + '>' + escapeStaticValue(option) + '</option>').join('') + '</select>'
        : '<input value="' + escapeStaticValue(field[1]) + '">';
    return '<label' + (field[2] ? ' class="wide"' : '') + '><span class="oq-edit-label">' + field[0] + '</span><div class="oq-edit-control' + (destinations.length ? ' is-linked' : '') + '">' + (field[3] ? '<i>' + field[3] + '</i>' : '') + control + (field[4] ? '<i>' + field[4] + '</i>' : '') + '</div>' + staticDestinationMarkup(destinations) + '</label>';
  }).join('') + '</div>';
  const staticAccordion = (id, title, meta, content, open) => '<section class="oq-detail-accordion' + (open ? ' open' : '') + '"><button class="oq-accordion-toggle" type="button" aria-expanded="' + String(open) + '" aria-controls="' + id + '-panel"><span><b>' + title + '</b>' + (meta ? '<small>' + meta + '</small>' : '') + '</span><svg class="fe-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9l5 5 5-5"></path></svg></button><div class="oq-accordion-panel" id="' + id + '-panel"><div>' + content + '</div></div></section>';
  const partyContent = '<div class="oq-party-summary"><span class="oq-party-avatar">VN</span><span><b>Vu Nguyen</b><small>Buyer Agent · vu.nguyen@c0x12c.com</small></span></div>' + staticGrid(staticParty) + '<button class="oq-add-party">＋ Add party</button>';
  const purchaseContent = staticGrid(staticPurchase) + '<h5 class="oq-form-subheading">Key Dates</h5>' + staticGrid(staticDates);
  const commissionContent = '<h5 class="oq-form-subheading first">Listing Commission</h5>' + staticGrid(staticListingCommission) + '<h5 class="oq-form-subheading">Purchase Commission</h5>' + staticGrid(staticPurchaseCommission);
  const accordionsHtml = '<div class="oq-accordion-stack">' +
    staticAccordion('parties', 'Parties', '1 person · 3 linked forms', partyContent, true) +
    staticAccordion('property', 'Property Information', '7 of 14 linked · BRBC p.3', staticGrid(staticProperty), false) +
    staticAccordion('listing', 'Listing Information', '16 fields · transaction only', staticGrid(staticListing), false) +
    staticAccordion('purchase', 'Purchase Information', '20 fields · transaction only', purchaseContent, false) +
    staticAccordion('commission', 'Commission', '2 of 24 linked · BRBC p.3', commissionContent, false) + '</div>';
  detailsBody.innerHTML = '<div class="oq-details-heading oq-panel-heading"><h3>Details / Parties</h3><button class="oq-add">＋ Add</button></div><section class="oq-transaction-details"><div class="oq-transaction-summary-head"><span><small>Property</small><h4>2458 Maplewood Ave 12B</h4><p>Los Angeles, CA 90026</p></span><em>Under Contract</em></div><dl><div><dt>Type</dt><dd>Purchase</dd></div><div><dt>Representation</dt><dd>Buyer</dd></div></dl><div class="oq-linking-summary"><span>✓</span><span><b>Linked transaction data</b><small>Edits update AD, BRBC and PRBS at the pages shown below.</small></span></div></section>' + accordionsHtml;
  detailsBody.querySelectorAll('.oq-accordion-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.closest('.oq-detail-accordion');
      const shouldOpen = !selected.classList.contains('open');
      detailsBody.querySelectorAll('.oq-detail-accordion').forEach((section) => {
        const open = shouldOpen && section === selected;
        section.classList.toggle('open', open);
        section.querySelector('.oq-accordion-toggle').setAttribute('aria-expanded', String(open));
      });
    });
  });
  context.appendChild(detailsBody);
  const switchMode = (mode) => {
    modeButtons.forEach((button, index) => button.classList.toggle('active', index === mode));
    if (mode === 0) {
      context.querySelector('header')?.remove();
      context.classList.add('oq-context-headless');
      docsBody.style.display = '';
      assistantBody.style.display = 'none';
      detailsBody.style.display = 'none';
      return;
    }
    if (mode === 2) {
      context.querySelector('header')?.remove();
      context.classList.add('oq-context-headless');
      docsBody.style.display = 'none';
      assistantBody.style.display = 'none';
      detailsBody.style.display = '';
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
    docsBody.style.display = 'none';
    assistantBody.style.display = '';
    detailsBody.style.display = 'none';
  };
  modeButtons[0].addEventListener('click', () => switchMode(0));
  modeButtons[1].addEventListener('click', () => switchMode(1));
  modeButtons[2]?.addEventListener('click', () => switchMode(2));
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
