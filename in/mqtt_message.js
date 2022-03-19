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


// 顯示訊息
function addMsg(type, msg){
	$("#msg").prepend(
		"<div class='msg "+ type.toLowerCase() +"'>[" + type + "] " + new Date().toLocaleString() + "： " + msg +"</div>"
	);
}

// 清除全部訊息
function clearMsg(){
	$("#msg").empty();
}

// 清除表單
function clearForm(fmId){
	$('#' + fmId).trigger("reset");
}

