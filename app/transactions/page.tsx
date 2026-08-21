import type { Metadata } from "next";
import Link from "next/link";
import styles from "./transactions.module.css";
import { activeTransactionName } from "../transaction-data";

export const metadata: Metadata = {
  title: "Transactions — Orqestron",
};

type IconName =
  | "audit"
  | "back"
  | "bell"
  | "chevron"
  | "contacts"
  | "folder"
  | "forms"
  | "grid"
  | "library"
  | "plus";

const iconPaths: Record<IconName, React.ReactNode> = {
  audit: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <circle cx="12" cy="11" r="2.5" />
      <path d="m14 13 2.5 2.5" />
    </>
  ),
  back: <path d="m15 5-7 7 7 7" />,
  bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M10 20h4" />,
  chevron: <path d="m9 7 5 5-5 5" />,
  contacts: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 8.5a2.5 2.5 0 0 1 0 5M17 15a4.5 4.5 0 0 1 3.5 4" />
    </>
  ),
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />,
  forms: (
    <>
      <path d="M6 3h9l4 4v14H6Z" />
      <path d="M15 3v5h5M9 12h6M9 16h6" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M17.5 14v7M14 17.5h7" />
    </>
  ),
  library: <path d="M5 4v16M9 6v14M14 5l3 15M20 4v16" />,
  plus: <path d="M12 5v14M5 12h14" />,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
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

const workspaceNav = [
  { label: "Transactions", icon: "folder" as const, count: "1", active: true },
  { label: "Audit", icon: "audit" as const },
];

const resourceNav = [
  { label: "Forms", icon: "forms" as const, count: "48" },
  { label: "Contacts", icon: "contacts" as const, count: "1" },
  { label: "Templates", icon: "grid" as const },
  { label: "Source Library", icon: "library" as const },
];

const phases = [
  { name: "New Leads", count: 1, color: "neutral", hasTransaction: true },
  { name: "Touring", count: 0, color: "gold" },
  { name: "Offer Prep", count: 0, color: "terracotta" },
  { name: "Under Contract", count: 0, color: "blue" },
  { name: "Closing", count: 0, color: "lavender" },
  { name: "Closed", count: 0, color: "green" },
  { name: "Cancelled", count: 0, color: "red" },
];

function NavItem({
  item,
}: {
  item: (typeof workspaceNav)[number] | (typeof resourceNav)[number];
}) {
  return (
    <button className={`${styles.navItem} ${"active" in item && item.active ? styles.active : ""}`}>
      <Icon name={item.icon} />
      <span>{item.label}</span>
      {item.count && <b>{item.count}</b>}
    </button>
  );
}

function TransactionCard() {
  return (
    <Link
      className={styles.transactionCard}
      href="/"
      aria-label={`Open ${activeTransactionName} transaction`}
    >
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
  );
}

export default function TransactionsPage() {
  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandRow}>
          <Link className={styles.brand} href="/transactions">
            <span>O</span>
            <b>Orqestron</b>
          </Link>
          <Link className={styles.sidebarBackButton} href="/" aria-label="Open transaction editor">
            <Icon name="back" size={20} />
          </Link>
        </div>

        <button className={styles.organization}>
          <span>
            <b>Acme Reazy</b>
            <small>OWNER</small>
          </span>
          <Icon name="chevron" size={13} />
        </button>

        <div className={styles.sectionLabel}>WORKSPACE</div>
        <nav className={styles.navigation} aria-label="Workspace navigation">
          {workspaceNav.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>

        <div className={`${styles.sectionLabel} ${styles.resourcesLabel}`}>RESOURCES</div>
        <nav className={styles.navigation} aria-label="Resource navigation">
          {resourceNav.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>

        <div className={styles.account}>
          <span className={styles.avatar}>VN</span>
          <span className={styles.accountCopy}>
            <b>Vu Nguyen</b>
            <small>vu.nguyen@c0x12c.com</small>
          </span>
          <span className={styles.accountChevron}>⌃<br />⌄</span>
          <button aria-label="Notifications">
            <Icon name="bell" size={17} />
          </button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <button className={styles.mobileBackButton} aria-label="Back">
            <Icon name="back" size={20} />
          </button>
          <div className={styles.heading}>
            <h1>Transactions</h1>
            <p>Drag cards to the adjacent phase column</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.newTransaction}>
              <Icon name="plus" size={17} /> New Transaction
            </button>
          </div>
        </header>

        <div className={styles.board}>
          <div className={styles.columns}>
            {phases.map((phase) => (
              <section className={styles.column} key={phase.name}>
                <header className={styles.columnHeader}>
                  <div>
                    <i className={styles[phase.color]} />
                    <b>{phase.name}</b>
                  </div>
                  <span>{phase.count}</span>
                </header>
                <div className={styles.columnBody}>
                  {phase.hasTransaction ? <TransactionCard /> : <p>No transaction</p>}
                </div>
                <button className={styles.addTransaction}>+ Add transaction</button>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
