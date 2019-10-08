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
            
        }
    })
}

if('Notification' in window){    
    for(var i = 0; i < enableNotificationButtons.length; i++){
        enableNotificationButtons[i].style.display = 'inline-block';
        enableNotificationButtons[i].addEventListener('click', askForNotificationPermission);
    }
} else {
      
}