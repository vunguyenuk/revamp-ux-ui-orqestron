"use client";

import type { ReactNode } from "react";
import m from "./new-transaction-modal.module.css";

export type Party = {
  name: string;
  email: string;
  phone: string;
  license?: string;
  role?: string;
};

export type Draft = {
  type: "buyer" | "seller";
  start: "forms" | "blank";
  address: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  price: string;
  apn: string;
  propertyType: string;
  buyer1: Party;
  buyer2: Party | null;
  seller: Party;
  seller2: Party | null;
  listingAgent: Party;
  firm: string;
  firmDre: string;
  office: string;
  officeCity: string;
  officeState: string;
  officeZip: string;
  fax: string;
  others: Party[];
  othersOpen: boolean;
};

export const emptyParty = (): Party => ({ name: "", email: "", phone: "" });

export const emptyDraft = (): Draft => ({
  type: "buyer",
  start: "forms",
  address: "",
  city: "",
  county: "",
  state: "",
  zip: "",
  price: "",
  apn: "",
  propertyType: "",
  buyer1: emptyParty(),
  buyer2: null,
  seller: emptyParty(),
  seller2: null,
  listingAgent: { ...emptyParty(), license: "" },
  firm: "",
  firmDre: "",
  office: "",
  officeCity: "",
  officeState: "",
  officeZip: "",
  fax: "",
  others: [],
  othersOpen: false,
});

const steps = ["Start", "Property", "Parties"] as const;

function Field({
  label,
  value,
  placeholder,
  onChange,
  wide,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={wide ? m.wide : undefined}>
      <span>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function PartyBlock({
  title,
  hint,
  required,
  party,
  onChange,
  extra,
}: {
  title: string;
  hint?: string;
  required?: boolean;
  party: Party;
  onChange: (next: Party) => void;
  extra?: ReactNode;
}) {
  return (
    <div className={m.partyBlock}>
      <b>
        {title}
        {required && <i aria-hidden="true"> *</i>}
      </b>
      {hint && <small>{hint}</small>}
      <div className={m.partyGrid}>
        <Field
          wide
          label=""
          value={party.name}
          placeholder="e.g. Priya Anand"
          onChange={(name) => onChange({ ...party, name })}
        />
        <Field
          label="Email"
          value={party.email}
          placeholder="name@example.com"
          onChange={(email) => onChange({ ...party, email })}
        />
        <Field
          label="Phone"
          value={party.phone}
          placeholder="(805) 555-0100"
          onChange={(phone) => onChange({ ...party, phone })}
        />
        {extra}
      </div>
    </div>
  );
}

export default function NewTransactionModal({
  draft,
  setDraft,
  step,
  setStep,
  mode,
  setMode,
  chat,
  canCreate,
  onCreate,
  onClose,
  captured,
}: {
  draft: Draft;
  setDraft: (updater: (current: Draft) => Draft) => void;
  step: number;
  setStep: (step: number) => void;
  mode: "form" | "assistant";
  setMode: (mode: "form" | "assistant") => void;
  chat: ReactNode;
  canCreate: boolean;
  onCreate: () => void;
  onClose: () => void;
  captured: { property: boolean; parties: boolean };
}) {
  const patch = (values: Partial<Draft>) =>
    setDraft((current) => ({ ...current, ...values }));

  const done = [true, captured.property, captured.parties];

  return (
    <div className={m.scrim} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={m.modal} role="dialog" aria-modal="true" aria-label="New transaction">
        <header className={m.head}>
          <div>
            <h2>New Transaction</h2>
            <p>Type, the property, then the parties on the deal — each party entered once</p>
          </div>
          <div className={m.modeSwitch} role="tablist" aria-label="How to fill this in">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "form"}
              className={mode === "form" ? m.modeOn : ""}
              onClick={() => setMode("form")}
            >
              Fill it in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "assistant"}
              className={mode === "assistant" ? m.modeOn : ""}
              onClick={() => setMode("assistant")}
            >
              Voice or chat
            </button>
          </div>
          <button className={m.close} type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <nav className={m.stepper} aria-label="Steps">
          {steps.map((label, index) => {
            const number = index + 1;
            const complete = done[index] && (mode === "assistant" || step > number);
            return (
              <button
                key={label}
                type="button"
                className={`${m.step} ${step === number && mode === "form" ? m.stepOn : ""} ${
                  complete ? m.stepDone : ""
                }`}
                onClick={() => {
                  setMode("form");
                  setStep(number);
                }}
              >
                <i>{complete ? "✓" : number}</i>
                {label}
              </button>
            );
          })}
        </nav>

        {mode === "assistant" ? (
          <div className={m.assistantBody}>{chat}</div>
        ) : (
          <div className={m.body}>
            {step === 1 && (
              <>
                <h3 className={m.blockTitle}>Transaction type</h3>
                <div className={m.typeToggle}>
                  <button
                    type="button"
                    className={draft.type === "buyer" ? m.typeOn : ""}
                    onClick={() => patch({ type: "buyer" })}
                  >
                    Buyer representation
                  </button>
                  <span className={m.soonWrap}>
                    <em className={m.soon}>COMING SOON</em>
                    <button type="button" disabled>
                      Seller representation
                    </button>
                  </span>
                </div>

                <h3 className={m.blockTitle}>Starting point</h3>
                <p className={m.blockCopy}>
                  Choose how this project begins. You can add or remove forms at any time
                  afterward.
                </p>
                <div className={m.startCards}>
                  <button
                    type="button"
                    className={draft.start === "forms" ? m.cardOn : ""}
                    onClick={() => patch({ start: "forms" })}
                  >
                    <b>
                      <span aria-hidden="true">▤</span> Start from forms
                      {draft.start === "forms" && <i>✓</i>}
                    </b>
                    <small>
                      Set up with the 13 core forms, ready to fill. Best if you want a standard
                      starting set — you can add or remove forms anytime.
                    </small>
                  </button>
                  <button
                    type="button"
                    className={draft.start === "blank" ? m.cardOn : ""}
                    onClick={() => patch({ start: "blank" })}
                  >
                    <b>
                      <span aria-hidden="true">▢</span> Start blank
                      {draft.start === "blank" && <i>✓</i>}
                    </b>
                    <small>
                      Create an empty project and add just the forms you need. Best if you already
                      know which forms this deal requires.
                    </small>
                  </button>
                </div>

                <p className={m.note}>
                  <span aria-hidden="true">◈</span> Next you&apos;ll add the property and the
                  parties on the deal. Every name is entered once and propagates to the matching
                  fields across all transaction forms.
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h4 className={m.sectionLabel}>PROPERTY ADDRESS</h4>
                <div className={m.grid4}>
                  <Field
                    wide
                    label="Property address"
                    value={draft.address}
                    placeholder="e.g. 1420 Grand Ave"
                    onChange={(address) => patch({ address })}
                  />
                  <Field
                    label="City"
                    value={draft.city}
                    placeholder="e.g. Ojai"
                    onChange={(city) => patch({ city })}
                  />
                  <Field
                    label="County"
                    value={draft.county}
                    placeholder="e.g. Ventura"
                    onChange={(county) => patch({ county })}
                  />
                  <Field
                    label="State"
                    value={draft.state}
                    placeholder="CA"
                    onChange={(state) => patch({ state })}
                  />
                  <Field
                    label="ZIP"
                    value={draft.zip}
                    placeholder="93023"
                    onChange={(zip) => patch({ zip })}
                  />
                  <Field
                    label="List / target price"
                    value={draft.price}
                    placeholder="$1,250,000"
                    onChange={(price) => patch({ price })}
                  />
                  <Field
                    label="APN"
                    value={draft.apn}
                    placeholder="023-114-008"
                    onChange={(apn) => patch({ apn })}
                  />
                  <Field
                    wide
                    label="Property type"
                    value={draft.propertyType}
                    placeholder="e.g. Single Family, Condo"
                    onChange={(propertyType) => patch({ propertyType })}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className={m.note}>
                  <span aria-hidden="true">⚡</span> Names auto-fill across every form, and everyone
                  named here is saved to your Contacts. Email is optional — it&apos;s only needed to
                  send someone an envelope for signature. The combined recital line is composed from
                  the buyer names.
                </p>
                <p className={m.quiet}>
                  You are recorded as the buyer&apos;s agent from your Agent Profile.
                </p>

                <h4 className={m.sectionLabel}>YOUR CLIENTS</h4>
                <PartyBlock
                  title="Buyer 1"
                  required
                  hint="Your client — fills buyer_1 and client profile fields"
                  party={draft.buyer1}
                  onChange={(buyer1) => patch({ buyer1 })}
                />
                {draft.buyer2 ? (
                  <PartyBlock
                    title="Buyer 2"
                    hint="Second buyer on the recital line"
                    party={draft.buyer2}
                    onChange={(buyer2) => patch({ buyer2 })}
                  />
                ) : (
                  <button
                    type="button"
                    className={m.addButton}
                    onClick={() => patch({ buyer2: emptyParty() })}
                  >
                    + Add second buyer
                  </button>
                )}

                <h4 className={m.sectionLabel}>COUNTER-PARTY</h4>
                <PartyBlock
                  title="Seller"
                  hint="Counter-party — often unknown at onboarding"
                  party={draft.seller}
                  onChange={(seller) => patch({ seller })}
                />
                {draft.seller2 ? (
                  <PartyBlock
                    title="Seller 2"
                    party={draft.seller2}
                    onChange={(seller2) => patch({ seller2 })}
                  />
                ) : (
                  <button
                    type="button"
                    className={m.addButton}
                    onClick={() => patch({ seller2: emptyParty() })}
                  >
                    + Add second seller
                  </button>
                )}

                <PartyBlock
                  title="Listing agent"
                  party={draft.listingAgent}
                  onChange={(listingAgent) => patch({ listingAgent })}
                  extra={
                    <Field
                      wide
                      label="License / DRE / NMLS"
                      value={draft.listingAgent.license ?? ""}
                      placeholder="e.g. DRE #01234567"
                      onChange={(license) =>
                        patch({ listingAgent: { ...draft.listingAgent, license } })
                      }
                    />
                  }
                />

                <div className={m.brokerBlock}>
                  <b>Broker Information</b>
                  <small>
                    The brokerage this agent works under. Fills the Real Estate Brokers block on the
                    forms they appear on.
                  </small>
                  <div className={m.grid2}>
                    <Field
                      wide
                      label="Brokerage firm"
                      value={draft.firm}
                      placeholder="e.g. Coastline Realty"
                      onChange={(firm) => patch({ firm })}
                    />
                    <Field
                      label="Brokerage DRE license #"
                      value={draft.firmDre}
                      placeholder="07654321"
                      onChange={(firmDre) => patch({ firmDre })}
                    />
                    <Field
                      label="Office address"
                      value={draft.office}
                      placeholder="e.g. 500 Market St, Suite 200"
                      onChange={(office) => patch({ office })}
                    />
                    <Field
                      label="City"
                      value={draft.officeCity}
                      placeholder="e.g. San Francisco"
                      onChange={(officeCity) => patch({ officeCity })}
                    />
                    <Field
                      label="State"
                      value={draft.officeState}
                      placeholder="CA"
                      onChange={(officeState) => patch({ officeState })}
                    />
                    <Field
                      label="ZIP"
                      value={draft.officeZip}
                      placeholder="94105"
                      onChange={(officeZip) => patch({ officeZip })}
                    />
                    <Field
                      label="Fax"
                      value={draft.fax}
                      placeholder="(555) 123-4568"
                      onChange={(fax) => patch({ fax })}
                    />
                  </div>
                </div>

                <div className={m.others}>
                  <button
                    type="button"
                    className={m.othersHead}
                    onClick={() => patch({ othersOpen: !draft.othersOpen })}
                    aria-expanded={draft.othersOpen}
                  >
                    OTHER PARTIES
                    <i>{draft.othersOpen ? "⌃" : "⌄"}</i>
                  </button>
                  {draft.othersOpen && (
                    <div className={m.othersBody}>
                      <small>Lender, escrow, TC, inspector, and other vendors on the deal.</small>
                      {(draft.others.length ? draft.others : [{ ...emptyParty(), role: "Lender", license: "" }]).map(
                        (party, index) => (
                          <div className={m.partyGrid} key={index}>
                            <Field
                              label="Full legal name"
                              value={party.name}
                              placeholder="e.g. Coastline Home Inspections"
                              onChange={(name) =>
                                patch({
                                  others: replaceAt(draft.others, index, { ...party, name }),
                                })
                              }
                            />
                            <label>
                              <span>Role</span>
                              <select
                                value={party.role ?? "Lender"}
                                onChange={(event) =>
                                  patch({
                                    others: replaceAt(draft.others, index, {
                                      ...party,
                                      role: event.target.value,
                                    }),
                                  })
                                }
                              >
                                <option>Lender</option>
                                <option>Escrow</option>
                                <option>Transaction coordinator</option>
                                <option>Inspector</option>
                                <option>Other</option>
                              </select>
                            </label>
                            <Field
                              label="Email"
                              value={party.email}
                              placeholder="name@example.com"
                              onChange={(email) =>
                                patch({
                                  others: replaceAt(draft.others, index, { ...party, email }),
                                })
                              }
                            />
                            <Field
                              label="Phone"
                              value={party.phone}
                              placeholder="(805) 555-0100"
                              onChange={(phone) =>
                                patch({
                                  others: replaceAt(draft.others, index, { ...party, phone }),
                                })
                              }
                            />
                            <Field
                              wide
                              label="License / DRE / NMLS"
                              value={party.license ?? ""}
                              placeholder="e.g. DRE #01234567"
                              onChange={(license) =>
                                patch({
                                  others: replaceAt(draft.others, index, { ...party, license }),
                                })
                              }
                            />
                          </div>
                        ),
                      )}
                      <button
                        type="button"
                        className={m.addParty}
                        onClick={() =>
                          patch({
                            others: [
                              ...(draft.others.length
                                ? draft.others
                                : [{ ...emptyParty(), role: "Lender", license: "" }]),
                              { ...emptyParty(), role: "Lender", license: "" },
                            ],
                          })
                        }
                      >
                        + Add party
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <footer className={m.foot}>
          {mode === "assistant" ? (
            <span className={m.footHint}>
              Speak or type — I fill the same fields. Switch to “Fill it in” any time to check them.
            </span>
          ) : (
            step > 1 && (
              <button type="button" className={m.back} onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            )
          )}
          {mode === "form" && step < 3 ? (
            <button type="button" className={m.primary} onClick={() => setStep(step + 1)}>
              Continue →
            </button>
          ) : (
            <button
              type="button"
              className={m.primary}
              disabled={!canCreate}
              onClick={onCreate}
            >
              ✓ Create project
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function replaceAt(list: Party[], index: number, value: Party) {
  const base = list.length ? [...list] : [{ ...emptyParty(), role: "Lender", license: "" }];
  base[index] = value;
  return base;
}
