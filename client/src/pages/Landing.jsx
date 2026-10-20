import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Video,
  MonitorUp,
  FileCheck2,
  Palette,
  ShieldCheck,
  Zap,
  ArrowRight,
  Mic,
  Camera,
  Share2,
  Lock,
  Radio,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { Button, Avatar } from '../components/ui'
import { useAuthStore } from '../store/auth.store'

export function Landing() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-accent/20 selection:text-accent overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[640px] h-[380px] bg-gradient-to-tr from-accent/15 via-blue-400/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-accent-muted text-accent text-footnote font-medium mb-6 border border-accent/20 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>CollabRoom 1.0 — Pure WebRTC Mesh</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold text-label leading-[1.06] max-w-4xl mx-auto tracking-tight"
            style={{ letterSpacing: '-0.032em' }}
          >
            Connect effortlessly.{' '}
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-500 to-indigo-500">
              Collaborate in real time.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-lg sm:text-xl text-label-secondary max-w-2xl mx-auto leading-relaxed"
            style={{ letterSpacing: '-0.014em' }}
          >
            The video conferencing sanctuary designed around Apple Human Interface Guidelines:
            sub-second WebRTC peer media, synchronized vector whiteboards, and AES-256-GCM file vaults.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to={isAuthenticated ? '/dashboard' : '/auth?mode=signup'}>
              <Button size="lg" variant="primary" rightIcon={ArrowRight} className="shadow-lg shadow-accent/25">
                {isAuthenticated ? 'Open Dashboard' : 'Start Instant Meeting'}
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" size="lg">
                Explore Technology
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Floating Interactive Product Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.32, type: 'spring', stiffness: 240, damping: 24 }}
          className="mt-16 max-w-5xl mx-auto px-2 sm:px-4"
        >
          <div className="relative rounded-card bg-surface-elevated border border-separator/50 shadow-2xl overflow-hidden">
            {/* macOS Titlebar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-separator/40 bg-surface/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-xs" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-xs" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-xs" />
                <span className="ml-3 text-caption-1 font-mono text-label-secondary">
                  collabroom.app/room/abc-defg-hij
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-system-success-muted text-system-success text-caption-1 font-medium border border-system-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-system-success animate-ping" />
                  Live DTLS-SRTP
                </span>
              </div>
            </div>

            {/* Video Mesh Layout Preview */}
            <div className="p-4 sm:p-6 bg-surface/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {/* Active Speaker Tile */}
                <div className="relative aspect-video rounded-tile bg-neutral-900 border-2 border-accent shadow-lg overflow-hidden flex items-center justify-center group">
                  <Avatar name="Sarah Chen" size="xl" />
                  {/* Speaker Aura Waveform */}
                  <div className="absolute top-3 right-3 flex items-center gap-0.5 px-2 py-1 rounded-pill liquid-glass-clear text-white text-[10px]">
                    <span className="w-1 h-3 bg-system-success rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-system-success rounded-full animate-pulse [animation-delay:0.15s]" />
                    <span className="w-1 h-2 bg-system-success rounded-full animate-pulse [animation-delay:0.3s]" />
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-pill liquid-glass-clear text-white text-caption-1 font-medium flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-system-success" />
                    Sarah (Speaking)
                  </div>
                </div>

                {/* Tile 2 */}
                <div className="relative aspect-video rounded-tile bg-neutral-850 border border-separator/30 overflow-hidden flex items-center justify-center">
                  <Avatar name="Alex Rivera" size="xl" />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-pill liquid-glass-clear text-white text-caption-1 font-medium flex items-center gap-1.5 shadow-sm">
                    Alex Rivera
                  </div>
                </div>

                {/* Tile 3 */}
                <div className="relative aspect-video rounded-tile bg-neutral-800 border border-separator/30 overflow-hidden flex items-center justify-center">
                  <Avatar name="Elena Rostova" size="xl" />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-pill liquid-glass-clear text-white text-caption-1 font-medium flex items-center gap-1.5 shadow-sm">
                    Elena Rostova
                  </div>
                </div>
              </div>

              {/* Floating visionOS-Grade Control Bar Capsule */}
              <div className="mt-5 flex justify-center">
                <div className="liquid-glass rounded-pill px-4 py-2 flex items-center gap-2.5 shadow-xl">
                  <div className="p-2 rounded-full bg-surface-elevated text-label shadow-xs">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="p-2 rounded-full bg-surface-elevated text-label shadow-xs">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="p-2 rounded-full bg-accent text-white shadow-xs">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="h-4 w-px bg-separator/50 mx-1" />
                  <div className="px-3.5 py-1.5 rounded-pill bg-system-destructive text-white text-caption-1 font-semibold shadow-xs">
                    Leave
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Feature Section (HIG Content Layer Discipline: Standard Elevated Materials) */}
      <section id="features" className="py-24 bg-surface-secondary border-t border-separator/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-footnote font-semibold uppercase tracking-wider text-accent">
              Architecture & Design
            </span>
            <h2 className="text-large-title font-bold text-label mt-2" style={{ letterSpacing: '-0.022em' }}>
              Built for speed. Styled with restraint.
            </h2>
            <p className="mt-3 text-body text-label-secondary">
              Engineered with WebRTC peer-to-peer mesh, high-concurrency Node.js sockets, and authentic Apple Human Interface Guidelines.
            </p>
          </div>

          {/* Bento Box Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Hero Span-2 Card (WebRTC Mesh & Adaptive Bitrate) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 apple-card p-8 flex flex-col justify-between overflow-hidden relative"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent-muted text-accent text-caption-1 font-semibold mb-4 border border-accent/20">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Real-Time Media Pipeline</span>
                </div>
                <h3 className="text-title-1 text-label mb-2">Ultra-Low Latency Mesh WebRTC</h3>
                <p className="text-body text-label-secondary max-w-xl leading-relaxed">
                  Direct peer-to-peer media streaming with automated active speaker spotlighting, dynamic bitrate adaptation via <code className="font-mono text-caption-1 bg-surface-secondary px-1.5 py-0.5 rounded">RTCRtpSender.setParameters()</code>, and automatic resolution scaling based on packet loss and participant density.
                </p>
              </div>

              {/* Technical Indicator Graphic */}
              <div className="mt-8 pt-6 border-t border-separator/30 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-2xl bg-surface">
                  <span className="text-title-2 font-bold text-accent">&lt; 40ms</span>
                  <p className="text-caption-1 text-label-secondary mt-0.5">P2P Latency</p>
                </div>
                <div className="p-3 rounded-2xl bg-surface">
                  <span className="text-title-2 font-bold text-label">1080p</span>
                  <p className="text-caption-1 text-label-secondary mt-0.5">Max Resolution</p>
                </div>
                <div className="p-3 rounded-2xl bg-surface">
                  <span className="text-title-2 font-bold text-system-success">DTLS-SRTP</span>
                  <p className="text-caption-1 text-label-secondary mt-0.5">Media Encryption</p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Collaborative Whiteboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="apple-card p-8 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-5">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="text-title-2 text-label mb-2">Vector Whiteboard</h3>
                <p className="text-footnote text-label-secondary leading-relaxed">
                  Interactive HTML5 canvas synchronized via Socket.io. Features sub-pixel coordinate normalization, shape geometry, high-pressure strokes, undo/redo state stacks, and PNG export.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#007AFF] shadow-xs" />
                <span className="w-5 h-5 rounded-full bg-[#34C759] shadow-xs" />
                <span className="w-5 h-5 rounded-full bg-[#FF9500] shadow-xs" />
                <span className="w-5 h-5 rounded-full bg-[#FF3B30] shadow-xs" />
                <span className="w-5 h-5 rounded-full bg-[#AF52DE] shadow-xs" />
                <span className="text-caption-1 text-label-secondary ml-1 font-mono">Normalized (0-1)</span>
              </div>
            </motion.div>

            {/* Feature 3: Screen Share */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="apple-card p-8 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-5">
                  <MonitorUp className="w-6 h-6" />
                </div>
                <h3 className="text-title-2 text-label mb-2">Fluid Screen Share</h3>
                <p className="text-footnote text-label-secondary leading-relaxed">
                  Seamlessly broadcast screens, application windows, or browser tabs with system tab audio and zero-renegotiation track replacement.
                </p>
              </div>
              <span className="text-caption-1 font-mono text-label-secondary bg-surface px-2.5 py-1 rounded-pill w-fit border border-separator/30">
                Track Swap Without Renegotiation
              </span>
            </motion.div>

            {/* Feature 4: AES-256 Encrypted File Vault */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="apple-card p-8 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-title-2 text-label mb-2">Encrypted File Vault</h3>
                <p className="text-footnote text-label-secondary leading-relaxed">
                  Drag and drop documents directly into conference rooms. Every payload is encrypted at rest using AES-256-GCM and delivered through authenticated, time-limited download URLs.
                </p>
              </div>
              <span className="text-caption-1 font-mono text-system-success bg-system-success-muted px-2.5 py-1 rounded-pill w-fit border border-system-success/20">
                AES-256-GCM at Rest
              </span>
            </motion.div>

            {/* Feature 5: Production Hardened Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="apple-card p-8 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-title-2 text-label mb-2">Zero-Trust Security</h3>
                <p className="text-footnote text-label-secondary leading-relaxed">
                  Strict helmet CSP directives, NoSQL query sanitization, Zod schema validation, per-socket rate limiting, and 12-round bcrypt password hashing.
                </p>
              </div>
              <span className="text-caption-1 font-mono text-label-secondary bg-surface px-2.5 py-1 rounded-pill w-fit border border-separator/30">
                OWASP Top 10 Defenses
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-separator/30 py-10 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-footnote text-label-secondary">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white shadow-xs">
              <Video className="w-4 h-4" />
            </div>
            <span className="font-semibold text-label">CollabRoom</span>
            <span>— Apple HIG Real-Time Communications</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-caption-1 text-system-success">
              <span className="w-2 h-2 rounded-full bg-system-success" />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
