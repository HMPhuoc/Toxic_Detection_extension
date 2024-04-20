function scrapePage(tab_url){
  
    console.log(tab_url)
    const pairs = new Set()
    
    let allElement = document.body.getElementsByTagName('*');
    for (let index = 0; index < allElement.length; index++) {
      const element = allElement[index].innerText;
      //console.log(`Scraped ${index} element`)
      if(typeof element == 'string'){
        //console.log(element)
        pairs.add(element)
      }
    }  

    const arr = Array.from(pairs);
    console.log(arr);

    url = 'https://hmphuoc-toxic.hf.space/check'
    var cases = []
    var s_cases = []
    let last_item = arr[arr.length-1];

    for (const content of arr){

      console.log(content)
      fetch(url, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({"comment": content.trim()})
      })
      .then((response) => response.json())
      .then((json)=> {
        if(document.visibilityState == "visible"){
          toxic_score = json[0]
          if(toxic_score>=0.5 && toxic_score<0.7){
              
              cases.push(content); 
            
              
            }
          if(toxic_score>=0.7){
            
            s_cases.push(content); 
            
            
          }
            
          chrome.storage.local.set({"content":cases,"s_content":s_cases});

        }
      });
    }
    
    console.log(pairs.size);
      
}

function blur_text(){

  console.log('blur')
  var allElement = document.body.getElementsByTagName('*');
  for (let index = 0; index < allElement.length; index++) {
    const element = allElement[index];
    
    chrome.storage.local.get(["content","s_content"], (result)=>{
      console.log(result.content)
      console.log(result.s_content)
      if(result.content.includes(element.innerText)){
        //console.log(element)
        element.style.color = "red"
      }
      if(result.s_content.includes(element.innerText)){
        //console.log(element)
        element.style.color = "transparent"
      }
    })

    // chrome.storage.local.get("s_content", (result)=>{
    //   console.log(result.content)
    //   // if(result.content.includes(element.innerText)){
    //   //   //console.log(element)
    //   //   element.style.color = "transparent"
    //   // }
    // })
  }

  
}

let scrape = document.getElementById('scrapePage');

scrape.addEventListener("click", async()=>{
    
    chrome.storage.local.clear()

    chrome.storage.local.set({"content":["Text will be shown here"],"s_content":[]});

    let text = document.getElementById('toxic')
    text.innerHTML = "Loading..."

    let run = document.getElementById("check")
    
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    url = tab.url
    run.innerHTML = `<b>&#127795; Running on ${url} &#127795;	</b>`
    
    setTimeout(()=>{
      setInterval(()=>{
        
        chrome.storage.local.get(["content","s_content"], function(result){
 
          text.innerHTML = ""
          all_result = result.content.concat(result.s_content)
          for (const line of all_result){
            if(result.content!="Text will be shown here"){
              run.innerHTML = `<b>&#127795;Detected ${all_result.length} case(s)!&#127795;	</b>`
            }
            text.innerHTML = text.innerHTML+ `<p>${JSON.stringify(line.trim()).replace(/(\\+n)/g, '')}</p>` + '\n\n';
          }
        });
      }, 50)
    },30)

    
    chrome.scripting.executeScript({
      args: [url],
      target: {tabId: tab.id},
      func: scrapePage
    })
    
    
})

let makeBlur = document.getElementById('make_blur');
makeBlur.addEventListener("click",async()=>{
  
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  url = tab.url
  chrome.scripting.executeScript({
    args: [url],
    target: {tabId: tab.id},
    func: blur_text
  })
})


window.addEventListener("DOMContentLoaded", (event) => {
  let check = document.getElementById('check_word');
  let chart
  if(check){
    check.addEventListener("click", async()=>{
      
      text = document.getElementById("word").value;
      console.log(text)
      url = 'https://hmphuoc-toxic.hf.space/check'
    
      fetch(url, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({"comment": text.trim()})
      })
      .then((response) => response.json())
      .then((json)=> {
        toxic_score = json
        let box = document.getElementById('word_box');
          box.innerText=`
          This case "${text}" has the value:
          toxic: ${toxic_score[0].toFixed(2)}
          severe toxic: ${toxic_score[1].toFixed(2)}
          obscene: ${toxic_score[2].toFixed(2)}
          threat: ${toxic_score[3].toFixed(2)}
          insult: ${toxic_score[4].toFixed(2)}
          identity hate: ${toxic_score[5].toFixed(2)}
          `
          var chartElement = document.getElementById('chart')
          chartElement.getContext('2d').clearRect(0, 0, chartElement.width, chartElement.height)
          var config = {
            type: "bar",
            data: {
              labels: ["toxic", "severe toxic", "obscene", "threat", "insult", "identity hate"],
              datasets: [{ 
                label: "Toxic Detect",
                data: toxic_score,
                backgroundColor: "rgba(255, 255, 255, 1)",
                borderColor: "rgba(0, 0, 0, 1)",
                borderWidth: 1,
                hoverBackgroundColor: "rgba(232,105,90,1)",
                hoverBorderColor: "orange",
              }]
            },
            options: {
              plugins: { 
                legend: {
                  labels: {
                    color: "rgba(255, 255, 255, 1)"
                  }
                }
              },
              scales: {
                y: {
                  max: 1,
                  ticks: {
                    color: "rgba(255, 255, 255, 1)",
                    stepSize: 0.1,
                    beginAtZero: true
                  }
                },
                x: {
                  ticks: {
                    color: "rgba(255, 255, 255, 1)",
                    stepSize: 1,
                    beginAtZero: true
                  }
                }
              }
            }
          }
          if(chart){
            chart.clear()
            chart.destroy()
            chart = new Chart(chartElement, config)
          }
          else{
            chart = new Chart(chartElement, config)
          }
      });
    
    })

  }
});




document.querySelectorAll('button.tablinks').forEach(bt => 
  {
  bt.onclick = e =>
    {
    let btGroup = bt.closest('div')
    btGroup.querySelectorAll('button.tablinks').forEach( gBt => 
      gBt.classList.toggle('active', gBt===bt))
      
    btGroup.querySelectorAll('div.tabcontent').forEach( gDv => 
      gDv.classList.toggle('open', gDv.id===bt.dataset.tab))
    }
  })


