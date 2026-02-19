'use strict';


{
const wall = document.querySelector('.wall');
const submit = document.querySelector('.submit');
const timer = document.querySelector('.timer');
const answerInput = document.querySelector('.answerInput');
const mainlogo = document.querySelector('.mainlogo');
const ul = document.getElementById("cardContainer");
const titleContaier = document.querySelector("#titleContaier");
const skullConteainer = document.querySelector("#skullConteainer");
const openingText = document.querySelector(".openingText");
const clearText = document.querySelector(".clearText");
const tipsBox = document.querySelector(".tipsBox");//ヒント
const tipsText = document.querySelector(".tipsText");
const fires = document.querySelector(".fires");
const allCorrectNum = 12 ;//本来12


createCard();
const cards = document.querySelectorAll(".card")

let state = "opening"//[,"opening","game","gameover","clear"];
let openingTextsCount = 0;
let clearTextsCount = 0;
let openingSoundFlag = true;
let gameStartFlag = true;
let mistakNum = 0;
let answeredNum = [];
let timerIntervalID = null;
let BGMSound = null;

//全体をクリック
document.addEventListener("click", (e) => {
    if (state == "opening") {
        if (openingSoundFlag){
            openingSoundStart();
            createFires(fires);
        }

        if (openingTextsCount < openingTexts.length){
            openingTextChange(openingTextsCount);
            
        }else {
            state = "game";
            mainLogoFadeIn();  
            skullLaughter();
        }
        
    } else if (state == "game") {

        if (gameStartFlag){
            gameStart();
            timerIntervalID = setInterval(countDown,1000);
        }
        
        if(e.target.classList.contains("card")){
            //カードが押された処理
            pushCard(e.target);

        } else if (e.target.classList.contains("submit")){
            // サブミットが押された処理
            let corsArr = corrects[Number(answerInput.dataset.correctNum)- 1];
            // 小文字を大文字に
            const ans = answerInput.value.toUpperCase();

            if (corsArr.includes(ans)){
                // 正解のアクション・カード回転・サウンド再生・文字出力
                correctAction();
            } else {
                // 間違いサウンド再生・揺れ・
                incorrectAction();
            }

            //全12カード正解時宝箱出現
            if (answeredNum.length == allCorrectNum){
                //全問正解の演出・鍵を探す問題を出現
                gameClear();
            }
            

        } else if (e.target.classList.contains("tipsBtn")){
            //ヒントのボタンが押された時
            tipsTextOpen();
        
        } else if (e.target.classList.contains("close")){
            //閉じるが押された時
            answersClose();
        }

    } else if (state == "gameclear") {

        if (clearTextsCount < clearTexts.length){
            clearTextChange(clearTextsCount);
        } else if (clearTextsCount == clearTexts.length){
            fadeOutSkull();
            FadeInOutTakara();
            setTimeout(()=> {
                lastQuizAction();
            },4000);
            clearTextsCount++;
        }

        if (e.target.classList.contains("keyIcon")){
            //閉じるが押された時
            FadeInOutTakara();
        }

    } else if (state == "wait" || state == "gameover") {

    }  

}, { passive: true });

window.addEventListener("load", () => {
    localStorage.setItem('key', 'value1');
    document.getElementById('loading')?.classList.add('is-hidden');
});
window.addEventListener("load", updateOrientationUI);
window.addEventListener("resize", updateOrientationUI);
window.addEventListener("orientationchange", updateOrientationUI);
function updateOrientationUI(){
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  document.body.classList.toggle("is-portrait", isPortrait);
}



//ゲームをクリアした際 1回きりの関数
function gameClear(){
    // 紙吹雪
    loop();
    const confetti = document.querySelector(".confetti");
    confetti.classList.add("action");

    //クリアのロゴを出現
    const gameclearLogo = document.querySelector(".gameclearLogo");
    gameclearLogo.classList.add("action");

    //クリアのロゴをしまう
    setTimeout(()=> {
        gameclearLogo.classList.remove("action");
    },4000); 

    //タイマーをストップ
    clearInterval(timerIntervalID);

    //クリアの音楽を再生
    SoundFadeOut(BGMSound);
    const gameclearSound = new Audio('sound/gameclear.mp3');
    gameclearSound.volume = 0.4;
    setTimeout(()=> {gameclearSound.play();},1000);
    
    
    // 黒い画面が登場で骸骨が喋る
    setTimeout(()=> {
        skullAction();
    },7000);
    

    // 宝の地図と左下の再度見るのアイコンを常時表示
    // 骸骨のアクションが出た後に出したいため
    setTimeout(()=> {
        const keyIcon = document.querySelector(".keyIcon");
        keyIcon.classList.add("action");
    },10000);
    
}


// 骸骨のアクション
function skullAction(){
    //骸骨の笑い声を再生
    skullLaughter();

    // クリア時間を計測して最後の文章に代入
    let [rest_hour ,rest_minutes] = timer.textContent.split(':').map(n => Number(n));
    let minutes = (rest_minutes == 0) ? 0 : 60-rest_minutes;
    let hour = (rest_minutes == 0) ? rest_hour - 1: rest_hour;
    clearTexts[4] = clearTexts[4].replace("rest_hour", String(rest_hour));
    clearTexts[4] = clearTexts[4].replace("rest_minutes", String(rest_minutes));
    clearTexts[1] = clearTexts[1].replace("hour", String(29-hour));
    clearTexts[1] = clearTexts[1].replace("minutes", String(minutes));

    setTimeout(()=> {
        skullConteainer.classList.add("action");
        skullSoundStart();
        let clearFires = document.querySelector(".clearFires");
        clearFires.classList.add("fires");
    },3000);
}

function skullLaughter(){
    //骸骨の笑い声を再生
    const sound = new Audio('sound/laughter.mp3');
    sound.volume = 0.4;
    sound.playbackRate = 0.5;
    sound.play();
}

// 最後のクイズ
function lastQuizAction(){
    // BGMサウンド再生
    BGMSound.pause();
    BGMSound = new Audio('sound/lastQuizSound.mp3');
    BGMSound.volume = 0.2;
    BGMSound.play();

    timerIntervalID = setInterval(countDown,1000);
}

function fadeOutSkull(){
    const gameclear = document.querySelector("#gameclear");
    gameclear.classList.add("fadeOut");
    SoundFadeOut(BGMSound);
}


function FadeInOutTakara(){
    // 宝の地図と左下の再度見るのアイコンを常時表示
    const takara = document.querySelector("#takara");
    takara.classList.add("action");
    setTimeout(()=> {
        takara.classList.remove("action");
    },5000);//8秒
}

//時間切れ
function gameoverOpen(){
    const gameoverSound = new Audio('sound/gameover.mp3');
    gameoverSound.volume = 0.5;
    gameoverSound.play();
    const gameover = document.getElementById("gameover");
    gameover.classList.add("action");
    state = "gameover";
    SoundFadeOut(BGMSound);
}


//ヒントのボタンが押された時
function tipsTextOpen(){
    const num = Number(answerInput.dataset.correctNum)-1 ;
    tipsText.innerHTML = "";
    textFadeIn(tipsTexts[num],0,tipsText);
    doubleTapDrop(state,1000);
}

//カードが押された処理
function pushCard(target){
    removeAnserClass();
    answerInput.value = "";
    if(!target.classList.contains("rotate")){
        cardClickSound();
        sleep(300).then(() => {
            answersOpen(target.dataset.cardNum,personName[Number(target.dataset.person)]);
        });
        target.classList.add("answer");
    } 
}

// ダブルタップを防ぐため
function doubleTapDrop(nowState,time){
    if(state != "wait"){
        state = 'wait'
        sleep(time).then(() => {
            state = nowState;
        });
    }
}

// オープニングテキストを変更していく
function openingTextChange(count){
    openingText.innerHTML = "";
    textFadeIn(openingTexts[count],100,openingText);
    let waitTime = 100 * (openingTexts[count].length + 10);
    openingTextsCount++;
    doubleTapDrop(state,waitTime);
}

// オープニングテキストを変更していく
function clearTextChange(count){
    clearText.innerHTML = "";
    textFadeIn(clearTexts[count],100,clearText);
    let waitTime = 100 * (clearTexts[count].length + 10);
    clearTextsCount++;
    doubleTapDrop(state,waitTime);
}

function gameStart(){
    titleContaier.classList.add("start");
    gameStartFlag = false;
    document.querySelector('#titleContaier').remove(); 
}

//オープニングのフェードイン
function mainLogoFadeIn(){
    mainlogo.classList.add("action");
    document.querySelector('.sweep').classList.add("action");
    document.querySelector('.tapicon').classList.add("start");
    document.querySelector('.tapicon').src = "img/start.png";
    openingText.innerHTML = "";
    doubleTapDrop(state,3000);
}

//制限時間カウントダウン
function countDown(){
    let [hour ,minutes] = timer.textContent.split(':').map(n => Number(n));
    minutes--;
    minutes = (minutes < 0) ? 59 : minutes;
    if (minutes == 59){
        hour--;
    }
    if (hour < 0){
        [hour, minutes]= [0,0];
        
        clearInterval(timerIntervalID);
        setTimeout(() => {
            gameoverOpen();
        }, 1000);
    } else if (hour < 5){
        timer.style.color = "rgb(170, 0, 0)";
    }
    timer.textContent = String(hour).padStart(2, '0')+":"+String(minutes).padStart(2, '0');
    
    if (hour > 1 && hour % 5 == 0 && minutes == 0){
        timerSound();
    }

}

//5分毎に時計の音をフェードアウトしながらならす
function timerSound(){
    const timerSound = new Audio('sound/timer.mp3');
    let volume = 0.6
    timerSound.volume = volume;
    timerSound.play();
    let id = setInterval(() => {
        timerSound.volume = volume;
        volume = volume - 0.05;
        if (volume < 0.1){
            clearTimeout(id);
        }
    },1000);
}

//火の粉を作成する
function createFires(fires){
    const firesRect = fires.getBoundingClientRect();
    for (let i = 0 ;i < 20;i++){
        const span = document.createElement("span");
        const x = Math.round(Math.random()*firesRect.width);
        const dilaySeconds = Math.round((Math.random()* 5)*10)/10;
        const durationSeconds = 3 + (Math.round((Math.random()* 3)*10)/10);
        const size = 2 + Math.random()* 3;
        span.style.left = x+"px";
        span.style.animationDelay = dilaySeconds+"s";
        span.style.animationDuration = durationSeconds+"s";
        span.style.height = size+"px";
        span.style.width = size+"px";
        fires.appendChild(span);
    }
}

//答えが正解の時の関数
//カード回転・サウンド再生・文字出力
function correctAction(){
    const card = document.querySelector(".card.answer");
    const correctNum = Number(answerInput.dataset.correctNum);
    card.classList.add("rotate");
    setTimeout(() => {
        card.src =  "img/card_u.png";
    }, 300);
    // サウンド再生
    const correctSound = new Audio('sound/correct.mp3');
    correctSound.volume = 0.5;
    correctSound.play();

    // 隠し場所の出現文字変更(中)
    const cardMainText = card.parentNode.querySelector(".cardMainText");
    cardMainText.innerHTML = "";
    textFadeIn(hideSpaces[correctNum-1],1000,cardMainText);

    // 入力した答えの反映(下)
    const correct = card.parentNode.querySelector(".correct");
    correct.textContent = corrects[correctNum-1][0];

    // 答えたカードの裏面の子要素に答え済みのクラスを付与
    const children = Array.from(card.parentNode.children);
    for(const child of children){
        child.classList.add("answered");
    }
    
    answersClose();

    
    // ミスの回数を0に
    mistakNum = 0;

    answeredNum.push(correctNum);
    if (answeredNum.length == allCorrectNum){
        state = "gameclear";
    }
    // 連打防止
    doubleTapDrop(state,2000);
};

//テキストを1文字ずつ出現させる
function textFadeIn(inText,dilayTime,changeNode){
    for(let j = 0;j < inText.length;j++){
        let time = 100 * (j+1);
        setTimeout(() => {
            let word = inText[j];
            word = (word == "$") ? "<br>": word;
            changeNode.innerHTML += word;
        }, time+dilayTime);
    }
}

//答えを間違った時の関数
function incorrectAction(){
    const incorrectSound = new Audio('sound/Incorrect.mp3');
    incorrectSound.volume = 0.5;
    incorrectSound.play();
    answerInput.classList.add("incorrect");
    sleep(300).then(() => {
        answerInput.classList.remove("incorrect");
    });
    answerInput.value = "";
    answerInput.focus();
    doubleTapDrop(state,1000);
    mistakNum++;
    if (mistakNum > 1){
        tipsBox.classList.add("answer");
    }
}

//最初のオープニングの音楽
function openingSoundStart(){
    BGMSound = new Audio('sound/openingsound.mp3');
    BGMSound.volume = 0.2;
    BGMSound.play();
    openingSoundFlag = false;
}


//骸骨が出現時の音楽
function skullSoundStart(){
    BGMSound = new Audio('sound/skull.mp3');
    let volume = 0.5
    BGMSound.volume = volume;
    BGMSound.play();

    let id = setInterval(() => {
        BGMSound.volume = volume;
        volume = (volume - 0.05).toFixed(2);
        if (volume < 0.2){
            clearTimeout(id);
        }
    },3000);
}

function SoundFadeOut(Sound){
    if(!Sound){
        return;
    }
    let volume = Sound.volume;
    let id = setInterval(() => {
        BGMSound.volume = volume;
        volume = (volume - 0.05).toFixed(2);
        if (volume < 0.0){
            clearTimeout(id);
            BGMSound.pause();
        }
        console.log("123",BGMSound.volume);
    },500);

}


//答える欄を消す
function answersClose(){
    wall.classList.remove("answer");
    answerInput.classList.remove("answer");
    submit.classList.remove("answer");
    tipsBox.classList.remove("answer");
    removeAnserClass();
    tipsText.innerHTML = "";
}

//答える欄を出力
function answersOpen(correctNum,personName){
    wall.classList.add("answer");
    answerInput.classList.add("answer");
    answerInput.focus();
    submit.classList.add("answer");
    answerInput.classList.remove("incorrect");
    answerInput.dataset.correctNum = correctNum;
    answerInput.placeholder = personName + "が答えよ";
}

function cardClickSound(){
    const incorrectSound = new Audio('sound/cardClick.mp3');
    incorrectSound.volume = 0.5;
    incorrectSound.play();
}

//カードの赤い標準を消す
function removeAnserClass(){
    cards.forEach(card => {
        card.classList.remove("answer");
    });
}

//スリープ関数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//12枚のカードを作成
function createCard(){
    for(let i = 0;i < 12;i++){
        const li = document.createElement("li");
        const img = document.createElement("img");
        const p1 = document.createElement("p");
        const p2 = document.createElement("p");
        const p3 = document.createElement("p");
        p1.className = "cardMainText";
        p1.innerHTML = i+1;
        p2.className = "cardNum"; 
        p2.textContent = i+1;
        p3.className = "correct"; 
        p3.textContent = "";

        img.className = "card";
        img.src = "img/card_o.png";
        img.dataset.cardNum = i+1;
        img.dataset.person = persons[i];
        li.className = "cardItem";
        li.appendChild(img);
        li.appendChild(p1);
        li.appendChild(p2);
        li.appendChild(p3);
        ul.appendChild(li);
    }
}


//

}