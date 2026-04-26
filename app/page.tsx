'use client'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Landmark, Shield, Zap, Globe, Lock, BarChart3, ChevronRight, PlayCircle, Star, ArrowRight } from 'lucide-react'
import FooterBranchLink from '@/components/layout/FooterBranchLink'
import Logo from '@/components/ui/Logo'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

const features = [
  { icon: '🏦', title: 'Multi-Bank Integration', desc: 'Connect SBI, HDFC, ICICI and 50+ institutions with a single secure link.' },
  { icon: '⚡', title: 'Real-Time Transactions', desc: 'Instant ledger updates and live transaction feeds across all accounts.' },
  { icon: '🛡️', title: 'Fraud Detection', desc: 'AI-driven anomaly engine flags transactions exceeding 3× average spend.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Cash flow charts, spend categories, and portfolio insights at a glance.' },
  { icon: '🔄', title: 'Scheduled Payments', desc: 'Automate recurring transfers with rule-based execution across banks.' },
  { icon: '🔒', title: 'Secure ACID Transactions', desc: 'Enterprise-grade atomicity, consistency, isolation and durability.' },
]

const steps = [
  { num: '01', title: 'Connect Accounts', desc: 'Link all your bank accounts securely via OAuth and encrypted credentials.' },
  { num: '02', title: 'Manage Transactions', desc: 'View, filter and search every transaction from one unified interface.' },
  { num: '03', title: 'Get Insights', desc: 'AI-powered analytics, fraud alerts and real-time reporting instantly.' },
]

const mockTx = [
  { desc: 'Salary Credit — HDFC', date: '25 Apr 2025', amount: '+₹85,000', color: '#00d4aa' },
  { desc: 'Amazon Pay — Shopping', date: '24 Apr 2025', amount: '-₹3,450', color: '#f05050' },
  { desc: 'SBI Mutual Fund SIP', date: '23 Apr 2025', amount: '-₹10,000', color: '#f05050' },
  { desc: 'Freelance Payment', date: '22 Apr 2025', amount: '+₹22,000', color: '#00d4aa' },
]

export default function HomePage() {
  return (
    <div style={{ background: '#080a0f', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#e2e2e8', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }
        .nav-link { color: #8890a0; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #e2e2e8; }
        .glow-btn { transition: all 0.25s; }
        .glow-btn:hover { box-shadow: 0 0 32px rgba(0,212,170,0.4); transform: translateY(-2px); }
        .ghost-btn { border: 1px solid rgba(255,255,255,0.15); transition: all 0.25s; }
        .ghost-btn:hover { border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.05); transform: translateY(-2px); }
        .feat-card { background: #0f1117; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 28px; transition: all 0.3s; cursor: default; }
        .feat-card:hover { border-color: rgba(0,212,170,0.25); background: #13151d; transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
      `}</style>

      {/* Ambient background glows */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -300, left: '50%', transform: 'translateX(-50%)', width: 1000, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 65%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: 400, left: -200, width: 600, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(64,144,240,0.04) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -200, right: -100, width: 700, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.04) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      </div>

      {/* ─── NAVBAR ─── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,10,15,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 2rem' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: 22, color: '#f0f2f8' }}>
            <Logo size={34} />
            <span className="tracking-tight">Nexus<span style={{ color: '#00d4aa' }}>Bank</span></span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/auth/login" className="nav-link">Login</Link>
            <Link href="/dashboard" className="glow-btn" style={{ background: 'linear-gradient(135deg,#46f1c5,#00d4aa)', color: '#002118', fontWeight: 700, fontSize: 14, padding: '9px 22px', borderRadius: 8 }}>
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ─── HERO ─── */}
        <section style={{ padding: '110px 2rem 90px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 100, padding: '6px 14px', marginBottom: 28, fontSize: 12, fontWeight: 600, color: '#00d4aa', letterSpacing: '0.06em' }}>
                ✦ NEXT-GEN BANKING PLATFORM
              </motion.div>
              <motion.h1 variants={fadeUp} style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 24, color: '#f0f2f8' }}>
                One Dashboard<br />for All Your{' '}
                <span style={{ background: 'linear-gradient(135deg,#46f1c5,#00b894)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Bank Accounts
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} style={{ fontSize: 18, color: '#8890a0', lineHeight: 1.75, marginBottom: 40, maxWidth: 480 }}>
                Manage SBI, HDFC, and ICICI accounts in one unified platform with analytics, fraud detection, and real-time insights.
              </motion.p>
              <motion.div variants={fadeUp} style={{ display: 'flex', gap: 14 }}>
                <Link href="/dashboard" className="glow-btn" style={{ background: 'linear-gradient(135deg,#46f1c5,#00d4aa)', color: '#002118', fontWeight: 700, fontSize: 16, padding: '15px 34px', borderRadius: 10 }}>
                  Get Started
                </Link>
                <Link href="/dashboard" className="ghost-btn" style={{ color: '#e2e2e8', fontWeight: 600, fontSize: 16, padding: '15px 34px', borderRadius: 10 }}>
                  View Demo →
                </Link>
              </motion.div>
              {/* Trust badges */}
              <motion.div variants={fadeUp} style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 24 }}>
                {['Bank-grade Security', 'ACID Transactions', 'Real-Time Sync'].map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8890a0' }}>
                    <span style={{ color: '#00d4aa' }}>✓</span> {b}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Dashboard preview card */}
            <motion.div initial={{ opacity: 0, x: 60, rotateY: -8 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}>
              <div style={{ background: 'rgba(15,17,23,0.9)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,170,0.12),transparent 70%)' }} />
                <div style={{ fontSize: 11, color: '#8890a0', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 }}>TOTAL NET WORTH</div>
                <div style={{ fontSize: 38, fontWeight: 900, color: '#f0f2f8', marginBottom: 4 }}>₹4,20,000</div>
                <div style={{ fontSize: 13, color: '#00d4aa', marginBottom: 22 }}>↑ +12.4% this month</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
                  {[{ l: 'Accounts', v: '3', c: '#4090f0' }, { l: 'Alerts', v: '12', c: '#f05050' }, { l: 'Txns', v: '248', c: '#00d4aa' }].map(k => (
                    <div key={k.l} style={{ background: '#080a0f', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 10, color: '#8890a0', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>{k.l}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: k.c }}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#8890a0', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10 }}>MONTHLY CASH FLOW</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
                  {[55, 72, 45, 88, 60, 100].map((h, i) => (
                    <motion.div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.5 + i * 0.07, duration: 0.5 }}>
                      <div style={{ width: '100%', borderRadius: 4, height: `${h}%`, background: i === 5 ? 'linear-gradient(180deg,#46f1c5,#00d4aa)' : 'rgba(0,212,170,0.18)', transformOrigin: 'bottom' }} />
                      <div style={{ fontSize: 9, color: '#8890a0' }}>{['N', 'D', 'J', 'F', 'M', 'A'][i]}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── LOGOS / SOCIAL PROOF ─── */}
        <Section>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', padding: '0 2rem 72px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: 13, color: '#8890a0', letterSpacing: '0.08em', marginBottom: 28 }}>TRUSTED INTEGRATIONS</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
              {['SBI Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank'].map(bank => (
                <div key={bank} style={{ fontSize: 15, fontWeight: 700, color: '#3d4455', letterSpacing: '-0.01em' }}>{bank}</div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* ─── FEATURES ─── */}
        <section id="features" style={{ padding: '80px 2rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Section>
              <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 60 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#00d4aa', letterSpacing: '0.1em', marginBottom: 12 }}>CAPABILITIES</div>
                <h2 style={{ fontSize: 44, fontWeight: 800, color: '#f0f2f8', letterSpacing: '-0.02em', marginBottom: 14 }}>Everything you need, unified</h2>
                <p style={{ fontSize: 17, color: '#8890a0', maxWidth: 500, margin: '0 auto' }}>Built on secure, robust protocols to handle your most critical financial data with absolute certainty.</p>
              </motion.div>
            </Section>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {features.map((f, i) => (
                <motion.div key={f.title} className="feat-card"
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }} viewport={{ once: true, margin: '-60px' }}>
                  <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f2f8', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#8890a0', lineHeight: 1.7 }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DASHBOARD PREVIEW ─── */}
        <section style={{ padding: '80px 2rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Section>
              <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#00d4aa', letterSpacing: '0.1em', marginBottom: 12 }}>LIVE PREVIEW</div>
                <h2 style={{ fontSize: 44, fontWeight: 800, color: '#f0f2f8', letterSpacing: '-0.02em', marginBottom: 14 }}>Powerful analytics at a glance</h2>
                <p style={{ fontSize: 17, color: '#8890a0' }}>See your complete financial picture in one place</p>
              </motion.div>
            </Section>
            <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}
              style={{ background: '#0c0e14', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 60px 120px rgba(0,0,0,0.6)' }}>
              {/* Browser chrome */}
              <div style={{ background: '#080a0f', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {['#f05050','#f0c040','#00d4aa'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#8890a0' }}>app.unifiedbank.in/dashboard</div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                  {[{ l:'Total Balance', v:'₹4,20,000', c:'#00d4aa'}, {l:'Accounts',v:'3',c:'#4090f0'},{l:'Customers',v:'248',c:'#f0c040'},{l:'Fraud Alerts',v:'12',c:'#f05050'}].map(k => (
                    <div key={k.l} style={{ background:'#0f1117', borderRadius:12, padding:18, border:'1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize:10, color:'#8890a0', fontWeight:600, letterSpacing:'0.06em', marginBottom:8 }}>{k.l.toUpperCase()}</div>
                      <div style={{ fontSize:22, fontWeight:800, color:k.c }}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div style={{ background:'#0f1117', borderRadius:12, padding:20, border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#f0f2f8', marginBottom:4 }}>Monthly Cash Flow</div>
                    <div style={{ fontSize:11, color:'#8890a0', marginBottom:18 }}>Last 6 months</div>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:90 }}>
                      {[62,78,48,90,65,100].map((h,i)=>(
                        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                          <div style={{ width:'100%', borderRadius:4, height:`${h}%`, background: i===5?'linear-gradient(180deg,#46f1c5,#00d4aa)':'rgba(0,212,170,0.18)' }} />
                          <div style={{ fontSize:9, color:'#8890a0' }}>{['Nov','Dec','Jan','Feb','Mar','Apr'][i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background:'#0f1117', borderRadius:12, padding:20, border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#f0f2f8', marginBottom:16 }}>Recent Transactions</div>
                    {mockTx.map(tx=>(
                      <div key={tx.desc} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                        <div>
                          <div style={{ fontSize:13, color:'#f0f2f8', fontWeight:500 }}>{tx.desc}</div>
                          <div style={{ fontSize:11, color:'#8890a0', marginTop:2 }}>{tx.date}</div>
                        </div>
                        <div style={{ fontSize:14, fontWeight:700, color:tx.color }}>{tx.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section style={{ padding: '80px 2rem', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Section>
              <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 60 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#00d4aa', letterSpacing: '0.1em', marginBottom: 12 }}>SIMPLE ONBOARDING</div>
                <h2 style={{ fontSize: 44, fontWeight: 800, color: '#f0f2f8', letterSpacing: '-0.02em' }}>Get started in 3 simple steps</h2>
              </motion.div>
            </Section>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
              {steps.map((s, i) => (
                <motion.div key={s.num} style={{ textAlign: 'center' }}
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.12 }} viewport={{ once: true }}>
                  <div style={{ width:60, height:60, borderRadius:16, background:'rgba(0,212,170,0.08)', border:'1px solid rgba(0,212,170,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:16, fontWeight:800, color:'#00d4aa' }}>{s.num}</div>
                  <h3 style={{ fontSize:18, fontWeight:700, color:'#f0f2f8', marginBottom:10 }}>{s.title}</h3>
                  <p style={{ fontSize:14, color:'#8890a0', lineHeight:1.7 }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section style={{ padding: '80px 2rem' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
              style={{ borderRadius: 24, padding: '72px 48px', textAlign: 'center', background: 'linear-gradient(135deg,rgba(0,212,170,0.07),rgba(64,144,240,0.04))', border: '1px solid rgba(0,212,170,0.18)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:400, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,212,170,0.1),transparent 70%)', pointerEvents:'none' }} />
              <h2 style={{ fontSize: 40, fontWeight: 800, color: '#f0f2f8', letterSpacing: '-0.02em', marginBottom: 16 }}>
                Start managing your finances smarter today
              </h2>
              <p style={{ fontSize: 17, color: '#8890a0', marginBottom: 36 }}>
                Join thousands of users who trust UnifiedBank for their multi-bank finances.
              </p>
              <Link href="/dashboard" className="glow-btn" style={{ background:'linear-gradient(135deg,#46f1c5,#00d4aa)', color:'#002118', fontWeight:800, fontSize:17, padding:'17px 44px', borderRadius:12, display:'inline-block' }}>
                Get Started Now →
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ─── ENHANCED FOOTER ─── */}
        <footer style={{ background: 'linear-gradient(180deg, transparent, rgba(0,212,170,0.02))', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 2rem 40px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            
            {/* Upper Footer: Branding & Newsletter */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 60, marginBottom: 80, alignItems: 'flex-start' }}>
              <div>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 24, color: '#f0f2f8', marginBottom: 24 }}>
                  <Logo size={34} />
                  Nexus<span style={{ color: '#00d4aa' }}>Bank</span>
                </Link>
                <p style={{ fontSize: 16, color: '#8890a0', lineHeight: 1.6, maxWidth: 400, marginBottom: 32 }}>
                  Unifying the world's financial protocols into a single, high-precision instrument. Secure, audited, and enterprise-ready.
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  {['ISO 27001', 'SOC2 Type II', 'PCI DSS'].map(badge => (
                    <div key={badge} style={{ fontSize: 10, fontWeight: 700, color: '#00d4aa', background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)', padding: '4px 10px', borderRadius: 6, letterSpacing: '0.05em' }}>
                      {badge}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f0f2f8', marginBottom: 12 }}>Stay ahead of the curve</h3>
                <p style={{ fontSize: 14, color: '#8890a0', marginBottom: 24 }}>Get the latest updates on multi-bank analytics and security protocols.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input type="email" placeholder="Enter your email" style={{ flex: 1, background: '#080a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#f0f2f8', fontSize: 14, outline: 'none' }} />
                  <button className="glow-btn" style={{ background: 'linear-gradient(135deg,#46f1c5,#00d4aa)', color: '#002118', fontWeight: 700, fontSize: 14, padding: '0 24px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Footer: Links Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, marginBottom: 80 }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>Product</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Multi-Bank Integration', href: '/accounts' },
                    { label: 'Real-Time Transactions', href: '/transactions' },
                    { label: 'AI Fraud Detection', href: '/alerts' },
                    { label: 'Unified Analytics', href: '/analytics' },
                    { label: 'Scheduled Payments', href: '/scheduled' }
                  ].map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className="nav-link" style={{ fontSize: 14, color: '#8890a0', transition: 'color 0.2s' }}>{link.label}</Link>
                    </li>
                  ))}
                  <li style={{ marginTop: 4 }}>
                    <FooterBranchLink />
                  </li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>Resources</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['API Documentation', 'Security Protocol', 'Help Center', 'Developer Community', 'System Status'].map(link => (
                    <li key={link}>
                      <Link href="#" className="nav-link" style={{ fontSize: 14, color: '#8890a0' }}>{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>Company</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['About UnifiedBank', 'Our Mission', 'Careers', 'Press Kit', 'Contact Us'].map(link => (
                    <li key={link}>
                      <Link href="#" className="nav-link" style={{ fontSize: 14, color: '#8890a0' }}>{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>Legal</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Fraud Disclaimer', 'Regulatory Disclosure'].map(link => (
                    <li key={link}>
                      <Link href="#" className="nav-link" style={{ fontSize: 14, color: '#8890a0' }}>{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Footer: Copyright & Social */}
            <div style={{ paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#3d4455' }}>
                © 2025 NexusBank Financial Technologies Ltd. All rights reserved. Precision engineered in India.
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {['GitHub', 'LinkedIn', 'X (Twitter)', 'YouTube'].map(social => (
                  <Link key={social} href="#" className="nav-link" style={{ fontSize: 13, color: '#8890a0' }}>{social}</Link>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
