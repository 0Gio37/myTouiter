const userId = document.querySelector("#form-control-pseudo");
const saisiText = document.querySelector("#form-control-message");
const butAjout = document.querySelector("#btn-primary");
const depotNote = document.querySelector(".touit-list");

let addComm = document.querySelector(".btn-touit-comment");
let articleOrder = 0;
let currenTs = 0;


//ajout touit DOM
const addTouit = function(messageIndex, userIndex, currenTs, idIndex) {
    
    const creArticle = document.createElement("article");
    creArticle.classList.add("touit-item");

    const zoneDate = document.createElement("p");
    zoneDate.classList.add("user-date");
    let convDate = new Date(currenTs*1000);
    let utc1 = convDate.toLocaleDateString("fr-FR");
    zoneDate.textContent = utc1 +' - '+ convDate.toLocaleTimeString();

    const zoneText = document.createElement("p");
    zoneText.classList.add("user-message");
    zoneText.textContent = messageIndex;

    const zoneUser = document.createElement("p");
    zoneUser.textContent = userIndex;
    zoneUser.classList.add("user-pseudo");

    const divButt = document.createElement("div");
    divButt.classList.add("btn-touit");

    const buttComm = document.createElement("button");
    buttComm.classList.add("btn-touit-comment");

    const buttLike = document.createElement("button");
    buttLike.classList.add("btn-touit-like");

    //ajout et remove de like des touits
    let buttLikeDisabled = 0;
    buttLike.addEventListener('click', function toggleLike () {
        if (buttLikeDisabled === 0){
            buttLikeDisabled =1;
            buttLike.style.backgroundColor="rgb(196, 147, 32)"
            buttLike.style.borderColor="rgb(196, 147, 32)"
            let message_id = "message_id="+idIndex;
            const posted = new XMLHttpRequest();
            posted.open("PUT", "http://touiteur.cefim-formation.org/likes/send", true);
            posted.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            posted.send(message_id)
        } else {
            buttLikeDisabled = 0;
            buttLike.style.backgroundColor="rgb(49, 47, 47)";
            let message_id = "message_id="+idIndex;
            const removed = new XMLHttpRequest();
            removed.open("DELETE", "http://touiteur.cefim-formation.org/likes/remove", true);
            removed.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            removed.send(message_id)
        }
    })

    creArticle.style.order = articleOrder;
    
    divButt.appendChild(buttComm);
    divButt.appendChild(buttLike);
    creArticle.appendChild(zoneDate);
    creArticle.appendChild(zoneText);
    creArticle.appendChild(zoneUser);
    creArticle.appendChild(divButt);
    depotNote.appendChild(creArticle);  
};

// get touit
function getTouit (success, error){
    const request = new XMLHttpRequest();
    request.open("GET", "http://touiteur.cefim-formation.org/list?ts="+ currenTs, true);
    request.addEventListener("readystatechange", function(){
        if (request.readyState === XMLHttpRequest.DONE){
            if (request.status === 200){
                const response = JSON.parse(request.responseText);
                success(response)
            } else {
                error();
            }
        } 
    });
    request.send();
}

//refresh page touit
setInterval (function () {
    getTouit(
        function(respDom){
            let arrayMsg = respDom.messages;
            for (i=0; i<arrayMsg.length; i++){
                let messageIndex = arrayMsg[i].message;
                let userIndex = arrayMsg[i].name;
                let tsIndex = arrayMsg[i].ts;
                let idIndex= arrayMsg[i].id;
                if (tsIndex > currenTs){
                    currenTs = tsIndex;
                    articleOrder -= 1
                }
                addTouit(messageIndex, userIndex, currenTs, idIndex);
            }
        }
        ,
        function () {
            console.log("error")
        }
    )}
    , 3000);

//post touit
function postTouit(e){
    e.preventDefault();
    const returnPost = successPost();
    const posted = new XMLHttpRequest();
    posted.open("POST", "http://touiteur.cefim-formation.org/send", true);
    posted.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    posted.addEventListener("readystatechange", function(){
        if (posted.readyState === XMLHttpRequest.DONE){
            if (posted.status === 200){
                console.log('ok')
            } else {
                console.log("error")
            }
        } 
    });
    posted.send(returnPost);
}
function successPost(){
    let postUser = userId.value;
    let postText  = saisiText.value;
    let postComplet = "name="+postUser+"&message="+postText;
    return postComplet;
}
butAjout.addEventListener('click', postTouit);


//ajout des touits les plus likes
function getBestLikeTouit(success, error){
    const requestBest = new XMLHttpRequest();
    requestBest.open("GET", "http://touiteur.cefim-formation.org/likes/top?count="+ 5, true);
    requestBest.addEventListener("readystatechange", function(){
        if (requestBest.readyState === XMLHttpRequest.DONE){
            if (requestBest.status === 200){
                const response = JSON.parse(requestBest.responseText);
                success(response)
            } else {
                error();
            }
        } 
    });
    requestBest.send();
}
getBestLikeTouit(
    function (responseBestLike){
        const bestLikeContainer = document.querySelector(".like-items")
        let arrayTop = responseBestLike.top;
        for (i=0; i<arrayTop.length; i++){
            const p = document.createElement('p')
            p.textContent = " \"  "  +arrayTop[i].message+  " \" "
            bestLikeContainer.appendChild(p)
        }
    }
    ,
    function (){
        console.log("error")
    }
)


//ajout liste influenceurs
function bestInfluent(success, error){
    const requestInf = new XMLHttpRequest();
    requestInf.open("GET", "http://touiteur.cefim-formation.org/influencers?count=5", true);
    requestInf.addEventListener("readystatechange", function(){
        if (requestInf.readyState === XMLHttpRequest.DONE){
            if (requestInf.status === 200){
                const response = JSON.parse(requestInf.responseText);
                success(response)
            } else {
                error();
            }
        } 
    });
    requestInf.send();
}
bestInfluent(
    function (responseBestInf){
        const bestInfluContainer = document.querySelector(".influ-items")
        let recup = responseBestInf.influencers
        for (i in recup){
            const p = document.createElement('p')
            p.textContent = ' " '+i+' " '
            bestInfluContainer.appendChild(p)
        }
    }
    ,
    function (){
        console.log("error")
    }
)

//ajout trending
function trending (success, error){
    const requestTrend = new XMLHttpRequest();
    requestTrend.open("GET", "http://touiteur.cefim-formation.org/trending", true);
    requestTrend.addEventListener("readystatechange", function(){
        if (requestTrend.readyState === XMLHttpRequest.DONE){
            if (requestTrend.status === 200){
                const response = JSON.parse(requestTrend.responseText);
                success(response)
            } else {
                error();
            }
        } 
    });
    requestTrend.send();
}
trending(
    function (responseTrend){
        const bestTrendContainer = document.querySelector(".trend-items")
        let tbTrendCount = [];

        for (let i in responseTrend){
            tbTrendCount.push(responseTrend[i])
        }

        let tbOrderDescroissant = tbTrendCount.sort(function(a,b){
            return b - a
        })

        for (let k=0; k<3; k++){
            for (let j in responseTrend){
                if (responseTrend[j] === tbOrderDescroissant[k]){
                    const p = document.createElement('p')
                    p.textContent = ' " '+j+' " '
                    bestTrendContainer.appendChild(p)
                }
            }
        }

    }
    ,
    function (){
        console.log("error")
    }
)