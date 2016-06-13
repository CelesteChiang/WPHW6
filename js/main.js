var config = {
    apiKey: "AIzaSyDYNboi_Lnb1oN68zh4QFqEuF8-FrVVHwY",
    authDomain: "assign6-ddd58.firebaseapp.com",
    databaseURL: "https://assign6-ddd58.firebaseio.com",
    storageBucket: "assign6-ddd58.appspot.com",
  };


firebase.initializeApp(config);

var fbProvider = new firebase.auth.FacebookAuthProvider();

ImageDealer.REF = firebase;

var currentUser;

var uploadModal = new UploadModal($("#upload-modal"));

var viewModal = new ViewModal($("#view-modal"));

var currentEditingItemKey;
/*var curr= items.child(nowItem);*/
/*
    分為三種使用情形：
    1. 初次登入，改變成登入狀態
    2. 已為登入狀態，reload 網站照樣顯示登入狀態
    3. 未登入狀態

    登入/當初狀態顯示可使用下方 logginOption function
*/

firebase.auth().onAuthStateChanged(function (user) {
	
	firebase.database().ref("Items").once("value", reProduceAll) ;
	
	if(user){
		logginOption(true);
		currentUser = user;
	}else{
		logginOption(false);
		currentUser = null;
	}
});



$("#signin").click(function () {
	firebase.auth().signInWithPopup(fbProvider).then(function
	(result) {
	currentUser = result.user;
	var data = {};
	data["/users/"+ currentUser.uid+"/name"]= result.user.displayName;
	data["/users/"+ currentUser.uid+"/picURL"]= result.user.photoURL;
	firebase.database().ref().update(data);
	logginOption (true);

	
	}).catch(function (error) {
		var errorCode = error.code;
		var errorMessa = error.message;
		console.log(errorCode,errorMessa);
	})
  // 登入後的頁面行為
});


$("#signout").click(function () {
	firebase.auth().signOut().then(function() {
		currentUser = null;
		logginOption(false);
	},function (error) {
	console.log(error.code);
	});
    // 登出後的頁面行為

});

$("#submitData").click(function(){

	var itemKey = 
	firebase.database().ref("Items").push({
		"title": $("#title").val(), 
		"price": $("#price").val(), 
		"descrip": $("#descrip").val(), 
		"seller": currentUser.uid
	}).key;

	var sellItem = {};
	sellItem["/sellItems/"+itemKey] = true;

	firebase.database().ref("users/"+currentUser.uid).update(sellItem);

	uploadModal.itemKey = itemKey ;
	uploadModal.submitPic(currentUser.uid);
});    // 上傳新商品


$("#editData").click(function () {

	firebase.database().ref("Items/"+currentEditingItemKey).update({
		"title": $("#title").val(), 
		"price": $("#price").val(), 
		"descrip": $("#descrip").val(), 
	});

	uploadModal.itemKey = currentEditingItemKey ;
	uploadModal.submitPic(currentUser.uid);

})

$("#removeData").click(function () {
    //刪除商品
})


/*
    商品按鈕在dropdown-menu中
    三種商品篩選方式：
    1. 顯示所有商品
    2. 顯示價格高於 NT$10000 的商品
    3. 顯示價格低於 NT$9999 的商品

*/


function logginOption(isLoggin) {
  if (isLoggin) {
    $("#upload").css("display","block");
    $("#signin").css("display","none");
    $("#signout").css("display","block");
  }else {
    $("#upload").css("display","none");
    $("#signin").css("display","block");
    $("#signout").css("display","none");
  }
}



function reProduceAll(allItems) {
 
//清空頁面上 (#item)內容上的東西。 
   $("#items").empty();
   var allItems = allItems.val();

//利用 for in 讀取爬回來的每一個商品  
	for (var itemKey in allItems) {

  		var sinItemData = allItems[itemKey];
  		sinItemData.itemKey = itemKey;
    	produceSingleItem(sinItemData);
  	}
}


// 每點開一次就註冊一次
function produceSingleItem(sinItemData){

  /*
    抓取 sinItemData 節點上的資料。
    若你的sinItemData資料欄位中並沒有使用者名稱，請再到user節點存取使用者名稱
    資料齊全後塞進item中，創建 Item 物件，並顯示到頁面上。
  */
  


	firebase.database().ref("/users/"+currentUser.uid+"/name").once("value",function (name) {
		
		sinItemData.sellerName = name;
		
		var sinItem = new Item(sinItemData, currentUser);

		$("#items").append(sinItem.dom);

		sinItem.viewBtn.click(function(){
			viewModal.writeData({
				"title": sinItemData.title, 
				"descrip": sinItemData.descrip, 
				"price": sinItemData.price
			});
			viewModal.callImage(sinItemData.itemKey, sinItemData.seller);

		});
      
 //        用 ViewModal 填入這筆 item 的資料
 //        呼叫 ViewModal callImage打開圖片
 //        創建一個 MessageBox 物件，將 Message 的結構顯示上 #message 裡。
 //      


 //   	$("#message").append();

 //      /*
 //        判斷使用者是否有登入，如果有登入就讓 #message 容器顯示輸入框。
 //        在 MessageBox 上面註冊事件，當 submit 時將資料上傳。
 //      */
 //    	if (currentUser) {
 //        	$("#message").append(messBox.inputBox);

 //        	messBox.inputBox.keypress(function (e) {
 //          		if (e.which == 13) {
 //            		e.preventDefault();

 //           		 /*
 //            	取得input的內容 $(this).find("#dialog").val();
 //            	清空input的內容 $(this).find("#dialog").val("");
 //            	*/
 //          		}
 //        	});
 //      	}

 //    /*
 //    從資料庫中抓出message資料，並將資料填入MessageBox
 //    */
 //      	firebase.database().ref().orderBy.("",function(data) {

 //      	});
 
		sinItem.editBtn.click(function(){
			uploadModal.editData({
				"title": sinItemData.title, 
				"descrip": sinItemData.descrip, 
				"price": sinItemData.price
			});
			uploadModal.callImage(sinItemData.itemKey, sinItemData.seller);
			currentEditingItemKey = sinItemData.itemKey;
		});

	});


    /*
    如果使用者有登入，替 editBtn 監聽事件，當使用者點選編輯按鈕時，將資料顯示上 uploadModal。
    */
}


function generateDialog(diaData, messageBox) {


}
