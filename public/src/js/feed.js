var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMoments = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(function(){
    createPostArea.style.transform = 'translateY(0)';
  // }, 1);
  if (deferredPrompt){
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult){
      console.log(choiceResult.outcome);

      if(choiceResult.outcome==='dismissed'){
        console.log('User cancelled installation');
      }
      else{
        console.log('User added to home screen');
      }
    });
    deferredPrompt = null;
  }

  // if('serviceWorker' in navigator){
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for(var i=0; i<registrations.length; i++){
  //         registrations[i].unregister();
  //       }
  //     });
  // }
}

function closeCreatePostModal() {
  // createPostArea.style.display = 'none';
  createPostArea.style.transform = 'translateY(100vh)';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCard() {
  while(sharedMoments.hasChildNodes()){
    sharedMoments.removeChild(sharedMoments.lastChild);
  }
}

function updateUI(data){
  for(var i=0; i< data.length; i++){
    clearCard();
    createCard(data[i]);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';

  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClick)
  // cardSupportingText.appendChild(cardSaveButton);
  
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMoments.appendChild(cardWrapper);
}

// Not in use - Allows to cache content based on click event, on Demand
/*
function onSaveButtonClick(event){
  console.log('clicked');
  if('caches' in window){
    caches.open('user-requested')
      .then(function(cache){
        cache.addAll([
          'https://httpbin.org/get',
          '/src/images/sf-boat.jpg'
        ]);
      });
  }
}
*/

var url = 'https://pwagram-1e19f.firebaseio.com/posts.json';
var networkData = false;

//Page fetching the data from web using SW
fetch(url)
  .then(function(res){
    return res.json();
  })
  .then(function(data){
    networkData = true;
    console.log("From web", data);
    var dataArray = [];
    for(var key in data){
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
});


//Page getting data from cache directly
if('indexedDB' in window){
  readAllData('posts')
    .then(function(data){
      if(!networkData){
        console.log('From cache', data);
        updateUI(data);
      }
    })
}

form.addEventListener('submit', function(event) {
  event.preventDefault();
  if(titleInput.value.trim() === '' || locationInput.value.trim() === ''){
    alert('Please enter valid data');
    return;
  }
  closeCreatePostModal();

  if('serviceWorker' in navigator && 'SyncManager' in window){
    navigator.serviceWorker.ready
      .then(function(sw) {
        sw.sync.register('sync-new-post');
      });
  }
})
