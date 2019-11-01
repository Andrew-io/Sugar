const ipcHandler = require('./ipc_handler');


const ipc = new ipcHandler({
    role: 'slave',
    room: 'room1',
    uid: 'getter',
    log: false
}, 
resp => {
    switch(resp.sender) {
		case 'dht':
			sensorRespHandler(resp.payload);
			break;
	}
},
err => {
    if(err) {
        console.log('Error!');
    }
    else {
        console.log('IPC Started.');
        
        setInterval(() => {
            ipc.postData({
                dest:'dht', 
                payload: null
            });
        }, 3000);
    }
});

function sensorRespHandler(resp) {
	if (!resp.err){
		console.log(`temp: ${resp.data.temp}°C, humidity: ${resp.data.hum}%`);
	} 
	else {
		console.log(resp.err);
	}
}