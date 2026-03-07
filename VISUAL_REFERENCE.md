# CVEarity - Visual Reference Guide

## 🎨 User Interface Layout

### Landing Page
```
┌─────────────────────────────────────────────────────────────────┐
│                       NAVBAR                                     │
│  [CVEarity Logo]              [Home] [Dashboard] [Sign In]       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    HERO SECTION                                  │
│  Headline: "Smarter Vulnerability Intelligence..."              │
│  Subtext: "Track, analyze, and automate responses..."           │
│  [Explore Platform] [View CVE Dashboard]                        │
│  [Dashboard Screenshot Preview]                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FEATURES (4 Cards)                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│  │ CVE Intell.  │ │ Real-time    │ │ Risk Score   │ │ API    │ │
│  │ Dashboard    │ │ Alerts       │ │ Prioritize   │ │ Auto   │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 HOW IT WORKS (3 Steps)                           │
│  01                 02                 03                        │
│  Monitor ──→    Analyze ──→      Automate Responses             │
│  Global CVEs    Risk Scores      Alert & Remediate              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│           INTEGRATIONS                                           │
│  [GitHub] [Jira] [Slack] [Datadog] [PagerDuty] [Sumo]          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 WHY CVEARITY                                     │
│  ⚡ Faster Detection    🤖 Automated Workflows                  │
│  🎯 Better Prioritize  👨‍💻 Developer-Friendly APIs              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               CALL TO ACTION                                     │
│      "Start Securing Your Infrastructure Today"                 │
│  [Start Free Trial]                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       FOOTER                                     │
│  [Links and Copyright]                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard Page
```
┌─────────────────────────────────────────────────────────────────┐
│                       NAVBAR                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CVE Dashboard - Monitor and analyze vulnerability intelligence  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Total CVEs    │ │Critical      │ │High Risk     │ │Medium        │
│     15       │ │      5       │ │      4       │ │      4       │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

┌──────────────────────────────┐  ┌──────────────────────────────┐
│ Severity Distribution         │  │ CVEs by Year                 │
│         (Pie Chart)           │  │    (Bar Chart)               │
│  🔴 Critical (5)              │  │  2024: ▓▓▓▓▓▓ (12)           │
│  🟠 High (4)                  │  │  2023: ▓▓ (2)                │
│  🟡 Medium (4)                │  │  2022: ▓ (1)                 │
│  🟢 Low (2)                   │  │                              │
└──────────────────────────────┘  └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Recent Critical Alerts                                           │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ CVE-2024-1086  Linux Kernel Privilege Escalation   🔴 Critical││
│ │ CVE-2024-2342  Apache OpenOffice XXE Injection     🔴 Critical││
│ │ CVE-2024-3121  OpenSSH Authentication Bypass       🔴 Critical││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Filters                                                          │
│ [Search CVE...] [Severity ▼] [Software...] [Year ▼] [Clear]   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Vulnerabilities (15 results)                                     │
├─────────────────────────────────────────────────────────────────┤
│ CVE ID        │ Title                  │ Severity │CVSS│Software│
├─────────────────────────────────────────────────────────────────┤
│ CVE-2024-1086 │ Linux Kernel PE        │ Critical │9.8 │Linux  │
│ CVE-2024-2342 │ Apache OpenOffice XXE  │ Critical │9.6 │Apache │
│ CVE-2024-3121 │ OpenSSH Auth Bypass    │ Critical │9.1 │OpenSSH│
│ CVE-2024-4567 │ PHP PHAR Protocol RCE  │ High     │8.8 │PHP    │
│ ... (11 more) │                        │          │    │       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       FOOTER                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

```
Background Gradient:
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  From: #020617 (Slate 950)    ──→    #020617 (Slate 950)   │
│  Via:  #0f172a (Slate 900)                                  │
│                                                              │
│  Creates a dark, professional cybersecurity atmosphere      │
└──────────────────────────────────────────────────────────────┘

Component Colors:
  Primary Text:        #f1f5f9 (White)
  Secondary Text:      #cbd5e1 (Gray 300)
  Muted Text:          #94a3b8 (Gray 400)
  Accent Primary:      #06b6d4 (Cyan 500) ⭐
  Accent Secondary:    #3b82f6 (Blue 500)
  Border:              #06b6d4/20 (Cyan with 20% opacity)
  Card Background:     #1e293b/40 (Slate 800 with 40% opacity)

Severity Indicators:
  🔴 Critical Intent:  #ef4444 (Red 500)      CVSS 9.0-10.0
  🟠 High Intent:      #f97316 (Orange 500)   CVSS 7.0-8.9
  🟡 Medium Intent:    #eab308 (Yellow 500)   CVSS 4.0-6.9
  🟢 Low Intent:       #22c55e (Green 500)    CVSS 0.1-3.9
```

## 📐 Component Spacing

```
Container Padding:
  Desktop/Tablet:     px-4 sm:px-6 lg:px-8  (16px → 24px → 32px)
  Mobile:             px-4 (16px)

Vertical Spacing:
  Section Spacing:    py-20 (80px between sections)
  Card Padding:       p-6 (24px inside cards)
  Element Margin:     mb-4, mb-6, mb-8 (16px, 24px, 32px)

Grid Spacing:
  Standard Gap:       gap-4 (16px) to gap-8 (32px)
  Responsive Grid:    grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

## 📏 Typography

```
Headings:
  H1 (Landing): text-5xl lg:text-6xl font-bold
              (48px → 64px, Bold)
  
  H2 (Sections): text-4xl font-bold
                (36px, Bold)
  
  H3 (Cards): text-xl font-bold
             (20px, Bold)
  
  H4 (Labels): text-lg font-semibold
              (18px, Semibold)

Body Text:
  Primary: text-white, text-base
  Secondary: text-gray-300, text-sm
  Muted: text-gray-400, text-xs

Monospace (Code):
  CVE IDs: font-mono, text-cyan-400
```

## 🔘 Button Styles

```
Primary Button (CTA)
┌──────────────────────────────────┐
│  Explore Platform                │
│  Gradient: Cyan → Blue           │
│  Padding: px-8 py-3              │
│  Radius: rounded-lg              │
│  Hover: shadow-lg shadow-cyan-500 │
└──────────────────────────────────┘

Secondary Button (Outline)
┌──────────────────────────────────┐
│  View CVE Dashboard              │
│  Border: border border-cyan-500   │
│  Text: text-cyan-400             │
│  Padding: px-8 py-3              │
│  Hover: bg-cyan-500/10           │
└──────────────────────────────────┘

Tertiary Button (Text)
┌──────────────────────────────────┐
│  Clear Filters                   │
│  Text: text-cyan-400             │
│  Padding: px-4 py-2              │
│  Hover: bg-cyan-500/10           │
└──────────────────────────────────┘
```

## 🎭 Component Examples

### GlassmorphCard
```
┌─────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← Frosted glass effect
│░  Feature Title                  ░│     (40% opacity + blur)
│░                                 ░│
│░  Feature description text here  ░│
│░                                 ░│
└─────────────────────────────────────┘
   Borders: Cyan 20% opacity
```

### SeverityBadge
```
Critical:  [CRITICAL] (Red bg, Red text)
High:      [HIGH] (Orange bg, Orange text)
Medium:    [MEDIUM] (Yellow bg, Yellow text)
Low:       [LOW] (Green bg, Green text)
```

### LoadingSkeleton
```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← Animated shimmer
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← Pulsing animation
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

### NavBar
```
┌─────────────────────────────────────────────────────────────────┐
│ [CVEarity Logo]      Home  Dashboard   [Sign In]                │
│ Gradient Text                         Gradient Button            │
│ Only visible when scrolling or on mobile                         │
└─────────────────────────────────────────────────────────────────┘
  Background: Slate 950 with Cyan border bottom
```

## 📱 Responsive Breakpoints

```
Mobile (375px - 640px)
╔─────────────────────────────╗
║   Single Column Layout      ║
║   Stacked Components        ║
║   Full-width Cards          ║
║   Touch-friendly Buttons    ║
║   Scrollable Table          ║
╚─────────────────────────────╝

Tablet (641px - 1024px)
╔──────────────────────────────────╗
║   Two Column Layout              ║
║   Side-by-side Charts            ║
║   Responsive Grid                ║
║   Optimized Spacing              ║
╚──────────────────────────────────╝

Desktop (1025px+)
╔──────────────────────────────────────────┐
│   Four Column Layout (if needed)         │
│   Full Dashboard with all features       │
│   Wide tables with full content          │
│   Optimized for large screens            │
└──────────────────────────────────────────┘
```

## 🌊 Animation & Effects

```
Glassmorphism:
  backdrop-blur-lg     → 16px blur effect
  bg-opacity-40        → 40% transparency
  Border fade on hover → border-cyan-500/40

Hover Effects:
  Scale: transform hover:scale-105
  Shadow: shadow-lg shadow-cyan-500/50
  Color: hover:text-cyan-400
  Background: hover:bg-cyan-500/10

Loading Animation:
  Shimmer Effect: @keyframes gradient
  Fill animation: w-2/3 (66% width)
  Pulse dot: animate-pulse

Transitions:
  Default: transition (150ms ease)
  Links: hover:opacity-80
  Buttons: hover:shadow-lg
```

## 📊 Chart Styling

```
Pie Chart (Severity Distribution):
  Colors: Red, Orange, Yellow, Green (by severity)
  Labels: Name + Value (e.g., "Critical: 5")
  Tooltip: Dark background with cyan border

Bar Chart (CVEs by Year):
  Color: Cyan (#06b6d4)
  Grid: Dark gray lines
  Tooltip: Dark background with cyan border
  Axis Labels: Gray text on dark background
```

## 🔍 Table Styling

```
┌────────────────┬────────────────┬────────────────┬────────────┐
│ CVE ID         │ Title          │ Severity       │ Score      │
│ (Cyan Mono)    │ (Gray text)    │ (Color Badge)  │ (White)    │
├────────────────┼────────────────┼────────────────┼────────────┤
│ CVE-...        │ Vulnerability  │ [CRITICAL]     │ 9.8        │
│ (Striped rows) │ (Truncated)    │ (Color coded)  │ (Bold)     │
│ Hover darkens  │ with details   │ At end of row  │ Visible    │
└────────────────┴────────────────┴────────────────┴────────────┘

Row Hover:  bg-slate-700/20 with smooth transition
Borders:    Border-b border-cyan-500/10 between rows
Padding:    py-3 px-4 for comfortable spacing
```

---

**Use this visual reference to understand CVEarity's design and implement customizations!**
