<!DOCTYPE html>
<html lang="en">

<head>
    <title>secretpeer</title>
    <meta http-equiv="X-XSS-Protection"  content="1;mode=block" always>
    <meta http-equiv="Referrer-Policy" content="no-referrer, strict-origin-when-cross-origin">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
    <meta property="og:title" content="secretpeer" />
    <meta property="og:locale" content="en_US" />
    <meta name="description" content="End to end encrypted peer to peer messaging and file transfer web app" />
    <meta property="og:description" content="End to end encrypted peer to peer messaging and file transfer web app" />
    <link rel="canonical" href="https://secretpeer.com/" />
    <meta property="og:url" content="https://secretpeer.com/" />
    <meta property="og:site_name" content="secretpeer.com" />
    <meta name="twitter:card" content="summary" />
    <meta property="twitter:title" content="secretpeer" />
    <script type="application/ld+json">
    {"description":"End to end encrypted peer to peer messaging and file transfer web app","url":"https://secretpeer.com/","@type":"WebSite","headline":"secretpeer","name":"secretpeer.com","@context":"https://schema.org"}
    </script>
    <link rel="stylesheet" href="./assets/stylesheets/normalize.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="./assets/stylesheets/base.css" crossorigin="anonymous" referrerpolicy="no-referrer"  />
    <script defer data-do="secretpeer.com" data-id="051rc6YFmDq" data-api="//us.onsignal.cc" data-hm="1" src="//app.onsignal.cc/onsignalcc-min.js" id="onsignalcc"></script>
</head>
<body>
<header>
    <div class="container">
        <h1 class="title">secretpeer</h1>
        <div class="status text-right">
            <span id="status-indicator">&#8226;</span>
            <span id="status"></span>
        </div>
    </div>
</header>
<main id="main">
    <div class="container" id="main-content">
        <div class="main-content" id="help">
            <p>Welcome!</p>
            <p>
                This is an end-to-end encrypted, peer-to-peer messaging and file transfer static web app.
                The peer-to-peer communication occurs privately in 2 parcipant rooms.
                Nobody can enter the room without knowing the private/random 2 words and the 6 digit pin code which are generated in the browser.
                Guessing probability of these random 2 words and 6 digit pin code combination is 1/4194304000000.
                Also, the guesser has to do the guess for these 2 words and the pin code until 2 peers start the communication.
                The whole conversation in the room and the file transfers occur directly peer to peer without any server or service.
                When the browser is closed, the conversation content is auto deleted by the browser.
                It is a similar experience to visit a static web page.

                You can start using the service by using the commands below.
                Source code is available at <a href="https://github.com/mustafaturan/secretpeer">https://github.com/mustafaturan/secretpeer</a>
            </p>

            <p>
                NOTE: For page-view analytics, it is using privacy-friendly cookie-less analytics solution onsignal.cc as private trial.
                The analytics tracker might be removed or replaced with another privacy-friendly solution in the future.
            </p>

            <ul class="commands">
                <li><b>(/h) /help</b> Help screen (this page)</li>
                <li><b>(/p) /privacy</b> Privacy details</li>
                <li><b>(/c) /create</b> Create a new room</li>
                <li><b>(/j) /join word#1 word#2 pin</b> Join to an existing room</li>
                <li><b>(/f) /file</b> Select a file and transfer to the other peer in the room</li>
                <li><b>(/q) /quit</b> Leave the room and clean the content body</li>
                <li><b>(/n) /clean</b> Clean the content body</li>
                <li><b>(/v) /version</b> Version</li>
            </ul>
        </div>
        <div class="main-content" id="privacy" hidden>
            <p><b>Privacy</b></p>
            <p>
                This is an end-to-end encrypted, peer-to-peer messaging and file transfer static web app.
                The peer-to-peer communication occurs privately in 2 parcipant rooms.
                Nobody can enter the room without knowing the private random 2 words and the 6 digit pin code which are generated in the browser.
                Guessing probability of these random 2 words and 6 digit pin code combination is 1/4194304000000.
                Also, the guesser has to do the guess for these 2 words and the pin code until 2 peers start the communication.
                The whole conversation in the room and the file transfers occur directly peer to peer without any server or service.
                When the browser is closed, the conversation content is auto deleted by the browser.
            </p>
            <p>
                End-to-end encrypted, peer-to-peer communication and file transfer relies on WEBRTC technology.
                For this reason, to initiate the initial conversation `STUN` and `Signal` services are used.
            </p>
            <ul>
                <li>
                    As `STUN` service, it uses generally available `stun:stun.l.google.com:19302` address to discover
                    the browser's current <a href="https://webrtc.org/getting-started/peer-connections-advanced">SDP</a> values.
                </li>
                <li>
                    As `Signal` service, it uses a custom http service that allows only specific input with a limited size.
                    Signal service is used to help exchanging the SDP pairs of the peers which is required to initiate peer to peer conversation.
                    Once the peer to peer connection is established, then the Signal connections are closed.
                    This initialization process, approximately takes seconds where the peers enters the correct private words and pin.
                    The SDP pairs are encrypted in the browser with the AES GCM by using the 2 words and the pin code after PBKDF2 key derivation with 100000 iterations.
                    The nonce/iv of the AES GCM randomly generated in the browser and passed to the peer as plain text via Signal service.
                    So, the Signaling service is only responsible to help exchanging the end-to-end encrypted SDP information.
                </li>
            </ul>
            <p>
                For page-view analytics, it is using privacy-friendly cookie-less analytics solution onsignal.cc as private trial.
                The analytics tracker might be removed or replaced with another privacy-friendly solution in the future.
            </p>
        </div>
        <div class="main-content" id="version" hidden>
            <div class="version text-center">
                <p><a href="https://github.com/mustafaturan/secretpeer">secretpeer v<b><span id="version-number"></span></b></a></p>
            </div>
        </div>
        <div class="messages" id="messages" hidden></div>
        <div id="setup" hidden>
            <div class="setup text-center">
                <div class="setup-info">
                    Word#1: <b><span id="cword1"></span></b>,
                    Word#2: <b><span id="cword2"></span></b>,
                    Pin: <b><span id="cpin"></span></b>
                    <p>other peer should run the command below to join the room</p>
                    <pre>/join <span id="ccword1"></span> <span id="ccword2"></span> <span id="ccpin"></span></pre>
                    <canvas id="qrcode" hidden></canvas>
                    <div id="qrimage"></div>
                </div>
                <p>
                    To start the conversation, share the 2 words and the pin with the other participant.
                </p>
            </div>
        </div>
    </div>
    <div class="notifications" id="notifications"></div>
</main>
<footer>
    <div class="container">
        <div contenteditable="true" id="message" class="input-message" data-text="Type command or message"></div>
    </div>
</footer>
<script type="text/javascript" src="./assets/javascripts/dist/bundle.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script type="text/javascript" src="./assets/javascripts/deps/qurious-min-v402.js" crossorigin="anonymous" referrerpolicy="no-referrer" async></script>
</body>
</html>