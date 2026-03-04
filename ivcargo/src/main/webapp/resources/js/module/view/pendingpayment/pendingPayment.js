define([  
          'slickGridWrapper3'
          ,'selectizewrapper'
          ,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
		  ,'JsonUtility'
          ,'messageUtility'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ],function(slickGridWrapper3, Selectizewrapper, SelectOption) {
	'use strict';
	var jsonObject = new Object(), paymentData , myNod, _this = '',
				selectedGridObject,isAllowByRecieveAndDueOption= false,paymentTypeArr=null,pendingDueAndReceiveType= 2,byDefaultSelectAllInSubRegion = false,byDefaultSelectBothInTxnType = false,byDefaultSelectDuePayment = false,byDefaultSelectFixRegionInRegionOption = false,allowExecutiveColumnForGroup = true,
				fixedRegionId = 0, fixedRegionName = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},  render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/pendingPaymentWS/getPendingPaymentElements.do?', _this.setPendingPaymentElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setPendingPaymentElements : function(response){
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			var executive	= response.executive;
			allowExecutiveColumnForGroup				= response.allowExecutiveColumnForGroup;
			isAllowByRecieveAndDueOption				= response.isAllowByRecieveAndDueOption;
			byDefaultSelectFixRegionInRegionOption		= response.byDefaultSelectFixRegionInRegionOption;
			byDefaultSelectDuePayment					= response.byDefaultSelectDuePayment;
			byDefaultSelectBothInTxnType				= response.byDefaultSelectBothInTxnType;
			byDefaultSelectAllInSubRegion				= response.byDefaultSelectAllInSubRegion;
			fixedRegionId								= response.fixedRegionId;
			fixedRegionName								= response.fixedRegionName;
			
			if(isAllowByRecieveAndDueOption) {
				paymentTypeArr 			= response.paymentTypeArr;
			}
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/pendingpayment/pendingPayment.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (!response[keyObject[i]]) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				
				if(isAllowByRecieveAndDueOption) {
					var crossingTypeAutoComplete 			= new Object();
					crossingTypeAutoComplete.primary_key 	= 'pendingDueAndReceiveId';
					crossingTypeAutoComplete.field 			= 'pendingDueAndReceiveName';
					crossingTypeAutoComplete.callBack 		= _this.onTypeSelect;
					crossingTypeAutoComplete.keyupFunction 	= _this.onTypeSelect;
					$("#crossingLSEle").autocompleteCustom(crossingTypeAutoComplete);
					_this.setPendingDueAndReceiveOption();
					
					$('#selectionDiv').removeClass('hide');
					$('#dateSelectorCheckBox').addClass('hide');
					$('#dateSelector').addClass('hide');
					$('.hideDiv').addClass('hide');
					
					response.txnTypeArr.push({"txnTypeId": "-1", "txnTypeName": "Both"})
				}
				
				var pendingPaymentTypeAutoComplete 			= new Object();
				pendingPaymentTypeAutoComplete.primary_key 	= 'txnTypeId';
				pendingPaymentTypeAutoComplete.url 			= response.txnTypeArr;
				pendingPaymentTypeAutoComplete.field 		= 'txnTypeName';
				$("#pendingPaymentType").autocompleteCustom(pendingPaymentTypeAutoComplete);

				var elementConfiguration				= new Object();
				
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.executiveElement	= $('#executiveEle');
				elementConfiguration.dateElement		= $('#dateEle');
				
				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.executiveListByBranch			= allowExecutiveColumnForGroup;
				response.isCalenderSelection			= true;
				
				SelectOption.setSelectionToGetData(response);
				
				$("*[data-selector=subRegion]").html(response.fromAreaLabel);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#regionEle',
					validate: 'validateAutocomplete:#regionEle_primary_key',
					errorMessage: 'Select proper Region !'
				});

				myNod.add({
					selector: '#subRegionEle',
					validate: 'validateAutocomplete:#subRegionEle_primary_key',
					errorMessage: 'Select proper Area !'
				});

				myNod.add({
					selector: '#branchEle',
					validate: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage: 'Select proper Branch !'
				});
				myNod.add({
					selector: '#pendingPaymentType',
					validate: 'validateAutocomplete:#pendingPaymentType_primary_key',
					errorMessage: 'Select proper Type !'
				});
				//myNod.add({
					//selector: '#executiveEle',
					//validate: 'validateAutocomplete:#executiveEle_primary_key',
					//errorMessage: 'Select proper Name !'
				//});

				if (executive.executiveType == 6) {
					$("#regionEle_primary_key").val(executive.regionId);
					var autoSubRegionName = $("#subRegionEle").getInstance();
					var subRegionList = response.subRegionList;
					
					if(isAllowByRecieveAndDueOption) {
						subRegionList.push({"subRegionId":"-1","subRegionName":"ALL"})
					}
					
					$(autoSubRegionName).each(function() {
						this.option.source = subRegionList;
					});
					
					if(byDefaultSelectAllInSubRegion) {
						$("#subRegionEle_primary_key").val(-1);
						$("#subRegionEle").val('ALL');
						$("#branchEle_primary_key").val(-1);
						$("#branchEle").val('ALL');
					}
					
					if(byDefaultSelectBothInTxnType) {
						$("#pendingPaymentType_primary_key").val(-1);
						$("#pendingPaymentType").val('Both');
					}
					
					$("#executiveEle_primary_key").val(executive.executiveId);
					$("#executiveEle").val(executive.executiveName);
				}
				
				if (executive.executiveType == 7) {
					var autoBranchName = $("#branchEle").getInstance();
					var branchList = response.branchList;
					
					if(isAllowByRecieveAndDueOption) {
						branchList.push({"branchId":"-1","branchName":"ALL"})
					}
					
					$(autoBranchName).each(function() {
						this.option.source = branchList;
					})
					
					if(byDefaultSelectAllInSubRegion) {
						$("#branchEle_primary_key").val(-1);
						$("#branchEle").val('ALL');
					}
					
					if(byDefaultSelectBothInTxnType) {
						$("#pendingPaymentType_primary_key").val(-1);
						$("#pendingPaymentType").val('Both');
					}
					
					$("#executiveEle_primary_key").val(executive.executiveId);
					$("#executiveEle").val(executive.executiveName);
				}
				
				if (executive.executiveType == 3) {
					if(byDefaultSelectBothInTxnType) {
						$("#pendingPaymentType_primary_key").val(-1);
						$("#pendingPaymentType").val('Both');
					}
					
					$("#executiveEle_primary_key").val(executive.executiveId);
					$("#executiveEle").val(executive.executiveName);
				}
				
				if (executive.executiveType == 4) {
					if(byDefaultSelectBothInTxnType) {
						$("#pendingPaymentType_primary_key").val(-1);
						$("#pendingPaymentType").val('Both');
					}
					
					$("#executiveEle_primary_key").val(executive.executiveId);
					$("#executiveEle").val(executive.executiveName);
				}
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
				
				$("#receiveBtn").click(function() {
					_this.submitDataFromGrid(_this);								
				});
				
				$("#byDateEle").click(function() {
					if ($('#byDateEle').prop('checked'))
						$('#dateSelector').removeClass('hide')
			        else
			        	$('#dateSelector').addClass('hide')
				});
			});

		}, onSubmit : function() {
			showLayer();

			$('#bottom-border-boxshadow').hide();
			var jsonObject = SelectOption.getElementData();
			
			jsonObject["pendingPaymentTypeId"] 	= $('#pendingPaymentType_primary_key').val();
			jsonObject["byDateEle"] 			= $('#byDateEle').prop('checked');
			jsonObject["selectedExecutiveId"] 	= $('#executiveEle_primary_key').val();
			jsonObject["pendingDueAndReceiveType"] 	= pendingDueAndReceiveType;
			
			if(pendingDueAndReceiveType == LR_PAYMENT_RECEIVED) {
				getJSON(jsonObject, WEB_SERVICE_URL+'/pendingPaymentWS/getReceivedPaymentLRDetails.do', _this.setPendingPaymentTableData, EXECUTE_WITH_ERROR);
			}else {
				getJSON(jsonObject, WEB_SERVICE_URL+'/pendingPaymentWS/getPendingPaymentDetails.do', _this.setPendingPaymentTableData, EXECUTE_WITH_ERROR);
			}
			
		},setPendingPaymentTableData : function(response) {
			if(response.message != undefined){
				hideLayer();
				//$('#receiveBtn').hide();
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				return;
			}
			
			$('#receiveBtn').show();
			
			if(isAllowByRecieveAndDueOption) {
				$('#receiveBtnDiv').removeClass('hide');
				$('#paymentTypeDiv').removeClass('hide');
			
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	paymentTypeArr,
					valueField		:	'paymentTypeId',
					labelField		:	'paymentTypeName',
					searchField		:	'paymentTypeName',
					elementId		:	'paymentTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:   _this.onPaymentTypeSelect
				});
								
				$('#chequeDate').val(dateWithDateFormatForCalender(new Date(),"-")); //dateFormatForCalender defined in genericfunctions.js file
				$('#chequeDate').datepicker({
					dateFormat: 'dd-mm-yy'
				});
				
				if(pendingDueAndReceiveType == LR_PAYMENT_RECEIVED) {
					$('#receiveBtnDiv').addClass('hide');
					$('#paymentTypeDiv').addClass('hide');
				}
			}
			
			var columnConfigurationList = response.columnConfigurationList;
			
			for (var i = 0; i < columnConfigurationList.length; i++) {
				var bObj	= columnConfigurationList[i];
				
				if(bObj.dataDtoKey == 'branchCommison') {
					bObj.title	= 'Cmsn ( ' + response.branchCommionPer + ' %)';
					break;
				}
			}
			
			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').show();
				hideAllMessages();
				
				_this.setMaxAndMinDate(response);
				
				let tableProperties			= response.tableProperties;
				tableProperties.multiGroupDtosHM	= response.multiGroupDtosHM;
				
				slickGridWrapper3.applyGrid(
						{
							ColumnHead					: response.columnConfigurationList, // *compulsory // for table headers
							ColumnData					: _.values(response.CorporateAccount), 	// *compulsory // for table's data
							tableProperties				: tableProperties,
							//Language					: response.Language, 			// *compulsory for table's header row language
							CallBackFunctionForPartial	: _this.getReceivePendingPaymentForLr,
							SerialNo:[{						// optional field // for showing Row number
								showSerialNo	: tableProperties.showSerialNo,
								searchFilter	: false,    // for search filter on serial no
								ListFilter		: false		// for list filter on serial no
							}],
							NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
				});
			}
			
			hideLayer();
		},setMaxAndMinDate:function(responseObj){
			var data = responseObj.CorporateAccount;
			_.each(data,function(key){
				key.maxDate = key.currentDateString;
				key.minDate = key.dateString;
			})
			responseObj.CorporateAccount = data;
			return responseObj;
		},getReceivePendingPaymentForLr:function(grid,dataView,row){
			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Do you want To Receive Payment of <b> Rs:  "+dataView.getItem(row).receivableTotal+"</b> for LR Number :<b>"+dataView.getItem(row).wayBillNumber+"</b>",
				modalWidth 	: 	30,
				title		:	'Payment Receive',
				okText		:	'YES',
				showFooter 	: 	true,
				okCloses	:	true
			}).open();
			hideLayer();
			
			btModalConfirm.on('ok', function() {
				showLayer();
				jsonObject["bookingBranchId"] 		= dataView.getItem(row).bookingBranchId;
				jsonObject["waybillId"] 			= dataView.getItem(row).wayBillId;
				jsonObject["wayBillNumber"] 		= dataView.getItem(row).wayBillNumber;
				jsonObject["receivableTotal"] 		= dataView.getItem(row).receivableTotal;
				jsonObject["bookingBranchId"] 		= dataView.getItem(row).bookingBranchId;
				jsonObject["deliveryBranchId"] 		= dataView.getItem(row).deliveryBranchId;
				jsonObject["pendingPaymentTypeId"] 	= dataView.getItem(row).pendingPaymentTypeId;
				
				var array	 = new Array();
				array.push(jsonObject);
				
				var finalJsonObj 					 = new Object();
				finalJsonObj.paymentDataArray  	  	= JSON.stringify(array);
				
				finalJsonObj.isAllowByRecieveAndDueOption  	= isAllowByRecieveAndDueOption;
					
				if(isAllowByRecieveAndDueOption) {
					finalJsonObj.chequeNumber		  			= $('#chequeNumberEle').val();
					finalJsonObj.chequeDate  	  			    = $('#chequeDate').val();
					finalJsonObj.bankName 	  			        = $('#bankNameEle').val();
					finalJsonObj.paymentTypeId 	  			    = Number($('#paymentTypeEle').val());
				}
				
				showLayer();
			  	getJSON(jsonObject, WEB_SERVICE_URL+'/fundTransferWS/saveDataToFundTransfer.do', _this.afterSavingFundTransferData, EXECUTE_WITH_ERROR);
				//hideLayer();
			});	
		},afterSavingFundTransferData : function(response){
			refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
			$('#receiveBtn').hide();
			_this.onPaymentTypeSelect();
			hideLayer();
		},submitDataFromGrid : function (){
			var selectionMsg	= 'Please provide atleast one LR for payment !';
			var paymentTypeId = 0
			
			if(isAllowByRecieveAndDueOption) {
				paymentTypeId = Number($('#paymentTypeEle').val());

				if(paymentTypeId == 0) {
					showMessage('error', 'Please, Select Payment Mode');
					return false;
				}
				
				if(paymentTypeId != PAYMENT_TYPE_CASH_ID) {
					var chequeNumber = $('#chequeNumberEle').val().trim();
					var bankName     = $('#bankNameEle').val().trim();

					if(chequeNumber.length == 0) {
						showMessage('error', 'Please, Select Cheque No/Card No/Reference No !');
						return false;
					}

					if(bankName.length == 0) {
						showMessage('error', 'Please, Select Proper Bank Name !');
						return false;
					}
				}
			}
			
			selectedGridObject = slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'editReportDivInner'}, selectionMsg);
			
			if(selectedGridObject != undefined) {
				if(selectedGridObject.length <= 0 ){
					showMessage('error', selectionMsg);
					return false;
				}
			
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Do you want To Receive Payment of Selected LR'S ?  ",
					modalWidth 	: 	30,
					title		:	'Payment Receive',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
				hideLayer();
				
				btModalConfirm.on('ok', function() {
					var array	 = new Array();
					showLayer();
					
					for(var i = 0; i < selectedGridObject.length; i++) {
						paymentData	= new Object();
						paymentData.bookingBranchId 		= selectedGridObject[i].bookingBranchId;
						paymentData.waybillId 				= selectedGridObject[i].wayBillId;
						paymentData.wayBillNumber 			= selectedGridObject[i].wayBillNumber;
						paymentData.receivableTotal 		= selectedGridObject[i].receivableTotal;
						paymentData.bookingBranchId			= selectedGridObject[i].bookingBranchId;
						paymentData.deliveryBranchId 		= selectedGridObject[i].deliveryBranchId;
						paymentData.pendingPaymentTypeId 	= selectedGridObject[i].pendingPaymentTypeId;
						paymentData.remark 					= selectedGridObject[i].remark;
						
						array.push(paymentData);
					}
					
					var finalJsonObj 					 = new Object();
					finalJsonObj.paymentDataArray  	  			= JSON.stringify(array);
					finalJsonObj.isAllowByRecieveAndDueOption  	= isAllowByRecieveAndDueOption;
					
					if(isAllowByRecieveAndDueOption) {
						finalJsonObj.chequeNumber		  			= $('#chequeNumberEle').val();
						finalJsonObj.chequeDate  	  			    = $('#chequeDate').val();
						finalJsonObj.bankName 	  			        = $('#bankNameEle').val();
						finalJsonObj.paymentTypeId 	  			    = paymentTypeId;
					}
					
					getJSON(finalJsonObj, WEB_SERVICE_URL+'/fundTransferWS/saveDataToFundTransfer.do', _this.afterSavingFundTransferData, EXECUTE_WITH_ERROR);
				});	
			}
		},onTypeSelect : function() {
			pendingDueAndReceiveType = $('#crossingLSEle_primary_key').val();
			$('.hideDiv').removeClass('hide');
			
			if(pendingDueAndReceiveType == LR_PAYMENT_RECEIVED) {
				$('#dateSelectorCheckBox').addClass('hide');
				$('#dateSelector').removeClass('hide');
				//$('#dateSelector').show();
				$('.hideDiv').removeClass('hide');
				$('#paymentTypeDiv').addClass('hide');
				if(allowExecutiveColumnForGroup)
				$('#pendingPaymentTypeLabel').removeClass('hide');
			}else if (pendingDueAndReceiveType == LR_PAYMENT_DUE) {
				$('#dateSelectorCheckBox').removeClass('hide');
				$('#dateSelector').addClass('hide');
				//$('#dateSelector').hide();
				$('.hideDiv').removeClass('hide');
				if(allowExecutiveColumnForGroup)
				$('#pendingPaymentTypeLabel').addClass('hide');
			}
			
			if(byDefaultSelectFixRegionInRegionOption && fixedRegionId > 0) {
				$("#regionEle_primary_key").val(fixedRegionId);
				$("#regionEle").val(fixedRegionName);
			}
			
			if(byDefaultSelectAllInSubRegion) {
				$("#subRegionEle_primary_key").val(-1);
				$("#subRegionEle").val('ALL');
				$("#branchEle_primary_key").val(-1);
				$("#branchEle").val('ALL');
			}
			
			if(byDefaultSelectBothInTxnType) {
				$("#pendingPaymentType_primary_key").val(-1);
				$("#pendingPaymentType").val('Both');
			}
			
			refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
		}, onPaymentTypeSelect : function() {
			var paymentTypeId = Number($('#paymentTypeEle').val());
			$('#chequeNumberEle').val('');
			$('#bankNameEle').val('');
			
			if(paymentTypeId > 0 && paymentTypeId != PAYMENT_TYPE_CASH_ID) {
				$('#chequeNumberDiv').removeClass('hide');
				$('#chequeDateDiv').removeClass('hide');
				$('#bankNameDiv').removeClass('hide');
			} else {
				$('#chequeNumberDiv').addClass('hide');
				$('#chequeDateDiv').addClass('hide');
				$('#bankNameDiv').addClass('hide');
			}
		}, setPendingDueAndReceiveOption : function() {
			var pendingDueAndReceiveArr = '{ "pendingDueAndReceiveArr" : [' +
			'{ "pendingDueAndReceiveId":"' + LR_PAYMENT_RECEIVED +'" , "pendingDueAndReceiveName":"Received Payment" },' +
			'{ "pendingDueAndReceiveId":"' + LR_PAYMENT_DUE + '" , "pendingDueAndReceiveName":"Due Payment" } ]}';
			
			var obj = JSON.parse(pendingDueAndReceiveArr);
			var autoCrossingLSName = $("#crossingLSEle").getInstance();
			
			$(autoCrossingLSName).each(function() {
				this.option.source = obj.pendingDueAndReceiveArr;
			});
			
			if(byDefaultSelectDuePayment) {
				$("#crossingLSEle_primary_key").val(LR_PAYMENT_DUE);
				$("#crossingLSEle").val('Due Payment');
				
				setTimeout(() => {
					_this.onTypeSelect();
				}, 300);
			}
		}
		
	});
});

function noNumbers(evt){
	if (evt.ctrlKey ==1){
		return true;
	}else{
		var keynum = null;
		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}
		if(keynum!=null){
			if(keynum == 8){
				return true;
			} else if(keynum == 45 || keynum == 47) {
				return true;
			} else if (keynum < 48 || keynum > 57 ) {
				return false;
			}
		}
		return true;
	}
}