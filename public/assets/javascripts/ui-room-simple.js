let _debug = false;

let main = getEl('main');
let setup = getEl('setup');
let statusText = getEl('status');
let messages = getEl('messages');
let message = getEl('message');
let cword1 = getEl('cword1');
let cword2 = getEl('cword2');
let cpin = getEl('cpin');
let ccword1 = getEl('ccword1');
let ccword2 = getEl('ccword2');
let ccpin = getEl('ccpin');
let notifications = getEl('notifications');

let keys = [];
let peer;

let fileBuffer = [];
let fileMetadata = {};
let fileSize = 0;

let peerSignalReceived = false;

window.onload = (_event) => {
    if (window.location.protocol === 'http:' && !window.location.host.startsWith('localhost')) {
        window.location.protoco = 'https:';
        return;
    }

    message.focus();
};

window.alert = (msg) => {
    notify(msg);
}

message.addEventListener('paste', (event) => {
    event.preventDefault();

    const paste = (event.clipboardData || window.clipboardData).getData('text');
    message.innerText += paste;
});

message.addEventListener('keydown', function(event) {
    if (event.code === 'Enter') {
        event.preventDefault();
        var msg = message.innerText.trim();
        if (msg.startsWith('/')) {
            let cmd = msg.replace(/\s+/g, ' ').trim().split(' ');
            handleCommand(cmd[0].substring(1), cmd.slice(1));
        } else {
            cmdSend(msg);
        }
        message.innerText = '';
        message.focus();
    }
});

async function handleCommand(cmd, args) {
    switch(cmd) {
        case 'help':
            cmdHelp();
            break;
        case 'privacy':
            cmdPrivacy();
            break;
        case 'clean':
        case 'clear':
            cmdClean();
            break;
        case 'file':
            cmdFile();
            break;
        case 'create':
            cmdCreate();
            break;
        case 'join':
            cmdJoin(args);
            break;
        case 'leave':
        case 'quit':
        case 'exit':
            cmdLeave();
            break;
        case 'debug':
            cmdDebug();
            break;
        default:
            notify(`unknown command! ${cmd}`);
    }
}

async function cmdClean() {
    fileBuffer = [];
    fileMetadata = {};
    fileSize = 0;
    messages.innerHTML = '';
    showHide('messages');
}

async function cmdCreate() {
    await cmdClean();
    generate().then(() => {
        messages.innerHTML = setup.innerHTML;
        statusText.innerText = 'initializing signal';
        prepare().then((result) => {
            [ls, room] = result;
            setTimeout(function() {
                dial(ls, room);
                statusText.innerText = 'waiting participant';
            }, 15000);
        });
    });
}

async function cmdJoin(args) {
    if (!words.includes(args[0])) {
        notify(`Invalid word#1: ${args[0]}`);
        throw new Error(`invalid word: ${args[0]}`);
    }
    if (!words.includes(args[1])) {
        notify(`Invalid word#2: ${args[1]}`);
        throw new Error(`invalid word: ${args[1]}`);
    }
    if (!(!isNaN(parseFloat(args[2])) && isFinite(args[2])) || args[2].length !== 6) {
        notify(`Invalid pin (must 6 digit number): ${args[2]}`);
        throw new Error(`pincode must be a 6 digit number! ${args[2]}`);
    }

    await cmdClean();
    prepare(args.slice(0,3)).then((result) => {
        [ls, room] = result;
        setTimeout(function() {
            answer(ls, room);
            statusText.innerText = 'waiting participant';
        }, 1000);
    });
}

async function cmdFile() {
    if (!peer || !peer.isConnected) {
        notify('To send file, you need to establish connection to a peer!');
        throw new Error('peer connection is not established!');
    }
    let io = createEl('input');
    io.type = 'file';

    io.onchange = e => {
        // getting a hold of the file reference
        let file = e.target.files[0];

        if (file.size === 0) {
            if (_debug) {
                console.log('emtpy file!');
            }
            notify('Empty files can not be transfered');
            return;
        }

        const id = newID();
        peer.sendText({id: id, data: {file: {name: file.name, size: file.size}}});

        messages.appendChild(buildNode('message-outgoing', id, '📎 ' + file.name + ` (${humanFileSize(file.size)})`));
        main.scrollTop = main.scrollHeight;

        peer.createFileDC();

        const chunkSize = 8192;
        let offset = 0;

        // setting up the reader
        let reader = new FileReader();

        const readChunk = offset => {
            if (_debug) {
                console.log('*** file load chunk ', offset, chunkSize);
            }
            const slice = file.slice(offset, offset + chunkSize);
            reader.readAsArrayBuffer(slice);
        };

        // here we tell the reader what to do when it's done reading...
        reader.onload = event => {
            if (_debug) {
                console.log('*** file chunk loaded', offset, chunkSize);
            }
            let bin = event.target.result;
            peer.sendFile(bin);
            offset += bin.byteLength;
            if (offset < file.size) {
                readChunk(offset);
            } else if (_debug) {
                console.log('*** file transfer completed');
                io = null;
            }
        }

        readChunk(0);
    }

    io.click();
}

async function cmdSend(msg) {
    if (msg === '') {
        return;
    }
    if (!peer) {
        notify('Peer connection is not established');
        throw new Error('peer is not initialized');
    }
    if (!peer.isConnected) {
        statusText.innerText = peer.connectionState;
        notify(peer.connectionState);
        throw new Error(`trying to send on connection state ${peer.connectionState}`);
    }
    const id = newID();
    peer.sendText({id: id, data: msg});
    messages.appendChild(buildNode('message-outgoing', id, msg));
    main.scrollTop = main.scrollHeight;
}

async function cmdLeave() {
    cmdClean();
    if (peer) {
        await peer.hangup();
    }
    notify('Please wait, reloading the window in a second!');
    setTimeout(function(){
        location.reload();
    },1000);
}

async function cmdDebug() {
    _debug = true;
    if (peer) {
        peer._debug = _debug;
    }
}

async function cmdHelp() {
    showHide('help');
}

async function cmdPrivacy() {
    showHide('privacy');
}

async function notify(msg, log = _debug) {
    if (log) {
        console.log(`[notify] ${msg}`);
    }
    let notification = createEl('div');
    notification.classList.add('notification');
    notification.innerText = msg;
    notifications.appendChild(notification);
    setTimeout(function(){
        notifications.removeChild(notification);
    },4000);
}

async function subscribeToPeerEvents() {
    /*Messaging*/
    peer.on('onpeerconnected', function(_event) {
        if (statusText.innerText !== 'connected') {
            notify('Connected to the peer');
        }
        statusText.innerText = 'connected';
    });
    peer.on('onpeerdisconnected', function(event) {
        if (event.status === 'failed') {
            notify('Failed to establish connection to remote peer!');
        } else if ((!peer || !peer.isConnected) && statusText.innerText !== 'disconnected') {
            notify('Disconnected from the peer');
        }
        statusText.innerText = peer && peer.isConnected ? 'connected' : 'disconnected';
    });
    peer.on('onpeermessage', function(event) {
        receive(event.id, event.data);
    });
    peer.on('onpeerfilemetadata', function(event) {
        receiveFileMetadata(event.id, event.data);
    });
    peer.on('onpeerfile', function(event) {
        receiveFile(event.data);
    });

    /*Signal*/
    peer.on('onsignalopen', function(_event) {
        notify('Secret room is created, waiting another participant to join!');
    })
    peer.on('onsignalclose', function(event) {
        if (peer && !peer.isConnected) {
            if (!peerSignalReceived) {
                notify('Nobody joined to room, signal is closed!');
            } else {
                notify('Could not establish peer to peer connection');
            }
            statusText.innerText = 'disconnected';
            peer.hangup();
            peer = null;
        }
    });
    peer.on('onsignalerror', function(event) {
        notify('Something went wrong on signaling, please rejoin');
        statusText.innerText = 'disconnected';
        peer.hangup();
        peer = null;
    });
    peer.on('onsignalmessage', function(event) {
        if (event.status === 'wait') {
            notify('Waiting a participant to join to the room');
        } else if (event.status === 'ready') {
            notify('A participant joined to the room');
            handleCommand('clear');
            statusText.innerText = 'connecting';
            peerSignalReceived = true;
        }
    });
}

async function generate() {
    keys = KeyMaker.random();
    cword1.innerText = keys[0];
    cword2.innerText = keys[1];
    cpin.innerText = keys[2];
    ccword1.innerText = keys[0];
    ccword2.innerText = keys[1];
    ccpin.innerText = keys[2];
}

async function prepare(joinKeys = keys) {
    let ls;
    try {
        ls = new Locksmith(joinKeys[0], joinKeys[1], joinKeys[2]);
    } catch (e) {
        notify('Could not init encryption library!');
        statusText.innerText = 'failed';
        throw new Error(`Could not init encryption library: ${e.toString()}`);
    }
    if (ls === null) {
        return
    }

    if (peer !== undefined && peer !== null) {
        await peer.hangup();
        peer = null;
    }
    peerSignalReceived = false;
    let room;
    try {
        room = await ls.digest();
    } catch(e) {
        notify('Could not init encryption library!');
        throw new Error(`Could not init encryption library: ${e.toString()}`);
    }

    return [ls, room];
}

async function dial(ls, room) {
    peer = new Caller(wsServiceURL, configuration, room, ls, _debug);
    await subscribeToPeerEvents();
}

async function answer(ls, room) {
    peer = new Callee(wsServiceURL, configuration, room, ls, _debug);
    await subscribeToPeerEvents();
    main.scrollTop = main.scrollHeight;
}

async function showHide(show) {
    for (let n of getEl('main-content').childNodes) {
        n.hidden = true;
    }
    getEl(show).hidden = false;
}

function receiveFileMetadata(id, metadata) {
    fileMetadata = metadata;
    metadata['id'] = id;
    if (_debug) {
        console.log('*** file metadata', fileMetadata);
    }
    messages.appendChild(buildNode('message-incoming', id, '📎 ' + metadata.name));
    main.scrollTop = main.scrollHeight;
}

function receive(id, data) {
    messages.appendChild(buildNode('message-incoming', id, data));
    main.scrollTop = main.scrollHeight;
}

function receiveFile(data) {
    fileBuffer.push(data);
    fileSize += data.byteLength;
    if (fileSize === fileMetadata.size) {
        const received = new Blob(fileBuffer);
        let downloadAnchor = createEl('a');
        downloadAnchor.href = URL.createObjectURL(received);
        downloadAnchor.download = fileMetadata.name;
        downloadAnchor.textContent =
          `${fileMetadata.name} (${humanFileSize(fileMetadata.size)})`;
        const node = getEl('m_' + fileMetadata.id);
        node.innerHTML = '<span>📎 </span>';
        node.appendChild(downloadAnchor);
        node.appendChild(buildTime());
        peer.destroyFileDC();

        fileBuffer = [];
        fileSize = 0;
        fileMetadata = {};
        if (_debug) {
            console.log('***file tranfer completed');
        }
    }
}

function buildNode(type, id, msg) {
    let node = createEl('div');
    node.classList.add('message');
    node.classList.add(type === 'message-outgoing' ? 'text-right' : 'text-left');
    let input = createEl('div');
    input.classList.add(type)
    let content = buildContent(id, msg);
    content.appendChild(buildTime());
    input.appendChild(content);
    node.appendChild(input);
    return node;
}

function buildTime() {
    var node = createEl('sub');
    node.classList.add('message-time')
    const date = new Date();
    node.innerText = pad2(date.getHours()) + ':' + pad2(date.getMinutes());
    return node;
}

function buildContent(id, msg) {
    var node = createEl('div');
    node.classList.add('content')
    node.id = 'm_' + id;
    node.innerText = msg;
    return node;
}

function pad2(number) {
    return (number < 10 ? '0' : '') + number
}

function newID() {
    return new Date().getTime() + random();
}

function random() {
    return (Math.floor(Math.random() * Math.floor(999999)) + '').padStart(6, '0');
}

function humanFileSize(bytes) {
    const thresh = 1000;
    const dp = 1;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    const r = 10**dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
}

function getEl(id) {
    return document.getElementById(id);
}

function createEl(tag) {
    return document.createElement(tag);
}
