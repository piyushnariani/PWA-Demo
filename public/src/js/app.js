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
            dislayConfirmedNotification();
        }
    });
}

if('Notification' in window){    
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
        dir: 'ltr',
        lang: 'en-US', //BCP 47
        vibrate: [100, 50, 200], //Vibration - Pause - Vibration
        badge: 'src/images/icons/app-icon-96x96.png'
    };
    if('serviceWorker' in navigator){
        navigator.serviceWorker.ready
            .then(function(sw){
                sw.showNotification('Successfully Subscribed from SW', options);
            });
    }
    else{
        new Notification('Successfully Subscribed', options);
    }
}