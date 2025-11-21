<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SafeTravel – Trova la meta perfetta (gratis)</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>

  <!-- NAVBAR -->
  <header class="nav">
    <div class="nav-left">
      <img src="assets/logo.png" alt="SafeTravel logo" class="logo">
      <span class="brand">SafeTravel</span>
    </div>

    <nav class="nav-menu">
      <a href="index.html">🏠 Home</a>
      <a href="#how-it-works">⚙️ Come funziona</a>
      <a href="#resultsSection">🌍 Destinazioni suggerite</a>
      <a href="#why-free">💙 Perché è gratis</a>
      <a href="#about">👤 Chi sono</a>
    </nav>

    <div class="nav-toggle" id="navToggle">☰</div>
  </header>

  <!-- HERO -->
  <section class="hero">

    <div class="hero-logo-box">
      <img src="assets/logo.png" class="hero-logo" alt="Logo SafeTravel">
      <h1 class="hero-brand-title">SafeTravel</h1>
      <p class="hero-brand-subtitle">
        L’assistente che ti suggerisce <b>mete basate sui dati reali</b>, non sulle offerte.
      </p>
    </div>

    <h1 class="hero-title">
      Hai voglia di viaggiare ma<br>
      <span class="accent">non sai dove andare?</span>
    </h1>

    <p class="hero-subtitle hero-intro-spacing">
      SafeTravel analizza <b>voli, prezzi e meteo reali</b> e ti propone le destinazioni più adatte a te.<br>
      <b>Non vendiamo pacchetti. Non prendiamo commissioni. È sempre gratis.</b>
    </p>
  </section>

  <!-- LAYOUT DUE COLONNE -->
  <div class="two-columns">

    <!-- COLONNA SINISTRA – FILTRI -->
    <section class="filters column-left">
      <h2 class="filters-main-title">La tua ricerca intelligente</h2>

      <form id="tripForm" class="filters-card">

        <p class="filters-title">
          Compila i filtri obbligatori → SafeTravel ti suggerisce dove andare usando dati reali.
        </p>

        <!-- AEROPORTO + AREA -->
        <div class="filters-row">
          <div class="field">
            <label>Aeroporto di partenza *</label>
            <select id="airport" required>
              <option value="">Seleziona...</option>
              <option value="MIL">Milano (LIN/MXP/BGY)</option>
              <option value="ROM">Roma (FCO/CIA)</option>
              <option value="NAP">Napoli</option>
              <option value="VCE">Venezia</option>
              <option value="BLQ">Bologna</option>
              <option value="TRN">Torino</option>
              <option value="PSA">Pisa</option>
              <option value="donotknow">Non lo so → suggeriscimi</option>
            </select>
          </div>

          <div class="field">
            <label>Area *</label>
            <select id="area" required>
              <option value="">Seleziona...</option>
              <option value="europe">Solo Europa</option>
              <option value="world">Mondo intero</option>
              <option value="any">Non ho preferenze</option>
            </select>
          </div>
        </div>

        <!-- BUDGET + DURATA -->
        <div class="filters-row">
          <div class="field">
            <label>Budget a persona *</label>
            <select id="budget" required>
              <option value="">Seleziona...</option>
              <option value="low">Basso (&lt; 300€)</option>
              <option value="mid">Medio (300–700€)</option>
              <option value="high">Alto (&gt; 700€)</option>
            </select>
          </div>

          <div class="field">
            <label>Durata del viaggio *</label>
            <select id="duration" required>
              <option value="">Seleziona...</option>
              <option value="weekend">Weekend (1–3 giorni)</option>
              <option value="week">Settimana (4–9 giorni)</option>
              <option value="twoweeks">2 settimane</option>
              <option value="month">1 mese</option>
            </select>
          </div>
        </div>

        <!-- DATE -->
        <div class="filters-row">
          <div class="field">
            <label>Data di partenza *</label>
            <input type="date" id="startDate">
          </div>
          <div class="field">
            <label>Data di ritorno *</label>
            <input type="date" id="endDate">
          </div>
        </div>

        <!-- TIPO DESTINAZIONE + VIBE -->
        <div class="filters-row">
          <div class="field">
            <label>Tipo destinazione (opzionale)</label>
            <select id="type">
              <option value="all">Qualsiasi</option>
              <option value="sea">Mare</option>
              <option value="mountain">Montagna</option>
              <option value="city">Città</option>
            </select>
          </div>

          <div class="field">
            <label>Stile di viaggio (opzionale)</label>
            <select id="vibe">
              <option value="all">Qualsiasi</option>
              <option value="relax">Relax</option>
              <option value="adventure">Avventura</option>
              <option value="culture">Cultura</option>
              <option value="family">Family</option>
              <option value="romantic">Romantico</option>
            </select>
          </div>
        </div>

        <!-- BAMBINI + PERIODO -->
        <div class="filters-row">
          <div class="field">
            <label>Bambini (opzionale)</label>
            <select id="children">
              <option value="0">Nessuno</option>
              <option value="1">1 bambino</option>
              <option value="2">2 bambini</option>
              <option value="3">3 bambini</option>
              <option value="4">4 bambini</option>
            </select>
          </div>

          <div class="field">
            <label>Periodo indicativo (opzionale)</label>
            <select id="period">
              <option value="any">Qualsiasi</option>
              <option value="spring">Primavera</option>
              <option value="summer">Estate</option>
              <option value="autumn">Autunno</option>
              <option value="winter">Inverno</option>
              <option value="weekendlungo">Weekend lungo / ponte</option>
            </select>
          </div>
        </div>

        <!-- BOTTONE -->
        <div class="filters-row">
          <div class="field field-button">
            <button class="btn-primary" type="submit">
              Mostrami dove andare →
            </button>
          </div>
        </div>

        <p class="free-note">
          I campi con * sono obbligatori.<br>
          SafeTravel utilizza <b>API di voli e meteo reali</b> per suggerirti le mete più adatte.
          Il servizio per te è e resterà <b>gratuito</b>.
        </p>

      </form>
    </section>

    <!-- COLONNA DESTRA – CONCEPT -->
    <section class="concept column-right" id="how-it-works">
      <h2 class="concept-title">Perché SafeTravel è diverso da tutto ciò che conosci?</h2>

      <div class="concept-grid">

        <div class="concept-box">
          <div class="icon">✨</div>
          <h3>Nessuna prenotazione</h3>
          <p>SafeTravel <b>non vende pacchetti</b>. I suggerimenti sono imparziali.</p>
        </div>

        <div class="concept-box">
          <div class="icon">📊</div>
          <h3>Dati veri, non offerte</h3>
          <p>Prezzi dei voli, meteo reale e distanza vengono analizzati per te.</p>
        </div>

        <div class="concept-box">
          <div class="icon">💙</div>
          <h3>Sempre gratis</h3>
          <p>Il progetto crescerà grazie al traffico, non ai tuoi pagamenti.</p>
        </div>

        <div class="concept-box">
          <div class="icon">🧭</div>
          <h3>Perfetto per indecisi</h3>
          <p>Tu inserisci pochi filtri, SafeTravel ti mostra <b>mete concrete</b> con link per prenotare.</p>
        </div>

      </div>
    </section>

  </div> <!-- fine due colonne -->

  <!-- RISULTATI -->
  <section class="results" id="resultsSection">
    <h2 class="section-title">Le migliori destinazioni per te</h2>
    <p class="results-subtitle">
      Qui compariranno mete reali, con prezzi A/R per le tue date e meteo aggiornato.
    </p>
    <div class="cards" id="cardsContainer"></div>
  </section>

  <!-- SEZIONE PERCHÉ È GRATIS -->
  <section class="results" id="why-free">
    <h2 class="section-title">Perché SafeTravel è gratuito?</h2>
    <p class="results-subtitle">
      SafeTravel non guadagna dalle tue prenotazioni. L’obiettivo è crescere con <b>accessi e visibilità</b>,
      per poi monetizzare con partnership e ADV, mantenendo i consigli indipendenti.
    </p>
  </section>

  <!-- SEZIONE CHI SONO -->
  <section class="results" id="about">
    <h2 class="section-title">Chi c’è dietro SafeTravel</h2>
    <p class="results-subtitle">
      SafeTravel nasce da una data analyst appassionata di viaggi che vuole rendere
      <b>più semplice, razionale e sereno</b> il momento della scelta della meta, soprattutto per chi è insicuro
      o non si fida dei classici siti di prenotazione.
    </p>
  </section>

  <!-- FOOTER -->
  <footer class="footer-premium">
    <div class="footer-grid">

      <div class="footer-col">
        <img src="assets/logo.png" class="footer-logo" alt="Logo SafeTravel">
        <p class="footer-text">
          SafeTravel è il primo assistente che suggerisce <b>mete basate sui dati reali</b> (voli, prezzi, meteo),
          senza venderti nulla. Il servizio per te è gratuito.
        </p>
      </div>

      <div class="footer-col">
        <h3>🌐 Navigazione</h3>
        <a href="#top">Home</a>
        <a href="#how-it-works">Come funziona</a>
        <a href="#resultsSection">Destinazioni suggerite</a>
        <a href="#why-free">Perché è gratis</a>
        <a href="#about">Chi sono</a>
      </div>

      <div class="footer-col">
        <h3>📩 Contatti</h3>
        <p>Email: info@safetravel.com</p>
        <p>Instagram: @safetravel</p>
        <p>© SafeTravel – Tutti i diritti riservati</p>
      </div>

    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
