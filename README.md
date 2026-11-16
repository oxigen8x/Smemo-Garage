# Smemo-Garage

PWA per registrare manutenzioni e scadenze di auto e moto. Nessun server: i dati restano nel telefono.

## Pubblicazione su GitHub Pages
1. Crea un repository (o usane uno esistente) e carica **il contenuto** di questa cartella nella radice:
   `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.json`, cartella `icons/`.
2. Repository > Settings > Pages > Source: "Deploy from a branch", branch `main`, cartella `/ (root)`.
3. Apri l'indirizzo `https://TUO-UTENTE.github.io/NOME-REPO/` con Chrome su Android.
4. Menu di Chrome (tre puntini) > "Installa app" (o "Aggiungi a schermata Home").

## Aggiornare l'app
Dopo aver caricato nuovi file, cambia il numero in `sw.js` (`const CACHE = 'smemo-v3'` diventa `smemo-v4`, ecc.), altrimenti il telefono può continuare a mostrare la versione vecchia. La nuova versione appare alla seconda apertura.

## Backup
Impostazioni > Backup > Esporta. Salva il file JSON su Drive: se cancelli i dati di Chrome o cambi telefono lo reimporti da lì.

## Novità v1.3
- Nuova **Home** con logo, titolo e un riquadro grande per ogni veicolo (tocca per aprirne le scadenze).
- Tre layout selezionabili in Impostazioni → Aspetto della Home: **A Colonna** (predefinito), **B Mosaico**, **C Una per schermata**.
- La vecchia schermata dei veicoli ora si chiama **Scadenze** nella barra in basso.
