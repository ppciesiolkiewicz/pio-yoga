import type { Content } from "./en";

/** Polski (Polska). DRAFT for Piotr's review. Rule: "dedykowane aplikacje" / "aplikacje na zamówienie". */
export const pl: Content = {
  meta: {
    siteDescription:
      "Helpful Machines znajduje to, co spowalnia Twoją małą firmę, i to naprawia: za pomocą AI, dedykowanych aplikacji, porządku w danych albo lepszego procesu. Prostym językiem, w cenach dla małych firm. Pierwsza rozmowa za darmo.",
    home: {
      title: "Helpful Machines · AI i dedykowane aplikacje dla małych firm",
      description:
        "Helpful Machines znajduje to, co spowalnia Twoją małą firmę, i to naprawia: za pomocą AI, dedykowanych aplikacji, porządku w danych albo lepszego procesu. Prostym językiem, w cenach dla małych firm. Pierwsza rozmowa za darmo.",
    },
    services: {
      title: "Usługi · AI, dedykowane aplikacje, arkusze i integracje",
      description:
        "Co Helpful Machines może zrobić dla Twojej firmy: asystenci AI i automatyzacja, dedykowane aplikacje i strony, porządek w arkuszach i danych, migracje i integracje.",
    },
    howItWorks: {
      title: "Jak to działa · od rozmowy do gotowego rozwiązania",
      description: "Cztery proste kroki: bezpłatna rozmowa, plan ze stałą wyceną, realizacja i wsparcie po wdrożeniu.",
    },
    pricing: {
      title: "Cennik · jasne ceny startowe",
      description:
        "Ceny startowe automatyzacji AI, dedykowanych aplikacji i stałej pomocy. Każdy projekt zaczyna się od bezpłatnej rozmowy i stałej wyceny.",
    },
    work: {
      title: "Realizacje · co zbudowaliśmy wcześniej",
      description: "Doświadczenie stojące za Helpful Machines: płatności, systemy rezerwacji, zamówienia cykliczne i narzędzia wewnętrzne.",
    },
    faq: {
      title: "FAQ · najczęstsze pytania",
      description: "Odpowiedzi o koszty, terminy, AI, prywatność danych i to, co dzieje się po zakończeniu projektu.",
    },
    contact: {
      title: "Kontakt · umów bezpłatną rozmowę",
      description: "Umów bezpłatną 30-minutową rozmowę albo napisz wiadomość. Bez żargonu, bez zobowiązań.",
    },
    privacy: { title: "Polityka prywatności", description: "Jak Helpful Machines przetwarza dane osobowe i dane analityczne." },
    terms: { title: "Warunki współpracy", description: "Zasady współpracy z Helpful Machines." },
  },
  nav: {
    services: "Usługi",
    howItWorks: "Jak to działa",
    pricing: "Cennik",
    work: "Realizacje",
    faq: "FAQ",
    contact: "Kontakt",
    cta: "Umów bezpłatną rozmowę",
    menu: "Menu",
    close: "Zamknij menu",
    primary: "Główna",
    skip: "Przejdź do treści",
    newTab: "(otwiera się w nowej karcie)",
    breadcrumbs: "Ścieżka nawigacji",
    home: "Strona główna",
    colorMode: { group: "Tryb kolorów", light: "Jasny", dark: "Ciemny", system: "Systemowy" },
  },
  hero: {
    eyebrow: "Praktyczna pomoc technologiczna dla małych firm",
    title: {
      control: ["AI, które naprawdę ", "robi nudną robotę", "."],
      "easy-mode": ["Przełącz swoją firmę na ", "tryb łatwy", "."],
    },
    lead: "Sprawdzamy, jak naprawdę działa Twoja firma, znajdujemy to, co kosztuje Cię czas i pieniądze, i naprawiamy to: za pomocą AI, dedykowanych aplikacji, porządku w danych albo po prostu lepszego sposobu pracy. Prostym językiem, w cenach dla małych firm.",
    secondary: "Zobacz, co robimy",
    note: "30 minut · bez żargonu · bez zobowiązań",
    chipsLabel: "W czym pomagamy",
    chips: ["Asystenci AI", "Arkusze", "Dedykowane aplikacje", "Integracje"],
  },
  fixes: {
    eyebrow: "Jak pomagamy",
    title: "Znajdujemy to, co Cię spowalnia, i to naprawiamy.",
    items: [
      {
        pain: "Za dużo czasu w tygodniu zjada administracja.",
        fix: "Sprawdzamy, gdzie ucieka czas, i usuwamy zbędną pracę: automatyzacją, AI albo prostszym sposobem działania.",
      },
      { pain: "Twoje narzędzia ze sobą nie współpracują.", fix: "Łączymy je albo zastępujemy czymś, co pasuje do Twojego sposobu pracy." },
      { pain: "Liczby są w arkuszach, którym nikt nie ufa.", fix: "Porządkujemy dane, żeby decyzje były łatwiejsze." },
      { pain: "Nie wiesz, za jaką technologię warto płacić.", fix: "Mówimy uczciwie, także wtedy, gdy odpowiedź brzmi: za żadną." },
    ],
  },
  services: {
    eyebrow: "Usługi",
    title: "W czym możemy pomóc",
    intro: "Praktyczna pomoc dopasowana do małych firm. Zaczynamy od problemu, nie od technologii.",
    linkLabel: "Dowiedz się więcej",
    problemsTitle: "Kiedy tego potrzebujesz",
    whatWeDoTitle: "Co robimy",
    deliverablesTitle: "Co dostajesz",
    faqTitle: "Pytania",
    items: {
      "ai-assistants-automation": {
        title: "Asystenci AI i automatyzacja",
        summary: "Niech AI zajmie się powtarzalną pracą: mailami, zapytaniami, wycenami, notatkami i raportami.",
        intro:
          "AI świetnie radzi sobie z pierwszymi wersjami tekstów i nudnym sortowaniem. Wdrażamy je tak, żeby pasowało do Twojego sposobu pracy, a wszystko, co ważne, sprawdza człowiek.",
        problems: [
          "Skrzynka jest pełna tych samych pięciu pytań.",
          "Wyceny, notatki i raporty zajmują godziny.",
          "Próbowałeś ChatGPT, ale nie zna on Twojej firmy.",
        ],
        whatWeDo: [
          "Znajdujemy zadania, w których AI naprawdę oszczędza czas",
          "Konfigurujemy asystentów, którzy znają Twoje produkty, ceny i styl",
          "Łączymy ich z pocztą, formularzami i narzędziami",
          "Zostawiamy człowieka przy wszystkim, co trafia do klientów",
        ],
        deliverables: ["Działający asystent lub automatyzacja", "Krótka instrukcja dla zespołu", "Miesiąc poprawek po wdrożeniu"],
        faq: [
          { question: "Czy AI wyśle coś klientom bez mojej wiedzy?", answer: "Tylko jeśli tego chcesz. Domyślnie AI przygotowuje szkic, a Ty go zatwierdzasz." },
          {
            question: "Czy moje dane posłużą do trenowania modeli AI?",
            answer: "Korzystamy z biznesowych planów usług AI, które nie trenują na Twoich danych, i mówimy dokładnie, gdzie te dane trafiają.",
          },
        ],
      },
      "custom-apps-websites": {
        title: "Dedykowane aplikacje i strony",
        summary: "Dedykowane aplikacje i strony internetowe zbudowane wokół tego, jak naprawdę działa Twoja firma.",
        intro:
          "Gotowe oprogramowanie zmusza Cię do pracy na jego zasadach. Dedykowana aplikacja działa na Twoich, a dla wielu małych firm kosztuje mniej, niż się wydaje.",
        problems: [
          "Płacisz za kilka narzędzi, które ze sobą nie współpracują.",
          "Rezerwacje, zamówienia albo zlecenia prowadzisz ręcznie.",
          "Strona internetowa nie przynosi zapytań.",
        ],
        whatWeDo: [
          "Dedykowane aplikacje do rezerwacji, zamówień i obsługi zleceń",
          "Portale dla klientów i narzędzia wewnętrzne",
          "Szybkie, proste strony, które przynoszą zapytania",
          "Płatności online przez Stripe",
        ],
        deliverables: ["Dedykowana aplikacja lub strona, która należy do Ciebie", "Hosting założony na Twoje dane", "Szkolenie i trzy miesiące poprawek w cenie"],
        faq: [
          { question: "Czy aplikacja na zamówienie będzie moja?", answer: "Tak. Kod i konta są zapisane na Ciebie." },
          { question: "Czy będzie działać na telefonach?", answer: "Tak. Wszystko, co budujemy, działa na telefonach, tabletach i komputerach." },
        ],
      },
      "spreadsheets-data": {
        title: "Arkusze i dane",
        summary: "Zamieniamy chaotyczne arkusze w jasne, wiarygodne liczby.",
        intro: "Większość małych firm działa na arkuszach. Sprawiamy, że są niezawodne, albo przenosimy najważniejsze rzeczy w bezpieczniejsze miejsce.",
        problems: ["Formuły się psują i nikt nie wie dlaczego.", "Liczby w różnych plikach się nie zgadzają.", "Przygotowanie raportu zajmuje cały dzień."],
        whatWeDo: ["Porządkujemy i przebudowujemy arkusze", "Automatyzujemy raporty i dashboardy", "Tworzymy wspólne dane z kopią zapasową, którym można ufać"],
        deliverables: ["Uporządkowane arkusze lub prosta baza danych", "Automatyczne raporty", "Krótkie przekazanie, żeby każdy mógł je utrzymać"],
        faq: [{ question: "Czy muszę przestać używać Excela lub Arkuszy Google?", answer: "Nie. Często najlepszym rozwiązaniem jest po prostu lepszy arkusz." }],
      },
      "migrations-integrations": {
        title: "Migracje i integracje",
        summary: "Przejdź na lepsze narzędzia i połącz te, które już masz.",
        intro: "Zmiana systemu albo połączenie kilku nie powinny oznaczać weekendów kopiowania i wklejania. Planujemy, przenosimy i sprawdzamy.",
        problems: [
          "Utknąłeś w starym systemie, z którego firma już wyrosła.",
          "Ręcznie przepisujesz dane między narzędziami.",
          "Boisz się, że przy migracji coś zginie.",
        ],
        whatWeDo: [
          "Planujemy i przeprowadzamy przejście na nowe narzędzia",
          "Łączymy narzędzia takie jak Fakturownia, Shopify, Google Workspace czy Twój CRM",
          "Sprawdzamy, czy każdy rekord dotarł bezpiecznie",
        ],
        deliverables: ["Dane przeniesione i zweryfikowane", "Narzędzia, które same się aktualizują", "Plan powrotu, na wszelki wypadek"],
        faq: [{ question: "Czy firma stanie na czas migracji?", answer: "Nie. Przenosimy dane etapami i przełączamy się, gdy wszystko się zgadza." }],
      },
      "find-what-works": {
        title: "Znajdźmy, co działa",
        summary: "Nie wiesz, czego potrzebujesz? Przyjrzymy się Twojej pracy i znajdziemy najlepsze rozwiązanie.",
        intro:
          "Czasem odpowiedzią jest AI, czasem dedykowana aplikacja, czasem lepszy arkusz, a czasem nic. Sprawdzamy to, zanim wydasz pieniądze.",
        problems: [
          "Każdy ma swoje zdanie, jakie narzędzie kupić.",
          "Wydałeś pieniądze na oprogramowanie, z którego nikt nie korzysta.",
          "Chcesz rosnąć bez zatrudniania ludzi do administracji.",
        ],
        whatWeDo: [
          "Sprawdzamy, jak naprawdę płynie praca w Twojej firmie",
          "Znajdujemy wąskie gardła, które warto naprawić",
          "Uczciwie porównujemy opcje, łącznie z pozostawieniem wszystkiego bez zmian",
        ],
        deliverables: ["Krótki plan na piśmie, prostym językiem", "Koszty i zaoszczędzony czas dla każdej opcji", "Jasny pierwszy krok"],
        faq: [{ question: "Czy potem muszę zlecić Wam realizację?", answer: "Nie. Plan jest Twój i możesz go wykorzystać, jak chcesz." }],
      },
    },
  },
  howItWorks: {
    eyebrow: "Jak to działa",
    title: "Od rozmowy do gotowego rozwiązania",
    intro: "Bez niespodzianek. Znasz cenę, zanim zaczniemy pracę.",
    steps: [
      { title: "Bezpłatna rozmowa", body: "Trzydzieści minut o tym, co Cię spowalnia. Bez żargonu i bez sprzedawania na siłę." },
      { title: "Plan i stała wycena", body: "Krótki plan na piśmie ze stałą ceną i terminem." },
      { title: "Realizacja", body: "Budujemy, co tydzień pokazujemy postępy i wprowadzamy poprawki na bieżąco." },
      { title: "Wsparcie", body: "Szkolenie dla zespołu i pomoc po wdrożeniu, żeby wszystko dalej działało." },
    ],
  },
  pricing: {
    eyebrow: "Cennik",
    title: "Jasne ceny startowe",
    intro: "Każda firma jest inna, dlatego każdy projekt dostaje stałą wycenę po bezpłatnej rozmowie. To typowe punkty startowe.",
    from: "Od",
    perMonth: "/mies.",
    packages: {
      quickWin: {
        name: "Szybka poprawa",
        summary: "Jedna automatyzacja, asystent AI lub poprawka arkusza.",
        features: ["Jedno konkretne usprawnienie", "Wdrożenie w około tydzień", "Miesiąc poprawek"],
      },
      customApp: {
        name: "Dedykowana aplikacja",
        summary: "Dedykowana aplikacja lub strona zbudowana wokół Twojej firmy.",
        features: ["Projektowana razem z Tobą", "Należy do Ciebie", "Trzy miesiące poprawek"],
      },
      support: {
        name: "Stała pomoc",
        summary: "Niewielki miesięczny abonament na zmiany i pytania.",
        features: ["Zmiany, kiedy ich potrzebujesz", "Szybsze odpowiedzi", "Rezygnacja w dowolnym momencie"],
      },
    },
    custom: {
      name: "Coś większego?",
      body: "Migracje, integracje i większe aplikacje na zamówienie wyceniamy po bezpłatnej rozmowie.",
      cta: "Umów bezpłatną rozmowę",
    },
    note: "Ceny netto (bez VAT).",
    teaser: {
      title: "Ceny dla małych firm",
      body: "Szybkie poprawki od {price}. Każdy projekt dostaje stałą wycenę przed rozpoczęciem pracy.",
      link: "Zobacz cennik",
    },
  },
  work: {
    eyebrow: "Realizacje",
    title: "Zbudowane wcześniej",
    intro:
      "Helpful Machines prowadzi Piotr, programista z ponad dziesięcioletnim doświadczeniem w tworzeniu oprogramowania dla firm takich jak te poniżej. Te same umiejętności trafiają teraz do projektów dla małych firm.",
    link: "Zobacz wszystkie realizacje",
    items: {
      highsnobiety: {
        client: "Highsnobiety",
        sector: "E-commerce modowy",
        title: "Proces zakupowy dla globalnego sklepu z modą",
        body: "Strony produktów i koszyk oraz systemy, które wytrzymywały ogromny ruch podczas premier limitowanych kolekcji.",
      },
      officeworks: {
        client: "Officeworks",
        sector: "Handel",
        title: "Zamówienia cykliczne dla największego dostawcy artykułów biurowych w Australii",
        body: "Zaprojektowanie i wdrożenie funkcji, dzięki której firmy automatycznie ponawiają zamówienia.",
      },
      lysn: {
        client: "Lysn",
        sector: "Zdrowie",
        title: "Rezerwacje i płatności dla platformy zdrowia psychicznego",
        body: "Lepsze rezerwacje online i ceny oraz dopłaty Medicare, które zmniejszyły liczbę nieodbytych wizyt.",
      },
      onchain: {
        client: "ONCHAIN",
        sector: "Fintech",
        title: "Płatności kartą i subskrypcje dla startupu płatniczego",
        body: "Systemy, które pozwalają płacić kartą, a sprzedawcom ustalać ceny w dolarach i otrzymywać zapłatę w kryptowalutach.",
      },
      udrew: {
        client: "uDrew",
        sector: "Budownictwo i projektowanie",
        title: "Formularze i dokumenty online do pozwoleń budowlanych",
        body: "Konfigurowalne formularze i archiwum dokumentów z pełną historią, które przyspieszyły zatwierdzanie projektów domów.",
      },
      nokia: {
        client: "Nokia",
        sector: "Telekomunikacja",
        title: "Narzędzia do przeszukiwania ogromnych logów",
        body: "Narzędzia webowe, dzięki którym zespoły znajdowały odpowiedzi w gigabajtach logów w kilka minut.",
      },
    },
  },
  faq: {
    eyebrow: "FAQ",
    title: "Najczęstsze pytania",
    link: "Zobacz wszystkie pytania",
    items: [
      {
        question: "Ile to kosztuje?",
        answer: "Większość projektów zaczyna się od cen z naszego cennika. Po bezpłatnej rozmowie dostajesz stałą wycenę, więc cena się nie zmieni, chyba że zmieni się zakres.",
      },
      { question: "Ile trwa projekt?", answer: "Szybkie poprawki zwykle tydzień lub dwa. Dedykowane aplikacje zwykle od czterech do ośmiu tygodni." },
      { question: "Nie znam się na technologii. Czy to problem?", answer: "Ani trochę. Wszystko tłumaczymy prostym językiem i zajmujemy się stroną techniczną." },
      {
        question: "Czy moje dane są bezpieczne?",
        answer: "Ograniczamy dostęp do minimum, korzystamy z usług o wysokim poziomie bezpieczeństwa i nigdy nie sprzedajemy ani nie udostępniamy Twoich danych.",
      },
      {
        question: "Co dzieje się po zakończeniu projektu?",
        answer: "Dostajesz szkolenie i okres bezpłatnych poprawek. Potem możesz zamawiać pomoc, kiedy jej potrzebujesz, albo wybrać miesięczny abonament.",
      },
      { question: "Czy pracujecie z firmami spoza Polski?", answer: "Tak. Pracujemy zdalnie z firmami w Polsce i w Australii." },
    ],
  },
  cta: {
    title: "Ułatwmy Ci pracę",
    body: "Umów bezpłatną 30-minutową rozmowę. Przyjdź z zadaniem, które irytuje Cię najbardziej.",
  },
  contact: {
    eyebrow: "Kontakt",
    title: "Umów bezpłatną rozmowę",
    intro: "Trzydzieści minut, bez żargonu i bez zobowiązań. Wybierz dogodny termin albo napisz wiadomość, a odpowiemy w ciągu jednego dnia roboczego.",
    bookTitle: "Wybierz termin",
    bookBody: "Zobacz wolne terminy i zarezerwuj w kilka kliknięć.",
    formTitle: "Albo napisz wiadomość",
    form: {
      name: "Imię i nazwisko",
      email: "E-mail",
      company: "Nazwa firmy (opcjonalnie)",
      message: "W czym możemy pomóc?",
      submit: "Wyślij wiadomość",
      sending: "Wysyłanie…",
      sent: "Dziękujemy! Wiadomość została wysłana. Odpowiemy w ciągu jednego dnia roboczego.",
      errorSummary: "Popraw zaznaczone pola.",
      emailFallback: "Możesz też napisać na adres",
      fieldErrors: {
        name: "Podaj imię i nazwisko.",
        email: "Podaj poprawny adres e-mail.",
        company: "Nazwa firmy może mieć maksymalnie 150 znaków.",
        message: "Napisz trochę więcej (co najmniej 10 znaków).",
      },
      errors: {
        validation: "Sprawdź formularz i spróbuj ponownie.",
        rate_limited: "Zbyt wiele wiadomości z Twojego połączenia. Spróbuj ponownie za kilka minut.",
        send_failed: "Przepraszamy, nie udało się wysłać wiadomości.",
        unavailable: "Formularz kontaktowy jest chwilowo niedostępny.",
        bad_request: "Przepraszamy, nie udało się wysłać wiadomości.",
      },
    },
  },
  footer: {
    tagline: "Praktyczne AI i dedykowane aplikacje dla małych firm.",
    navLabel: "Stopka",
    contactLabel: "E-mail",
    legal: "NIP: do uzupełnienia",
    privacy: "Prywatność",
    terms: "Warunki",
    languages: { en: "English", pl: "Polski" },
  },
  consent: {
    label: "Zgoda na pliki cookie",
    text: "Używamy analityki szanującej prywatność. Czy zgadzasz się na analityczne pliki cookie?",
    accept: "Akceptuję",
    decline: "Odrzucam",
    policy: "Polityka prywatności",
    settings: "Ustawienia prywatności",
  },
  privacy: {
    title: "Polityka prywatności",
    updated: "Ostatnia aktualizacja: październik 2026",
    sections: [
      {
        heading: "Kim jesteśmy",
        paragraphs: [
          "Administratorem danych jest Helpful Machines, jednoosobowa działalność prowadzona przez Piotra Ciesiolkiewicza. Dane kontaktowe znajdziesz na stronie kontaktu.",
        ],
      },
      {
        heading: "Jakie dane zbieramy",
        paragraphs: [
          "Gdy wysyłasz wiadomość, otrzymujemy Twoje imię, e-mail, nazwę firmy i treść wiadomości. Używamy ich wyłącznie do odpowiedzi.",
          "Korzystamy z analityki PostHog, żeby zrozumieć, jak używana jest strona: wyświetlone strony, kliknięcia i przybliżona lokalizacja (kraj). Dopóki nie wyrazisz zgody, analityka działa bez plików cookie i bez zapisywania czegokolwiek w Twojej przeglądarce. PostHog przechowuje dane w UE.",
        ],
      },
      {
        heading: "Pliki cookie",
        paragraphs: [
          "Ustawiamy pliki cookie zapamiętujące język i wersję strony, którą widzisz. Analityczne pliki cookie ustawiamy dopiero po wyrażeniu zgody. Zgodę możesz zmienić w każdej chwili w ustawieniach prywatności w stopce.",
        ],
      },
      {
        heading: "Twoje prawa",
        paragraphs: [
          "Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia i ograniczenia przetwarzania, a także prawo wniesienia skargi do Prezesa UODO. Napisz do nas, aby skorzystać z tych praw.",
        ],
      },
    ],
  },
  terms: {
    title: "Warunki współpracy",
    updated: "Ostatnia aktualizacja: październik 2026",
    sections: [
      { heading: "Wycena", paragraphs: ["Każdy projekt zaczyna się od pisemnej wyceny. Pracę rozpoczynamy po jej akceptacji."] },
      { heading: "Płatność", paragraphs: ["Faktury są płatne w ciągu 14 dni, chyba że ustalimy inaczej."] },
      { heading: "Prawa do pracy", paragraphs: ["Po opłaceniu faktury prawa do stworzonej dla Ciebie pracy przechodzą na Ciebie."] },
      {
        heading: "Odpowiedzialność",
        paragraphs: ["Dbamy o każdy projekt, ale nie odpowiadamy za szkody pośrednie. Nic w tych warunkach nie ogranicza Twoich praw konsumenckich."],
      },
    ],
  },
  notFound: {
    title: "Nie znaleziono strony",
    body: "Ta strona nie istnieje albo została przeniesiona.",
    home: "Przejdź na stronę główną",
  },
};
