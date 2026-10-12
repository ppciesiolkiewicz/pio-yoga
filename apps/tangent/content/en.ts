/** English (Australia). The type source for every other locale. */
export const en = {
  meta: {
    siteDescription:
      "Tangent helps startups connect the dots: we map how your product, data and team work, fix what's stuck, and build the custom apps and platforms you need. Over ten years in fintech, e-commerce and health.",
    home: {
      title: "Tangent · Process, product and software for startups",
      description:
        "Tangent helps startups connect the dots: we map how your product, data and team work, fix what's stuck, and build the custom apps and platforms you need.",
    },
    services: {
      title: "Services · process improvement, custom apps and technical leadership",
      description:
        "A fresh look at how your startup works, process and workflow improvement, custom apps and platforms, product sprints, fractional tech leadership, and payments, AI and Web3.",
    },
    work: {
      title: "Work · the experience behind Tangent",
      description: "Case studies from fintech, health, e-commerce, retail, property tech and telecoms: the problem, what changed, and the result.",
    },
    about: {
      title: "About · the people behind Tangent",
      description:
        "Tangent is led by Piotr Ciesiolkiewicz, a software engineer and problem-solver with more than ten years of experience, with a network of senior specialists.",
    },
    contact: { title: "Contact · book a call", description: "Book a 30-minute call about your product, your processes or your idea. No obligation." },
    privacy: { title: "Privacy policy", description: "How Tangent handles personal information and analytics." },
    terms: { title: "Terms", description: "The terms for working with Tangent." },
  },
  nav: {
    services: "Services",
    work: "Work",
    about: "About",
    contact: "Contact",
    cta: "Book a call",
    menu: "Menu",
    close: "Close menu",
    primary: "Main",
    skip: "Skip to content",
    newTab: "(opens in a new tab)",
    breadcrumbs: "Breadcrumb",
    home: "Home",
    colorMode: { group: "Colour mode", light: "Light", dark: "Dark", system: "System" },
  },
  hero: {
    eyebrow: "Process, product and software · for startups",
    title: ["Connect the dots. ", "Fix the flow."],
    lead: "We map how your product, data and team really work, find where things get stuck, and make it flow again: a simpler process, a smarter workflow, or a custom app built for exactly what you need. Over ten years of building fintech, e-commerce and health products, now working for you.",
    secondary: "See the work",
    proofLabel: "Experience",
    proof: ["10+ years building products", "Fintech & DeFi", "E-commerce", "Health", "Telecoms"],
    dots: { idea: "idea", market: "market", users: "users", data: "data", tech: "tech", product: "product" },
  },
  flows: {
    eyebrow: "What we do",
    title: "We look at the whole picture",
    intro:
      "Most problems in a growing startup don't live in one place. They sit between the product, the data, the tools and the people. We find where things get stuck and fix the cause.",
    items: [
      {
        title: "Slow, stressful releases",
        body: "We look at how work moves from idea to production, remove the waiting and the handoffs, and add the testing that lets you ship with confidence.",
      },
      { title: "Numbers nobody trusts", body: "We trace where your data comes from, close the gaps, and give the team reports they can act on." },
      {
        title: "Workarounds everywhere",
        body: "Spreadsheets, copy-paste and manual steps usually point to a missing tool. We build the custom app or integration that removes them.",
      },
      { title: "An idea that needs a path", body: "We shape it, test it with real users and data, and build the first version properly." },
    ],
  },
  services: {
    eyebrow: "Services",
    title: "How we can help",
    intro: "Start small with a fresh look, or bring us in for the whole journey from idea to platform.",
    linkLabel: "Learn more",
    signsTitle: "Signs you need this",
    whatWeDoTitle: "What we do",
    outcomesTitle: "What you get",
    faqTitle: "Questions",
    items: {
      "fresh-look": {
        title: "A fresh look",
        summary: "A fixed-price review of how work, data and customers flow through your startup, with a short list of the improvements worth making.",
        intro:
          "Sometimes you're too close to see what's slowing you down. In one to two weeks we look at your product, tech and processes with fresh eyes and tell you clearly what to change first.",
        signs: [
          "Releases keep slipping and nobody's quite sure why",
          "The same bugs and incidents keep coming back",
          "You're about to raise, hire or rebuild and want a second opinion",
        ],
        whatWeDo: [
          "Talk to your team and look at real work, not just documents",
          "Map how ideas, code, data and customers move through the business",
          "Review architecture, code and tooling where it matters",
          "Find the root causes behind the symptoms",
        ],
        outcomes: ["A short, prioritised list of improvements", "Effort and impact for each one", "A clear first step, whoever does the work"],
        faq: [
          { question: "Do we have to hire you for the work afterwards?", answer: "No. The review is yours to use however you like." },
          {
            question: "How much access do you need?",
            answer: "Usually a few conversations, read access to code and tools, and a look at your metrics. We're happy to sign an NDA.",
          },
        ],
      },
      "process-workflow": {
        title: "Process & workflow improvement",
        summary: "Fewer handoffs, less waiting and fewer mistakes, with automation where it pays off.",
        intro:
          "Good teams get slowed down by bad flows: waiting for reviews, manual steps, unclear ownership. We find the friction and remove it, without adding bureaucracy.",
        signs: ["Work waits in queues more than it moves", "Releases are stressful and manual", "Everyone keeps their own spreadsheet"],
        whatWeDo: [
          "Map the real flow, from idea to production and from order to delivery",
          "Remove waiting, handoffs and duplicate work",
          "Automate the repetitive steps and add checks that catch mistakes early",
          "Work alongside the team so the new way sticks",
        ],
        outcomes: ["A faster, calmer path to production", "Automations that save hours every week", "A team that owns the improved process"],
        faq: [
          {
            question: "Is this only about engineering?",
            answer: "No. We look at any flow that slows the business down, from releases to onboarding, orders and reporting.",
          },
        ],
      },
      "custom-apps-platforms": {
        title: "Custom apps & platforms",
        summary: "From idea to product, or the internal tool your team keeps wishing for.",
        intro:
          "When off-the-shelf tools don't fit, we design and build software around how your business actually works: web apps, platforms, integrations and internal tools.",
        signs: [
          "Workarounds and copy-paste are holding things together",
          "You have an idea that needs a first version people can use",
          "Your platform needs to grow without a rewrite",
        ],
        whatWeDo: [
          "Shape the product with you before writing code",
          "Build full stack with React, Node.js, NestJS, Django, Postgres and the cloud",
          "Design for growth: event-driven backends, clean data models, sensible architecture",
          "Test properly, so changes are safe",
        ],
        outcomes: ["Software you own, built for your flow", "A codebase your team can maintain", "Documentation and a proper handover"],
        faq: [
          { question: "Do you build mobile apps?", answer: "Yes, with React Native or web apps that work well on phones." },
          { question: "Who owns the code?", answer: "You do, from day one." },
        ],
      },
      "product-sprints": {
        title: "Product & idea sprints",
        summary: "Shape and test a new idea before you spend on building it.",
        intro:
          "The most expensive mistakes happen before the first line of code. A short sprint turns an idea into a clear, tested plan, and often a prototype you can put in front of users or investors.",
        signs: [
          "You have an idea but not a clear first version",
          "The team can't agree on what to build next",
          "You need something real to show customers or investors",
        ],
        whatWeDo: [
          "Clarify the problem, the users and what success looks like",
          "Find the riskiest assumptions and test them with real users and data",
          "Define the smallest product worth building",
          "Prototype it when that's the fastest way to learn",
        ],
        outcomes: ["A tested idea and a clear scope", "A costed build plan", "Often a clickable prototype"],
        faq: [{ question: "How long is a sprint?", answer: "Usually one to two weeks, at a fixed price agreed upfront." }],
      },
      "fractional-tech-lead": {
        title: "Fractional tech lead",
        summary: "Senior judgement on architecture, hiring and vendors, without a full-time hire.",
        intro:
          "Not every startup needs a full-time CTO yet, but every startup needs good technical decisions. We join for a few days a month to guide architecture, review work and help you hire.",
        signs: [
          "You rely on an agency or freelancers without a technical owner",
          "Big technical decisions are coming up",
          "You're about to hire your first engineers",
        ],
        whatWeDo: [
          "Own the technical roadmap with you",
          "Review architecture, code and vendor work",
          "Help hire and onboard engineers",
          "Represent tech in investor and partner conversations",
        ],
        outcomes: ["Clear technical direction", "Better vendors and better hires", "A team set up to grow"],
        faq: [{ question: "How much time do you commit?", answer: "Anything from a few hours a week to a few days a month, adjusted as you grow." }],
      },
      "payments-ai-web3": {
        title: "Payments, AI & Web3",
        summary: "Specialist depth in payments, subscriptions, AI features and blockchain.",
        intro:
          "Some problems need people who've done it before. Piotr has built card-to-crypto payments and a subscription engine (ONCHAIN), Medicare gap payments (Lysn) and checkouts for limited-edition drops (Highsnobiety), and we use AI where it genuinely helps.",
        signs: [
          "You're adding payments, subscriptions or pricing logic",
          "You want AI features that do something useful",
          "You're building on blockchain and need it to feel like normal fintech",
        ],
        whatWeDo: [
          "Payments and subscriptions with Stripe or crypto rails",
          "Pricing logic that's flexible and auditable",
          "AI features and automations with clear guardrails",
          "Smart contracts and account abstraction (ERC-4337) for gasless, user-friendly flows",
        ],
        outcomes: ["Payment flows that stay correct under load", "AI that earns its place", "Web3 that feels like a normal app"],
        faq: [
          {
            question: "Do you only work on crypto projects?",
            answer: "No. Payments and pricing work applies to any business. Web3 is one specialty among several.",
          },
        ],
      },
    },
  },
  process: {
    eyebrow: "How we work",
    title: "Listen. Map. Improve. Hand over.",
    intro: "Small, visible steps, and you always know what's next.",
    steps: [
      { title: "Listen", body: "We learn how your product, team and customers really work, and what success looks like for you." },
      { title: "Map", body: "We map the flows, the data and the pain points, and agree on the few changes that matter most." },
      { title: "Improve", body: "We fix the process, build the custom app or platform, or both, in small steps you can see." },
      { title: "Hand over", body: "Your team owns the result, with documentation and support until it runs on its own." },
    ],
  },
  work: {
    eyebrow: "Work",
    title: "The experience behind Tangent",
    intro:
      "The experience behind Tangent, from fintech to telecoms. Each story starts with a problem, not a technology.",
    link: "See all work",
    credit: "Work by Piotr Ciesiolkiewicz while working with {client}.",
    cardCredit: "Piotr's work at {client}",
    problemTitle: "The problem",
    changedTitle: "What changed",
    resultTitle: "The result",
    stackTitle: "Stack",
    readMore: "Read the case study",
    items: {
      onchain: {
        client: "ONCHAIN",
        sector: "Fintech · DeFi",
        period: "2024–2026",
        title: "Card-to-crypto payments, built to run lean",
        summary: "Payment rails that let people buy tens of thousands of cryptocurrencies by card, with gasless transactions and smart treasury management.",
        problem:
          "A DeFi payments startup needed people to pay by card and receive crypto in their own wallets, without the company holding large amounts of capital or users facing confusing network fees.",
        whatChanged: [
          "An event-driven payments backend on NestJS and Google Cloud, built for reliability across payment and blockchain flows",
          "On-demand liquidity and secure routing of assets to users' wallets",
          "Treasury algorithms that allocate funds across chains with minimal capital exposure",
          "Account abstraction (ERC-4337), so users pay fees in the currency they're sending",
          "A subscription engine that prices in US dollars and charges in crypto at the moment of payment",
          "Internal tools for spotting incidents and running safe experiments",
        ],
        result: "A banking-like experience on self-custodial wallets, run with minimal capital.",
        stack: ["TypeScript", "NestJS", "React", "Google Cloud", "Postgres", "Solidity", "ERC-4337"],
      },
      lysn: {
        client: "Lysn",
        sector: "Health",
        period: "2021–2023",
        title: "Bookings, pricing and payments for a mental health platform",
        summary: "Micro frontends, configurable pricing and Medicare gap payments for a platform that connects therapists and clients.",
        problem:
          "The platform needed to modernise without a risky rewrite, support more flexible pricing, and keep running smoothly while the product moved from an overseas team to Australia.",
        whatChanged: [
          "Micro frontends, so the stack could be upgraded step by step and the customer app loaded faster",
          "Pricing logic refactored for advanced, configurable pricing",
          "Medicare gap payments, to grow revenue and reduce the risk of no-show consultations",
          "The local team upskilled for a smooth handover from the overseas team",
          "Critical incidents resolved fast, pulling data straight from the database to keep the business running",
        ],
        result: "A faster customer app, more flexible pricing and the know-how kept in-house.",
        stack: ["React", "Redux-Saga", "TypeScript", "Python", "Django", "AWS", "PostgreSQL"],
      },
      highsnobiety: {
        client: "Highsnobiety",
        sector: "Fashion e-commerce",
        period: "2018–2020",
        title: "A checkout that holds up during limited-edition drops",
        summary: "Core shopping flows and launch-day reliability for a global fashion media brand.",
        problem:
          "Limited-stock releases bring huge, spiky traffic. The shop had to stay fast, fair and correct, with the right prices and content from the first second.",
        whatChanged: [
          "Product pages and checkout built on a CommerceTools stack",
          "Endpoints for highly limited stock that stayed secure and reliable under spiky traffic",
          "App start-up re-engineered so correct prices and content always rendered, with no flashes of stale items",
          "CI pipelines, Docker containers and Terraform on Google Cloud",
          "Unit and end-to-end tests that kept deployments error-free",
        ],
        result: "Reliable launches and a checkout customers could trust.",
        stack: ["React", "Redux", "Node.js", "Google Cloud", "CommerceTools", "Terraform"],
      },
      officeworks: {
        client: "Officeworks",
        sector: "Retail",
        period: "2020",
        title: "Recurring orders and a smoother path to production",
        summary: "A new recurring-orders feature, and a workflow change that removed the waiting between developers and QA.",
        problem:
          "Developers were waiting for testers to become free, which slowed every release, while the business wanted more repeat sales from business customers.",
        whatChanged: [
          "A team workflow that cut developers' wait for QA to zero",
          "Recurring orders, so businesses can buy products automatically on a schedule",
          "Content targeting fixed in Adobe Target, so marketing reached the right audience",
        ],
        result: "Faster delivery, and a new way for business customers to keep buying.",
        stack: ["React", "Redux", "Node.js", "Micro frontends", "Contentful", "Algolia", "AWS"],
      },
      udrew: {
        client: "uDrew",
        sector: "Property tech",
        period: "2020–2021",
        title: "Configurable forms that streamline building approvals",
        summary: "Dynamic data-collection flows and an auditable document store for residential building projects.",
        problem:
          "Getting a building project approved depends on collecting the right information in the right order, and every file needs an audit trail.",
        whatChanged: [
          "A system for dynamic, configurable data-collection flows at the core of the approval process",
          "Document management on AWS S3 with an auditable record of every upload",
          "Stronger TypeScript across the frontend to speed up development",
        ],
        result: "A smoother, more reliable path from design to approval.",
        stack: ["React", "TypeScript", "Node.js", "PostgreSQL", "PostGIS", "AWS"],
      },
      displaysweet: {
        client: "DisplaySweet",
        sector: "Property tech",
        period: "2017–2018",
        title: "Prototypes that helped sell new ideas",
        summary: "Software for running live off-the-plan property sales, and rapid prototypes the sales team could show clients.",
        problem: "The company needed to show clients new capabilities quickly, before committing to full builds.",
        whatChanged: [
          "Software for organising and running live sales events and overseeing sales agents",
          "Rapid prototypes using neural networks, computer vision, Dialogflow, IFC, React Native and BabylonJS to test what was feasible",
        ],
        result: "New ideas tested fast, and a sales team with something real to show.",
        stack: ["React", "Node.js", "C#", ".NET", "OpenCV", "PyTorch"],
      },
      nokia: {
        client: "Nokia Networks",
        sector: "Telecoms",
        period: "2013–2016",
        title: "Making gigabytes of logs make sense",
        summary: "Web tools that linked and visualised huge logs, and system-level work on the move to 4.5G.",
        problem: "Teams spent a long time searching gigabytes-long logs from different systems to find the root cause of unexpected behaviour.",
        whatChanged: [
          "A browser tool that links, sorts and interleaves entries from different log types",
          "A web app for tracking and visualising problems reported across the company",
          "System-level 4.5G features, in a multinational specification group and a cross-department integration team",
        ],
        result: "Teams could find what they needed in gigabytes of logs quickly.",
        stack: ["C++", "Python", "protobuf", "Jenkins", "MySQL"],
      },
    },
  },
  about: {
    eyebrow: "About",
    title: "One way of thinking, many disciplines",
    intro:
      "Tangent is led by Piotr Ciesiolkiewicz, a software engineer and problem-solver with more than ten years of experience in startups and global companies, with a network of senior specialists brought in for each project.",
    story: [
      "Piotr started out in telecoms at Nokia, digging through gigabytes of logs to find why systems behaved unexpectedly, and building tools so others could find answers faster.",
      "Since then he has built fintech, health, e-commerce and property products in Australia and Europe, always with one eye on the business: pricing, revenue, how teams work and what customers actually need.",
      "Outside software he has a long practice in music and movement, and finds the same habits work everywhere: listen first, find the rhythm, keep things in balance, and connect ideas that don't usually meet.",
    ],
    educationTitle: "Education",
    education: [
      {
        degree: "Master's degree, Computer Science",
        school: "Wrocław University of Science and Technology",
        detail: "GPA 5.0 / 5.0 · Thesis: classification methods in automatic speech recognition",
      },
      {
        degree: "Engineer's degree, Control Engineering and Robotics",
        school: "Wrocław University of Science and Technology",
        detail: "GPA 5.0 / 5.0 · Thesis: remote control with speech recognition",
      },
    ],
    awardsTitle: "Awards",
    awards: [
      {
        title: "RegHack Downunder 2017 · 1st prize",
        body: "Sharenergy: a model for community energy markets that benefits households with and without rooftop solar, plus the regulatory framework to enable it, built in under 40 hours.",
      },
      {
        title: "GovHack 2017 · Community Environment Data award",
        body: "Litterly Awesome: a crowd-sourcing app that combines litter reports with government open data to show littering trends and what drives them.",
      },
    ],
    peopleTitle: "People",
    peopleIntro: "Led by Piotr, with a network of senior specialists brought in for each project.",
  },
  people: {
    items: {
      piotr: {
        role: "Founder · software engineer",
        bio: "Full-stack engineer and analyst. Fintech and DeFi, e-commerce, health, property tech and telecoms. Speaks English and Polish.",
      },
    },
  },
  cta: {
    title: "Let's connect the dots",
    body: "Book a 30-minute call about your product, your processes or your idea. You'll leave with at least one useful next step.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Book a call",
    intro: "Thirty minutes about your product, process or idea, with no obligation. Pick a time, or send a message and we'll reply within one business day.",
    bookTitle: "Pick a time",
    bookBody: "See open times and book in a couple of clicks.",
    formTitle: "Or send a message",
    form: {
      name: "Your name",
      email: "Email",
      company: "Company (optional)",
      message: "What would you like to talk about?",
      submit: "Send message",
      sending: "Sending…",
      sent: "Thanks! Your message is on its way. We'll reply within one business day.",
      errorSummary: "Please fix the highlighted fields.",
      emailFallback: "You can also email us at",
      fieldErrors: {
        name: "Please enter your name.",
        email: "Please enter a valid email address.",
        company: "Please keep this under 150 characters.",
        message: "Please write a little more (at least 10 characters).",
      },
      errors: {
        validation: "Please check the form and try again.",
        rate_limited: "Too many messages from your connection. Please try again in a few minutes.",
        send_failed: "Sorry, something went wrong sending your message.",
        unavailable: "The contact form isn't available right now.",
        bad_request: "Sorry, something went wrong sending your message.",
      },
    },
  },
  footer: {
    tagline: "Process, product and software for startups.",
    navLabel: "Footer",
    contactLabel: "Email",
    legal: "ABN 48 737 987 261",
    privacy: "Privacy",
    terms: "Terms",
    languages: { en: "English", pl: "Polski" },
  },
  consent: {
    label: "Cookie consent",
    text: "We use privacy-friendly analytics. Are analytics cookies okay?",
    accept: "Accept",
    decline: "Decline",
    policy: "Privacy policy",
    settings: "Privacy settings",
  },
  privacy: {
    title: "Privacy policy",
    updated: "Last updated: October 2026",
    sections: [
      {
        heading: "Who we are",
        paragraphs: ["Tangent is a sole-trader business run by Piotr Ciesiolkiewicz. You can reach us at the email address on our contact page."],
      },
      {
        heading: "What we collect",
        paragraphs: [
          "When you send a message, we receive your name, email, company and message. We use them only to reply to you.",
          "We use PostHog analytics to understand how the site is used: pages viewed, buttons clicked and general location (country). PostHog stores this data in the EU.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We set cookies that remember your language and which version of a page you see, and analytics cookies. On our Polish site, analytics cookies are only set after you accept them.",
        ],
      },
      { heading: "Your rights", paragraphs: ["You can ask to see, correct or delete your personal information at any time by emailing us."] },
    ],
  },
  terms: {
    title: "Terms",
    updated: "Last updated: October 2026",
    sections: [
      { heading: "Quotes", paragraphs: ["Every engagement starts with a written proposal. Work begins once you accept it."] },
      { heading: "Payment", paragraphs: ["Invoices are due within 14 days unless we agree otherwise."] },
      { heading: "Ownership", paragraphs: ["Once paid, you own the work we create for you."] },
      { heading: "Confidentiality", paragraphs: ["We keep your information confidential and are happy to sign an NDA."] },
      {
        heading: "Liability",
        paragraphs: [
          "We take care with every project, but we're not liable for indirect losses. Nothing in these terms limits your rights under the Australian Consumer Law.",
        ],
      },
    ],
  },
  notFound: {
    title: "Page not found",
    body: "This page doesn't exist, or it has moved.",
    home: "Go to the home page",
  },
};

export type Content = typeof en;
