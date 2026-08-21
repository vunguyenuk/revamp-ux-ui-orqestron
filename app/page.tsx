"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  pdfFieldsByDocument,
  type PdfFieldDefinition,
} from "./pdf-field-data";

type PdfDocumentCode = keyof typeof pdfFieldsByDocument;

type IconName =
  | "close"
  | "edit"
  | "chevron"
  | "plus"
  | "save"
  | "download"
  | "sign"
  | "mail"
  | "print"
  | "file"
  | "trash"
  | "search"
  | "spark"
  | "mic"
  | "send"
  | "history"
  | "check"
  | "grip"
  | "info"
  | "assistant"
  | "parties"
  | "user";
const paths: Record<IconName, React.ReactNode> = {
  close: <path d="M5 5l14 14M19 5L5 19" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13 7l4 4" />
    </>
  ),
  chevron: <path d="M7 9l5 5 5-5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  save: (
    <>
      <path d="M5 3h12l2 2v16H5z" />
      <path d="M8 3v6h8V3M8 21v-7h8v7" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M8 11l4 4 4-4" />
      <path d="M5 20h14" />
    </>
  ),
  sign: (
    <>
      <path d="M4 18c3-5 4-8 6-8 2 0-1 7 1 7 1 0 2-3 3-3s0 3 2 3c1 0 2-1 4-3" />
      <path d="M4 21h16" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  print: (
    <>
      <path d="M6 9V3h12v6M6 18h12v3H6z" />
      <rect x="3" y="9" width="18" height="9" rx="2" />
    </>
  ),
  file: (
    <>
      <path d="M5 3h11l3 3v15H5Z" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l5 5" />
    </>
  ),
  spark: <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2Z" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  send: (
    <>
      <path d="M3 11l18-8-8 18-2-8z" />
      <path d="M11 13l5-5" />
    </>
  ),
  history: (
    <>
      <path d="M4 12a8 8 0 1 0 3-6" />
      <path d="M4 4v5h5M12 8v5l3 2" />
    </>
  ),
  check: <path d="M5 12l5 5L20 7" />,
  grip: (
    <>
      <circle cx="8" cy="6" r="1" />
      <circle cx="8" cy="12" r="1" />
      <circle cx="8" cy="18" r="1" />
      <circle cx="16" cy="6" r="1" />
      <circle cx="16" cy="12" r="1" />
      <circle cx="16" cy="18" r="1" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7h.01" />
    </>
  ),
  assistant: (
    <>
      <path d="M5 17V9M9 20V5M13 16V10M17 18v-5" />
      <path d="M19 4l.8 2.2L22 7l-2.2.8L19 10l-.8-2.2L16 7l2.2-.8Z" />
    </>
  ),
  parties: (
    <>
      <path d="M5 10l7-5 7 5" />
      <circle cx="12" cy="13" r="3" />
      <path d="M7.5 21a4.5 4.5 0 0 1 9 0" />
    </>
  ),
};
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="fe-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

type LibraryKey = "car" | "statutory";

const libraries: { key: LibraryKey; name: string }[] = [
  { key: "car", name: "California Association of REALTORS®" },
  { key: "statutory", name: "California Statutory" },
];

const formSections: {
  section: string;
  tone: "warm" | "sage" | "violet" | "slate";
  items: { key: string; label: string }[];
}[] = [
  {
    section: "Residential Forms",
    tone: "warm",
    items: [
      { key: "purchase", label: "Purchase Agreements" },
      { key: "supplements", label: "Purchase Supplements & Addenda" },
      { key: "disclosures", label: "Disclosure Forms" },
      { key: "listing", label: "Listing Agreements" },
      { key: "construction", label: "New Construction" },
      { key: "rental", label: "Rental / Lease / Property Mgmt" },
      { key: "other", label: "Other Agreements" },
    ],
  },
  {
    section: "Non-Residential Forms",
    tone: "sage",
    items: [
      { key: "cre-agreements", label: "Listing & Purchase Agreements" },
      { key: "cre-exchange", label: "Exchange Agreements and Lease" },
      { key: "cre-business", label: "Business Opportunity" },
    ],
  },
  {
    section: "Misc",
    tone: "violet",
    items: [
      { key: "health", label: "Health & Entry Advisories" },
      { key: "office", label: "Office, Admin, Trust Fund" },
    ],
  },
];

type CatalogForm = {
  code: string;
  title: string;
  group: string;
  library: LibraryKey;
};

const formCatalog: CatalogForm[] = [
  // Purchase agreements
  { code: "RPA", title: "California Residential Purchase Agreement and Joint Escrow Instructions", group: "purchase", library: "car" },
  { code: "RIPA", title: "Residential Income Property Purchase Agreement", group: "purchase", library: "car" },
  { code: "VLPA", title: "Vacant Land Purchase Agreement and Joint Escrow Instructions", group: "purchase", library: "car" },
  { code: "MHPA", title: "Manufactured Home Purchase Agreement", group: "purchase", library: "car" },
  { code: "PPA", title: "Probate Purchase Agreement and Joint Escrow Instructions", group: "purchase", library: "car" },
  { code: "SCO", title: "Seller Counter Offer", group: "purchase", library: "car" },
  { code: "BCO", title: "Buyer Counter Offer", group: "purchase", library: "car" },
  { code: "SMCO", title: "Seller Multiple Counter Offer", group: "purchase", library: "car" },
  // Supplements and addenda
  { code: "ADM-GEN", title: "Addendum – Generic", group: "supplements", library: "car" },
  { code: "ADM", title: "Addendum No. 1", group: "supplements", library: "car" },
  { code: "ADM", title: "Addendum No. 2", group: "supplements", library: "car" },
  { code: "ADM", title: "Addendum No. 3", group: "supplements", library: "car" },
  { code: "ADM", title: "Addendum No. 4", group: "supplements", library: "car" },
  { code: "AEA", title: "Amendment of Existing Agreement Terms – 1", group: "supplements", library: "car" },
  { code: "AEA", title: "Amendment of Existing Agreement Terms – 2", group: "supplements", library: "car" },
  { code: "AEA", title: "Amendment of Existing Agreement Terms – 3", group: "supplements", library: "car" },
  { code: "AFA", title: "Assumed Financing Addendum", group: "supplements", library: "car" },
  { code: "AGAD", title: "Agricultural Addendum", group: "supplements", library: "car" },
  { code: "AOAA", title: "Assignment of Agreement Addendum", group: "supplements", library: "car" },
  { code: "APD", title: "Amendment to Prior Disclosure", group: "supplements", library: "car" },
  { code: "ASA", title: "Additional Signature Addendum – 1", group: "supplements", library: "car" },
  { code: "ASA", title: "Additional Signature Addendum – 2", group: "supplements", library: "car" },
  { code: "ATCA", title: "Animal Terms and Conditions Addendum", group: "supplements", library: "car" },
  { code: "COP", title: "Contingency for Sale of Buyer's Property", group: "supplements", library: "car" },
  { code: "CR", title: "Contingency Removal", group: "supplements", library: "car" },
  { code: "DCE", title: "Demand to Close Escrow", group: "supplements", library: "car" },
  { code: "EXTN", title: "Extension of Time Addendum", group: "supplements", library: "car" },
  { code: "NBP", title: "Notice to Buyer to Perform", group: "supplements", library: "car" },
  { code: "NSP", title: "Notice to Seller to Perform", group: "supplements", library: "car" },
  { code: "RR", title: "Request for Repair", group: "supplements", library: "car" },
  { code: "SIP", title: "Seller in Possession Addendum", group: "supplements", library: "car" },
  { code: "TOPA", title: "Tenant Occupied Property Addendum", group: "supplements", library: "car" },
  // Disclosures
  { code: "AD", title: "Disclosure Regarding Real Estate Agency Relationship (Buyer)", group: "disclosures", library: "car" },
  { code: "AD", title: "Disclosure Regarding Real Estate Agency Relationship (Seller)", group: "disclosures", library: "car" },
  { code: "AC", title: "Confirmation of Real Estate Agency Relationships", group: "disclosures", library: "car" },
  { code: "AB", title: "Buyer's Affidavit", group: "disclosures", library: "car" },
  { code: "AS", title: "Seller's Affidavit of Non-foreign Status (FIRPTA) – 1", group: "disclosures", library: "car" },
  { code: "AS", title: "Seller's Affidavit of Non-foreign Status (FIRPTA) – 2", group: "disclosures", library: "car" },
  { code: "AVID", title: "Agent Visual Inspection Disclosure", group: "disclosures", library: "car" },
  { code: "FLD", title: "Lead-Based Paint and Lead-Based Paint Hazards Disclosure", group: "disclosures", library: "car" },
  { code: "MCA", title: "Market Conditions Advisory", group: "disclosures", library: "car" },
  { code: "PRBS", title: "Possible Representation of More Than One Buyer or Seller", group: "disclosures", library: "car" },
  { code: "SBSA", title: "Statewide Buyer and Seller Advisory", group: "disclosures", library: "car" },
  { code: "SPQ", title: "Seller Property Questionnaire", group: "disclosures", library: "car" },
  { code: "WFA", title: "Wire Fraud and Electronic Funds Transfer Advisory", group: "disclosures", library: "car" },
  // Listing agreements
  { code: "RLA", title: "Residential Listing Agreement (Exclusive Authorization and Right to Sell)", group: "listing", library: "car" },
  { code: "BRBC", title: "Buyer Representation and Broker Compensation Agreement", group: "listing", library: "car" },
  { code: "VLLA", title: "Vacant Land Listing Agreement", group: "listing", library: "car" },
  { code: "PLA", title: "Probate Listing Agreement", group: "listing", library: "car" },
  { code: "AAA", title: "Additional Agent Acknowledgment", group: "listing", library: "car" },
  { code: "ABA", title: "Additional Broker Acknowledgment", group: "listing", library: "car" },
  { code: "ACS", title: "Agent Commission Sharing Agreement", group: "listing", library: "car" },
  { code: "SELM", title: "Seller Instruction to Exclude Listing from the MLS", group: "listing", library: "car" },
  // New construction
  { code: "NCPA", title: "New Construction Purchase Agreement and Joint Escrow Instructions", group: "construction", library: "car" },
  { code: "ABSPA", title: "Already-Built Subdivision Purchase Agreement and Joint Escrow Instruction", group: "construction", library: "car" },
  { code: "SUBPA", title: "Subdivision Purchase Agreement Addendum", group: "construction", library: "car" },
  { code: "HOWA", title: "Home Warranty Advisory", group: "construction", library: "car" },
  // Rental / lease / property management
  { code: "LR", title: "Residential Lease or Month-to-Month Rental Agreement", group: "rental", library: "car" },
  { code: "PMA", title: "Property Management Agreement", group: "rental", library: "car" },
  { code: "LRA", title: "Lease / Rental Application", group: "rental", library: "car" },
  { code: "RLAS", title: "Residential Lease After Sale", group: "rental", library: "car" },
  { code: "MIMO", title: "Move In / Move Out Inspection", group: "rental", library: "car" },
  { code: "NTT", title: "Notice of Termination of Tenancy", group: "rental", library: "car" },
  { code: "KLI", title: "Keysafe / Lockbox Addendum", group: "rental", library: "car" },
  // Other agreements
  { code: "ARB", title: "Arbitration Agreement", group: "other", library: "car" },
  { code: "ARC", title: "Authorization to Receive and Convey Information", group: "other", library: "car" },
  { code: "CAN", title: "Cancellation of Contract, Disbursement of Deposit and Cancellation of Escrow", group: "other", library: "car" },
  { code: "RFA", title: "Referral Fee Agreement", group: "other", library: "car" },
  { code: "JCA", title: "Joint Escrow Cancellation Advisory", group: "other", library: "car" },
  // Non-residential
  { code: "CPA", title: "Commercial Property Purchase Agreement and Joint Escrow Instructions", group: "cre-agreements", library: "car" },
  { code: "CLA", title: "Commercial Listing Agreement", group: "cre-agreements", library: "car" },
  { code: "CIP", title: "Commercial Income Property Purchase Agreement", group: "cre-agreements", library: "car" },
  { code: "CL", title: "Commercial Lease Agreement", group: "cre-exchange", library: "car" },
  { code: "CLI", title: "Commercial Lease Tenant Improvements Addendum", group: "cre-exchange", library: "car" },
  { code: "EA", title: "Exchange Addendum (1031)", group: "cre-exchange", library: "car" },
  { code: "OPT", title: "Option to Purchase Addendum", group: "cre-exchange", library: "car" },
  { code: "BOPA", title: "Business Purchase Agreement and Joint Escrow Instructions", group: "cre-business", library: "car" },
  { code: "BOLA", title: "Business Listing Agreement", group: "cre-business", library: "car" },
  { code: "BODS", title: "Business Opportunity Disclosure Statement", group: "cre-business", library: "car" },
  // Misc
  { code: "PEAD-V", title: "Property Entry Advisory and Declaration", group: "health", library: "car" },
  { code: "HEA", title: "Health Entry Advisory Addendum", group: "health", library: "car" },
  { code: "ICA", title: "Independent Contractor Agreement", group: "office", library: "car" },
  { code: "TFR", title: "Trust Fund Records and Reconciliation", group: "office", library: "car" },
  { code: "ESA", title: "Electronic Signature and Delivery Consent", group: "office", library: "car" },
  { code: "BRR", title: "Broker Records Retention Checklist", group: "office", library: "car" },
  // California statutory library
  { code: "TDS", title: "Real Estate Transfer Disclosure Statement (Statutory Form)", group: "disclosures", library: "statutory" },
  { code: "MHTDS", title: "Manufactured Home Transfer Disclosure Statement", group: "disclosures", library: "statutory" },
  { code: "NHDS", title: "Natural Hazard Disclosure Statement (Statutory Form)", group: "disclosures", library: "statutory" },
  { code: "LPD", title: "Federal Lead-Based Paint Disclosure (Statutory Form)", group: "disclosures", library: "statutory" },
  { code: "WHSD", title: "Water Heater and Smoke Detector Statement of Compliance", group: "disclosures", library: "statutory" },
  { code: "MRD", title: "Mello-Roos and 1915 Bond Assessment Disclosure", group: "disclosures", library: "statutory" },
  { code: "MOD", title: "Military Ordnance Location Disclosure", group: "disclosures", library: "statutory" },
  { code: "WSD", title: "Window Security Bars and Safety Release Disclosure", group: "disclosures", library: "statutory" },
];

const formName = (item: CatalogForm) => `[${item.code}] ${item.title}`;

type PdfSelection = { src: string; page: number; label: string; title: string };

function previewImage(pdf: PdfSelection) {
  const page =
    pdf.label === "BRBC" ? String(pdf.page).padStart(2, "0") : pdf.page;
  return `/form-pages/${pdf.label.toLowerCase()}-${page}.png`;
}

type DocumentPage = PdfSelection & { thumb: string; displayPage: number };

const AD_SRC =
  "/forms/highlighted/AD_Disclosure_Real_Estate_Agency_Relationship_Buyer-1.2-highlighted.pdf";
const BRBC_SRC =
  "/forms/highlighted/BRBC_Buyer_Representation_and_Broker_Compensation_Agreement-1.3-highlighted.pdf";
const PRBS_SRC =
  "/forms/highlighted/PRBS_Possible_Representation_More_Than_One-1.2-highlighted.pdf";

/** Every page of every document in the transaction, in packet order. */
const documentPages: DocumentPage[] = [
  ...Array.from({ length: 3 }, (_, index) => ({
    thumb: `/form-thumbnails/ad-${index + 1}.png`,
    src: AD_SRC,
    page: index + 1,
    displayPage: index + 1,
    label: "AD",
    title: "Disclosure Regarding Real Estate Agency Relationship (Buyer)",
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    thumb: `/form-thumbnails/brbc-page-${String(index + 1).padStart(2, "0")}.png`,
    src: BRBC_SRC,
    page: index + 1,
    displayPage: index + 4,
    label: "BRBC",
    title: "Buyer Representation and Broker Compensation Agreement",
  })),
  {
    thumb: "/form-thumbnails/prbs.png",
    src: PRBS_SRC,
    page: 1,
    displayPage: 17,
    label: "PRBS",
    title: "Possible Representation of More Than One Buyer or Seller",
  },
];

const pageKey = (page: { label: string; page: number }) =>
  `${page.label}-${page.page}`;

function PartyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="oq-party-backdrop" role="presentation">
      <section className="oq-party-modal" role="dialog" aria-modal="true">
        <header>
          <b>Add Party</b>
          <button onClick={onClose} aria-label="Close Add Party">
            <Icon name="close" />
          </button>
        </header>
        <div className="oq-party-scroll">
          <div className="oq-party-profile">
            <span>
              <Icon name="user" size={34} />
            </span>
            <div>
              <h2>New Contact</h2>
              <button>Upload photo</button>
            </div>
          </div>
          <label>
            Transaction role(s)
            <select defaultValue="Buyer 2">
              <option>Buyer 2</option>
              <option>Buyer 1</option>
              <option>Seller</option>
            </select>
          </label>
          <label className="oq-party-invite">
            <input type="checkbox" /> Invite to transaction <small>?</small>
          </label>
          <h3>Buyer Information</h3>
          <label>
            Buyer entity type *
            <select defaultValue="">
              <option value="" disabled>
                Please select type
              </option>
              <option>Individual</option>
              <option>Company</option>
              <option>Trust</option>
            </select>
          </label>
          <div className="oq-party-grid">
            <label>
              First name *<input />
            </label>
            <label>
              Last name
              <input />
            </label>
          </div>
          <label>
            Title
            <input placeholder="ex. Principal" />
          </label>
          <div className="oq-party-grid">
            <label>
              Email
              <input type="email" />
            </label>
            <label>
              Phone number
              <input placeholder="(   )   -" />
            </label>
          </div>
          <label>
            Fax number
            <input placeholder="(   )   -" />
          </label>
          <label>Buyer&apos;s mailing address</label>
          <div className="oq-party-grid">
            <input placeholder="Street address" />
            <input placeholder="Unit #" />
          </div>
          <div className="oq-party-address">
            <input placeholder="City" />
            <input placeholder="State" />
            <input placeholder="Zip Code" />
          </div>
        </div>
        <footer>
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={onClose}>
            Save
          </button>
        </footer>
      </section>
    </div>
  );
}

function PageThumbnailRail({
  activeKey,
  onSelect,
}: {
  activeKey: string;
  onSelect: (page: DocumentPage) => void;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);

  // Follow the canvas: keep the active thumbnail in view without letting
  // scrollIntoView move the page behind it.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("button.active");
    if (!list || !active) return;
    const top = active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2;
    list.scrollTo({ top, behavior: "smooth" });
  }, [activeKey]);

  return (
    <aside className="oq-page-rail" aria-label="Document pages">
      <header>
        <span>PAGES</span>
        <small>{documentPages.length}</small>
      </header>
      <div ref={listRef}>
        {documentPages.map((item) => (
          <button
            key={pageKey(item)}
            className={activeKey === pageKey(item) ? "active" : ""}
            onClick={() => onSelect(item)}
            aria-label={`Go to ${item.label} page ${item.page}, packet page ${item.displayPage}`}
            aria-current={activeKey === pageKey(item) ? "true" : undefined}
          >
            <span>{item.label}</span>
            <Image
              src={item.thumb}
              alt=""
              width={468}
              height={605}
              loading="lazy"
              unoptimized
            />
            <b>{item.displayPage}</b>
          </button>
        ))}
      </div>
    </aside>
  );
}

function suggestionsForPdfField(field: PdfFieldDefinition) {
  const key = `${field.id} ${field.label}`.toLowerCase();
  if (field.kind === "date")
    return ["2026-08-18", "2026-08-31", "2026-09-17"];
  if (key.includes("dre_lic") || key.includes("dre lic"))
    return ["01914832", "01234567"];
  if (key.includes("e-mail") || key.includes("email"))
    return ["vu.nguyen@c0x12c.com", "landaverderm@yahoo.com"];
  if (key.includes("phone") || key.includes("tel"))
    return ["8186747721", "3105550198"];
  if (key.includes("zip")) return ["90026", "91316"];
  if (key.includes("state")) return ["CA"];
  if (key.includes("county")) return ["Los Angeles", "Orange", "Ventura"];
  if (key.includes("city")) return ["Los Angeles", "Encino", "Burbank"];
  if (key.includes("address"))
    return ["2458 Maplewood Ave 12B", "17327 Ventura Blvd"];
  if (key.includes("firm"))
    return ["Pinnacle Estate Properties, Inc.", "Acme Realty"];
  if (key.includes("agent")) return ["Vu Nguyen", "Marlene Sykes"];
  if (key.includes("buyer") || key.includes("signer") || key.includes("name"))
    return ["Ariya Anna", "Vu Nguyen"];
  if (key.includes("property"))
    return ["2458 Maplewood Ave 12B", "17327 Ventura Blvd"];
  if (key.includes("compensation") && key.includes("percent")) return ["3"];
  if (key.includes("compensation") || key.includes("amount")) return ["24,600"];
  return [];
}

function displayPdfFieldValue(field: PdfFieldDefinition, value: string) {
  if (field.kind !== "date") return value;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[2]}/${match[3]}/${match[1]}` : value;
}

const linkedFieldProvenance = [
  { label: "From Transaction Details", tone: "transaction" },
  { label: "Updated by AI", tone: "ai" },
  { label: "Synced across 3 forms", tone: "synced" },
] as const;

function PdfFieldPopover({
  documentCode,
  field,
  value,
  onClose,
  onSave,
}: {
  documentCode: PdfDocumentCode;
  field: PdfFieldDefinition;
  value: string;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const normalizedDraft = draft.trim();
  const normalizedValue = value.trim();
  const canApply =
    normalizedDraft !== normalizedValue &&
    (normalizedDraft.length > 0 || normalizedValue.length > 0);
  const suggestions = suggestionsForPdfField(field);
  const placeAbove = field.top > 68;
  const anchoredStyle: React.CSSProperties = {
    top: `${placeAbove ? field.top : field.top + field.height}%`,
    transform: placeAbove
      ? "translateY(calc(-100% - 8px))"
      : "translateY(8px)",
    ...(field.left > 48 ? { right: "2%" } : { left: `${Math.max(2, field.left)}%` }),
  };

  return (
    <form
      className="oq-field-popover"
      style={anchoredStyle}
      role="dialog"
      aria-label={`Fill ${field.label}`}
      onClick={(event) => event.stopPropagation()}
      onSubmit={(event) => {
        event.preventDefault();
        if (canApply) onSave(normalizedDraft);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <header>
        <div>
          <small>{documentCode} · PAGE {field.page}</small>
          <h3>{field.label}</h3>
        </div>
        <button type="button" onClick={onClose} aria-label="Close field editor">
          <Icon name="close" size={16} />
        </button>
      </header>
      <label>
        <span>{field.kind === "signature" ? "Signer name" : "Value"}</span>
        <input
          autoFocus
          type={field.kind === "date" ? "date" : "text"}
          value={draft}
          maxLength={field.kind === "text" ? 120 : undefined}
          placeholder={
            field.kind === "signature"
              ? "Enter the signer’s full name"
              : `Enter ${field.label.toLowerCase()}`
          }
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      {suggestions.length > 0 && (
        <div className="oq-field-suggestions" aria-label="Suggested values">
          <small>Linked field values</small>
          {suggestions.map((suggestion, index) => {
            const provenance =
              linkedFieldProvenance[Math.min(index, linkedFieldProvenance.length - 1)];
            return (
              <button
                type="button"
                key={suggestion}
                onClick={() => setDraft(suggestion)}
              >
                <span>{displayPdfFieldValue(field, suggestion)}</span>
                <em className={`oq-provenance-badge ${provenance.tone}`}>
                  {provenance.label}
                </em>
              </button>
            );
          })}
        </div>
      )}
      {field.kind === "signature" && (
        <p>The typed name will be placed here. Final signatures are collected with Sign.</p>
      )}
      <footer>
        <small>{draft.length}{field.kind === "text" ? " / 120" : ""} characters</small>
        <span>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary" disabled={!canApply}>
            Apply
          </button>
        </span>
      </footer>
    </form>
  );
}

function AddFormsModal({
  onClose,
  onAdd,
  existing,
}: {
  onClose: () => void;
  onAdd: (forms: string[]) => void;
  existing: string[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<string[]>([]);
  const [libs, setLibs] = useState<LibraryKey[]>([]);
  const [collapsed, setCollapsed] = useState<LibraryKey[]>([]);

  const toggleIn = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return formCatalog.filter(
      (item) =>
        !existing.includes(formName(item)) &&
        (!groups.length || groups.includes(item.group)) &&
        (!libs.length || libs.includes(item.library)) &&
        (!term || formName(item).toLowerCase().includes(term)),
    );
  }, [query, groups, libs, existing]);

  const shownLibraries = useMemo(
    () =>
      libraries
        .map((library) => ({
          ...library,
          forms: matches.filter((item) => item.library === library.key),
        }))
        .filter((library) => library.forms.length > 0),
    [matches],
  );

  const filterCount = groups.length + libs.length;
  const toggle = (name: string) => setSelected((v) => toggleIn(v, name));

  return (
    <div
      className="oq-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="oq-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-forms-title"
      >
        <header>
          <h2 id="add-forms-title">Add forms to this transaction</h2>
          <button onClick={onClose} aria-label="Close add forms">
            <Icon name="close" />
          </button>
        </header>
        <div className="oq-modal-main">
          <aside>
            <div className="oq-filter-head">
              <p>Form libraries</p>
              {filterCount > 0 && (
                <button
                  className="oq-filter-clear"
                  onClick={() => {
                    setGroups([]);
                    setLibs([]);
                  }}
                >
                  Clear ({filterCount})
                </button>
              )}
            </div>
            {formSections.map((section) => (
              <div key={section.section} className="oq-filter-group">
                <b className={`oq-group-label tone-${section.tone}`}>
                  {section.section}
                </b>
                {section.items.map((item) => {
                  const on = groups.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      className={on ? "active" : ""}
                      aria-pressed={on}
                      onClick={() => setGroups((v) => toggleIn(v, item.key))}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="oq-filter-group">
              <b className="oq-group-label tone-slate">Library</b>
              {libraries.map((library) => {
                const on = libs.includes(library.key);
                return (
                  <button
                    key={library.key}
                    className={on ? "active" : ""}
                    aria-pressed={on}
                    onClick={() => setLibs((v) => toggleIn(v, library.key))}
                  >
                    {library.name}
                  </button>
                );
              })}
            </div>
          </aside>
          <div className="oq-catalog">
            <label>
              <Icon name="search" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Search forms by name or code"
              />
            </label>
            <div className="oq-catalog-title">
              <div>
                {shownLibraries.length}{" "}
                {shownLibraries.length === 1 ? "library" : "libraries"}
              </div>
              <small>{matches.length} forms</small>
            </div>
            <div className="oq-library-tree">
              {shownLibraries.map((library) => {
                const open = !collapsed.includes(library.key);
                return (
                  <div className="oq-library" key={library.key}>
                    <button
                      className="oq-library-head"
                      aria-expanded={open}
                      onClick={() =>
                        setCollapsed((v) => toggleIn(v, library.key))
                      }
                    >
                      <span className={`oq-caret${open ? " is-open" : ""}`}>
                        <Icon name="chevron" size={13} />
                      </span>
                      <span className="oq-folder" />
                      <b>{library.name}</b>
                      <small>{library.forms.length}</small>
                    </button>
                    {open && (
                      <div className="oq-form-list">
                        {library.forms.map((item) => {
                          const name = formName(item);
                          const on = selected.includes(name);
                          return (
                            <button
                              key={name}
                              role="checkbox"
                              aria-checked={on}
                              onClick={() => toggle(name)}
                              className={on ? "selected" : ""}
                            >
                              <span className="oq-checkbox">
                                {on && <Icon name="check" size={13} />}
                              </span>
                              <span className="oq-form-name">
                                <em>[{item.code}]</em> {item.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {!shownLibraries.length && (
                <p className="oq-empty">
                  No forms match these filters. Try clearing a category or
                  changing your search.
                </p>
              )}
            </div>
          </div>
        </div>
        <footer>
          <span>
            <Icon name="check" /> {selected.length} selected
          </span>
          <div>
            <button onClick={onClose}>Cancel</button>
            <button
              className="primary"
              disabled={!selected.length}
              onClick={() => {
                onAdd(selected);
                onClose();
              }}
            >
              Add Documents
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function FormsPanel({
  activeLabel,
  onOpen,
  onClose,
}: {
  activeLabel: string;
  onOpen: (document: string) => void;
  onClose: () => void;
}) {
  const [modal, setModal] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState([
    "[AD] Disclosure Regarding Real Estate Agency Relationship (Buyer)",
    "[BRBC] Buyer Representation and Broker Compensation Agreement",
  ]);
  const availableForms = [
    {
      code: "AD",
      name: "Disclosure Regarding Real Estate Agency Relationship (Buyer)",
      pages: 3,
      href: "/forms/AD_Disclosure_Real_Estate_Agency_Relationship_Buyer-1.2.pdf",
    },
    {
      code: "BRBC",
      name: "Buyer Representation and Broker Compensation Agreement",
      pages: 13,
      href: "/forms/BRBC_Buyer_Representation_and_Broker_Compensation_Agreement-1.3.pdf",
    },
    {
      code: "PRBS",
      name: "Possible Representation of More Than One Buyer or Seller",
      pages: 1,
      href: "/forms/PRBS_Possible_Representation_More_Than_One-1.2.pdf",
    },
  ];
  const addDocument = (name: string) =>
    setDocs((current) =>
      current.includes(name) ? current : [...current, name],
    );
  const reorder = (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) return;
    setDocs((current) => {
      const next = [...current];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  };
  return (
    <div className="oq-documents">
      <div className="oq-doc-toolbar oq-panel-heading">
        <h2>Workspace</h2>
        <div className="oq-panel-actions">
          <button className="oq-add" onClick={() => setModal(true)}>
            <Icon name="plus" />
            Add
          </button>
          <button
            className="oq-panel-close"
            aria-label="Close workspace panel"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>
      <label className="oq-document-search">
        <Icon name="search" />
        <input
          aria-label="Search transaction documents"
          placeholder="Search transaction documents"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="oq-doc-meta">
        <span>Transaction documents</span>
        <small>{docs.length} items</small>
      </div>
      <div className="oq-doc-list">
        {docs
          .map((doc, i) => ({ doc, i }))
          .filter(({ doc }) => doc.toLowerCase().includes(query.toLowerCase()))
          .map(({ doc, i }) => (
            <div
              className={`oq-doc-row ${doc.startsWith(`[${activeLabel}]`) ? "active" : ""}`}
              key={doc}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => reorder(i)}
            >
              <button
                className="oq-doc-open"
                aria-label={`Open ${doc}`}
                onClick={() => onOpen(doc)}
              >
                <span className="oq-drag-handle" title="Drag to reorder">
                  <Icon name="grip" />
                </span>
                <span className="oq-file-icon">
                  <Icon name="file" />
                </span>
                <span className="oq-doc-copy">
                  <b>{doc}</b>
                  <small>
                    {doc.startsWith(`[${activeLabel}]`)
                      ? "Currently open · PDF form"
                      : "PDF form"}
                  </small>
                </span>
              </button>
              <button
                className="oq-doc-remove"
                onClick={(event) => {
                  event.stopPropagation();
                  setDocs((d) => d.filter((_, x) => x !== i));
                }}
                aria-label={`Remove ${doc}`}
              >
                <Icon name="close" />
              </button>
            </div>
          ))}
      </div>
      <div className="oq-available-heading">
        <span>Available forms</span>
        <small>Pinnacle library</small>
      </div>
      <div className="oq-available-list">
        {availableForms
          .filter((form) => !docs.includes(`[${form.code}] ${form.name}`))
          .map((form) => {
            return (
              <div className="oq-available-row" key={form.code}>
                <div>
                  <a href={form.href} target="_blank" rel="noreferrer">
                    <b>
                      [{form.code}] {form.name}
                    </b>
                  </a>
                  <small>
                    PDF form · {form.pages}{" "}
                    {form.pages === 1 ? "page" : "pages"}
                  </small>
                </div>
                <button
                  onClick={() => addDocument(`[${form.code}] ${form.name}`)}
                  aria-label={`Add ${form.name}`}
                >
                  <Icon name="plus" />
                </button>
              </div>
            );
          })}
      </div>
      <label className="oq-dropzone">
        <Icon name="plus" />
        <span>
          <b>Upload files</b>
          <small>Drop here or browse</small>
        </span>
        <input
          type="file"
          multiple
          onChange={(event) =>
            setDocs((current) => [
              ...new Set([
                ...current,
                ...Array.from(event.target.files ?? []).map(
                  (file) => file.name,
                ),
              ]),
            ])
          }
        />
      </label>
      {modal && (
        <AddFormsModal
          onClose={() => setModal(false)}
          existing={docs}
          onAdd={(forms) =>
            setDocs((current) => [...new Set([...current, ...forms])])
          }
        />
      )}
    </div>
  );
}

type AssistantMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

type SpeechRecognitionResultEvent = {
  results: ArrayLike<{ 0: { transcript: string } }>;
};

type SpeechRecognitionErrorEvent = { error: string };

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const assistantWelcome = (documentLabel: string, page: number): AssistantMessage => ({
  id: 0,
  role: "assistant",
  text: `I’m ready to help with ${documentLabel}, page ${page}. Ask about a clause, check missing fields, or use voice to dictate transaction information.`,
});

const defaultVoiceStatus = "Speak naturally to fill form fields";

function assistantResponse(prompt: string, documentLabel: string, page: number) {
  const query = prompt.toLowerCase();
  if (query.includes("missing") || query.includes("status")) {
    return `${documentLabel} still needs the remaining unchecked roles, dates, and signature fields reviewed. I can take you through them in page order.`;
  }
  if (query.includes("summar")) {
    return `Page ${page} of ${documentLabel} covers the agency relationship and the parties’ acknowledgements. Confirm the representation roles, license information, dates, and signatures before sending.`;
  }
  if (query.includes("next form")) {
    return "The next transaction document is BRBC — Buyer Representation and Broker Compensation Agreement. Open it when you are ready to continue.";
  }
  if (query.includes("continue") || query.includes("next field")) {
    return `Let’s continue on ${documentLabel}, page ${page}. Select the next blue field in the PDF and I’ll help choose the correct transaction value.`;
  }
  if (query.includes("explain") || query.includes("clause")) {
    return "This form documents who each real estate agent represents. It should match the brokerage and agent roles recorded for this transaction; review the final language before applying it.";
  }
  return `I’ve captured that for the ${documentLabel} review. I can summarize the page, identify missing fields, or help map it to the transaction details.`;
}

function AssistantPanel({
  documentLabel,
  documentTitle,
  page,
}: {
  documentLabel: string;
  documentTitle: string;
  page: number;
}) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(defaultVoiceStatus);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    assistantWelcome(documentLabel, page),
  ]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const voiceStartedAtRef = useRef(0);
  const replyTimerRef = useRef<number | null>(null);
  const messageIdRef = useRef(1);
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
    },
    [],
  );

  const send = (value = text) => {
    const prompt = value.trim();
    if (!prompt || thinking) return;
    setMessages((current) => [
      ...current,
      { id: messageIdRef.current++, role: "user", text: prompt },
    ]);
    setText("");
    setThinking(true);
    replyTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: messageIdRef.current++,
          role: "assistant",
          text: assistantResponse(prompt, documentLabel, page),
        },
      ]);
      setThinking(false);
    }, 520);
  };

  const startNewChat = () => {
    if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
    recognitionRef.current?.stop();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    setThinking(false);
    setRecording(false);
    setVoiceStatus(defaultVoiceStatus);
    setText("");
    setMessages([assistantWelcome(documentLabel, page)]);
    setHistoryOpen(false);
  };

  const toggleVoice = async () => {
    if (recording) {
      recognitionRef.current?.stop();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      return;
    }
    const voiceWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition =
      voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition;
    if (!Recognition) {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        setVoiceStatus("Voice input is not supported in this browser");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        mediaStreamRef.current = stream;
        voiceStartedAtRef.current = Date.now();
        recorder.onstop = () => {
          const seconds = Math.max(1, Math.round((Date.now() - voiceStartedAtRef.current) / 1000));
          stream.getTracks().forEach((track) => track.stop());
          recorderRef.current = null;
          mediaStreamRef.current = null;
          setRecording(false);
          setVoiceStatus(
            `Voice note captured (${seconds}s). Speech-to-text is unavailable here; add the key details before sending.`,
          );
        };
        recorder.start();
        setRecording(true);
        setVoiceStatus("Recording voice note…");
      } catch {
        setRecording(false);
        setVoiceStatus("Microphone access is required for voice input");
      }
      return;
    }
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      setText(transcript);
      setVoiceStatus(transcript || "Listening…");
    };
    recognition.onerror = (event) => {
      setRecording(false);
      setVoiceStatus(
        event.error === "not-allowed"
          ? "Microphone access is required for voice input"
          : "Voice input stopped. Please try again.",
      );
    };
    recognition.onend = () => {
      setRecording(false);
      setVoiceStatus((current) =>
        current === "Listening…" ? defaultVoiceStatus : current,
      );
    };
    recognitionRef.current = recognition;
    setRecording(true);
    setVoiceStatus("Listening…");
    recognition.start();
  };

  const quickActions = [
    ["Continue", "Continue to the next field"],
    ["Next form", "Next form"],
    ["Check status", "Check status and missing fields"],
    ["Summarize", "Summarize this page"],
    ["What’s missing?", "What fields are missing?"],
    ["Explain", "Explain this form"],
  ];

  return (
    <div className="oq-assistant">
      <div className="oq-assistant-context">
        <span className="oq-assistant-mark">
          <Icon name="spark" />
        </span>
        <span>
          <b>Initial real estate inquiry</b>
          <small>{documentLabel} — {documentTitle}</small>
        </span>
        <button aria-label="New chat" title="New chat" onClick={startNewChat}>
          <Icon name="plus" />
        </button>
        <button
          aria-label="Chat history"
          title="Chat history"
          aria-expanded={historyOpen}
          onClick={() => setHistoryOpen((current) => !current)}
        >
          <Icon name="history" />
        </button>
      </div>
      {historyOpen && (
        <div className="oq-chat-history">
          <b>Recent chats</b>
          <button onClick={() => setHistoryOpen(false)}>
            <span>Review {documentLabel} fields</span>
            <small>Current conversation</small>
          </button>
          <button onClick={startNewChat}>
            <span>Start a clean conversation</span>
            <small>New chat</small>
          </button>
        </div>
      )}
      <div className="oq-thread" ref={threadRef} aria-live="polite">
        {messages.map((message) => (
          <div
            className={message.role === "user" ? "oq-user-message" : "oq-ai-message"}
            key={message.id}
          >
            {message.text}
          </div>
        ))}
        {thinking && (
          <div className="oq-ai-message oq-thinking" aria-label="Assistant is responding">
            <i />
            <i />
            <i />
          </div>
        )}
        <div className="oq-form-context">
          <Icon name="file" />
          <span>
            <b>{documentLabel} — {documentTitle}</b>
            <small>Current form context · page {page}</small>
          </span>
          <button onClick={() => send("Continue to the next field")}>Continue filling</button>
        </div>
      </div>
      <div className="oq-assistant-footer">
        <div className="oq-chat-actions" aria-label="Quick actions">
          {quickActions.map(([label, prompt]) => (
            <button key={label} onClick={() => send(prompt)}>
              {label}
            </button>
          ))}
        </div>
        {(recording || voiceStatus !== defaultVoiceStatus) && (
          <div className={`oq-voice-status ${recording ? "recording" : ""}`} role="status">
            <span />
            <b>{voiceStatus}</b>
            <button
              onClick={() =>
                recording ? void toggleVoice() : setVoiceStatus(defaultVoiceStatus)
              }
            >
              {recording ? "Stop" : "Dismiss"}
            </button>
          </div>
        )}
        <div className="oq-compose">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask about a clause or field…"
          />
          <button
            className={recording ? "recording" : ""}
            aria-label={recording ? "Stop voice mode" : "Turn on voice mode"}
            title={voiceStatus}
            onClick={() => void toggleVoice()}
          >
            <Icon name="mic" />
          </button>
          <button aria-label="Send message" disabled={!text.trim() || thinking} onClick={() => send()}>
            <Icon name="send" />
          </button>
        </div>
        <small>AI may make mistakes. Review before applying.</small>
      </div>
    </div>
  );
}

type DetailAccordionKey =
  | "parties"
  | "property"
  | "listing"
  | "purchase"
  | "commission";

type EditableDetailField = {
  key: string;
  label: string;
  value: string;
  wide?: boolean;
  kind?: "text" | "textarea" | "select";
  options?: string[];
  prefix?: string;
  suffix?: string;
};

type DetailPdfLink = {
  detailKeys: string[];
  form: PdfDocumentCode;
  page: number;
  fieldId: string;
  label: string;
  kind?: "text" | "checkbox";
  resolve: (values: Record<string, string>) => string | boolean;
};

type LinkedFieldConflict = {
  id: string;
  label: string;
  expected: string;
  actual: string;
  target: DetailPdfLink;
};

const partyFields: EditableDetailField[] = [
  { key: "partyFirstName", label: "First name", value: "Vu" },
  { key: "partyLastName", label: "Last name", value: "Nguyen" },
  { key: "partyEmail", label: "Email", value: "vu.nguyen@c0x12c.com", wide: true },
  {
    key: "partyRole",
    label: "Transaction role",
    value: "Buyer Agent",
    kind: "select",
    options: ["Buyer Agent", "Seller Agent", "Buyer", "Seller", "Transaction Coordinator"],
    wide: true,
  },
];

const propertyFields: EditableDetailField[] = [
  { key: "propertyAddress", label: "Property address", value: "2458 Maplewood Ave", wide: true },
  { key: "unit", label: "Unit #", value: "12B" },
  { key: "city", label: "City", value: "Los Angeles" },
  { key: "state", label: "State", value: "CA" },
  { key: "zip", label: "Zip Code", value: "90026" },
  { key: "county", label: "County", value: "Los Angeles" },
  {
    key: "propertyType",
    label: "Type",
    value: "Commercial",
    kind: "select",
    options: ["Commercial", "Condominium", "Single Family", "Multi-Family", "Land"],
  },
  { key: "yearBuilt", label: "Year built or manufactured", value: "2018" },
  { key: "apn", label: "APN", value: "5401-021-045" },
  { key: "lot", label: "Lot", value: "12" },
  { key: "block", label: "Block", value: "B" },
  { key: "subdivision", label: "Subdivision", value: "Maplewood Heights", wide: true },
  { key: "taxes", label: "Taxes", value: "6,850", prefix: "$" },
  {
    key: "legalDescription",
    label: "Legal Description",
    value: "Unit 12B of Maplewood Heights Condominium, City of Los Angeles, County of Los Angeles, State of California",
    wide: true,
    kind: "textarea",
  },
];

const listingFields: EditableDetailField[] = [
  { key: "mlsNumber", label: "MLS Number", value: "CA12345678" },
  { key: "listingDate", label: "Listing Date", value: "08/18/2026" },
  { key: "expirationDate", label: "Expiration Date", value: "08/31/2026" },
  { key: "listingAgreementDate", label: "Listing Agreement Date", value: "08/15/2026" },
  { key: "previousPrice", label: "Previous Price", value: "845,000", prefix: "$" },
  { key: "listedPrice", label: "Listed Price", value: "825,000", prefix: "$" },
  { key: "trustDeed1", label: "Trust Deed Balance 1", value: "350,000", prefix: "$" },
  { key: "trustDeed2", label: "Trust Deed Balance 2", value: "", prefix: "$" },
  { key: "trustDeed3", label: "Trust Deed Balance 3", value: "", prefix: "$" },
  { key: "otherLiens", label: "Other Liens", value: "", prefix: "$" },
  { key: "otherLiensDescription", label: "Other Liens (Description)", value: "", wide: true },
  { key: "otherEncumbrances", label: "Other Encumbrances", value: "", prefix: "$" },
  { key: "otherEncumbrancesDescription", label: "Other Encumbrances (Description)", value: "", wide: true },
  { key: "includes", label: "Includes", value: "Refrigerator, washer, dryer, kitchen appliances", wide: true, kind: "textarea" },
  { key: "excludes", label: "Excludes", value: "Seller’s personal furniture and staging items", wide: true, kind: "textarea" },
  {
    key: "listingRemarks",
    label: "Listing Remarks",
    value: "Bright 2-bedroom condo in a desirable Los Angeles neighborhood with updated kitchen and convenient access to shopping and transit.",
    wide: true,
    kind: "textarea",
  },
];

const purchaseFields: EditableDetailField[] = [
  { key: "purchasePrice", label: "Purchase Price", value: "820,000", prefix: "$" },
  { key: "escrowNumber", label: "Escrow Number", value: "ESC-2026-0818-2458" },
  { key: "cashBalance", label: "Cash Balance", value: "164,000", prefix: "$" },
  { key: "transferFees", label: "Transfer Fees", value: "2,500", prefix: "$" },
  { key: "deposit1", label: "Deposit 1", value: "10,000", prefix: "$" },
  { key: "deposit2", label: "Deposit 2", value: "15,000", prefix: "$" },
  {
    key: "appraisalWaived",
    label: "Appraisal Contingency Waived",
    value: "",
    kind: "select",
    options: ["Yes", "No"],
  },
  {
    key: "loanWaived",
    label: "Loan Contingency Waived",
    value: "",
    kind: "select",
    options: ["Yes", "No"],
  },
  {
    key: "purchaseRemarks",
    label: "Purchase Remarks",
    value: "Buyer to obtain conventional financing. Seller to provide standard disclosures.",
    wide: true,
    kind: "textarea",
  },
  {
    key: "financingTerms",
    label: "Other Financing Terms",
    value: "80% conventional loan, 30-year fixed",
    wide: true,
    kind: "textarea",
  },
];

const keyDateFields: EditableDetailField[] = [
  { key: "offerAccepted", label: "Offer Accepted", value: "08/18/26" },
  { key: "purchaseAgreementDate", label: "Purchase Agreement Date", value: "08/18/26" },
  { key: "earnestMoneyDue", label: "Earnest Money Deposit Due", value: "08/21/26" },
  { key: "sellerDisclosureDue", label: "Seller Disclosure Due", value: "08/25/26" },
  { key: "possessionDate", label: "Possession Date", value: "08/31/26" },
  { key: "buyerPropertyContingency", label: "Sale of Buyer Property Contingency", value: "08/31/26" },
  { key: "appraisalDue", label: "Appraisal Contingency Due", value: "09/04/26" },
  { key: "inspectionDue", label: "Inspection Contingency Due", value: "09/04/26" },
  { key: "loanDue", label: "Loan Contingency Due", value: "09/08/26" },
  { key: "closeOfEscrow", label: "Close of Escrow", value: "09/17/26" },
];

const listingCommissionFields: EditableDetailField[] = [
  { key: "listingCommissionAmount", label: "Listing Commission Amount", value: "24,600", prefix: "$" },
  { key: "listingCommissionPercent", label: "Listing Commission Percent", value: "3", suffix: "%" },
  { key: "listingNetOffice", label: "Listing Net Office Commission", value: "22,140", prefix: "$" },
  { key: "listingTcFee", label: "Listing TC Fee", value: "350", prefix: "$" },
  { key: "listingOtherDeductions", label: "Listing Other Deductions", value: "2,110", prefix: "$" },
  { key: "listingDeductionDetails", label: "Listing Deduction Details", value: "Brokerage split and admin fee", wide: true },
  { key: "listingAgent1Percent", label: "Listing Agent 1 Split Percent", value: "70", suffix: "%" },
  { key: "listingAgent1Amount", label: "Listing Agent 1 Split Amount", value: "17,220", prefix: "$" },
  { key: "listingAgent1Net", label: "Listing Agent 1 Net Commission", value: "17,220", prefix: "$" },
  { key: "listingAgent2Percent", label: "Listing Agent 2 Split Percent", value: "30", suffix: "%" },
  { key: "listingAgent2Amount", label: "Listing Agent 2 Split Amount", value: "7,380", prefix: "$" },
  { key: "listingAgent2Net", label: "Listing Agent 2 Net Commission", value: "7,380", prefix: "$" },
];

const purchaseCommissionFields: EditableDetailField[] = [
  { key: "purchaseCommissionAmount", label: "Purchase Commission Amount", value: "24,600", prefix: "$" },
  { key: "purchaseCommissionPercent", label: "Purchase Commission Percent", value: "3", suffix: "%" },
  { key: "purchaseNetOffice", label: "Purchase Net Office Commission", value: "22,140", prefix: "$" },
  { key: "purchaseTcFee", label: "Purchase TC Fee", value: "350", prefix: "$" },
  { key: "purchaseOtherDeductions", label: "Purchase Other Deductions", value: "2,110", prefix: "$" },
  { key: "purchaseDeductionDetails", label: "Purchase Deduction Details", value: "Brokerage split and admin fee", wide: true },
  { key: "purchaseAgent1Percent", label: "Purchase Agent 1 Split Percent", value: "60", suffix: "%" },
  { key: "purchaseAgent1Amount", label: "Purchase Agent 1 Split Amount", value: "14,760", prefix: "$" },
  { key: "purchaseAgent1Net", label: "Purchase Agent 1 Net Commission", value: "14,760", prefix: "$" },
  { key: "purchaseAgent2Percent", label: "Purchase Agent 2 Split Percent", value: "40", suffix: "%" },
  { key: "purchaseAgent2Amount", label: "Purchase Agent 2 Split Amount", value: "9,840", prefix: "$" },
  { key: "purchaseAgent2Net", label: "Purchase Agent 2 Net Commission", value: "9,840", prefix: "$" },
];

const allEditableFields = [
  ...partyFields,
  ...propertyFields,
  ...listingFields,
  ...purchaseFields,
  ...keyDateFields,
  ...listingCommissionFields,
  ...purchaseCommissionFields,
];

const initialDetailValues = Object.fromEntries(
  allEditableFields.map((field) => [field.key, field.value]),
) as Record<string, string>;

const fullAgentName = (values: Record<string, string>) =>
  [values.partyFirstName, values.partyLastName].filter(Boolean).join(" ");

const fullPropertyAddress = (values: Record<string, string>) =>
  [
    [values.propertyAddress, values.unit].filter(Boolean).join(" "),
    values.city,
    [values.state, values.zip].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

const detailPdfLinks: DetailPdfLink[] = [
  {
    detailKeys: ["partyFirstName", "partyLastName"],
    form: "AD",
    page: 1,
    fieldId: "disclosure.agent.name",
    label: "Real estate agent name",
    resolve: fullAgentName,
  },
  {
    detailKeys: ["partyFirstName", "partyLastName"],
    form: "AD",
    page: 2,
    fieldId: "confirmation.buyers.agent.name",
    label: "Buyer’s agent name",
    resolve: fullAgentName,
  },
  {
    detailKeys: ["partyFirstName", "partyLastName"],
    form: "BRBC",
    page: 1,
    fieldId: "disclosure.agent.name",
    label: "Agent acknowledgement",
    resolve: fullAgentName,
  },
  {
    detailKeys: ["partyFirstName", "partyLastName"],
    form: "BRBC",
    page: 7,
    fieldId: "signatures.broker.agent.1.signature",
    label: "Broker / agent name",
    resolve: fullAgentName,
  },
  {
    detailKeys: ["partyFirstName", "partyLastName"],
    form: "PRBS",
    page: 1,
    fieldId: "p2_buyer_brokerage_agent_signature_es_:signer:signature",
    label: "Buyer brokerage agent",
    resolve: fullAgentName,
  },
  {
    detailKeys: ["partyEmail"],
    form: "BRBC",
    page: 7,
    fieldId: "signatures.broker.agent.1.email",
    label: "Broker / agent email",
    resolve: (values) => values.partyEmail,
  },
  {
    detailKeys: ["propertyAddress", "unit", "city", "state", "zip"],
    form: "BRBC",
    page: 3,
    fieldId: "agreement.property.specified",
    label: "Specified property",
    resolve: fullPropertyAddress,
  },
  {
    detailKeys: ["city"],
    form: "BRBC",
    page: 3,
    fieldId: "agreement.property.city",
    label: "Property city",
    resolve: (values) => values.city,
  },
  {
    detailKeys: ["county"],
    form: "BRBC",
    page: 3,
    fieldId: "agreement.property.county",
    label: "Property county",
    resolve: (values) => values.county,
  },
  {
    detailKeys: ["propertyType"],
    form: "BRBC",
    page: 3,
    fieldId: "agreement.property.commercial",
    label: "Commercial property",
    kind: "checkbox",
    resolve: (values) => values.propertyType === "Commercial",
  },
  {
    detailKeys: ["purchaseCommissionAmount"],
    form: "BRBC",
    page: 3,
    fieldId: "agreement.compensation.amount",
    label: "Broker compensation amount",
    resolve: (values) => values.purchaseCommissionAmount,
  },
  {
    detailKeys: ["purchaseCommissionPercent"],
    form: "BRBC",
    page: 3,
    fieldId: "agreement.compensation.percent",
    label: "Broker compensation percent",
    resolve: (values) => values.purchaseCommissionPercent,
  },
];

const linkedPdfId = (target: Pick<DetailPdfLink, "form" | "fieldId">) =>
  `${target.form}:${target.fieldId}`;

const linkedPdfFieldDomId = (target: Pick<DetailPdfLink, "form" | "fieldId">) =>
  `pdf-field-${target.form}-${target.fieldId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

const isLinkedPdfField = (form: PdfDocumentCode, fieldId: string) =>
  detailPdfLinks.some((link) => link.form === form && link.fieldId === fieldId);

function linksForDetailField(key: string) {
  return detailPdfLinks.filter((link) => link.detailKeys.includes(key));
}

function destinationsForDetailField(key: string) {
  const destinations = new Map<string, DetailPdfLink>();
  linksForDetailField(key).forEach((link) => {
    const destinationKey = `${link.form}-${link.page}`;
    if (!destinations.has(destinationKey)) destinations.set(destinationKey, link);
  });
  return [...destinations.values()];
}

function linkedTextValues(values: Record<string, string>) {
  return Object.fromEntries(
    detailPdfLinks
      .filter((link) => link.kind !== "checkbox")
      .map((link) => [linkedPdfId(link), String(link.resolve(values))]),
  ) as Record<string, string>;
}

function linkedCheckedFields(values: Record<string, string>) {
  return detailPdfLinks
    .filter((link) => link.kind === "checkbox" && Boolean(link.resolve(values)))
    .map(linkedPdfId);
}

function findLinkedConflicts(
  values: Record<string, string>,
  pdfValues: Record<string, string>,
  checkedFields: string[],
) {
  return detailPdfLinks.flatMap<LinkedFieldConflict>((link) => {
    const id = linkedPdfId(link);
    const expectedValue = link.resolve(values);
    const actualValue =
      link.kind === "checkbox" ? checkedFields.includes(id) : (pdfValues[id] ?? "");
    const expected = String(expectedValue).trim().toLocaleLowerCase();
    const actual = String(actualValue).trim().toLocaleLowerCase();
    if (expected === actual) return [];
    return [{
      id,
      label: link.label,
      expected: typeof expectedValue === "boolean" ? (expectedValue ? "Checked" : "Not checked") : String(expectedValue),
      actual: typeof actualValue === "boolean" ? (actualValue ? "Checked" : "Not checked") : (String(actualValue) || "Empty"),
      target: link,
    }];
  });
}

function EditableFieldGrid({
  fields,
  values,
  onChange,
  onNavigate,
}: {
  fields: EditableDetailField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onNavigate: (target: DetailPdfLink) => void;
}) {
  return (
    <div className="oq-edit-grid">
      {fields.map((field) => {
        const destinations = destinationsForDetailField(field.key);
        const inputId = `detail-field-${field.key}`;
        return (
          <div
            className={`oq-edit-field ${field.wide ? "wide" : ""}`}
            key={field.key}
          >
            <label className="oq-edit-label" htmlFor={inputId}>
              {field.label}
            </label>
            <div
              className={`oq-edit-control ${destinations.length ? "is-linked" : ""}`}
            >
              {field.prefix && <i>{field.prefix}</i>}
              {field.kind === "textarea" ? (
                <textarea
                  id={inputId}
                  rows={3}
                  value={values[field.key]}
                  onChange={(event) => onChange(field.key, event.target.value)}
                />
              ) : field.kind === "select" ? (
                <select
                  id={inputId}
                  value={values[field.key]}
                  onChange={(event) => onChange(field.key, event.target.value)}
                >
                  <option value="">Not set</option>
                  {field.options?.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={inputId}
                  value={values[field.key]}
                  onChange={(event) => onChange(field.key, event.target.value)}
                />
              )}
              {field.suffix && <i>{field.suffix}</i>}
            </div>
            <span className="oq-field-destinations">
              {destinations.length > 0 ? (
                <>
                  <small>Appears in</small>
                  {destinations.map((destination) => {
                    const targetId = linkedPdfFieldDomId(destination);
                    return (
                      <a
                        key={`${destination.form}-${destination.page}`}
                        href={`#${targetId}`}
                        title={`Open ${destination.label} in ${destination.form}, page ${destination.page}`}
                        aria-label={`Open ${field.label} in ${destination.form}, page ${destination.page}`}
                        onClick={(event) => {
                          event.preventDefault();
                          onNavigate(destination);
                        }}
                      >
                        {destination.form} · p.{destination.page}
                        <Icon name="chevron" size={10} />
                      </a>
                    );
                  })}
                </>
              ) : (
                <small>Transaction record only</small>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DetailAccordion({
  id,
  title,
  meta,
  open,
  onToggle,
  children,
}: {
  id: DetailAccordionKey;
  title: string;
  meta?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`oq-detail-accordion ${open ? "open" : ""}`}>
      <button
        className="oq-accordion-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
      >
        <span>
          <b>{title}</b>
          {meta && <small>{meta}</small>}
        </span>
        <Icon name="chevron" />
      </button>
      <div className="oq-accordion-panel" id={`${id}-panel`}>
        <div>{children}</div>
      </div>
    </section>
  );
}

function CrossFormCheckSummary({
  conflicts,
  onNavigate,
}: {
  conflicts: LinkedFieldConflict[];
  onNavigate: (target: DetailPdfLink) => void;
}) {
  if (conflicts.length === 0) return null;

  return (
    <section className="oq-conflict-check has-conflicts" aria-live="polite">
      <header>
        <span>
          <Icon name="info" size={15} />
        </span>
        <div>
          <b>Cross-form conflict check</b>
          <small>
            {conflicts.length} linked value{conflicts.length === 1 ? "" : "s"} need review
          </small>
        </div>
      </header>
      <div className="oq-conflict-list">
        {conflicts.map((conflict) => (
          <button
            type="button"
            key={conflict.id}
            onClick={() => onNavigate(conflict.target)}
          >
            <span>
              <b>{conflict.label}</b>
              <small>
                {conflict.target.form} · p.{conflict.target.page} — expected “{conflict.expected}”, found “{conflict.actual}”
              </small>
            </span>
            <Icon name="chevron" size={13} />
          </button>
        ))}
      </div>
    </section>
  );
}

function DetailsPartiesPanel({
  onAddParty,
  onClose,
  values,
  onChange,
  onNavigate,
  conflicts,
}: {
  onAddParty: () => void;
  onClose: () => void;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onNavigate: (target: DetailPdfLink) => void;
  conflicts: LinkedFieldConflict[];
}) {
  const [openSection, setOpenSection] =
    useState<DetailAccordionKey | null>("parties");
  const toggleSection = (section: DetailAccordionKey) =>
    setOpenSection((current) => (current === section ? null : section));

  return (
    <div className="oq-details-parties">
      <div className="oq-details-heading oq-panel-heading">
        <h2>Details / Parties</h2>
        <div className="oq-panel-actions">
          <button className="oq-add" onClick={onAddParty}>
            <Icon name="plus" />
            Add
          </button>
          <button
            className="oq-panel-close"
            aria-label="Close details and parties panel"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>

      <section className="oq-transaction-details" aria-labelledby="transaction-details-title">
        <div className="oq-transaction-summary-head">
          <span>
            <small>Property</small>
            <h4 id="transaction-details-title">2458 Maplewood Ave 12B</h4>
            <p>Los Angeles, CA 90026</p>
          </span>
          <em>Under Contract</em>
        </div>
        <dl>
          <div>
            <dt>Type</dt>
            <dd>Purchase</dd>
          </div>
          <div>
            <dt>Representation</dt>
            <dd>Buyer</dd>
          </div>
        </dl>
        <CrossFormCheckSummary conflicts={conflicts} onNavigate={onNavigate} />
      </section>

      <div className="oq-accordion-stack">
        <DetailAccordion
          id="parties"
          title="Parties"
          meta="1 person · 3 linked forms"
          open={openSection === "parties"}
          onToggle={() => toggleSection("parties")}
        >
          <div className="oq-party-summary">
            <span className="oq-party-avatar">VN</span>
            <span>
              <b>Vu Nguyen</b>
              <small>Buyer Agent · vu.nguyen@c0x12c.com</small>
            </span>
          </div>
          <EditableFieldGrid fields={partyFields} values={values} onChange={onChange} onNavigate={onNavigate} />
          <button className="oq-add-party" onClick={onAddParty}>
            <Icon name="plus" />
            Add party
          </button>
        </DetailAccordion>

        <DetailAccordion
          id="property"
          title="Property Information"
          meta="7 of 14 linked · BRBC p.3"
          open={openSection === "property"}
          onToggle={() => toggleSection("property")}
        >
          <EditableFieldGrid fields={propertyFields} values={values} onChange={onChange} onNavigate={onNavigate} />
        </DetailAccordion>

        <DetailAccordion
          id="listing"
          title="Listing Information"
          meta="16 fields · transaction only"
          open={openSection === "listing"}
          onToggle={() => toggleSection("listing")}
        >
          <EditableFieldGrid fields={listingFields} values={values} onChange={onChange} onNavigate={onNavigate} />
        </DetailAccordion>

        <DetailAccordion
          id="purchase"
          title="Purchase Information"
          meta="20 fields · transaction only"
          open={openSection === "purchase"}
          onToggle={() => toggleSection("purchase")}
        >
          <EditableFieldGrid fields={purchaseFields} values={values} onChange={onChange} onNavigate={onNavigate} />
          <h5 className="oq-form-subheading">Key Dates</h5>
          <EditableFieldGrid fields={keyDateFields} values={values} onChange={onChange} onNavigate={onNavigate} />
        </DetailAccordion>

        <DetailAccordion
          id="commission"
          title="Commission"
          meta="2 of 24 linked · BRBC p.3"
          open={openSection === "commission"}
          onToggle={() => toggleSection("commission")}
        >
          <h5 className="oq-form-subheading first">Listing Commission</h5>
          <EditableFieldGrid fields={listingCommissionFields} values={values} onChange={onChange} onNavigate={onNavigate} />
          <h5 className="oq-form-subheading">Purchase Commission</h5>
          <EditableFieldGrid fields={purchaseCommissionFields} values={values} onChange={onChange} onNavigate={onNavigate} />
        </DetailAccordion>
      </div>
    </div>
  );
}

export default function Page() {
  const [panel, setPanel] = useState<"forms" | "assistant" | "details">(
    "forms",
  );
  const [zoom, setZoom] = useState("Fit width");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [partyOpen, setPartyOpen] = useState(false);
  const [detailValues, setDetailValues] = useState(initialDetailValues);
  const [checkedFields, setCheckedFields] = useState<string[]>(() =>
    linkedCheckedFields(initialDetailValues),
  );
  const [pdfFieldValues, setPdfFieldValues] = useState<Record<string, string>>(
    () => linkedTextValues(initialDetailValues),
  );
  const [activePdfField, setActivePdfField] = useState<{
    documentCode: PdfDocumentCode;
    stageKey: string;
    field: PdfFieldDefinition;
  } | null>(null);
  const [linkedHighlightId, setLinkedHighlightId] = useState<string | null>(null);
  // null = follow whichever document the canvas is scrolled to; a string is a
  // title the user typed and it wins from then on.
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [pdf, setPdf] = useState<PdfSelection>({
    src: "/forms/highlighted/AD_Disclosure_Real_Estate_Agency_Relationship_Buyer-1.2-highlighted.pdf",
    page: 1,
    label: "AD",
    title: "Disclosure Regarding Real Estate Agency Relationship (Buyer)",
  });
  const canvasRef = useRef<HTMLElement | null>(null);
  const stageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const linkedHighlightTimerRef = useRef<number | null>(null);

  const selectPanel = (nextPanel: "forms" | "assistant" | "details") => {
    if (panel === nextPanel && panelOpen) {
      setPanelOpen(false);
      return;
    }
    setPanel(nextPanel);
    setPanelOpen(true);
  };

  useEffect(() => {
    const compactViewport = window.matchMedia("(max-width: 820px)");
    const adaptPanel = (matches: boolean) => {
      if (matches) setPanelOpen(false);
    };
    adaptPanel(compactViewport.matches);
    const onChange = (event: MediaQueryListEvent) => adaptPanel(event.matches);
    compactViewport.addEventListener("change", onChange);
    return () => compactViewport.removeEventListener("change", onChange);
  }, []);

  useEffect(
    () => () => {
      if (linkedHighlightTimerRef.current !== null) {
        window.clearTimeout(linkedHighlightTimerRef.current);
      }
    },
    [],
  );

  // The canvas is a continuous scroll of every page; whichever page sits
  // closest to the top of the viewport is the one the toolbar reports.
  const syncActivePage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasTop = canvas.getBoundingClientRect().top;
    let closest: DocumentPage | null = null;
    let smallest = Number.POSITIVE_INFINITY;
    for (const page of documentPages) {
      const stage = stageRefs.current[pageKey(page)];
      if (!stage) continue;
      const distance = Math.abs(
        stage.getBoundingClientRect().top - canvasTop - 16,
      );
      if (distance < smallest) {
        smallest = distance;
        closest = page;
      }
    }
    if (!closest) return;
    setPdf((current) =>
      current.label === closest.label && current.page === closest.page
        ? current
        : closest,
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        syncActivePage();
      });
    };
    canvas.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      canvas.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [syncActivePage]);

  const goToPage = (page: DocumentPage) => {
    setPdf(page);
    stageRefs.current[pageKey(page)]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const updateDetailValue = (key: string, value: string) => {
    const nextValues = { ...detailValues, [key]: value };
    const affectedLinks = linksForDetailField(key);
    setDetailValues(nextValues);
    setPdfFieldValues((current) => {
      const next = { ...current };
      affectedLinks
        .filter((link) => link.kind !== "checkbox")
        .forEach((link) => {
          next[linkedPdfId(link)] = String(link.resolve(nextValues));
        });
      return next;
    });
    setCheckedFields((current) => {
      const next = new Set(current);
      affectedLinks
        .filter((link) => link.kind === "checkbox")
        .forEach((link) => {
          const id = linkedPdfId(link);
          if (Boolean(link.resolve(nextValues))) next.add(id);
          else next.delete(id);
        });
      return [...next];
    });
  };

  const linkedConflicts = useMemo(
    () => findLinkedConflicts(detailValues, pdfFieldValues, checkedFields),
    [detailValues, pdfFieldValues, checkedFields],
  );

  const goToLinkedField = (target: DetailPdfLink) => {
    const page = documentPages.find(
      (item) => item.label === target.form && item.page === target.page,
    );
    if (!page) {
      setNotice(`${target.form} page ${target.page} is not in this transaction packet.`);
      return;
    }
    const targetId = linkedPdfFieldDomId(target);
    const field = document.getElementById(targetId);
    const canvas = canvasRef.current;
    if (!field || !canvas) {
      setNotice(`The linked field in ${target.form} page ${target.page} is unavailable.`);
      return;
    }

    setPdf(page);
    if (window.location.hash !== `#${targetId}`) {
      window.location.hash = targetId;
    }
    const fieldRect = field.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const centeredTop =
      canvas.scrollTop +
      fieldRect.top -
      canvasRect.top -
      (canvas.clientHeight - fieldRect.height) / 2;
    canvas.scrollTo({ top: Math.max(0, centeredTop), behavior: "auto" });
    field.focus({ preventScroll: true });
    setLinkedHighlightId(targetId);
    if (linkedHighlightTimerRef.current !== null) {
      window.clearTimeout(linkedHighlightTimerRef.current);
    }
    linkedHighlightTimerRef.current = window.setTimeout(
      () => setLinkedHighlightId(null),
      6000,
    );
    setNotice(`Opened ${target.label} · ${target.form} page ${target.page}`);
  };

  const documentTitle = titleOverride ?? `[${pdf.label}] ${pdf.title}`;

  const zooms = ["Smaller", "Normal", "Larger", "Fit width", "Fit page"];
  const openDocument = (document: string) => {
    const code = document.match(/^\[([A-Z-]+)\]/)?.[1];
    const first = documentPages.find((page) => page.label === code);
    if (first) goToPage(first);
    else
      setNotice(
        "Preview is not available until this uploaded file is stored on the server.",
      );
  };
  return (
    <main
      className={`form-editor oq-editor oq-zoom-${zoom.toLowerCase().replace(" ", "-")} ${panelOpen ? "" : "oq-panel-collapsed"}`}
    >
      <header className="fe-heading">
        <Link
          className="fe-close"
          href="/transactions"
          aria-label="Close transaction detail"
        >
          <Icon name="close" />
          Close
        </Link>
        <h1 className="fe-title">
          <span>{documentTitle}</span>
          <button
            aria-label="Edit title"
            onClick={() => {
              const next = window.prompt("Document title", documentTitle);
              if (next?.trim()) setTitleOverride(next.trim());
            }}
          >
            <Icon name="edit" size={15} />
          </button>
        </h1>
        <b>2458 Maplewood Ave 12B, Los Angeles, CA 90026</b>
      </header>
      <div className="fe-toolbar">
        <div className="fe-zoom oq-zoom">
          <button
            onClick={() => setZoomOpen((v) => !v)}
            aria-expanded={zoomOpen}
          >
            {zoom}
            <Icon name="chevron" size={13} />
          </button>
          {zoomOpen && (
            <div className="oq-zoom-menu">
              {zooms.map((z) => (
                <button
                  className={z === zoom ? "active" : ""}
                  key={z}
                  onClick={() => {
                    setZoom(z);
                    setZoomOpen(false);
                  }}
                >
                  {z}
                  {z === zoom && <Icon name="check" size={14} />}
                </button>
              ))}
            </div>
          )}
          <span>{pdf.page}</span>
          <i>/</i>
          <span>{pdf.label === "AD" ? 3 : pdf.label === "BRBC" ? 13 : 1}</span>
        </div>
        <div className="fe-tool-actions">
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = pdf.src;
              link.download = pdf.src.split("/").pop() ?? "document.pdf";
              link.click();
            }}
          >
            <Icon name="download" />
            <span>Download</span>
          </button>
          <button
            onClick={() =>
              setNotice("Signing requires an e-signature provider integration.")
            }
          >
            <Icon name="sign" />
            <span>Sign</span>
          </button>
        </div>
      </div>
      <div className="fe-content">
        <section className="fe-canvas" ref={canvasRef}>
          {documentPages.map((item) => {
            const documentCode =
              item.label === "AD" || item.label === "BRBC" || item.label === "PRBS"
                ? item.label
                : null;
            const stageKey = pageKey(item);
            const pageFields = documentCode
              ? pdfFieldsByDocument[documentCode].filter(
                  (field) => field.page === item.page,
                )
              : [];
            return (
              <div
                className="oq-pdf-stage"
                key={stageKey}
                data-page={stageKey}
                ref={(node) => {
                  stageRefs.current[stageKey] = node;
                }}
              >
                <Image
                  className="oq-pdf-frame"
                  src={previewImage(item)}
                  alt={`${item.title}, page ${item.page}`}
                  width={1224}
                  height={1584}
                  loading={item.displayPage === 1 ? "eager" : "lazy"}
                  fetchPriority={item.displayPage === 1 ? "high" : "auto"}
                  unoptimized
                />
                {documentCode &&
                  pageFields.map((field) => {
                    const id = `${documentCode}:${field.id}`;
                    const value = pdfFieldValues[id] ?? field.value ?? "";
                    const checked = checkedFields.includes(id);
                    const domId = linkedPdfFieldDomId({
                      form: documentCode,
                      fieldId: field.id,
                    });
                    const linked = isLinkedPdfField(documentCode, field.id);
                    return (
                      <button
                        key={id}
                        id={linked ? domId : undefined}
                        className={`oq-pdf-field ${field.kind === "checkbox" ? "is-checkbox" : ""} ${field.kind === "signature" ? "is-signature" : ""} ${checked ? "checked" : ""} ${value ? "has-value" : ""} ${linkedHighlightId === domId ? "is-linked-target" : ""}`}
                        style={{
                          left: `${field.left}%`,
                          top: `${field.top}%`,
                          width: `${field.width}%`,
                          height: `${field.height}%`,
                        }}
                        title={field.label}
                        data-field-kind={field.kind}
                        data-document-code={documentCode}
                        data-field-value={value}
                        aria-label={
                          field.kind === "checkbox"
                            ? `Toggle ${field.label}`
                            : `Fill ${field.label}`
                        }
                        onClick={() => {
                          if (field.kind === "checkbox") {
                            setActivePdfField(null);
                            setCheckedFields((current) =>
                              current.includes(id)
                                ? current.filter((currentId) => currentId !== id)
                                : [...current, id],
                            );
                            return;
                          }
                          setActivePdfField({ documentCode, stageKey, field });
                        }}
                      >
                        {value && <span>{displayPdfFieldValue(field, value)}</span>}
                      </button>
                    );
                  })}
                {activePdfField?.stageKey === stageKey && (
                  <PdfFieldPopover
                    key={`${activePdfField.documentCode}:${activePdfField.field.id}`}
                    documentCode={activePdfField.documentCode}
                    field={activePdfField.field}
                    value={
                      pdfFieldValues[
                        `${activePdfField.documentCode}:${activePdfField.field.id}`
                      ] ?? activePdfField.field.value ?? ""
                    }
                    onClose={() => setActivePdfField(null)}
                    onSave={(value) => {
                      const id = `${activePdfField.documentCode}:${activePdfField.field.id}`;
                      setPdfFieldValues((current) => ({ ...current, [id]: value }));
                      setActivePdfField(null);
                    }}
                  />
                )}
              </div>
            );
          })}
          <PageThumbnailRail activeKey={pageKey(pdf)} onSelect={goToPage} />
          <button
            className="fe-info"
            aria-label="Document information"
            onClick={() =>
              setNotice(
                `${pdf.label} · Page ${pdf.page} · Fillable PDF fields are highlighted in blue.`,
              )
            }
          >
            <Icon name="info" />
          </button>
        </section>
        {panelOpen && (
          <aside
            className={`fe-context ${panel === "forms" || panel === "details" ? "oq-context-headless" : ""}`}
          >
            {panel === "assistant" && (
              <header className="oq-panel-heading">
                <h2>Assistant</h2>
                <button
                  className="oq-panel-close"
                  aria-label="Close panel"
                  onClick={() => setPanelOpen(false)}
                >
                  <Icon name="close" size={24} />
                </button>
              </header>
            )}
            {panel === "forms" ? (
              <FormsPanel
                activeLabel={pdf.label}
                onOpen={openDocument}
                onClose={() => setPanelOpen(false)}
              />
            ) : panel === "assistant" ? (
              <AssistantPanel
                key={`${pdf.label}-${pdf.page}`}
                documentLabel={pdf.label}
                documentTitle={pdf.title}
                page={pdf.page}
              />
            ) : (
              <DetailsPartiesPanel
                onAddParty={() => setPartyOpen(true)}
                onClose={() => setPanelOpen(false)}
                values={detailValues}
                onChange={updateDetailValue}
                onNavigate={goToLinkedField}
                conflicts={linkedConflicts}
              />
            )}
          </aside>
        )}
        <nav className="fe-mode-rail" aria-label="Workspace modes">
          <button
            className={panel === "forms" && panelOpen ? "active" : ""}
            aria-pressed={panel === "forms" && panelOpen}
            aria-label="Toggle documents panel"
            onClick={() => selectPanel("forms")}
          >
            <Icon name="file" />
            <span>Docs</span>
          </button>
          <button
            className={panel === "assistant" && panelOpen ? "active" : ""}
            aria-pressed={panel === "assistant" && panelOpen}
            aria-label="Toggle assistant panel"
            onClick={() => selectPanel("assistant")}
          >
            <Icon name="assistant" />
            <span>Assistant</span>
          </button>
          <button
            className={panel === "details" && panelOpen ? "active" : ""}
            aria-pressed={panel === "details" && panelOpen}
            aria-label="Toggle details and parties panel"
            onClick={() => selectPanel("details")}
          >
            <Icon name="parties" />
            <span>Details /<br />Parties</span>
          </button>
        </nav>
      </div>
      {partyOpen && <PartyModal onClose={() => setPartyOpen(false)} />}
      {notice && (
        <div className="oq-toast" role="status">
          {notice}
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
    </main>
  );
}
