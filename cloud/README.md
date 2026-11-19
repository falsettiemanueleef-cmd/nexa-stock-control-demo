# NEXA STOCK CONTROL — predisposizione cloud

## Stato reale del pacchetto
La demo pubblica attuale rimane invariata e continua a usare dati fittizi in memoria.
Questo pacchetto contiene lo schema SQL e la configurazione di esempio per predisporre il database cloud privato di Antonio.

**Non è ancora una versione sincronizzata pronta all'uso.** Non sono stati creati il progetto Supabase, l'account di Antonio, né collegati e testati i flussi di login/sincronizzazione nell'interfaccia. Non pubblicare questa cartella come versione di produzione e non inserire dati reali.

## Architettura prevista
- Un account autenticato per Antonio.
- Una riga privata per account nella tabella `public.stock_state`.
- Regole RLS: ogni utente autenticato può leggere/scrivere soltanto la propria riga.
- Realtime per notificare agli altri dispositivi gli aggiornamenti.
- Stessa applicazione web responsive da PC e smartphone.

## Passi necessari
1. Creare un progetto Supabase.
2. Nel pannello Authentication, abilitare email/password e creare l'utente di Antonio (non pubblicare la password).
3. Aprire SQL Editor ed eseguire `supabase/schema.sql`.
4. Copiare Project URL e publishable/anon key in `supabase-config.example.js`, salvandolo come configurazione effettiva.
5. Integrare nel frontend i flussi di login, caricamento iniziale, salvataggio, sottoscrizione Realtime e gestione conflitti.
6. Testare: inserimento da telefono, verifica su PC; modifica da PC, verifica su telefono; refresh, logout/login, backup e recupero.
7. Solo dopo i test distribuire la versione privata.

## Sicurezza
La chiave anon/publishable è destinata al client e non sostituisce RLS. Non usare mai la chiave `service_role` nel browser. Le policy SQL limitano ogni riga al proprietario autenticato. Prima della produzione vanno anche verificati backup, recupero account e gestione dei conflitti di modifica.

## Demo pubblica
https://falsettiemanueleef-cmd.github.io/nexa-stock-control-demo/

La demo contiene esclusivamente dati dimostrativi e non è il gestionale cloud di Antonio.
