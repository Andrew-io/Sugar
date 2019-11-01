const ipcHandler = require('./ipc_handler');

const ipc = new ipcHandler({role: 'master'}, err => {
    if(err) {
        console.log('Error!');
    }
    else {
        console.log('IPC server Started.');
    }
});