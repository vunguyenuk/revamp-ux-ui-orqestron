"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./transactions.module.css";
import a from "./assistant.module.css";
import {
  dueThisWeek,
  rpaSections,
  spreadFields,
  type FieldSource,
  type RpaSection,
} from "./assistant-data";

type IconName =
  | "mic"
  | "send"
  | "close"
  | "check"
  | "chevron"
  | "form"
  | "file"
  | "stop"
  | "edit";

const iconPaths: Record<IconName, React.ReactNode> = {
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
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12l5 5L20 7" />,
  chevron: <path d="m9 7 5 5-5 5" />,
  form: (
    <>
      <path d="M6 3h9l4 4v14H6Z" />
      <path d="M15 3v5h5M9 12h6M9 16h4" />
    </>
  ),
  file: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />,
  stop: <rect x="7" y="7" width="10" height="10" rx="2" />,
  edit: (
    <>
      <path d="M4 20h4l10-10-4-4L4 16Z" />
      <path d="M14 6l4 4" />
    </>
  ),
};

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  );
}

type Card =
  | { kind: "created"; address: string; buyers: string }
  | { kind: "opened"; prefilled: { label: string; value: string }[] }
  | { kind: "spread" }
  | { kind: "conflict"; current: string; next: string; docs: number }
  | { kind: "due" };

type Msg = { id: number; role: "user" | "agent"; text?: string; card?: Card };

type Deal = { id: string; name: string; phase: string; fresh?: boolean };

const sourceLabel: Record<FieldSource, string> = {
  empty: "",
  file: "From file",
  voice: "From voice",
  review: "Needs review",
  manual: "Typed",
};

const firstQuestion =
  "Which form do you want to add first, or should I suggest the usual purchase set?";
const priceQuestion =
  "Let's start with Price & financing — offer price, deposit, and close of escrow?";
const contingencyQuestion =
  "Contingencies next — how long for inspection, appraisal, and loan approval?";

export default function TransactionWorkspace({
  phases,
  activeTransactionName,
}: {
  phases: { name: string; count: number; color: string; hasTransaction?: boolean }[];
  activeTransactionName: string;
}) {
  const [open, setOpen] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [sections, setSections] = useState<RpaSection[]>(rpaSections);
  const [formOpen, setFormOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("price");
  const [dealName, setDealName] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      role: "agent",
      text: "Tell me about the deal and I'll open the file for you. Speak or type — an address is enough to start.",
    },
  ]);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceHint, setVoiceHint] = useState("");
  const [pending, setPending] = useState(firstQuestion);
  const [resolved, setResolved] = useState<Record<number, string>>({});
  const [showSpread, setShowSpread] = useState(false);
  const [stage, setStage] = useState<"idle" | "created" | "form" | "terms" | "review">("idle");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draft, setDraft] = useState("");


  const idRef = useRef(1);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const spokenRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const silenceRef = useRef<number | null>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (silenceRef.current) window.clearTimeout(silenceRef.current);
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const push = (msg: Omit<Msg, "id">) =>
    setMessages((current) => [...current, { ...msg, id: idRef.current++ }]);

  const fill = (updates: { key: string; value: string; source: FieldSource }[]) =>
    setSections((current) =>
      current.map((section) => ({
        ...section,
        fields: section.fields.map((field) => {
          const update = updates.find((item) => item.key === field.key);
          return update ? { ...field, value: update.value, source: update.source } : field;
        }),
      })),
    );

  const sectionOf = (fieldKey: string) =>
    sections.find((section) => section.fields.some((field) => field.key === fieldKey))?.key ??
    "price";

  const filledCount = sections.reduce(
    (total, section) =>
      total + section.fields.filter((field) => field.source !== "empty").length,
    0,
  );
  const totalFields = sections.reduce((total, section) => total + section.fields.length, 0);
  const sectionsDone = sections.filter((section) =>
    section.fields.every((field) => field.source !== "empty"),
  ).length;

  const beginFieldEdit = (fieldKey: string, value: string) => {
    setEditingField(fieldKey);
    setDraft(value);
  };

  const cancelFieldEdit = () => {
    setEditingField(null);
    setDraft("");
  };

  const saveFieldEdit = (fieldKey: string, label: string) => {
    const previous = sections
      .flatMap((section) => section.fields)
      .find((field) => field.key === fieldKey);
    const value = draft.trim();
    setEditingField(null);
    setDraft("");
    if (!previous || value === previous.value) return;
    fill([{ key: fieldKey, value, source: value ? "manual" : "empty" }]);
    if (previous.value && value) {
      push({
        role: "agent",
        text: `Noted — you set ${label} to ${value} by hand, was ${previous.value}. Say "carry it across" if the other forms should follow.`,
      });
    }
  };

  /* ------------------------------------------------------------------ script */

  const reply = (prompt: string) => {
    const lower = prompt.toLowerCase();

    // 4 — interruption: answer without leaving the form
    if (/(due|deadline|expiring|expire)/.test(lower) && /(week|today|soon|any)/.test(lower)) {
      push({ role: "agent", text: "Two this week:" });
      push({ role: "agent", card: { kind: "due" } });
      push({
        role: "agent",
        text: formOpen
          ? `You were in ${sections.find((s) => s.key === activeSection)?.label ?? "the form"} — say "continue" when you're ready.`
          : 'Say "continue" to pick up where we left off.',
      });
      return;
    }

    if (/(continue|resume|go on|keep going|carry on|ok tiếp)/.test(lower)) {
      push({ role: "agent", text: `Picking up where we stopped. ${pending}` });
      return;
    }

    // 1 — start from zero
    if (/(create|start|open|new|set up)/.test(lower) && /(transaction|deal|file|escrow)/.test(lower)) {
      const addressMatch = prompt.match(/\b(?:for|at|on)\s+(.+?)(?:\s*,|\s+with\b|$)/i);
      const address = addressMatch ? addressMatch[1].trim() : "New transaction";
      const namesInPrompt = prompt.match(
        /buyers?\s+(?:are|is)\s+([A-Za-zÀ-ỹ' .-]+?)\s+and\s+([A-Za-zÀ-ỹ' .-]+?)\s*[.!]?$/i,
      );
      const soloBuyer = prompt.match(
        /buyer\s+(?:is|:)\s+([A-Za-zÀ-ỹ' .-]{3,40})\s*[.!]?$/i,
      );
      const buyerNames = namesInPrompt
        ? [namesInPrompt[1].trim(), namesInPrompt[2].trim()]
        : soloBuyer
          ? [soloBuyer[1].trim()]
          : [];
      const couple = /(married couple|husband and wife|two buyers|couple)/i.test(prompt);
      const buyers = buyerNames.length
        ? buyerNames.join(" & ")
        : couple
          ? "2 buyers, names to come"
          : "1 buyer, name to come";
      setDealName(address);
      setDeals((current) => [
        ...current,
        { id: `deal-${current.length + 1}`, name: address, phase: "New Leads", fresh: true },
      ]);
      setStage("created");
      fill([
        { key: "address", value: address, source: "file" },
        { key: "city", value: "Los Angeles", source: "file" },
        { key: "county", value: "Los Angeles", source: "file" },
        {
          key: "buyer1",
          value: buyerNames[0] ?? "",
          source: buyerNames[0] ? ("voice" as FieldSource) : ("empty" as FieldSource),
        },
        {
          key: "buyer2",
          value: buyerNames[1] ?? "",
          source: buyerNames[1] ? ("voice" as FieldSource) : ("empty" as FieldSource),
        },
      ]);
      push({ role: "agent", card: { kind: "created", address, buyers } });
      push({
        role: "agent",
        text: buyerNames.length
          ? `Created and opened. ${buyerNames.join(" and ")} are on the transaction file with the property — no form will ask for them again. ${firstQuestion}`
          : `Created and opened. The property is on the file. I still need the buyer names — say them any time. ${firstQuestion}`,
      });
      setPending(firstQuestion);
      return;
    }

    // buyer names
    const namesMatch = prompt.match(/(?:buyers?|they)\s*(?:are|is|:)?\s*([A-Za-zÀ-ỹ' .-]+?)\s+and\s+([A-Za-zÀ-ỹ' .-]+?)\s*[.!]?$/i);
    if (namesMatch && stage !== "idle") {
      const [, one, two] = namesMatch;
      fill([
        { key: "buyer1", value: one.trim(), source: "voice" },
        { key: "buyer2", value: two.trim(), source: "voice" },
      ]);
      setActiveSection("parties");
      push({
        role: "agent",
        text: `Both buyers are on the file now — ${one.trim()} and ${two.trim()}. Every form that needs a buyer name will use them. ${pending}`,
      });
      return;
    }

    // 2 — handoff into the form
    if (/(add|attach|open|pull up)/.test(lower) && /(rpa|purchase agreement)/.test(lower)) {
      setFormOpen(true);
      setStage("form");
      setActiveSection("price");
      setPending(priceQuestion);
      push({
        role: "agent",
        card: {
          kind: "opened",
          prefilled: [
            { label: "Street address", value: dealName || "123 Fifth Street" },
            { label: "City / County", value: "Los Angeles" },
            { label: "Buyers", value: "2 buyers on file" },
          ],
        },
      });
      push({
        role: "agent",
        text: `RPA is open and I'm working inside it now. Property and parties came off the file — I won't ask twice. Six sections left. ${priceQuestion}`,
      });
      return;
    }

    // 5 — changing a value that already exists
    const changeMatch = prompt.match(
      /(?:change|update|make|set)\s+(?:the\s+)?price\s+(?:to\s+)?\$?([\d,.]+)\s*(k|thousand|million|m)?/i,
    );
    const currentPrice = sections
      .flatMap((section) => section.fields)
      .find((field) => field.key === "offerPrice")?.value;
    if (changeMatch && currentPrice) {
      const next = spokenAmount(changeMatch[1], changeMatch[2]);
      push({
        role: "agent",
        card: { kind: "conflict", current: currentPrice, next, docs: 8 },
      });
      return;
    }

    // 3 — one sentence, several values
    const priceMatch = prompt.match(
      /(?:price|offer)\D{0,12}\$?([\d,.]+)\s*(k|thousand|million|m)?/i,
    );
    const depositMatch = prompt.match(/deposit\D{0,12}(\d+(?:\.\d+)?)\s*%/i);
    const depositCash = prompt.match(/deposit\D{0,12}\$?([\d,.]+)\s*(k|thousand)?/i);
    const escrowMatch = prompt.match(
      /(?:close|closing|escrow)\D{0,18}(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i,
    );
    if (priceMatch || depositMatch || escrowMatch) {
      const updates: { key: string; value: string; source: FieldSource }[] = [];
      const wrote: string[] = [];
      let price = 0;
      if (priceMatch) {
        const value = spokenAmount(priceMatch[1], priceMatch[2]);
        price = Number(value.replace(/[^\d]/g, ""));
        updates.push({ key: "offerPrice", value, source: "voice" });
        wrote.push(`offer price ${value}`);
      }
      if (depositMatch) {
        const base = price || 850000;
        const cash = Math.round((base * Number(depositMatch[1])) / 100);
        updates.push({
          key: "initialDeposit",
          value: `$${cash.toLocaleString("en-US")} (${depositMatch[1]}%)`,
          source: "voice",
        });
        wrote.push(`deposit ${depositMatch[1]}%`);
      } else if (depositCash) {
        const value = spokenAmount(depositCash[1], depositCash[2]);
        updates.push({ key: "initialDeposit", value, source: "voice" });
        wrote.push(`deposit ${value}`);
      }
      if (escrowMatch) {
        const month = String(
          [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
          ].indexOf(escrowMatch[1].toLowerCase()) + 1,
        ).padStart(2, "0");
        const value = `${month}/${escrowMatch[2].padStart(2, "0")}/26`;
        updates.push({ key: "closeOfEscrow", value, source: "voice" });
        wrote.push(`close of escrow ${value}`);
      }
      fill(updates);
      setActiveSection(sectionOf(updates[0].key));
      setStage("terms");
      push({
        role: "agent",
        text: `Written to the RPA — ${wrote.join(", ")}.`,
      });
      if (priceMatch || escrowMatch) {
        push({ role: "agent", card: { kind: "spread" } });
      } else {
        setPending(contingencyQuestion);
        push({ role: "agent", text: contingencyQuestion });
      }
      return;
    }

    // 6 — a field that lives on one form only
    const inspectionMatch = prompt.match(
      /inspection\D{0,20}(\d+)\s*(?:days?|business days?)/i,
    );
    if (inspectionMatch) {
      fill([
        { key: "inspection", value: `${inspectionMatch[1]} days`, source: "voice" },
      ]);
      setActiveSection("contingencies");
      setPending("Two items left in Contingencies — appraisal deadline and loan approval deadline?");
      push({
        role: "agent",
        text: `Done — ${inspectionMatch[1]} days. That field only exists on the RPA, so there is nothing to carry across. Two items left in Contingencies: appraisal deadline and loan approval deadline.`,
      });
      return;
    }

    push({
      role: "agent",
      text: formOpen
        ? `I didn't catch a value in that. ${pending}`
        : "Give me an address to start — for example: create a new transaction for 123 Fifth Street, buyers are a married couple.",
    });
  };

  const send = (value = text) => {
    const prompt = value.trim();
    if (!prompt || thinking) return;
    push({ role: "user", text: prompt });
    setText("");
    setVoiceHint("");
    spokenRef.current = false;
    setThinking(true);
    timerRef.current = window.setTimeout(() => {
      setThinking(false);
      reply(prompt);
    }, 460);
  };

  /* ------------------------------------------------------------------- voice */

  const suggestions = (): string[] => {
    if (stage === "idle")
      return [
        "Create a new transaction for 123 Fifth Street, buyers are David and Mai Nguyen",
      ];
    if (stage === "created")
      return ["Add the RPA and fill it in for me", "What's due this week?"];
    if (stage === "form")
      return [
        "Price 850 thousand, deposit 3%, close escrow October 15",
        "Hold on — anything due this week?",
      ];
    return [
      "Change the price to 875",
      "Inspection contingency 12 days",
      "What's due this week?",
    ];
  };

  const stopSimulation = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (silenceRef.current) window.clearTimeout(silenceRef.current);
    timerRef.current = null;
    silenceRef.current = null;
  };

  /** Demo dictation: reveals the line word by word, then sends it like real speech. */
  const simulateSpeech = (line: string, hint: string) => {
    const words = line.split(" ");
    setRecording(true);
    setVoiceHint(hint);
    setText("");
    let index = 0;
    const tick = () => {
      index += 1;
      setText(words.slice(0, index).join(" "));
      if (index < words.length) {
        timerRef.current = window.setTimeout(tick, 80);
        return;
      }
      timerRef.current = window.setTimeout(() => {
        setRecording(false);
        setVoiceHint("");
        spokenRef.current = true;
        send(words.join(" "));
      }, 520);
    };
    timerRef.current = window.setTimeout(tick, 320);
  };

  const toggleVoice = () => {
    if (recording) {
      const hadText = text.trim().length > 0;
      stopSimulation();
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setRecording(false);
      if (hadText) {
        setVoiceHint("Stopped — press send when it looks right.");
        return;
      }
      // nothing was picked up: fall back to the scripted line so the demo never dead-ends
      simulateSpeech(suggestions()[0], "Nothing heard — playing the demo line");
      return;
    }

    const demoLine = suggestions()[0];
    const w = window as unknown as {
      SpeechRecognition?: new () => never;
      webkitSpeechRecognition?: new () => never;
    };
    const Recognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Recognition) {
      simulateSpeech(demoLine, "Listening… (demo voice)");
      return;
    }

    type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
    const recognition = new (Recognition as unknown as new () => {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: (event: RecognitionEvent) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    })();
    let heard = false;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      if (!transcript) return;
      heard = true;
      if (silenceRef.current) window.clearTimeout(silenceRef.current);
      spokenRef.current = true;
      setText(transcript);
      setVoiceHint("");
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setRecording(false);
      simulateSpeech(demoLine, "No microphone here — playing the demo line");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (heard) {
        setRecording(false);
        setVoiceHint("");
        return;
      }
      simulateSpeech(demoLine, "Nothing heard — playing the demo line");
    };
    recognitionRef.current = recognition;
    setRecording(true);
    setVoiceHint("Listening…");
    try {
      recognition.start();
      // if the mic stays silent, take over with the scripted line
      silenceRef.current = window.setTimeout(() => {
        if (!heard && recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 2600);
    } catch {
      setRecording(false);
      simulateSpeech(demoLine, "No microphone here — playing the demo line");
    }
  };

  /* ------------------------------------------------------------------- cards */

  const resolve = (id: number, choice: string, follow: () => void) => {
    setResolved((current) => ({ ...current, [id]: choice }));
    follow();
  };

  const renderCard = (msg: Msg) => {
    const card = msg.card;
    if (!card) return null;
    const answer = resolved[msg.id];

    if (card.kind === "created") {
      return (
        <div className={a.cardBlock}>
          <b className={a.cardTitle}>
            <Icon name="check" size={14} /> Transaction created
          </b>
          <dl className={a.facts}>
            <div>
              <dt>Property</dt>
              <dd>{card.address}</dd>
            </div>
            <div>
              <dt>Buyers</dt>
              <dd>{card.buyers}</dd>
            </div>
            <div>
              <dt>Phase</dt>
              <dd>New Leads</dd>
            </div>
          </dl>
        </div>
      );
    }

    if (card.kind === "opened") {
      return (
        <div className={a.cardBlock}>
          <b className={a.cardTitle}>
            <Icon name="form" size={14} /> RPA opened · pulled from the file
          </b>
          <dl className={a.facts}>
            {card.prefilled.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    }

    if (card.kind === "due") {
      return (
        <div className={a.cardBlock}>
          <ul className={a.dueList}>
            {dueThisWeek.map((item) => (
              <li key={item.title}>
                <b>{item.title}</b>
                <span>{item.note}</span>
                <i>{item.due}</i>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (card.kind === "spread") {
      return (
        <div className={a.cardBlock}>
          <b className={a.cardTitle}>Offer price and close of escrow are shared</b>
          <p className={a.cardCopy}>
            The same two values are used by 11 fields on 4 forms — RPA, BRBC, AD and SPQ.
          </p>
          {showSpread && (
            <ul className={a.spreadList}>
              {spreadFields.map((item) => (
                <li key={`${item.form}-${item.field}`}>
                  <b>{item.form}</b>
                  <span>{item.field}</span>
                  <i>{item.value}</i>
                </li>
              ))}
            </ul>
          )}
          {answer ? (
            <p className={a.cardAnswer}>{answer}</p>
          ) : (
            <div className={a.cardActions}>
              <button type="button" onClick={() => setShowSpread((current) => !current)}>
                {showSpread ? "Hide fields" : "Review 11 fields"}
              </button>
              <button
                type="button"
                onClick={() =>
                  resolve(msg.id, "Applied everywhere", () => {
                    setPending(contingencyQuestion);
                    push({
                      role: "agent",
                      text: `Applied to 11 fields across 4 forms. BRBC compensation recalculated to $21,250. ${contingencyQuestion}`,
                    });
                  })
                }
              >
                Apply to all
              </button>
              <button
                type="button"
                className={a.primary}
                onClick={() =>
                  resolve(msg.id, "Kept to the RPA", () => {
                    setPending(contingencyQuestion);
                    push({
                      role: "agent",
                      text: `Kept on the RPA only. The other 3 forms still carry the old values — I'll flag them at broker review. ${contingencyQuestion}`,
                    });
                  })
                }
              >
                RPA only
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`${a.cardBlock} ${a.warn}`}>
        <b className={a.cardTitle}>Offer price already has a value</b>
        <dl className={a.facts}>
          <div>
            <dt>On file</dt>
            <dd>{card.current}</dd>
          </div>
          <div>
            <dt>New</dt>
            <dd>{card.next}</dd>
          </div>
          <div>
            <dt>Impact</dt>
            <dd>{card.docs} documents</dd>
          </div>
        </dl>
        {answer ? (
          <p className={a.cardAnswer}>{answer}</p>
        ) : (
          <div className={a.cardActions}>
            <button
              type="button"
              onClick={() =>
                resolve(msg.id, `Kept ${card.current}`, () =>
                  push({ role: "agent", text: `Kept ${card.current}. Nothing changed.` }),
                )
              }
            >
              Keep {card.current}
            </button>
            <button
              type="button"
              className={a.primary}
              onClick={() =>
                resolve(msg.id, `Changed to ${card.next}`, () => {
                  fill([{ key: "offerPrice", value: card.next, source: "voice" }]);
                  push({
                    role: "agent",
                    text: `Updated to ${card.next} on all ${card.docs} documents. Deposit stays at 3% — that is now ${percentOf(card.next, 3)}.`,
                  });
                })
              }
            >
              Change all to {card.next}
            </button>
          </div>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------------------- chat */

  const chat = (
    <div className={a.chat}>
      <header className={a.chatHead}>
        <span className={a.where}>
          <Icon name={formOpen ? "form" : "file"} size={14} />
          {formOpen ? (
            <>
              Inside <b>RPA</b> · {sections.find((s) => s.key === activeSection)?.label}
            </>
          ) : (
            <>
              <b>{dealName || "New transaction"}</b> · transaction file
            </>
          )}
        </span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
          <Icon name="close" size={16} />
        </button>
      </header>

      <div className={a.thread} ref={threadRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={msg.role === "user" ? a.userMsg : a.agentMsg}
          >
            {msg.text}
            {renderCard(msg)}
          </div>
        ))}
        {thinking && (
          <div className={`${a.agentMsg} ${a.typing}`} aria-label="Assistant is replying">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      <div className={a.footer}>
        <div className={a.chips}>
          {suggestions().map((chip) => (
            <button key={chip} type="button" onClick={() => send(chip)}>
              {chip}
            </button>
          ))}
        </div>
        {(recording || voiceHint) && (
          <p className={`${a.voiceStatus} ${recording ? a.live : ""}`} role="status">
            <span />
            {voiceHint || "Listening…"}
          </p>
        )}
        <div className={a.compose}>
          <textarea
            value={text}
            placeholder={formOpen ? "Answer, or ask anything…" : "Describe the deal…"}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />
          <button
            type="button"
            className={recording ? a.recording : ""}
            onClick={toggleVoice}
            aria-label={recording ? "Stop recording" : "Start voice input"}
            title={recording ? "Stop recording" : "Speak instead of typing"}
          >
            <Icon name={recording ? "stop" : "mic"} size={17} />
          </button>
          <button
            type="button"
            className={a.primary}
            disabled={!text.trim() || thinking}
            onClick={() => send()}
            aria-label="Send"
          >
            <Icon name="send" size={17} />
          </button>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ layout */

  return (
    <section className={styles.workspace}>
      <header className={styles.topbar}>
        <div className={styles.heading}>
          <h1>Transactions</h1>
          <p>Drag cards to the adjacent phase column</p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.newTransaction}
            onClick={() => setOpen(true)}
            type="button"
          >
            <svg
              aria-hidden="true"
              width={17}
              height={17}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Transaction
          </button>
        </div>
      </header>

      <div className={styles.board}>
        <div className={styles.columns}>
          {phases.map((phase) => {
            const extra = deals.filter((deal) => deal.phase === phase.name);
            return (
              <section className={styles.column} key={phase.name}>
                <header className={styles.columnHeader}>
                  <div>
                    <i className={styles[phase.color]} />
                    <b>{phase.name}</b>
                  </div>
                  <span>{phase.count + extra.length}</span>
                </header>
                <div className={styles.columnBody}>
                  {extra.map((deal) => (
                    <Link
                      key={deal.id}
                      className={`${styles.transactionCard} ${a.freshCard}`}
                      href="/"
                    >
                      <div className={styles.transactionName}>{deal.name}</div>
                      <div className={styles.location}>
                        <span aria-hidden="true">⌾</span> CA
                      </div>
                      <div className={styles.cardStatus}>
                        <span>Just created</span>
                      </div>
                      <div className={styles.cardFooter}>
                        <span>{deal.phase}</span>
                        <strong>Open ↗</strong>
                      </div>
                    </Link>
                  ))}
                  {phase.hasTransaction ? (
                    <Link className={styles.transactionCard} href="/">
                      <div className={styles.transactionName}>{activeTransactionName}</div>
                      <div className={styles.location}>
                        <span aria-hidden="true">⌾</span> CA
                      </div>
                      <div className={styles.cardStatus}>
                        <span>Onboarding</span>
                        <i aria-label="Onboarding progress: one of five steps">
                          <b />
                          <b />
                          <b />
                          <b />
                          <b />
                        </i>
                      </div>
                      <div className={styles.cardFooter}>
                        <span>New Leads</span>
                        <strong>Open ↗</strong>
                      </div>
                    </Link>
                  ) : (
                    extra.length === 0 && <p>No transaction</p>
                  )}
                </div>
                <button className={styles.addTransaction} onClick={() => setOpen(true)}>
                  + Add transaction
                </button>
              </section>
            );
          })}
        </div>
      </div>

      {open && !formOpen && (
        <div
          className={a.dock}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          {chat}
        </div>
      )}

      {open && formOpen && (
        <div className={a.split}>
          <div className={a.formPane}>
            <header className={a.formHead}>
              <span className={a.formTitle}>
                <b>RPA</b>
                <small>Residential Purchase Agreement</small>
              </span>
              <span className={a.formMeta}>
                <small>
                  {sectionsDone}/{sections.length} sections · {filledCount}/{totalFields} fields
                </small>
                <button type="button" onClick={() => setOpen(false)}>
                  Back to board
                </button>
              </span>
            </header>
            <div className={a.formBody}>
              {sections.map((section) => (
                <section
                  key={section.key}
                  className={`${a.formSection} ${
                    section.key === activeSection ? a.activeSection : ""
                  }`}
                >
                  <h3>{section.label}</h3>
                  <dl>
                    {section.fields.map((field) => (
                      <div key={field.key} className={a[field.source]}>
                        <dt>{field.label}</dt>
                        <dd>
                          {editingField === field.key ? (
                            <span className={a.fieldEdit}>
                              <input
                                autoFocus
                                value={draft}
                                aria-label={`Edit ${field.label}`}
                                onChange={(event) => setDraft(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    saveFieldEdit(field.key, field.label);
                                  }
                                  if (event.key === "Escape") cancelFieldEdit();
                                }}
                              />
                              <button
                                type="button"
                                className={a.cancel}
                                onClick={cancelFieldEdit}
                                aria-label={`Cancel editing ${field.label}`}
                                title="Cancel"
                              >
                                <Icon name="close" size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => saveFieldEdit(field.key, field.label)}
                                aria-label={`Save ${field.label}`}
                                title="Save"
                              >
                                <Icon name="check" size={15} />
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={a.fieldButton}
                              onClick={() => beginFieldEdit(field.key, field.value)}
                              aria-label={`Edit ${field.label}`}
                              title="Edit this field"
                            >
                              {field.value || <em>—</em>}
                              {field.source !== "empty" && <i>{sourceLabel[field.source]}</i>}
                              <Icon name="edit" size={13} />
                            </button>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </div>
          <div className={a.chatPane}>{chat}</div>
        </div>
      )}
    </section>
  );
}

function spokenAmount(raw: string, unit?: string) {
  let amount = Number(raw.replace(/,/g, ""));
  const scale = (unit ?? "").toLowerCase();
  if (scale.startsWith("k") || scale.startsWith("thousand")) amount *= 1000;
  if (scale.startsWith("m")) amount *= 1_000_000;
  if (amount < 5000) amount *= 1000;
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

function percentOf(amount: string, percent: number) {
  const base = Number(amount.replace(/[^\d]/g, ""));
  return `$${Math.round((base * percent) / 100).toLocaleString("en-US")}`;
}
