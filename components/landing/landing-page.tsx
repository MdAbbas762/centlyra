'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, ArrowDownLeft, ArrowUpRight as ArrowNorthEast,
  Check, ChevronDown, Layers3, LayoutDashboard,
  Menu, WalletCards, X, Target, ChartNoAxesCombined, CircleDot,
} from 'lucide-react'
import { motion } from 'motion/react'
import { BrandMark } from '@/components/brand/brand-mark'
import { formatMoney } from '@/lib/finance/money'
import { useAppSelector } from '@/store/hooks'
import { selectHydrated, selectMonthSummary, selectTotalBalance, selectBudgetTotals } from '@/store/selectors'

type NavItem = { id: string; label: string }
const MENU: NavItem[] = [
  { id: 'why-centlyra', label: 'The idea' },
  { id: 'features', label: 'What you can do' },
  { id: 'experience', label: 'How it works' },
]

function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" aria-label="Centlyra home" className="lp-brand">
      <BrandMark className={small ? 'size-8' : 'size-10'} />
      <span>Centlyra<span className="lp-brand-dot">.</span></span>
    </Link>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 45)
    scroll()
    window.addEventListener('scroll', scroll, { passive: true })
    const sections = MENU.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id)
      }),
      { rootMargin: '-25% 0px -60% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => { window.removeEventListener('scroll', scroll); observer.disconnect() }
  }, [])

  return (
    <header className={`lp-header ${scrolled ? 'lp-header-scrolled' : ''}`}>
      <nav className="lp-nav" aria-label="Primary navigation">
        <Brand small={scrolled} />
        <div className="lp-nav-links">
          {MENU.map((item) => (
            <a href={`#${item.id}`} key={item.id} className={active === item.id ? 'active' : ''}>
              {item.label}
            </a>
          ))}
        </div>
        <Link className="lp-nav-cta" href="/workspace">
          Open workspace <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
        <button className="lp-mobile-menu-btn" onClick={() => setMobileOpen((v) => !v)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} type="button">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {mobileOpen && (
        <div className="lp-mobile-menu">
          {MENU.map((item) => <a key={item.id} href={`#${item.id}`} onClick={() => setMobileOpen(false)}>{item.label}</a>)}
          <Link href="/workspace" onClick={() => setMobileOpen(false)}>Open workspace <ArrowUpRight size={16} /></Link>
        </div>
      )}
    </header>
  )
}

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}

function FineLine() {
  return <div className="lp-fine-line" aria-hidden="true"><span /></div>
}

function FlowGraphic({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 630 340" className={className} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Abstract flowing lines representing a clear financial picture">
      <defs>
        <linearGradient id="flow-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#18f1be" stopOpacity="0.12"/>
          <stop offset=".4" stopColor="#5affd5" stopOpacity="0.9" />
          <stop offset=".74" stopColor="#7692ff" stopOpacity=".85" />
          <stop offset="1" stopColor="#6968ff" stopOpacity=".07" />
        </linearGradient>
        <filter id="flow-glow" x="-40%" y="-100%" width="180%" height="300%"><feGaussianBlur stdDeviation="3.5" /></filter>
      </defs>
      {Array.from({ length: 18 }, (_, i) => {
        const offset = i * 9
        const d = `M 8 ${215 + offset / 2} C 148 ${280 + offset / 1.9}, 212 ${35 + offset / 1.5}, 315 ${145 + offset / 3} S 448 ${315 - offset / 2}, 628 ${36 + offset / 1.9}`
        return <path key={i} d={d} fill="none" stroke="url(#flow-line)" strokeWidth={i === 0 ? 2 : 1.1} opacity={0.22 + i / 24} />
      })}
      <path d="M 9 218 C 148 283, 215 39, 316 146 S 448 315, 627 37" fill="none" stroke="#78ffd7" opacity=".7" strokeWidth="3" filter="url(#flow-glow)" />
    </svg>
  )
}

function WorkspaceVisual() {
  const hydrated = useAppSelector(selectHydrated)
  const summary = useAppSelector(selectMonthSummary)
  const balance = useAppSelector(selectTotalBalance)
  const budgets = useAppSelector(selectBudgetTotals)
  const count = hydrated ? summary.transactionCount : 0
  return (
    <div className="lp-visual-stage" aria-label="Preview of the Centlyra workspace">
      <div className="lp-visual-halo" />
      <div className="lp-visual-grid" aria-hidden="true" />
      <motion.div className="lp-showcase" initial={{ opacity: 0, y: 55, rotateX: 6 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
        <div className="lp-showcase-bar"><div className="lp-showcase-dots"><i/><i/><i/></div><span>YOUR FINANCIAL OVERVIEW</span><LayoutDashboard size={15}/></div>
        <div className="lp-showcase-content">
          <div className="lp-preview-kicker">TOTAL BALANCE <span className="lp-preview-indicator"><i/> YOUR WORKSPACE</span></div>
          <div className="lp-preview-balance">{formatMoney(hydrated ? balance : 0)}</div>
          <div className="lp-preview-caption">Your transactions, budgets and trends. All in one place.</div>
          <div className="lp-preview-chart" aria-hidden="true">
            <div className="lp-preview-chart-glow" />
            <svg viewBox="0 0 470 156" preserveAspectRatio="none">
              <defs><linearGradient id="lp-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#55f3c6" stopOpacity=".28"/><stop offset="1" stopColor="#55f3c6" stopOpacity="0"/></linearGradient></defs>
              <path d="M0 132 C36 125 56 92 90 103 S147 121 180 78 S246 109 278 63 S328 86 364 42 S423 80 470 13 L470 156 L0 156 Z" fill="url(#lp-chart-fill)"/>
              <path d="M0 132 C36 125 56 92 90 103 S147 121 180 78 S246 109 278 63 S328 86 364 42 S423 80 470 13" fill="none" stroke="#61ebc4" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="lp-preview-divider"/>
          <div className="lp-preview-stats">
            <div><span><ArrowDownLeft size={15}/> MONEY IN</span><strong>{formatMoney(hydrated ? summary.income : 0)}</strong></div>
            <div><span><ArrowNorthEast size={15}/> MONEY OUT</span><strong>{formatMoney(hydrated ? summary.expenses : 0)}</strong></div>
          </div>
        </div>
      </motion.div>
      <motion.div className="lp-float-card lp-float-top" initial={{ opacity: 0, x: 35, y: -10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }}>
        <span className="lp-float-icon"><Target size={19}/></span><div><small>BUDGETS</small><strong>{formatMoney(hydrated ? budgets.remaining : 0)}</strong><span>Available across your limits</span></div>
      </motion.div>
      <motion.div className="lp-float-card lp-float-bottom" initial={{ opacity: 0, x: -25, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 1.0, duration: 0.7 }}>
        <span className="lp-float-icon lp-float-blue"><WalletCards size={19}/></span><div><small>THIS MONTH</small><strong>{count} {count === 1 ? 'transaction' : 'transactions'}</strong><span>Your activity, in focus</span></div>
      </motion.div>
    </div>
  )
}

function FeatureRow({ index, eyebrow, title, description, children, reversed = false }: { index: string; eyebrow: string; title: string; description: string; children: ReactNode; reversed?: boolean }) {
  return (
    <motion.div {...reveal} className={`lp-feature-row ${reversed ? 'lp-feature-reverse' : ''}`}>
      <div className="lp-feature-copy">
        <p className="lp-eyebrow"><span className="lp-feature-number">{index}</span> {eyebrow}</p>
        <h3>{title}</h3>
        <p>{description}</p>
        <Link href="/workspace" className="lp-text-link">Open workspace <ArrowUpRight size={19} /></Link>
      </div>
      <div className="lp-feature-art">{children}</div>
    </motion.div>
  )
}

function LedgerArt() {
  const items = [
    { label: 'Monthly spending', sub: 'Your spending at a glance', icon: <WalletCards size={17}/>, cls: 'mint' },
    { label: 'Category breakdown', sub: 'See what matters most', icon: <Layers3 size={17}/>, cls: 'blue' },
    { label: 'Recent activity', sub: 'A clear record of every entry', icon: <CircleDot size={17}/>, cls: 'violet' },
  ]
  return <div className="lp-ledger-art"><div className="lp-ledger-header"><span>One clear place for every detail.</span><span className="lp-ledger-dots">•••</span></div>{items.map((item,i)=><div key={item.label} className="lp-ledger-line"><span className={`lp-ledger-icon ${item.cls}`}>{item.icon}</span><span className="lp-ledger-text"><strong>{item.label}</strong><small>{item.sub}</small></span><span className="lp-ledger-index">0{i+1}</span></div>)}<div className="lp-ledger-bottom"><span>FIND YOUR FOCUS</span><ArrowRight size={17}/></div></div>
}

function BudgetArt() {
  const bars=[{name:'Everyday spending',w:48,sub:'Room to breathe',tone:'mint'},{name:'Essentials',w:69,sub:'Know your limits',tone:'blue'},{name:'Plans ahead',w:28,sub:'Stay on course',tone:'violet'}]
  return <div className="lp-budget-art"><div className="lp-budget-header"><span>SPENDING PLANS</span><Target size={21}/></div><p>Make space for<br/><em>what matters.</em></p><div className="lp-budget-bars">{bars.map(x=><div className="lp-budget-track" key={x.name}><div><strong>{x.name}</strong><small>{x.sub}</small></div><span className="lp-budget-bar"><i className={x.tone} style={{width:`${x.w}%`}}/></span></div>)}</div><div className="lp-budget-decoration" aria-hidden="true"/></div>
}

function InsightArt() {
  return <div className="lp-insight-art"><div className="lp-insight-top"><span>THE BIGGER PICTURE</span><ChartNoAxesCombined size={19}/></div><div className="lp-insight-title">A clearer view<br/>of every month.</div><div className="lp-insight-chart" aria-hidden="true"><span style={{height:'36%'}}/><span style={{height:'62%'}}/><span style={{height:'49%'}}/><span style={{height:'80%'}}/><span style={{height:'66%'}}/><span style={{height:'93%'}}/><span style={{height:'73%'}}/></div><div className="lp-insight-bottom">See your patterns. Make your next move count. <ArrowUpRight size={18}/></div></div>
}

export function LandingPage() {
  return <div className="lp-page" id="top">
    <Navbar />
    <main>
      <section className="lp-hero" aria-labelledby="lp-heading">
        <div className="lp-hero-noise" aria-hidden="true"/><div className="lp-hero-glow lp-glow-1" aria-hidden="true"/><div className="lp-hero-glow lp-glow-2" aria-hidden="true"/>
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-copy">
            <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.65}} className="lp-hero-eyebrow"><span className="lp-hero-star">✳</span> YOUR FINANCES, IN FOCUS <span className="lp-hero-rule"/></motion.div>
            <motion.h1 id="lp-heading" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.85,delay:.1}}>
              Money makes<br/>more sense<br/><span>from here<span className="lp-period">.</span></span>
            </motion.h1>
            <motion.p className="lp-hero-lead" initial={{opacity:0,y:26}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.26}}>See where it goes, plan what comes next, and feel more in control of your everyday finances.</motion.p>
            <motion.div className="lp-hero-ctas" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.38}}>
              <Link href="/workspace" className="lp-button-primary">Go to dashboard <ArrowUpRight size={20}/></Link>
              <a href="#why-centlyra" className="lp-button-secondary">Discover Centlyra <ArrowRight size={18}/></a>
            </motion.div>
            <motion.div className="lp-hero-caption" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1,delay:.7}}><span className="lp-caption-line"/> TRANSACTIONS <span className="lp-caption-dot"/> BUDGETS <span className="lp-caption-dot"/> INSIGHTS</motion.div>
          </div>
          <WorkspaceVisual />
        </div>
        <div className="lp-hero-bottom"><div className="lp-container lp-hero-bottom-inner"><span>01 / FINANCIAL CLARITY</span><a href="#why-centlyra">SCROLL TO EXPLORE <ChevronDown size={16}/></a><span>MADE FOR THE EVERYDAY</span></div></div>
      </section>

      <section className="lp-statement" id="why-centlyra" aria-labelledby="lp-statement-heading">
        <div className="lp-statement-grid" aria-hidden="true"/>
        <div className="lp-container lp-statement-layout">
          <motion.div {...reveal} className="lp-statement-left"><p className="lp-eyebrow"><span className="lp-green-dot"/> A BETTER WAY TO SEE IT</p><h2 id="lp-statement-heading">The details matter.<br/><span>The bigger picture</span><br/>changes everything.</h2></motion.div>
          <motion.div {...reveal} className="lp-statement-right"><p>Not another spreadsheet to keep up with. One calm space to follow your activity, find your patterns, and make decisions with more confidence.</p><div className="lp-proof-list"><span><Check size={18}/> Every transaction in its place</span><span><Check size={18}/> Budgets that show where you stand</span><span><Check size={18}/> Insights grounded in your activity</span></div></motion.div>
        </div>
      </section>

      <section className="lp-features" id="features" aria-labelledby="lp-features-heading">
        <div className="lp-container"><motion.div {...reveal} className="lp-section-header"><div><p className="lp-eyebrow"><span className="lp-green-dot"/> THE WAY FORWARD</p><h2 id="lp-features-heading">Everything connected.<br/><span>Nothing complicated.</span></h2></div><p>From the small purchases to the monthly milestones, keep every moving part of your money in view.</p></motion.div>
          <FeatureRow index="01" eyebrow="TRACK WITH EASE" title="Every detail, without the noise." description="Stay close to your spending. Find what you need quickly, organize your transactions, and keep your numbers up to date." ><LedgerArt /></FeatureRow>
          <FeatureRow index="02" eyebrow="PLAN WITH PURPOSE" title="Give your plans room to grow." description="Set limits that fit your life, see what remains, and know when it’s time to adjust — before the month runs away." reversed><BudgetArt /></FeatureRow>
          <FeatureRow index="03" eyebrow="UNDERSTAND THE PATTERN" title="See more than a number." description="Turn daily activity into a clearer perspective. Compare months, follow your spending trends, and make sense of the changes." ><InsightArt /></FeatureRow>
        </div>
      </section>

      <section className="lp-how" id="experience" aria-labelledby="lp-how-heading"><div className="lp-container"><motion.div {...reveal} className="lp-how-head"><p className="lp-eyebrow"><span className="lp-green-dot"/> SIMPLE BY DESIGN</p><h2 id="lp-how-heading">Make the next move<br/><span>with a clear view.</span></h2><p>Three simple parts of a more considered financial routine.</p></motion.div><div className="lp-how-grid"><motion.div {...reveal}><span>01</span><WalletCards size={24}/><h3>Record</h3><p>Bring income and expenses together in one reliable timeline.</p></motion.div><motion.div {...reveal}><span>02</span><Target size={24}/><h3>Plan</h3><p>Set category budgets and understand what’s left to spend.</p></motion.div><motion.div {...reveal}><span>03</span><ChartNoAxesCombined size={24}/><h3>Understand</h3><p>See the trends that put the month in perspective.</p></motion.div></div></div></section>

      <section className="lp-final" aria-labelledby="lp-final-title"><div className="lp-final-glow" aria-hidden="true"/><div className="lp-container lp-final-inner"><motion.div {...reveal}><p className="lp-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h2 id="lp-final-title">A little more clarity.<br/><span>A lot more possibility.</span></h2><p>Your finances deserve a better view. It starts with one entry.</p><Link href="/workspace" className="lp-button-primary">Open workspace <ArrowUpRight size={20}/></Link></motion.div><FlowGraphic className="lp-final-flow" /></div></section>
    </main>
    <footer className="lp-footer"><div className="lp-container"><Brand small/><span>Make sense of your money.</span><a href="#top">Back to top ↑</a><small>© {new Date().getFullYear()} Centlyra</small></div></footer>
  </div>
}
