/** English (Australia). The type source for every other locale. Rule: "custom apps", never "apps" alone. */
export const en = {
  meta: {
    siteDescription:
      "Your own tech consultant for small businesses. AI tools, custom apps and integrations, built for you. Start with a free review.",
    home: {
      title: "Helpful Machines · AI and custom apps for small businesses",
      description:
        "Your own tech consultant for small businesses. AI tools, custom apps and integrations, built for you. Start with a free review.",
    },
    services: {
      title: "Services · AI tools, custom apps and integrations",
      description:
        "What Helpful Machines can build for your business: AI tools, custom apps and websites, integrations and migrations, and data you can rely on.",
    },
    howItWorks: {
      title: "How it works · from free review to finished",
      description: "Four simple steps: a free review, a free written plan, the work, and a monthly check-in on what to improve next.",
    },
    pricing: {
      title: "Pricing · Up to 75% off for our first 5 clients",
      description: "Your own consultant for 4 or 8 hours every month. Our first 5 clients get up to 75% off the usual price, locked for 12 months. Cancel any time. Start with a free review.",
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
      title: "Contact · book a free review",
      description: "Book a free 30-minute review and get a written plan for your business. No jargon, no obligation.",
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
    cta: "Book a free review",
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
    eyebrow: "Your own tech consultant for small businesses",
    title: {
      control: ["We'll find what we can do for you, ", "and do it better", "."],
      "easy-mode": ["Put your business on ", "easy mode", "."],
    },
    lead: "AI tools, custom apps and integrations, built around how you work. Tell us what's slowing you down, and we'll take it from there.",
    secondary: "See what we do",
    note: "Free review · no obligation",
    chipsLabel: "What we build",
    chips: ["AI tools", "Custom apps", "Integrations"],
  },
  landing: {
    services: {
      eyebrow: "What we do",
      title: "What we can build for you",
      items: [
        { slug: "ai-assistants-automation", title: "AI tools", summary: "Smart assistants that take the repetitive work off your plate." },
        { slug: "custom-apps-websites", title: "Custom apps", summary: "Made for your business, so every day runs smoother." },
        { slug: "migrations-integrations", title: "Integrations", summary: "Your software working together, automatically." },
        { slug: "find-what-works", title: "Your best path", summary: "Not sure where to start? We look at how you work and find what's worth doing first." },
      ],
    },
  },
  fixes: {
    eyebrow: "How we help",
    title: "We find what's slowing you down, then fix it.",
    items: [
      {
        pain: "Too much of your week goes on admin.",
        fix: "We map where the time goes and remove the busywork, with automation, AI or a simpler way of working.",
      },
      { pain: "Your tools don't talk to each other.", fix: "We connect them, or build a custom app that fits how you work and makes your day easier." },
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
        summary: "AI that answers enquiries and drafts quotes, replies and reports in your tone.",
        intro:
          "AI is brilliant at first drafts. We set it up so it fits how you already work, with a person checking anything that matters.",
        problems: [
          "Your inbox is full of the same five questions.",
          "Quotes, notes or reports take hours to write up.",
          "You've tried ChatGPT but it doesn't know your business.",
        ],
        whatWeDo: [
          "Find the tasks where AI saves real time",
          "Set up assistants that know your products, prices and tone",
          "Connect them to your email, forms or tools",
        ],
        deliverables: ["A working assistant or automation", "A short guide for your team", "A month of tweaks after launch"],
        faq: [
          { question: "Will AI send things to customers without me seeing them?", answer: "Only if you want it to. By default, it drafts and you approve." },
          { question: "Is my data used to train AI models?", answer: "We use business plans of AI services that don't train on your data, and we tell you exactly where it goes." },
        ],
      },
      "custom-apps-websites": {
        title: "Custom apps & websites",
        summary: "Custom apps that fit your business, not the other way round.",
        intro:
          "Off-the-shelf software makes you work its way. A custom app works your way, cuts the steps you repeat every day, and often costs less than you'd expect.",
        problems: [
          "Your software makes simple jobs slow.",
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
        title: "Data & dashboards",
        summary: "Clear, reliable numbers, without the spreadsheet wrangling.",
        intro: "See how your business is doing at a glance. We make your numbers reliable and your reports automatic.",
        problems: ["The numbers in different files don't match.", "Reports take a day to put together."],
        whatWeDo: ["Clean up and restructure spreadsheets", "Automate reports and dashboards", "Set up shared, backed-up data people can trust"],
        deliverables: ["Tidy spreadsheets or a simple database", "Automatic reports", "A short handover so anyone can maintain it"],
        faq: [{ question: "Do I have to stop using Excel or Google Sheets?", answer: "No. Often the best fix is a better spreadsheet." }],
      },
      "migrations-integrations": {
        title: "Integrations & migrations",
        summary: "Connect the tools you have, and move to better ones safely.",
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
        title: "Your best path",
        summary: "Not sure what you need? We'll look at how you work and find the best fix.",
        intro:
          "Sometimes the answer is AI, sometimes a custom app, sometimes an integration, and sometimes nothing at all. We find out before you spend money, and the first review and plan are free.",
        problems: [
          "Everyone has an opinion about which tool to buy.",
          "You've spent money on software nobody uses.",
          "You want to grow without hiring more people.",
        ],
        whatWeDo: [
          "Look at how work actually flows through your business",
          "Find the bottlenecks worth fixing",
          "Compare options honestly, including doing nothing",
        ],
        deliverables: ["A short written plan in plain English", "Rough costs and time saved for each option", "A clear first step"],
        faq: [
          { question: "Do I have to hire you for the work afterwards?", answer: "No. The plan is yours to use however you like." },
          { question: "Do you get paid to recommend software?", answer: "No. We don't take commissions, so we recommend what's best for you, even if that's a tool you already have." },
        ],
      },
    },
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Four simple steps",
    intro: "You see the plan before you pay anything.",
    steps: [
      { title: "Free review", body: "A 30-minute call about your business and what's slowing it down." },
      { title: "A clear plan", body: "A free written plan: what to build, rough costs, and what to do first." },
      { title: "We build it", body: "Choose a monthly plan and we build it, integrate it and maintain it for you, with updates as we go." },
      { title: "Keep improving", body: "A free monthly idea session to pick what to improve next. No list of software to set up yourself." },
    ],
  },
  pricing: {
    eyebrow: "Founding-client offer",
    title: "Your own consultant, up to 75% off for our first 5 clients",
    intro:
      "Every month, a consultant works on your business: finding what slows you down, then fixing it with AI tools, custom apps or integrations. Every plan includes a free monthly idea session to pick what to improve next. To build our first Australian case studies, our first 5 clients pay up to 75% less than the usual price, locked for 12 months, in exchange for feedback and a testimonial once we deliver. No contract: cancel any time.",
    badge: "Founding client · up to 75% off",
    perMonth: "/month",
    regularPriceLabel: "Usual price",
    plans: {
      light: {
        name: "{hours} hours a month",
        summary: "One improvement at a time, start to finish.",
        features: ["Free monthly idea session, on top of your hours", "A short update on what changed", "Founding price locked for 12 months", "Cancel any time"],
      },
      focus: {
        name: "{hours} hours a month",
        summary: "Room for bigger fixes, including custom apps.",
        features: ["Free monthly idea session, on top of your hours", "A short update on what changed", "Founding price locked for 12 months", "Cancel any time"],
      },
    },
    custom: {
      name: "Need more hours, or a one-off project?",
      body: "Larger custom apps, migrations and integrations get a fixed quote after your free review.",
      cta: "Book a free review",
    },
    note: "Prices exclude GST.",
    offerTerms: {
      title: "Offer terms",
      items: [
        "The founding price is for our first 5 clients who start a monthly plan. The offer ends when all 5 places are taken, or earlier if we close it.",
        "Your founding price is locked for 12 months from your first paid month. It won't go up during that time.",
        "If you switch between the 4-hour and 8-hour plans, you keep your founding discount off the usual price for the rest of your 12 months.",
        "After 12 months, your plan moves to our usual price at that time. We'll tell you at least 30 days before, so you can change plan or cancel.",
        "There's no minimum term. Cancel before your next month starts and you won't be charged again.",
        "Unused hours don't carry over to the next month.",
        "If you cancel and come back later, the usual price applies.",
        "Prices exclude GST. These terms sit alongside our general terms and don't limit your rights under the Australian Consumer Law.",
      ],
      link: "See all terms",
    },
    teaser: {
      title: "Your own consultant from {price} a month",
      body: "{hours} hours a month, plus a free monthly idea session. Our first 5 clients pay {price} instead of {fullPrice}, locked for 12 months. Cancel any time.",
      link: "See the offer",
    },
    banner: {
      headline: "Up to 75% off for our first 5 clients",
      detail: "{hours} hours a month for {price} (usually {fullPrice}), locked for 12 months. Cancel any time.",
      link: "See the offer",
    },
  },
  career: {
    eyebrow: "The experience behind it",
    title: "More than ten years of fixing how businesses run",
    intro:
      "Helpful Machines is led by Piotr Ciesiolkiewicz, a software engineer with a Master's in Computer Science and more than ten years in startups and global companies across Australia and Europe. Every plan looks at the whole business, not just the technology.",
    highlights: [
      { title: "Nokia", body: "Started out digging through gigabytes of logs to find why systems misbehaved, then built tools so others could find answers in minutes." },
      { title: "Highsnobiety", body: "Built product pages and a checkout that stayed fast and correct through huge limited-edition drops." },
      { title: "Officeworks", body: "Changed a team workflow that cut developers' wait for QA to zero, and built recurring orders for business customers." },
      { title: "Lysn", body: "Added configurable pricing and Medicare gap payments to grow revenue." },
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
        answer: "The review and written plan are free. If you want us to do the work, pick a monthly plan of 4 or 8 hours. Our first 5 clients get up to 75% off the usual price, locked for 12 months (see the pricing page). No contract: cancel any time. Bigger one-off projects get a fixed quote.",
      },
      {
        question: "What's in the free review?",
        answer: "A 30-minute call about how your business runs, then a short written plan: what's worth fixing, your options with rough costs, and what we'd do first. It's yours to keep, with no obligation.",
      },
      {
        question: "Whose side are you on?",
        answer: "Yours. We don't sell software or take commissions, so the only way we do well is when your business does. We recommend what's best for you, including doing nothing.",
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
    title: "Let's see what's possible",
    body: "Book a free review. Tell us what's slowing you down, and leave with a plan.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Book a free review",
    intro: "A 30-minute call about your business, then a short written plan. Free, no obligation. Pick a time, or send a message and we'll reply within one business day.",
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
    tagline: "Your own tech consultant for small businesses.",
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
          "We set cookies that remember which version of a page you see, and analytics cookies.",
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
    updated: "Last updated: November 2026",
    offerHeading: "Founding-client offer",
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
