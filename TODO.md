---
status: active
priority: 8
---

# TODO

Nog niet getest op een echte WordPress-site (alleen `php -l` gedaan). Verificatiestappen staan in PLAN.md, niet hier.

## Open voor jou

- [ ] Grilling-sessie: declutter-module in `~/Apps/szm-admin-suite` overslaan op WooCommerce-bestelpagina's, ja of nee. Wacht op de live-check van de bestelschermen (regel hieronder). XXL en orderstatussen zijn beslist (DECISIONS.md 2026-10-10).
- [ ] Op live MMT controleren of de NB-checkbox na de update (1.0.15) blijft staan, en bij een alert de exacte tekst (`id=…, raw=…, beheer=…`) doorsturen. Lokaal niet te reproduceren.
- [ ] Op live MMT controleren of de bestelschermen leeg zijn. Zo ja: zet "Hide non-essential plugin notices" in szm-admin-suite daar uit.
- [ ] Release 1.0.17 (click-to-copy, street line, tolerant huisnummer) testen op lokale MMT met order 13911, dan release laten maken, dan zelf op live updaten via wp-admin > Plugins. Daarna opruimen: mu-plugin `zz-test-huisnummer.php` en testorder 13911 op lokale MMT.
