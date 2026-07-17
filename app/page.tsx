const benefits = [
  {
    label: "save",
    title: "Cut your electric bill by 20% or more",
    detail:
      "Solar and battery backup are bundled into one simple plan, with no upfront hardware cost.",
    visual: "bill",
  },
  {
    label: "protect",
    title: "Keep the lights on when the grid goes dark",
    detail:
      "Stored energy automatically supports the essentials when outages hit your neighborhood.",
    visual: "backup",
  },
  {
    label: "earn",
    title: "Get rewarded for helping the network",
    detail:
      "Your home can share extra capacity during peak demand and help stabilize local power.",
    visual: "network",
  },
];

const steps = [
  {
    count: "01",
    title: "Check your home",
    copy: "Enter your address and see whether your roof and utility profile are a fit.",
  },
  {
    count: "02",
    title: "Install solar + battery",
    copy: "A Daylight-style plan packages the equipment, design and service into one monthly bill.",
  },
  {
    count: "03",
    title: "Power the grid back",
    copy: "When energy is most valuable, your system can support the network and unlock rewards.",
  },
];

const riskStats = [
  ["68F", "comfort target"],
  ["9.5 kWh", "daily generation"],
  ["72 hrs", "backup window"],
];

function BrandMark() {
  return (
    <a className="brand-mark" href="#top" aria-label="Daylight home">
      <span className="brand-sun" aria-hidden="true" />
      <span>daylight</span>
    </a>
  );
}

function EnergyGlyph({ type }: { type: string }) {
  return (
    <div className={`energy-glyph ${type}`} aria-hidden="true">
      <div className="glyph-grid">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="glyph-line one" />
      <div className="glyph-line two" />
      <div className="glyph-dot one" />
      <div className="glyph-dot two" />
      <div className="glyph-dot three" />
    </div>
  );
}

export default function Home() {
  return (
    <main id="top" className="site-shell">
      <section className="hero-section" aria-labelledby="hero-title">
        <img
          className="hero-image"
          src="/daylight-hero.png"
          alt=""
          width="1792"
          height="1024"
          fetchPriority="high"
        />
        <div className="hero-noise" aria-hidden="true" />
        <header className="site-header">
          <BrandMark />
          <nav className="top-nav" aria-label="Primary navigation">
            <a href="#how">How it works</a>
            <a href="#network">Network</a>
            <a href="#qualify">Qualify</a>
          </nav>
        </header>

        <div className="hero-frame" aria-hidden="true" />

        <div className="hero-content">
          <p className="eyebrow">Power you control</p>
          <h1 id="hero-title">Power your home for less</h1>
          <p className="hero-copy">
            Battery backup and solar, bundled into a lower monthly energy bill.
          </p>
          <form className="qualify-form" id="qualify">
            <label className="sr-only" htmlFor="address">
              Your address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              autoComplete="street-address"
              placeholder="Enter your address"
            />
            <button type="submit">See if you qualify</button>
          </form>
        </div>

        <div className="hero-meter meter-top">
          <span>kWh generated</span>
          <strong>8.2 - 9.5 kWh</strong>
        </div>
        <div className="hero-meter meter-right">
          <span>Backup stored</span>
          <div className="storage-bar" aria-hidden="true">
            <i />
          </div>
        </div>
        <div className="hero-meter meter-bottom">
          <span>Thermostat</span>
          <strong>68F</strong>
        </div>
      </section>

      <section className="benefits-section" aria-labelledby="benefits-title">
        <div className="section-kicker">Built for home energy</div>
        <h2 id="benefits-title" className="sr-only">
          Home energy benefits
        </h2>
        <div className="benefit-list">
          {benefits.map((benefit) => (
            <article className="benefit-row" key={benefit.label}>
              <div className="benefit-copy">
                <p className="eyebrow dark">{benefit.label}</p>
                <h3>{benefit.title}</h3>
                <p>{benefit.detail}</p>
              </div>
              <div className="benefit-visual">
                <EnergyGlyph type={benefit.visual} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="how-section" id="how" aria-labelledby="how-title">
        <div className="how-copy">
          <p className="eyebrow dark">How daylight works</p>
          <h2 id="how-title">One plan for solar, storage and savings.</h2>
          <p>
            Start with a quick home check, then pair rooftop solar with stored
            energy so every bill, outage and peak demand moment is easier to
            handle.
          </p>
        </div>

        <div className="phone-panel" aria-label="Energy dashboard preview">
          <div className="phone-top">
            <span>Home status</span>
            <strong>Live</strong>
          </div>
          <div className="sun-orbit" aria-hidden="true">
            <i />
          </div>
          <div className="chart-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="phone-stats">
            <div>
              <span>Bill trend</span>
              <strong>-23%</strong>
            </div>
            <div>
              <span>Stored</span>
              <strong>81%</strong>
            </div>
          </div>
        </div>

        <div className="step-list">
          {steps.map((step) => (
            <article className="step-card" key={step.count}>
              <span>{step.count}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid-section" aria-labelledby="grid-title">
        <div className="grid-copy">
          <p className="eyebrow">Why now</p>
          <h2 id="grid-title">
            Today's grid was built for yesterday's demand.
          </h2>
          <p>
            Hotter summers, more devices and aging infrastructure make home
            backup more than a nice-to-have. A connected battery can protect
            the house and lighten pressure on the grid.
          </p>
        </div>
        <div className="risk-board" aria-label="Energy system readouts">
          {riskStats.map(([value, label]) => (
            <div className="risk-stat" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="network-section" id="network" aria-labelledby="network-title">
        <div className="network-map" aria-hidden="true">
          <span className="node n1" />
          <span className="node n2" />
          <span className="node n3" />
          <span className="node n4" />
          <span className="node n5" />
          <span className="route r1" />
          <span className="route r2" />
          <span className="route r3" />
        </div>
        <div className="network-copy">
          <p className="eyebrow dark">The daylight network</p>
          <h2 id="network-title">Every home makes the network stronger.</h2>
          <p>
            A decentralized energy company grows one address at a time:
            rooftops generate, batteries store, and neighborhoods gain a little
            more resilience together.
          </p>
          <a className="text-link" href="#qualify">
            Check your address
          </a>
        </div>
      </section>

      <footer className="footer-section" aria-label="Footer">
        <div className="footer-bg" aria-hidden="true" />
        <div className="footer-main">
          <BrandMark />
          <nav className="footer-links" aria-label="Footer navigation">
            <a href="#how">Blog</a>
            <a href="#network">Brand kit</a>
            <a href="#qualify">Careers</a>
            <a href="#top">Support</a>
          </nav>
          <h2>More Power</h2>
        </div>
        <div className="footer-bottom">
          <span>Energy for households</span>
          <span>Solar, storage and rewards</span>
        </div>
      </footer>
    </main>
  );
}
