---
status: active
priority: 8
---

# TODO

Nog niet getest op een echte WordPress-site (alleen `php -l` gedaan). Verificatiestappen staan in PLAN.md, niet hier.

## Open voor jou

- [ ] Grilling-sessie: openstaande beslissingen szm-woo-suite. Context: XXL-kolom wel/niet uit `SZM_MAAT_VOLGORDE`, welke orderstatussen erbij komen naast "ingepakt & klaar voor verzending" en "aangemeld bij pakketdienst", of de declutter-module in `~/Apps/szm-admin-suite` WooCommerce-adminpagina's moet overslaan, en of jouw twee SPEC-quotes over één gesynchroniseerde checkbox (NL/EN dezelfde voorraad) in SPEC.md komen.
- [ ] Op live MMT controleren of de NB-checkbox na de update (1.0.15) blijft staan, en bij een alert de exacte tekst (`id=…, raw=…, beheer=…`) doorsturen. Lokaal niet te reproduceren.
- [ ] Op live MMT controleren of de bestelschermen leeg zijn. Zo ja: zet "Hide non-essential plugin notices" in szm-admin-suite daar uit.
- [ ] Release 1.0.17 (click-to-copy, street line, tolerant huisnummer) testen op lokale MMT met order 13911, dan release laten maken, dan zelf op live updaten via wp-admin > Plugins. Daarna opruimen: mu-plugin `zz-test-huisnummer.php` en testorder 13911 op lokale MMT.
