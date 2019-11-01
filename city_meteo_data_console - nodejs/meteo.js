const https = require('https');



/****************** APP ENGINE - V1.1 *****************/
let LOCATION;

const wheather_url = 'https://openweathermap.org/data/2.5/weather/?appid=b6907d289e10d714a6e88b30761fae22';

const translations = {
	'clear sky': 'Cielo sereno',
	'few clouds': 'qualche nuvola',
	'scattered clouds': 'nubi sparse',
	'broken clouds': 'nuvoloso',
	'shower rain': 'acquazzone',
	'rain': 'pioggia',
	'thunderstorm': 'temporale',
	'snow': 'neve',
	'mist': 'misto',
	'light rain': 'lievi piogge',
	'moderate rain': 'piogge moderate'
};

const promptColor = {
	white: '\x1b[37m',
	azure: '\x1b[36m',
	greeen: '\x1b[32m',
	yellow: '\x1b[33m'
};

function loadMeteoData(location = 'Milan,it') {
    return new Promise((res, rej) => {
        https.get(`${wheather_url}&lang=it&q=${location}&units=metric`,
            ris => {
                ris.on('data', d => {
					try {
						res(JSON.parse(d));
					} 
					catch(e) {
						rej('ERROR: ' + e.message);
					}
                });
        }).on('error', (e) => {
            rej(e);
        });
    });
}

function drawDataPrompt(obj) {
    return `AGGIORNAMENTO: ${promptColor.azure}${getTime(Date.now())}
${promptColor.yellow}------------------------
${promptColor.white}CITTA:       ${promptColor.greeen}${obj.city}
${promptColor.yellow}------------------------
${promptColor.white}TEMPERATURA: ${promptColor.greeen}${obj.temp.now}°C 
              ${promptColor.greeen}min: ${obj.temp.min}
              ${promptColor.greeen}max: ${obj.temp.max}
${promptColor.yellow}------------------------
${promptColor.white}UMIDTA:      ${promptColor.greeen}${obj.humid}%
${promptColor.white}PRESSIONE:   ${promptColor.greeen}${obj.press} hPa
${promptColor.yellow}------------------------
${promptColor.white}VENTO:       ${promptColor.greeen}${obj.wind.speed}m/s ${getWindDir(obj.wind.deg)}
${promptColor.white}VISIBILITA:  ${promptColor.greeen}${obj.visibility / 1000}Km
${promptColor.yellow}------------------------
${promptColor.white}STATO:       ${promptColor.greeen}${translate(obj.weather_desc)}
${promptColor.white}TRAMONTO:    ${promptColor.greeen}${getTime(obj.sunset*1000)}
${promptColor.white}`;
}

function parseMeteoData(obj) {
	return {
		city: `${obj.name} (${obj.sys.country})`,
		temp:{
			now: `${obj.main.temp}`,
			min: `${obj.main.temp_min}`,
			max: `${obj.main.temp_max}`,
		},
		humid: `${obj.main.humidity}`,
		press: `${obj.main.pressure}`,
		wind: {
			deg: `${obj.wind.deg}`,
			speed: `${obj.wind.speed}`
		},
		visibility: `${obj.visibility}`,
		weather_desc: `${obj.weather[0].description}`,
		sunset: `${obj.sys.sunset*1000}`,
	};
}

function getWindDir(d) {
    let ris = 'NORD';
    if ((330 <= d && d <= 360) ||(0 <= d && d <= 30)) { }
    else if (d <= 60) {
        ris = 'NO-EST';
    }
    else if (d <= 120) {
        ris = 'EST';
    }
    else if (d <= 150) {
        ris = 'SO-EST';
    }
    else if (d <= 210) {
        ris = 'SUD';
    }
    else if (d <= 240) {
        ris = 'SO-OVEST';
    }
    else if (d <= 300) {
        ris = 'OVEST';
    }
    else if (d <= 330) {
        ris = 'NO-OVEST';
    }
    return ris;
}

function getTime(ms) {
    return new Date(ms).toLocaleTimeString().slice(0, -3);
}

function translate(str) {
	return translations[str] || str;
}

function displayData() {
    loadMeteoData(LOCATION).then(parseMeteoData).then(data => {
        console.clear();
        console.log(drawDataPrompt(data));
    },
    err => {
        console.log(err);
    });
}

function scheduleNextCall(loc) {
    const msRemaining = loc ? 0 : (300000 - (Date.now() % 300000));
    LOCATION = loc ? loc : LOCATION;
    setTimeout(() => {
        displayData();
        scheduleNextCall();
    }, msRemaining);
}



/*************** START APP ***************/

scheduleNextCall('Milan,it');

