import type { Content } from "./en";

/** Polski (Polska). DRAFT for Piotr's review. Neutral forms preferred over masculine "-łeś". */
export const pl: Content = {
  meta: {
    siteDescription:
      "Tangent pomaga startupom łączyć kropki: sprawdzamy, jak działa Twój produkt, dane i zespół, usuwamy to, co blokuje pracę, i budujemy potrzebne aplikacje oraz platformy. Ponad dziesięć lat w fintechu, e-commerce i ochronie zdrowia.",
    home: {
      title: "Tangent · Procesy, produkt i oprogramowanie dla startupów",
      description:
        "Tangent pomaga startupom łączyć kropki: sprawdzamy, jak działa Twój produkt, dane i zespół, usuwamy to, co blokuje pracę, i budujemy potrzebne aplikacje oraz platformy.",
    },
    services: {
      title: "Usługi · usprawnianie procesów, aplikacje na zamówienie i przywództwo techniczne",
      description:
        "Świeże spojrzenie na to, jak działa Twój startup, usprawnianie procesów, aplikacje i platformy na zamówienie, sprinty produktowe, techniczne przywództwo na część etatu oraz płatności, AI i Web3.",
    },
    work: {
      title: "Realizacje · doświadczenie stojące za Tangent",
      description: "Studia przypadków z fintechu, ochrony zdrowia, e-commerce, handlu, proptechu i telekomunikacji: problem, co się zmieniło i jaki był efekt.",
    },
    about: {
      title: "O nas · ludzie stojący za Tangent",
      description:
        "Tangent prowadzi Piotr Ciesiolkiewicz, inżynier oprogramowania z ponad dziesięcioletnim doświadczeniem, razem z siecią doświadczonych specjalistów.",
    },
    contact: { title: "Kontakt · umów rozmowę", description: "Umów 30-minutową rozmowę o produkcie, procesach albo pomyśle. Bez zobowiązań." },
    privacy: { title: "Polityka prywatności", description: "Jak Tangent przetwarza dane osobowe i dane analityczne." },
    terms: { title: "Warunki współpracy", description: "Zasady współpracy z Tangent." },
  },
  nav: {
    services: "Usługi",
    work: "Realizacje",
    about: "O nas",
    contact: "Kontakt",
    cta: "Umów rozmowę",
    menu: "Menu",
    close: "Zamknij menu",
    primary: "Nawigacja główna",
    skip: "Przejdź do treści",
    newTab: "(otwiera się w nowej karcie)",
    breadcrumbs: "Ścieżka nawigacji",
    home: "Strona główna",
    colorMode: { group: "Tryb kolorów", light: "Jasny", dark: "Ciemny", system: "Systemowy" },
  },
  hero: {
    eyebrow: "Procesy, produkt i oprogramowanie · dla startupów",
    title: ["Połącz kropki. ", "Odblokuj przepływ."],
    lead: "Sprawdzamy, jak naprawdę działa Twój produkt, dane i zespół, znajdujemy miejsca, w których praca się zacina, i przywracamy płynność: prostszym procesem, lepszym przepływem pracy albo aplikacją zbudowaną dokładnie pod Twoje potrzeby. Ponad dziesięć lat budowania produktów fintech, e-commerce i medycznych, teraz do Twojej dyspozycji.",
    secondary: "Zobacz realizacje",
    proofLabel: "Doświadczenie",
    proof: ["Ponad 10 lat budowania produktów", "Fintech i DeFi", "E-commerce", "Ochrona zdrowia", "Telekomunikacja"],
    dots: { idea: "pomysł", market: "rynek", users: "ludzie", data: "dane", tech: "technologia", product: "produkt" },
  },
  flows: {
    eyebrow: "Co robimy",
    title: "Patrzymy na całość",
    intro:
      "Większość problemów rosnącego startupu nie leży w jednym miejscu. Siedzą pomiędzy produktem, danymi, narzędziami i ludźmi. Znajdujemy miejsca, w których praca się zacina, i usuwamy przyczynę.",
    items: [
      {
        title: "Powolne, stresujące wdrożenia",
        body: "Sprawdzamy, jak praca przechodzi od pomysłu do produkcji, usuwamy czekanie i przekazywanie zadań, i dodajemy testy, dzięki którym wdrażasz bez obaw.",
      },
      { title: "Liczby, którym nikt nie ufa", body: "Sprawdzamy, skąd biorą się dane, uzupełniamy luki i dajemy zespołowi raporty, na podstawie których można działać." },
      {
        title: "Wszędzie obejścia",
        body: "Arkusze, kopiowanie i ręczne kroki zwykle oznaczają brakujące narzędzie. Budujemy aplikację lub integrację, która je eliminuje.",
      },
      { title: "Pomysł, który potrzebuje drogi", body: "Kształtujemy go, testujemy z prawdziwymi użytkownikami i danymi, i porządnie budujemy pierwszą wersję." },
    ],
  },
  services: {
    eyebrow: "Usługi",
    title: "Jak możemy pomóc",
    intro: "Zacznij od świeżego spojrzenia albo zaproś nas na całą drogę od pomysłu do platformy.",
    linkLabel: "Dowiedz się więcej",
    signsTitle: "Kiedy tego potrzebujesz",
    whatWeDoTitle: "Co robimy",
    outcomesTitle: "Co dostajesz",
    faqTitle: "Pytania",
    items: {
      "fresh-look": {
        title: "Świeże spojrzenie",
        summary: "Przegląd za stałą cenę: jak w Twoim startupie płynie praca, dane i klienci, plus krótka lista usprawnień, które warto wprowadzić.",
        intro:
          "Czasem jest się zbyt blisko, żeby zobaczyć, co spowalnia firmę. W tydzień lub dwa przyglądamy się produktowi, technologii i procesom świeżym okiem i jasno mówimy, co zmienić najpierw.",
        signs: [
          "Wdrożenia ciągle się opóźniają i nikt nie wie do końca dlaczego",
          "Te same błędy i awarie wciąż wracają",
          "Przed rundą inwestycyjną, rekrutacją albo przebudową przyda się druga opinia",
        ],
        whatWeDo: [
          "Rozmawiamy z zespołem i patrzymy na prawdziwą pracę, nie tylko na dokumenty",
          "Mapujemy, jak pomysły, kod, dane i klienci przepływają przez firmę",
          "Przeglądamy architekturę, kod i narzędzia tam, gdzie to ma znaczenie",
          "Znajdujemy przyczyny stojące za objawami",
        ],
        outcomes: ["Krótka lista usprawnień według priorytetów", "Nakład pracy i efekt dla każdego z nich", "Jasny pierwszy krok, niezależnie od tego, kto wykona pracę"],
        faq: [
          { question: "Czy potem musimy zlecić Wam realizację?", answer: "Nie. Przegląd jest Wasz i możecie go wykorzystać, jak chcecie." },
          {
            question: "Jakiego dostępu potrzebujecie?",
            answer: "Zwykle kilku rozmów, dostępu do odczytu kodu i narzędzi oraz wglądu w metryki. Chętnie podpiszemy NDA.",
          },
        ],
      },
      "process-workflow": {
        title: "Usprawnianie procesów i przepływu pracy",
        summary: "Mniej przekazywania zadań, mniej czekania i mniej błędów, a automatyzacja tam, gdzie się opłaca.",
        intro:
          "Dobre zespoły spowalniają złe przepływy: czekanie na przegląd, ręczne kroki, niejasna odpowiedzialność. Znajdujemy tarcia i je usuwamy, bez dokładania biurokracji.",
        signs: ["Praca częściej czeka w kolejce, niż się posuwa", "Wdrożenia są stresujące i ręczne", "Każdy prowadzi własny arkusz"],
        whatWeDo: [
          "Mapujemy prawdziwy przepływ, od pomysłu do produkcji i od zamówienia do dostawy",
          "Usuwamy czekanie, przekazywanie zadań i dublowanie pracy",
          "Automatyzujemy powtarzalne kroki i dodajemy kontrole, które wcześnie wyłapują błędy",
          "Pracujemy razem z zespołem, żeby nowy sposób działania się utrwalił",
        ],
        outcomes: ["Szybsza, spokojniejsza droga do produkcji", "Automatyzacje, które co tydzień oszczędzają godziny", "Zespół, który sam prowadzi usprawniony proces"],
        faq: [
          {
            question: "Czy chodzi tylko o programowanie?",
            answer: "Nie. Patrzymy na każdy przepływ, który spowalnia firmę: od wdrożeń po onboarding, zamówienia i raportowanie.",
          },
        ],
      },
      "custom-apps-platforms": {
        title: "Aplikacje i platformy na zamówienie",
        summary: "Od pomysłu do produktu albo narzędzie wewnętrzne, o którym zespół marzy od dawna.",
        intro:
          "Gdy gotowe narzędzia nie pasują, projektujemy i budujemy oprogramowanie wokół tego, jak naprawdę działa Twoja firma: aplikacje webowe, platformy, integracje i narzędzia wewnętrzne.",
        signs: [
          "Wszystko trzyma się na obejściach i kopiowaniu",
          "Pomysł potrzebuje pierwszej wersji, z której ludzie mogą korzystać",
          "Platforma musi rosnąć bez przepisywania od zera",
        ],
        whatWeDo: [
          "Kształtujemy produkt razem z Tobą, zanim powstanie kod",
          "Budujemy full stack: React, Node.js, NestJS, Django, Postgres i chmura",
          "Projektujemy z myślą o wzroście: backend oparty na zdarzeniach, czyste modele danych, rozsądna architektura",
          "Porządnie testujemy, żeby zmiany były bezpieczne",
        ],
        outcomes: ["Oprogramowanie, które należy do Ciebie i pasuje do Twojego przepływu pracy", "Kod, który zespół może utrzymać", "Dokumentacja i porządne przekazanie"],
        faq: [
          { question: "Czy budujecie aplikacje mobilne?", answer: "Tak, w React Native albo jako aplikacje webowe, które dobrze działają na telefonach." },
          { question: "Do kogo należy kod?", answer: "Do Ciebie, od pierwszego dnia." },
        ],
      },
      "product-sprints": {
        title: "Sprinty produktowe",
        summary: "Ukształtuj i przetestuj nowy pomysł, zanim zainwestujesz w budowę.",
        intro:
          "Najdroższe błędy zdarzają się przed pierwszą linijką kodu. Krótki sprint zamienia pomysł w jasny, przetestowany plan, a często też w prototyp, który można pokazać użytkownikom albo inwestorom.",
        signs: [
          "Jest pomysł, ale brakuje jasnej pierwszej wersji",
          "Zespół nie może się zgodzić, co budować dalej",
          "Potrzebujesz czegoś konkretnego do pokazania klientom albo inwestorom",
        ],
        whatWeDo: [
          "Doprecyzowujemy problem, użytkowników i to, jak wygląda sukces",
          "Znajdujemy najbardziej ryzykowne założenia i testujemy je z prawdziwymi użytkownikami i danymi",
          "Określamy najmniejszy produkt, który warto zbudować",
          "Budujemy prototyp, gdy to najszybszy sposób, żeby się czegoś dowiedzieć",
        ],
        outcomes: ["Przetestowany pomysł i jasny zakres", "Plan budowy z wyceną", "Często klikalny prototyp"],
        faq: [{ question: "Ile trwa sprint?", answer: "Zwykle tydzień lub dwa, za stałą cenę ustaloną z góry." }],
      },
      "fractional-tech-lead": {
        title: "Tech lead na część etatu",
        summary: "Doświadczone wsparcie w sprawach architektury, rekrutacji i dostawców, bez zatrudniania na pełen etat.",
        intro:
          "Nie każdy startup potrzebuje już CTO na pełen etat, ale każdy potrzebuje dobrych decyzji technicznych. Dołączamy na kilka dni w miesiącu, żeby prowadzić architekturę, przeglądać pracę i pomagać w rekrutacji.",
        signs: [
          "Polegacie na agencji albo freelancerach bez technicznego właściciela",
          "Zbliżają się ważne decyzje techniczne",
          "Za chwilę zatrudniacie pierwszych programistów",
        ],
        whatWeDo: [
          "Współtworzymy z Tobą techniczną mapę drogową",
          "Przeglądamy architekturę, kod i pracę dostawców",
          "Pomagamy rekrutować i wdrażać programistów",
          "Reprezentujemy stronę techniczną w rozmowach z inwestorami i partnerami",
        ],
        outcomes: ["Jasny kierunek techniczny", "Lepsi dostawcy i lepsze rekrutacje", "Zespół przygotowany na wzrost"],
        faq: [{ question: "Ile czasu poświęcacie?", answer: "Od kilku godzin w tygodniu do kilku dni w miesiącu, w miarę jak firma rośnie." }],
      },
      "payments-ai-web3": {
        title: "Płatności, AI i Web3",
        summary: "Specjalistyczna wiedza o płatnościach, subskrypcjach, funkcjach AI i blockchainie.",
        intro:
          "Niektóre problemy wymagają ludzi, którzy już to robili. Piotr budował płatności kartą za kryptowaluty i silnik subskrypcji (ONCHAIN), dopłaty Medicare (Lysn) oraz koszyki na premiery limitowanych kolekcji (Highsnobiety), a AI używamy tam, gdzie naprawdę pomaga.",
        signs: [
          "Dodajesz płatności, subskrypcje albo logikę cenową",
          "Chcesz funkcji AI, które robią coś naprawdę użytecznego",
          "Budujesz na blockchainie i chcesz, żeby to działało jak zwykły fintech",
        ],
        whatWeDo: [
          "Płatności i subskrypcje przez Stripe albo kanały kryptowalutowe",
          "Elastyczna logika cenowa, którą łatwo skontrolować",
          "Funkcje AI i automatyzacje z jasnymi zabezpieczeniami",
          "Smart kontrakty i account abstraction (ERC-4337) dla wygodnych transakcji bez opłat za gaz po stronie użytkownika",
        ],
        outcomes: ["Płatności, które działają poprawnie pod obciążeniem", "AI, które ma sens", "Web3, które działa jak zwykła aplikacja"],
        faq: [
          {
            question: "Czy pracujecie tylko przy projektach krypto?",
            answer: "Nie. Płatności i logika cenowa przydają się w każdej firmie. Web3 to jedna z kilku specjalizacji.",
          },
        ],
      },
    },
  },
  process: {
    eyebrow: "Jak pracujemy",
    title: "Słuchamy. Mapujemy. Usprawniamy. Przekazujemy.",
    intro: "Małe, widoczne kroki. Zawsze wiesz, co dalej.",
    steps: [
      { title: "Słuchamy", body: "Poznajemy, jak naprawdę działa Twój produkt, zespół i klienci, i co oznacza dla Ciebie sukces." },
      { title: "Mapujemy", body: "Mapujemy przepływy, dane i problemy, i wspólnie wybieramy kilka zmian, które mają największe znaczenie." },
      { title: "Usprawniamy", body: "Poprawiamy proces, budujemy aplikację lub platformę albo jedno i drugie, w małych, widocznych krokach." },
      { title: "Przekazujemy", body: "Efekt należy do Twojego zespołu, z dokumentacją i wsparciem, dopóki wszystko nie działa samodzielnie." },
    ],
  },
  work: {
    eyebrow: "Realizacje",
    title: "Doświadczenie stojące za Tangent",
    intro: "Doświadczenie stojące za Tangent, od fintechu po telekomunikację. Każda historia zaczyna się od problemu, nie od technologii.",
    link: "Zobacz wszystkie realizacje",
    credit: "Praca Piotra Ciesiolkiewicza we współpracy z {client}.",
    cardCredit: "Praca Piotra dla {client}",
    problemTitle: "Problem",
    changedTitle: "Co się zmieniło",
    resultTitle: "Efekt",
    stackTitle: "Technologie",
    readMore: "Przeczytaj studium przypadku",
    items: {
      onchain: {
        client: "ONCHAIN",
        sector: "Fintech · DeFi",
        period: "2024–2026",
        title: "Płatności kartą za kryptowaluty przy minimalnym kapitale",
        summary: "Infrastruktura płatnicza, dzięki której można kupić kartą dziesiątki tysięcy kryptowalut, z transakcjami bez opłat za gaz i inteligentnym zarządzaniem środkami.",
        problem:
          "Startup płatniczy DeFi chciał, żeby ludzie płacili kartą i otrzymywali kryptowaluty we własnych portfelach, bez utrzymywania przez firmę dużego kapitału i bez mylących opłat sieciowych dla użytkowników.",
        whatChanged: [
          "Backend płatności oparty na zdarzeniach, na NestJS i Google Cloud, zaprojektowany z myślą o niezawodności płatności i transakcji blockchain",
          "Pozyskiwanie płynności na żądanie i bezpieczne przekazywanie środków do portfeli użytkowników",
          "Algorytmy zarządzania środkami na wielu blockchainach przy minimalnej ekspozycji kapitału",
          "Account abstraction (ERC-4337), dzięki któremu użytkownicy płacą opłaty w walucie, którą wysyłają",
          "Silnik subskrypcji z cenami w dolarach i płatnością w kryptowalutach w chwili transakcji",
          "Narzędzia wewnętrzne do wykrywania awarii i bezpiecznego testowania nowych funkcji",
        ],
        result: "Doświadczenie jak w banku na portfelach, które w pełni należą do użytkowników, przy minimalnym kapitale.",
        stack: ["TypeScript", "NestJS", "React", "Google Cloud", "Postgres", "Solidity", "ERC-4337"],
      },
      lysn: {
        client: "Lysn",
        sector: "Ochrona zdrowia",
        period: "2021–2023",
        title: "Rezerwacje, ceny i płatności dla platformy zdrowia psychicznego",
        summary: "Mikrofrontendy, konfigurowalne ceny i dopłaty Medicare dla platformy łączącej terapeutów z klientami.",
        problem:
          "Platforma musiała się unowocześnić bez ryzykownego przepisywania, obsłużyć bardziej elastyczne ceny i działać płynnie w trakcie przenoszenia produktu z zagranicznego zespołu do Australii.",
        whatChanged: [
          "Mikrofrontendy, dzięki którym technologię można było wymieniać krok po kroku, a aplikacja dla klientów ładowała się szybciej",
          "Przebudowana logika cenowa, pozwalająca na zaawansowane, konfigurowalne ceny",
          "Dopłaty Medicare, żeby zwiększyć przychody i zmniejszyć ryzyko nieodbytych konsultacji",
          "Przeszkolony lokalny zespół, który płynnie przejął projekt od zespołu zagranicznego",
          "Szybkie rozwiązywanie krytycznych awarii, z danymi pobieranymi wprost z bazy, żeby firma mogła dalej działać",
        ],
        result: "Szybsza aplikacja dla klientów, elastyczniejsze ceny i wiedza zatrzymana w firmie.",
        stack: ["React", "Redux-Saga", "TypeScript", "Python", "Django", "AWS", "PostgreSQL"],
      },
      highsnobiety: {
        client: "Highsnobiety",
        sector: "E-commerce modowy",
        period: "2018–2020",
        title: "Koszyk, który wytrzymuje premiery limitowanych kolekcji",
        summary: "Kluczowe ścieżki zakupowe i niezawodność w dniu premiery dla globalnej marki medialnej i modowej.",
        problem:
          "Premiery limitowanych kolekcji przynoszą ogromny, skokowy ruch. Sklep musiał działać szybko, uczciwie i poprawnie, z właściwymi cenami i treściami od pierwszej sekundy.",
        whatChanged: [
          "Strony produktów i koszyk zbudowane na platformie CommerceTools",
          "Endpointy dla mocno limitowanych produktów, bezpieczne i niezawodne przy skokowym ruchu",
          "Przebudowany start aplikacji, dzięki któremu zawsze wyświetlały się poprawne ceny i treści, bez mignięć nieaktualnych produktów",
          "Pipeline'y CI, kontenery Docker i Terraform w Google Cloud",
          "Testy jednostkowe i end-to-end, dzięki którym wdrożenia przebiegały bez błędów",
        ],
        result: "Niezawodne premiery i koszyk, któremu klienci mogli ufać.",
        stack: ["React", "Redux", "Node.js", "Google Cloud", "CommerceTools", "Terraform"],
      },
      officeworks: {
        client: "Officeworks",
        sector: "Handel",
        period: "2020",
        title: "Zamówienia cykliczne i płynniejsza droga do produkcji",
        summary: "Nowa funkcja zamówień cyklicznych i zmiana sposobu pracy, która usunęła czekanie między programistami a testerami.",
        problem:
          "Programiści czekali, aż zwolnią się testerzy, co spowalniało każde wdrożenie, a firma chciała więcej powtarzalnej sprzedaży do klientów biznesowych.",
        whatChanged: [
          "Nowy sposób pracy zespołu, który skrócił czekanie programistów na testy do zera",
          "Zamówienia cykliczne, dzięki którym firmy kupują produkty automatycznie według harmonogramu",
          "Naprawione targetowanie treści w Adobe Target, żeby marketing trafiał do właściwych odbiorców",
        ],
        result: "Szybsze wdrożenia i nowy sposób na powracające zakupy klientów biznesowych.",
        stack: ["React", "Redux", "Node.js", "Mikrofrontendy", "Contentful", "Algolia", "AWS"],
      },
      udrew: {
        client: "uDrew",
        sector: "Proptech",
        period: "2020–2021",
        title: "Konfigurowalne formularze, które usprawniają pozwolenia budowlane",
        summary: "Dynamiczne ścieżki zbierania danych i archiwum dokumentów z pełną historią dla projektów budowy domów.",
        problem:
          "Zatwierdzenie projektu budowlanego zależy od zebrania właściwych informacji we właściwej kolejności, a każdy plik musi mieć historię zmian.",
        whatChanged: [
          "System dynamicznych, konfigurowalnych ścieżek zbierania danych w sercu procesu zatwierdzania",
          "Zarządzanie dokumentami na AWS S3 z pełnym zapisem każdego przesłanego pliku",
          "Lepsze typowanie w TypeScripcie we frontendzie, które przyspieszyło pracę",
        ],
        result: "Płynniejsza i bardziej niezawodna droga od projektu do zatwierdzenia.",
        stack: ["React", "TypeScript", "Node.js", "PostgreSQL", "PostGIS", "AWS"],
      },
      displaysweet: {
        client: "DisplaySweet",
        sector: "Proptech",
        period: "2017–2018",
        title: "Prototypy, które pomagały sprzedawać nowe pomysły",
        summary: "Oprogramowanie do prowadzenia sprzedaży mieszkań z rynku pierwotnego na żywo i szybkie prototypy, które dział sprzedaży mógł pokazać klientom.",
        problem: "Firma potrzebowała szybko pokazywać klientom nowe możliwości, zanim zdecyduje się na pełną realizację.",
        whatChanged: [
          "Oprogramowanie do organizowania i prowadzenia sprzedaży na żywo oraz nadzorowania agentów",
          "Szybkie prototypy z sieciami neuronowymi, widzeniem komputerowym, Dialogflow, IFC, React Native i BabylonJS do sprawdzania, co jest wykonalne",
        ],
        result: "Szybko przetestowane pomysły i dział sprzedaży z czymś konkretnym do pokazania.",
        stack: ["React", "Node.js", "C#", ".NET", "OpenCV", "PyTorch"],
      },
      nokia: {
        client: "Nokia Networks",
        sector: "Telekomunikacja",
        period: "2013–2016",
        title: "Porządek w gigabajtach logów",
        summary: "Narzędzia webowe, które łączyły i wizualizowały ogromne logi, oraz praca systemowa przy przejściu na 4.5G.",
        problem: "Zespoły długo przeszukiwały gigabajty logów z różnych systemów, żeby znaleźć przyczynę nieoczekiwanego zachowania.",
        whatChanged: [
          "Narzędzie w przeglądarce, które łączy, sortuje i przeplata wpisy z różnych typów logów",
          "Aplikacja webowa do śledzenia i wizualizacji problemów zgłaszanych w całej firmie",
          "Funkcje systemowe 4.5G w międzynarodowej grupie specyfikacyjnej i międzydziałowym zespole integracyjnym",
        ],
        result: "Zespoły mogły szybko znaleźć to, czego szukały, w gigabajtach logów.",
        stack: ["C++", "Python", "protobuf", "Jenkins", "MySQL"],
      },
    },
  },
  about: {
    eyebrow: "O nas",
    title: "Jeden sposób myślenia, wiele dziedzin",
    intro:
      "Tangent prowadzi Piotr Ciesiolkiewicz, inżynier oprogramowania i osoba, która lubi rozwiązywać problemy, z ponad dziesięcioletnim doświadczeniem w startupach i globalnych firmach, razem z siecią doświadczonych specjalistów dobieranych do każdego projektu.",
    story: [
      "Piotr zaczynał w telekomunikacji w Nokii: przekopywał się przez gigabajty logów, żeby zrozumieć nieoczekiwane zachowanie systemów, i budował narzędzia, dzięki którym inni szybciej znajdowali odpowiedzi.",
      "Od tamtej pory tworzył produkty fintech, medyczne, e-commerce i proptech w Australii i Europie, zawsze z myślą o biznesie: cenach, przychodach, sposobie pracy zespołu i tym, czego naprawdę potrzebują klienci.",
      "Poza oprogramowaniem od lat zajmuje się muzyką i ruchem. Wszędzie sprawdzają się te same nawyki: najpierw słuchać, znaleźć rytm, zachować równowagę i łączyć pomysły, które zwykle się nie spotykają.",
    ],
    educationTitle: "Wykształcenie",
    education: [
      {
        degree: "Magister, informatyka",
        school: "Politechnika Wrocławska",
        detail: "Średnia 5,0 / 5,0 · Praca: metody klasyfikacji w automatycznym rozpoznawaniu mowy",
      },
      {
        degree: "Inżynier, automatyka i robotyka",
        school: "Politechnika Wrocławska",
        detail: "Średnia 5,0 / 5,0 · Praca: zdalne sterowanie z rozpoznawaniem mowy",
      },
    ],
    awardsTitle: "Nagrody",
    awards: [
      {
        title: "RegHack Downunder 2017 · 1. miejsce",
        body: "Sharenergy: model lokalnego rynku energii, który korzystny jest dla gospodarstw z panelami słonecznymi i bez nich, razem z ramami prawnymi, które go umożliwiają. Stworzony w mniej niż 40 godzin.",
      },
      {
        title: "GovHack 2017 · nagroda Community Environment Data",
        body: "Litterly Awesome: aplikacja crowdsourcingowa, która łączy zgłoszenia śmieci z otwartymi danymi publicznymi, żeby pokazać trendy i ich przyczyny.",
      },
    ],
    peopleTitle: "Ludzie",
    peopleIntro: "Prowadzi Piotr, a do każdego projektu dołączają doświadczeni specjaliści z naszej sieci.",
  },
  people: {
    items: {
      piotr: {
        role: "Założyciel · inżynier oprogramowania",
        bio: "Inżynier full stack i analityk. Fintech i DeFi, e-commerce, ochrona zdrowia, proptech i telekomunikacja. Mówi po polsku i angielsku.",
      },
    },
  },
  cta: {
    title: "Połączmy kropki",
    body: "Umów 30-minutową rozmowę o produkcie, procesach albo pomyśle. Wyjdziesz z co najmniej jednym przydatnym kolejnym krokiem.",
  },
  contact: {
    eyebrow: "Kontakt",
    title: "Umów rozmowę",
    intro: "Trzydzieści minut o produkcie, procesie albo pomyśle, bez zobowiązań. Wybierz termin albo napisz wiadomość, a odpowiemy w ciągu jednego dnia roboczego.",
    bookTitle: "Wybierz termin",
    bookBody: "Zobacz wolne terminy i zarezerwuj w kilka kliknięć.",
    formTitle: "Albo napisz wiadomość",
    form: {
      name: "Imię i nazwisko",
      email: "E-mail",
      company: "Firma (opcjonalnie)",
      message: "O czym chcesz porozmawiać?",
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
    tagline: "Procesy, produkt i oprogramowanie dla startupów.",
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
          "Administratorem danych jest Tangent, jednoosobowa działalność prowadzona przez Piotra Ciesiolkiewicza. Dane kontaktowe znajdziesz na stronie kontaktu.",
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
      { heading: "Oferta", paragraphs: ["Każda współpraca zaczyna się od pisemnej propozycji. Pracę rozpoczynamy po jej akceptacji."] },
      { heading: "Płatność", paragraphs: ["Faktury są płatne w ciągu 14 dni, chyba że ustalimy inaczej."] },
      { heading: "Prawa do pracy", paragraphs: ["Po opłaceniu faktury prawa do stworzonej dla Ciebie pracy przechodzą na Ciebie."] },
      { heading: "Poufność", paragraphs: ["Traktujemy Twoje informacje jako poufne i chętnie podpiszemy NDA."] },
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
