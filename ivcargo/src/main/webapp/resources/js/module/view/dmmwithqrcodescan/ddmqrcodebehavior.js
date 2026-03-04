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
        PROJECT_IVUIRESOURCES+'/resources/js/module/view/dmmwithqrcodescan/ddmscanqrcodefilepath.js'
        ,PROJECT_IVUIRESOURCES+'/resources/js/barcode/qrcode/qrscannerwrapper.js'
        ,'slickGridWrapper3'
        ,'elementmodel'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/dmmwithqrcodescan/ddmdetails.js'
        ,'language'//import in require.config
        ,'errorshow'
        ,'JsonUtility'
        ,'messageUtility'
        ,'jquerylingua'
        ,'language'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
        ], function(Marionette, FilePath, QRCodeWrapper, SlickGridWrapper, ElementModel, DDMDetails) {
	let _this,
	decoder,
	inObj,
	columnHeaderJsonArr,
	LangKeySet,
	selectedGridObject,
	groupConfigProperties 	= new Object(),
	allowDDMForBlackListedParty = false,
	chargeTypeModel;
	return Marionette.Behavior.extend({
		onPlay:function() {
			_this = this;
			
			if(decoder == undefined) {
				inObj 				= new Object();
				inObj.cllbackFun 	= _this.callbackforscannnedCode;
				decoder 			= QRCodeWrapper.initializeQrCodeScanning(inObj);
			}
			
			let txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent",
					scannedQR = QRCodeWrapper.checkEle("#scanned-QR"),
					grabImg = QRCodeWrapper.checkEle("#grab-img");
			
			if (!decoder.isInitialized()) {
				scannedQR[txt] = "Scanning ...";
			} else {
				scannedQR[txt] = "Scanning ...";
				decoder.play();
			}
		}, onPause : function() {
			let txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent",
					scannedQR = QRCodeWrapper.checkEle("#scanned-QR");
			scannedQR[txt] = "Paused";
			
			if( decoder != undefined)
				decoder.pause();
		}, onStop : function() {
			let grabImg = QRCodeWrapper.checkEle("#grab-img"),
			txt = "innerText" in HTMLElement.prototype ? "innerText" : "textContent",
					scannedQR = QRCodeWrapper.checkEle("#scanned-QR");
			grabImg.classList.add("disabled");
			scannedQR[txt] = "Stopped";
			
			if( decoder != undefined)
				decoder.stop();
		}, onGrabImage : function() {
			if (decoder == undefined || !decoder.isInitialized())
				return;

			let src = decoder.getLastImageSrc(),scannedImg = QRCodeWrapper.checkEle("#scanned-img");
			scannedImg.setAttribute("src", src);
		},callbackforscannnedCode:function(response){
			_this.onPause();
			showLayer();
			let scannedResult 		= response.code;
			_this.processScannedResult(scannedResult);
		},processScannedResult: function(scannedResult) {
			let jsonObject 	= {};
			let wayBillId 	= 0;

			 if(scannedResult.includes('~'))
				wayBillId = scannedResult.split('~')[0];
			
			if(wayBillId > 0) {
				jsonObject.waybillId = wayBillId;
				getJSON(jsonObject, WEB_SERVICE_URL+'/deliveryRunsheetWS/getWaybilDetailsByWaybillIdForDoorDelivery.do', _this.dataForWaybill, EXECUTE_WITH_ERROR);				
			} else {
				$('#singleLRSearchEle').val(scannedResult);
				_this.searchLRByNumber();
			}
		}, dataForWaybill : function(response) {
			_this.onPlay();
			hideLayer()
			
			if(response.message != undefined)
				return;
			
			$('#singleLRSearchEle').val('');
			$("#bottom-border-boxshadow").removeClass('hide');
			$("#receiveBtn").removeClass('hide');
			
			_this.setConfigurationForSlickGridTable(response);
			
			let dataObject 				= response.pendingLRColl;
			groupConfigProperties   	= response.groupConfigProperties;
			allowDDMForBlackListedParty = response.allowDDMForBlackListedParty;
			
			selectedGridObject 			= SlickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});

			if(dataObject.length > 0) {
				if(SlickGridWrapper.checkToAddRowInTable({InnerSlickId : 'data'},dataObject,'wayBillId')) {
					showMessage('error', '<i class="fa fa-info-circle"></i> LR Number present which you are trying to append !');
					hideLayer();
					return false;
				}
			}
			
			let dataViewObject;
			
			if(selectedGridObject != undefined)
				dataViewObject = selectedGridObject.getData();
			
			selectedGridObject = SlickGridWrapper.applyGrid({
				ColumnHead					:	columnHeaderJsonArr,
				ColumnData					:	dataObject,
				Language					:	LangKeySet,
				DivId						:	'myGrid',
				InnerSlickId				:	'data',
				SerialNo:[{
					showSerialNo			:	true,
					SearchFilter			:	false,
					ListFilter				:	false
				}],
				NoVerticalScrollBar			:	false,
				FetchAllDataButtonId		:	'#dispatchBtn',
				ShowDeleteButton			:	true,
				EditRowsInSlick				:	true,
				DataVieObject				:	dataViewObject,
				DataGridObject				:	selectedGridObject,
				PersistGridToAppend			:	true
			});
			
			if(groupConfigProperties.showPartyIsBlackListedParty) {
				if(dataObject[0].consignorBlackListed > 0 && dataObject[0].tbbPartyBlackListed > 0 )
					showMessage('error', 'Consignor And TBB Party is BlackListed');
				else if(dataObject[0].consignorBlackListed > 0)
					showMessage('error', 'Consignor Party is BlackListed');
				else if(dataObject[0].consigneeBlackListed > 0)
					showMessage('error', 'Consignee Party is BlackListed');
				else if(dataObject[0].tbbPartyBlackListed > 0)
					showMessage('error', 'TBB Party is BlackListed');
				
				SlickGridWrapper.updateRowColor({InnerSlickId:'data'},'partyBlackListed',1,'highlight-row-red');
			}
		}, onReceiveLR : function() {
			selectedGridObject = SlickGridWrapper.getSlickGridInstance({InnerSlickId : 'data'});
			
			if(selectedGridObject != undefined){
				var dataView 	= selectedGridObject.getData();
				var slickData 	= dataView.getItems();
				
				if(slickData.length <= 0 ){
					showMessage('error','<i class="fa fa-info-circle"></i> Please provide atleaset One LR to Door Deliver');
					return false;
				}
			}

			let jsonArr = new Array()
			
			for(let key in slickData) {
				jsonArr.push({wayBillId:slickData[key]['wayBillId'],wayBillRemark:slickData[key]['wayBillRemark']})
			}
			
			if(jsonArr.length <= 0) {
				showMessage('error','<i class="fa fa-info-circle"></i> Provide atleast one LR to Door Deliver !');
				return false;
			}
			
			_this.onPause();
			
			DDMDetails.setChargeTypeModelList(chargeTypeModel);
			DDMDetails.setLorryHireDetails({data:dataView},groupConfigProperties.showPartyIsBlackListedParty,allowDDMForBlackListedParty)
		}, callbackFunctionAfterScan : function(grid,dataObject){
			selectedGridObject = grid;
		}, searchLRByNumber : function() {
			let jsonObject = new Object();
			let qrCodeString = $('#singleLRSearchEle').val();

			if(qrCodeString.includes('~'))
				jsonObject.wayBillNumber = qrCodeString.split('~')[1];
			else
				jsonObject.wayBillNumber = $('#singleLRSearchEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/deliveryRunsheetWS/getWaybilDetailsByWaybillNumberForDoorDelivery.do', _this.dataForWaybill, EXECUTE_WITH_ERROR)
		}, setConfigurationForSlickGridTable : function(response) {
			let langObj 			= FilePath.loadLanguage();
			LangKeySet 				= loadLanguageWithParams(langObj);
			
			columnHeaderJsonArr		= _.values(response.tableConfig.columnConfiguration);

			if (response.ddmConfiguration.htData.chargeTypeModel != undefined) {
				chargeTypeModel	= response.ddmConfiguration.htData.chargeTypeModel;
				
				for (const element of chargeTypeModel) {
					let chargeObject	= new Object();
					chargeObject.title	= element.chargeTypeMasterName;
					chargeObject.elementConfigKey	= "charge_" + element.chargeTypeMasterId;
					chargeObject.dataDtoKey		= "charge_" + element.chargeTypeMasterId;
					chargeObject.columnPrintWidthInPercentage	= '18';
					chargeObject.columnWidth			= 100;
					chargeObject.columnMinWidth			= 60;
					chargeObject.dataType				= 'input';
					chargeObject.buttonCss 				= 'inputElementForSlick form-control';
					columnHeaderJsonArr.push(new ElementModel(JSON.parse(JSON.stringify(chargeObject))).toJSON());
				}
			}
		}
	});
});