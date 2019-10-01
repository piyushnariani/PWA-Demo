var deferredPrompt;

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