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

function SignaturePackageFlow({
  currentDocumentCode,
  onClose,
  onContinue,
}: {
  currentDocumentCode: string;
  onClose: () => void;
  onContinue: (document: string) => void;
}) {
  const [replaceOriginal, setReplaceOriginal] = useState(true);
  const [transactionDocument, setTransactionDocument] = useState(
    currentDocumentCode,
  );
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

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
        <span>Step 1 of 3</span>
      </header>

      <main className="oq-signature-main">
        <form
          className="oq-signature-card"
          onSubmit={(event) => {
            event.preventDefault();
            onContinue(uploadedFiles[0] ?? transactionDocument);
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
              <span className="oq-provider-check" aria-hidden="true">
                <Icon name="check" size={14} />
              </span>
              <span>
                <b>DocuSign</b>
                <small>Secure electronic signature</small>
              </span>
            </div>
          </section>

          <fieldset className="oq-signature-documents">
            <legend>Forms</legend>
            <label className="oq-replace-original">
              <input
                type="checkbox"
                checked={replaceOriginal}
                onChange={(event) => setReplaceOriginal(event.target.checked)}
              />
              <span>Replace the original with the completed version</span>
            </label>

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
              <select
                aria-label="Add a document from this transaction"
                value={transactionDocument}
                onChange={(event) => setTransactionDocument(event.target.value)}
              >
                <option value="AD">[AD] Disclosure Regarding Agency Relationship</option>
                <option value="BRBC">[BRBC] Buyer Representation Agreement</option>
                <option value="PRBS">[PRBS] Possible Representation</option>
              </select>
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
  const linkedForms = [
    ...new Set([documentCode, ...siblings.map((link) => link.form)]),
  ];
  const placeAbove = field.top > 68;
  const anchoredStyle: React.CSSProperties = {
    top: `${placeAbove ? field.top : field.top + field.height}%`,
    transform: placeAbove
      ? "translateY(calc(-100% - 8px)) translateY(var(--oq-popover-nudge, 0px))"
      : "translateY(8px) translateY(var(--oq-popover-nudge, 0px))",
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
      const nudge =
        popoverRect.top < topLimit
          ? topLimit - popoverRect.top
          : popoverRect.bottom > bottomLimit
            ? bottomLimit - popoverRect.bottom
            : 0;
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
            <span>
              <b>Apply to all matching forms</b>
              <small>
                Update {siblings.length + 1} matching{" "}
                {siblings.length === 0 ? "field" : "fields"} across{" "}
                {linkedForms.length} {linkedForms.length === 1 ? "form" : "forms"}:{" "}
                {linkedForms.join(", ")}
              </small>
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
  onClose,
}: {
  form: AvailableTransactionForm;
  onClose: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="oq-preview-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
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
          <div className="oq-preview-canvas">
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
          <span>{currentPage} / {form.pages} {form.pages === 1 ? "page" : "pages"}</span>
          <small>Preview only</small>
        </footer>
      </section>
    </div>
  );
}

function FormsPanel({
  activeLabel,
  fillStatusByDocument,
  onFeedback,
  onOpen,
  onClose,
}: {
  activeLabel: string;
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
  const [docs, setDocs] = useState([
    "[AD] Disclosure Regarding Real Estate Agency Relationship (Buyer)",
    "[BRBC] Buyer Representation and Broker Compensation Agreement",
    "[PRBS] Possible Representation of More Than One Buyer or Seller",
  ]);
  const [docStatuses] = useState<Record<string, DocumentStatus>>({
    "[AD] Disclosure Regarding Real Estate Agency Relationship (Buyer)":
      "filled",
    "[BRBC] Buyer Representation and Broker Compensation Agreement": "partial",
    "[PRBS] Possible Representation of More Than One Buyer or Seller":
      "sent_to_docusign",
  });
  const availableForms: AvailableTransactionForm[] = [
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
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [detailValues, setDetailValues] = useState(initialDetailValues);
  const [parties, setParties] = useState<TransactionParty[]>(initialParties);
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
  const [pendingLinkedTarget, setPendingLinkedTarget] =
    useState<DetailPdfLink | null>(null);
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
      className={`form-editor oq-editor oq-zoom-${zoom.toLowerCase().replace(" ", "-")} ${panelOpen ? "" : "oq-panel-collapsed"} `}
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
            onClick={() => setSignatureOpen(true)}
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
                className="oq-pdf-stage"
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
                        id={linked ? domId : undefined}
                        className={`oq-pdf-field ${field.kind === "checkbox" ? "is-checkbox" : ""} ${field.kind === "signature" ? "is-signature" : ""} ${linked ? "is-linked" : ""} ${checked ? "checked" : ""} ${value ? "has-value" : ""} ${linkedHighlightId === domId ? "is-linked-target" : ""}`}
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
                fillStatusByDocument={fillStatusByDocument}
                onFeedback={setNotice}
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
      {signatureOpen && (
        <SignaturePackageFlow
          currentDocumentCode={pdf.label}
          onClose={() => setSignatureOpen(false)}
          onContinue={(document) => {
            setSignatureOpen(false);
            setNotice(
              `Signature package prepared with ${document}. Connect the provider API to continue to recipient setup.`,
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
