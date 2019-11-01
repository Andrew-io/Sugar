const readline = require('readline');
const net = require('net');

const SERVER_IP = '79.21.184.249'; // 'localhost';
const PORT = 4033;

/********
 * Lista Comandi Disponibili
 * 
 * - #clienti: riporta una lista ID dei clienti connessi (e loro alias)
 * - #info: riporta il proprio ID ed IP registrati sul server
 * - #ora: data ed ora del Server
 * - #alias: nick da mostrare ad altri clienti (serve uno spazio dopo '#alias')
 * - #[id_target] cmd: invia un comando all'id_target senza attesa di risposta, il comando segue '#cmd' con uno spazio
 * - #[id_target] cmdr: invia un comando all'id_target con attesa di risposta, il comando segue '#cmdr' con uno spazio
 * - #[id_target] connetti: stabilisce una chat permanente con l'id_target (restano possibili #distruggi e #chiudi)
 * - #distruggi: chiude la connessione con il Server
 * - #chiudi: chiude la chat corrente verso un altro cliente
 * 
 */


// ----------- CREO LA CONNESSIONE AL SERVER ---------

const client = new net.Socket();

client.on('data', data => {
    console.log(data.toString().replace(/\r|\n/g, ''));
});

client.on('end', () => {
    console.log('Ricevuta richiesta di chiususa socket.');
});

client.on('connect', () => {
    console.log(`Server connesso!\nScrivi qualcosa..`);
});

client.on('error', () => {
    console.log('Errore connessione.');
    setTimeout(startConnection.bind(this), 3000);
});


// ----------- HANDLE PER LEGGERE DA RIGA DI COMANDO -------

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', input => {
    if(!client.destroyed) {
        client.write(`${input}\n`);
    }
});


// ------------ START APP --------------------------

console.log(`---------------------------
FENZGER TERMINAL V1.0
All Rigths Reserved - 2019

Connessione in corso...
`);

setTimeout(startConnection.bind(this), 500);


function startConnection() {
    client.connect({ port: PORT, host: SERVER_IP });
}
