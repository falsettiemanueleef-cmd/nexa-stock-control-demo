# NEXA STOCK CONTROL — pacchetto installabile

App gestionale per La Bottega dello Svapo. È una **Progressive Web App (PWA)**: si installa da Chrome su Android o da Edge/Chrome su Windows e si apre in una finestra dedicata, senza barra del browser.

## Installazione
1. Aprire https://falsettiemanueleef-cmd.github.io/nexa-stock-control-demo/ con connessione Internet.
2. Attendere il caricamento completo e aprire il menu del browser.
3. Su Android Chrome: scegliere **Installa app** (oppure **Aggiungi a schermata Home**, se il browser mostra questa voce).
4. Su Windows Edge/Chrome: usare **Installa app** dal menu o dall'icona di installazione nella barra degli indirizzi.
5. Avviare l'app installata una volta mentre si è online. Il service worker scarica e conserva i file necessari.
6. Chiudere l'app, disattivare Internet e riaprirla per la prima prova offline.

## Uso offline
Dopo la prima installazione e il primo avvio online, le schermate e le funzioni locali sono disponibili senza rete. I dati vengono salvati nel browser/dispositivo. Ogni dispositivo mantiene il proprio archivio: non esiste sincronizzazione automatica.

## Trasferimento PC ↔ telefono
Sul dispositivo che contiene i dati aggiornati, premere **Esporta dati**. Trasferire il file JSON all'altro dispositivo. Nell'app di destinazione premere **Importa dati** e selezionare il backup. L'importazione sostituisce i dati presenti sul dispositivo di destinazione: esportare prima una copia di sicurezza.

## Categorie
Le categorie e sottocategorie iniziali (Nicotine, Hardware, Aromi, Basi neutre, Liquidi, Resistenze, Dispositivi, Accessori) sono modificabili e se ne possono aggiungere altre dalla sezione **Categorie prodotti**.

## Icona
L'icona usa il logo originale fornito per La Bottega dello Svapo, incorporato nel file `icon.svg`.

## Importante
- Questo pacchetto è una PWA installabile, **non** un file APK Android né un installer EXE Windows.
- La prima installazione e il primo caricamento richiedono Internet e un browser compatibile.
- Per ricevere gli aggiornamenti, aprire l'app online una volta.
- Non cancellare i dati del browser: si rischia di cancellare l'archivio locale.
- Fare backup periodici. La sincronizzazione tra PC e telefono resta manuale.
