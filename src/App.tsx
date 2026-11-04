import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CustomCursor } from './components/Cursor'
import { Magnetic } from './components/Magnetic'
import { TiltCard } from './components/TiltCard'
import { KineticText } from './components/KineticText'
import { ScrollReveal } from './components/ScrollReveal'
import { Marquee } from './components/Marquee'
import { CountUp } from './components/CountUp'
import { MotionToggle } from './components/MotionToggle'
import { TypewriterText } from './components/TypewriterText'

type Route = '/' | '/login' | '/dashboard' | '/identify' | '/impact' | '/learn'
type IconName =
  | 'arrowUpRight' | 'arrowRight' | 'sparkle' | 'leaf' | 'recycle' | 'search' | 'camera'
  | 'upload' | 'layout' | 'scan' | 'pulse' | 'book' | 'chevron' | 'check' | 'lock'
  | 'eye' | 'eyeOff' | 'play' | 'plus' | 'logout' | 'menu' | 'bell' | 'compass'
  | 'trash' | 'shield' | 'flame' | 'droplet' | 'package' | 'circle' | 'globe' | 'info'
  | 'external' | 'x' | 'clock' | 'target' | 'filter' | 'sprout' | 'barChart'

interface UserProfile {
  name: string
  email: string
  streak: number
}

const DEFAULT_USER: UserProfile = {
  name: 'Alex Sharma',
  email: 'alex.sharma@example.com',
  streak: 4,
}

function getSavedUser(): UserProfile {
  try {
    const raw = localStorage.getItem('wastewise_user')
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_USER
}

function getFormattedCurrentDate(): string {
  const now = new Date()
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
  
  const dayName = days[now.getDay()]
  const dayNum = String(now.getDate()).padStart(2, '0')
  const monthName = months[now.getMonth()]
  const year = now.getFullYear()
  
  return `${dayName}, ${dayNum} ${monthName} ${year}`
}

const DASHBOARD_GREETINGS = [
  'Welcome back,',
  'Great to see you,',
  "Let's sort smarter,",
  'Make today count,',
  'Ready to make a difference,',
  'Good to have you here,',
  'Keep making a difference,',
]

let sessionDashboardGreeting = ''

function getSessionDashboardGreeting(): string {
  if (!sessionDashboardGreeting) {
    const randomIndex = Math.floor(Math.random() * DASHBOARD_GREETINGS.length)
    sessionDashboardGreeting = DASHBOARD_GREETINGS[randomIndex]
  }
  return sessionDashboardGreeting
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return (name.slice(0, 2) || 'AS').toUpperCase()
}

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

const straightenedLearnCards = new Set<string>()

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

function Brand({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  return (
    <Magnetic strength={0.25}>
      <button
        className={`brand ${inverted ? 'brand-inverted' : ''} ${compact ? 'brand-compact' : ''}`}
        onClick={() => navigate('/')}
        aria-label="WasteWise home"
        data-cursor="pointer"
        title="WasteWise home"
      >
        <span className="brand-mark" aria-hidden="true"><i /><i /></span>
        {!compact && (
          <span className="brand-name">waste<span>wise</span></span>
        )}
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
          <Button variant="lime" onClick={() => navigate('/login')}>Get started <Icon name="arrowUpRight" size={16} /></Button>
        </div>
      </header>

      <section className="hero page-wrap">
        <div className="hero-copy">
          <ScrollReveal animation="fade-up" delay={50}>
            <Eyebrow>AI Waste Recognition Platform v2.4</Eyebrow>
          </ScrollReveal>
          
          <h1 className="hero-title">
            <span className="hero-title-static">Sort what</span>
            <span className="hero-typewriter-line" aria-label="Sort what matters.">
              <TypewriterText
                words={['matters.', 'counts.', 'lasts.', 'belongs.', 'inspires.', 'transforms.']}
              />
            </span>
          </h1>

          <ScrollReveal animation="fade-up" delay={280}>
            <p className="hero-lede">WasteWise turns uncertainty into instant environmental action. Point, scan, and sort with AI precision—keeping useful materials in motion with zero guesswork.</p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={360}>
            <div className="hero-actions">
              <Button variant="lime" onClick={() => navigate('/login')}>Start sorting <Icon name="arrowUpRight" size={17} /></Button>
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
        <div className="marquee-item"><span>Keep materials in motion</span><span className="marquee-pill">AI ACTIVE</span><span className="marquee-arrow">✦</span></div>
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
          <button onClick={() => navigate('/login')} data-cursor="pointer">Log in <Icon name="arrowUpRight" size={14} /></button>
        </div>
      </footer>
    </main>
  )
}

function LoginPage({ onLogin, onToast }: { onLogin: (profile: UserProfile) => void; onToast: (message: string) => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', remember: true })
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'Please enter your full name.'
    if (!form.email.trim()) next.email = 'Please enter your email address.'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address (e.g., alex@example.com).'
    if (!form.password.trim()) next.password = 'Please enter your password.'
    setErrors(next)
    
    if (Object.keys(next).length === 0) {
      const userProfile: UserProfile = {
        name: form.name.trim(),
        email: form.email.trim(),
        streak: 4,
      }
      onLogin(userProfile)
      onToast(`Welcome, ${userProfile.name}!`)
      navigate('/dashboard')
    }
  }

  return (
    <main className="login-page">
      <div className="login-aside">
        <div className="login-aside-top"><Brand inverted /><span className="aside-index">SIGN IN</span></div>
        <div className="login-aside-content">
          <ScrollReveal animation="fade-up" delay={50}>
            <Eyebrow light>Intelligent Waste Management</Eyebrow>
          </ScrollReveal>
          <h1 className="login-heading">
            <span className="login-heading-static">Make room</span>
            <span className="login-typewriter-row">
              <span className="login-heading-for">for&nbsp;</span>
              <span className="login-typewriter-line" aria-label="Make room for better.">
                <TypewriterText
                  words={['better.', 'change.', 'nature.', 'tomorrow.', 'impact.']}
                />
              </span>
            </span>
          </h1>
          <ScrollReveal animation="fade-up" delay={200}>
            <p>Sign in to your dashboard to track sorting, prevent contamination, and keep circular materials moving.</p>
          </ScrollReveal>
          <SortGraphic compact />
        </div>
        <div className="aside-footer"><span>WasteWise</span><span>Environmental Intelligence</span></div>
      </div>

      <div className="login-panel">
        <div className="login-panel-top">
          <button className="back-link" onClick={() => navigate('/')} data-cursor="pointer"><Icon name="arrowRight" size={17} /> Back to home</button>
          <MotionToggle />
        </div>
        <ScrollReveal animation="fade-up" delay={100} className="login-form-wrap">
          <Eyebrow>Welcome Back</Eyebrow>
          <h2>
            <KineticText as="span">Sign in to</KineticText>
            <KineticText as="span" delay={120}><em>WasteWise.</em></KineticText>
          </h2>
          <p className="form-intro">Enter your details to access your waste segregation workspace and impact analytics.</p>
          <form className="login-form" onSubmit={submit} noValidate>
            <label>
              Full Name
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <span className="field-error" id="name-error">{errors.name}</span>}
            </label>
            <label>
              Email Address
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <span className="field-error" id="email-error">{errors.email}</span>}
            </label>
            <label>
              Password
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
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
              <button type="button" className="inline-action" onClick={() => onToast('Password reset link will be sent to your email.')} data-cursor="pointer">Forgot password?</button>
            </div>
            <Button type="submit" variant="lime" className="login-submit">Log in <Icon name="arrowUpRight" size={17} /></Button>
          </form>
        </ScrollReveal>
      </div>
    </main>
  )
}

function DashboardLayout({
  active,
  children,
  user,
  onToast,
  sidebarCollapsed,
  onToggleSidebar,
  onLogout,
}: {
  active: Route
  children: ReactNode
  user: UserProfile
  onToast: (message: string) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onLogout: () => void
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileDropdownOpen])

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'shell-sidebar-collapsed' : ''}`}>
      {mobileDrawerOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileDrawerOpen ? 'mobile-drawer-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand-wrap">
            <Brand compact={sidebarCollapsed} />
          </div>
          {!sidebarCollapsed && <div className="sidebar-caption">PERSONAL SORTING GUIDE</div>}
          <nav className="app-nav" aria-label="Dashboard navigation">
            {navItems.map((item) => (
              <a
                className={`app-nav-link ${active === item.href ? 'active' : ''}`}
                href={item.href}
                key={item.href}
                onClick={(event) => {
                  event.preventDefault()
                  navigate(item.href)
                  setMobileDrawerOpen(false)
                }}
                data-cursor="pointer"
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="nav-icon"><Icon name={item.icon} size={19} /></span>
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                {sidebarCollapsed && <span className="nav-tooltip" role="tooltip">{item.label}</span>}
                {active === item.href && !sidebarCollapsed && <i className="nav-active-dot" />}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              className="sidebar-toggle-btn"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                  setMobileDrawerOpen(!mobileDrawerOpen)
                } else {
                  onToggleSidebar()
                }
              }}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              data-cursor="pointer"
            >
              <Icon name="menu" size={20} />
            </button>
            <div className="topbar-breadcrumb">
              <span>WasteWise</span>
              <Icon name="chevron" size={14} />
              <strong>{navItems.find((item) => item.href === active)?.label}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button notification-btn"
              onClick={() => onToast('You are all caught up on sorting alerts.')}
              aria-label="Notifications"
              data-cursor="pointer"
            >
              <Icon name="bell" size={19} />
              <span className="notification-dot" />
            </button>

            {/* Streak Indicator with Hover Popover (Requirement 2.1 & 2.2) */}
            <div className="streak-container">
              <div
                className="streak-pill"
                tabIndex={0}
                aria-label={`${user.streak} day streak`}
                data-cursor="pointer"
              >
                <span className="streak-pill-icon"><Icon name="flame" size={16} /></span>
                <span className="streak-pill-count">{user.streak}</span>
              </div>
              <div className="streak-popover" role="tooltip">
                <div className="streak-popover-badge">
                  <Icon name="flame" size={20} />
                </div>
                <div className="streak-popover-content">
                  <div className="streak-popover-title">{user.streak} day streak</div>
                  <div className="streak-popover-sub">Keep the loop going</div>
                </div>
              </div>
            </div>

            <MotionToggle />

            {/* User Profile Avatar with Dropdown (Requirement 2.4) */}
            <div className="profile-menu-container" ref={profileDropdownRef}>
              <button
                className="top-avatar-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
                aria-label="User profile menu"
                data-cursor="pointer"
              >
                {getInitials(user.name)}
              </button>

              {profileDropdownOpen && (
                <div className="profile-dropdown" role="menu">
                  <div className="profile-dropdown-user">
                    <div className="profile-dropdown-name">{user.name}</div>
                    <div className="profile-dropdown-email">{user.email}</div>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button
                    className="profile-dropdown-item profile-logout-btn"
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      onLogout()
                    }}
                    role="menuitem"
                    data-cursor="pointer"
                  >
                    <Icon name="logout" size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="app-content">{children}</div>
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
          <span className="result-kicker">VERIFIED MATCH / {item.category}</span>
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
    { title: 'Compost', sub: 'Food and garden scraps', icon: 'leaf' as IconName, color: 'lime', item: wasteCatalog[1] },
    { title: 'General Waste', sub: 'Non-recyclable items', icon: 'trash' as IconName, color: 'peach', item: wasteCatalog[2] },
    { title: 'Hazardous Waste', sub: 'Batteries and chemicals', icon: 'shield' as IconName, color: 'lilac', item: wasteCatalog[3] }
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
          maxTilt={6}
          scale={1.01}
        >
          <span className={`bin-icon bin-${bin.color}`}>
            <Icon name={bin.icon} size={22} />
          </span>
          <div className="bin-card-info">
            <h4 className="bin-card-title">{bin.title}</h4>
            <p className="bin-card-desc">{bin.sub}</p>
          </div>
          <span className="bin-card-arrow">
            <Icon name="arrowUpRight" size={17} />
          </span>
        </TiltCard>
      ))}
    </div>
  )
}

function ImpactSummary() {
  return (
    <TiltCard as="section" className="impact-summary-card" maxTilt={5}>
      <div className="card-heading">
        <div><span className="section-label">THIS WEEK</span><h2>Your sorting rhythm</h2></div>
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
        <button className="small-icon-button" onClick={() => onToast?.('Activity view filtered.')} aria-label="Filter activity" data-cursor="pointer"><Icon name="filter" size={16} /></button>
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

function DashboardHome({
  user,
  onToast,
  sidebarCollapsed,
  onToggleSidebar,
  onLogout,
}: {
  user: UserProfile
  onToast: (message: string) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onLogout: () => void
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<WasteItem | null>(null)
  const [currentDate, setCurrentDate] = useState(() => getFormattedCurrentDate())
  const [greeting] = useState(() => getSessionDashboardGreeting())

  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(getFormattedCurrentDate())
    }
    const interval = setInterval(updateDate, 30000)
    return () => clearInterval(interval)
  }, [])

  const result = useMemo(() => query.trim() ? wasteCatalog.find((item) => `${item.name} ${item.bin}`.toLowerCase().includes(query.toLowerCase())) : null, [query])

  function runSearch() {
    if (result) setSelected(result)
    else if (query.trim()) onToast('No match found — try bottle, peel, tissue, or battery.')
    else onToast('Start with an item name or choose a quick bin below.')
  }

  return (
    <DashboardLayout
      active="/dashboard"
      user={user}
      onToast={onToast}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      onLogout={onLogout}
    >
      <div className="dashboard-page">
        <div className="dashboard-welcome">
          <div>
            <ScrollReveal animation="fade-up" delay={40}><Eyebrow>{currentDate}</Eyebrow></ScrollReveal>
            <h1 className="dashboard-welcome-heading">
              <KineticText as="span" className="greeting-line">{greeting}</KineticText>
              <KineticText as="span" delay={120} className="greeting-name-line"><em>{user.name}</em></KineticText>
            </h1>
            <ScrollReveal animation="fade-up" delay={200}><p>Ready to make the next right choice?</p></ScrollReveal>
          </div>
          <Button variant="lime" onClick={() => navigate('/identify')}>Identify an item <Icon name="arrowUpRight" size={16} /></Button>
        </div>

        <ScrollReveal animation="fade-up" delay={150}>
          <TiltCard maxTilt={4} scale={1.008} className="identify-hero">
            <div className="identify-copy">
              <span className="section-label">START HERE / SMART RECOGNITION</span>
              <h2>What are you<br /><em>sorting today?</em></h2>
              <p>Search any item or select a common packaging type to view local stream guidelines.</p>
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
              <span><span className="section-label">CLASSIFICATION RESULT</span><strong>{selected?.name || result?.name}</strong></span>
              <button onClick={() => { setSelected(null); setQuery('') }} aria-label="Close result" data-cursor="pointer"><Icon name="x" size={17} /></button>
            </div>
            <ResultCard item={selected || result || wasteCatalog[0]} onMore={() => onToast('Detailed local disposal checklist.')} />
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

function IdentifyPage({
  user,
  onToast,
  sidebarCollapsed,
  onToggleSidebar,
  onLogout,
}: {
  user: UserProfile
  onToast: (message: string) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onLogout: () => void
}) {
  const [query, setQuery] = useState('plastic bottle')
  const [selected, setSelected] = useState(wasteCatalog[0])
  const [uploadedName, setUploadedName] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [imageConfirmed, setImageConfirmed] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const cameraRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])
  useEffect(() => {
    if (!cameraStream) return
    if (videoRef.current) videoRef.current.srcObject = cameraStream
    return () => cameraStream.getTracks().forEach((track) => track.stop())
  }, [cameraStream])

  function identify() {
    const found = wasteCatalog.find((item) => `${item.name} ${item.bin}`.toLowerCase().includes(query.toLowerCase()))
    if (found) {
      setSelected(found)
      clearUploadedImage()
    } else onToast('Item not found. Try one of the common sample items below.')
  }

  function processImageFile(file: File) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      onToast('Please choose a JPG or PNG image.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      onToast('Please choose an image smaller than 10MB.')
      return
    }

    setUploadedName(file.name)
    setPreviewUrl(URL.createObjectURL(file))
    setPendingImage(file)
    setImageConfirmed(false)
  }

  function confirmImageUpload() {
    if (!pendingImage) return
    const file = pendingImage
    setSelected({
      ...wasteCatalog[0],
      name: file.name.replace(/\.[^/.]+$/, ''),
      shortName: 'Uploaded Item',
      confidence: 96,
      description: 'Identified based on packaging material standards. Follow standard recycling procedures.',
      tip: 'Ensure the container is empty, rinsed, and dry before placing in the blue bin.'
    })
    setPendingImage(null)
    setImageConfirmed(true)
    onToast('Image uploaded and analyzed successfully.')
  }

  function clearUploadedImage() {
    setUploadedName('')
    setPreviewUrl('')
    setPendingImage(null)
    setImageConfirmed(false)
  }

  function removeUploadedImage() {
    if (imageConfirmed) setSelected(wasteCatalog[0])
    clearUploadedImage()
  }

  function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.currentTarget.value = ''
    if (file) processImageFile(file)
  }

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraRef.current?.click()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      setCameraStream(stream)
    } catch {
      onToast('Camera access was blocked. Allow camera permission or upload an image instead.')
    }
  }

  function captureCameraImage() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      onToast('Camera is still starting. Please try again in a moment.')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) {
      onToast('The camera image could not be captured. Please try again.')
      return
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) {
        onToast('The camera image could not be captured. Please try again.')
        return
      }
      processImageFile(new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' }))
      setCameraStream(null)
    }, 'image/jpeg', 0.92)
  }

  return (
    <DashboardLayout
      active="/identify"
      user={user}
      onToast={onToast}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      onLogout={onLogout}
    >
      <div className="inner-page identify-page">
        <PageHeader
          eyebrow="Identify waste / 01"
          title="Not sure where it"
          emphasis="goes?"
          description="Start with a name, a sample, or a photo. We’ll point you in the right direction—without the lecture."
        />

        <div className="identify-layout">
          <ScrollReveal animation="fade-right">
            <TiltCard as="section" maxTilt={4} className="identify-control-card">
              <div className="control-card-top">
                <span className="section-label">01 / CHOOSE YOUR START</span>
                <span className="control-status"><Icon name="lock" size={13} /> MUNICIPAL INDEX v2.4</span>
              </div>
              <SearchField value={query} onChange={setQuery} onSubmit={identify} placeholder="Try “glass jar” or “banana peel”" />
              <div className="sample-items">
                <span>Popular packaging types</span>
                <div>
                  {wasteCatalog.map((item) => (
                    <button
                      className={selected.name === item.name ? 'selected' : ''}
                      key={item.name}
                      onClick={() => { setQuery(item.shortName); setSelected(item); clearUploadedImage() }}
                      data-cursor="pointer"
                    >
                      <span className={`sample-dot dot-${item.accent}`}><Icon name={item.icon} size={15} /></span>
                      {item.shortName}
                      <Icon name="arrowUpRight" size={13} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="upload-divider"><span>or capture / upload an image</span></div>
              <div className="upload-actions">
                <div className="upload-card-wrap">
                  <TiltCard as="button" maxTilt={6} className={`upload-card${uploadedName ? ' has-upload' : ''}`} onClick={() => fileRef.current?.click()} data-cursor="pointer">
                    <span className="upload-preview">
                      {previewUrl ? <img src={previewUrl} alt="Uploaded sample preview" /> : <span className="upload-icon"><Icon name="upload" size={20} /></span>}
                    </span>
                    <span>
                      <strong>{uploadedName || 'Upload an image'}</strong>
                      <small>{uploadedName ? (imageConfirmed ? 'Image uploaded · tap to replace' : 'Ready to upload · tap to replace') : 'JPG or PNG · up to 10MB'}</small>
                    </span>
                    {!uploadedName && <Icon name="arrowUpRight" size={16} />}
                  </TiltCard>
                  {uploadedName && (
                    <div className="upload-image-actions">
                      {!imageConfirmed && (
                        <button
                          className="upload-confirm"
                          type="button"
                          onClick={confirmImageUpload}
                          aria-label="Confirm and upload image"
                          title="Upload image"
                          data-cursor="pointer"
                        >
                          <Icon name="check" size={15} />
                        </button>
                      )}
                      <button
                        className="upload-remove"
                        type="button"
                        onClick={removeUploadedImage}
                        aria-label="Remove uploaded image"
                        title="Remove image"
                        data-cursor="pointer"
                      >
                        <Icon name="x" size={15} />
                      </button>
                    </div>
                  )}
                </div>
                <TiltCard as="button" maxTilt={6} className="camera-card" onClick={openCamera} data-cursor="pointer">
                  <Icon name="camera" size={22} />
                  <span>Use camera</span>
                </TiltCard>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={chooseFile} hidden />
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={chooseFile} hidden />
              </div>
            </TiltCard>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={120} className="identify-result-column">
            <div className="result-column-heading">
              <div><span className="section-label">02 / YOUR ANSWER</span><h2>Here’s the<br /><em>best match.</em></h2></div>
              <span className="result-live"><i /> VERIFIED MATCH</span>
            </div>
            <ResultCard item={selected} onMore={() => onToast('Full municipal guidelines and disposal checklist.')} />
            <div className="result-footnote">
              <Icon name="info" size={15} />
              <span>Always check your local council guidance. Bin systems vary by place.</span>
            </div>
          </ScrollReveal>
        </div>

        {cameraStream && (
          <div className="camera-dialog-backdrop">
            <section className="camera-dialog" role="dialog" aria-modal="true" aria-labelledby="camera-dialog-title">
              <div className="camera-dialog-header">
                <h2 id="camera-dialog-title">Take a photo</h2>
                <button type="button" onClick={() => setCameraStream(null)} aria-label="Close camera" data-cursor="pointer">
                  <Icon name="x" size={18} />
                </button>
              </div>
              <video ref={videoRef} autoPlay muted playsInline aria-label="Camera preview" />
              <div className="camera-dialog-actions">
                <Button variant="outline" onClick={() => setCameraStream(null)}>Cancel</Button>
                <Button variant="lime" onClick={captureCameraImage}><Icon name="camera" size={17} /> Capture photo</Button>
              </div>
            </section>
          </div>
        )}

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

function ImpactPage({
  user,
  onToast,
  sidebarCollapsed,
  onToggleSidebar,
  onLogout,
}: {
  user: UserProfile
  onToast: (message: string) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onLogout: () => void
}) {
  const [period, setPeriod] = useState('This week')
  const isMonthly = period === 'This month'
  const chartData = isMonthly
    ? [['W1', 9], ['W2', 12], ['W3', 10], ['W4', 15]]
    : [['M', 2], ['T', 4], ['W', 3], ['T', 6], ['F', 5], ['S', 8], ['S', 4]]
  const chartMaximum = isMonthly ? 16 : 8
  const sortedItems = isMonthly ? 46 : 12
  const loopItems = isMonthly ? 31 : 8
  const progress = isMonthly ? 77 : 80

  return (
    <DashboardLayout
      active="/impact"
      user={user}
      onToast={onToast}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      onLogout={onLogout}
    >
      <div className="inner-page impact-page">
        <PageHeader
          eyebrow="My impact / 02"
          title="Small moves,"
          emphasis="visible rhythm."
          description="A clear snapshot of your sorting habits, material recovery, and carbon reduction."
          action={
            <label className="period-select-wrap">
              <select
                className="period-select"
                aria-label="Select impact reporting period"
                value={period}
                onChange={(event) => setPeriod(event.currentTarget.value)}
                data-cursor="pointer"
              >
                <option>This week</option>
                <option>This month</option>
              </select>
              <Icon name="chevron" size={15} />
            </label>
          }
        />

        <ScrollReveal cascade animation="fade-up" className="impact-stats">
          <TiltCard as="div" maxTilt={6} className="impact-stat stat-lime" data-cursor="card" data-cursor-label="METRIC">
            <span className="stat-icon"><Icon name="recycle" size={20} /></span>
            <span className="section-label">ITEMS SORTED</span>
            <strong><CountUp key={`${period}-sorted`} to={sortedItems} /></strong>
            <small>{isMonthly ? '+18% vs last month' : '+18% vs last week'}</small>
          </TiltCard>

          <TiltCard as="div" maxTilt={6} className="impact-stat stat-mint" data-cursor="card" data-cursor-label="METRIC">
            <span className="stat-icon"><Icon name="sprout" size={20} /></span>
            <span className="section-label">KEPT IN THE LOOP</span>
            <strong><CountUp key={`${period}-loop`} to={loopItems} /></strong>
            <small>recyclables + compost</small>
          </TiltCard>

          <TiltCard as="div" maxTilt={6} className="impact-stat stat-lilac" data-cursor="card" data-cursor-label="METRIC">
            <span className="stat-icon"><Icon name="flame" size={20} /></span>
            <span className="section-label">CURRENT STREAK</span>
            <strong><CountUp to={user.streak} /> <small>days</small></strong>
            <small>Personal best: 6 days</small>
          </TiltCard>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={120}>
          <TiltCard as="div" maxTilt={4} className="impact-chart-card">
            <div className="card-heading">
              <div><span className="section-label">SORTING PACE</span><h2>Your {isMonthly ? 'month' : 'week'}, at a glance</h2></div>
              <span className="chart-legend"><i /> items sorted</span>
            </div>
            <div className="large-chart">
              <div className="chart-y">
                {(isMonthly ? [16, 12, 8, 4, 0] : [8, 6, 4, 2, 0]).map((value) => <span key={value}>{value}</span>)}
              </div>
              <div className="chart-bars">
                {chartData.map(([label, value], index) => (
                  <div className={index === (isMonthly ? chartData.length - 1 : 5) ? 'chart-bar-col today' : 'chart-bar-col'} key={`${label}-${index}`}>
                    <div className="bar-shell"><i style={{ height: `${Number(value) / chartMaximum * 88}%` }} /></div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-foot">
              <span><Icon name="target" size={15} /> Goal: {isMonthly ? '60 items this month' : '15 items this week'}</span>
              <strong><CountUp key={`${period}-progress`} to={progress} suffix="% there" /></strong>
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

function LearnPage({
  user,
  onToast,
  sidebarCollapsed,
  onToggleSidebar,
  onLogout,
}: {
  user: UserProfile
  onToast: (message: string) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onLogout: () => void
}) {
  const [straightenedCards, setStraightenedCards] = useState(() => new Set(straightenedLearnCards))

  function straightenCard(card: string) {
    if (straightenedLearnCards.has(card)) return
    straightenedLearnCards.add(card)
    setStraightenedCards(new Set(straightenedLearnCards))
  }

  const lessons = [
    { number: '01', title: 'The clean + dry rule', text: 'A quick rinse and a shake can be the difference between a useful material and general waste.', icon: 'droplet' as IconName, color: 'mint' },
    { number: '02', title: 'When in doubt, leave it out', text: 'One confusing item can contaminate a whole recycling stream. Check before you toss.', icon: 'shield' as IconName, color: 'lilac' },
    { number: '03', title: 'Compost likes the real stuff', text: 'Food scraps, coffee grounds, and garden waste can go back to the soil—not in a plastic bag.', icon: 'sprout' as IconName, color: 'lime' }
  ]
  return (
    <DashboardLayout
      active="/learn"
      user={user}
      onToast={onToast}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      onLogout={onLogout}
    >
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
            <button className="underline-link" onClick={() => onToast('Full field note opened.')} data-cursor="pointer">Read the full note <Icon name="arrowUpRight" size={14} /></button>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={120} className="material-stack">
            <div className="stack-label">MATERIAL / CONDITION</div>
            <TiltCard maxTilt={0} scale={1} className="stack-card stack-top" style={straightenedCards.has('paper') ? { rotate: '0deg' } : undefined} onMouseEnter={() => straightenCard('paper')} data-cursor="card" data-cursor-label="PAPER">
              <span className="stack-icon"><Icon name="package" size={22} /></span>
              <span className="stack-copy">
                <strong>paper cup</strong>
                <small>looks recyclable</small>
              </span>
            </TiltCard>
            <TiltCard maxTilt={0} scale={1} className="stack-card stack-middle" style={straightenedCards.has('lined') ? { rotate: '0deg' } : undefined} onMouseEnter={() => straightenCard('lined')} data-cursor="card" data-cursor-label="LINED">
              <span className="stack-icon"><Icon name="droplet" size={22} /></span>
              <span className="stack-copy">
                <strong>lined + wet</strong>
                <small>condition changes the answer</small>
              </span>
            </TiltCard>
            <TiltCard maxTilt={0} scale={1} className="stack-card stack-bottom" style={straightenedCards.has('local') ? { rotate: '0deg' } : undefined} onMouseEnter={() => straightenCard('local')} data-cursor="card" data-cursor-label="LOCAL">
              <span className="stack-icon"><Icon name="info" size={22} /></span>
              <span className="stack-copy">
                <strong>check local guidance</strong>
                <small>context completes the picture</small>
              </span>
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
                <button className="round-arrow" onClick={() => onToast('Lesson opened.')} aria-label={`Open ${lesson.title}`} data-cursor="pointer">
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
  const [user, setUser] = useState<UserProfile>(() => getSavedUser())
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wastewise_sidebar_collapsed') === 'true'
    } catch {}
    return false
  })

  useEffect(() => {
    const handlePopState = () => setPath(routeFromPath(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    document.title = path === '/' ? 'WasteWise — Sort what matters' : `WasteWise — ${navItems.find((item) => item.href === path)?.label || 'Login'}`
  }, [path])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 3600)
  }

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('wastewise_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  const handleLogin = (newUser: UserProfile) => {
    sessionDashboardGreeting = ''
    setUser(newUser)
    try {
      localStorage.setItem('wastewise_user', JSON.stringify(newUser))
      localStorage.setItem('wastewise_logged_in', 'true')
    } catch {}
  }

  const handleLogout = () => {
    sessionDashboardGreeting = ''
    try {
      localStorage.removeItem('wastewise_logged_in')
    } catch {}
    notify('Logged out successfully.')
    navigate('/login')
  }

  return (
    <>
      <CustomCursor />
      <div key={path} className={`app-root route-${path.slice(1) || 'home'}`}>
        {path === '/' && <LandingPage />}
        {path === '/login' && <LoginPage onLogin={handleLogin} onToast={notify} />}
        {path === '/dashboard' && (
          <DashboardHome
            user={user}
            onToast={notify}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
          />
        )}
        {path === '/identify' && (
          <IdentifyPage
            user={user}
            onToast={notify}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
          />
        )}
        {path === '/impact' && (
          <ImpactPage
            user={user}
            onToast={notify}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
          />
        )}
        {path === '/learn' && (
          <LearnPage
            user={user}
            onToast={notify}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
          />
        )}
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
