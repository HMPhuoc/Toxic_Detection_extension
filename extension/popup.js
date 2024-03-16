//cái này chạy này
function scrapePage(tab_url){
  
    console.log(tab_url)
    // bắt đầu từ đoạn này là quét nd
    // const IGNORE = ["style", "script"]
    // const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    // const pairs = new Set()
    // let node
    // while ((node = walker.nextNode()) !== null) {
    //     const parent = node.parentNode.tagName;
      
    //     if (IGNORE.includes(parent.toLowerCase())) {
    //       continue;
    //     }
      
    //     const value = node.nodeValue;
      
    //     if (value.length == 0) {
    //       continue;
    //     }
    //     pairs.add(value);
    //   }

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
    //tới đây

    //fetch lên check toxic
    url = 'https://hmphuoc-toxic.hf.space/check'
    var cases = []
    let last_item = arr[arr.length-1];

    for (const content of arr){
      
      

      // console.log(content)
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
          if(toxic_score>=0.7){
              
              cases.push(content); 
            
            //lưu mảng lại vào máy
            chrome.storage.local.set({"content":cases});
            //console.log(cases);
            
          }

        }
      });
    }
    console.log(pairs.size);
      
}

function blur_text(tab_url){
  
  // var span = document.getElementsByTagName('span');
  // for (let index = 0; index < span.length; index++) {
  //   var element = span[index];
  //   element.parentNode.removeChild(element)
  // }
  
  // var breaks = document.getElementsByTagName('br');
  // for (let index = 0; index < breaks.length; index++) {
  //   var element = breaks[index];
  //   element.parentNode.removeChild(element)
  // }

  console.log('blur')
  var allElement = document.body.getElementsByTagName('*');
  for (let index = 0; index < allElement.length; index++) {
    const element = allElement[index];
    
    // if(element.tagName.toLowerCase()==='span'){
    //   element.parentNode.removeChild(element)
    // }
    // if(element.tagName.toLowerCase()==='br'){
    //   console.log(element);
    //   element.parentNode.removeChild(element)
    // }
    chrome.storage.local.get("content", (result)=>{
      //console.log(result.content)
      if(result.content.includes(element.innerText)){
        //console.log(element)
        element.style.color = "red"
      }
    })
  }
  // document.body.getElementsByTagName('*').forEach((element)=>{
  //   console.log(element);
  //   chrome.storage.local.get("content",(result)=>{
  //       console.log(element);
  //       if(result.content.includes(element.innerHTML)){
  //         //let style = getComputedStyle(element)
  //         //console.log(style)
  //         console.log(element.innerHTML)
  //         console.log(element)
  //         //console.log(result.content);
  //         //style.color = 'transparent';
  //         element.style.color = 'transparent'
  //       }
  //     })
  //   })
  
}

// cái nút
let scrape = document.getElementById('scrapePage');

//sự kiện nhấn nút
scrape.addEventListener("click", async()=>{
    

    chrome.storage.local.set({"content":["Text will be shown here"]});

    //cái ô text
    let text = document.getElementById('toxic')
    text.innerHTML = "Loading..."

    //dòng chữ trên nút
    let run = document.getElementById("check")
    
    //lấy trang hiện tại
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    url = tab.url
    run.innerHTML = `<b>&#127795; Running on ${url} &#127795;	</b>`
    
    //spam đổi text trong ô text
    setTimeout(()=>{
      setInterval(()=>{
        
        chrome.storage.local.get("content", function(result){
          //alert(JSON.stringify(result.content));
          text.innerHTML = ""
          for (const line of result.content){
            if(result.content!="Text will be shown here"){
              run.innerHTML = `<b>&#127795;Detected ${result.content.length} case(s)!&#127795;	</b>`
            }
            text.innerHTML = text.innerHTML+ `<p>${JSON.stringify(line.trim()).replace(/(\\+n)/g, '')}</p>` + '\n\n';
          }
        });
      }, 50)
    },30)

    
    //Excecute script chạy cái func trên cùng
    chrome.scripting.executeScript({
      args: [url],
      target: {tabId: tab.id},
      func: scrapePage
    })
    
    
    
    
})

let makeBlur = document.getElementById('make_blur');
makeBlur.addEventListener("click",async()=>{
  stop_loop = true
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
                  ticks: {
                    color: "rgba(255, 255, 255, 1)",
                    stepSize: 0.1,
                    beginAtZero: true,
                    max: 1
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


