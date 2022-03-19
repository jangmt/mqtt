//
// 此為透過 mqttws31.js 的設定檔
// 官方 https://www.eclipse.org/paho/clients/js/
// 中文可以參考 https://itbilu.com/nodejs/npm/41wDnJoDg.html
// 
// ----
// setting
// MQTT主機
const MQTT_HOST = "ws://mqtt.shopeebuy.com:11883/";
// 訂閱頻道
const SUB_TOPIC = "/mtchang/test";
// 推播頻道
const PUB_TOPIC = "/mtchang/test";
// 頻道的使用者帳密
const username='mtchang';
const password='xxxxxxxx';

var options = {
	onSuccess:onConnect,
	onFailure:doFail
}

/*------------------------------------------------------------------------------------------------------*/


var client = false;

// 連接到 broker
function onConnect() {
	addMsg("connection", "Connect 訂閱頻道. (" + SUB_TOPIC + ")" );
	addMsg("connection", "Connect 推播頻道. (" + PUB_TOPIC + ")" );
	addMsg("connection", "Connect MQTT主機成功. (" + MQTT_HOST + ")" );
    client.subscribe(SUB_TOPIC);
}

// 訊息抵達的處理
function onMessageArrived(message) {
    addMsg("receive", message.payloadString);
    // add mp3 and sticky
    message_coming_playaudio();
    message_coming_notice(message.payloadString);
}

// 傳送出去訊息
function publish_message() {
    var txtQuery = $("#query").val();
    var message = new Paho.MQTT.Message(txtQuery);
    message.destinationName = PUB_TOPIC;
    client.send(message);
    clearForm("fm");
    addMsg("send", txtQuery);
}

// 錯誤處理
function doFail(e){
    addMsg("error", "Fail:" + e.errorMessage);
}

// 連線遺失
function onConnectionLost(responseObject) {
	if (responseObject.errorCode !== 0) {
	  addMsg("error", "Connect lost:" + responseObject.errorMessage);
	}
}

// MQTT 初始
function init() {
    client = new Paho.MQTT.Client( MQTT_HOST, "web_" + parseInt(Math.random() * 100, 10) );
        console.log("connection to "+MQTT_HOST);
	client.onConnectionLost = onConnectionLost;
	client.onMessageArrived = onMessageArrived;


        if (username != null) {
            options.userName = username;
            options.password = password;
        }

    client.connect(options); // MQTT broker
}

window.addEventListener('load', init, false);
//document.addEventListener('DOMContentLoaded', init, false);

// 播放聲音的 function
function message_coming_playaudio(){
     var audio = document.getElementById("message_coming_playaudio");
     audio.play();
     return(1);
}  	    
function message_coming_sticky(msgdata){
    $.jGrowl( msgdata, { sticky: true});
    return(1);
}  	
function message_coming_notice(msgdata){
    $.jGrowl( msgdata, { life: 5000,position: 'bottom-right' });
    return(1);
} 


// 顯示訊息 func
function addMsg(type, msg){
	$("#msg").prepend(
		"<div class='msg "+ type.toLowerCase() +"'>[" + type + "] " + new Date().toLocaleString() + "： " + msg +"</div>"
	);
}

// 清除全部訊息 func
function clearMsg(){
	$("#msg").empty();
}

// 清除表單 func
function clearForm(fmId){
	$('#' + fmId).trigger("reset");
}

