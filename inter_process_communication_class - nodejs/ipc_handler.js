const net = require('net');

const ROLES = {
	slave: 'slave',
	master: 'master'
}

class ipcHandler {

	constructor(options, dataClbk, instanceClbk) {
		if (!options || !options.role || !ROLES[options.role]) {
			console.log('Bad role value.');
			return;
		}

		this._role = options.role;
		this._log = options.log ? true : false;
		this._room = options.room;
		this._uid = options.uid;
		this._tcpPort = options.port || 6888;
		this._tcpHost = options.host || '127.0.0.1';
		this._dataHnd = options.role === ROLES.slave ? dataClbk : null;
		this._creationHnd = options.role === ROLES.slave ? instanceClbk : dataClbk;
		this._rooms = options.role === ROLES.slave ? null : {};
		
		this.logs(`Task starts with role: ${this._role.toUpperCase()}`);
		
		if (this._role === ROLES.master) {
			this.startServer();
		} 
		else {
			this.startClient();
		}
	}
		
	logs(str) {
		if(!this._log) {
			return;
		}
		console.log('>>', str);
	}

	startServer() {
		net.createServer()
		.on('close', () => {
			process.exit();
		})
		.on('error', () => {
			server.close();
		})
		.on('connection', sock => {
			sock.setEncoding('utf8');
			const path = {};

			const to = setTimeout(() => {
				sock.destroy();
			}, 500);
			
			sock.on('close', () => {
				if (path.uid) {
					this.removeFromRoom(path.room, path.uid);
				}
				this.logs(`Closed socket with "${path.uid}"`);
			});

			sock.on('error', () => {
				sock.destroy();
			});
			
			sock.on('data', data => {
				data = JSON.parse(data);

				switch(data.action) {
					case 'present':
						clearTimeout(to);
						if(!this._rooms[data.room]) {
							this._rooms[data.room] = {};
						}
						this._rooms[data.room][data.uid] = sock;
						path.room = data.room;
						path.uid = data.uid;
						this.logs(`Open socket with "${path.uid}"`);
						break;
					case 'post':
						if (!this._rooms[data.room] ||
							!this._rooms[data.room][data.dest] ||
							data.dest === path.uid
						) {
							return;
						}
						this._rooms[data.room][data.dest].write(
							JSON.stringify({
								sender: data.uid,
								payload: data.payload
							})
						);
						this.logs(`Data from "${path.uid}" to "${data.dest}"`);
						break;
					case 'participants':
						if (!this._rooms[data.room]) {
							return;
						}
						this._rooms[data.room][data.uid].write(
							JSON.stringify({
								sender: data.uid,
								payload: {
									list: Object.keys(this._rooms[data.room])
								}
							})
						);
						this.logs(`Data from "${path.uid}" to "${data.dest}"`);
						break;
				}	
			});
		})
		.listen(this._tcpPort, () => {
			this.logs(`Server TCP active on ${this._tcpPort}`);
			this.onCompleteIstance();
		});
	}
	
	startClient() {
		this._client = new net.Socket();
						
		this._client.on('data', data => {
			if(this._dataHnd) {
				this._dataHnd(JSON.parse(data));
			}
		})
		.on('end', () => {
			this.logs(`Server connection closed`);
		})
		.on('connect', () => {
			this.logs(`Connected with server`);
			this.bindData('present');
			this.onCompleteIstance();
		})
		.on('error', () => {
			this.logs(`Connection Err`);
			setTimeout(() => {
				this._client.connect({port: this._tcpPort, host: this._tcpHost});
			}, 5000);
			
			this.onCompleteIstance('Connection err');
		});
		
		this._client.connect({port: this._tcpPort, host: this._tcpHost});
	}

	bindData(action, data = {}) {
		data.room = this._room; 
		data.uid = this._uid;
		data.action = action;
		this._client.write(JSON.stringify(data));
	}

	onCompleteIstance(err) {
		if (this._creationHnd) {
			this._creationHnd(err);
		}
	}
	
	removeFromRoom(room, uid) {
		delete this._rooms[room][uid];

		if (Object.keys(this._rooms[room]).length === 0) {
			delete this._rooms[room];
		}
	}

	postData(data) {
		this.bindData('post', data);
	}

	getRoomParticipants() {
		this.bindData('participants');
	}
}

module.exports = ipcHandler;

/*
::: OPTION
{
	role: string (required),
	log: boolean (optional),
	room: string (required, only for slave, is the processes network name),
	uid: string (required, only for slave),
	port: number (optional),
	host: string (optional, only for slave)
}

::: CALLBACKS
	dataClbk: required, only for slave. Called when task receives data from others
		@data: {
			sender: string,
			payload: object
		}
instanceClbk: optional, use to notify when master or slave is actived
		@error: present if there is an error during creation

::: CALL OTHER PROCESS
Use function 'postData(pars)'
	@pars:  {
		dest: string, uid process to call
	 payload: object
	}

::: GET LIST PARTICIPANTS IN THE ROOM
Use function 'getRoomParticipants()', the response payload in the 'dataClbk':
		list: array

::: EXAMPLE
const ipc = new ipcHandler({
	role: 'slave',
	room: 'room2',
	uid: 'sensor'
}, dataCallback, (err) => {}));

*/