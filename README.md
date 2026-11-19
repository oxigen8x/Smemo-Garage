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

## Novità v1.4
- Nuova **Home** con logo, titolo e un riquadro grande per ogni veicolo (tocca per aprirne le scadenze).
- Tre layout selezionabili in Impostazioni → Aspetto della Home: **A Colonna** (predefinito), **B Mosaico**, **C Una per schermata**.
- La vecchia schermata dei veicoli ora si chiama **Scadenze** nella barra in basso.

## Novità v1.4
- **Voci da mostrare**: in Modifica veicolo puoi attivare o disattivare ogni voce, per singolo veicolo. Le voci disattivate spariscono da Scadenze, avvisi, notifiche, calendario e registrazione; gli interventi già registrati restano nello Storico.
- **Moto**: il filtro abitacolo non è più previsto.

## Novità v1.5
- Nuovo veicolo / modifica: tre tendine a cascata **Marca → Modello → Versione**, con il logo accanto al nome della marca (iniziale su cerchio se il logo manca). Anno, targa, km e nome (precompilato). Opzione "Inserisci a mano" per i veicoli non in catalogo.
- Il logo della marca compare nell'angolo della scheda veicolo (anche con la foto) e nelle schede della Home.
- Nessuna immagine disegnata: senza foto resta lo sfondo a gradiente.
- `logos.js` (loghi inclusi, offline) e `catalog.js` (catalogo di ESEMPIO da completare).

## Novità v1.6
- Tutti i 184 loghi del repository vehiclespecs/brand-logos (sostituiscono i precedenti); la tendina Marca mostra tutte le marche auto. Le marche senza modelli in catalogo passano all'inserimento a mano con la marca già scelta.
- Icona dell'app identica al logo dentro l'app.
- Aggiornamenti più affidabili: l'app cerca prima la versione nuova in rete (cache solo offline) e si ricarica da sola quando si aggiorna.

## Novità v1.7
- Loghi moto: Ducati, KTM, Yamaha, Vespa, Husqvarna, Piaggio, Norton, Bajaj, Hero a colori; Aprilia, Harley-Davidson, Kawasaki, Triumph monocromatici (Honda, BMW e Suzuki dal set auto). La tendina Marca delle moto elenca queste marche.
- Rimossa l'icona auto/moto nell'angolo delle schede veicolo in Home (resta il logo della marca, se scelta).

## Novità v1.8
- Catalogo auto completo da gor3a/vehicle-makes-models (ODbL 1.0): 216 marche, 3.640 modelli, versioni per motore. Moto: catalogo di esempio.
- Marche con logo ma senza modelli: restano le tendine, Modello e Versione diventano campi di testo.
- Via le icone auto/moto disegnate: al loro posto il logo della marca (badge, scheda veicolo, Home). Senza marca, solo il nome.
- Loghi incorporati come data URI (compatibili anche con visualizzatori con CSP restrittiva).
- Ricerca nelle tendine: prima i risultati che iniziano con il testo digitato.
