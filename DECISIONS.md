# DECISIONS

- 2026-09-15: Packaged the raw functions.php snippet as its own plugin
  (`szm-voorraadoverzicht.php`) instead of leaving it as a code-snippet
  plugin entry, matching the existing `szm-admin-menu-manager` /
  `szm-hover-animations` / `szm-absolute-positioning` pattern: bundled
  [Plugin Update Checker](https://github.com/YahnisElsts/plugin-update-checker)
  pointed at `github.com/Yelbow/szm-voorraadoverzicht` (branch `main`),
  and TGM Plugin Activation to nudge/require WooCommerce. Public repo, no
  auth token needed — see README.md for the reasoning (already validated
  on the sibling plugins).
- 2026-09-15: Added a `Requires Plugins: woocommerce` header (WP 6.5+
  hard activation block) on top of the TGM nudge, since every function in
  this plugin (`wc_get_orders`, `wc_get_product`, ...) hard-depends on
  WooCommerce being active — TGM alone only recommends/nudges, it doesn't
  block activation on older WP versions.
- 2026-09-15: Snippet logic (queries, cell-merging, AJAX handlers, CSS/JS)
  copied verbatim, no refactor — only the plugin scaffolding (header,
  `ABSPATH` guard, version constant, updater init, TGM registration) was
  added around it. Docblock comment at the top is the original spec
  comment, kept intact rather than rewritten into a doc-comment style
  guide, since it's this plugin's only design documentation.
- 2026-09-25: Activatie op live (modernmenthongs.nl) gaf een fatale fout:
  `Cannot redeclare szm_render_voorraadoverzicht()`. De oorspronkelijke
  snippet stond nog actief in Code Snippets. Eerst de snippet uitzetten,
  dan pas de plugin activeren. Er komen bewust geen `function_exists`-guards
  bij: dan draaien snippet en plugin stil naast elkaar.
- 2026-09-30: Updates op live kwamen niet aan ("up to date"): PUC pakt GitHub's
  *latest release* vóór tags, en alleen v1.0.1 had een Release. Elke versie
  krijgt nu ook `gh release create vX.Y.Z --latest`. Volgorde: bump `Version:` +
  `SZM_VOORRAAD_VERSION`, commit, tag, push main+tag, gh release.
- 2026-09-30: NB-checkbox werd op live niet onthouden: variaties met
  voorraadbeheer op parent-niveau erven `backorders` van de parent, dus
  `set_backorders()` op de variatie werd genegeerd. Handler schakelt zo'n variatie
  nu over op eigen voorraadbeheer (met parent-voorraad als startwaarde, dus
  voorraad kan per variatie verdubbeld lijken) en verifieert na opslaan. In 1.0.3.
- 2026-09-30: 1.0.11 = exact 1.0.4-kolommen/-weergave, plus: (a) samengevoegde cellen
  (one size + M) tonen in bewerkmodus per variatie een eigen regel met voorraad + NB
  (verborgen buiten bewerkmodus, dus geen extra rij/streepje); (b) voorraad-handler
  schakelt parent-beheerde variatie ook over op eigen beheer en verifieert na opslaan.
  NB-terugspringen op live lokaal NIET gereproduceerd (mmt, Polylang aan, ook met
  parent-voorraad: werkt). Oorzaak live onbekend, wacht op diag-melding uit live.

## 2026-09-30 — 1.0.11 t/m 1.0.14
- Extra kolommen (`L-en`, `One-size-en`) kwamen van Engelse producten, niet van de samenvoeg-code. Fix: alleen producten in de Polylang-standaardtaal tonen (`szm_alleen_standaardtaal`).
- Samengevoegde cel (one size + M) = 1 waarde + 1 NB-vinkje, wijzigt alle variaties erin (`variation_ids`). Geen sub-regels: gebruiker wil geen extra rijen/streepjes, kolommen exact als 1.0.4.
- Parent-beheerde voorraad: opslaan op variatie wordt genegeerd; handlers schakelen over op eigen beheer en controleren na opslaan (409 met diagnose).
- 1.0.14: verkocht telde EN-bestellingen niet mee (variatie-id -> NL-id via Polylang), `wc_get_orders` gaf ook OrderRefund-objecten terug (`type => shop_order` nodig), terugbetalingen worden afgetrokken, voorraad-edit zet vertalingen expliciet gelijk.
- Live NB-terugspringen niet lokaal te reproduceren; nodig: exacte alert-tekst van live na update.

## 2026-10-02 — Hernoemd naar SZM Woo Suite (szm-woo-suite), compat loader
- Lokaal hernoemd: map `~/Apps/szm-woo-suite`, hoofdbestand `szm-woo-suite.php`, Plugin Name "SZM Woo Suite", Text Domain `szm-woo-suite`. GitHub-repo heet nog `szm-voorraadoverzicht` (nog niet hernoemd/gepusht).
- **Compat loader `szm-voorraadoverzicht.php` blijft in de root.** Live (modernmenthongs.nl) heeft `szm-voorraadoverzicht/szm-voorraadoverzicht.php` in `active_plugins`. PUC (`fixDirectoryName`) hernoemt de GitHub-zip bij een update naar de *bestaande* mapnaam, dus live blijft `szm-voorraadoverzicht/`. Zonder dat bestand zou WP de plugin na de update stil deactiveren. Het stub-bestand `require_once`t alleen `szm-woo-suite.php`.
- **Code staat in `inc/voorraadoverzicht.php`, niet in het hoofdbestand.** Getest (PHP 8.3): een `if (defined(...)) return;`-guard voorkomt géén "Cannot redeclare" voor functies in hetzelfde bestand, want PHP bindt top-level functies al bij het compileren. Daarom: hoofdbestand = alleen closures + guard (`SZM_WOO_SUITE_LOADED`), module pas na de guard ge-`require`d. Twee kopieën van de nieuwe code = tweede wordt overgeslagen + admin-notice. Oude (pre-rename) kopie naast nieuwe = fatal bij activeren, die WP's activatie-sandbox tegenhoudt (getest op fse-test: activatie mislukt, `active_plugins` ongewijzigd). Bewust geen `function_exists`-guard, zie 2026-09-25.
- **`Version:` moet in beide headers gelijk zijn.** PUC leest de geïnstalleerde én de nieuwe versie uit de header van het bestand dat op de site actief is (`basename($pluginFile)`, remote via de GitHub-API). Op live is dat de stub. Release: `Version:` in beide bestanden + `SZM_WOO_SUITE_VERSION` bumpen, dan tag + `gh release create`.
- PUC krijgt het actieve bestand (`SZM_WOO_SUITE_PLUGIN_FILE`, door de stub gezet), zodat de update-melding en de mapnaam-fix bij de actieve rij horen.
- PUC-slug blijft `szm-voorraadoverzicht` (`SZM_WOO_SUITE_UPDATE_SLUG`): alleen een interne sleutel (state-optie `external_updates-<slug>`, hooknamen), los van repo en mapnaam. Hoeft niet mee bij de repo-hernoeming.
- Repo-URL staat in één constante `SZM_WOO_SUITE_REPO_URL`; na `gh repo rename szm-woo-suite` is dat de enige regel die wijzigt.
- TGM-id/-menu hernoemd naar `szm-woo-suite`(`-install-plugins`): reset alleen een eventueel weggeklikte "installeer WooCommerce"-melding. Menu-slug `voorraadoverzicht`, AJAX-acties, nonces, CSV-naam ongewijzigd; plugin heeft geen eigen opties/transients. `SZM_VOORRAAD_VERSION` blijft als alias bestaan.
- Plugins-lijst: de inactieve zuster van het actieve bestand wordt verborgen (`all_plugins`), zodat er per map één rij staat.

## 2026-10-02 - Klik-om-te-kopieren op het orderscherm (1.0.16)
- **Schermen:** laadt alleen op het order-bewerkscherm: HPOS (`admin.php?page=wc-orders&action=edit|new`, screen-id `woocommerce_page_wc-orders`, dat dezelfde id heeft als de orderlijst, dus `action` wordt ook gecontroleerd) en klassiek (`post.php`, screen-id `shop_order`). Beide getest (MMT lokaal = HPOS, fse-test tijdelijk op klassiek gezet). Alleen voor gebruikers met `manage_woocommerce` of `edit_shop_orders`.
- **Alleen client-side:** PHP zet alleen het script in de wachtrij; geen klantgegevens in PHP-output, logs of netwerkverkeer. Module gebruikt een closure (geen benoemde functie), zelfde reden als het hoofdbestand (zie 2026-10-02 hernoemd).
- **Geen layoutverandering:** naam, huisnummer en e-mail staan in een kale inline `<span>` (geen CSS). Postcode wordt bewust NIET gewrapt: de regel "1234 AB Plaats" in twee inline-boxen splitsen verschoof de plaatsnaam sub-pixel (anti-aliasing, max 39/255 op ~90 pixels, zichtbaar in de pixel-diff). Daarom wordt de postcode via een tekstbereik (Range) en de klikpositie gevonden. Gevolg: postcode heeft geen `title`-tooltip, de andere drie wel.
- **Feedback:** kleine vaste toast rechtsonder ("Gekopieerd: ...", vervaagt na 1,2 s) plus `title` op de wrap-spans. Geen cursor-, hover- of icoonverandering, omdat Jelle "zonder visueel te veranderen" vroeg.
- **Bewerkmodus-guard:** klik doet niets als het `div.edit_address` van die kolom zichtbaar is (let op: de "Bewerken"-link in de kop heeft ook de klasse `edit_address`, dus selector `div.edit_address`). Het Huisnummer-veld staat buiten `.address` en blijft in bewerkmodus zichtbaar, daarom is de guard op kolomniveau.
- **Sleep-guard:** niet kopieren als de muis >4 px bewoog of de selectie tussen mousedown en click veranderde (slepen, dubbelklik). Een selectie die er al voor mousedown was (bv. onze eigen markering) telt niet als slepen: Chrome wist een bestaande selectie niet bij klik op een link, een eerdere versie van de guard blokkeerde daardoor de e-mailklik.
- **Parsing:** naam = regel die gelijk is aan voornaam+achternaam uit de (verborgen) bewerkvelden, anders eerste regel (tweede als de eerste het bedrijf is). Postcode = NL-patroon `1234 AB` of `1234AB` aan het begin van een regel, of de postcode uit het bewerkveld (andere landen). Huisnummer = tekst na `<strong>Huisnummer:</strong>` buiten `.address`. E-mail = tekst in `a[href^=mailto:]` binnen `.address`, `preventDefault` op de klik. Telefoon is niet gevraagd en niet meegenomen.
- **Niet geverifieerd:** de echte "Huisnummer:"-opmaak op live (lokaal is dat veld niet aanwezig, getest met een tijdelijke testhook die `<p><strong>Huisnummer:</strong> 12</p>` na het factuuradres zet, de vorm uit Jelle's beschrijving). Op de lokale MMT toont wc-admin's embedded layout een JS-fout (`insertBefore`, ook zonder deze module) die de hele orderpagina verbergt in headless Chromium; voor de tests is wc-admin's JS/CSS geblokkeerd. Niet vastgesteld of dat ook in Jelle's browser gebeurt.

## 2026-10-02 - Klik-om-te-kopieren 1.0.17: straatregel + tolerante Huisnummer-zoeker
- **Aanleiding:** op de lokale MMT was het huisnummer in de VERZENDING-kolom niet klikbaar. De echte opmaak is onbekend (alleen een schermafdruk: vet label "Huisnummer:", waarde eronder, daarna "E-mailadres:"/"Telefoon:"). Gekozen: beide fixes.
- **Straatregel (5e doel):** de tekstregel direct voor de postcoderegel in het adres-`<p>` (dus na naam/bedrijf), in factuur en verzending. Hele regel in een kale inline `<span>` (hele regel, dus geen sub-pixelverschuiving zoals bij de postcode). Kopieert exact de getoonde tekst, ook "straat 35 35". Postcode/plaats-regels blijven apart.
- **Huisnummer-zoeker:** zoekt per kolom tekstknopen (buiten `div.edit_address`, invoervelden en al gewrapte spans) die `Huisnummer` + optionele dubbele punt zijn (hoofdletterongevoelig). Waarde = eerste niet-lege tekst na het label: eerst volgende siblings, dan per niveau omhoog (max 4, niet boven de kolom). Stopt bij een volgend label (`strong/b/label/h*`, tekst eindigend op `:`), een mailto-link of een formulierveld. Gewrapt wordt alleen de waardetekst (getrimd, `&nbsp;` telt als witruimte), dus lege waarde of dubbel getal ("35 35") gaat goed. Ook "Huisnummer: 35" in een enkele tekstknoop of binnen een `<strong>`.
- **Afgehandelde vormen (getest):** `<p><strong>L:</strong> 35</p>`, met `<br>`, met `<br><span>`, label-`<p>` + waarde-`<p>`, `<div><label>` + `<div><span>`, `<div><div><strong>` + `<div>` (oom), `&nbsp;` + witruimte, waarde in `<a>`, `<b>HUISNUMMER</b>` zonder dubbele punt, platte tekst "Huisnummer: 35", `<dl><dt><dd>`, lege waarde gevolgd door ander label (niets gewrapt), label in bewerkformulier (overgeslagen).
- **Niet afgehandeld:** waarde verspreid over meerdere tekstknopen of elementen (alleen de eerste wordt gewrapt); waarde in een element zonder tekst (bv. alleen `value=` in een input of via CSS `content`); label in een ander dan het Nederlandse woord "Huisnummer".
- **Test:** orderscherm nu zonder wc-admin te blokkeren (declutter-notice-onderdrukking staat lokaal uit, scherm rendert gewoon). Testplugin `zz-test-huisnummer.php` zet in factuur `<div><div><strong>`+`&nbsp;`+`<span>` en in verzending `<p><strong>L:</strong><br><span>35 35</span></p>`. Let op in eigen tests: `document.readyState` kan na `networkidle` nog `loading` zijn, wacht erop voor je het script injecteert.
