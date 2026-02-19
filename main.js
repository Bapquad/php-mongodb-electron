const electron = require('electron')
const { spawn } = require('child_process');
const PHPServer = require('php-server-manager');
const path = require('path')
const url = require('url')

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
let server, mainWindow, mongoProcess
if (process.platform === 'win32') {
	server = new PHPServer({
		php: `${__dirname}/php/php.exe`,
		port: 5555,
		directory: `${__dirname}/www`,
		directives: {
			display_errors: 1,
			expose_php: 1
		}, 
		config: `${__dirname}/php/php.ini`
	});
} else {
	server = new PHPServer({
		port: 5555,
		directory: __dirname+"/www",
		directives: {
			display_errors: 1,
			expose_php: 1
		}, 
		config: `${__dirname}/php/php.ini`
	});
};
function startMongo(flag) {
	if(!flag) return null
	
	let daemon = `${__dirname}/mongo/bin/mongod`;
	let cfpath = `${__dirname}/mongo/mongod.conf`;
	
    // Command to run mongod, specifying the dbpath
    mongoProcess = spawn(daemon, ['--config', cfpath]);

    mongoProcess.stdout.on('data', (data) => {
        console.log(`mongod stdout: ${data.toString()}`);
    });

    mongoProcess.stderr.on('data', (data) => {
        console.error(`mongod stderr: ${data.toString()}`);
    });

    mongoProcess.on('close', (code) => {
        console.log(`mongod process closed with code ${code}`);
    });
}
function createWindow () {
	let path = 'http://'+server.host+':'+server.port+'/';
	const {shell} = require('electron')
	server.run();
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 1024, height: 768})
	mainWindow.removeMenu()
	mainWindow.setFullScreen(false)
	// and load the index.html of the app.
	mainWindow.loadURL(path)
	// Emitted when the window is closed.
	mainWindow.on('closed', function (code) {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		// PHP SERVER QUIT
		server.close();
		mainWindow = null;
		if (process.platform !== 'darwin') {
			if (mongoProcess) {
				mongoProcess.kill(); // Terminate the spawned process
				mongoProcess = null;
			}
		}
	})

	shell.showItemInFolder('fullPath')
}

app.on('ready', ()=> {
	createWindow()
	startMongo(true)
}) // <== this is extra so commented, enabling this can show 2 windows..

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		if (mongoProcess) {
			mongoProcess.kill(); // Terminate the spawned process
			mongoProcess = null;
		}
		// PHP SERVER QUIT
		server.close();
		app.quit();
	}
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
