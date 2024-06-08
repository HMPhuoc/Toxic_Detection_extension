//Tìm các đoạn toxic
let scrape = document.getElementById('scrapePage');
scrape.addEventListener("click", async()=>{
    
    chrome.storage.local.clear()

    chrome.storage.local.set({"content":["Nothing has been found!"],"s_content":[]});
    let t1 = new Date()
    let bt_text = document.getElementById("button_text")
    bt_text.innerText = "Finding"

    scrape.disabled = true;
    let url = 'https://hmphuoc-toxic.hf.space/check'
    let check = document.getElementsByName("scan")
    
    for(let radio of check){
      radio.disabled=true
      if(radio.checked){
        url=`https://hmphuoc-toxic.hf.space/${radio.value}`
      }
    }
    
    let text = document.getElementById('toxic')
    text.innerHTML = "Loading..."
    
    //let run = document.getElementById("check")
    
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    // let url = 'https://hmphuoc-toxic.hf.space/check'
    // if(checkPlus.checked){
    //   url = 'https://hmphuoc-toxic.hf.space/checkplus'
    // }
    //run.innerHTML = `<b>&#127795; Running on ${url} &#127795;	</b>`
    let count = document.getElementById("count")
        
    chrome.scripting.executeScript({
      args: [url],
      target: {tabId: tab.id},
      func: scrapePage
    })
    .then(returnRes=>{
      bt_text.innerText = "Done"
      scrape.disabled = false
      for(let radio of check){
        radio.disabled = false
      }
      chrome.storage.local.get(["content","s_content"], function(result){
 
        text.innerHTML = ""
        let all_result = result.content.concat(result.s_content)
        for (const line of all_result){
          if(result.content!="Nothing has been found!"){
            count.innerText = all_result.length
            //run.innerHTML = `<b>&#127795;Detected ${all_result.length} case(s)!&#127795;	</b>`
          }
          text.innerHTML = text.innerHTML+ `<p>${JSON.stringify(line.trim()).replace(/(\\+n)/g, '')}</p>` + '\n\n';
        }
      });

      let t2 = new Date()
      var diff = Math.abs(t2-t1)/1000
      //run.innerHTML = run.innerHTML + `<b>Done</b>`
      for(const res of returnRes){
        alert(`Finished scanning! Took ${diff}s`)
      }
    })
   
})

//Tô các đoạn toxic
let makeBlur = document.getElementById('make_blur');
makeBlur.addEventListener("click",async()=>{
  
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  let url = tab.url
  chrome.scripting.executeScript({
    args: [url],
    target: {tabId: tab.id},
    func: blur_text
  })
})


//Tab nhập văn bản kiểm tra
window.addEventListener("DOMContentLoaded", (event) => {
  let check = document.getElementById('check_word');
  let url = 'https://hmphuoc-toxic.hf.space/check'


  let chart
  if(check){
    check.addEventListener("click", async()=>{
      
      let checkPlus = document.getElementsByName("checkword")  
      for(let radio of checkPlus){
        if(radio.checked){
          url=`https://hmphuoc-toxic.hf.space/${radio.value}`
        }
      }
      let text = document.getElementById("word").value;
      console.log(text)
      // let url = 'https://hmphuoc-toxic.hf.space/check'
      // if(checkPlus.checked){
      //   url = 'https://hmphuoc-toxic.hf.space/checkplus'
      // }

      fetch(url, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({"comment": text.trim()})
      })
      .then((response) => response.json())
      .then((json)=> {
        let toxic_score = json
        let box = document.getElementById('word_box');
          box.innerText=`
          This case has the values of:
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
                hoverBackgroundColor: "rgba(46,46,255,1)",
                hoverBorderColor: "black",
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

//Chuyển tab
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


