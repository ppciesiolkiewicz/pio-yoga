/** English (Australia). The type source for every other locale. Rule: "custom apps", never "apps" alone. */
export const en = {
  meta: {
    siteDescription:
      "Helpful Machines finds what's slowing your small business down and fixes it, with AI, custom apps, tidy data or a better process. Plain English, small-business prices. Free first chat.",
    home: {
      title: "Helpful Machines · AI and custom apps for small businesses",
      description:
        "Helpful Machines finds what's slowing your small business down and fixes it, with AI, custom apps, tidy data or a better process. Plain English, small-business prices. Free first chat.",
    },
    services: {
      title: "Services · AI, custom apps, spreadsheets and integrations",
      description:
        "What Helpful Machines can do for your business: AI assistants and automation, custom apps and websites, spreadsheet and data clean-ups, migrations and integrations.",
    },
    howItWorks: {
      title: "How it works · from free chat to finished",
      description: "Four simple steps: a free chat, a fixed plan and quote, the build, and support afterwards.",
    },
    pricing: {
      title: "Pricing · dedicated monthly hours, price locked for a year",
      description: "New clients get 4 or 10 dedicated hours every month improving their business, at a monthly price locked for 12 months. Cancel any time. Start with a free chat.",
    },
    work: {
      title: "Work · what we've built before",
      description: "The experience behind Helpful Machines: checkout and payments, booking systems, recurring orders and internal tools.",
    },
    faq: {
      title: "FAQ · common questions",
      description: "Answers about cost, timelines, AI, data privacy and what happens after your project is finished.",
    },
    contact: {
      title: "Contact · book a free chat",
      description: "Book a free 30-minute chat or send a message. No jargon, no obligation.",
    },
    privacy: { title: "Privacy policy", description: "How Helpful Machines handles personal information and analytics." },
    terms: { title: "Terms", description: "The terms for working with Helpful Machines." },
  },
  nav: {
    services: "Services",
    howItWorks: "How it works",
    pricing: "Pricing",
    work: "Work",
    faq: "FAQ",
    contact: "Contact",
    cta: "Book a free chat",
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
    eyebrow: "Practical tech help for small businesses",
    title: {
      control: ["AI that actually ", "does the boring bits", "."],
      "easy-mode": ["Put your business on ", "easy mode", "."],
    },
    lead: "We look at how your business actually runs, find what's costing you time and money, and fix it, with AI, custom apps, tidy data or simply a better process. Plain English, small-business prices.",
    secondary: "See what we do",
    note: "30 minutes · no jargon · no obligation",
    chipsLabel: "What we help with",
    chips: ["AI assistants", "Spreadsheets", "Custom apps", "Integrations"],
  },
  fixes: {
    eyebrow: "How we help",
    title: "We find what's slowing you down, then fix it.",
    items: [
      {
        pain: "Too much of your week goes on admin.",
        fix: "We map where the time goes and remove the busywork, with automation, AI or a simpler way of working.",
      },
      { pain: "Your tools don't talk to each other.", fix: "We connect them, or replace them with something that fits how you work." },
      { pain: "Your numbers live in spreadsheets nobody trusts.", fix: "We tidy your data so decisions get easier." },
      { pain: "You're not sure which tech is worth paying for.", fix: "We tell you honestly, including when the answer is \"nothing\"." },
    ],
  },
  services: {
    eyebrow: "Services",
    title: "What we can do for you",
    intro: "Practical help, sized for small businesses. We start with the problem, not the technology.",
    linkLabel: "Learn more",
    problemsTitle: "Signs you need this",
    whatWeDoTitle: "What we do",
    deliverablesTitle: "What you get",
    faqTitle: "Questions",
    items: {
      "ai-assistants-automation": {
        title: "AI assistants & automation",
        summary: "Let AI handle the repetitive bits: emails, enquiries, quotes, notes and reports.",
        intro:
          "AI is good at first drafts and boring sorting. We set it up so it fits how you already work, with a person checking anything that matters.",
        problems: [
          "Your inbox is full of the same five questions.",
          "Quotes, notes or reports take hours to write up.",
          "You've tried ChatGPT but it doesn't know your business.",
        ],
        whatWeDo: [
          "Find the tasks where AI saves real time",
          "Set up assistants that know your products, prices and tone",
          "Connect them to your email, forms or tools",
          "Keep a person in the loop for anything customer-facing",
        ],
        deliverables: ["A working assistant or automation", "A short guide for your team", "A month of tweaks after launch"],
        faq: [
          { question: "Will AI send things to customers without me seeing them?", answer: "Only if you want it to. By default, it drafts and you approve." },
          { question: "Is my data used to train AI models?", answer: "We use business plans of AI services that don't train on your data, and we tell you exactly where it goes." },
        ],
      },
      "custom-apps-websites": {
        title: "Custom apps & websites",
        summary: "Custom apps and websites built around how your business actually works.",
        intro:
          "Off-the-shelf software makes you work its way. A custom app works your way, and for many small businesses it costs less than you'd expect.",
        problems: [
          "You pay for several tools that don't talk to each other.",
          "Your booking, ordering or job tracking is done by hand.",
          "Your website doesn't bring in enquiries.",
        ],
        whatWeDo: [
          "Booking, ordering and job-tracking custom apps",
          "Customer portals and internal tools",
          "Fast, simple websites that bring in enquiries",
          "Online payments with Stripe",
        ],
        deliverables: ["A custom app or website you own", "Hosting set up in your name", "Training and three months of fixes included"],
        faq: [
          { question: "Do I own the custom app?", answer: "Yes. The code and accounts are in your name." },
          { question: "Will it work on phones?", answer: "Yes. Everything we build works on phones, tablets and computers." },
        ],
      },
      "spreadsheets-data": {
        title: "Spreadsheets & data",
        summary: "Turn messy spreadsheets into clear, reliable numbers.",
        intro: "Most small businesses run on spreadsheets. We make them reliable, or move the important bits somewhere safer.",
        problems: ["Formulas break and nobody knows why.", "The numbers in different files don't match.", "Reports take a day to put together."],
        whatWeDo: ["Clean up and restructure spreadsheets", "Automate reports and dashboards", "Set up shared, backed-up data people can trust"],
        deliverables: ["Tidy spreadsheets or a simple database", "Automatic reports", "A short handover so anyone can maintain it"],
        faq: [{ question: "Do I have to stop using Excel or Google Sheets?", answer: "No. Often the best fix is a better spreadsheet." }],
      },
      "migrations-integrations": {
        title: "Migrations & integrations",
        summary: "Move to better tools and connect the ones you have.",
        intro: "Switching systems or connecting them shouldn't mean weekends of copy and paste. We plan it, move it and check it.",
        problems: [
          "You're stuck on an old system you've outgrown.",
          "You copy data between tools by hand.",
          "You're worried a migration will lose something.",
        ],
        whatWeDo: [
          "Plan and run moves to new tools",
          "Connect tools like Xero, Shopify, Google Workspace and your CRM",
          "Check every record arrives safely",
        ],
        deliverables: ["Your data moved and verified", "Tools that update each other automatically", "A rollback plan, just in case"],
        faq: [{ question: "Will my business stop while you migrate?", answer: "No. We move things in stages and switch over when everything checks out." }],
      },
      "find-what-works": {
        title: "Find what works",
        summary: "Not sure what you need? We'll look at how you work and find the best fix.",
        intro:
          "Sometimes the answer is AI, sometimes a custom app, sometimes a better spreadsheet, and sometimes nothing at all. We find out before you spend money.",
        problems: [
          "Everyone has an opinion about which tool to buy.",
          "You've spent money on software nobody uses.",
          "You want to grow without hiring for admin.",
        ],
        whatWeDo: [
          "Look at how work actually flows through your business",
          "Find the bottlenecks worth fixing",
          "Compare options honestly, including doing nothing",
        ],
        deliverables: ["A short written plan in plain English", "Costs and time saved for each option", "A clear first step"],
        faq: [{ question: "Do I have to hire you for the work afterwards?", answer: "No. The plan is yours to use however you like." }],
      },
    },
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "From free chat to finished",
    intro: "No surprises. You know the price before any work starts.",
    steps: [
      { title: "Free chat", body: "Thirty minutes to talk about what's slowing you down. No jargon, no sales pitch." },
      { title: "Plan and fixed quote", body: "A short written plan with a fixed price and timeline." },
      { title: "Build", body: "We build it, show you progress every week and adjust as we go." },
      { title: "Support", body: "Training for your team and help after launch, so it keeps working." },
    ],
  },
  pricing: {
    eyebrow: "New-client offer",
    title: "Dedicated hours every month, at a price locked for a year",
    intro:
      "Instead of one-off projects, you get dedicated time every month spent improving your business: finding what slows you down, then fixing it with a better process, AI, tidy data or custom apps. Start in the next few weeks and your price stays the same for 12 months. No contract: cancel any time.",
    badge: "New-client price · locked 12 months",
    perMonth: "/month",
    plans: {
      light: {
        name: "{hours} hours a month",
        summary: "{hours} dedicated hours every month improving your business.",
        features: ["One improvement at a time, start to finish", "A short update on what changed", "Price locked for 12 months", "Cancel any time"],
      },
      focus: {
        name: "{hours} hours a month",
        summary: "{hours} dedicated hours every month improving your business.",
        features: ["Bigger fixes, including custom apps", "A monthly check-in call", "Price locked for 12 months", "Cancel any time"],
      },
    },
    custom: {
      name: "Need more hours, or a one-off project?",
      body: "Larger custom apps, migrations and integrations are quoted after a free chat.",
      cta: "Book a free chat",
    },
    note: "Prices exclude GST. The new-client price stays the same for 12 months from your first month.",
    teaser: {
      title: "{price} a month. Locked for a year.",
      body: "New clients get {hours} dedicated hours every month improving their business for {price} a month, at a price that won't change for 12 months. Cancel any time.",
      link: "See the offer",
    },
    banner: {
      text: "New clients: {hours} hours a month improving your business for {price}/month, price locked for 12 months. Cancel any time.",
      link: "See the offer",
    },
  },
  career: {
    eyebrow: "The experience behind it",
    title: "More than ten years of fixing how businesses run",
    intro:
      "Helpful Machines is led by Piotr Ciesiolkiewicz, a software engineer and problem-solver with a Master's in Computer Science and more than ten years in startups and global companies across Australia and Europe. That experience goes into every plan: we look at pricing, revenue, how teams work and what customers actually need, not just the technology.",
    highlights: [
      { title: "Nokia", body: "Started out digging through gigabytes of logs to find why systems misbehaved, then built tools so others could find answers in minutes." },
      { title: "Highsnobiety", body: "Built product pages and a checkout that stayed fast and correct through huge limited-edition drops." },
      { title: "Officeworks", body: "Changed a team workflow that cut developers' wait for QA to zero, and built recurring orders for business customers." },
      { title: "Lysn", body: "Added configurable pricing and Medicare gap payments to grow revenue, and upskilled the local team for a smooth handover." },
      { title: "ONCHAIN", body: "Built card payments and a subscription engine that prices in dollars and charges in crypto." },
      {
        title: "Ideas from outside the box",
        body: "1st prize at RegHack Downunder 2017 and a GovHack 2017 award. Away from screens: circus, dance and music, which keep the ideas fresh and the solutions creative.",
      },
    ],
    link: "LinkedIn",
  },
  work: {
    eyebrow: "Work",
    title: "Built before",
    intro:
      "Helpful Machines is run by Piotr, a developer with more than ten years of experience building software for companies like these. The same skills now go into small-business projects.",
    link: "See all work",
    items: {
      highsnobiety: {
        client: "Highsnobiety",
        sector: "Fashion e-commerce",
        title: "Checkout for a global fashion store",
        body: "Product pages and checkout, plus systems that stayed up when limited-edition drops brought huge traffic spikes.",
      },
      officeworks: {
        client: "Officeworks",
        sector: "Retail",
        title: "Recurring orders for Australia's biggest office supplier",
        body: "Scoped and built a feature that lets businesses reorder products automatically.",
      },
      lysn: {
        client: "Lysn",
        sector: "Health",
        title: "Bookings and payments for a mental health platform",
        body: "Better online booking and pricing, plus Medicare gap payments that cut down on no-shows.",
      },
      onchain: {
        client: "ONCHAIN",
        sector: "Fintech",
        title: "Card payments and subscriptions for a payments startup",
        body: "Systems that let people pay by card, and let merchants set prices in dollars while being paid in crypto.",
      },
      udrew: {
        client: "uDrew",
        sector: "Building and design",
        title: "Online forms and documents for building approvals",
        body: "Configurable forms and an audited document store that sped up approvals for home building projects.",
      },
      nokia: {
        client: "Nokia",
        sector: "Telecoms",
        title: "Tools that made huge log files searchable",
        body: "Web tools that let teams find answers in gigabytes of logs in minutes.",
      },
    },
  },
  faq: {
    eyebrow: "FAQ",
    title: "Common questions",
    link: "See all questions",
    items: [
      {
        question: "How much does it cost?",
        answer: "New clients pick a monthly plan of 4 or 10 dedicated hours, at a price locked for 12 months (see the pricing page). No contract: cancel any time. Bigger one-off projects get a fixed quote after a free chat.",
      },
      { question: "How long does a project take?", answer: "Quick wins usually take a week or two. Custom apps usually take four to eight weeks." },
      { question: "I'm not technical. Is that a problem?", answer: "Not at all. We explain everything in plain English and handle the technical side." },
      { question: "Is my data safe?", answer: "We keep access to a minimum, use services with strong security, and never sell or share your data." },
      {
        question: "What happens after the project is finished?",
        answer: "You get training and a period of free fixes. After that, you can book help when you need it or choose a monthly plan.",
      },
      { question: "Do you work with businesses outside Australia?", answer: "Yes. We work remotely with businesses in Australia and Poland." },
    ],
  },
  cta: {
    title: "Let's make something easier",
    body: "Book a free 30-minute chat. Bring the task that annoys you most.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Book a free chat",
    intro: "Thirty minutes, no jargon, no obligation. Pick a time that suits you, or send a message and we'll reply within one business day.",
    bookTitle: "Pick a time",
    bookBody: "See open times and book in a couple of clicks.",
    formTitle: "Or send a message",
    form: {
      name: "Your name",
      email: "Email",
      company: "Business name (optional)",
      message: "What would you like help with?",
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
    tagline: "Practical AI and custom apps for small businesses.",
    navLabel: "Footer",
    contactLabel: "Email",
    legal: "ABN 48 737 987 261",
    privacy: "Privacy",
    terms: "Terms",
    languages: { en: "English", pl: "Polski" },
  },
  consent: {
    label: "Cookie consent",
    text: "We use privacy-friendly analytics to improve this site. Is that okay?",
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
        paragraphs: ["Helpful Machines is a sole-trader business run by Piotr Ciesiolkiewicz. You can reach us at the email address on our contact page."],
      },
      {
        heading: "What we collect",
        paragraphs: [
          "When you send a message, we receive your name, email, business name and message. We use them only to reply to you.",
          "We use PostHog analytics to understand how the site is used: pages viewed, buttons clicked and general location (country). PostHog stores this data in the EU.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We set cookies that remember your language and which version of a page you see, and analytics cookies. On our Polish site, analytics cookies are only set after you accept them.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: ["You can ask to see, correct or delete your personal information at any time by emailing us."],
      },
    ],
  },
  terms: {
    title: "Terms",
    updated: "Last updated: October 2026",
    sections: [
      { heading: "Quotes", paragraphs: ["Every project starts with a written quote. Work begins once you accept it."] },
      { heading: "Payment", paragraphs: ["Invoices are due within 14 days unless we agree otherwise."] },
      { heading: "Ownership", paragraphs: ["Once paid, you own the work we create for you."] },
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
