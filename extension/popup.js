//cái này chạy này
async function scrapePage(){
  
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
      const element = allElement[index].innerText.trim();
      pairs.add(element)
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
      fetch(url, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({"comment": content})
      })
      .then((response) => response.json())
      .then((json)=> {
        toxic_score = json[0]
        if(toxic_score>=0.7){
          cases.push(content); 
          //lưu mảng lại vào máy
          chrome.storage.local.set({"content":cases});
          
          if(content==last_item){
            console.log(cases);
          }
        }
      });
    }
    console.log(pairs.size);
      
}

function blur_text(){
  
  var span = document.getElementsByTagName('span');
  for (let index = 0; index < span.length; index++) {
    var element = span[index];
    element.parentNode.removeChild(element)
  }
  
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
      console.log(result.content)
      if(result.content.includes(element.innerText.trim())){
        console.log(element)
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
    //cái ô text
    let text = document.getElementById('toxic')
    text.innerHTML = "Loading..."

    //dòng chữ trên nút
    let run = document.getElementById("check")
    run.innerHTML = "<b>&#127795;Running&#127795;	</b>"
    
    //spam đổi text trong ô text
    setTimeout(()=>{
      setInterval(()=>{
        chrome.storage.local.get("content", function(result){
          //alert(JSON.stringify(result.content));
          text.innerHTML = ""
          for (const line of result.content){
            
            run.innerHTML = `<b>&#127795;Detected ${result.content.length} case(s)!&#127795;	</b>`
            text.innerHTML = text.innerHTML+ `<p>${JSON.stringify(line.trim()).replace(/(\\+n)/g, '')}</p>` + '\n\n';
          }
        });
      }, 500)
    },300)

    //lấy trang hiện tại
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    
    
    //Excecute script chạy cái func trên cùng
    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: scrapePage
    })
    
    
    
    
})

let makeBlur = document.getElementById('make_blur');
makeBlur.addEventListener("click",async()=>{
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: blur_text
  })
})




