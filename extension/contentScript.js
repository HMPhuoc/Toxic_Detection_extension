function scrape(){
    var body = document.querySelector('body');
    var allText = body.innerText;
    
    var separated = allText.split('\n')

    chrome.runtime.sendMessage({text: separated.length})
}

scrape()