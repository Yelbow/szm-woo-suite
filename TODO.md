---
status: active
priority: 8
---

# TODO

Nog niet getest op een echte WordPress-site (alleen `php -l` gedaan) —
verificatiestappen staan in PLAN.md, niet hier: dat zijn dingen die getest
worden, geen beslissingen die jij hoeft te nemen. Niets openstaand dat op
jou wacht.

## Wacht op jou (2026-10-01)
- XXL-kolom weghalen uit `SZM_MAAT_VOLGORDE`? Nu staat XXL erbij omdat NL-productdata XXL heeft.
- Na update op live: exacte NB-alert-tekst doorsturen (`id=…, raw=…, beheer=…`) — live NB-terugspringen is lokaal niet te reproduceren.
- SPEC.md: voorstel om je woorden toe te voegen: "i want one checkboxs that changes both instead of multiple checkboxes… they have to be synced anyway" en "in de orginele versie werden die samengevoegd en in een keer bewerkt de nederlandse en engelse versie want die hebben namelijk de zelfde voorraa". Zeg ja en ik zet ze erin.

## Wacht op jou (2026-10-02, rename naar szm-woo-suite)
- Live is geüpdatet naar 1.0.15 (2026-10-02, door Jelle gemeld). GitHub-repo hernoemd naar `Yelbow/szm-woo-suite` (oude URL redirect), `origin` en admin-suite-verwijzing bijgewerkt. De constante `SZM_WOO_SUITE_REPO_URL` staat lokaal ongecommit op de nieuwe URL en gaat mee met de volgende release. Open: nog niets voor jou, behalve een live-check of de NB-checkbox nu blijft staan (zie hierboven, 1.0.14-punt).
- Orderscherm-features (PLAN.md "Woo-suite uitbreiding"): welke statussen wil je precies? Staan "ingepakt & klaar voor verzending" en "aangemeld bij pakketdienst" vast, of komen er meer?
- szm-admin-suite breekt het WooCommerce-orderscherm (leeg scherm) zodra "Hide non-essential plugin notices" aan staat (declutter-module; bewezen op lokale MMT, uit en het scherm werkt). Lokaal staat die optie nu uit (`szm_as_settings`). Check of de bestelschermen op live MMT leeg zijn; zo ja, zet die optie daar uit tot de module gefixt is. Zeg of ik de module in `~/Apps/szm-admin-suite` mag fixen (WooCommerce-adminpagina's overslaan).
- Release 1.0.17 (click-to-copy, street line, tolerant huisnummer) staat lokaal gecommit, niet gepusht. Probeer eerst op lokale MMT (order 13911), zeg dan "release". Daarna zelf op live updaten via wp-admin > Plugins. Opruimen na je test: mu-plugin `zz-test-huisnummer.php` en testorder 13911 op lokale MMT.
