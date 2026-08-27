export type FieldSource = "empty" | "file" | "voice" | "review" | "manual";

export type RpaField = {
  key: string;
  label: string;
  value: string;
  source: FieldSource;
};

export type RpaSection = {
  key: string;
  label: string;
  fields: RpaField[];
};

/** Simplified RPA used by the assistant preview — one screen per section. */
export const rpaSections: RpaSection[] = [
  {
    key: "parties",
    label: "Parties",
    fields: [
      { key: "buyer1", label: "Buyer 1", value: "", source: "empty" },
      { key: "buyer2", label: "Buyer 2", value: "", source: "empty" },
      { key: "seller", label: "Seller", value: "", source: "empty" },
    ],
  },
  {
    key: "property",
    label: "Property",
    fields: [
      { key: "address", label: "Street address", value: "", source: "empty" },
      { key: "city", label: "City", value: "", source: "empty" },
      { key: "county", label: "County", value: "", source: "empty" },
    ],
  },
  {
    key: "price",
    label: "Price & financing",
    fields: [
      { key: "offerPrice", label: "Offer price", value: "", source: "empty" },
      { key: "loanType", label: "Loan type", value: "", source: "empty" },
      { key: "downPayment", label: "Down payment", value: "", source: "empty" },
    ],
  },
  {
    key: "deposits",
    label: "Deposits",
    fields: [
      { key: "initialDeposit", label: "Initial deposit", value: "", source: "empty" },
      { key: "increasedDeposit", label: "Increased deposit", value: "", source: "empty" },
    ],
  },
  {
    key: "contingencies",
    label: "Contingencies",
    fields: [
      { key: "inspection", label: "Inspection contingency", value: "", source: "empty" },
      { key: "appraisal", label: "Appraisal deadline", value: "", source: "empty" },
      { key: "loanApproval", label: "Loan approval deadline", value: "", source: "empty" },
    ],
  },
  {
    key: "dates",
    label: "Key dates",
    fields: [
      { key: "closeOfEscrow", label: "Close of escrow", value: "", source: "empty" },
      { key: "possession", label: "Possession", value: "", source: "empty" },
    ],
  },
  {
    key: "signatures",
    label: "Signatures",
    fields: [
      { key: "buyerSignature", label: "Buyer signature", value: "", source: "empty" },
      { key: "signedOn", label: "Signed on", value: "", source: "empty" },
    ],
  },
];

/** Fields the shared transaction file also writes onto other forms. */
export const spreadFields = [
  { form: "BRBC", field: "Purchase price", value: "$850,000" },
  { form: "BRBC", field: "Compensation amount", value: "$21,250" },
  { form: "BRBC", field: "Close of escrow", value: "10/15/26" },
  { form: "AD", field: "Purchase price", value: "$850,000" },
  { form: "AD", field: "Close of escrow", value: "10/15/26" },
  { form: "SPQ", field: "Purchase price", value: "$850,000" },
  { form: "SPQ", field: "Close of escrow", value: "10/15/26" },
  { form: "RPA", field: "Offer price", value: "$850,000" },
  { form: "RPA", field: "Initial deposit", value: "$25,500" },
  { form: "RPA", field: "Close of escrow", value: "10/15/26" },
  { form: "RPA", field: "Balance of down payment", value: "$144,500" },
];

export const dueThisWeek = [
  { title: "45 Ninth Street", note: "Inspection contingency expires", due: "Thursday" },
  { title: "12 Harbor Lane", note: "Close of escrow", due: "Friday" },
];
