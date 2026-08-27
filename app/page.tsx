"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  pdfFieldsByDocument,
  type PdfFieldDefinition,
} from "./pdf-field-data";
import { activeTransactionName } from "./transaction-data";

type PdfDocumentCode = keyof typeof pdfFieldsByDocument;

type IconName =
  | "close"
  | "menu"
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
  | "eye"
  | "info"
  | "assistant"
  | "parties"
  | "user";
const paths: Record<IconName, React.ReactNode> = {
  close: <path d="M5 5l14 14M19 5L5 19" />,
  menu: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </>
  ),
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
  eye: (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.75" />
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

function EditorNavigationFlyout() {
  return (
    <div className="oq-editor-nav-trigger">
      <Link
        className="fe-close"
        href="/transactions"
        aria-label="Open transaction projects"
        title="Open transaction projects"
      >
        <Icon name="menu" size={28} />
      </Link>

      <aside className="oq-editor-nav-flyout" aria-label="Workspace navigation">
        <header>
          <span>O</span>
          <b>Orqestron</b>
        </header>

        <button className="oq-editor-nav-organization">
          <span>
            <b>Acme Reazy</b>
            <small>OWNER</small>
          </span>
          <Icon name="chevron" size={13} />
        </button>

        <span className="oq-editor-nav-label">Workspace</span>
        <nav aria-label="Workspace">
          <Link className="active" href="/transactions">
            <Icon name="file" />
            <span>Transactions</span>
            <b>1</b>
          </Link>
          <button>
            <Icon name="info" />
            <span>Audit</span>
          </button>
        </nav>

        <span className="oq-editor-nav-label resources">Resources</span>
        <nav aria-label="Resources">
          <button>
            <Icon name="file" />
            <span>Forms</span>
            <b>48</b>
          </button>
          <button>
            <Icon name="user" />
            <span>Contacts</span>
            <b>1</b>
          </button>
          <button>
            <Icon name="history" />
            <span>Templates</span>
          </button>
          <button>
            <Icon name="file" />
            <span>Source Library</span>
          </button>
        </nav>

        <footer>
          <span>VN</span>
          <span>
            <b>Vu Nguyen</b>
            <small>vu.nguyen@c0x12c.com</small>
          </span>
        </footer>
      </aside>
    </div>
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
    thumb: `/form-thumbnails/rail/ad-${index + 1}.png`,
    src: AD_SRC,
    page: index + 1,
    displayPage: index + 1,
    label: "AD",
    title: "Disclosure Regarding Real Estate Agency Relationship (Buyer)",
  })),
  ...Array.from({ length: 13 }, (_, index) => ({
    thumb: `/form-thumbnails/rail/brbc-page-${String(index + 1).padStart(2, "0")}.png`,
    src: BRBC_SRC,
    page: index + 1,
    displayPage: index + 4,
    label: "BRBC",
    title: "Buyer Representation and Broker Compensation Agreement",
  })),
  {
    thumb: "/form-thumbnails/rail/prbs.png",
    src: PRBS_SRC,
    page: 1,
    displayPage: 17,
    label: "PRBS",
    title: "Possible Representation of More Than One Buyer or Seller",
  },
];

const pageKey = (page: { label: string; page: number }) =>
  `${page.label}-${page.page}`;

/** Keep decoded full-page bitmaps bounded even when a transaction has many forms. */
const PDF_PAGE_MOUNT_RADIUS = 1;

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

type SignatureDocumentOption = {
  code: PdfDocumentCode;
  title: string;
};

const signatureDocumentOptions: SignatureDocumentOption[] = [
  {
    code: "AD",
    title: "Disclosure Regarding Real Estate Agency Relationship (Buyer)",
  },
  {
    code: "BRBC",
    title: "Buyer Representation and Broker Compensation Agreement",
  },
  {
    code: "PRBS",
    title: "Possible Representation of More Than One Buyer or Seller",
  },
];

type SignatureRequiredFieldIds = Record<PdfDocumentCode, string[]>;

const signatureDemoMissingFieldCount: Record<PdfDocumentCode, number> = {
  AD: 2,
  BRBC: 2,
  PRBS: 1,
};

const signatureFieldIsComplete = (
  documentCode: PdfDocumentCode,
  field: PdfFieldDefinition,
  pdfFieldValues: Record<string, string>,
  checkedFields: string[],
) => {
  const id = `${documentCode}:${field.id}`;
  if (field.kind === "checkbox") return checkedFields.includes(id);
  return Boolean((pdfFieldValues[id] ?? field.value ?? "").trim());
};

const buildSignatureDemoRequiredFields = (
  pdfFieldValues: Record<string, string>,
  checkedFields: string[],
) =>
  Object.fromEntries(
    (Object.keys(pdfFieldsByDocument) as PdfDocumentCode[]).map((code) => [
      code,
      pdfFieldsByDocument[code]
        .filter((field) => !isSigningDateField(code, field))
        .filter(
          (field) =>
            !signatureFieldIsComplete(
              code,
              field,
              pdfFieldValues,
              checkedFields,
            ),
        )
        .slice(0, signatureDemoMissingFieldCount[code])
        .map((field) => field.id),
    ]),
  ) as SignatureRequiredFieldIds;

const signatureDocumentIsComplete = (
  documentCode: PdfDocumentCode,
  pdfFieldValues: Record<string, string>,
  checkedFields: string[],
  requiredFieldIdsByDocument: SignatureRequiredFieldIds,
) =>
  requiredFieldIdsByDocument[documentCode].every((fieldId) => {
    const field = pdfFieldsByDocument[documentCode].find(
      (candidate) => candidate.id === fieldId,
    );
    return field
      ? signatureFieldIsComplete(
          documentCode,
          field,
          pdfFieldValues,
          checkedFields,
        )
      : true;
  });

function SignatureDocumentPicker({
  documents,
  initialDocuments,
  pdfFieldValues,
  checkedFields,
  requiredFieldIdsByDocument,
  onClose,
  onContinue,
  onEditDocument,
  onUpdateField,
}: {
  documents: string[];
  initialDocuments: PdfDocumentCode[];
  pdfFieldValues: Record<string, string>;
  checkedFields: string[];
  requiredFieldIdsByDocument: SignatureRequiredFieldIds;
  onClose: () => void;
  onContinue: (documents: PdfDocumentCode[]) => void;
  onEditDocument: (
    document: PdfDocumentCode,
    selectedDocuments: PdfDocumentCode[],
  ) => void;
  onUpdateField: (
    document: PdfDocumentCode,
    field: PdfFieldDefinition,
    value: string | boolean,
  ) => void;
}) {
  const completableFieldsFor = (documentCode: PdfDocumentCode) =>
    pdfFieldsByDocument[documentCode].filter(
      (field) => !isSigningDateField(documentCode, field),
    );

  const incompleteFieldsFor = (documentCode: PdfDocumentCode) =>
    completableFieldsFor(documentCode).filter(
      (field) =>
        requiredFieldIdsByDocument[documentCode].includes(field.id) &&
        !signatureFieldIsComplete(
          documentCode,
          field,
          pdfFieldValues,
          checkedFields,
        ),
    );

  // Every document currently in the transaction, in Workspace order. Ones the
  // prototype has no field data for are listed but cannot be signed yet.
  const documentOptions = documents.map(parseTransactionDocument);
  const signableOptions = documentOptions.filter(({ code }) =>
    isPdfDocumentCode(code),
  );
  const readyDocumentCodes = signableOptions
    .filter(
      ({ code }) =>
        isPdfDocumentCode(code) &&
        signatureDocumentIsComplete(
          code,
          pdfFieldValues,
          checkedFields,
          requiredFieldIdsByDocument,
        ),
    )
    .map(({ code }) => code as PdfDocumentCode);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<PdfDocumentCode>>(
    () =>
      new Set(
        initialDocuments.filter((code) => readyDocumentCodes.includes(code)),
      ),
  );
  const [previewDocument, setPreviewDocument] =
    useState<AvailableTransactionForm | null>(null);
  const [editingDocument, setEditingDocument] =
    useState<PdfDocumentCode | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] = useState("");
  const [checkboxDraft, setCheckboxDraft] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const allReadySelected =
    readyDocumentCodes.length > 0 &&
    readyDocumentCodes.every((code) => selectedDocuments.has(code));
  const incompleteDocumentCount =
    signableOptions.length - readyDocumentCodes.length;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    headingRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const toggleDocument = (code: PdfDocumentCode) => {
    if (!readyDocumentCodes.includes(code)) {
      startEditing(code);
      return;
    }
    setSelectedDocuments((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const selectionLabel = `${selectedDocuments.size} ready selected · ${incompleteDocumentCount} incomplete`;
  const orderedSelection = () =>
    signableOptions
      .filter(({ code }) => selectedDocuments.has(code as PdfDocumentCode))
      .map(({ code }) => code as PdfDocumentCode);

  const prepareEditorField = (
    documentCode: PdfDocumentCode,
    field: PdfFieldDefinition,
  ) => {
    const id = `${documentCode}:${field.id}`;
    setEditingFieldId(field.id);
    setFieldDraft(pdfFieldValues[id] ?? field.value ?? "");
    setCheckboxDraft(checkedFields.includes(id));
  };

  const startEditing = (documentCode: PdfDocumentCode) => {
    const firstField = incompleteFieldsFor(documentCode)[0];
    if (!firstField) return;
    setEditingDocument(documentCode);
    prepareEditorField(documentCode, firstField);
  };

  const editingFields = editingDocument
    ? incompleteFieldsFor(editingDocument)
    : [];
  const editingField =
    editingFields.find((field) => field.id === editingFieldId) ??
    editingFields[0];
  const editingOption = signatureDocumentOptions.find(
    ({ code }) => code === editingDocument,
  );
  const editingTotal = editingDocument
    ? completableFieldsFor(editingDocument).length
    : 0;
  const editingCompleted = editingTotal - editingFields.length;

  const moveToField = (direction: 1 | -1) => {
    if (!editingDocument || !editingField || editingFields.length < 2) return;
    const currentIndex = editingFields.findIndex(
      (field) => field.id === editingField.id,
    );
    const nextIndex =
      (currentIndex + direction + editingFields.length) % editingFields.length;
    prepareEditorField(editingDocument, editingFields[nextIndex]);
  };

  const saveEditorField = () => {
    if (!editingDocument || !editingField) return;
    onUpdateField(
      editingDocument,
      editingField,
      editingField.kind === "checkbox" ? checkboxDraft : fieldDraft.trim(),
    );
    const remainingFields = editingFields.filter(
      (field) => field.id !== editingField.id,
    );
    if (remainingFields.length === 0) {
      setEditingDocument(null);
      setEditingFieldId(null);
      return;
    }
    const currentIndex = editingFields.findIndex(
      (field) => field.id === editingField.id,
    );
    prepareEditorField(
      editingDocument,
      remainingFields[currentIndex % remainingFields.length],
    );
  };

  return (
    <div className="oq-signature-picker-backdrop" onMouseDown={onClose}>
      <section
        className="oq-signature-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signature-picker-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <h2 id="signature-picker-title" tabIndex={-1} ref={headingRef}>
              Send for Signature
            </h2>
            <p>2458 Maplewood Ave 12B</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close document selection">
            <Icon name="close" size={17} />
          </button>
        </header>

        {editingDocument && editingField ? (
          <>
            <div className="oq-signature-picker-body oq-inline-field-editor">
              <button
                type="button"
                className="oq-inline-editor-back"
                onClick={() => setEditingDocument(null)}
              >
                <span aria-hidden="true">←</span> Documents
              </button>
              <div className="oq-inline-editor-document">
                <span className="oq-file-icon" aria-hidden="true">
                  <Icon name="file" size={17} />
                </span>
                <span>
                  <b>{editingDocument} — {editingOption?.title}</b>
                  <small>{editingFields.length} fields still need attention</small>
                </span>
              </div>
              <div className="oq-inline-editor-progress" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.max(
                      4,
                      (editingCompleted / editingTotal) * 100,
                    )}%`,
                  }}
                />
              </div>
              <section className="oq-inline-editor-field">
                <header>
                  <span>Next incomplete field</span>
                  <small>Page {editingField.page}</small>
                </header>
                <h3>{pdfFieldLabel(editingField)}</h3>
                {editingField.kind === "checkbox" ? (
                  <button
                    type="button"
                    className={`oq-inline-checkbox ${checkboxDraft ? "is-checked" : ""}`}
                    role="checkbox"
                    aria-checked={checkboxDraft}
                    onClick={() => setCheckboxDraft((current) => !current)}
                  >
                    <span aria-hidden="true">
                      {checkboxDraft && <Icon name="check" size={14} />}
                    </span>
                    <span>
                      <b>{checkboxDraft ? "Selected" : "Not selected"}</b>
                      <small>Click to change this field</small>
                    </span>
                  </button>
                ) : (
                  <label>
                    <span>
                      {editingField.kind === "signature"
                        ? "Signer’s full name"
                        : "Value"}
                    </span>
                    <input
                      autoFocus
                      type={editingField.kind === "date" ? "date" : "text"}
                      value={fieldDraft}
                      placeholder={
                        editingField.kind === "signature"
                          ? "Enter the person who will sign"
                          : "Enter value"
                      }
                      onChange={(event) => setFieldDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && fieldDraft.trim()) {
                          event.preventDefault();
                          saveEditorField();
                        }
                      }}
                    />
                  </label>
                )}
                {editingField.kind === "signature" && (
                  <p>The signature itself will be collected by Docusign.</p>
                )}
              </section>
              <button
                type="button"
                className="oq-inline-open-pdf"
                onClick={() =>
                  onEditDocument(editingDocument, orderedSelection())
                }
              >
                Open this field in the PDF <span aria-hidden="true">↗</span>
              </button>
            </div>
            <footer className="oq-inline-editor-footer">
              <span aria-live="polite">
                {editingFields.length} remaining in {editingDocument}
              </span>
              <div>
                <button
                  type="button"
                  disabled={editingFields.length < 2}
                  onClick={() => moveToField(1)}
                >
                  Skip
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={
                    editingField.kind === "checkbox"
                      ? !checkboxDraft
                      : !fieldDraft.trim()
                  }
                  onClick={saveEditorField}
                >
                  Save &amp; next <span aria-hidden="true">→</span>
                </button>
              </div>
            </footer>
          </>
        ) : (
          <>
            <div className="oq-signature-picker-body">
              <div className="oq-signature-picker-instructions">
                <p>Only completed documents can be included in a signature request.</p>
                <button
                  type="button"
                  disabled={readyDocumentCodes.length === 0}
                  onClick={() =>
                    setSelectedDocuments(
                      allReadySelected
                        ? new Set()
                        : new Set(readyDocumentCodes),
                    )
                  }
                >
                  {allReadySelected ? "Clear selection" : "Select ready"}
                </button>
              </div>

              <div className="oq-signature-picker-list" aria-label="Transaction documents">
                {documentOptions.map((document) => {
                  const signable = isPdfDocumentCode(document.code);
                  const previewForm = previewFormFor(
                    document.code,
                    document.title,
                  );
                  const label = document.entry;
                  const previewButton = (
                    <button
                      type="button"
                      className="oq-signature-picker-preview"
                      title={`Preview ${document.code}`}
                      aria-label={`Preview ${label}`}
                      onClick={() => setPreviewDocument(previewForm)}
                    >
                      <Icon name="eye" size={16} />
                    </button>
                  );

                  // Added from the Workspace but with no field model yet — it
                  // still belongs in the list, it just cannot be signed here.
                  if (!signable) {
                    return (
                      <div
                        className="oq-signature-picker-item is-unsupported"
                        key={document.entry}
                      >
                        <div className="oq-signature-picker-choice">
                          <span className="oq-signature-picker-slot" aria-hidden="true" />
                          <span className="oq-file-icon" aria-hidden="true">
                            <Icon name="file" size={18} />
                          </span>
                          <span className="oq-signature-picker-document">
                            <b>{label}</b>
                            <small>
                              {previewForm.href
                                ? `${previewForm.pages} page${previewForm.pages === 1 ? "" : "s"}`
                                : "PDF form"}{" "}
                              · no fillable fields yet
                            </small>
                          </span>
                          <span className="oq-signature-picker-action is-unsupported">
                            Preview only
                          </span>
                        </div>
                        {previewButton}
                      </div>
                    );
                  }

                  const code = document.code as PdfDocumentCode;
                  const selected = selectedDocuments.has(code);
                  const completableFields = completableFieldsFor(code);
                  const missingFields = incompleteFieldsFor(code).length;
                  const completedFields = completableFields.length - missingFields;
                  const complete = missingFields === 0;
                  const progress = completableFields.length
                    ? Math.round(
                        (completedFields / completableFields.length) * 100,
                      )
                    : 100;
                  // One row, one statement of state: the meter carries "how far",
                  // the trailing cell carries the only action.
                  const rowContent = (
                    <>
                      {complete ? (
                        <span className="oq-signature-picker-check" aria-hidden="true">
                          {selected && <Icon name="check" size={12} />}
                        </span>
                      ) : (
                        // Blocked documents cannot be picked, so the tick column
                        // stays empty — the row keeps the Workspace alignment.
                        <span className="oq-signature-picker-slot" aria-hidden="true" />
                      )}
                      <span className="oq-file-icon" aria-hidden="true">
                        <Icon name="file" size={18} />
                      </span>
                      <span className="oq-signature-picker-document">
                        <b>{label}</b>
                        {complete ? (
                          <small>
                            {completableFields.length} field
                            {completableFields.length === 1 ? "" : "s"} complete
                          </small>
                        ) : (
                          <span className="oq-signature-picker-progress">
                            <span aria-hidden="true">
                              <i style={{ width: `${Math.max(4, progress)}%` }} />
                            </span>
                            <small>
                              {missingFields} of {completableFields.length} fields left
                            </small>
                          </span>
                        )}
                      </span>
                      <span
                        className={`oq-signature-picker-action ${complete ? "is-complete" : "is-incomplete"}`}
                      >
                        {complete ? (
                          <>
                            <Icon name="check" size={13} /> Ready
                          </>
                        ) : (
                          <>
                            Complete <span aria-hidden="true">→</span>
                          </>
                        )}
                      </span>
                    </>
                  );
                  return (
                    <div
                      className={`oq-signature-picker-item ${complete ? "is-ready" : "is-incomplete"} ${selected ? "is-selected" : ""}`}
                      key={document.entry}
                    >
                      {complete ? (
                        <button
                          type="button"
                          className="oq-signature-picker-choice"
                          role="checkbox"
                          aria-checked={selected}
                          onClick={() => toggleDocument(code)}
                        >
                          {rowContent}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="oq-signature-picker-choice"
                          aria-label={`Complete ${missingFields} remaining field${missingFields === 1 ? "" : "s"} in ${label}`}
                          onClick={() => startEditing(code)}
                        >
                          {rowContent}
                        </button>
                      )}
                      {previewButton}
                    </div>
                  );
                })}
              </div>
            </div>

            <footer>
              <span aria-live="polite">{selectionLabel}</span>
              <div>
                <button type="button" onClick={onClose}>Cancel</button>
                <button
                  type="button"
                  className="primary"
                  disabled={selectedDocuments.size === 0}
                  onClick={() => onContinue(orderedSelection())}
                >
                  Continue <span aria-hidden="true">→</span>
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
      {previewDocument && (
        <PdfPreviewModal
          form={previewDocument}
          values={pdfFieldValues}
          checkedFields={checkedFields}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
}

type SignatureRecipient = {
  id: string;
  name: string;
  email: string;
  role: string;
  delivery: "sign" | "copy" | "in_person";
};

const initialSignatureRecipients: SignatureRecipient[] = [
  {
    id: "buyer-1",
    name: "Alexis Romero",
    email: "alexis.romero@example.com",
    role: "Buyer 1",
    delivery: "sign",
  },
  {
    id: "seller",
    name: "Dana Whitfield",
    email: "dana.whitfield@example.com",
    role: "Seller",
    delivery: "sign",
  },
  {
    id: "listing-agent",
    name: "Priya Raman",
    email: "priya.raman@example.com",
    role: "Listing Agent",
    delivery: "sign",
  },
  {
    id: "buyer-agent",
    name: "Vu Nguyen",
    email: "vu.nguyen@c0x12c.com",
    role: "Buyer’s Agent",
    delivery: "copy",
  },
];

const recipientInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

type SignatureTabKind = "signature" | "initials" | "date";

type SignaturePreparationTab = {
  id: string;
  recipientId: string;
  kind: SignatureTabKind;
  documentCode: PdfDocumentCode;
  page: number;
  x: number;
  y: number;
};

const signatureTabLabel: Record<SignatureTabKind, string> = {
  signature: "Signature",
  initials: "Initials",
  date: "Date signed",
};

function SignaturePackageFlow({
  currentDocumentCode,
  selectedDocuments,
  eligibleDocuments,
  onClose,
  onContinue,
}: {
  currentDocumentCode: string;
  selectedDocuments: PdfDocumentCode[];
  eligibleDocuments: PdfDocumentCode[];
  onClose: () => void;
  onContinue: (document: string) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [includedDocuments, setIncludedDocuments] = useState<PdfDocumentCode[]>(
    selectedDocuments,
  );
  const [transactionDocument, setTransactionDocument] = useState(
    signatureDocumentOptions.find(
      ({ code }) => !selectedDocuments.includes(code),
    )?.code ?? selectedDocuments[0] ?? currentDocumentCode,
  );
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [docusignLinkStarted, setDocusignLinkStarted] = useState(false);
  const [signingOrder, setSigningOrder] = useState(false);
  const [recipients, setRecipients] = useState(initialSignatureRecipients);
  const [recipientDragIndex, setRecipientDragIndex] = useState<number | null>(
    null,
  );
  const [addingRecipient, setAddingRecipient] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [autoAddTabs, setAutoAddTabs] = useState(true);
  const [preparationTabs, setPreparationTabs] = useState<
    SignaturePreparationTab[]
  >([]);
  const [tabHistory, setTabHistory] = useState<SignaturePreparationTab[][]>([]);
  const [redoTabHistory, setRedoTabHistory] = useState<
    SignaturePreparationTab[][]
  >([]);
  const [activePreparationDocument, setActivePreparationDocument] =
    useState<PdfDocumentCode>(
      selectedDocuments[0] ?? (currentDocumentCode as PdfDocumentCode),
    );
  const [activePreparationPage, setActivePreparationPage] = useState(1);
  const [activePreparationRecipient, setActivePreparationRecipient] = useState(
    initialSignatureRecipients.find(({ delivery }) => delivery !== "copy")?.id ??
      "",
  );
  const [pendingTabKind, setPendingTabKind] =
    useState<SignatureTabKind | null>(null);
  const [preparationZoom, setPreparationZoom] = useState("fit");
  const preparationPageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nextPreparationTabId = useRef(0);
  const [sendState, setSendState] = useState<"review" | "sending" | "sent">(
    "review",
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setUploadedFiles((current) => [
      ...new Set([...current, ...Array.from(files).map((file) => file.name)]),
    ]);
  };

  const signingRecipients = recipients.filter(
    ({ delivery }) => delivery !== "copy",
  );
  const detectedTabCount = includedDocuments.reduce(
    (total, code) =>
      total +
      pdfFieldsByDocument[code].filter((field) => field.kind === "signature")
        .length,
    0,
  );
  const placedTabCount = preparationTabs.length;
  const availableTransactionDocuments = signatureDocumentOptions.filter(
    ({ code }) =>
      eligibleDocuments.includes(code) && !includedDocuments.includes(code),
  );
  const transactionDocumentSelection =
    availableTransactionDocuments.find(
      ({ code }) => code === transactionDocument,
    )?.code ?? availableTransactionDocuments[0]?.code ?? "";
  const recipientEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    recipientEmail.trim(),
  );

  const automaticallyPlacedTabs = () => {
    if (signingRecipients.length === 0) return [];
    let recipientIndex = 0;
    return includedDocuments.flatMap((code) =>
      pdfFieldsByDocument[code]
        .filter((field) => field.kind === "signature")
        .map((field) => {
          const recipient =
            signingRecipients[recipientIndex++ % signingRecipients.length];
          return {
            id: `detected-${code}-${field.id}`,
            recipientId: recipient.id,
            kind: "signature" as const,
            documentCode: code,
            page: field.page,
            x: Math.min(86, Math.max(4, field.left)),
            y: Math.min(94, Math.max(3, field.top)),
          };
        }),
    );
  };

  const moveRecipient = (index: number, direction: -1 | 1) => {
    setRecipients((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  // Drag-to-reorder, same grip affordance as the Workspace document list.
  const dropRecipient = (toIndex: number) => {
    if (recipientDragIndex === null || recipientDragIndex === toIndex) {
      setRecipientDragIndex(null);
      return;
    }
    setRecipients((current) => {
      const next = [...current];
      const [moved] = next.splice(recipientDragIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setRecipientDragIndex(null);
  };

  const commitPreparationTabs = (next: SignaturePreparationTab[]) => {
    setTabHistory((current) => [...current, preparationTabs]);
    setRedoTabHistory([]);
    setPreparationTabs(next);
  };

  const undoPreparationTabs = () => {
    const previous = tabHistory.at(-1);
    if (!previous) return;
    setRedoTabHistory((current) => [preparationTabs, ...current]);
    setPreparationTabs(previous);
    setTabHistory((current) => current.slice(0, -1));
  };

  const redoPreparationTabsChange = () => {
    const next = redoTabHistory[0];
    if (!next) return;
    setTabHistory((current) => [...current, preparationTabs]);
    setPreparationTabs(next);
    setRedoTabHistory((current) => current.slice(1));
  };

  const placePreparationTab = (
    kind: SignatureTabKind,
    x: number,
    y: number,
    documentCode = activePreparationDocument,
    page = activePreparationPage,
  ) => {
    if (!activePreparationRecipient) return;
    nextPreparationTabId.current += 1;
    commitPreparationTabs([
      ...preparationTabs,
      {
        id: `manual-tab-${nextPreparationTabId.current}`,
        recipientId: activePreparationRecipient,
        kind,
        documentCode,
        page,
        x: Math.min(88, Math.max(2, x)),
        y: Math.min(96, Math.max(2, y)),
      },
    ]);
    setPendingTabKind(null);
  };

  const placeTabFromPointer = (
    event: React.MouseEvent<HTMLDivElement> | React.DragEvent<HTMLDivElement>,
    kind: SignatureTabKind,
    documentCode = activePreparationDocument,
    page = activePreparationPage,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    placePreparationTab(
      kind,
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100,
      documentCode,
      page,
    );
  };

  const includedPreparationPages = includedDocuments.flatMap((code) =>
    documentPages.filter((page) => page.label === code),
  );
  const activePreparationDocumentIndex = includedDocuments.indexOf(
    activePreparationDocument,
  );
  const activePreparationPageIndex = includedPreparationPages.findIndex(
    (page) =>
      page.label === activePreparationDocument &&
      page.page === activePreparationPage,
  );
  const activeSigner = signingRecipients.find(
    ({ id }) => id === activePreparationRecipient,
  );

  const scrollToPreparationPage = (
    documentCode: PdfDocumentCode,
    page: number,
  ) => {
    setActivePreparationDocument(documentCode);
    setActivePreparationPage(page);
    setPendingTabKind(null);
    window.requestAnimationFrame(() => {
      preparationPageRefs.current[`${documentCode}-${page}`]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const moveThroughPreparationPages = (direction: -1 | 1) => {
    const currentIndex = Math.max(0, activePreparationPageIndex);
    const nextPage = includedPreparationPages[currentIndex + direction];
    if (!nextPage) return;
    scrollToPreparationPage(nextPage.label as PdfDocumentCode, nextPage.page);
  };

  const syncActivePreparationPage = (
    event: React.UIEvent<HTMLDivElement>,
  ) => {
    const scroller = event.currentTarget;
    const scrollerTop = scroller.getBoundingClientRect().top + 20;
    const closest = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-preparation-page]"),
    )
      .map((page) => ({
        page,
        distance: Math.abs(page.getBoundingClientRect().top - scrollerTop),
      }))
      .sort((first, second) => first.distance - second.distance)[0]?.page;
    if (!closest) return;
    const documentCode = closest.dataset.documentCode as PdfDocumentCode;
    const page = Number(closest.dataset.pageNumber);
    if (
      documentCode &&
      page &&
      (documentCode !== activePreparationDocument ||
        page !== activePreparationPage)
    ) {
      setActivePreparationDocument(documentCode);
      setActivePreparationPage(page);
    }
  };

  const sendSignatureRequest = () => {
    if (sendState !== "review" || placedTabCount === 0) return;
    setSendState("sending");
    window.setTimeout(() => setSendState("sent"), 1200);
  };

  return (
    <section
      className="oq-signature-flow"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signature-flow-title"
    >
      <header className="oq-signature-header">
        <button onClick={onClose} aria-label="Close request signatures">
          <Icon name="close" />
        </button>
        <div>
          <h2 id="signature-flow-title">Request signatures</h2>
          <p>2458 Maplewood Ave 12B</p>
        </div>
        <span>{sendState === "sent" ? "Request sent" : `Step ${step} of 3`}</span>
      </header>

      <main
        className={`oq-signature-main ${step === 3 && sendState !== "sent" ? "is-preparing" : ""}`}
      >
        {step === 1 ? (
          <form
            className="oq-signature-card"
            onSubmit={(event) => {
              event.preventDefault();
              setStep(2);
            }}
          >
          <header>
            <span className="oq-signature-kicker">Signature package</span>
            <h3>Prepare documents for signing</h3>
            <p>Choose the forms your clients need to sign.</p>
          </header>

          <section className="oq-provider-summary" aria-label="Signature provider">
            <h4>Provider</h4>
            <div>
              <span className="oq-provider-identity">
                <Image
                  src="/docusign-logo.svg"
                  width={112}
                  height={24}
                  alt="Docusign"
                />
                <small>Secure electronic signature</small>
                {docusignLinkStarted && (
                  <small className="oq-provider-link-status" role="status">
                    Finish signing in, then return to this tab.
                  </small>
                )}
              </span>
              <button
                type="button"
                className="oq-link-provider"
                onClick={() => {
                  window.open(
                    "https://account.docusign.com/",
                    "_blank",
                    "noopener,noreferrer",
                  );
                  setDocusignLinkStarted(true);
                }}
              >
                <Icon name="plus" size={14} />
                {docusignLinkStarted ? "Open Docusign" : "Link account"}
              </button>
            </div>
          </section>

          <section className="oq-selected-signature-documents" aria-label="Selected documents">
            <h4>Included from transaction</h4>
            <ul>
              {includedDocuments.map((code) => {
                const document = signatureDocumentOptions.find(
                  (option) => option.code === code,
                );
                return (
                  <li key={code}>
                    <span><Icon name="check" size={12} /></span>
                    <b>{code} — {document?.title}</b>
                  </li>
                );
              })}
            </ul>
          </section>

          <fieldset className="oq-signature-documents">
            <legend>Add another document</legend>
            <div
              className="oq-signature-dropzone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                addFiles(event.dataTransfer.files);
              }}
            >
              <label>
                <span className="oq-upload-icon">
                  <Icon name="plus" />
                </span>
                <b>Upload documents</b>
                <small>Click to browse or drag PDF files here</small>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(event) => addFiles(event.target.files)}
                />
              </label>
              <span>or add from transaction</span>
              <div className="oq-transaction-document-add">
                <select
                  aria-label="Add a document from this transaction"
                  value={transactionDocumentSelection}
                  disabled={availableTransactionDocuments.length === 0}
                  onChange={(event) =>
                    setTransactionDocument(event.target.value as PdfDocumentCode)
                  }
                >
                  {availableTransactionDocuments.length === 0 ? (
                    <option>No other completed documents available</option>
                  ) : (
                    availableTransactionDocuments.map(({ code, title }) => (
                      <option key={code} value={code}>[{code}] {title}</option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  disabled={availableTransactionDocuments.length === 0}
                  onClick={() => {
                    const code = transactionDocumentSelection as PdfDocumentCode;
                    if (!code) return;
                    if (includedDocuments.includes(code)) return;
                    const nextDocuments = [...includedDocuments, code];
                    setIncludedDocuments(nextDocuments);
                    setTransactionDocument(
                      availableTransactionDocuments.find(
                        ({ code: optionCode }) => optionCode !== code,
                      )?.code ?? code,
                    );
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <ul className="oq-signature-files" aria-label="Uploaded documents">
                {uploadedFiles.map((file) => (
                  <li key={file}>
                    <Icon name="file" />
                    <span>{file}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${file}`}
                      onClick={() =>
                        setUploadedFiles((current) =>
                          current.filter((currentFile) => currentFile !== file),
                        )
                      }
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          <footer>
            <button type="button" onClick={onClose}>Cancel</button>
            <button className="primary" type="submit">
              Continue <span aria-hidden="true">›</span>
            </button>
          </footer>
          </form>
        ) : step === 2 ? (
          <section className="oq-signature-card oq-recipient-card">
            <header>
              <span className="oq-signature-kicker">Recipients</span>
              <h3>Add signers and recipients</h3>
              <p>
                People matched to signature fields are added from this transaction.
              </p>
            </header>

            <div className="oq-recipient-body">
              <div className="oq-recipient-heading">
                <span>
                  <b>Recipients</b>
                  <small>Review who signs and who receives a copy.</small>
                </span>
                <label className="oq-signing-order">
                  <input
                    type="checkbox"
                    checked={signingOrder}
                    onChange={(event) => setSigningOrder(event.target.checked)}
                  />
                  <span aria-hidden="true" />
                  Set signing order
                </label>
              </div>

              <ol className="oq-recipient-list">
                {recipients.map((recipient, index) => (
                  <li
                    key={recipient.id}
                    draggable
                    className={recipientDragIndex === index ? "is-dragging" : ""}
                    onDragStart={() => setRecipientDragIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => dropRecipient(index)}
                    onDragEnd={() => setRecipientDragIndex(null)}
                  >
                    <span
                      className="oq-drag-handle oq-recipient-grip"
                      title="Drag to reorder"
                      aria-hidden="true"
                    >
                      <Icon name="grip" />
                    </span>
                    {signingOrder && (
                      <span className="oq-recipient-order-controls">
                        <span className="oq-recipient-order">{index + 1}</span>
                        <span>
                          <button
                            type="button"
                            aria-label={`Move ${recipient.name} earlier`}
                            disabled={index === 0}
                            onClick={() => moveRecipient(index, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${recipient.name} later`}
                            disabled={index === recipients.length - 1}
                            onClick={() => moveRecipient(index, 1)}
                          >
                            ↓
                          </button>
                        </span>
                      </span>
                    )}
                    <span
                      className={`oq-recipient-avatar tone-${(index % 4) + 1}`}
                      aria-hidden="true"
                    >
                      {recipientInitials(recipient.name)}
                    </span>
                    <span className="oq-recipient-copy">
                      <span>
                        <b>{recipient.name}</b>
                        <em>{recipient.role}</em>
                      </span>
                      <small>{recipient.email}</small>
                    </span>
                    <select
                      aria-label={`Delivery role for ${recipient.name}`}
                      value={recipient.delivery}
                      onChange={(event) =>
                        setRecipients((current) =>
                          current.map((item) =>
                            item.id === recipient.id
                              ? {
                                  ...item,
                                  delivery: event.target
                                    .value as SignatureRecipient["delivery"],
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="sign">Needs to sign</option>
                      <option value="copy">Receives a copy</option>
                      <option value="in_person">In-person signer</option>
                    </select>
                    <button
                      type="button"
                      className="oq-recipient-remove"
                      aria-label={`Remove ${recipient.name}`}
                      onClick={() =>
                        setRecipients((current) =>
                          current.filter((item) => item.id !== recipient.id),
                        )
                      }
                    >
                      <Icon name="close" size={15} />
                    </button>
                  </li>
                ))}
              </ol>

              {addingRecipient ? (
                <div className="oq-add-recipient-form">
                  <label>
                    <span>Name</span>
                    <input
                      autoFocus
                      value={recipientName}
                      placeholder="Full name"
                      onChange={(event) => setRecipientName(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={recipientEmail}
                      placeholder="name@example.com"
                      onChange={(event) => setRecipientEmail(event.target.value)}
                    />
                  </label>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingRecipient(false);
                        setRecipientName("");
                        setRecipientEmail("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="primary"
                      disabled={!recipientName.trim() || !recipientEmailValid}
                      onClick={() => {
                        setRecipients((current) => [
                          ...current,
                          {
                            id: `recipient-${Date.now()}`,
                            name: recipientName.trim(),
                            email: recipientEmail.trim(),
                            role: "Additional recipient",
                            delivery: "sign",
                          },
                        ]);
                        setAddingRecipient(false);
                        setRecipientName("");
                        setRecipientEmail("");
                      }}
                    >
                      Add recipient
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="oq-add-recipient"
                  onClick={() => setAddingRecipient(true)}
                >
                  <Icon name="plus" size={15} />
                  Add recipient
                </button>
              )}
            </div>

            <footer>
              <button type="button" onClick={() => setStep(1)}>Back</button>
              <button
                className="primary"
                type="button"
                disabled={signingRecipients.length === 0}
                onClick={() => {
                  const firstDocument =
                    includedDocuments[0] ?? (currentDocumentCode as PdfDocumentCode);
                  setActivePreparationDocument(firstDocument);
                  setActivePreparationPage(1);
                  setActivePreparationRecipient(signingRecipients[0]?.id ?? "");
                  setPreparationTabs(autoAddTabs ? automaticallyPlacedTabs() : []);
                  setTabHistory([]);
                  setRedoTabHistory([]);
                  setStep(3);
                }}
              >
                Continue <span aria-hidden="true">›</span>
              </button>
            </footer>
          </section>
        ) : sendState === "sent" ? (
          <section className="oq-signature-card oq-signature-result" aria-live="polite">
            <div className="oq-signature-result-mark" aria-hidden="true">
              <Icon name="check" size={28} />
            </div>
            <span className="oq-signature-kicker">Request sent</span>
            <h3>Documents are on their way</h3>
            <p>
              {signingRecipients.length} signer{signingRecipients.length === 1 ? "" : "s"} received the request. Everyone marked to receive a copy will be notified when signing is complete.
            </p>
            <dl>
              <div><dt>Documents</dt><dd>{includedDocuments.length + uploadedFiles.length}</dd></div>
              <div><dt>Signature tabs</dt><dd>{placedTabCount}</dd></div>
            </dl>
            <footer>
              <button
                className="primary"
                type="button"
                onClick={() =>
                  onContinue(
                    uploadedFiles[0] ?? includedDocuments[0] ?? transactionDocument,
                  )
                }
              >
                Done
              </button>
            </footer>
          </section>
        ) : (
          <section
            className="oq-signature-preparation"
            aria-label="Prepare signature tabs"
          >
            <div className="oq-preparation-toolbar">
              <label className="oq-preparation-document-jump">
                <span className="sr-only">Jump to document</span>
                <select
                  aria-label="Jump to document"
                  value={activePreparationDocument}
                  onChange={(event) =>
                    scrollToPreparationPage(
                      event.target.value as PdfDocumentCode,
                      1,
                    )
                  }
                >
                  {includedDocuments.map((code, index) => (
                    <option key={code} value={code}>
                      {index + 1}. [{code}] {signatureDocumentOptions.find(
                        (document) => document.code === code,
                      )?.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Document zoom</span>
                <select
                  aria-label="Document zoom"
                  value={preparationZoom}
                  onChange={(event) => setPreparationZoom(event.target.value)}
                >
                  <option value="fit">Fit width</option>
                  <option value="90">90%</option>
                  <option value="110">110%</option>
                  <option value="125">125%</option>
                </select>
              </label>
              <div className="oq-preparation-page-nav" aria-label="Page navigation">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={activePreparationPageIndex <= 0}
                  onClick={() => moveThroughPreparationPages(-1)}
                >‹</button>
                <span>
                  {Math.max(0, activePreparationPageIndex) + 1} / {includedPreparationPages.length}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={
                    activePreparationPageIndex === includedPreparationPages.length - 1
                  }
                  onClick={() => moveThroughPreparationPages(1)}
                >›</button>
              </div>
              <div className="oq-preparation-history">
                <button
                  type="button"
                  disabled={tabHistory.length === 0}
                  onClick={undoPreparationTabs}
                >↶ <span>Undo</span></button>
                <button
                  type="button"
                  disabled={redoTabHistory.length === 0}
                  onClick={redoPreparationTabsChange}
                ><span>Redo</span> ↷</button>
              </div>
            </div>

            <div className="oq-preparation-body">
              <aside className="oq-preparation-tools">
                <header>
                  <h3>Preparation tools</h3>
                  <p>Click a tool, then click the document — or drag it into place.</p>
                </header>

                <label className="oq-preparation-role">
                  <span>Select a signer</span>
                  <span>
                    <i
                      className={`tone-${
                        (Math.max(
                          0,
                          signingRecipients.findIndex(
                            ({ id }) => id === activePreparationRecipient,
                          ),
                        ) % 4) + 1
                      }`}
                      aria-hidden="true"
                    />
                    <select
                      value={activePreparationRecipient}
                      onChange={(event) =>
                        setActivePreparationRecipient(event.target.value)
                      }
                    >
                      {signingRecipients.map((recipient) => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name} ({recipient.role})
                        </option>
                      ))}
                    </select>
                  </span>
                </label>

                <div className="oq-preparation-tool-list">
                  {(["signature", "initials", "date"] as SignatureTabKind[]).map(
                    (kind) => (
                      <button
                        key={kind}
                        type="button"
                        draggable
                        className={pendingTabKind === kind ? "is-active" : ""}
                        aria-pressed={pendingTabKind === kind}
                        onClick={() =>
                          setPendingTabKind((current) =>
                            current === kind ? null : kind,
                          )
                        }
                        onDragStart={(event) => {
                          event.dataTransfer.setData(
                            "application/x-orqestron-tab-kind",
                            kind,
                          );
                          event.dataTransfer.effectAllowed = "copy";
                        }}
                      >
                        <span aria-hidden="true">
                          {kind === "signature" ? (
                            <Icon name="sign" size={20} />
                          ) : kind === "initials" ? (
                            <b>{activeSigner ? recipientInitials(activeSigner.name) : "IN"}</b>
                          ) : (
                            <span>□</span>
                          )}
                        </span>
                        {signatureTabLabel[kind]}
                      </button>
                    ),
                  )}
                </div>

                <div className="oq-preparation-tab-status" aria-live="polite">
                  <b>{placedTabCount} tabs placed</b>
                  <small>{detectedTabCount} signature fields detected</small>
                </div>

                <button
                  type="button"
                  className="oq-auto-place-tabs"
                  onClick={() => {
                    setAutoAddTabs(true);
                    commitPreparationTabs(automaticallyPlacedTabs());
                  }}
                >
                  Auto-place detected tabs
                </button>
                <button
                  type="button"
                  className="oq-remove-preparation-tabs"
                  disabled={preparationTabs.length === 0}
                  onClick={() => {
                    setAutoAddTabs(false);
                    commitPreparationTabs([]);
                  }}
                >
                  Remove all tabs
                </button>
              </aside>

              <section className="oq-preparation-canvas" aria-label="Document preparation canvas">
                <div
                  className="oq-preparation-scroll"
                  onScroll={syncActivePreparationPage}
                >
                  {includedDocuments.map((documentCode, documentIndex) => {
                    const pages = documentPages.filter(
                      (page) => page.label === documentCode,
                    );
                    const documentOption = signatureDocumentOptions.find(
                      ({ code }) => code === documentCode,
                    );
                    const documentTabCount = preparationTabs.filter(
                      (tab) => tab.documentCode === documentCode,
                    ).length;

                    return (
                      <section
                        key={documentCode}
                        className="oq-preparation-document"
                        aria-labelledby={`preparation-document-${documentCode}`}
                      >
                        <header className="oq-preparation-document-header">
                          <span>Document {documentIndex + 1} of {includedDocuments.length}</span>
                          <div>
                            <h4 id={`preparation-document-${documentCode}`}>
                              [{documentCode}] {documentOption?.title}
                            </h4>
                            <small>
                              {pages.length} page{pages.length === 1 ? "" : "s"} · {documentTabCount} tab{documentTabCount === 1 ? "" : "s"}
                            </small>
                          </div>
                        </header>

                        <div className="oq-preparation-document-pages">
                          {pages.map((pageItem, pageIndex) => {
                            const pageTabs = preparationTabs.filter(
                              (tab) =>
                                tab.documentCode === documentCode &&
                                tab.page === pageItem.page,
                            );
                            const preparationPageKey = `${documentCode}-${pageItem.page}`;

                            return (
                              <div
                                key={preparationPageKey}
                                ref={(node) => {
                                  preparationPageRefs.current[preparationPageKey] = node;
                                }}
                                className="oq-preparation-page-frame"
                                data-preparation-page
                                data-document-code={documentCode}
                                data-page-number={pageItem.page}
                              >
                                <div className="oq-preparation-page-meta">
                                  <span>Page {pageIndex + 1} of {pages.length}</span>
                                  <small>{pageTabs.length} tab{pageTabs.length === 1 ? "" : "s"}</small>
                                </div>
                                <div
                                  className={`oq-preparation-page ${pendingTabKind ? "is-placing" : ""}`}
                                  style={{
                                    width:
                                      preparationZoom === "fit"
                                        ? "min(860px, 100%)"
                                        : `${Math.round(760 * (Number(preparationZoom) / 100))}px`,
                                  }}
                                  onMouseDown={() => {
                                    setActivePreparationDocument(documentCode);
                                    setActivePreparationPage(pageItem.page);
                                  }}
                                  onClick={(event) => {
                                    if (
                                      pendingTabKind &&
                                      !(event.target as HTMLElement).closest(".oq-preparation-tab")
                                    ) {
                                      placeTabFromPointer(
                                        event,
                                        pendingTabKind,
                                        documentCode,
                                        pageItem.page,
                                      );
                                    }
                                  }}
                                  onDragOver={(event) => {
                                    event.preventDefault();
                                    event.dataTransfer.dropEffect = event.dataTransfer.types.includes(
                                      "application/x-orqestron-tab-id",
                                    )
                                      ? "move"
                                      : "copy";
                                  }}
                                  onDrop={(event) => {
                                    event.preventDefault();
                                    const rect = event.currentTarget.getBoundingClientRect();
                                    const x = ((event.clientX - rect.left) / rect.width) * 100;
                                    const y = ((event.clientY - rect.top) / rect.height) * 100;
                                    const tabId = event.dataTransfer.getData(
                                      "application/x-orqestron-tab-id",
                                    );
                                    if (tabId) {
                                      commitPreparationTabs(
                                        preparationTabs.map((tab) =>
                                          tab.id === tabId
                                            ? {
                                                ...tab,
                                                documentCode,
                                                page: pageItem.page,
                                                x: Math.min(88, Math.max(2, x)),
                                                y: Math.min(96, Math.max(2, y)),
                                              }
                                            : tab,
                                        ),
                                      );
                                      return;
                                    }
                                    const kind = event.dataTransfer.getData(
                                      "application/x-orqestron-tab-kind",
                                    ) as SignatureTabKind;
                                    if (kind && signatureTabLabel[kind]) {
                                      placeTabFromPointer(
                                        event,
                                        kind,
                                        documentCode,
                                        pageItem.page,
                                      );
                                    }
                                  }}
                                >
                                  <Image
                                    src={previewPageImageSrc(documentCode, pageItem.page)}
                                    width={1400}
                                    height={1812}
                                    sizes="(max-width: 760px) 100vw, 860px"
                                    alt={`${documentOption?.title ?? documentCode}, page ${pageItem.page}`}
                                    priority={documentIndex === 0 && pageIndex === 0}
                                  />

                                  {pageTabs.map((tab) => {
                                    const recipientIndex = Math.max(
                                      0,
                                      signingRecipients.findIndex(
                                        ({ id }) => id === tab.recipientId,
                                      ),
                                    );
                                    const recipient = signingRecipients[recipientIndex];
                                    return (
                                      <div
                                        key={tab.id}
                                        className={`oq-preparation-tab tone-${(recipientIndex % 4) + 1} is-${tab.kind}`}
                                        style={{ left: `${tab.x}%`, top: `${tab.y}%` }}
                                        draggable
                                        onDragStart={(event) => {
                                          event.stopPropagation();
                                          event.dataTransfer.setData(
                                            "application/x-orqestron-tab-id",
                                            tab.id,
                                          );
                                          event.dataTransfer.effectAllowed = "move";
                                        }}
                                      >
                                        <span aria-hidden="true">
                                          {tab.kind === "signature" ? (
                                            <Icon name="sign" size={14} />
                                          ) : tab.kind === "initials" ? (
                                            recipientInitials(recipient?.name ?? "Initials")
                                          ) : (
                                            "Date"
                                          )}
                                        </span>
                                        <b>{signatureTabLabel[tab.kind]}</b>
                                        <button
                                          type="button"
                                          aria-label={`Remove ${signatureTabLabel[tab.kind]} tab for ${recipient?.name ?? "signer"}`}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            commitPreparationTabs(
                                              preparationTabs.filter(
                                                (candidate) => candidate.id !== tab.id,
                                              ),
                                            );
                                          }}
                                        >×</button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </section>
            </div>

            <footer className="oq-preparation-footer">
              <button type="button" onClick={() => setStep(2)}>Back</button>
              <span>
                Document {activePreparationDocumentIndex + 1} of {includedDocuments.length}
                {placedTabCount > 0 ? ` · ${placedTabCount} tabs ready` : " · Add at least one tab"}
              </span>
              <button
                className="primary"
                type="button"
                disabled={placedTabCount === 0 || sendState === "sending"}
                onClick={sendSignatureRequest}
              >
                {sendState === "sending" ? (
                  <><span className="oq-send-spinner" aria-hidden="true" /> Sending request…</>
                ) : (
                  <>Continue <span aria-hidden="true">›</span></>
                )}
              </button>
            </footer>
          </section>
        )}
      </main>
    </section>
  );
}

function PageThumbnailRail({
  activeKey,
  currentDocumentCode,
  onSelect,
}: {
  activeKey: string;
  currentDocumentCode: string;
  onSelect: (page: DocumentPage) => void;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const currentDocumentPages = documentPages.filter(
    (page) => page.label === currentDocumentCode,
  );
  const [visibleThumbnailKeys, setVisibleThumbnailKeys] = useState<Set<string>>(
    () => new Set(documentPages.slice(0, 4).map(pageKey)),
  );

  // Native image lazy-loading uses a generous preload margin. Observe the
  // rail itself so thumbnails outside its near viewport are actually unmounted.
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleThumbnailKeys((current) => {
          const next = new Set(current);
          entries.forEach((entry) => {
            const key = (entry.target as HTMLElement).dataset.pageKey;
            if (!key) return;
            if (entry.isIntersecting) next.add(key);
            else next.delete(key);
          });
          if (
            next.size === current.size &&
            [...next].every((key) => current.has(key))
          ) {
            return current;
          }
          return next;
        });
      },
      { root: list, rootMargin: "220px 0px", threshold: 0.01 },
    );
    list.querySelectorAll<HTMLElement>("[data-page-key]").forEach((item) =>
      observer.observe(item),
    );
    return () => observer.disconnect();
  }, [currentDocumentCode]);

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
        <small>{currentDocumentPages.length}</small>
      </header>
      <div ref={listRef}>
        {currentDocumentPages.map((item) => {
          const key = pageKey(item);
          const active = activeKey === key;
          const shouldMountThumbnail = active || visibleThumbnailKeys.has(key);
          return (
            <button
              key={key}
              data-page-key={key}
              className={active ? "active" : ""}
              onClick={() => onSelect(item)}
              aria-label={`Go to ${item.label} page ${item.page}`}
              aria-current={active ? "true" : undefined}
            >
              {shouldMountThumbnail ? (
                <Image
                  src={item.thumb}
                  alt=""
                  width={170}
                  height={220}
                  loading={active ? "eager" : "lazy"}
                  fetchPriority={active ? "high" : "low"}
                  unoptimized
                />
              ) : (
                <i className="oq-page-thumb-placeholder" aria-hidden="true" />
              )}
              <b>{item.page}</b>
            </button>
          );
        })}
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

const signingDateFieldIds = new Set(
  (Object.keys(pdfFieldsByDocument) as PdfDocumentCode[]).flatMap((code) =>
    pdfFieldsByDocument[code]
      .filter((field) => {
        if (field.kind !== "date") return false;
        const fieldCenter = field.top + field.height / 2;
        return pdfFieldsByDocument[code].some((candidate) => {
          if (
            candidate.kind !== "signature" ||
            candidate.page !== field.page
          ) {
            return false;
          }
          const candidateCenter = candidate.top + candidate.height / 2;
          return (
            field.left > candidate.left &&
            Math.abs(fieldCenter - candidateCenter) <=
              Math.max(field.height, candidate.height)
          );
        });
      })
      .map((field) => `${code}:${field.id}`),
  ),
);

/**
 * The PDF text extractor can emit a subset font's raw bytes (every character
 * shifted, so "Broker" arrives as "URNHU") or fall back to the field id. Both
 * are unreadable, so fall back to a humanised id rather than showing them.
 */
const humanizePdfFieldId = (id: string) =>
  id
    .split(".")
    .slice(-2)
    .join(" ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

function pdfFieldLabel(field: PdfFieldDefinition) {
  const label = field.label?.trim();
  if (!label || label === field.id) return humanizePdfFieldId(field.id);
  const letters = label.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 4 && !/[a-z]/.test(label)) {
    return humanizePdfFieldId(field.id);
  }
  return label;
}

function isSigningDateField(
  documentCode: PdfDocumentCode,
  field: PdfFieldDefinition,
) {
  return signingDateFieldIds.has(`${documentCode}:${field.id}`);
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
  onSave: (value: string, scope: "field" | "everywhere") => void;
}) {
  const [draft, setDraft] = useState(value);
  const [step, setStep] = useState<"edit" | "choose">("edit");
  const popoverRef = useRef<HTMLFormElement | null>(null);
  const normalizedDraft = draft.trim();
  const normalizedValue = value.trim();
  const canApply =
    normalizedDraft !== normalizedValue &&
    (normalizedDraft.length > 0 || normalizedValue.length > 0);
  const suggestions = suggestionsForPdfField(field);
  const { siblings } = siblingLinksForPdfField(documentCode, field.id);
  const siblingForms = [...new Set(siblings.map((link) => link.form))];
  const applyTargets = [
    { form: documentCode, page: field.page },
    ...siblings.map((link) => ({ form: link.form, page: link.page })),
  ].reduce<Array<{ form: PdfDocumentCode; pages: number[]; fieldCount: number }>>(
    (groups, target) => {
      const existingGroup = groups.find((group) => group.form === target.form);

      if (existingGroup) {
        if (!existingGroup.pages.includes(target.page)) {
          existingGroup.pages.push(target.page);
          existingGroup.pages.sort((first, second) => first - second);
        }
        existingGroup.fieldCount += 1;
        return groups;
      }

      groups.push({
        form: target.form,
        pages: [target.page],
        fieldCount: 1,
      });
      return groups;
    },
    [],
  );
  const anchoredStyle: React.CSSProperties = {
    top: `${field.top + field.height}%`,
    transform:
      "translateY(8px) translateY(var(--oq-popover-nudge, 0px))",
    ...(field.left > 48 ? { right: "2%" } : { left: `${Math.max(2, field.left)}%` }),
  };

  // The PDF canvas scrolls underneath two fixed toolbars. Keep the anchored
  // popover inside the visible canvas instead of letting its header be clipped.
  useLayoutEffect(() => {
    const node = popoverRef.current;
    const canvas = node?.closest<HTMLElement>(".fe-canvas");
    if (!node || !canvas) return;

    const keepVisible = () => {
      node.style.setProperty("--oq-popover-nudge", "0px");
      const popoverRect = node.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const topLimit = canvasRect.top + 12;
      const bottomLimit = canvasRect.bottom - 12;
      const bottomOverflow = popoverRect.bottom - bottomLimit;
      if (bottomOverflow > 0) {
        canvas.scrollTop += Math.ceil(bottomOverflow);
        return;
      }
      const nudge =
        popoverRect.top < topLimit ? topLimit - popoverRect.top : 0;
      node.style.setProperty("--oq-popover-nudge", `${Math.round(nudge)}px`);
    };

    const frame = window.requestAnimationFrame(keepVisible);
    const observer = new ResizeObserver(keepVisible);
    observer.observe(node);
    observer.observe(canvas);
    canvas.addEventListener("scroll", keepVisible, { passive: true });
    window.addEventListener("resize", keepVisible);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("scroll", keepVisible);
      window.removeEventListener("resize", keepVisible);
    };
  }, [field.id, step]);

  return (
    <form
      ref={popoverRef}
      className="oq-field-popover"
      style={anchoredStyle}
      role="dialog"
      aria-label={
        step === "choose"
          ? "Choose where to apply this change"
          : `Fill ${pdfFieldLabel(field)}`
      }
      onClick={(event) => event.stopPropagation()}
      onSubmit={(event) => {
        event.preventDefault();
        if (!canApply) return;
        setStep("choose");
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <header>
        <div>
          <small>{documentCode} · PAGE {field.page}</small>
          <h3>
            {step === "choose" ? "Where should this update?" : pdfFieldLabel(field)}
          </h3>
        </div>
        <button type="button" onClick={onClose} aria-label="Close field editor">
          <Icon name="close" size={16} />
        </button>
      </header>
      {step === "choose" ? (
        <div className="oq-apply-scope">
          <p className="oq-apply-diff">
            <span>
              <small>Now</small>
              {normalizedValue ? (
                <b>{displayPdfFieldValue(field, normalizedValue)}</b>
              ) : (
                <i>not set</i>
              )}
            </span>
            <Icon name="chevron" size={14} />
            <span>
              <small>After</small>
              <b>{displayPdfFieldValue(field, normalizedDraft)}</b>
            </span>
          </p>
          <button
            type="button"
            className="oq-apply-choice"
            autoFocus
            onClick={() => onSave(normalizedDraft, "field")}
          >
            <span>
              <b>Apply to this field</b>
              <small>
                Update only {documentCode}, page {field.page}
              </small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
          <button
            type="button"
            className="oq-apply-choice"
            onClick={() => onSave(normalizedDraft, "everywhere")}
          >
            <span className="oq-apply-choice-copy">
              <b>Apply to all matching forms</b>
              <small>
                Updates {siblings.length + 1} matching{" "}
                {siblings.length === 0 ? "field" : "fields"} across{" "}
                {applyTargets.length} {applyTargets.length === 1 ? "form" : "forms"}
              </small>
              <span
                className="oq-apply-targets"
                aria-label="Forms and pages that will be updated"
              >
                {applyTargets.map((target) => (
                  <span className="oq-apply-target" key={target.form}>
                    <strong>{target.form}</strong>
                    <span>
                      {target.pages.length === 1 ? "Page" : "Pages"}{" "}
                      {target.pages.join(", ")}
                    </span>
                    <em>
                      {target.fieldCount} {target.fieldCount === 1 ? "field" : "fields"}
                    </em>
                  </span>
                ))}
              </span>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      ) : field.kind === "signature" ? (
        <div className="oq-signature-field-editor">
          <div>
            <span>Signature</span>
            <span className="oq-signature-slot">
              <Icon name="sign" size={20} />
              <span>
                <b>Sign here</b>
                <small>Added at signing</small>
              </span>
            </span>
          </div>
          <label>
            <span>Name</span>
            <input
              autoFocus
              type="text"
              value={draft}
              maxLength={120}
              placeholder="Signer’s full name"
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
        </div>
      ) : (
        <label>
          <span>Value</span>
          <input
            autoFocus
            type={field.kind === "date" ? "date" : "text"}
            value={draft}
            maxLength={field.kind === "text" ? 120 : undefined}
            placeholder={`Enter ${pdfFieldLabel(field).toLowerCase()}`}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
      )}
      {step === "edit" && suggestions.length > 0 && (
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
      {step === "edit" && siblings.length > 0 && (
        <p className="oq-linked-note">
          <i aria-hidden="true" />
          Feeds {siblings.length} other{" "}
          {siblings.length === 1 ? "field" : "fields"} in{" "}
          {siblingForms.join(", ")}
        </p>
      )}
      {step === "edit" && field.kind === "signature" ? (
        <p>
          The e-sign provider collects the signature and stamps the date beside
          it; the name below is what prints on the form.
        </p>
      ) : null}
      <footer className={step === "choose" ? "oq-apply-footer" : undefined}>
        {step === "choose" ? (
          <button type="button" onClick={() => setStep("edit")}>
            Back to edit
          </button>
        ) : (
          <>
            <small>
              {draft.length}
              {field.kind === "text" || field.kind === "signature" ? " / 120" : ""} characters
            </small>
            <span>
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary" disabled={!canApply}>
                Apply…
              </button>
            </span>
          </>
        )}
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

type AvailableTransactionForm = {
  code: string;
  name: string;
  pages: number;
  href: string;
};

const previewThumbnailSrc = (code: string, page: number) => {
  const normalizedCode = code.toLowerCase();
  if (code === "AD") return `/form-thumbnails/rail/ad-${page}.png`;
  if (code === "BRBC") {
    return `/form-thumbnails/rail/brbc-page-${String(page).padStart(2, "0")}.png`;
  }
  if (code === "PRBS") return "/form-thumbnails/rail/prbs.png";
  return `/forms/previews/thumbnails/${normalizedCode}-${String(page).padStart(2, "0")}.png`;
};

/** Every form the transaction can hold, with the page count and source PDF
 *  used for previews. Shared by the Workspace list and the signature flow. */
const transactionFormCatalog: AvailableTransactionForm[] = [
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
  {
    code: "ABA",
    name: "Additional Broker Acknowledgment",
    pages: 1,
    href: "",
  },
  {
    code: "ADM",
    name: "Addendum No. 1",
    pages: 1,
    href: "/forms/previews/ADM_Addendum_No_1.pdf",
  },
  {
    code: "RPA",
    name: "California Residential Purchase Agreement and Joint Escrow Instructions",
    pages: 25,
    href: "/forms/previews/RPA_California_Residential_Purchase_Agreement.pdf",
  },
];

/** The Workspace stores documents as "[CODE] Title" strings. */
const parseTransactionDocument = (entry: string) => {
  const match = entry.match(/^\[([^\]]+)\]\s*(.*)$/);
  return match
    ? { entry, code: match[1], title: match[2] }
    : { entry, code: entry, title: entry };
};

const isPdfDocumentCode = (code: string): code is PdfDocumentCode =>
  Object.prototype.hasOwnProperty.call(pdfFieldsByDocument, code);

/** Preview metadata for any document, including ones with no catalog entry. */
const previewFormFor = (code: string, title: string): AvailableTransactionForm =>
  transactionFormCatalog.find((form) => form.code === code) ?? {
    code,
    name: title,
    pages: 1,
    href: "",
  };

const previewZooms = [
  "Smaller",
  "Normal",
  "Larger",
  "Fit width",
  "Fit page",
] as const;
type PreviewZoom = (typeof previewZooms)[number];
const previewZoomSlug = (zoom: PreviewZoom) =>
  zoom.toLowerCase().replace(" ", "-");

const previewPageImageSrc = (code: string, page: number) => {
  const normalizedCode = code.toLowerCase();
  if (code === "AD") return `/form-pages/ad-${page}.png`;
  if (code === "BRBC") {
    return `/form-pages/brbc-${String(page).padStart(2, "0")}.png`;
  }
  if (code === "PRBS") return "/form-pages/prbs-1.png";
  return `/forms/previews/pages/${normalizedCode}-${String(page).padStart(2, "0")}.png`;
};

function PreviewPageRail({
  form,
  currentPage,
  onSelect,
}: {
  form: AvailableTransactionForm;
  currentPage: number;
  onSelect: (page: number) => void;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(
    () => new Set([1, 2, 3]),
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePages((current) => {
          const next = new Set(current);
          entries.forEach((entry) => {
            const page = Number((entry.target as HTMLElement).dataset.previewPage);
            if (!page) return;
            if (entry.isIntersecting) next.add(page);
            else next.delete(page);
          });
          if (
            next.size === current.size &&
            [...next].every((page) => current.has(page))
          ) {
            return current;
          }
          return next;
        });
      },
      { root: list, rootMargin: "180px 0px", threshold: 0.01 },
    );
    list.querySelectorAll<HTMLElement>("[data-preview-page]").forEach((item) =>
      observer.observe(item),
    );
    return () => observer.disconnect();
  }, [form.code]);

  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("button.active");
    if (!list || !active) return;
    const top = active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2;
    list.scrollTo({ top, behavior: "smooth" });
  }, [currentPage]);

  return (
    <aside className="oq-preview-page-rail" aria-label="PDF preview pages">
      <header>
        <span>PAGES</span>
        <small>{form.pages}</small>
      </header>
      <div ref={listRef}>
        {Array.from({ length: form.pages }, (_, index) => index + 1).map((page) => {
          const active = page === currentPage;
          const shouldMountThumbnail = active || visiblePages.has(page);
          return (
            <button
              type="button"
              key={page}
              data-preview-page={page}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
              aria-label={`Preview page ${page} of ${form.pages}`}
              onClick={() => onSelect(page)}
            >
              {shouldMountThumbnail ? (
                <Image
                  src={previewThumbnailSrc(form.code, page)}
                  alt=""
                  width={170}
                  height={220}
                  loading={active ? "eager" : "lazy"}
                  fetchPriority={active ? "high" : "low"}
                  unoptimized
                />
              ) : (
                <i aria-hidden="true" />
              )}
              <b>{page}</b>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function PdfPreviewModal({
  form,
  values,
  checkedFields,
  onClose,
}: {
  form: AvailableTransactionForm;
  /** Pass the live field state to preview the document as it will be sent. */
  values?: Record<string, string>;
  checkedFields?: string[];
  onClose: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState<PreviewZoom>("Fit width");
  const [zoomOpen, setZoomOpen] = useState(false);
  const zoomRef = useRef<HTMLDivElement | null>(null);

  // Flattened, read-only rendering of whatever has been filled in so far.
  const filledFields = useMemo(() => {
    if (!isPdfDocumentCode(form.code)) return [];
    const documentCode = form.code;
    return pdfFieldsByDocument[documentCode]
      .filter((field) => field.page === currentPage)
      .flatMap((field) => {
        if (isSigningDateField(documentCode, field)) return [];
        const id = `${documentCode}:${field.id}`;
        if (field.kind === "checkbox") {
          return checkedFields?.includes(id)
            ? [{ field, text: "✓", checkbox: true }]
            : [];
        }
        const value = values?.[id] ?? field.value ?? "";
        return value.trim()
          ? [
              {
                field,
                text: displayPdfFieldValue(field, value),
                checkbox: false,
              },
            ]
          : [];
      });
  }, [checkedFields, currentPage, form.code, values]);

  useEffect(() => {
    if (!zoomOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (zoomRef.current?.contains(event.target as Node)) return;
      setZoomOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [zoomOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (zoomOpen) {
        setZoomOpen(false);
        return;
      }
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, zoomOpen]);

  return (
    <div
      className="oq-preview-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        // This modal can sit on top of another dialog that closes on backdrop
        // mousedown — keep every click inside it from reaching that one.
        event.stopPropagation();
        if (event.target === event.currentTarget) onClose();
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <section
        className="oq-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="oq-preview-title"
      >
        <header>
          <span className="oq-file-icon" aria-hidden="true">
            <Icon name="file" />
          </span>
          <span>
            <small>PDF preview</small>
            <b id="oq-preview-title" title={`[${form.code}] ${form.name}`}>
              [{form.code}] {form.name}
            </b>
          </span>
          <div className="oq-preview-actions">
            {form.href && (
              <a href={form.href} target="_blank" rel="noreferrer">
                Open PDF
              </a>
            )}
            <button autoFocus type="button" aria-label="Close PDF preview" onClick={onClose}>
              <Icon name="close" />
            </button>
          </div>
        </header>
        <div className={`oq-preview-body ${form.href ? "" : "no-pages"}`}>
          {form.href && (
            <PreviewPageRail
              form={form}
              currentPage={currentPage}
              onSelect={setCurrentPage}
            />
          )}
          <div className={`oq-preview-canvas is-zoom-${previewZoomSlug(zoom)}`}>
            {form.href ? (
              <div className="oq-preview-document-page">
                <Image
                  src={previewPageImageSrc(form.code, currentPage)}
                  alt={`${form.name}, page ${currentPage}`}
                  width={1224}
                  height={1584}
                  loading="eager"
                  fetchPriority="high"
                  unoptimized
                />
                {filledFields.map(({ field, text, checkbox }) => (
                  <span
                    key={field.id}
                    className={`oq-preview-fill ${checkbox ? "is-checkbox" : ""} ${field.kind === "signature" ? "is-signature" : ""}`}
                    style={{
                      left: `${field.left}%`,
                      top: `${field.top}%`,
                      width: `${field.width}%`,
                      height: `${field.height}%`,
                    }}
                  >
                    {text}
                  </span>
                ))}
              </div>
            ) : (
              <div className="oq-preview-unavailable" role="status">
                <span className="oq-file-icon" aria-hidden="true">
                  <Icon name="file" />
                </span>
                <b>Preview unavailable</b>
                <p>This form does not have a PDF file attached yet.</p>
              </div>
            )}
          </div>
        </div>
        <footer>
          <div className="oq-preview-footer-left">
            {form.href && (
              <div className="oq-preview-zoom" ref={zoomRef}>
                <button
                  type="button"
                  aria-expanded={zoomOpen}
                  aria-label={`Zoom: ${zoom}`}
                  onClick={() => setZoomOpen((open) => !open)}
                >
                  {zoom}
                  <Icon name="chevron" size={14} />
                </button>
                {zoomOpen && (
                  <div className="oq-preview-zoom-menu" role="menu">
                    {previewZooms.map((option) => (
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={option === zoom}
                        className={option === zoom ? "active" : ""}
                        key={option}
                        onClick={() => {
                          setZoom(option);
                          setZoomOpen(false);
                        }}
                      >
                        {option}
                        {option === zoom && <Icon name="check" size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <span>
              {currentPage} / {form.pages} {form.pages === 1 ? "page" : "pages"}
            </span>
          </div>
          <small>Preview only</small>
        </footer>
      </section>
    </div>
  );
}

function FormsPanel({
  activeLabel,
  documents,
  onDocumentsChange,
  pdfFieldValues,
  checkedFields,
  fillStatusByDocument,
  onFeedback,
  onOpen,
  onClose,
}: {
  activeLabel: string;
  documents: string[];
  onDocumentsChange: React.Dispatch<React.SetStateAction<string[]>>;
  pdfFieldValues: Record<string, string>;
  checkedFields: string[];
  fillStatusByDocument: Record<
    PdfDocumentCode,
    { filled: number; total: number }
  >;
  onFeedback: (message: string) => void;
  onOpen: (document: string) => void;
  onClose: () => void;
}) {
  const [modal, setModal] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [previewForm, setPreviewForm] =
    useState<AvailableTransactionForm | null>(null);
  // The transaction's document list lives in the editor so the signature flow
  // sees the same set the Workspace shows.
  const docs = documents;
  const setDocs = onDocumentsChange;
  const [docStatuses] = useState<Record<string, DocumentStatus>>({
    "[AD] Disclosure Regarding Real Estate Agency Relationship (Buyer)":
      "filled",
    "[BRBC] Buyer Representation and Broker Compensation Agreement": "partial",
    "[PRBS] Possible Representation of More Than One Buyer or Seller":
      "sent_to_docusign",
  });
  const availableForms = transactionFormCatalog;
  const addDocument = (name: string) => {
    setDocs((current) =>
      current.includes(name) ? current : [...current, name],
    );
    onFeedback(`Added ${name} to the transaction.`);
  };
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
  const filteredAvailableForms = availableForms
    .filter((form) => !docs.includes(`[${form.code}] ${form.name}`))
    .filter((form) =>
      `[${form.code}] ${form.name}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .filter(() => folder === "all" || folder === "forms");

  return (
    <div className="oq-documents">
      <div className="oq-workspace-title oq-panel-heading">
        <h2>Workspace</h2>
        <button className="oq-add" onClick={() => setModal(true)}>
          <Icon name="plus" />
          Add
        </button>
        <button
          className="oq-panel-close"
          aria-label="Close workspace panel"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="oq-doc-list">
        {docs.map((doc, i) => {
            const code = doc.match(/^\[([A-Z-]+)\]/)?.[1] as
              | PdfDocumentCode
              | undefined;
            const status = code ? fillStatusByDocument[code] : undefined;
            const statusLabel = status
              ? `${status.filled}/${status.total} filled`
              : "Status unavailable";
            const isOpen = doc.startsWith(`[${activeLabel}]`);
            const docStatus = docStatuses[doc] ?? "draft";
            const statusMeta = documentStatusMeta[docStatus];
            const fieldsLabel = status
              ? `${status.filled}/${status.total} fields`
              : "PDF form";
            return (
              <div
                className={`oq-doc-row ${isOpen ? "active" : ""}`}
                key={doc}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => reorder(i)}
              >
                <span className="oq-drag-handle" title="Drag to reorder">
                  <Icon name="grip" />
                </span>
                <span className="oq-file-icon" aria-hidden="true">
                  <Icon name="file" />
                </span>
                <button
                  className="oq-doc-open"
                  aria-label={`Open ${doc}, ${statusMeta.label}, ${statusLabel}`}
                  onClick={() => onOpen(doc)}
                >
                  <span className="oq-doc-copy">
                    <b>{doc}</b>
                    <span className="oq-doc-meta-line">
                      <em className={`oq-doc-status is-${statusMeta.tone}`}>
                        {statusMeta.label}
                      </em>
                      <small>{fieldsLabel}</small>
                    </span>
                  </span>
                </button>
                <button
                  className="oq-doc-remove"
                  onClick={(event) => {
                    event.stopPropagation();
                    setDocs((d) => d.filter((_, x) => x !== i));
                    onFeedback(`Removed ${doc} from the transaction.`);
                  }}
                  aria-label={`Remove ${doc}`}
                >
                  <Icon name="close" />
                </button>
              </div>
            );
          })}
      </div>
      <label className="oq-dropzone">
        <span>Drag files from your transaction here</span>
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
      <section className="oq-grab-transaction">
        <h3>Grab from transaction</h3>
        <form
          className="oq-grab-filters"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="oq-grab-filter-row">
            <div className="oq-grab-search">
              <Icon name="search" />
              <input
                aria-label="Search available forms by name or code"
                placeholder="Search forms"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear form search"
                  onClick={() => setQuery("")}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
            {/* The option text already says "folders" — a separate label would
                only repeat it and cost width the search field needs. */}
            <select
              className="oq-grab-folder"
              aria-label="Filter available forms by folder"
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
            >
              <option value="all">All folders</option>
              <option value="forms">Forms only</option>
            </select>
          </div>
          <small className="oq-grab-count" aria-live="polite">
            {filteredAvailableForms.length}{" "}
            {filteredAvailableForms.length === 1 ? "result" : "results"}
          </small>
        </form>
        {filteredAvailableForms.length > 0 ? (
          <div className="oq-available-list">
            {filteredAvailableForms.map((form) => {
              const formName = `[${form.code}] ${form.name}`;
              return (
                <div className="oq-available-row" key={formName}>
                  <span className="oq-drag-handle" aria-hidden="true">
                    <Icon name="grip" />
                  </span>
                  <span className="oq-file-icon" aria-hidden="true">
                    <Icon name="file" />
                  </span>
                  <button
                    className="oq-available-preview"
                    type="button"
                    onClick={() => setPreviewForm(form)}
                    aria-label={`Preview ${form.name}`}
                  >
                    <b>{formName}</b>
                    <small>Form · {form.pages} {form.pages === 1 ? "page" : "pages"}</small>
                  </button>
                  <button
                    className="oq-available-add"
                    type="button"
                    onClick={() => addDocument(formName)}
                    aria-label={`Add ${form.name}`}
                  >
                    <Icon name="plus" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="oq-form-search-empty" role="status">
            <Icon name="search" />
            <b>No forms found</b>
            <small>Try another form name or code.</small>
          </div>
        )}
      </section>
      {modal && (
        <AddFormsModal
          onClose={() => setModal(false)}
          existing={docs}
          onAdd={(forms) =>
            setDocs((current) => [...new Set([...current, ...forms])])
          }
        />
      )}
      {previewForm && (
        <PdfPreviewModal
          form={previewForm}
          values={pdfFieldValues}
          checkedFields={checkedFields}
          onClose={() => setPreviewForm(null)}
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

type VoiceFillScope = "empty" | "transaction" | "document";
type VoiceSensitivityLevel = "routine" | "sensitive" | "critical";
type VoiceSensitivityCategory =
  | "General"
  | "Legal identity"
  | "Financial term"
  | "Contract deadline"
  | "Financing term";

type VoiceFieldUpdate = {
  target: "detail" | "party";
  key: string;
  value: string;
  partyId?: string;
};

type VoiceProposal = {
  id: string;
  label: string;
  currentValue: string;
  value: string;
  updates: VoiceFieldUpdate[];
  affectedDocuments: string[];
  affectedFields: number;
  confirmed: boolean;
  included: boolean;
  editedByUser: boolean;
};

type VoiceFieldPolicy = {
  level: Exclude<VoiceSensitivityLevel, "routine">;
  category: Exclude<VoiceSensitivityCategory, "General">;
  keys: readonly string[];
  confirmation: string;
};

type VoiceSensitivity = {
  level: VoiceSensitivityLevel;
  category: VoiceSensitivityCategory;
  requiresConfirmation: boolean;
  confirmation: string;
};

const voiceFieldPolicies: readonly VoiceFieldPolicy[] = [
  {
    level: "sensitive",
    category: "Legal identity",
    keys: ["firstName", "lastName", "buyer1FirstName", "buyer1LastName"],
    confirmation: "Verify the legal name before applying.",
  },
  {
    level: "critical",
    category: "Financial term",
    keys: ["purchasePrice", "deposit1"],
    confirmation: "Confirm the amount before applying.",
  },
  {
    level: "critical",
    category: "Contract deadline",
    keys: ["closeOfEscrow"],
    confirmation: "Confirm the date before applying.",
  },
  {
    level: "sensitive",
    category: "Financing term",
    keys: ["financingTerms"],
    confirmation: "Review the loan wording before applying.",
  },
];

const classifyVoiceUpdates = (
  updates: VoiceFieldUpdate[],
): VoiceSensitivity => {
  const matches = updates.flatMap((update) =>
    voiceFieldPolicies.filter((policy) => policy.keys.includes(update.key)),
  );
  const policy = matches.sort(
    (a, b) => Number(b.level === "critical") - Number(a.level === "critical"),
  )[0];
  return policy
    ? {
        level: policy.level,
        category: policy.category,
        requiresConfirmation: true,
        confirmation: policy.confirmation,
      }
    : {
        level: "routine",
        category: "General",
        requiresConfirmation: false,
        confirmation: "",
      };
};

const classifyVoiceProposal = (proposal: Pick<VoiceProposal, "updates">) =>
  classifyVoiceUpdates(proposal.updates);

type VoiceApplyResult = {
  count: number;
  scope: VoiceFillScope;
  undone: boolean;
};

const cleanSpokenNumber = (raw: string, suffix = "") => {
  const amount = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(amount)) return "";
  const multiplier = /m|million|triệu/i.test(suffix)
    ? 1_000_000
    : /k|thousand|nghìn/i.test(suffix)
      ? 1_000
      : 1;
  return String(Math.round(amount * multiplier));
};

const formatMoney = (value: string) => {
  const amount = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount)
    ? `$${Math.round(amount).toLocaleString("en-US")}`
    : value;
};

const displayVoiceValue = (proposal: VoiceProposal, value: string) => {
  if (!value) return "Empty";
  if (proposal.id === "initial-deposit" && value.includes("(")) return value;
  return proposal.id === "purchase-price" || proposal.id === "initial-deposit"
    ? formatMoney(value)
    : value;
};

const splitVoiceName = (fullName: string) => {
  const parts = fullName.trim().replace(/\s+/g, " ").split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const looksVietnamese = /[À-ỹ]/.test(fullName);
  if (looksVietnamese) {
    return {
      firstName: parts.at(-1) ?? "",
      lastName: parts.slice(0, -1).join(" "),
    };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? "",
  };
};

const voiceDateFromDays = (start: string, days: number) => {
  const [month, day, shortYear] = start.split("/").map(Number);
  if (!month || !day || !shortYear) return "";
  const year = shortYear < 100 ? 2000 + shortYear : shortYear;
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;
};

const voiceDateFromPhrase = (phrase: string) => {
  const numeric = phrase.match(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/);
  if (numeric) {
    const year = numeric[3]
      ? numeric[3].length === 4
        ? numeric[3].slice(-2)
        : numeric[3]
      : "26";
    return `${numeric[1].padStart(2, "0")}/${numeric[2].padStart(2, "0")}/${year}`;
  }
  const named = phrase.match(
    /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:,?\s*(\d{4}))?/i,
  );
  if (!named) return "";
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const month = months.indexOf(named[1].slice(0, 3).toLowerCase()) + 1;
  return `${String(month).padStart(2, "0")}/${named[2].padStart(2, "0")}/${(named[3] ?? "2026").slice(-2)}`;
};

const voiceAffected = (detailKeys: string[]) => {
  const links = detailPdfLinks.filter((link) =>
    link.detailKeys.some((key) => detailKeys.includes(key)),
  );
  return {
    affectedDocuments: [...new Set(links.map((link) => link.form))],
    affectedFields: links.length,
  };
};

function extractVoiceProposals(
  transcript: string,
  values: Record<string, string>,
  parties: TransactionParty[],
) {
  const proposals: VoiceProposal[] = [];
  const add = (
    proposal: Omit<
      VoiceProposal,
      "confirmed" | "included" | "editedByUser"
    >,
  ) => {
    if (proposal.value && proposal.value !== proposal.currentValue) {
      proposals.push({
        ...proposal,
        confirmed: !classifyVoiceUpdates(proposal.updates).requiresConfirmation,
        included: true,
        editedByUser: false,
      });
    }
  };

  const seller = parties.find((party) => /seller/i.test(party.values.role));
  const sellerMatch = transcript.match(
    /(?:seller|người bán|nhà)\s*(?:(?:is|là|to)\s+|:\s*)?([A-Za-zÀ-ỹ' -]+?)(?=\s+(?:purchase|price|chốt\s+giá|giá|deposit|cọc|close|escrow|and\s+(?:price|deposit|close))|[,.]|$)/i,
  );
  if (seller && sellerMatch) {
    const name = sellerMatch[1].trim();
    const split = splitVoiceName(name);
    const current = [seller.values.firstName, seller.values.lastName]
      .filter(Boolean)
      .join(" ");
    add({
      id: "seller-name",
      label: "Seller",
      currentValue: current,
      value: name,
      updates: [
        { target: "party", partyId: seller.id, key: "firstName", value: split.firstName },
        { target: "party", partyId: seller.id, key: "lastName", value: split.lastName },
      ],
      affectedDocuments: [],
      affectedFields: 0,
    });
  }

  const buyerMatch = transcript.match(
    /(?:primary\s+)?(?:buyer|người mua)\s*(?:(?:is|là|to)\s+|:\s*)?([A-Za-zÀ-ỹ' -]+?)(?=\s+(?:purchase|price|chốt\s+giá|giá|deposit|cọc|close|escrow|and\s+(?:price|deposit|close))|[,.]|$)/i,
  );
  if (buyerMatch) {
    const name = buyerMatch[1].replace(/\s+and\s+.*$/i, "").trim();
    const split = splitVoiceName(name);
    const affected = voiceAffected(["buyer1FirstName", "buyer1LastName"]);
    add({
      id: "buyer-name",
      label: "Primary buyer",
      currentValue: [values.buyer1FirstName, values.buyer1LastName]
        .filter(Boolean)
        .join(" "),
      value: name,
      updates: [
        { target: "detail", key: "buyer1FirstName", value: split.firstName },
        { target: "detail", key: "buyer1LastName", value: split.lastName },
      ],
      ...affected,
    });
  }

  const priceMatch = transcript.match(
    /(?:purchase\s+price|sale\s+price|giá\s+bán|giá)\s*(?:(?:is|to|là)\s+|:\s*)?\$?([\d,.]+)\s*(k|thousand|million|m|triệu|nghìn)?/i,
  );
  const proposedPrice = priceMatch
    ? cleanSpokenNumber(priceMatch[1], priceMatch[2])
    : "";
  if (proposedPrice) {
    const affected = voiceAffected(["purchasePrice"]);
    add({
      id: "purchase-price",
      label: "Purchase price",
      currentValue: values.purchasePrice,
      value: proposedPrice,
      updates: [
        { target: "detail", key: "purchasePrice", value: proposedPrice },
      ],
      ...affected,
    });
  }

  const depositPercent = transcript.match(
    /(?:initial\s+)?(?:deposit|cọc)[^\d]{0,14}(\d+(?:\.\d+)?)\s*%/i,
  );
  const depositMoney = transcript.match(
    /(?:initial\s+)?(?:deposit|cọc)\s*(?:(?:is|of|to|là)\s+|:\s*)?\$?([\d,.]+)\s*(k|thousand|million|m|triệu|nghìn)?/i,
  );
  let proposedDeposit = "";
  let depositDisplay = "";
  if (depositPercent) {
    const base = Number(proposedPrice || values.purchasePrice.replace(/,/g, ""));
    const percent = Number(depositPercent[1]);
    proposedDeposit = String(Math.round((base * percent) / 100));
    depositDisplay = `${formatMoney(proposedDeposit)} (${percent}%)`;
  } else if (depositMoney) {
    proposedDeposit = cleanSpokenNumber(depositMoney[1], depositMoney[2]);
    depositDisplay = formatMoney(proposedDeposit);
  }
  if (proposedDeposit) {
    const affected = voiceAffected(["deposit1"]);
    add({
      id: "initial-deposit",
      label: "Initial deposit",
      currentValue: values.deposit1,
      value: depositDisplay,
      updates: [
        { target: "detail", key: "deposit1", value: proposedDeposit },
      ],
      ...affected,
    });
  }

  const closeMatch = transcript.match(
    /(?:close(?:\s+of)?\s+escrow|escrow\s+close|đóng\s+escrow)[^,.]*/i,
  );
  if (closeMatch) {
    const days = closeMatch[0].match(/(\d+)\s*(?:days?|ngày)/i);
    const proposedClose = days
      ? voiceDateFromDays(values.offerAccepted, Number(days[1]))
      : voiceDateFromPhrase(closeMatch[0]);
    if (proposedClose) {
      const affected = voiceAffected(["closeOfEscrow"]);
      add({
        id: "close-of-escrow",
        label: "Close of escrow",
        currentValue: values.closeOfEscrow,
        value: proposedClose,
        updates: [
          { target: "detail", key: "closeOfEscrow", value: proposedClose },
        ],
        ...affected,
      });
    }
  }

  if (/conventional(?:\s+loan)?/i.test(transcript)) {
    const value = "80% conventional loan, 30-year fixed";
    const affected = voiceAffected(["financingTerms"]);
    add({
      id: "financing-terms",
      label: "Loan type",
      currentValue: values.financingTerms,
      value,
      updates: [{ target: "detail", key: "financingTerms", value }],
      ...affected,
    });
  }

  return proposals;
}

const editVoiceProposal = (proposal: VoiceProposal, rawValue: string) => {
  const value = rawValue.trim();
  let updates = proposal.updates;
  if (proposal.id === "seller-name" || proposal.id === "buyer-name") {
    const split = splitVoiceName(value);
    updates = proposal.updates.map((update) => ({
      ...update,
      value: update.key === "firstName" ? split.firstName : split.lastName,
    }));
  } else if (
    proposal.id === "purchase-price" ||
    proposal.id === "initial-deposit"
  ) {
    const normalized = cleanSpokenNumber(value.replace(/[^\d.]/g, ""));
    updates = proposal.updates.map((update) => ({
      ...update,
      value: normalized || update.value,
    }));
  } else {
    updates = proposal.updates.map((update) => ({ ...update, value }));
  }
  return {
    ...proposal,
    value,
    updates,
    editedByUser: true,
    confirmed: true,
    included: true,
  };
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
  transactionValues,
  parties,
  onApplyVoice,
  onUndoVoice,
  onShowAffectedField,
}: {
  documentLabel: string;
  documentTitle: string;
  page: number;
  transactionValues: Record<string, string>;
  parties: TransactionParty[];
  onApplyVoice: (
    scope: VoiceFillScope,
    proposals: VoiceProposal[],
  ) => void;
  onUndoVoice: () => void;
  onShowAffectedField: (target: DetailPdfLink) => void;
}) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(defaultVoiceStatus);
  const [voiceScope, setVoiceScope] = useState<VoiceFillScope>("empty");
  const [voiceReview, setVoiceReview] = useState<VoiceProposal[]>([]);
  const [activeVoiceProposalId, setActiveVoiceProposalId] = useState<string | null>(
    null,
  );
  const [voiceApplyResult, setVoiceApplyResult] =
    useState<VoiceApplyResult | null>(null);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
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
  const voiceReviewRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  useEffect(() => {
    if (voiceReview.length === 0) return;
    const frame = window.requestAnimationFrame(() => {
      const thread = threadRef.current;
      const review = voiceReviewRef.current;
      if (!thread || !review) return;
      const precedingMessage = review.previousElementSibling;
      const scrollTarget = activeVoiceProposalId
        ? review
        : precedingMessage instanceof HTMLElement &&
            precedingMessage.classList.contains("oq-ai-message")
          ? precedingMessage
          : review;
      thread.scrollTo({
        top:
          thread.scrollTop +
          scrollTarget.getBoundingClientRect().top -
          thread.getBoundingClientRect().top,
        behavior: "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeVoiceProposalId, voiceReview.length]);

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
    const proposals = extractVoiceProposals(prompt, transactionValues, parties);
    setMessages((current) => [
      ...current,
      { id: messageIdRef.current++, role: "user", text: prompt },
    ]);
    setText("");
    setThinking(true);
    replyTimerRef.current = window.setTimeout(() => {
      if (proposals.length > 0) {
        const nextVoiceScope: VoiceFillScope =
          /\b(this|current|open)\s+(document|form)\b|\b(form|tài liệu)\s+này\b/i.test(
            prompt,
          )
            ? "document"
            : /\b(change|update|replace|set)\b|\b(sửa|cập nhật|thay)\b/i.test(
                  prompt,
                )
              ? "transaction"
              : "empty";
        setVoiceScope(nextVoiceScope);
        setVoiceReview(proposals);
        setActiveVoiceProposalId(null);
        setVoiceApplyResult(null);
        setThinking(false);
        return;
      }
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
    setVoiceScope("empty");
    setVoiceReview([]);
    setActiveVoiceProposalId(null);
    setVoiceApplyResult(null);
    setEditingProposalId(null);
    setEditDraft("");
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
    [
      "Try Voice Fill",
      "Update buyer to David Nguyen, purchase price to 850 thousand, deposit 3%, and close escrow October 15.",
    ],
    ["Continue", "Continue to the next field"],
    ["Next form", "Next form"],
    ["Check status", "Check status and missing fields"],
    ["Summarize", "Summarize this page"],
    ["What’s missing?", "What fields are missing?"],
    ["Explain", "Explain this form"],
  ];

  const voiceReviewDocuments = [
    ...new Set(voiceReview.flatMap((proposal) => proposal.affectedDocuments)),
  ];
  const proposalIsInVoiceScope = (proposal: VoiceProposal) => {
    if (voiceScope === "empty") return !proposal.currentValue;
    if (voiceScope === "document") {
      return proposal.affectedDocuments.includes(documentLabel);
    }
    return true;
  };
  const scopedVoiceProposals = voiceReview.filter(proposalIsInVoiceScope);
  const applicableVoiceProposals = scopedVoiceProposals.filter(
    (proposal) => proposal.included,
  );
  const pendingVoiceProposals = applicableVoiceProposals.filter(
    (proposal) =>
      classifyVoiceProposal(proposal).requiresConfirmation &&
      !proposal.confirmed,
  );
  const unconfirmedCount = pendingVoiceProposals.length;
  const activeVoiceProposal = scopedVoiceProposals.find(
    (proposal) => proposal.id === activeVoiceProposalId,
  );
  const activeVoiceProposalIndex = activeVoiceProposal
    ? scopedVoiceProposals.findIndex(
        (proposal) => proposal.id === activeVoiceProposal.id,
      )
    : -1;
  const activeVoiceSensitivity = activeVoiceProposal
    ? classifyVoiceProposal(activeVoiceProposal)
    : null;
  const activeDetailKeys = new Set(
    activeVoiceProposal?.updates
      .filter((update) => update.target === "detail")
      .map((update) => update.key) ?? [],
  );
  const activeAffectedTarget = activeVoiceProposal
    ? detailPdfLinks.find(
        (link) =>
          link.form === documentLabel &&
          link.detailKeys.some((key) => activeDetailKeys.has(key)),
      )
    : undefined;

  const nextPendingVoiceProposal = (
    review: VoiceProposal[],
    currentId: string,
  ) => {
    const queue = review.filter(proposalIsInVoiceScope);
    const currentIndex = queue.findIndex((proposal) => proposal.id === currentId);
    const ordered = [
      ...queue.slice(currentIndex + 1),
      ...queue.slice(0, Math.max(0, currentIndex)),
    ];
    return ordered.find(
      (proposal) =>
        proposal.included &&
        classifyVoiceProposal(proposal).requiresConfirmation &&
        !proposal.confirmed,
    );
  };

  const beginProposalEdit = (proposal: VoiceProposal) => {
    setEditingProposalId(proposal.id);
    setEditDraft(proposal.value);
  };

  const saveProposalEdit = (proposal: VoiceProposal) => {
    if (!editDraft.trim()) return;
    const nextReview = voiceReview.map((current) =>
      current.id === proposal.id
        ? editVoiceProposal(current, editDraft)
        : current,
    );
    setVoiceReview(nextReview);
    setEditingProposalId(null);
    setEditDraft("");
    setActiveVoiceProposalId(
      nextPendingVoiceProposal(nextReview, proposal.id)?.id ?? null,
    );
  };

  const resolveVoiceProposal = (
    proposal: VoiceProposal,
    useSuggestion: boolean,
  ) => {
    const nextReview = voiceReview.map((current) =>
      current.id === proposal.id
        ? {
            ...current,
            included: useSuggestion,
            confirmed: true,
          }
        : current,
    );
    setVoiceReview(nextReview);
    setEditingProposalId(null);
    setEditDraft("");
    setActiveVoiceProposalId(
      nextPendingVoiceProposal(nextReview, proposal.id)?.id ?? null,
    );
  };

  const startVoiceReview = () => {
    const next = pendingVoiceProposals[0] ?? scopedVoiceProposals[0];
    setActiveVoiceProposalId(next?.id ?? null);
  };

  const applyVoiceReview = () => {
    if (applicableVoiceProposals.length === 0 || unconfirmedCount > 0) return;
    onApplyVoice(voiceScope, applicableVoiceProposals);
    setVoiceApplyResult({
      count: applicableVoiceProposals.length,
      scope: voiceScope,
      undone: false,
    });
    setVoiceReview([]);
    setActiveVoiceProposalId(null);
    setEditingProposalId(null);
  };

  const undoVoiceReview = () => {
    onUndoVoice();
    setVoiceApplyResult((current) =>
      current ? { ...current, undone: true } : current,
    );
  };

  const assistantAnnouncement = thinking
    ? "Assistant is responding"
    : activeVoiceProposal
      ? `Reviewing ${activeVoiceProposal.label}, ${activeVoiceProposalIndex + 1} of ${scopedVoiceProposals.length}`
      : voiceReview.length > 0
        ? `${scopedVoiceProposals.length} proposed changes. ${unconfirmedCount} need review.`
        : voiceApplyResult
          ? voiceApplyResult.undone
            ? "The last Voice Fill update was undone."
            : `${voiceApplyResult.count} changes applied.`
          : messages.at(-1)?.role === "assistant"
            ? messages.at(-1)?.text
            : "";

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
      <div className="oq-thread" ref={threadRef}>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {assistantAnnouncement}
        </div>
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
        {voiceReview.length > 0 && (
          <section
            className="oq-ai-message oq-voice-review"
            aria-label="Voice fill review"
            ref={voiceReviewRef}
          >
            {activeVoiceProposal ? (
              <div className="oq-voice-review-detail">
                <header>
                  <span>
                    <small>
                      {activeVoiceProposalIndex + 1} of {scopedVoiceProposals.length}
                    </small>
                    <b>{activeVoiceProposal.label}</b>
                  </span>
                  <button
                    type="button"
                    aria-label="Back to change list"
                    title="Back to change list"
                    onClick={() => {
                      setActiveVoiceProposalId(null);
                      setEditingProposalId(null);
                      setEditDraft("");
                    }}
                  >
                    <Icon name="close" size={15} />
                  </button>
                </header>

                <div className="oq-voice-detail-values">
                  <span>
                    <small>Current</small>
                    <b>
                      {displayVoiceValue(
                        activeVoiceProposal,
                        activeVoiceProposal.currentValue,
                      )}
                    </b>
                  </span>
                  <Icon name="chevron" size={15} />
                  <span>
                    <small>Suggestion</small>
                    {editingProposalId === activeVoiceProposal.id ? (
                      <span className="oq-voice-inline-edit">
                        <input
                          autoFocus
                          aria-label={`Edit ${activeVoiceProposal.label}`}
                          value={editDraft}
                          onChange={(event) => setEditDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              saveProposalEdit(activeVoiceProposal);
                            }
                            if (event.key === "Escape") {
                              setEditingProposalId(null);
                              setEditDraft("");
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="cancel"
                          aria-label={`Cancel editing ${activeVoiceProposal.label}`}
                          title="Cancel editing"
                          onClick={() => {
                            setEditingProposalId(null);
                            setEditDraft("");
                          }}
                        >
                          <Icon name="close" size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={!editDraft.trim()}
                          aria-label={`Save ${activeVoiceProposal.label}`}
                          title="Save value"
                          onClick={() => saveProposalEdit(activeVoiceProposal)}
                        >
                          <Icon name="check" size={15} />
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="oq-voice-edit-trigger"
                        aria-label={`Edit ${activeVoiceProposal.label}: ${displayVoiceValue(activeVoiceProposal, activeVoiceProposal.value)}`}
                        onClick={() => beginProposalEdit(activeVoiceProposal)}
                      >
                        <b>
                          {displayVoiceValue(
                            activeVoiceProposal,
                            activeVoiceProposal.value,
                          )}
                        </b>
                        <Icon name="edit" size={13} />
                      </button>
                    )}
                  </span>
                </div>

                {activeVoiceSensitivity?.requiresConfirmation && (
                  <p
                    className={`oq-voice-risk-note ${activeVoiceSensitivity.level}`}
                    role="note"
                  >
                    <b>
                      {activeVoiceSensitivity.level === "critical"
                        ? "High risk"
                        : "Sensitive"}
                    </b>
                    <span>
                      {activeVoiceSensitivity.category} · {activeVoiceSensitivity.confirmation}
                    </span>
                  </p>
                )}

                {activeAffectedTarget && (
                  <button
                    type="button"
                    className="oq-voice-show-affected"
                    onClick={() => onShowAffectedField(activeAffectedTarget)}
                  >
                    Show in {documentLabel}
                    <Icon name="chevron" size={12} />
                  </button>
                )}

                {editingProposalId !== activeVoiceProposal.id && (
                  <footer className="oq-voice-decision-actions">
                    <button
                      type="button"
                      onClick={() =>
                        resolveVoiceProposal(activeVoiceProposal, false)
                      }
                    >
                      {activeVoiceProposal.currentValue
                        ? "Keep current"
                        : "Leave empty"}
                    </button>
                    <button
                      type="button"
                      className="primary"
                      onClick={() =>
                        resolveVoiceProposal(activeVoiceProposal, true)
                      }
                    >
                      Use suggestion
                    </button>
                  </footer>
                )}
              </div>
            ) : (
              <>
                <header className="oq-voice-queue-head">
                  <b>
                    {scopedVoiceProposals.length} proposed{" "}
                    {scopedVoiceProposals.length === 1 ? "change" : "changes"}
                  </b>
                  <span
                    className={`oq-voice-queue-summary ${
                      unconfirmedCount > 0
                        ? "review"
                        : applicableVoiceProposals.length > 0
                          ? "ready"
                          : "idle"
                    }`}
                  >
                    {unconfirmedCount > 0
                      ? `${unconfirmedCount} need review`
                      : applicableVoiceProposals.length > 0
                        ? "Review complete"
                        : "Nothing to apply"}
                  </span>
                </header>
                <p className="oq-voice-queue-scope">
                  {voiceScope === "document"
                    ? `${documentLabel} only`
                    : voiceScope === "empty"
                      ? "Empty fields only"
                      : voiceReviewDocuments.length > 0
                        ? `Affects ${voiceReviewDocuments.length} ${voiceReviewDocuments.length === 1 ? "form" : "forms"}`
                        : "Transaction record only"}
                </p>

                <ul className="oq-voice-proposals">
                  {voiceReview.map((proposal) => {
                    const inScope = proposalIsInVoiceScope(proposal);
                    const sensitivity = classifyVoiceProposal(proposal);
                    const status = !inScope
                      ? "Skipped"
                      : !proposal.included
                        ? "Kept"
                        : proposal.confirmed
                          ? "Ready"
                          : sensitivity.level === "critical"
                            ? "High risk"
                            : sensitivity.level === "sensitive"
                              ? "Sensitive"
                              : "Review";
                    return (
                      <li key={proposal.id}>
                        <button
                          type="button"
                          disabled={!inScope}
                          aria-expanded={false}
                          onClick={() => setActiveVoiceProposalId(proposal.id)}
                        >
                          <span className="oq-voice-queue-label">
                            {proposal.label}
                          </span>
                          <span className="oq-voice-queue-values">
                            <span>
                              {displayVoiceValue(proposal, proposal.currentValue)}
                            </span>
                            <Icon name="chevron" size={12} />
                            <b>{displayVoiceValue(proposal, proposal.value)}</b>
                          </span>
                          <span
                            className={`oq-voice-queue-status ${status.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {status}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <footer className="oq-voice-review-actions">
                  <span>
                    <b>
                      {unconfirmedCount > 0
                        ? "Review required"
                        : `${applicableVoiceProposals.length} ${applicableVoiceProposals.length === 1 ? "change" : "changes"} ready`}
                    </b>
                    <small>
                      {voiceReview.length - scopedVoiceProposals.length > 0
                        ? `${voiceReview.length - scopedVoiceProposals.length} skipped by scope`
                        : unconfirmedCount > 0
                          ? "You’ll review one change at a time."
                          : "Apply when you’re ready."}
                    </small>
                  </span>
                  <button
                    type="button"
                    disabled={
                      unconfirmedCount === 0 &&
                      applicableVoiceProposals.length === 0
                    }
                    onClick={
                      unconfirmedCount > 0 ? startVoiceReview : applyVoiceReview
                    }
                  >
                    {unconfirmedCount > 0
                      ? `Review ${unconfirmedCount}`
                      : voiceScope === "document"
                        ? `Apply to ${documentLabel}`
                        : `Apply ${applicableVoiceProposals.length}`}
                  </button>
                </footer>
              </>
            )}
          </section>
        )}
        {voiceApplyResult && (
          <div className="oq-ai-message oq-voice-applied" role="status">
            <span className="oq-voice-applied-icon" aria-hidden="true">
              <Icon name={voiceApplyResult.undone ? "history" : "check"} size={15} />
            </span>
            <span>
              <b>
                {voiceApplyResult.undone
                  ? "Changes undone"
                  : `${voiceApplyResult.count} ${voiceApplyResult.count === 1 ? "change" : "changes"} applied`}
              </b>
              <small>
                {voiceApplyResult.undone
                  ? "Previous values restored."
                  : voiceApplyResult.scope === "document"
                    ? `Updated ${documentLabel} only.`
                    : "Transaction and linked forms updated."}
              </small>
            </span>
            {!voiceApplyResult.undone && (
              <button type="button" onClick={undoVoiceReview}>
                Undo
              </button>
            )}
          </div>
        )}
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

type DetailSectionKey =
  | "property"
  | "listing"
  | "purchase"
  | "commission";

type EditableDetailField = {
  key: string;
  label: string;
  value: string;
  /** Value arrives from the Create Transaction flow rather than being typed here. */
  prefill?: boolean;
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

/**
 * Document lifecycle, keyed by the value the API returns. Labels stay neutral
 * about the e-sign provider — the enum says docusign, the UI must not.
 */
type DocumentStatus =
  | "draft"
  | "filled"
  | "sent_to_docusign"
  | "partial"
  | "completed"
  | "declined"
  | "kept_signed";

const documentStatusMeta: Record<
  DocumentStatus,
  { label: string; tone: string }
> = {
  draft: { label: "Draft", tone: "neutral" },
  filled: { label: "Filled", tone: "info" },
  partial: { label: "Partial", tone: "warn" },
  sent_to_docusign: { label: "Sent for signing", tone: "progress" },
  completed: { label: "Completed", tone: "good" },
  declined: { label: "Declined", tone: "bad" },
  kept_signed: { label: "Kept signed", tone: "good" },
};

const partyRoleOptions = [
  "Buyer Agent",
  "Listing Agent",
  "Buyer 1",
  "Buyer 2",
  "Seller",
  "Transaction Coordinator",
];

const partyFields: EditableDetailField[] = [
  { key: "partyFirstName", label: "First name", value: "Vu", prefill: true },
  { key: "partyLastName", label: "Last name", value: "Nguyen", prefill: true },
  { key: "partyEmail", label: "Email", value: "vu.nguyen@c0x12c.com", prefill: true, wide: true },
  {
    key: "partyRole",
    label: "Transaction role",
    value: "Buyer Agent",
    kind: "select",
    options: partyRoleOptions,
    wide: true,
  },
];

/** Extra contact fields shown for the transaction's own agent record. */
const agentContactFields: EditableDetailField[] = [
  { key: "agentPhone", label: "Phone", value: "(213) 555-0148", prefill: true },
  { key: "agentLicense", label: "DRE / NMLS #", value: "02114477", prefill: true },
];

const agentBrokerageFields: EditableDetailField[] = [
  { key: "brokerageFirm", label: "Brokerage firm", value: "Pinnacle Estate Properties", prefill: true, wide: true },
  { key: "brokerageLicense", label: "Brokerage DRE license #", value: "01234567", prefill: true },
  { key: "brokerageFax", label: "Fax", value: "" },
  { key: "brokerageAddress", label: "Office address", value: "700 S Flower St", prefill: true, wide: true },
  { key: "brokerageCity", label: "City", value: "Los Angeles", prefill: true },
  { key: "brokerageState", label: "State", value: "CA", prefill: true },
  { key: "brokerageZip", label: "ZIP", value: "90017", prefill: true },
];

const clientContactFields: EditableDetailField[] = [
  { key: "firstName", label: "First name", value: "", prefill: true },
  { key: "lastName", label: "Last name", value: "", prefill: true },
  { key: "email", label: "Email", value: "", prefill: true },
  { key: "phone", label: "Phone", value: "", prefill: true },
  { key: "mailingAddress", label: "Mailing address", value: "", wide: true },
];

const buyerDetailFields: EditableDetailField[] = [
  { key: "occupation", label: "Occupation / employer", value: "", wide: true },
  {
    key: "financingType",
    label: "Financing type",
    value: "",
    kind: "select",
    options: ["Cash", "Conventional", "FHA", "VA", "Other"],
  },
  { key: "preApprovalAmount", label: "Pre-approval amount", value: "", prefix: "$" },
  { key: "preferredLender", label: "Preferred lender", value: "", wide: true },
];

const propertyFields: EditableDetailField[] = [
  { key: "propertyAddress", label: "Property address", value: "2458 Maplewood Ave", prefill: true, wide: true },
  { key: "unit", label: "Unit #", value: "12B" },
  { key: "city", label: "City", value: "Los Angeles", prefill: true },
  { key: "state", label: "State", value: "CA", prefill: true },
  { key: "zip", label: "Zip Code", value: "90026", prefill: true },
  { key: "county", label: "County", value: "Los Angeles", prefill: true },
  {
    key: "propertyType",
    label: "Type",
    value: "Commercial",
    prefill: true,
    kind: "select",
    options: ["Commercial", "Condominium", "Single Family", "Multi-Family", "Land"],
  },
  { key: "yearBuilt", label: "Year built or manufactured", value: "2018" },
  { key: "apn", label: "APN", value: "5401-021-045", prefill: true },
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
  { key: "listedPrice", label: "Listed Price", value: "825,000", prefill: true, prefix: "$" },
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
  ...agentContactFields,
  ...agentBrokerageFields,
  ...propertyFields,
  ...listingFields,
  ...purchaseFields,
  ...keyDateFields,
  ...listingCommissionFields,
  ...purchaseCommissionFields,
];

const initialDetailValues = {
  ...Object.fromEntries(
    allEditableFields.map((field) => [field.key, field.value]),
  ),
  buyer1FirstName: "Alexis",
  buyer1LastName: "Romero",
  buyer1Email: "alexis.romero@example.com",
  buyer1Phone: "(310) 555-0132",
  buyer1Role: "Buyer 1",
} as Record<string, string>;

const fullAgentName = (values: Record<string, string>) =>
  [values.partyFirstName, values.partyLastName].filter(Boolean).join(" ");

const fullBuyer1Name = (values: Record<string, string>) =>
  [values.buyer1FirstName, values.buyer1LastName].filter(Boolean).join(" ");

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
    form: "BRBC",
    page: 8,
    fieldId: "prbs_b.agent.signature",
    label: "Buyer brokerage agent",
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
    detailKeys: ["agentPhone"],
    form: "BRBC",
    page: 7,
    fieldId: "signatures.broker.agent.1.tel",
    label: "Broker / agent phone",
    resolve: (values) => values.agentPhone,
  },
  ...[
    ["AD", 1, "disclosure.agent.dre_lic", "Agent DRE license"],
    ["AD", 2, "confirmation.buyers.agent.lic", "Buyer’s agent license"],
    ["BRBC", 1, "disclosure.agent.dre_lic", "Agent DRE license"],
    ["BRBC", 7, "signatures.broker.agent.1.dre_lic", "Broker / agent DRE license"],
    ["BRBC", 8, "prbs_b.agent.dre_lic", "Buyer brokerage agent DRE license"],
    ["PRBS", 1, "p2_buyer_brokerage_agent_dre_lic", "Buyer brokerage agent DRE license"],
  ].map(([form, page, fieldId, label]) => ({
    detailKeys: ["agentLicense"],
    form: form as PdfDocumentCode,
    page: page as number,
    fieldId: fieldId as string,
    label: label as string,
    resolve: (values: Record<string, string>) => values.agentLicense,
  })),
  ...[
    ["AD", 2, "confirmation.buyers.broker.firm_name", "Buyer’s brokerage firm"],
    ["BRBC", 7, "signatures.broker.firm_name", "Buyer’s brokerage firm"],
    ["BRBC", 8, "prbs_b.brokerage.firm_name", "Buyer’s brokerage firm"],
    ["PRBS", 1, "p2_buyer_brokerage_firm", "Buyer’s brokerage firm"],
  ].map(([form, page, fieldId, label]) => ({
    detailKeys: ["brokerageFirm"],
    form: form as PdfDocumentCode,
    page: page as number,
    fieldId: fieldId as string,
    label: label as string,
    resolve: (values: Record<string, string>) => values.brokerageFirm,
  })),
  ...[
    ["AD", 1, "disclosure.broker.dre_lic", "Broker DRE license"],
    ["AD", 2, "confirmation.buyers.broker.firm_lic", "Buyer’s brokerage DRE license"],
    ["BRBC", 1, "disclosure.broker.dre_lic", "Broker DRE license"],
    ["BRBC", 7, "signatures.broker.firm_dre_lic", "Brokerage DRE license"],
    ["BRBC", 8, "prbs_b.brokerage.dre_lic", "Buyer’s brokerage DRE license"],
    ["PRBS", 1, "p2_buyer_brokerage_dre_lic", "Buyer’s brokerage DRE license"],
  ].map(([form, page, fieldId, label]) => ({
    detailKeys: ["brokerageLicense"],
    form: form as PdfDocumentCode,
    page: page as number,
    fieldId: fieldId as string,
    label: label as string,
    resolve: (values: Record<string, string>) => values.brokerageLicense,
  })),
  ...[
    ["brokerageAddress", "signatures.broker.address", "Brokerage address"],
    ["brokerageCity", "signatures.broker.city", "Brokerage city"],
    ["brokerageState", "signatures.broker.state", "Brokerage state"],
    ["brokerageZip", "signatures.broker.zip", "Brokerage ZIP"],
  ].map(([detailKey, fieldId, label]) => ({
    detailKeys: [detailKey],
    form: "BRBC" as PdfDocumentCode,
    page: 7,
    fieldId,
    label,
    resolve: (values: Record<string, string>) => values[detailKey],
  })),
  ...[
    ["confirmation.role.is_broker_of_buyer", "Buyer brokerage represents Buyer"],
    ["confirmation.role.is_buyers_agent", "Agent represents Buyer"],
  ].map(([fieldId, label]) => ({
    detailKeys: ["partyRole"],
    form: "AD" as PdfDocumentCode,
    page: 2,
    fieldId,
    label,
    kind: "checkbox" as const,
    resolve: (values: Record<string, string>) => values.partyRole === "Buyer Agent",
  })),
  ...[
    ["AD", 1, "disclosure.signer.1.signature", "Buyer acknowledgement"],
    ["AD", 3, "signatures.signer.1.signature", "Buyer confirmation"],
    ["BRBC", 1, "disclosure.signer.1.signature", "Buyer acknowledgement"],
    ["BRBC", 3, "agreement.buyer.name", "Buyer name"],
    ["BRBC", 7, "signatures.buyer.1.signature", "Buyer signature"],
    ["BRBC", 7, "signatures.buyer.1.printed_name", "Printed buyer name"],
    ["BRBC", 8, "prbs_b.buyer.1.signature", "Buyer signature"],
    ["BRBC", 12, "bia.buyer.1.signature", "Buyer signature"],
    ["BRBC", 13, "ccpa.buyer.signature", "Buyer signature"],
    ["PRBS", 1, "p2_buyer1_signature_es_:signer:signature", "Buyer signature"],
  ].map(([form, page, fieldId, label]) => ({
    detailKeys: ["buyer1FirstName", "buyer1LastName"],
    form: form as PdfDocumentCode,
    page: page as number,
    fieldId: fieldId as string,
    label: label as string,
    resolve: fullBuyer1Name,
  })),
  ...[
    ["AD", "disclosure.signer.1.buyer", "Signer 1 is Buyer"],
    ["BRBC", "disclosure.signer.1.buyer", "Signer 1 is Buyer"],
  ].map(([form, fieldId, label]) => ({
    detailKeys: ["buyer1Role"],
    form: form as PdfDocumentCode,
    page: 1,
    fieldId,
    label,
    kind: "checkbox" as const,
    resolve: (values: Record<string, string>) => /buyer/i.test(values.buyer1Role),
  })),
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

/**
 * Every PDF field that draws on the same transaction data as this one, itself
 * excluded. This is the number that decides "everywhere" vs "just here", so it
 * has to be on screen when we ask.
 */
function siblingLinksForPdfField(form: PdfDocumentCode, fieldId: string) {
  const self = detailPdfLinks.find(
    (link) => link.form === form && link.fieldId === fieldId,
  );
  if (!self) return { self: undefined, siblings: [] as DetailPdfLink[] };
  const detailKeySet = new Set(self.detailKeys);
  const siblings = detailPdfLinks.filter(
    (link) =>
      !(link.form === form && link.fieldId === fieldId) &&
      link.detailKeys.length === self.detailKeys.length &&
      link.detailKeys.every((key) => detailKeySet.has(key)),
  );
  return { self, siblings };
}

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
  baseline,
  linkedKeyForField,
  showFieldLinks = true,
}: {
  fields: EditableDetailField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onNavigate: (target: DetailPdfLink) => void;
  /** Values as they arrived from Create Transaction; defaults to each field's seed. */
  baseline?: Record<string, string>;
  /** Party forms use compact local keys while PDF links use role-specific keys. */
  linkedKeyForField?: (key: string) => string;
  /** Off inside Parties: a person maps to forms, a first name does not. */
  showFieldLinks?: boolean;
}) {
  const [openDestinations, setOpenDestinations] = useState<string | null>(null);

  useEffect(() => {
    if (!openDestinations) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".oq-destination-pop, .oq-destination-toggle")) return;
      setOpenDestinations(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenDestinations(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openDestinations]);

  return (
    <div className="oq-edit-grid">
      {fields.map((field) => {
        const linkedKey = linkedKeyForField?.(field.key) ?? field.key;
        const destinations = showFieldLinks
          ? destinationsForDetailField(linkedKey)
          : [];
        const inputId = `detail-field-${field.key}`;
        const destinationsId = `${inputId}-destinations`;
        const destinationsOpen = openDestinations === linkedKey;
        return (
          <div
            className={`oq-edit-field ${field.wide ? "wide" : ""} ${
              isPrefilled(field, values, baseline) ? "is-prefilled" : ""
            }`}
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
            {destinations.length > 0 && (
              <span className="oq-field-destinations">
                <small>Linked to</small>
                <a
                  href={`#${linkedPdfFieldDomId(destinations[0])}`}
                  title={`Open ${destinations[0].label} in ${destinations[0].form}, page ${destinations[0].page}`}
                  aria-label={`Open ${field.label} in ${destinations[0].form}, page ${destinations[0].page}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(destinations[0]);
                  }}
                >
                  {destinations[0].form} · p.{destinations[0].page}
                </a>
                {destinations.length > 0 && (
                  <button
                    className="oq-destination-toggle"
                    type="button"
                    aria-label={`Show all ${destinations.length} linked locations for ${field.label}`}
                    aria-expanded={destinationsOpen}
                    aria-controls={destinationsId}
                    onClick={() =>
                      setOpenDestinations(destinationsOpen ? null : linkedKey)
                    }
                  >
                    <span>More</span>
                    <small>{destinations.length}</small>
                    <Icon name="chevron" size={12} />
                  </button>
                )}
              </span>
            )}
            {destinationsOpen && (
              <div
                className="oq-destination-pop"
                id={destinationsId}
                role="dialog"
                aria-label={`Linked fields for ${field.label}`}
              >
                <header>
                  <b>Appears in</b>
                  <small>{destinations.length} locations</small>
                  <button
                    type="button"
                    aria-label="Close linked fields"
                    onClick={() => setOpenDestinations(null)}
                  >
                    <Icon name="close" size={14} />
                  </button>
                </header>
                <ul>
                  {destinations.map((destination) => (
                    <li key={`${destination.form}-${destination.page}-${destination.label}`}>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate(destination);
                          setOpenDestinations(null);
                        }}
                      >
                        <em>{destination.form}</em>
                        <span>{destination.label}</span>
                        <small>Page {destination.page}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
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

type TransactionParty = {
  id: string;
  values: Record<string, string>;
  /** Snapshot of what Create Transaction supplied, for the pre-fill marker. */
  baseline: Record<string, string>;
};

/**
 * A field reads as pre-filled while it still holds the value Create Transaction
 * supplied — editing it clears the marker, so the marks thin out as the agent
 * reviews the form.
 */
const isPrefilled = (
  field: EditableDetailField,
  values: Record<string, string>,
  baseline?: Record<string, string>,
) => {
  if (!field.prefill) return false;
  const seeded = baseline?.[field.key] ?? field.value;
  return Boolean(seeded) && values[field.key] === seeded;
};

const partyRoleField: EditableDetailField = {
  key: "role",
  label: "Transaction role",
  value: "",
  kind: "select",
  options: partyRoleOptions,
  wide: true,
};

const agentContactFieldsGeneric: EditableDetailField[] = [
  { key: "firstName", label: "First name", value: "", prefill: true },
  { key: "lastName", label: "Last name", value: "", prefill: true },
  { key: "email", label: "Email", value: "", prefill: true, wide: true },
  { key: "phone", label: "Phone", value: "", prefill: true },
  { key: "license", label: "DRE / NMLS #", value: "", prefill: true },
];

const makeParty = (
  id: string,
  fields: EditableDetailField[],
  overrides: Record<string, string> = {},
): TransactionParty => {
  const values = {
    ...Object.fromEntries(fields.map((field) => [field.key, field.value])),
    ...overrides,
  };
  return { id, values, baseline: { ...values } };
};

const initialParties: TransactionParty[] = [
  makeParty("primary", [...agentContactFields, ...agentBrokerageFields]),
  makeParty("buyer-1", [...clientContactFields, ...buyerDetailFields], {
    role: "Buyer 1",
    firstName: "Alexis",
    lastName: "Romero",
    email: "alexis.romero@example.com",
    phone: "(310) 555-0132",
  }),
  makeParty("seller", clientContactFields, {
    role: "Seller",
    firstName: "Dana",
    lastName: "Whitfield",
    email: "dana.whitfield@example.com",
    phone: "(323) 555-0177",
  }),
  makeParty(
    "listing-agent",
    [...agentContactFieldsGeneric, ...agentBrokerageFields],
    {
      role: "Listing Agent",
      firstName: "Priya",
      lastName: "Raman",
      email: "priya.raman@example.com",
      phone: "(818) 555-0104",
      brokerageFirm: "Harbor & Vine Realty",
    },
  ),
];

const isAgentRole = (role: string) => /agent|coordinator/i.test(role);

/** Roles group by side of the deal, not by exact title — otherwise a four-party
 *  transaction becomes four groups of one. */
const partyGroupOf = (role: string) => {
  if (isAgentRole(role)) return "agents";
  if (/buyer/i.test(role)) return "buyers";
  if (/seller/i.test(role)) return "sellers";
  return "other";
};

const partyGroupOrder = [
  { key: "buyers", label: "Buyers" },
  { key: "sellers", label: "Sellers" },
  { key: "agents", label: "Agents" },
  { key: "other", label: "Other" },
] as const;

/**
 * One party is shown at a time and its field set follows its role, so the panel
 * never renders more than a dozen inputs even though the transaction carries
 * six party records.
 */
const partyFormGroups = (
  party: TransactionParty,
): Array<{ heading?: string; fields: EditableDetailField[] }> => {
  if (party.id === "primary") {
    return [
      { fields: [...partyFields, ...agentContactFields] },
      { heading: "Brokerage", fields: agentBrokerageFields },
    ];
  }
  const role = party.values.role ?? "";
  if (isAgentRole(role)) {
    return [
      { fields: [...agentContactFieldsGeneric, partyRoleField] },
      { heading: "Brokerage", fields: agentBrokerageFields },
    ];
  }
  const groups: Array<{ heading?: string; fields: EditableDetailField[] }> = [
    { fields: [...clientContactFields, partyRoleField] },
  ];
  if (/buyer/i.test(role)) {
    groups.push({ heading: "Buyer details", fields: buyerDetailFields });
  }
  return groups;
};

const partyDisplay = (
  party: TransactionParty,
  sharedValues: Record<string, string>,
) => {
  const name =
    party.id === "primary"
      ? fullAgentName(sharedValues)
      : [party.values.firstName, party.values.lastName].filter(Boolean).join(" ");
  const role =
    party.id === "primary" ? sharedValues.partyRole : party.values.role;
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";
  return { name: name || "New party", role: role || "No role set", initials };
};

const PREFILL_SECTIONS = new Set<DetailSectionKey>(["property", "listing"]);

const primaryPartyDetailKeys = new Set(
  [...partyFields, ...agentContactFields, ...agentBrokerageFields].map(
    (field) => field.key,
  ),
);

const buyer1DetailKeys: Record<string, string> = {
  firstName: "buyer1FirstName",
  lastName: "buyer1LastName",
  email: "buyer1Email",
  phone: "buyer1Phone",
  role: "buyer1Role",
};

const detailKeyForPartyField = (partyId: string, fieldKey: string) => {
  if (partyId === "primary" && primaryPartyDetailKeys.has(fieldKey)) {
    return fieldKey;
  }
  if (partyId === "buyer-1") return buyer1DetailKeys[fieldKey];
  return undefined;
};

/**
 * Appearance belongs to the person, not to a single field. Two parties can
 * share a last name, so "which forms carry Nguyen" is a question with no answer
 * — "which forms carry this party record" always has one. Every slot below is
 * resolved from the party's own id, and saving the party repopulates the whole
 * set at once.
 */
type PartyAppearance = {
  form: string;
  slots: DetailPdfLink[];
  pages: number[];
};

const partyDetailKeys = (party: TransactionParty) =>
  partyFormGroups(party)
    .flatMap((group) => group.fields)
    .map((field) => detailKeyForPartyField(party.id, field.key))
    .filter((key): key is string => Boolean(key));

const partyAppearances = (party: TransactionParty): PartyAppearance[] => {
  const keys = new Set(partyDetailKeys(party));
  const byForm = new Map<string, DetailPdfLink[]>();
  detailPdfLinks.forEach((link) => {
    if (!link.detailKeys.some((key) => keys.has(key))) return;
    byForm.set(link.form, [...(byForm.get(link.form) ?? []), link]);
  });
  return [...byForm.entries()]
    .map(([form, slots]) => ({
      form,
      slots: [...slots].sort((a, b) => a.page - b.page),
      pages: [...new Set(slots.map((slot) => slot.page))].sort((a, b) => a - b),
    }))
    .sort((a, b) => a.form.localeCompare(b.form));
};

/** Forms that a set of edited party fields will repopulate on save. */
const formsTouchedByPartyKeys = (partyId: string, fieldKeys: string[]) => [
  ...new Set(
    fieldKeys.flatMap((key) => {
      const detailKey = detailKeyForPartyField(partyId, key);
      return detailKey ? linksForDetailField(detailKey).map((link) => link.form) : [];
    }),
  ),
];

function PartyAppearanceList({
  appearances,
  onNavigate,
}: {
  appearances: PartyAppearance[];
  onNavigate: (target: DetailPdfLink) => void;
}) {
  const [openForm, setOpenForm] = useState<string | null>(null);

  if (appearances.length === 0) {
    return (
      <section className="oq-party-appearance is-empty">
        <b>Not on any form yet</b>
        <small>This party appears once a form using their role is added.</small>
      </section>
    );
  }

  const slotCount = appearances.reduce(
    (total, appearance) => total + appearance.slots.length,
    0,
  );

  return (
    <section className="oq-party-appearance">
      <header>
        <b>
          Appears in {appearances.length}{" "}
          {appearances.length === 1 ? "form" : "forms"}
        </b>
        <small>{slotCount} fields repopulate when this party changes</small>
      </header>
      <ul>
        {appearances.map((appearance) => {
          const expanded = openForm === appearance.form;
          return (
            <li key={appearance.form} className={expanded ? "is-open" : ""}>
              <button
                type="button"
                className="oq-appearance-row"
                aria-expanded={expanded}
                onClick={() =>
                  setOpenForm(expanded ? null : appearance.form)
                }
              >
                <em>{appearance.form}</em>
                <span>
                  {appearance.slots.length}{" "}
                  {appearance.slots.length === 1 ? "field" : "fields"}
                </span>
                <small>
                  p.{appearance.pages.join(", ")}
                </small>
                <Icon name="chevron" size={13} />
              </button>
              {expanded && (
                <ul className="oq-appearance-slots">
                  {appearance.slots.map((slot) => (
                    <li key={`${slot.form}-${slot.page}-${slot.fieldId}`}>
                      <button type="button" onClick={() => onNavigate(slot)}>
                        <span>{slot.label}</span>
                        <small>Page {slot.page}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PartiesPanel({
  onAddParty,
  parties,
  onPartiesChange,
  values,
  onChange,
  onNavigate,
  onClose,
}: {
  onAddParty: () => void;
  parties: TransactionParty[];
  onPartiesChange: React.Dispatch<React.SetStateAction<TransactionParty[]>>;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onNavigate: (target: DetailPdfLink) => void;
  onClose: () => void;
}) {
  // null = the roster. The panel is only as wide as the Docs panel, so one
  // party's fields get the full width instead of sharing it with a sidebar.
  const [openPartyId, setOpenPartyId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [partyDrafts, setPartyDrafts] = useState<
    Record<string, Record<string, string>>
  >({});
  const paneRef = useRef<HTMLDivElement | null>(null);

  const openParty = parties.find((party) => party.id === openPartyId) ?? null;
  const sourcePartyValues = openParty
    ? {
        ...openParty.values,
        ...Object.fromEntries(
          partyFormGroups(openParty)
            .flatMap((group) => group.fields)
            .flatMap((field) => {
              const detailKey = detailKeyForPartyField(openParty.id, field.key);
              return detailKey && values[detailKey] !== undefined
                ? [[field.key, values[detailKey]]]
                : [];
            }),
        ),
      }
    : {};
  const openPartyDraft = openParty ? (partyDrafts[openParty.id] ?? {}) : {};
  const partyValues = { ...sourcePartyValues, ...openPartyDraft };
  const changedKeys = Object.keys(openPartyDraft).filter(
    (key) => openPartyDraft[key] !== sourcePartyValues[key],
  );
  const hasChanges = changedKeys.length > 0;

  const showParty = (id: string | null) => {
    setOpenPartyId(id);
    requestAnimationFrame(() => {
      paneRef.current?.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  const closePanel = () => {
    setPartyDrafts({});
    onClose();
  };

  if (!openParty) {
    return (
      <div className="oq-parties-panel" ref={paneRef}>
        <div className="oq-panel-bar oq-panel-heading">
          <h2>Parties</h2>
          <button className="oq-add-party" onClick={onAddParty}>
            <Icon name="plus" />
            Add party
          </button>
          <button
            className="oq-panel-close"
            aria-label="Close parties panel"
            onClick={closePanel}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="oq-party-list">
          {partyGroupOrder.map((group) => {
            const members = parties.filter(
              (party) =>
                partyGroupOf(partyDisplay(party, values).role) === group.key,
            );
            if (members.length === 0) return null;
            const collapsed = collapsedGroups.includes(group.key);
            return (
              <section
                key={group.key}
                className={`oq-party-group ${collapsed ? "is-collapsed" : ""}`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={!collapsed}
                    onClick={() =>
                      setCollapsedGroups((current) =>
                        current.includes(group.key)
                          ? current.filter((key) => key !== group.key)
                          : [...current, group.key],
                      )
                    }
                  >
                    <Icon name="chevron" size={14} />
                    {group.label}
                    <small>{members.length}</small>
                  </button>
                </h3>
                {!collapsed &&
                  members.map((party) => {
                  const info = partyDisplay(party, values);
                  const formCount = partyAppearances(party).length;
                  return (
                    <button
                      type="button"
                      key={party.id}
                      className="oq-party-summary"
                      onClick={() => showParty(party.id)}
                    >
                      <span className="oq-party-avatar">{info.initials}</span>
                      <span>
                        <b>{info.name}</b>
                        <small>{info.role}</small>
                      </span>
                      <span className="oq-party-formcount">
                        {formCount > 0
                          ? `${formCount} ${formCount === 1 ? "form" : "forms"}`
                          : "No forms"}
                      </span>
                      <Icon name="chevron" size={16} />
                    </button>
                  );
                  })}
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  const effectiveParty = { ...openParty, values: partyValues };
  const appearances = partyAppearances(effectiveParty);
  const affectedForms = formsTouchedByPartyKeys(openParty.id, changedKeys);
  const info = partyDisplay(
    effectiveParty,
    openParty.id === "primary" ? partyValues : values,
  );
  const handlePartyChange = (key: string, value: string) => {
    setPartyDrafts((current) => {
      const nextPartyDraft = { ...(current[openParty.id] ?? {}) };
      if (value === sourcePartyValues[key]) delete nextPartyDraft[key];
      else nextPartyDraft[key] = value;

      const nextDrafts = { ...current };
      if (Object.keys(nextPartyDraft).length === 0) {
        delete nextDrafts[openParty.id];
      } else {
        nextDrafts[openParty.id] = nextPartyDraft;
      }
      return nextDrafts;
    });
  };
  const discardPartyChanges = () => {
    setPartyDrafts((current) => {
      const next = { ...current };
      delete next[openParty.id];
      return next;
    });
  };
  const savePartyChanges = () => {
    changedKeys.forEach((key) => {
      const detailKey = detailKeyForPartyField(openParty.id, key);
      if (detailKey) onChange(detailKey, openPartyDraft[key]);
    });
    onPartiesChange((current) =>
      current.map((party) =>
        party.id === openParty.id
          ? {
              ...party,
              values: {
                ...party.values,
                ...Object.fromEntries(
                  changedKeys.map((key) => [key, openPartyDraft[key]]),
                ),
              },
            }
          : party,
      ),
    );
    discardPartyChanges();
  };

  return (
    <div className="oq-parties-panel is-editing" ref={paneRef}>
      <div className="oq-panel-bar oq-panel-heading">
        <button
          className="oq-panel-back"
          type="button"
          onClick={() => showParty(null)}
        >
          <Icon name="chevron" size={16} />
          Parties
        </button>
        <button
          className="oq-panel-close"
          aria-label="Close parties panel"
          onClick={closePanel}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="oq-panel-body">
        <header className="oq-panel-intro">
          <h3>{info.name}</h3>
          <p>{info.role}</p>
          <span className="oq-prefill-legend">
            <i aria-hidden="true" />
            Marked fields came from Create Transaction
          </span>
        </header>
        <PartyAppearanceList
          appearances={appearances}
          onNavigate={onNavigate}
        />
        {partyFormGroups(effectiveParty).map((group, index) => (
          <div key={group.heading ?? `group-${index}`}>
            {group.heading && (
              <h5 className={`oq-form-subheading ${index === 0 ? "first" : ""}`}>
                {group.heading}
              </h5>
            )}
            <EditableFieldGrid
              fields={group.fields}
              values={partyValues}
              onChange={handlePartyChange}
              onNavigate={onNavigate}
              baseline={openParty.baseline}
              showFieldLinks={false}
              linkedKeyForField={(key) =>
                detailKeyForPartyField(openParty.id, key) ?? key
              }
            />
          </div>
        ))}
      </div>
      <footer className="oq-panel-savebar">
        <span aria-live="polite">
          {!hasChanges
            ? "All changes saved"
            : affectedForms.length > 0
              ? `${changedKeys.length} unsaved ${changedKeys.length === 1 ? "change" : "changes"} — repopulates ${affectedForms.join(", ")}`
              : `${changedKeys.length} unsaved ${changedKeys.length === 1 ? "change" : "changes"}`}
        </span>
        <div>
          <button
            type="button"
            disabled={!hasChanges}
            onClick={discardPartyChanges}
          >
            Discard
          </button>
          <button
            type="button"
            className="primary"
            disabled={!hasChanges}
            onClick={savePartyChanges}
          >
            {affectedForms.length > 0
              ? `Save & update ${affectedForms.length} ${affectedForms.length === 1 ? "form" : "forms"}`
              : "Save changes"}
          </button>
        </div>
      </footer>
    </div>
  );
}

function DetailsPanel({
  values,
  onChange,
  onNavigate,
  conflicts,
  onClose,
}: {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onNavigate: (target: DetailPdfLink) => void;
  conflicts: LinkedFieldConflict[];
  onClose: () => void;
}) {
  const [activeSection, setActiveSection] =
    useState<DetailSectionKey>("property");
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const effectiveValues = useMemo(
    () => ({ ...values, ...draftValues }),
    [draftValues, values],
  );
  const changedKeys = useMemo(
    () =>
      Object.keys(draftValues).filter(
        (key) => draftValues[key] !== values[key],
      ),
    [draftValues, values],
  );
  const hasChanges = changedKeys.length > 0;
  const handleChange = (key: string, value: string) => {
    setDraftValues((current) => {
      const next = { ...current };
      if (value === values[key]) delete next[key];
      else next[key] = value;
      return next;
    });
  };
  const saveChanges = () => {
    changedKeys.forEach((key) => onChange(key, draftValues[key]));
    setDraftValues({});
  };
  const discardChanges = () => setDraftValues({});
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const sections: Array<{
    key: DetailSectionKey;
    label: string;
    title: string;
    description: string;
    groups: Array<{ heading?: string; fields: EditableDetailField[] }>;
  }> = [
    {
      key: "property",
      label: "Property",
      title: "Property information",
      description: "Address, parcel, tax, and legal property details.",
      groups: [{ fields: propertyFields }],
    },
    {
      key: "listing",
      label: "Listing",
      title: "Listing information",
      description: "Listing dates, pricing, liens, and transaction notes.",
      groups: [{ fields: listingFields }],
    },
    {
      key: "purchase",
      label: "Purchase",
      title: "Purchase information",
      description: "Offer terms, financing, contingencies, and key dates.",
      groups: [
        { fields: purchaseFields },
        { heading: "Key dates", fields: keyDateFields },
      ],
    },
    {
      key: "commission",
      label: "Commission",
      title: "Commission details",
      description: "Listing and purchase commission allocations.",
      groups: [
        { heading: "Listing commission", fields: listingCommissionFields },
        { heading: "Purchase commission", fields: purchaseCommissionFields },
      ],
    },
  ];
  const selectedSection =
    sections.find((section) => section.key === activeSection) ?? sections[0];

  const selectSection = (key: DetailSectionKey) => {
    setActiveSection(key);
    requestAnimationFrame(() => {
      bodyRef.current?.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  return (
    <div className="oq-details-panel">
      <div className="oq-panel-bar oq-panel-heading">
        <h2>Details</h2>
        <button
          className="oq-panel-close"
          aria-label="Close details panel"
          onClick={() => {
            discardChanges();
            onClose();
          }}
        >
          <Icon name="close" />
        </button>
      </div>
      <nav className="oq-section-tabs" aria-label="Transaction detail sections">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            aria-pressed={activeSection === section.key}
            onClick={() => selectSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </nav>
      <div className="oq-panel-body" ref={bodyRef} key={activeSection}>
        <CrossFormCheckSummary conflicts={conflicts} onNavigate={onNavigate} />
        <header className="oq-panel-intro">
          <h3>{selectedSection.title}</h3>
          <p>{selectedSection.description}</p>
          {PREFILL_SECTIONS.has(activeSection) && (
            <span className="oq-prefill-legend">
              <i aria-hidden="true" />
              Marked fields came from Create Transaction
            </span>
          )}
        </header>
        {selectedSection.groups.map((group, index) => (
          <div key={group.heading ?? `group-${index}`}>
            {group.heading && (
              <h5 className={`oq-form-subheading ${index === 0 ? "first" : ""}`}>
                {group.heading}
              </h5>
            )}
            <EditableFieldGrid
              fields={group.fields}
              values={effectiveValues}
              onChange={handleChange}
              onNavigate={onNavigate}
            />
          </div>
        ))}
      </div>
      <footer className="oq-panel-savebar">
        <span aria-live="polite">
          {hasChanges
            ? `${changedKeys.length} unsaved ${changedKeys.length === 1 ? "change" : "changes"}`
            : "All changes saved"}
        </span>
        <div>
          <button
            type="button"
            disabled={!hasChanges}
            onClick={discardChanges}
          >
            Discard
          </button>
          <button
            type="button"
            className="primary"
            disabled={!hasChanges}
            onClick={saveChanges}
          >
            Save changes
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  const [panel, setPanel] = useState<
    "forms" | "assistant" | "details" | "parties"
  >("forms");
  const [zoom, setZoom] = useState("Fit width");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [partyOpen, setPartyOpen] = useState(false);
  const [transactionDocuments, setTransactionDocuments] = useState<string[]>([
    "[AD] Disclosure Regarding Real Estate Agency Relationship (Buyer)",
    "[BRBC] Buyer Representation and Broker Compensation Agreement",
    "[PRBS] Possible Representation of More Than One Buyer or Seller",
  ]);
  const [signaturePickerOpen, setSignaturePickerOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureDocuments, setSignatureDocuments] = useState<PdfDocumentCode[]>(
    [],
  );
  const [detailValues, setDetailValues] = useState(initialDetailValues);
  const [parties, setParties] = useState<TransactionParty[]>(initialParties);
  const [checkedFields, setCheckedFields] = useState<string[]>(() =>
    linkedCheckedFields(initialDetailValues),
  );
  const [pdfFieldValues, setPdfFieldValues] = useState<Record<string, string>>(
    () => linkedTextValues(initialDetailValues),
  );
  const [voiceUndoSnapshot, setVoiceUndoSnapshot] = useState<{
    detailValues: typeof initialDetailValues;
    parties: TransactionParty[];
    checkedFields: string[];
    pdfFieldValues: Record<string, string>;
  } | null>(null);
  const [signatureRequiredFieldIds] = useState<SignatureRequiredFieldIds>(() =>
    buildSignatureDemoRequiredFields(
      linkedTextValues(initialDetailValues),
      linkedCheckedFields(initialDetailValues),
    ),
  );
  const [activePdfField, setActivePdfField] = useState<{
    documentCode: PdfDocumentCode;
    stageKey: string;
    field: PdfFieldDefinition;
  } | null>(null);
  const [linkedHighlightId, setLinkedHighlightId] = useState<string | null>(null);
  const [pendingLinkedTarget, setPendingLinkedTarget] =
    useState<DetailPdfLink | null>(null);
  const [pendingSignatureField, setPendingSignatureField] = useState<{
    documentCode: PdfDocumentCode;
    stageKey: string;
    field: PdfFieldDefinition;
  } | null>(null);
  const [transactionNameOverride, setTransactionNameOverride] = useState<
    string | null
  >(null);
  const [transactionNameDraft, setTransactionNameDraft] = useState<
    string | null
  >(null);
  const [pdf, setPdf] = useState<PdfSelection>({
    src: "/forms/highlighted/AD_Disclosure_Real_Estate_Agency_Relationship_Buyer-1.2-highlighted.pdf",
    page: 1,
    label: "AD",
    title: "Disclosure Regarding Real Estate Agency Relationship (Buyer)",
  });
  const canvasRef = useRef<HTMLElement | null>(null);
  const stageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const linkedHighlightTimerRef = useRef<number | null>(null);
  const activePacketPageIndex = Math.max(
    0,
    documentPages.findIndex(
      (page) => page.label === pdf.label && page.page === pdf.page,
    ),
  );

  const selectPanel = (
    nextPanel: "forms" | "assistant" | "details" | "parties",
  ) => {
    if (panel === nextPanel && panelOpen) {
      setPanelOpen(false);
      return;
    }
    setPanel(nextPanel);
    setPanelOpen(true);
  };

  useEffect(() => {
    const compactViewport = window.matchMedia("(max-width: 900px)");
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
    setActivePdfField((current) =>
      current?.stageKey === pageKey(closest) ? current : null,
    );
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
    setActivePdfField(null);
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

  const applyVoiceUpdates = (
    scope: VoiceFillScope,
    proposals: VoiceProposal[],
  ) => {
    setVoiceUndoSnapshot({
      detailValues: { ...detailValues },
      parties: parties.map((party) => ({
        ...party,
        values: { ...party.values },
      })),
      checkedFields: [...checkedFields],
      pdfFieldValues: { ...pdfFieldValues },
    });
    const updates = proposals.flatMap((proposal) => proposal.updates);
    const detailUpdates = updates.filter((update) => update.target === "detail");
    const detailPatch = Object.fromEntries(
      detailUpdates.map((update) => [update.key, update.value]),
    );
    const nextValues = { ...detailValues, ...detailPatch };
    const detailKeys = new Set(detailUpdates.map((update) => update.key));
    const affectedLinks = detailPdfLinks.filter((link) =>
      link.detailKeys.some((key) => detailKeys.has(key)),
    );
    const scopedLinks =
      scope === "document"
        ? affectedLinks.filter((link) => link.form === pdf.label)
        : affectedLinks;

    if (scope !== "document") {
      setDetailValues(nextValues);
      const partyUpdates = updates.filter(
        (update) => update.target === "party" && update.partyId,
      );
      if (partyUpdates.length > 0) {
        setParties((current) =>
          current.map((party) => {
            const patch = Object.fromEntries(
              partyUpdates
                .filter((update) => update.partyId === party.id)
                .map((update) => [update.key, update.value]),
            );
            return Object.keys(patch).length > 0
              ? { ...party, values: { ...party.values, ...patch } }
              : party;
          }),
        );
      }
    }

    setPdfFieldValues((current) => {
      const next = { ...current };
      scopedLinks
        .filter((link) => link.kind !== "checkbox")
        .forEach((link) => {
          next[linkedPdfId(link)] = String(link.resolve(nextValues));
        });
      return next;
    });
    setCheckedFields((current) => {
      const next = new Set(current);
      scopedLinks
        .filter((link) => link.kind === "checkbox")
        .forEach((link) => {
          const id = linkedPdfId(link);
          if (Boolean(link.resolve(nextValues))) next.add(id);
          else next.delete(id);
        });
      return [...next];
    });

    setNotice(
      scope === "document"
        ? `Voice Fill updated ${scopedLinks.length} mapped fields in ${pdf.label}.`
        : `Voice Fill saved ${proposals.length} reviewed ${proposals.length === 1 ? "value" : "values"} to the transaction${affectedLinks.length > 0 ? ` and updated ${affectedLinks.length} mapped fields` : ""}.`,
    );
  };

  const undoVoiceUpdates = () => {
    if (!voiceUndoSnapshot) return;
    setDetailValues(voiceUndoSnapshot.detailValues);
    setParties(voiceUndoSnapshot.parties);
    setCheckedFields(voiceUndoSnapshot.checkedFields);
    setPdfFieldValues(voiceUndoSnapshot.pdfFieldValues);
    setVoiceUndoSnapshot(null);
    setNotice("Voice Fill changes were undone. Previous values restored.");
  };

  const updateSignaturePickerField = (
    documentCode: PdfDocumentCode,
    field: PdfFieldDefinition,
    value: string | boolean,
  ) => {
    const id = `${documentCode}:${field.id}`;
    if (field.kind === "checkbox") {
      setCheckedFields((current) => {
        const next = new Set(current);
        if (value) next.add(id);
        else next.delete(id);
        return [...next];
      });
      return;
    }

    const textValue = String(value);
    const { self, siblings } = siblingLinksForPdfField(
      documentCode,
      field.id,
    );
    if (self) {
      if (self.detailKeys.length === 1) {
        updateDetailValue(self.detailKeys[0], textValue);
      }
      setPdfFieldValues((current) => {
        const next = { ...current };
        [self, ...siblings].forEach((link) => {
          next[linkedPdfId(link)] = textValue;
        });
        return next;
      });
      return;
    }
    setPdfFieldValues((current) => ({ ...current, [id]: textValue }));
  };

  const linkedConflicts = useMemo(
    () => findLinkedConflicts(detailValues, pdfFieldValues, checkedFields),
    [detailValues, pdfFieldValues, checkedFields],
  );

  const fillStatusByDocument = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(pdfFieldsByDocument) as PdfDocumentCode[]).map((code) => {
          const fields = pdfFieldsByDocument[code];
          const filled = fields.filter((field) => {
            const id = `${code}:${field.id}`;
            if (field.kind === "checkbox") return checkedFields.includes(id);
            return Boolean((pdfFieldValues[id] ?? field.value ?? "").trim());
          }).length;
          return [code, { filled, total: fields.length }];
        }),
      ) as Record<PdfDocumentCode, { filled: number; total: number }>,
    [checkedFields, pdfFieldValues],
  );

  // Only documents that are actually in the transaction right now.
  const signatureReadyDocuments = useMemo(
    () =>
      transactionDocuments
        .map((entry) => parseTransactionDocument(entry).code)
        .filter((code) => isPdfDocumentCode(code))
        .filter((code) =>
          signatureDocumentIsComplete(
            code as PdfDocumentCode,
            pdfFieldValues,
            checkedFields,
            signatureRequiredFieldIds,
          ),
        ) as PdfDocumentCode[],
    [
      checkedFields,
      pdfFieldValues,
      signatureRequiredFieldIds,
      transactionDocuments,
    ],
  );

  const openFirstIncompleteField = (documentCode: PdfDocumentCode) => {
    const field = pdfFieldsByDocument[documentCode].find((candidate) => {
      if (isSigningDateField(documentCode, candidate)) return false;
      const id = `${documentCode}:${candidate.id}`;
      if (candidate.kind === "checkbox") return !checkedFields.includes(id);
      return !(pdfFieldValues[id] ?? candidate.value ?? "").trim();
    });
    if (!field) {
      setNotice(`${documentCode} has no editable fields left to complete.`);
      return;
    }
    const page = documentPages.find(
      (candidate) =>
        candidate.label === documentCode && candidate.page === field.page,
    );
    if (!page) {
      setNotice(`${documentCode} page ${field.page} is not in this transaction packet.`);
      return;
    }
    const stageKey = pageKey(page);
    setActivePdfField(null);
    setPdf(page);
    setPendingSignatureField({ documentCode, stageKey, field });
    stageRefs.current[stageKey]?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  };

  useEffect(() => {
    if (
      !pendingSignatureField ||
      pdf.label !== pendingSignatureField.documentCode ||
      pdf.page !== pendingSignatureField.field.page
    ) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const targetId = linkedPdfFieldDomId({
        form: pendingSignatureField.documentCode,
        fieldId: pendingSignatureField.field.id,
      });
      const fieldElement = document.getElementById(targetId);
      const canvas = canvasRef.current;
      if (!fieldElement || !canvas) return;
      window.history.replaceState(null, "", `#${targetId}`);
      const fieldRect = fieldElement.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const centeredTop =
        canvas.scrollTop +
        fieldRect.top -
        canvasRect.top -
        (canvas.clientHeight - fieldRect.height) / 2;
      canvas.scrollTo({ top: Math.max(0, centeredTop), behavior: "auto" });
      fieldElement.focus({ preventScroll: true });
      setLinkedHighlightId(targetId);
      if (pendingSignatureField.field.kind !== "checkbox") {
        setActivePdfField(pendingSignatureField);
      }
      if (linkedHighlightTimerRef.current !== null) {
        window.clearTimeout(linkedHighlightTimerRef.current);
      }
      linkedHighlightTimerRef.current = window.setTimeout(
        () => setLinkedHighlightId(null),
        6000,
      );
      setNotice(
        `Opened the next incomplete field in ${pendingSignatureField.documentCode}, page ${pendingSignatureField.field.page}.`,
      );
      setPendingSignatureField(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pdf.label, pdf.page, pendingSignatureField]);

  const goToLinkedField = (target: DetailPdfLink) => {
    const page = documentPages.find(
      (item) => item.label === target.form && item.page === target.page,
    );
    if (!page) {
      setNotice(`${target.form} page ${target.page} is not in this transaction packet.`);
      return;
    }
    setActivePdfField(null);
    setPdf(page);
    setPendingLinkedTarget(target);
    stageRefs.current[pageKey(page)]?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  };

  // Linked fields on distant pages are intentionally absent until their page
  // enters the three-page mount window. Reveal them after React mounts it.
  useEffect(() => {
    if (
      !pendingLinkedTarget ||
      pdf.label !== pendingLinkedTarget.form ||
      pdf.page !== pendingLinkedTarget.page
    ) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const targetId = linkedPdfFieldDomId(pendingLinkedTarget);
      const field = document.getElementById(targetId);
      const canvas = canvasRef.current;
      if (!field || !canvas) {
        setNotice(
          `The linked field in ${pendingLinkedTarget.form} page ${pendingLinkedTarget.page} is unavailable.`,
        );
        setPendingLinkedTarget(null);
        return;
      }
      window.history.replaceState(null, "", `#${targetId}`);
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
      setNotice(
        `Opened ${pendingLinkedTarget.label} · ${pendingLinkedTarget.form} page ${pendingLinkedTarget.page}`,
      );
      setPendingLinkedTarget(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pdf.label, pdf.page, pendingLinkedTarget]);

  const transactionName = transactionNameOverride ?? activeTransactionName;
  const saveTransactionName = () => {
    const nextName = transactionNameDraft?.trim();
    if (!nextName) return;
    setTransactionNameOverride(nextName);
    setTransactionNameDraft(null);
  };

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
      className={`form-editor oq-editor oq-zoom-${zoom.toLowerCase().replace(" ", "-")} ${panelOpen ? "" : "oq-panel-collapsed"} ${activePdfField ? "oq-field-editing" : ""}`}
    >
      <header className="fe-heading">
        <EditorNavigationFlyout />
        <h1 className="fe-title">
          {transactionNameDraft === null ? (
            <>
              <span>{transactionName}</span>
              <button
                type="button"
                aria-label="Edit transaction name"
                onClick={() => setTransactionNameDraft(transactionName)}
              >
                <Icon name="edit" size={15} />
              </button>
            </>
          ) : (
            <span className="oq-title-editor">
              <input
                autoFocus
                aria-label="Transaction name"
                maxLength={80}
                value={transactionNameDraft}
                onChange={(event) => setTransactionNameDraft(event.target.value)}
                onFocus={(event) => event.currentTarget.select()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveTransactionName();
                  }
                  if (event.key === "Escape") {
                    setTransactionNameDraft(null);
                  }
                }}
              />
              <button
                type="button"
                className="oq-title-save"
                aria-label="Save transaction name"
                disabled={!transactionNameDraft.trim()}
                onClick={saveTransactionName}
              >
                <Icon name="check" size={17} />
              </button>
            </span>
          )}
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
            aria-label="Download document"
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
            aria-label="Request signatures"
            onClick={() => setSignaturePickerOpen(true)}
          >
            <Icon name="sign" />
            <span>Sign</span>
          </button>
        </div>
      </div>
      <div className="fe-content">
        <section className="fe-canvas" ref={canvasRef}>
          {documentPages.map((item, pageIndex) => {
            const documentCode =
              item.label === "AD" || item.label === "BRBC" || item.label === "PRBS"
                ? item.label
                : null;
            const stageKey = pageKey(item);
            const isActivePage = pageIndex === activePacketPageIndex;
            const hasOpenFieldEditor = activePdfField?.stageKey === stageKey;
            const shouldMountPage =
              Math.abs(pageIndex - activePacketPageIndex) <=
              PDF_PAGE_MOUNT_RADIUS;
            const pageFields = documentCode
              ? pdfFieldsByDocument[documentCode].filter(
                  (field) => field.page === item.page,
                )
              : [];
            return (
              <div
                className={`oq-pdf-stage ${isActivePage ? "is-active" : ""} ${hasOpenFieldEditor ? "has-open-field-editor" : ""}`}
                key={stageKey}
                data-page={stageKey}
                ref={(node) => {
                  stageRefs.current[stageKey] = node;
                }}
              >
                {shouldMountPage ? (
                  <Image
                    className="oq-pdf-frame"
                    src={previewImage(item)}
                    alt={`${item.title}, page ${item.page}`}
                    width={1224}
                    height={1584}
                    loading={isActivePage ? "eager" : "lazy"}
                    fetchPriority={isActivePage ? "high" : "low"}
                    unoptimized
                  />
                ) : (
                  <div className="oq-pdf-placeholder" aria-hidden="true" />
                )}
                {shouldMountPage && documentCode &&
                  pageFields.map((field) => {
                    const id = `${documentCode}:${field.id}`;
                    const value = pdfFieldValues[id] ?? field.value ?? "";
                    const checked = checkedFields.includes(id);
                    const signingDate = isSigningDateField(
                      documentCode,
                      field,
                    );
                    const domId = linkedPdfFieldDomId({
                      form: documentCode,
                      fieldId: field.id,
                    });
                    const linked = isLinkedPdfField(documentCode, field.id);
                    const isEditing =
                      activePdfField?.stageKey === stageKey &&
                      activePdfField.documentCode === documentCode &&
                      activePdfField.field.id === field.id;
                    if (signingDate) {
                      // Filled in by whichever e-sign provider the transaction
                      // runs through, so it stays empty and non-editable here.
                      return (
                        <span
                          key={id}
                          className="oq-pdf-field is-signing-date"
                          style={{
                            left: `${field.left}%`,
                            top: `${field.top}%`,
                            width: `${field.width}%`,
                            height: `${field.height}%`,
                          }}
                          title="Added automatically when the document is signed"
                          aria-hidden="true"
                        />
                      );
                    }
                    return (
                      <button
                        key={id}
                        id={domId}
                        className={`oq-pdf-field ${field.kind === "checkbox" ? "is-checkbox" : ""} ${field.kind === "signature" ? "is-signature" : ""} ${linked ? "is-linked" : ""} ${checked ? "checked" : ""} ${value ? "has-value" : ""} ${isEditing ? "is-editing" : ""} ${linkedHighlightId === domId ? "is-linked-target" : ""}`}
                        style={{
                          left: `${field.left}%`,
                          top: `${field.top}%`,
                          width: `${field.width}%`,
                          height: `${field.height}%`,
                        }}
                        title={
                          linked
                            ? `${pdfFieldLabel(field)} — shared with other forms`
                            : pdfFieldLabel(field)
                        }
                        data-field-kind={field.kind}
                        data-document-code={documentCode}
                        data-field-value={value}
                        aria-label={
                          field.kind === "checkbox"
                            ? `Toggle ${pdfFieldLabel(field)}`
                            : `Fill ${pdfFieldLabel(field)}`
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
                        {value ? (
                          <span>{displayPdfFieldValue(field, value)}</span>
                        ) : null}
                      </button>
                    );
                  })}
                {shouldMountPage && activePdfField?.stageKey === stageKey && (
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
                    onSave={(value, scope) => {
                      const { self, siblings } = siblingLinksForPdfField(
                        activePdfField.documentCode,
                        activePdfField.field.id,
                      );
                      if (scope === "everywhere" && self) {
                        // One transaction value behind several printed fields:
                        // write it back to the record when the mapping is 1:1,
                        // and mirror it into every field that shares it.
                        if (self.detailKeys.length === 1) {
                          updateDetailValue(self.detailKeys[0], value);
                        }
                        setPdfFieldValues((current) => {
                          const next = { ...current };
                          [self, ...siblings].forEach((link) => {
                            next[linkedPdfId(link)] = value;
                          });
                          return next;
                        });
                        setNotice(
                          `Updated ${siblings.length + 1} linked fields across ${[
                            ...new Set([self, ...siblings].map((l) => l.form)),
                          ].join(", ")}.`,
                        );
                      } else {
                        const id = `${activePdfField.documentCode}:${activePdfField.field.id}`;
                        setPdfFieldValues((current) => ({ ...current, [id]: value }));
                      }
                      setActivePdfField(null);
                    }}
                  />
                )}
              </div>
            );
          })}
          <PageThumbnailRail
            activeKey={pageKey(pdf)}
            currentDocumentCode={pdf.label}
            onSelect={goToPage}
          />
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
            className={`fe-context ${panel !== "assistant" ? "oq-context-headless" : ""}`}
          >
            {panel === "assistant" && (
              <header className="oq-panel-heading">
                <h2>Assistant</h2>
                <button
                  className="oq-panel-close"
                  aria-label="Close assistant panel"
                  onClick={() => setPanelOpen(false)}
                >
                  <Icon name="close" />
                </button>
              </header>
            )}
            {panel === "forms" ? (
              <FormsPanel
                activeLabel={pdf.label}
                documents={transactionDocuments}
                onDocumentsChange={setTransactionDocuments}
                pdfFieldValues={pdfFieldValues}
                checkedFields={checkedFields}
                fillStatusByDocument={fillStatusByDocument}
                onFeedback={setNotice}
                onOpen={openDocument}
                onClose={() => setPanelOpen(false)}
              />
            ) : panel === "assistant" ? (
              <AssistantPanel
                key={pdf.label}
                documentLabel={pdf.label}
                documentTitle={pdf.title}
                page={pdf.page}
                transactionValues={detailValues}
                parties={parties}
                onApplyVoice={applyVoiceUpdates}
                onUndoVoice={undoVoiceUpdates}
                onShowAffectedField={goToLinkedField}
              />
            ) : panel === "parties" ? (
              <PartiesPanel
                onAddParty={() => setPartyOpen(true)}
                parties={parties}
                onPartiesChange={setParties}
                values={detailValues}
                onChange={updateDetailValue}
                onNavigate={goToLinkedField}
                onClose={() => setPanelOpen(false)}
              />
            ) : (
              <DetailsPanel
                values={detailValues}
                onChange={updateDetailValue}
                onNavigate={goToLinkedField}
                conflicts={linkedConflicts}
                onClose={() => setPanelOpen(false)}
              />
            )}
          </aside>
        )}
        <nav className="fe-mode-rail" aria-label="Workspace modes">
          <button
            className={panel === "details" && panelOpen ? "active" : ""}
            aria-pressed={panel === "details" && panelOpen}
            aria-label="Toggle transaction details panel"
            onClick={() => selectPanel("details")}
          >
            <Icon name="info" />
            <span>Details</span>
          </button>
          <button
            className={panel === "parties" && panelOpen ? "active" : ""}
            aria-pressed={panel === "parties" && panelOpen}
            aria-label="Toggle parties panel"
            onClick={() => selectPanel("parties")}
          >
            <Icon name="parties" />
            <span>Parties</span>
          </button>
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
        </nav>
      </div>
      {partyOpen && <PartyModal onClose={() => setPartyOpen(false)} />}
      {signaturePickerOpen && (
        <SignatureDocumentPicker
          documents={transactionDocuments}
          initialDocuments={signatureDocuments}
          pdfFieldValues={pdfFieldValues}
          checkedFields={checkedFields}
          requiredFieldIdsByDocument={signatureRequiredFieldIds}
          onClose={() => setSignaturePickerOpen(false)}
          onUpdateField={updateSignaturePickerField}
          onEditDocument={(document, selectedDocuments) => {
            setSignatureDocuments(selectedDocuments);
            setSignaturePickerOpen(false);
            openFirstIncompleteField(document);
          }}
          onContinue={(documents) => {
            setSignatureDocuments(documents);
            setSignaturePickerOpen(false);
            setSignatureOpen(true);
          }}
        />
      )}
      {signatureOpen && (
        <SignaturePackageFlow
          currentDocumentCode={pdf.label}
          selectedDocuments={signatureDocuments}
          eligibleDocuments={signatureReadyDocuments}
          onClose={() => setSignatureOpen(false)}
          onContinue={(document) => {
            setSignatureOpen(false);
            setNotice(
              `Signature request sent successfully. ${document} is now awaiting signatures.`,
            );
          }}
        />
      )}
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
