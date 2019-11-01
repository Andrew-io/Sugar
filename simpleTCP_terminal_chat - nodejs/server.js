const net = require('net');

const PORT = 4033;

const clients = {};

// ---------------- SERVER TCP ------------

const server = net.createServer();

server.on('connection', manageSocket);

server.on('close', () => {
	process.exit();
});

server.on('error', () => {
	server.close();
});

server.listen(PORT, () => {
	console.log('Server TCP in attivo su ' + PORT);
});

// ---------------- GESTIONE LOG ------------

function log(text) {
	const dt = new Date().toLocaleTimeString().slice(0, -3) + ' - ';
	console.log(dt + text);
}

// ---------------- GESTIONE CONNESSIONI ------------

function manageSocket(sock) {
	sock.setEncoding('utf8');
	sock.id = Date.now() + Math.floor(Math.random()*100) + '';

	clients[sock.id] = sock;
	let dataBuff = '';

	log(`Client Id ${sock.id} connected (IP ${sock.localAddress})`);
		
	sock.on('close', () => {
		log(`Client Id ${sock.id} connection closed`);
		deleteClient(sock.id);
	});

	sock.on('error', () => {
		// log(`Client Id ${sock.id} connection error`);
		sock.destroy();
	});
	
	sock.on('data', data => {
		dataBuff += data;

		if (!(/\r|\n/g).test(dataBuff)) { // ..wait until receive '\n' or '\r'
			return;
		}

		parseCommand(dataBuff.replace(/\r|\n/g, ''), sock);

		dataBuff = '';
	});
}

// ---------------- GESTIONE COMANDI ------------

function parseCommand(data, sock) {

	if(data.indexOf('#distruggi') === 0) {
		sock.write('Bye bye cowboy\n');
		sock.destroy();

	}
	else if(data.indexOf('#chiudi') === 0) {
		if (!sock.recipient) {
			sock.write(`Non ci sono Chat aperte\n`);
			return;
		}
		clients[sock.recipient].write(`${sock.id} ha abbandonato\n`);
		delete clients[sock.recipient].recipient;
		delete sock.recipient;
		sock.write(`Chat chiusa\n`);

	}
	else if (sock.requestor) {
		clients[sock.requestor].write(`${data}\n`);
		delete sock.requestor;

	}
	else if (sock.recipient) {
		clients[sock.recipient].write(`${data}\n`);

	}
	else if(data.indexOf('#clienti') === 0) {
		let resp = '';
		for(let k in clients) {
			if (k === sock.id) continue; 
			resp += k + (clients[k].alias ? ' ('+ clients[k].alias +')' : '' ) + ' - ';
		}
		resp = resp !== '' ? resp.slice(0, -3) : 'Empty list';
		sock.write(resp);

	}
	else if(data.indexOf('#[') === 0) {
		if (data.indexOf(']') < 0) {
			sock.write(`Command <${data}> not found\n`);
			return;
		}

		const target = data.match(/\[(.*)\]/)[1];

		if(data.indexOf('connetti') > 0){
			sock.recipient = target;
			clients[target].recipient = sock.id;
			clients[target].write(`${sock.id} si è connesso\n`);
			sock.write(`Connesso a ${target}\n`);
		}
		else if(data.indexOf('cmd ') > 0){
			clients[target].write(`${data.substr(data.indexOf('cmd ') + 4)}\n`);
		}
		else if(data.indexOf('cmdr ') > 0) {
			clients[target].requestor = sock.id;
			clients[target].write(`${data.substr(data.indexOf('cmdr ') + 5)}\n`);
		}
		else {
			sock.write(`Command <${data}> not found\n`);
		}

	}
	else if(data.indexOf('#ora') === 0) {
		const dt = new Date();
		const tm = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString().slice(0, -3);
		sock.write(`Server Time: ${tm}\n`);

	}
	else if(data.indexOf('#alias') === 0) {
		sock.alias = data.substr(7);
		sock.write(`Your alias is now: ${sock.alias}\n`);

	}
	else if(data.indexOf('#info') === 0) {
		sock.write(`Your info: IP = ${sock.localAddress}, ID = ${sock.id}\n`);

	}
	else {
		sock.write(`Command <<${data}>> not found\n`);

	}
}

function deleteClient(id) {
	if (clients[id].recipient) {
		clients[clients[id].recipient].write(`${id} ha abbandonato\n`);
		delete clients[clients[id].recipient].recipient;
	}
	delete clients[id];
}
