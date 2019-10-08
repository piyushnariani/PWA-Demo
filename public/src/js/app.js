var deferredPrompt;
var enableNotificationButtons = document.querySelectorAll('.enable-notifications');

//Activate Promise polyfill if Promise is not supported by the current browser.
if(!window.Promise){
    window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function(){
            console.log('Service worker registered!')
        })
        .catch(function(err){
            console.log(err);
        });
}

// This event is fired just before browser is supposed to show prompt to install PWA
window.addEventListener('beforeinstallprompt', function(event){
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});

function askForNotificationPermission() {
    Notification.requestPermission(function(result){
        console.log('User choice', result);
        if(result!=='granted'){
            console.log('No notification permission granted');
        } else {
            // dislayConfirmedNotification();
            configurePushSubscription();
        }
    });
}

if('Notification' in window && 'serviceWorker' in navigator){    
    for(var i = 0; i < enableNotificationButtons.length; i++){
        enableNotificationButtons[i].style.display = 'inline-block';
        enableNotificationButtons[i].addEventListener('click', askForNotificationPermission);
    }
} else {
      
}

function dislayConfirmedNotification() {
    var options = {
        body: 'You have successfully subscribed to the notification service!',
        icon: '/src/images/icons/app-icon-144x144.png',
        image: '/src/images/sf-boat.jpg',
        dir: 'ltr', //left to right
        lang: 'en-US', //BCP 47
        vibrate: [100, 50, 200], //Vibration - Pause - Vibration
        badge: 'src/images/icons/app-icon-96x96.png',
        tag: 'confirm-notification', //Acts as an id for notification
        renotify: true, //Enables notification to pop and vibrate even if its with same id. False disables the renotify
        actions: [
            {action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png'},
            {action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png'}
        ]
    };
    
    navigator.serviceWorker.ready
        .then(function(sw){
            sw.showNotification('Successfully Subscribed', options);
        });
}

function configurePushSubscription(){
    if(!('serviceWorker' in navigator)){
        return;
    }
    var swReg;
    navigator.serviceWorker.ready
        .then(function(sw){
            swReg = sw;
            return sw.pushManager.getSubscription();
        })
        .then(function(subs){
            if(subs===null){
                //Create new subscription
                var vapidPublicKey = 'BHmvr0oBlIFZ4FBb2HQw0w6bce1z3YRC5HtuzM5T7d8YNXb3D3JRNUa4SjSTbbMYxdQNDYrVKKjRx8GI4Z-NDm4';
                var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                return swReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey
                });
            } else {
                //We have a subscription
            }
        })
        .then(function(newSub){
            return fetch('https://pwagram-1e19f.firebaseio.com/subscriptions.json', {
                method : 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'Accept' : 'application/json'
                },
                body: JSON.stringify(newSub)
            })
        })
        .then(function(res) {
            if(res.ok){
                dislayConfirmedNotification();
            }
        })
        .catch(function(err){
            console.log(err);
        })
}
