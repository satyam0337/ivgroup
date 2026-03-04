/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
	//the file which has only name they are are already  been loaded
	'marionette',//Marionette
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/receivescanqrcode/receivescanqrcodefilepath.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/receivescanqrcode/loadreceiveqrcodemodelurls.js'
	,'language'//import in require.config
	,'errorshow'
	,'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES+'/resources/js/barcode/qrcode/qrscannerwrapper.js'
	,'slickGridWrapper3'
	,'jquerylingua'
	,'language'//import in require.config
	,'elementmodel'
	,PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(Marionette,FilePath,ModelUrls,Language,errorshow,JsonUtility,MessageUtility,QRCodeWrapper,SlickGridWrapper,jquerylingua,language,ElementModel,Modal){
	var _this,decoder,inObj,selectedGridObject,filterConfiguration = new Object(),
	columnHiddenConfiguration;
	return Marionette.Behavior.extend({
		onPlay:function(){
			_this = this;
			if( decoder == undefined){
				inObj 				= new Object();
				inObj.cllbackFun 	= _this.callbackforscannnedCode;
				decoder 			= QRCodeWrapper.initializeQrCodeScanning(inObj);
			}
			var txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent",
					scannedQR 	= QRCodeWrapper.checkEle("#scanned-QR"),
					grabImg 	= QRCodeWrapper.checkEle("#grab-img");
			if (!decoder.isInitialized()) {
				scannedQR[txt] = "Scanning ...";
			} else {
				scannedQR[txt] = "Scanning ...";
				decoder.play();
			}
		},onPause:function(){
			var txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent",
					scannedQR = QRCodeWrapper.checkEle("#scanned-QR");
			scannedQR[txt] = "Paused";
			if( decoder != undefined){
				decoder.pause();
			}
		},onStop:function(){
			var grabImg = QRCodeWrapper.checkEle("#grab-img"),
			txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent",
					scannedQR = QRCodeWrapper.checkEle("#scanned-QR");
			grabImg.classList.add("disabled");
			scannedQR[txt] = "Stopped";
			if( decoder != undefined){
				decoder.stop();
			}
		},onGrabImage:function(){
			if (decoder == undefined || !decoder.isInitialized()) {
				return;
			}

			var src = decoder.getLastImageSrc(),scannedImg = QRCodeWrapper.checkEle("#scanned-img");
			scannedImg.setAttribute("src", src);
		}, callbackforscannnedCode:function(response) {
			_this.onPause();
			showLayer();
			var scannedResult 	= response.code;
			var jsonObject 		= new Object();

			if(scannedResult.split('~')[0] <= 0) {
				showMessage('info', 'LR Not Found');
				return false;
			}

			jsonObject.waybillId = scannedResult.split('~')[0]; 
			console.log(jsonObject);
			getJSON(jsonObject, WEB_SERVICE_URL+'/receiveWs/getWaybilDetailsByWaybillIdForPendingReceive.do', _this.dataForWaybill, EXECUTE_WITH_ERROR)
		}, dataForWaybill:function(response) {

			_this.onPlay();
			hideLayer()
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			$("#bottom-border-boxshadow").removeClass('hide');
			$("#receiveBtn").removeClass('hide');

			var langObj 	= FilePath.loadLanguage();
			LangKeySet 		= loadLanguageWithParams(langObj);
			columnHeaderArr = ModelUrls.urlModelCollection(response);

			filterConfiguration["searchFilterList"]	= response.searchFilterTypeConfiguration;
			filterConfiguration["listFilterList"]	= response.listFilterTypeConfiguration;
			columnHiddenConfiguration 				= response.byDefaultColumnHiddenConfiguration;

			columnHeaderJsonArr = [];
			var eleArr = columnHeaderArr;
			
			for  (var j = 0; j < eleArr.length; j++) {
				columnHeaderJsonArr.push(new ElementModel(JSON.parse(eleArr[j])).toJSON());
			}
			
			var dataObject = response.pendingLRColl;

			if(SlickGridWrapper.checkToAddRowInTable({InnerSlickId : 'data'}, dataObject,'wayBillId')) {
				showMessage('info', '<i class="fa fa-info-circle"></i> LR Number present which you are trying to append !');
				return false;
			}

			SlickGridWrapper.applyGrid({
				ColumnHead						:	columnHeaderJsonArr, // *compulsory // for table headers
				ColumnData						:	dataObject, 	// *compulsory // for table's data
				Language						:	LangKeySet, 			// *compulsory for table's header row language
				DivId							:	'myGrid',				// *compulsary field // division id where slickgrid table has to be created
				InnerSlickId					:	'data',
				SerialNo						:[{					// optional field // for showing Row number
					showSerialNo	:	true,
					SearchFilter	:	false,          // for search filter on serial no
					ListFilter		:	false				// for list filter on serial no
				}],
				ColumnHiddenConfiguration		:	columnHiddenConfiguration, // optional for hiding columns account group specifically
				AllowFilter						:	filterConfiguration,	 // optional field // for showing filters on each column
				NoVerticalScrollBar				:	false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
				FetchAllDataButtonId 			: 	'#dispatchBtn',
				ShowDeleteButton 				: 	true,
				EditRowsInSlick 				: 	true,
				PersistGridToAppend				:	true,
				UpdateTotalFunction				: 	_this.updatePaidAndTopayAmount			
			})
		},onReceiveLR:function(){
			/*if(selectedGridObject != undefined){
				var object = new Object();
				var dataView = selectedGridObject.getData();
				var slickData = dataView.getItems();
				if(slickData.length <= 0 ){
					showMessage('error','Please provide atleaset One LR to Receive');
					return false;
				}
			}*/
			selectedGridObject = SlickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			if(selectedGridObject != undefined) {
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();

				if(slickData.length <= 0 ) {
					showMessage('error', '<i class="fa fa-info-circle"></i> Please, Provide atleast one LR to Receive !');
					return false;
				}
			}

			var jsonArr = new Array();
			
			for(var key in slickData) {
				jsonArr.push({wayBillId : slickData[key]['wayBillId']})
			}
			
			if(jsonArr.length <= 0){
				showMessage('error', '<i class="fa fa-info-circle"></i> Provide atleast one LR to receive !');
				return false;
			}
			_this.onPause();
			var btModalConfirm = new Backbone.BootstrapModal({
				content: "Are you sure you want to Receive ?",
				modalWidth 	: 30,
				title		: 'Receive',
				okText		: 'YES',
				showFooter 	: true,
				okCloses	: true
			}).open();
			
			var finalJsonObj 		= new Object();
			finalJsonObj.lrArray 	= JSON.stringify(jsonArr);
			btModalConfirm.on('ok', function() {
				showLayer();
				getJSON(finalJsonObj, WEB_SERVICE_URL+'/receiveWs/validateAndReceiveWayBill.do', _this.onReceive, EXECUTE_WITH_ERROR); //submit JSON
				//_this.onDispatch()
			});
		},onReceive:function(response){
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage('error', errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			setTimeout(function(){hideLayer();},10);
			showMessage('success','<i class="fa fa-check"></i> Successfully Received');
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=receiveWithQRCode&RECEIVEDLEDGERID='+response.RECEIVEDLEDGERID,{trigger: true});
			location.reload();
		}
	});
});