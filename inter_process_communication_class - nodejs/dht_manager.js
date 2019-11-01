// var sensor = require("node-dht-sensor");
//*****
var sensor = {
	read: (a,b,c) => {
	setTimeout(()=>{c(
		null, 
		(Math.floor(Math.random() * 26) + 20)+0.345,
		(Math.floor(Math.random() * 61) + 50)+0.645
	);},700);
	}
};
//**** 
const ipcHandler = require('./ipc_handler');
let last_sensor_data = {err: 'No data'};

const ipc = new ipcHandler(
				{
					role: 'slave',
					room: 'room1',
					uid: 'dht'
				}, 
			onData
			);

function onData(data) {
	ipc.postData({
		dest: data.sender, 
		payload: last_sensor_data
	});
}

function getSensor() {
	sensor.read(11, 4, function(err, temp, hum) {
	  if (err) {
		last_sensor_data.err = 'Sensor Err';
	  }
	  else {
		last_sensor_data = {
			err: null,
			data: {
				temp: temp.toFixed(1), 
				hum: hum.toFixed(1)
			}
		};
	  }
	});
}

getSensor();
setInterval(getSensor, 4000);

/*
 Call from other task:	
	ipc.postData({
		dest: 'dht', 
		payload: null
	});
	
  Response:
  {
	  err: string
	  data: {
		  temp: string, 
		  hum: string
	  }
  }
*/

