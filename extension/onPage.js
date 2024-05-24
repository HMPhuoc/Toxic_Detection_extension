async function scrapePage(tab_url){
  
    console.log(tab_url)
    const pairs = new Set()
    
    let allElement = await document.body.getElementsByTagName('*');
    for await(const ele of allElement) {
      // if(ele.tagName == "script"){
      //   continue
      // }

      // if(Boolean(ele.children.length)){
      //   const text = ele.text
      //   if(typeof text == 'string'){
      //     pairs.add(ele.innerText)
      //   }
      //   continue
      // }
      
      // const element = ele.innerText;
      // //console.log(`Scraped ${index} element`)
      // if(typeof element == 'string'){
      //   //console.log(element)
      //   pairs.add(element)
      // }

      for(let i = 0; i<ele.childNodes.length;i++){
        if(ele.childNodes[i].nodeType === Node.TEXT_NODE){
          pairs.add(ele.childNodes[i].textContent.trim())
        }
        if(ele.childNodes[i].nodeName === "BR"){
          pairs.add(ele.textContent.trim())
        }
        // if(ele.childNodes[i].nextSibling.nodeName === "BR"){
        //   let wrapper = document.createElement('div')
        //   wrapper.textContent = ele.childNodes[i].textContent
        //   ele.replaceChild(wrapper, ele.childNodes[i])
        // }
      }
    }  

    console.log(pairs.size);
    console.log(pairs)

    const arr = Array.from(pairs);
    //console.log(arr);

    url = 'https://hmphuoc-toxic.hf.space/check'
    let cases = []
    let s_cases = []
    // let last_item = arr[arr.length-1];



    const promises = await Promise.all(arr.map(content=>fetch(url,{
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({"comment": content.trim()})
    })))

    const resArr = await Promise.all(promises.map(p=>p.json()))

    console.log(promises)
    console.log(resArr)

    for await(res of resArr){
      index = resArr.indexOf(res)
      const text = arr[index]
      if(document.visibilityState == "visible"){
        if(res[0]>=0.5&&res[0]<0.7){
          cases.push(text)
        }
        if(res[0]>=0.7){
          s_cases.push(text)
        }
        chrome.storage.local.set({"content":cases,"s_content":s_cases});
      }
      
    }


    
    // for(const content of arr){

    //   //console.log(content)
    //   await fetch(url, {
    //     method: "POST",
    //     headers: {
    //       "Content-type": "application/json; charset=UTF-8"
    //     },
    //     body: JSON.stringify({"comment": content.trim()})
    //   })
    //   .then((response) => response.json())
    //   .then((json)=> {
    //     if(document.visibilityState == "visible"){
    //       toxic_score = json[0]
    //       if(toxic_score>=0.5 && toxic_score<0.7){
              
    //           cases.push(content); 
          
              
    //         }
    //       if(toxic_score>=0.7){
            
    //         s_cases.push(content); 
            
    //       }
            
    //       chrome.storage.local.set({"content":cases,"s_content":s_cases});

    //     }
    //   });
    // }
    
    
    return "Done";
      
}


function blur_text(){

  console.log('blur')
  let allElement = document.body.getElementsByTagName('*');
  for (const element of allElement) {
    
    for(let i = 0; i<element.childNodes.length;i++){
      if(element.childNodes[i].nodeType === Node.TEXT_NODE){
        chrome.storage.local.get(["content","s_content"], (result)=>{
          //console.log(result.content)
          //console.log(result.s_content)
          if(result.content.includes(element.childNodes[i].textContent.trim())){
            //console.log(element)
            element.style.color = "red"
          }
          if(result.s_content.includes(element.childNodes[i].textContent.trim())){
            //console.log(element)
            element.style.color = "transparent"
          }
        })
      }
      if(element.childNodes[i].nodeName === "BR"){
        chrome.storage.local.get(["content","s_content"], (result)=>{
          //console.log(result.content)
          //console.log(result.s_content)
          if(result.content.includes(element.textContent.trim())){
            //console.log(element)
            element.style.color = "red"
          }
          if(result.s_content.includes(element.textContent.trim())){
            //console.log(element)
            element.style.color = "transparent"
          }
        })
      }
    }
    
  }

  
}