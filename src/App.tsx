import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CustomCursor } from './components/Cursor'
import { Magnetic } from './components/Magnetic'
import { TiltCard } from './components/TiltCard'
import { KineticText } from './components/KineticText'
import { ScrollReveal } from './components/ScrollReveal'
import { Marquee } from './components/Marquee'
import { CountUp } from './components/CountUp'
import { MotionToggle } from './components/MotionToggle'

type Route = '/' | '/login' | '/dashboard' | '/identify' | '/impact' | '/learn'
type IconName =
  | 'arrowUpRight' | 'arrowRight' | 'sparkle' | 'leaf' | 'recycle' | 'search' | 'camera'
  | 'upload' | 'layout' | 'scan' | 'pulse' | 'book' | 'chevron' | 'check' | 'lock'
  | 'eye' | 'eyeOff' | 'play' | 'plus' | 'logout' | 'menu' | 'bell' | 'compass'
  | 'trash' | 'shield' | 'flame' | 'droplet' | 'package' | 'circle' | 'globe' | 'info'
  | 'external' | 'x' | 'clock' | 'target' | 'filter' | 'sprout' | 'barChart'

type WasteItem = {
  name: string
  shortName: string
  category: string
  bin: string
  confidence: number
  accent: string
  icon: IconName
  description: string
  tip: string
  examples: string[]
}

const wasteCatalog: WasteItem[] = [
  {
    name: 'Plastic water bottle',
    shortName: 'Plastic bottle',
    category: 'Recyclable',
    bin: 'Recyclables',
    confidence: 96,
    accent: 'mint',
    icon: 'package',
    description: 'Empty, rinse, and replace the cap before placing it in your recycling stream.',
    tip: 'Flatten it if your local guidance allows. Keep liquids and food residue out of the bin.',
    examples: ['PET bottles', 'Clean drink cans', 'Paper cartons'],
  },
  {
    name: 'Banana peel',
    shortName: 'Banana peel',
    category: 'Compostable',
    bin: 'Compost',
    confidence: 99,
    accent: 'lime',
    icon: 'leaf',
    description: 'A food scrap that can return nutrients to the soil through your compost stream.',
    tip: 'Keep it loose or use a certified compostable liner—not regular plastic bags.',
    examples: ['Fruit scraps', 'Coffee grounds', 'Vegetable trimmings'],
  },
  {
    name: 'Used tissue',
    shortName: 'Used tissue',
    category: 'General waste',
    bin: 'General Waste',
    confidence: 93,
    accent: 'peach',
    icon: 'trash',
    description: 'Used tissues cannot be recycled because their fibers and hygiene risks are compromised.',
    tip: 'Place it in your general waste bin. Wash hands after handling heavily soiled items.',
    examples: ['Used tissues', 'Receipts', 'Greasy wrappers'],
  },
  {
    name: 'Old AA battery',
    shortName: 'AA battery',
    category: 'Special handling',
    bin: 'Hazardous Waste',
    confidence: 98,
    accent: 'lilac',
    icon: 'flame',
    description: 'Batteries contain materials that need a dedicated collection point—not a household bin.',
    tip: 'Tape the terminals and take it to a battery drop-off or household hazardous waste center.',
    examples: ['AA / AAA batteries', 'Power banks', 'Small electronics'],
  },
]

const activity = [
  { day: 'Today', item: 'Glass jar', bin: 'Recyclables', time: '9:42 AM', icon: 'recycle' as IconName, color: 'mint' },
  { day: 'Yesterday', item: 'Coffee grounds', bin: 'Compost', time: '7:18 PM', icon: 'leaf' as IconName, color: 'lime' },
  { day: 'Mon, 04 Mar', item: 'Takeaway lid', bin: 'General Waste', time: '12:06 PM', icon: 'trash' as IconName, color: 'peach' },
]

const navItems: { href: Route; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'layout' },
  { href: '/identify', label: 'Identify Waste', icon: 'scan' },
  { href: '/impact', label: 'My Impact', icon: 'pulse' },
  { href: '/learn', label: 'Learn', icon: 'book' },
]

const iconPaths: Record<IconName, ReactNode> = {
  arrowUpRight: <path d="M7 17 17 7M7 7h10v10" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  sparkle: <path d="m12 3 1.55 5.45L19 10l-5.45 1.55L12 17l-1.55-5.45L5 10l5.45-1.55L12 3ZM19 16v5m2.5-2.5h-5" />,
  leaf: <path d="M19.5 4.5C11 4.8 5.4 8.5 5.4 14.1c0 2.4 1.9 4.2 4.1 4.2 5.6 0 9.6-5.8 10-13.8ZM4 21c2.4-4.4 5.8-7.3 10.4-9.1" />,
  recycle: <path d="m7.2 8.6 2-3.5 2.2 3.8m-8.1 4.6 2.2 3.7 4.3-.1M16.7 8.4h4.1l-2.2 3.8m-9.5 4.9 2.1 3.5 2.3-3.8m-6.3-8.2L5 13.1m12.4-4.7-3.7 6.4m-1.7 4.1 3.9-.1" />,
  search: <><circle cx="11" cy="11" r="6.8" /><path d="m16 16 4 4" /></>,
  camera: <><path d="M4 8.5h3l1.3-2h7.4l1.3 2h3a1 1 0 0 1 1 1v8.8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13.5" r="3.2" /></>,
  upload: <><path d="M12 15V4m0 0L8 8m4-4 4 4" /><path d="M5 14v4.2c0 .9.8 1.8 1.8 1.8h10.4c1 0 1.8-.9 1.8-1.8V14" /></>,
  layout: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><rect x="8" y="8" width="8" height="8" rx="1" /></>,
  pulse: <><path d="M3 12h3l2.1-5 3.8 10 2.3-6 1.7 1H21" /></>,
  book: <><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z" /><path d="M5 18.8A2.5 2.5 0 0 1 7.5 16H19M9 6h6m-6 3h5" /></>,
  chevron: <path d="m8 10 4 4 4-4" />,
  check: <path d="m5 12 4 4L19 6" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  eye: <><path d="M2.5 12s3.3-5 9.5-5 9.5 5 9.5 5-3.3 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="12" r="2" /></>,
  eyeOff: <><path d="m3 3 18 18M10.6 7.2A8.8 8.8 0 0 1 12 7c6.2 0 9.5 5 9.5 5a16 16 0 0 1-3 3.4M6.7 6.7C4.1 8.3 2.5 12 2.5 12s3.3 5 9.5 5c1.4 0 2.6-.3 3.7-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  play: <path d="m9 6 9 6-9 6V6Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: <><path d="M10 17 15 12 10 7M15 12H3" /><path d="M13 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
  trash: <><path d="M5 7h14m-9 4v5m4-5v5M8 7l1-3h6l1 3m-9 0 1 14h8l1-14" /></>,
  shield: <path d="M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z" />,
  flame: <path d="M12 21c4.1 0 7-2.9 7-6.7 0-2.6-1.5-5.3-4-7.8.2 2.5-1 4-2.2 4.8.1-3.5-1.5-6.1-4-8.3.3 4-3.8 5.9-3.8 10.4C5 17.9 7.9 21 12 21Z" />,
  droplet: <path d="M12 3S6 9.2 6 13.7a6 6 0 0 0 12 0C18 9.2 12 3 12 3Z" />,
  package: <><path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z" /><path d="m4 7 8 4 8-4M12 11v10" /></>,
  circle: <circle cx="12" cy="12" r="8" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.2 2.5 3.2 5.5 3.2 9s-1 6.5-3.2 9c-2.2-2.5-3.2-5.5-3.2-9S9.8 5.5 12 3Z" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8v.1" /></>,
  external: <><path d="M14 5h5v5M19 5l-8 8" /><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>,
  filter: <path d="M4 6h16M7 12h10m-7 6h4" />,
  sprout: <><path d="M12 20V9" /><path d="M12 13c-5 0-7-2.7-7-6 4.7 0 7 2 7 6ZM12 10c0-4 2.6-6 7-6 0 3.8-2.3 6-7 6Z" /></>,
  barChart: <><path d="M5 20V10m7 10V4m7 16v-7" /></>,
}

function Icon({ name, size = 20, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  )
}

function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <Magnetic strength={0.25}>
      <button
        className={`brand ${inverted ? 'brand-inverted' : ''}`}
        onClick={() => navigate('/')}
        aria-label="WasteWise home"
        data-cursor="pointer"
      >
        <span className="brand-mark" aria-hidden="true"><i /><i /></span>
        <span className="brand-name">waste<span>wise</span></span>
      </button>
    </Magnetic>
  )
}

function navigate(path: Route) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}

function routeFromPath(pathname: string): Route {
  if (pathname === '/login') return '/login'
  if (pathname === '/dashboard') return '/dashboard'
  if (pathname === '/identify') return '/identify'
  if (pathname === '/impact') return '/impact'
  if (pathname === '/learn') return '/learn'
  return '/'
}

function Button({
  children,
  variant = 'dark',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: ReactNode
  variant?: 'dark' | 'lime' | 'outline' | 'ghost' | 'light'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <Magnetic strength={0.18}>
      <button
        type={type}
        disabled={disabled}
        className={`button button-${variant} ${className}`}
        onClick={onClick}
        data-cursor="pointer"
      >
        {children}
      </button>
    </Magnetic>
  )
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span className="eyebrow-dot" />{children}</div>
}

function SortGraphic({ compact = false }: { compact?: boolean }) {
  const [activeLog, setActiveLog] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLog((prev) => (prev + 1) % 4)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  const logItems = [
    { item: 'PET Water Bottle', category: 'Recyclables', conf: '98.4%', co2: '+0.04kg', status: 'Diverted to Blue Bin' },
    { item: 'Coffee Grounds', category: 'Compost', conf: '99.1%', co2: '+0.12kg', status: 'Organic Soil Blend' },
    { item: 'Soiled Paper Wrap', category: 'General Waste', conf: '94.2%', co2: 'Controlled', status: 'Residual Processing' },
    { item: 'Lithium AA Battery', category: 'Hazardous Waste', conf: '99.8%', co2: 'Safe Depot', status: 'Drop-off Routed' },
  ]

  const current = logItems[activeLog]

  return (
    <div className={`sort-console ${compact ? 'sort-console-compact' : ''}`} aria-label="Interactive AI Waste Segregation Terminal">
      <div className="console-ambient-glow" />

      <div className="console-window" data-cursor="card" data-cursor-label="VISION HUD">
        <div className="console-header">
          <div className="console-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="console-title">
            <Icon name="scan" size={13} />
            <span>wastewise-agent // vision-stream</span>
          </div>
          <div className="console-live-badge">
            <span className="pulse-dot" />
            LIVE INFERENCE
          </div>
        </div>

        <div className="console-viewfinder">
          <div className="viewfinder-grid" />
          <div className="viewfinder-scanline" />
          
          <div className="reticle reticle-tl" />
          <div className="reticle reticle-tr" />
          <div className="reticle reticle-bl" />
          <div className="reticle reticle-br" />

          <div className="viewfinder-target">
            <div className="target-box">
              <div className="target-badge">
                <Icon name="sparkle" size={11} />
                <span>{current.item}</span>
                <span className="target-conf">{current.conf}</span>
              </div>
              <div className="target-silhouette">
                <Icon name={activeLog === 0 ? 'package' : activeLog === 1 ? 'leaf' : activeLog === 2 ? 'trash' : 'flame'} size={40} />
              </div>
            </div>
          </div>

          <div className="viewfinder-footer">
            <div className="hud-metric">
              <span className="metric-tag">LATENCY</span>
              <strong>38ms</strong>
            </div>
            <div className="hud-metric">
              <span className="metric-tag">ROUTED TO</span>
              <strong className="text-lime">{current.category}</strong>
            </div>
            <div className="hud-metric">
              <span className="metric-tag">OFFSET</span>
              <strong className="text-mint">{current.co2}</strong>
            </div>
          </div>
        </div>

        <div className="console-terminal">
          <div className="terminal-bar">
            <span className="term-prompt">$</span>
            <span className="term-cmd">wastewise classify --stream --rules=municipal-v2</span>
          </div>
          <div className="terminal-lines">
            <div className="term-line line-dim">
              <span className="term-time">[00:01.04]</span>
              <span className="term-msg">Ingested: Frame buffer #2048 (1080p RGB)</span>
            </div>
            <div className="term-line line-info">
              <span className="term-time">[00:01.12]</span>
              <span className="term-msg">Detected: <strong>{current.item}</strong> (Confidence: {current.conf})</span>
            </div>
            <div className="term-line line-success">
              <span className="term-time">[00:01.18]</span>
              <span className="term-msg">Action: <span className="term-tag">{current.category}</span> → {current.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="console-chip chip-verified">
        <Icon name="check" size={13} />
        <span>Contamination Prevention</span>
      </div>
      <div className="console-chip chip-circular">
        <Icon name="recycle" size={13} />
        <span>Circular Economy Verified</span>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <main className="landing-page">
      <header className="site-header page-wrap">
        <Brand />
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#how-it-works" data-cursor="pointer">How it works</a>
          <a href="#guidance" data-cursor="pointer">Guidance</a>
          <a href="#impact" data-cursor="pointer">Impact</a>
        </nav>
        <div className="header-actions">
          <div className="header-status-badge">
            <i />
            <span>MODEL v2.4 ONLINE</span>
          </div>
          <MotionToggle />
          <button className="text-link" onClick={() => navigate('/login')} data-cursor="pointer">Log in <Icon name="arrowUpRight" size={15} /></button>
          <Button variant="lime" onClick={() => navigate('/login')}>Try the demo <Icon name="arrowUpRight" size={16} /></Button>
        </div>
      </header>

      <section className="hero page-wrap">
        <div className="hero-copy">
          <ScrollReveal animation="fade-up" delay={50}>
            <Eyebrow>AI Waste Recognition Platform v2.4</Eyebrow>
          </ScrollReveal>
          
          <h1 className="hero-title">
            <KineticText as="span" delay={100}>Sort what</KineticText>
            <KineticText as="span" delay={220}><em>matters.</em></KineticText>
          </h1>

          <ScrollReveal animation="fade-up" delay={280}>
            <p className="hero-lede">WasteWise turns uncertainty into instant environmental action. Point, scan, and sort with AI precision—keeping useful materials in motion with zero guesswork.</p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={360}>
            <div className="hero-actions">
              <Button variant="lime" onClick={() => navigate('/login')}>Start sorting demo <Icon name="arrowUpRight" size={17} /></Button>
              <Magnetic strength={0.16}>
                <button
                  className="play-link"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  data-cursor="pointer"
                >
                  <span className="play-icon"><Icon name="play" size={13} /></span> See how it works
                </button>
              </Magnetic>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={420}>
            <div className="hero-note"><Icon name="sparkle" size={16} /><span>Trained for homes, enterprises, and smart circular facilities.</span></div>
          </ScrollReveal>
        </div>

        <ScrollReveal animation="zoom-in" delay={200} className="hero-visual">
          <SortGraphic />
        </ScrollReveal>
      </section>

      {/* Quicklive-inspired Telemetry Stats Strip */}
      <section className="telemetry-strip page-wrap">
        <div className="telemetry-grid">
          <div className="telemetry-card">
            <div className="telemetry-val"><CountUp to={142} suffix="K+" /></div>
            <div className="telemetry-label">Items Classified</div>
            <div className="telemetry-sub">Real-time inference across 4 streams</div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-val">99.2%</div>
            <div className="telemetry-label">Sorting Accuracy</div>
            <div className="telemetry-sub">Municipal contamination prevention</div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-val">&lt; 38ms</div>
            <div className="telemetry-label">Inference Latency</div>
            <div className="telemetry-sub">Edge camera & text recognition</div>
          </div>
          <div className="telemetry-card">
            <div className="telemetry-val"><CountUp to={4820} suffix=" kg" /></div>
            <div className="telemetry-label">CO₂ Equivalent Diverted</div>
            <div className="telemetry-sub">Saved from landfill emissions</div>
          </div>
        </div>
      </section>

      {/* BDSN-Style Infinite Marquee Ticker */}
      <Marquee speed={32} pauseOnHover={true} className="page-wrap">
        <div className="marquee-item"><span>Waste is a design question</span><span className="marquee-pill">CIRCULAR</span><span className="marquee-arrow">↗</span></div>
        <div className="marquee-item"><span>Better sorting starts here</span><span className="marquee-pill">03 / 08</span><span className="marquee-arrow">↘</span></div>
        <div className="marquee-item"><span>Keep materials in motion</span><span className="marquee-pill">DEMO ACTIVE</span><span className="marquee-arrow">✦</span></div>
        <div className="marquee-item"><span>Every item has its loop</span><span className="marquee-pill">AI INDEX</span><span className="marquee-arrow">↗</span></div>
        <div className="marquee-item"><span>From trash to resource</span><span className="marquee-pill">VERIFIED</span><span className="marquee-arrow">↘</span></div>
      </Marquee>

      <section className="story-section page-wrap" id="guidance">
        <ScrollReveal animation="fade-right" className="section-intro">
          <Eyebrow>01 / Know the difference</Eyebrow>
          <h2>
            <KineticText as="span">Good intentions</KineticText>
            <KineticText as="span" delay={120}><em>need a little direction.</em></KineticText>
          </h2>
        </ScrollReveal>

        <ScrollReveal animation="fade-left" delay={150} className="story-body">
          <p>Most of us want to do the right thing. The hard part is knowing what “right” looks like when a coffee cup, a battery, or a messy takeaway lid lands in your hand.</p>
          <p>WasteWise gives you a calm, useful answer—so the good choice becomes the easy choice.</p>
          <button className="underline-link" onClick={() => navigate('/identify')} data-cursor="pointer">Explore the guide <Icon name="arrowUpRight" size={15} /></button>
        </ScrollReveal>
      </section>

      <ScrollReveal cascade animation="fade-up" className="guide-cards page-wrap">
        {[
          { number: '01', icon: 'scan' as IconName, title: 'Identify', text: 'Name the thing in your hand, without the guesswork.', color: 'card-lilac' },
          { number: '02', icon: 'compass' as IconName, title: 'Find the place', text: 'Get the right bin and a simple disposal note.', color: 'card-mint' },
          { number: '03', icon: 'pulse' as IconName, title: 'See your impact', text: 'Build a clearer habit, one sorted item at a time.', color: 'card-peach' },
        ].map((card, idx) => (
          <TiltCard
            as="article"
            className={`guide-card ${card.color}`}
            key={card.number}
            data-cursor="card"
            data-cursor-label="EXPLORE"
            style={{ animationDelay: `${idx * 0.15}s` }}
          >
            <div className="card-number">{card.number}</div>
            <div className="card-icon"><Icon name={card.icon} size={24} /></div>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
            <button
              className="round-arrow"
              aria-label={`Learn about ${card.title}`}
              onClick={() => navigate(card.title === 'Identify' ? '/identify' : card.title === 'See your impact' ? '/impact' : '/learn')}
              data-cursor="pointer"
            >
              <Icon name="arrowUpRight" size={18} />
            </button>
          </TiltCard>
        ))}
      </ScrollReveal>

      <section className="how-section page-wrap" id="how-it-works">
        <ScrollReveal animation="fade-right" className="how-heading">
          <Eyebrow>02 / How it works</Eyebrow>
          <h2>
            <KineticText as="span">Less guesswork.</KineticText>
            <KineticText as="span" delay={120}><em>More good loops.</em></KineticText>
          </h2>
          <p>A pocket-sized sorting guide for the real world—quick when you need it, thoughtful when you want to go deeper.</p>
        </ScrollReveal>

        <ScrollReveal cascade animation="fade-left" delay={120} className="steps-list">
          {[
            ['01', 'Point, type, or choose.', 'Start with what you have. Search an item or use a sample to see the flow.'],
            ['02', 'Get the useful answer.', 'A clear bin recommendation, practical guidance, and the little detail that matters.'],
            ['03', 'Keep the loop going.', 'Check your weekly rhythm and turn one good decision into a habit.']
          ].map(([number, title, text]) => (
            <div className="step" key={number} data-cursor="pointer">
              <span className="step-number">{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <Icon name="arrowUpRight" size={19} />
            </div>
          ))}
        </ScrollReveal>
      </section>

      <ScrollReveal animation="fade-up" className="impact-band page-wrap" id="impact">
        <div className="impact-band-copy">
          <Eyebrow light>03 / Small actions, visible change</Eyebrow>
          <h2>
            <KineticText as="span">Make your next</KineticText>
            <KineticText as="span" delay={120}><em>choice count.</em></KineticText>
          </h2>
          <p>Every sorted item is a tiny vote for a cleaner system. WasteWise helps you see the pattern—not just the bin.</p>
          <Button variant="lime" onClick={() => navigate('/login')}>Open my dashboard <Icon name="arrowUpRight" size={17} /></Button>
        </div>
        <div className="impact-stamp">
          <TiltCard maxTilt={16} scale={1.06} spotlight={false} data-cursor="pointer">
            <div className="stamp-ring"><span>WASTEWISE</span><strong>↗</strong><span>BETTER LOOPS / 2024</span></div>
          </TiltCard>
        </div>
      </ScrollReveal>

      <footer className="site-footer page-wrap">
        <Brand />
        <span>Sort with intent. Move with care.</span>
        <div>
          <a href="#guidance" data-cursor="pointer">Guidance</a>
          <a href="#how-it-works" data-cursor="pointer">How it works</a>
          <button onClick={() => navigate('/login')} data-cursor="pointer">Demo login <Icon name="arrowUpRight" size={14} /></button>
        </div>
      </footer>
    </main>
  )
}

function LoginPage({ onToast }: { onToast: (message: string) => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: typeof errors = {}
    if (!form.email.trim()) next.email = 'Enter an email so we know where to start.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Try a complete email address, like you@example.com.'
    if (!form.password) next.password = 'Enter any password to continue the demo.'
    setErrors(next)
    if (Object.keys(next).length === 0) {
      onToast('Demo session started — welcome to WasteWise.')
      navigate('/dashboard')
    }
  }

  return (
    <main className="login-page">
      <div className="login-aside">
        <div className="login-aside-top"><Brand inverted /><span className="aside-index">DEMO / 01</span></div>
        <div className="login-aside-content">
          <ScrollReveal animation="fade-up" delay={50}>
            <Eyebrow light>Good systems start small</Eyebrow>
          </ScrollReveal>
          <h1>
            <KineticText as="span">Make room</KineticText>
            <KineticText as="span" delay={120}>for <em>better.</em></KineticText>
          </h1>
          <ScrollReveal animation="fade-up" delay={200}>
            <p>Sign in to your demo dashboard and make your next sorting choice a little clearer.</p>
          </ScrollReveal>
          <SortGraphic compact />
        </div>
        <div className="aside-footer"><span>WasteWise / 2024</span><span>Front-end concept</span></div>
      </div>

      <div className="login-panel">
        <div className="login-panel-top">
          <button className="back-link" onClick={() => navigate('/')} data-cursor="pointer"><Icon name="arrowRight" size={17} /> Back to home</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <MotionToggle />
            <span>New here? <button className="inline-action" onClick={() => onToast('Account creation is simulated in this demo.')} data-cursor="pointer">Create account</button></span>
          </div>
        </div>
        <ScrollReveal animation="fade-up" delay={100} className="login-form-wrap">
          <Eyebrow>Demo access</Eyebrow>
          <h2>
            <KineticText as="span">Welcome</KineticText>
            <KineticText as="span" delay={120}><em>back.</em></KineticText>
          </h2>
          <p className="form-intro">This is a simulated login. Use any valid-looking email and password to explore the product.</p>
          <form className="login-form" onSubmit={submit} noValidate>
            <label>
              Email address
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
              {errors.email && <span className="field-error" id="email-error">{errors.email}</span>}
            </label>
            <label>
              Password
              <div className="password-wrap">
                <input type={showPassword ? 'text' : 'password'} placeholder="Any password works" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} data-cursor="pointer">
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
              {errors.password && <span className="field-error" id="password-error">{errors.password}</span>}
            </label>
            <div className="form-options">
              <label className="checkbox-label" data-cursor="pointer">
                <input type="checkbox" checked={form.remember} onChange={(event) => setForm({ ...form, remember: event.target.checked })} />
                <span className="custom-checkbox"><Icon name="check" size={12} /></span>
                Remember me
              </label>
              <button type="button" className="inline-action" onClick={() => onToast('Password recovery is not connected in demo mode.')} data-cursor="pointer">Forgot password?</button>
            </div>
            <Button type="submit" variant="dark" className="login-submit">Log in to demo <Icon name="arrowUpRight" size={17} /></Button>
            <div className="or-divider"><span>or</span></div>
            <Button variant="outline" className="google-button" onClick={() => onToast('Google continuation is simulated in this demo.')}>
              <span className="google-g">G</span> Continue with Google
            </Button>
          </form>
          <div className="demo-notice"><Icon name="info" size={17} /><span><strong>Demo only.</strong> No credentials are stored and no account is created.</span></div>
        </ScrollReveal>
      </div>
    </main>
  )
}

function DashboardLayout({ active, children, onToast }: { active: Route; children: ReactNode; onToast: (message: string) => void }) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div>
          <Brand />
          <div className="sidebar-caption">PERSONAL SORTING GUIDE</div>
          <nav className="app-nav" aria-label="Dashboard navigation">
            {navItems.map((item) => (
              <a
                className={active === item.href ? 'active' : ''}
                href={item.href}
                key={item.href}
                onClick={(event) => { event.preventDefault(); navigate(item.href) }}
                data-cursor="pointer"
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
                {active === item.href && <i className="nav-active-dot" />}
              </a>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <TiltCard maxTilt={8} scale={1.02} className="streak-card" data-cursor="pointer">
            <span className="streak-icon"><Icon name="flame" size={18} /></span>
            <div><strong>4 day streak</strong><small>Keep the loop going</small></div>
            <Icon name="arrowUpRight" size={15} />
          </TiltCard>
          <button className="profile-card" onClick={() => onToast('Profile settings are part of the demo shell.')} data-cursor="pointer">
            <span className="avatar">AS</span>
            <span><strong>Alex Sharma</strong><small>Personal account</small></span>
            <Icon name="chevron" size={15} />
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button className="mobile-menu" onClick={() => onToast('Use the bottom navigation to move around the demo.')} aria-label="Open navigation" data-cursor="pointer"><Icon name="menu" size={21} /></button>
          <div className="topbar-breadcrumb"><span>WasteWise</span><Icon name="chevron" size={14} /><strong>{navItems.find((item) => item.href === active)?.label}</strong></div>
          <div className="topbar-actions">
            <MotionToggle />
            <span className="demo-chip"><span /> DEMO MODE</span>
            <button className="icon-button" onClick={() => onToast('You are all caught up.')} aria-label="Notifications" data-cursor="pointer"><Icon name="bell" size={19} /></button>
            <button className="top-avatar" onClick={() => onToast('Profile settings are part of the demo shell.')} data-cursor="pointer">AS</button>
          </div>
        </header>

        <div className="app-content">{children}</div>

        <nav className="mobile-nav" aria-label="Mobile dashboard navigation">
          {navItems.map((item) => (
            <a
              className={active === item.href ? 'active' : ''}
              href={item.href}
              key={item.href}
              onClick={(event) => { event.preventDefault(); navigate(item.href) }}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label === 'Identify Waste' ? 'Identify' : item.label === 'My Impact' ? 'Impact' : item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}

function PageHeader({ eyebrow, title, emphasis, description, action }: { eyebrow: string; title: string; emphasis?: string; description: string; action?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <ScrollReveal animation="fade-up" delay={30}><Eyebrow>{eyebrow}</Eyebrow></ScrollReveal>
        <h1>
          <KineticText as="span">{title}</KineticText>
          {emphasis && <KineticText as="span" delay={120}><em>{emphasis}</em></KineticText>}
        </h1>
        <ScrollReveal animation="fade-up" delay={200}><p>{description}</p></ScrollReveal>
      </div>
      {action && <ScrollReveal animation="fade-left" delay={150} className="page-header-action">{action}</ScrollReveal>}
    </div>
  )
}

function SearchField({ value, onChange, onSubmit, placeholder = 'Search an item, like “coffee cup”' }: { value: string; onChange: (value: string) => void; onSubmit: () => void; placeholder?: string }) {
  return (
    <div className="search-field">
      <Icon name="search" size={19} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter') onSubmit() }}
        placeholder={placeholder}
        aria-label="Search waste items"
      />
      <button onClick={onSubmit} aria-label="Search" data-cursor="pointer">
        <Icon name="arrowUpRight" size={17} />
      </button>
    </div>
  )
}

function ResultCard({ item, compact = false, onMore }: { item: WasteItem; compact?: boolean; onMore?: () => void }) {
  return (
    <TiltCard
      as="article"
      maxTilt={6}
      scale={1.01}
      className={`result-card ${compact ? 'result-card-compact' : ''}`}
      data-cursor="card"
      data-cursor-label="MATCH"
    >
      <div className="result-top">
        <div className={`result-object object-${item.accent}`}><Icon name={item.icon} size={compact ? 28 : 39} /></div>
        <div className="result-meta">
          <span className="result-kicker">SIMULATED MATCH / {item.category}</span>
          <h3>{item.name}</h3>
          <span className="confidence">
            <span className="confidence-track"><i style={{ width: `${item.confidence}%` }} /></span>
            <CountUp to={item.confidence} suffix="% confidence" />
          </span>
        </div>
        <button className="result-more" onClick={onMore} aria-label="More item details" data-cursor="pointer">
          <Icon name="external" size={17} />
        </button>
      </div>
      <div className="result-divider" />
      <div className="result-destination">
        <div className="destination-bin">
          <span className={`bin-dot dot-${item.accent}`}>
            <Icon name={item.bin === 'Hazardous Waste' ? 'shield' : item.bin === 'Compost' ? 'leaf' : item.bin === 'General Waste' ? 'trash' : 'recycle'} size={19} />
          </span>
          <div><span>Recommended bin</span><strong>{item.bin}</strong></div>
        </div>
        <span className="result-check"><Icon name="check" size={15} /> best match</span>
      </div>
      {!compact && (
        <div className="result-guidance">
          <div><span className="guidance-label">WHAT TO DO</span><p>{item.description}</p></div>
          <div><span className="guidance-label">ONE SMALL DETAIL</span><p>{item.tip}</p></div>
        </div>
      )}
    </TiltCard>
  )
}

function QuickBins({ onChoose }: { onChoose: (item: WasteItem) => void }) {
  const bins = [
    { title: 'Recyclables', sub: 'Paper, glass, metal', icon: 'recycle' as IconName, color: 'mint', item: wasteCatalog[0] },
    { title: 'Compost', sub: 'Food + garden scraps', icon: 'leaf' as IconName, color: 'lime', item: wasteCatalog[1] },
    { title: 'General Waste', sub: 'Non-recoverable items', icon: 'trash' as IconName, color: 'peach', item: wasteCatalog[2] },
    { title: 'Hazardous Waste', sub: 'Batteries + chemicals', icon: 'shield' as IconName, color: 'lilac', item: wasteCatalog[3] }
  ]
  return (
    <div className="bin-grid">
      {bins.map((bin) => (
        <TiltCard
          as="button"
          key={bin.title}
          onClick={() => onChoose(bin.item)}
          className="bin-card"
          data-cursor="card"
          data-cursor-label="SELECT"
          maxTilt={7}
          scale={1.02}
        >
          <span className={`bin-icon bin-${bin.color}`}><Icon name={bin.icon} size={21} /></span>
          <span><strong>{bin.title}</strong><small>{bin.sub}</small></span>
          <Icon name="arrowUpRight" size={16} />
        </TiltCard>
      ))}
    </div>
  )
}

function ImpactSummary() {
  return (
    <TiltCard as="section" className="impact-summary-card" maxTilt={5}>
      <div className="card-heading">
        <div><span className="section-label">THIS WEEK / DEMO DATA</span><h2>Your sorting rhythm</h2></div>
        <button className="small-icon-button" aria-label="See impact details" onClick={() => navigate('/impact')} data-cursor="pointer"><Icon name="arrowUpRight" size={16} /></button>
      </div>
      <div className="impact-number">
        <strong><CountUp to={12} /></strong>
        <span>items sorted</span>
        <b>+18%</b>
      </div>
      <div className="week-bars" aria-label="Weekly sorted item totals">
        <div><span style={{ height: '36%' }} /><small>M</small></div>
        <div><span style={{ height: '54%' }} /><small>T</small></div>
        <div><span style={{ height: '42%' }} /><small>W</small></div>
        <div><span style={{ height: '78%' }} /><small>T</small></div>
        <div><span style={{ height: '64%' }} /><small>F</small></div>
        <div><span style={{ height: '92%' }} className="today" /><small>S</small></div>
        <div><span style={{ height: '48%' }} /><small>S</small></div>
      </div>
      <div className="impact-foot">
        <span><i className="legend-dot" /> 8 items kept in the loop</span>
        <button className="text-link" onClick={() => navigate('/impact')} data-cursor="pointer">View my impact <Icon name="arrowUpRight" size={14} /></button>
      </div>
    </TiltCard>
  )
}

function ActivityList({ onToast }: { onToast?: (message: string) => void }) {
  return (
    <TiltCard as="section" className="activity-card" maxTilt={5}>
      <div className="card-heading">
        <div><span className="section-label">RECENT SORTING</span><h2>Last few good calls</h2></div>
        <button className="small-icon-button" onClick={() => onToast?.('Activity filters are simulated in this demo.')} aria-label="Filter activity" data-cursor="pointer"><Icon name="filter" size={16} /></button>
      </div>
      <div className="activity-list">
        {activity.map((item) => (
          <div className="activity-row" key={`${item.day}-${item.item}`} data-cursor="pointer">
            <span className={`activity-icon activity-${item.color}`}><Icon name={item.icon} size={17} /></span>
            <div><strong>{item.item}</strong><small>{item.bin} · {item.day}</small></div>
            <time>{item.time}</time>
          </div>
        ))}
      </div>
      <button className="underline-link" onClick={() => navigate('/impact')} data-cursor="pointer">See all activity <Icon name="arrowUpRight" size={14} /></button>
    </TiltCard>
  )
}

function DashboardHome({ onToast }: { onToast: (message: string) => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<WasteItem | null>(null)
  const result = useMemo(() => query.trim() ? wasteCatalog.find((item) => `${item.name} ${item.bin}`.toLowerCase().includes(query.toLowerCase())) : null, [query])

  function runSearch() {
    if (result) setSelected(result)
    else if (query.trim()) onToast('No exact demo match yet — try bottle, peel, tissue, or battery.')
    else onToast('Start with an item name or choose a quick bin below.')
  }

  return (
    <DashboardLayout active="/dashboard" onToast={onToast}>
      <div className="dashboard-page">
        <div className="dashboard-welcome">
          <div>
            <ScrollReveal animation="fade-up" delay={40}><Eyebrow>Tuesday, 05 March 2024</Eyebrow></ScrollReveal>
            <h1>
              <KineticText as="span">Good morning,</KineticText>
              <KineticText as="span" delay={120}><em>Alex.</em></KineticText>
            </h1>
            <ScrollReveal animation="fade-up" delay={200}><p>Ready to make the next right choice?</p></ScrollReveal>
          </div>
          <Button variant="lime" onClick={() => navigate('/identify')}>Identify an item <Icon name="arrowUpRight" size={16} /></Button>
        </div>

        <ScrollReveal animation="fade-up" delay={150}>
          <TiltCard maxTilt={4} scale={1.008} className="identify-hero">
            <div className="identify-copy">
              <span className="section-label">START HERE / DEMO IDENTIFICATION</span>
              <h2>What are you<br /><em>sorting today?</em></h2>
              <p>Search an item or use one of the sample flows. Recognition results are simulated for this demo.</p>
              <SearchField value={query} onChange={setQuery} onSubmit={runSearch} />
              <div className="search-suggestions">
                <span>Try:</span>
                {['plastic bottle', 'banana peel', 'AA battery'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion)
                      setSelected(wasteCatalog.find((item) => item.name.toLowerCase().includes(suggestion)) || wasteCatalog[0])
                    }}
                    data-cursor="pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            <div className="identify-art">
              <SortGraphic compact />
              <div className="art-note"><Icon name="sparkle" size={15} /><span>clear answers<br />live here</span></div>
            </div>
          </TiltCard>
        </ScrollReveal>

        {(selected || result) && (
          <ScrollReveal animation="fade-up" className="dashboard-result">
            <div className="result-heading">
              <span><span className="section-label">YOUR SIMULATED RESULT</span><strong>{selected?.name || result?.name}</strong></span>
              <button onClick={() => { setSelected(null); setQuery('') }} aria-label="Close result" data-cursor="pointer"><Icon name="x" size={17} /></button>
            </div>
            <ResultCard item={selected || result || wasteCatalog[0]} onMore={() => onToast('Detailed local guidance is part of the simulated result.')} />
          </ScrollReveal>
        )}

        <ScrollReveal cascade animation="fade-up" delay={220} className="dashboard-grid">
          <QuickBins onChoose={(item) => { setSelected(item); setQuery(item.shortName) }} />
          <ImpactSummary />
          <ActivityList onToast={onToast} />
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}

function IdentifyPage({ onToast }: { onToast: (message: string) => void }) {
  const [query, setQuery] = useState('plastic bottle')
  const [selected, setSelected] = useState(wasteCatalog[0])
  const [uploadedName, setUploadedName] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  function identify() {
    const found = wasteCatalog.find((item) => `${item.name} ${item.bin}`.toLowerCase().includes(query.toLowerCase()))
    if (found) {
      setSelected(found)
      setUploadedName('')
      setPreviewUrl('')
    } else onToast('Try one of the sample items below for this demo.')
  }

  function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadedName(file.name)
    setPreviewUrl(URL.createObjectURL(file))
    setSelected({
      ...wasteCatalog[0],
      name: file.name.replace(/\.[^/.]+$/, ''),
      shortName: 'Uploaded sample',
      confidence: 91,
      description: 'This uploaded sample is mapped to a recyclable demo result. Check local guidance before disposal.',
      tip: 'In this demo, the image flow returns a recyclable sample result for illustration.'
    })
    onToast('Sample image loaded. Recognition is simulated.')
  }

  return (
    <DashboardLayout active="/identify" onToast={onToast}>
      <div className="inner-page identify-page">
        <PageHeader
          eyebrow="Identify waste / 01"
          title="Not sure where it"
          emphasis="goes?"
          description="Start with a name, a sample, or a photo. We’ll point you in the right direction—without the lecture."
          action={<span className="demo-chip demo-chip-dark"><span /> SIMULATED RECOGNITION</span>}
        />

        <div className="identify-layout">
          <ScrollReveal animation="fade-right">
            <TiltCard as="section" maxTilt={4} className="identify-control-card">
              <div className="control-card-top">
                <span className="section-label">01 / CHOOSE YOUR START</span>
                <span className="control-status"><Icon name="lock" size={13} /> demo data only</span>
              </div>
              <SearchField value={query} onChange={setQuery} onSubmit={identify} placeholder="Try “glass jar” or “banana peel”" />
              <div className="sample-items">
                <span>Popular samples</span>
                <div>
                  {wasteCatalog.map((item) => (
                    <button
                      className={selected.name === item.name ? 'selected' : ''}
                      key={item.name}
                      onClick={() => { setQuery(item.shortName); setSelected(item); setUploadedName(''); setPreviewUrl('') }}
                      data-cursor="pointer"
                    >
                      <span className={`sample-dot dot-${item.accent}`}><Icon name={item.icon} size={15} /></span>
                      {item.shortName}
                      <Icon name="arrowUpRight" size={13} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="upload-divider"><span>or use a sample image</span></div>
              <div className="upload-actions">
                <TiltCard as="button" maxTilt={6} className="upload-card" onClick={() => fileRef.current?.click()} data-cursor="pointer">
                  <span className="upload-preview">
                    {previewUrl ? <img src={previewUrl} alt="Uploaded sample preview" /> : <span className="upload-icon"><Icon name="upload" size={20} /></span>}
                  </span>
                  <span>
                    <strong>{uploadedName || 'Upload an image'}</strong>
                    <small>{uploadedName ? 'Sample loaded · tap to replace' : 'JPG or PNG · recognition is simulated'}</small>
                  </span>
                  <Icon name="arrowUpRight" size={16} />
                </TiltCard>
                <TiltCard as="button" maxTilt={6} className="camera-card" onClick={() => { setSelected(wasteCatalog[0]); setUploadedName('camera-sample.jpg'); setPreviewUrl(''); onToast('Camera sample loaded. Recognition is simulated.') }} data-cursor="pointer">
                  <Icon name="camera" size={22} />
                  <span>Use camera</span>
                </TiltCard>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={chooseFile} hidden />
              </div>
            </TiltCard>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={120} className="identify-result-column">
            <div className="result-column-heading">
              <div><span className="section-label">02 / YOUR ANSWER</span><h2>Here’s the<br /><em>best match.</em></h2></div>
              <span className="result-live"><i /> live demo</span>
            </div>
            <ResultCard item={selected} onMore={() => onToast('Detailed local guidance is part of the simulated result.')} />
            <div className="result-footnote">
              <Icon name="info" size={15} />
              <span>Always check your local council guidance. Bin systems vary by place.</span>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal animation="fade-up" className="identify-why">
          <div><Eyebrow>Why it helps</Eyebrow><h2>Good sorting is<br /><em>mostly context.</em></h2></div>
          <div className="why-points">
            <div><span>01</span><p><strong>Materials change.</strong> A clean container and a food-soaked container may belong in different places.</p></div>
            <div><span>02</span><p><strong>Local rules matter.</strong> Use WasteWise as a starting point, then follow your local collection guide.</p></div>
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}

function ImpactPage({ onToast }: { onToast: (message: string) => void }) {
  const [period, setPeriod] = useState('This week')
  return (
    <DashboardLayout active="/impact" onToast={onToast}>
      <div className="inner-page impact-page">
        <PageHeader
          eyebrow="My impact / 02"
          title="Small moves,"
          emphasis="visible rhythm."
          description="A calm snapshot of your demo sorting habit. These numbers are sample data, made to show the shape of the experience."
          action={<button className="period-select" onClick={() => setPeriod(period === 'This week' ? 'This month' : 'This week')} data-cursor="pointer">{period}<Icon name="chevron" size={15} /></button>}
        />

        <ScrollReveal cascade animation="fade-up" className="impact-stats">
          <TiltCard as="div" maxTilt={6} className="impact-stat stat-lime" data-cursor="card" data-cursor-label="METRIC">
            <span className="stat-icon"><Icon name="recycle" size={20} /></span>
            <span className="section-label">ITEMS SORTED</span>
            <strong><CountUp to={12} /></strong>
            <small>+18% vs last week</small>
          </TiltCard>

          <TiltCard as="div" maxTilt={6} className="impact-stat stat-mint" data-cursor="card" data-cursor-label="METRIC">
            <span className="stat-icon"><Icon name="sprout" size={20} /></span>
            <span className="section-label">KEPT IN THE LOOP</span>
            <strong><CountUp to={8} /></strong>
            <small>recyclables + compost</small>
          </TiltCard>

          <TiltCard as="div" maxTilt={6} className="impact-stat stat-lilac" data-cursor="card" data-cursor-label="METRIC">
            <span className="stat-icon"><Icon name="flame" size={20} /></span>
            <span className="section-label">CURRENT STREAK</span>
            <strong><CountUp to={4} /> <small>days</small></strong>
            <small>Personal best: 6 days</small>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={120}>
          <TiltCard as="div" maxTilt={4} className="impact-chart-card">
            <div className="card-heading">
              <div><span className="section-label">SORTING PACE / DEMO DATA</span><h2>Your week, at a glance</h2></div>
              <span className="chart-legend"><i /> items sorted</span>
            </div>
            <div className="large-chart">
              <div className="chart-y"><span>8</span><span>6</span><span>4</span><span>2</span><span>0</span></div>
              <div className="chart-bars">
                {[['M', 2], ['T', 4], ['W', 3], ['T', 6], ['F', 5], ['S', 8], ['S', 4]].map(([day, value], index) => (
                  <div className={index === 5 ? 'chart-bar-col today' : 'chart-bar-col'} key={`${day}-${index}`}>
                    <div className="bar-shell"><i style={{ height: `${Number(value) * 11}%` }} /></div>
                    <span>{day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-foot">
              <span><Icon name="target" size={15} /> Goal: 15 items this week</span>
              <strong><CountUp to={80} suffix="% there" /></strong>
            </div>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal cascade animation="fade-up" delay={200} className="impact-bottom">
          <TiltCard as="section" maxTilt={6} className="milestone-card" data-cursor="card" data-cursor-label="GOAL">
            <Magnetic strength={0.3}>
              <div className="milestone-orbit"><Icon name="sprout" size={27} /></div>
            </Magnetic>
            <div>
              <span className="section-label">NEXT MILESTONE</span>
              <h2>Keep the loop<br /><em>in motion.</em></h2>
              <p>Three more sorted items unlock your “Good Loop” marker.</p>
              <div className="milestone-track"><i style={{ width: '80%' }} /></div>
              <small>12 of 15 items</small>
            </div>
          </TiltCard>
          <ActivityList onToast={onToast} />
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}

function LearnPage({ onToast }: { onToast: (message: string) => void }) {
  const lessons = [
    { number: '01', title: 'The clean + dry rule', text: 'A quick rinse and a shake can be the difference between a useful material and general waste.', icon: 'droplet' as IconName, color: 'mint' },
    { number: '02', title: 'When in doubt, leave it out', text: 'One confusing item can contaminate a whole recycling stream. Check before you toss.', icon: 'shield' as IconName, color: 'lilac' },
    { number: '03', title: 'Compost likes the real stuff', text: 'Food scraps, coffee grounds, and garden waste can go back to the soil—not in a plastic bag.', icon: 'sprout' as IconName, color: 'lime' }
  ]
  return (
    <DashboardLayout active="/learn" onToast={onToast}>
      <div className="inner-page learn-page">
        <PageHeader
          eyebrow="Learn / 03"
          title="The better"
          emphasis="sorting guide."
          description="A few useful principles for the moments when the bin label isn’t enough."
          action={<Button variant="dark" onClick={() => navigate('/identify')}>Try an item <Icon name="arrowUpRight" size={16} /></Button>}
        />

        <section className="learn-feature">
          <ScrollReveal animation="fade-right" className="feature-copy">
            <span className="section-label">FIELD NOTE / 01</span>
            <h2>
              <KineticText as="span">Think in</KineticText>
              <KineticText as="span" delay={120}><em>materials.</em></KineticText>
            </h2>
            <p>The object’s shape can be misleading. A takeaway cup looks like paper, but its lining may make it a different story. Start with the material, then the condition.</p>
            <button className="underline-link" onClick={() => onToast('More field notes are coming soon in this demo.')} data-cursor="pointer">Read the full note <Icon name="arrowUpRight" size={14} /></button>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={120} className="material-stack">
            <div className="stack-label">MATERIAL / CONDITION</div>
            <TiltCard maxTilt={10} className="stack-card stack-top" data-cursor="card" data-cursor-label="PAPER">
              <span className="stack-icon"><Icon name="package" size={22} /></span>
              <strong>paper cup</strong>
              <small>looks recyclable</small>
            </TiltCard>
            <TiltCard maxTilt={10} className="stack-card stack-middle" data-cursor="card" data-cursor-label="LINED">
              <span className="stack-icon"><Icon name="droplet" size={22} /></span>
              <strong>lined + wet</strong>
              <small>condition changes the answer</small>
            </TiltCard>
            <TiltCard maxTilt={10} className="stack-card stack-bottom" data-cursor="card" data-cursor-label="LOCAL">
              <span className="stack-icon"><Icon name="info" size={22} /></span>
              <strong>check local guidance</strong>
              <small>context completes the picture</small>
            </TiltCard>
          </ScrollReveal>
        </section>

        <section className="lesson-section">
          <ScrollReveal animation="fade-right" className="lesson-heading">
            <Eyebrow>Three useful rules</Eyebrow>
            <h2>
              <KineticText as="span">Keep these</KineticText>
              <KineticText as="span" delay={120}><em>close by.</em></KineticText>
            </h2>
          </ScrollReveal>

          <ScrollReveal cascade animation="fade-up" delay={120} className="lesson-grid">
            {lessons.map((lesson) => (
              <TiltCard
                as="article"
                className={`lesson-card lesson-${lesson.color}`}
                key={lesson.number}
                data-cursor="card"
                data-cursor-label="RULE"
                maxTilt={7}
              >
                <div className="lesson-top"><span>{lesson.number}</span><span className="lesson-icon"><Icon name={lesson.icon} size={21} /></span></div>
                <h3>{lesson.title}</h3>
                <p>{lesson.text}</p>
                <button className="round-arrow" onClick={() => onToast('This lesson is part of the demo guide.')} aria-label={`Open ${lesson.title}`} data-cursor="pointer">
                  <Icon name="arrowUpRight" size={17} />
                </button>
              </TiltCard>
            ))}
          </ScrollReveal>
        </section>

        <ScrollReveal animation="fade-up" className="learn-cta">
          <div>
            <Eyebrow light>Ready when you are</Eyebrow>
            <h2>
              <KineticText as="span">Turn the next</KineticText>
              <KineticText as="span" delay={120}><em>maybe into a yes.</em></KineticText>
            </h2>
          </div>
          <Button variant="lime" onClick={() => navigate('/identify')}>Identify an item <Icon name="arrowUpRight" size={16} /></Button>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  )
}

export default function App() {
  const [path, setPath] = useState<Route>(() => routeFromPath(window.location.pathname))
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const handlePopState = () => setPath(routeFromPath(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    document.title = path === '/' ? 'WasteWise — Sort what matters' : `WasteWise — ${navItems.find((item) => item.href === path)?.label || 'Demo login'}`
  }, [path])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 3600)
  }

  return (
    <>
      <CustomCursor />
      <div key={path} className={`app-root route-${path.slice(1) || 'home'}`}>
        {path === '/' && <LandingPage />}
        {path === '/login' && <LoginPage onToast={notify} />}
        {path === '/dashboard' && <DashboardHome onToast={notify} />}
        {path === '/identify' && <IdentifyPage onToast={notify} />}
        {path === '/impact' && <ImpactPage onToast={notify} />}
        {path === '/learn' && <LearnPage onToast={notify} />}
      </div>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={16} />
          {toast}
        </div>
      )}
    </>
  )
}
