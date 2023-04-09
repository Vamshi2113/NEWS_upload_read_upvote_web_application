const { json } = require("body-parser");




function click(x){

    if(x==1){
        x=0
        return x;
    }
    if(x==0){
        x=1
        return x;
    }
    if(x===undefined){
        return 1
    }


}

function f(event){
    alert(load)

    var source =event.target;
    var data=source.value;

    var sourceid="button"+data;

    let elementx=document.getElementById(sourceid)

    elementx.style.backgroundImage = "url('../static/images/slide-up-50-1.png')"
}


function clicked(event){



    var source =event.target;
    
  
    var data=source.value;

    var sourceid="button"+data;



    let elementx=document.getElementById(sourceid)
    let st=elementx.name;
   

    const xhr = new XMLHttpRequest();

    xhr.open('POST','/trendingm', true);

    xhr.getResponseHeader('Content-Type','application/json')


    xhr.onprogress = function(){
        console.log('On progress');
    }

    xhr.onreadystatechange = function () {
             console.log('ready state is ', xhr.readyState);
    }


    
    xhr.onload = function () {
        if(this.status === 200){

            console.log(JSON.parse(this.responseText));
            v=JSON.parse(this.responseText);
            output=v.upvotes;

            var element=document.getElementById(data);
            

            element.innerHTML=output
           
           
            
        }
        else{
            console.log("Some error occured")
        }
    }

     // send the request
     params = {_id:data,state:st};

     params=JSON.stringify(params)
     
     xhr.send(params);
 
     console.log("We are done!");


    
     if(elementx.name==0){
        elementx.style.backgroundImage = "url('../static/images/slide-up-50-1.png')"
        elementx.name=1
    
    }
     else if(elementx.name==1){
        elementx.style.backgroundImage = "url('../static/images/slide-up-50-0.png')"
        elementx.name=0}
    







 
 }



 function unclicked(event){

    alert('unclicked');
 }










