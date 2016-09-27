var elem;
var files_base64 = [];
	  	
$(document).ready(function()
{
	  

	  elem = document.getElementById("generate"); 
	
	  $("#msg").keyup(function(){
		$("#count").text($(this).val().length);
	  });
	
	  $("#upload").dropzone({ 
		paramName: "image",
		maxFilesize: 1,
		uploadMultiple: false,
		url: "/file-upload", 
		clickable: true,
		maxFiles: 3,
		success: function(file, response) { 
				document.getElementById("upload_msg").innerHTML = "Up to 3 files (1 MB each)";
				files_base64.push(response);
			 } 
		
	  });	
});

var btcToggle = function() { prompt("Donate if you found Cryptobin useful :)", "1LxK5rs38kH2Fxyj6yWjkSZtSKqogXHe7B"); }


var encryptMsg = function (msg, hash32)
{
	var key 		= aesjs.util.convertStringToBytes(hash32);
	var textBytes 		= aesjs.util.convertStringToBytes(msg);
	var aesCtr 		= new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
	var encryptedBytes 	= aesCtr.encrypt(textBytes);
	
	return encryptedBytes;
}


var checkID = function (){
	var reader  = new FileReader();
	var file = $('#imageID').prop("files")[0];
	
	reader.onload = function() {
		  // getImageHash(reader.result);
		  var base64 = reader.result;
		  $("#base64").html(base64);
		  var base64Final = base64.split("base64,")[1];
		  var hash = sjcl.hash.sha256.hash(base64Final);
		  $("#id").html(sjcl.codec.hex.fromBits(hash));


    	};   

	reader.readAsDataURL(file);
	
}
	
var decryptMsg = function (hash)
{
	var msg 	= $("#msg").val();
		          $("#msg").val("<encrypted>");

	// Decrypt CheckSum
	var checksum 	= $("#checksum").val();


    	var file	= $("#files").html();
			  $("#files").html("");
    
	var hash32	= hash.substring(0,32);
	var key 	= aesjs.util.convertStringToBytes(hash32);
	
	var files 	= file.split('|');

	
	files.map( function (elem) {
		if( elem != "" ){
			
		var msgA 	= elem.split(',');
		var msgN 	= [];
		
		for( var i = 0; i < msgA.length; i++ ){ 
			msgN.push(Number(msgA[i]));
		}
		
		var aesCtr 		= new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
		var decryptedBytes 	= aesCtr.decrypt(msgN);
		var decryptedText 	= aesjs.util.convertBytesToString(decryptedBytes);

	   	$("#files").append(' <a href="data:application/octet-stream;charset=utf-16le;base64,' + decryptedText + '"><img style="margin-bottom:30x;height:100px;width:100px;"  src="/images/file"></a><br/> ');
	    
		} else {
			return  "";
		}	
	});

	
	if( msg.length == 1 ){
		var msgN 	= [Number(msg)];
	} else {
		var msgA 	= msg.split(',');
		var msgN 	= [];
		
		for(var i = 0; i < msgA.length; i++)
			msgN.push(Number(msgA[i]));	
	}
	
	
	var aesCtr 		= new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
	var decryptedBytes 	= aesCtr.decrypt(msgN);
	var decryptedText 	= aesjs.util.convertBytesToString(decryptedBytes);
	
	
	
	$("#msg").val(decryptedText);
	$("#files").show();
}

function createID()
{

    var text 		= "";
    var possible 	= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i = 0; i < 65; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function generate()
{

	var password 	= $("#password").val();
	var msg 	= $("#msg").val();

	if(msg 	!= ""){
		getHash(password, returnHashEnc);
		elem.innerHTML =  "Encrypting <br> <progress id='progressbar' style='width:100%;' value='0' max='100'></progress>";
		$("#msgField").css({ opacity: 0.2 });
		$("#upload").css({ opacity: 0.2 });
		elem.style.visibility = "visible";
	
	}

}




function encryptAll (hash)
{
	var msg = $("#msg").val();
	var hash32 			= hash.substring(0,32);
	var encryptedString = encryptMsg(msg,hash32);
	var checkSum = encryptMsg(msg,hash32);
	var encryptedFiles 	= [];
	var imageID = $("#id").html();

	files_base64.forEach(function encryptFiles(element, index, array){
		encryptedFiles.push(encryptMsg(element,hash32));
	});

	var filesString = encryptedFiles.join("|");
	if(imageID.length == 0){
		var urlID 	= createID();
	} else {
		var urlID 	= imageID;
	}

	var payload 	= {
                		id: urlID,
				msg: String(encryptedString),
				files: filesString,
				views: $("#views").val(),
				checksum: String(checkSum)
			  };

	$.ajax({
                   		url: "/api/i/newmsg",
                    		type: "POST",
                    		contentType: "application/json",
                    		processData: false,
                    		data: JSON.stringify(payload),
                    		complete: function (data) { }
                });

	$("#options").css({ opacity: 0 });
	$("#msgField").hide();
	$("#upload").hide();
	$("#again").show();
	var messageURL = "https://cryptob.in/m/".concat(urlID); 
	elem.innerHTML = "<a href='" + messageURL + "'>" + urlID + "</a> <div id='qrcode'></div>";
	new QRCode(document.getElementById("qrcode"), messageURL);
	var base64 = $("#base64").html();
	
	if(base64.length > 0 ){
		$("#generate").append('<img style="margin-left:10%;margin-top:20px;width:35%;float:left;" src="' + base64 + '">');
	}

}
 


var getHash = function (password, callback)
{
	var salt = "$2a$08$b0MHMsT3ErLoTRjpjzsCie";
	hashpw(
		password, 
		salt, 
		callback, 
		function() {
     	 		var progress = document.getElementById("progressbar");
			progress.value = progress.value + 1; 
			}    									
	      ); 
}

var getHashDec = function (password, callback)
{
	var salt = "$2a$08$b0MHMsT3ErLoTRjpjzsCie";
	hashpw(password, salt, callback); 
}

var returnHashEnc = function (hash) { encryptAll (hash); } 
var returnHashDec = function (hash) { decryptMsg (hash); } 









