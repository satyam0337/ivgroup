/**
 * 
 */
define([  
	'slickGridWrapper3'
	,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	],function(slickGridWrapper3, Selection, UrlParameter) {
	'use strict';
	let jsonObject = new Object(),myNod,_this = '', billingPartyId = 0, isExcel = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			billingPartyId 	= UrlParameter.getModuleNameFromParam('masterid');
			_this = this;
		}, render : function() {
			jsonObject["BillingPartyId"] = billingPartyId;
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/lRRegisterReportWS/getLRRegisterReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response) {
			if(response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			let loadelement 	= new Array();
			let baseHtml 		= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lrRegister/lrRegister.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
			
				let elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true
				
				Selection.setSelectionToGetData(response);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				hideLayer();

				if(response.showDownloadPOD)
					$('#downloadPOD').css('display', 'inline');
				else
					$('#downloadPOD').remove();
				
				if(response.allowDownloadToExcel)
					$('#downloadExcel').css('display', 'inline');
				else
					$('#downloadExcel').remove();
					
				if(response.showDownloadPOD)
					$('#rangePanel').removeClass('hide');
				else
					$('#rangePanel').remove();
					
				$("#searchBtn").click(function() {
					myNod.performCheck();
					isExcel = false;
				
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				$("#downloadExcel").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						isExcel = true;
						_this.onSubmit();
					}
				});
				
				$("#downloadPOD").click(function() {
					_this.downloadPOD(response);
				});
				
				$('#fromNum').on('keyup',function(e){
					let check = allowOnlyNumeric(e);
					if(!check){
						$('#fromNum').val('');
					}
				});
				
				$('#toNum').on('keyup',function(e){
					let check = allowOnlyNumeric(e);
					if(!check){
						$('#toNum').val('');
					}
				});
				
				$('#fromNum').blur(function(e){
					let check =$('#fromNum').val();
					if(Number(check) == 0){
						$('#fromNum').val('');
						$('#fromNum').focus();
						showMessage('error','<i class="fa fa-warning"></i> From Value Should Be Greater than Zero. ');
					}
				});
				
				$('#toNum').blur(function(e){
					let check =$('#toNum').val();
					if(Number(check) == 0){
						$('#toNum').val('');
						$('#toNum').focus();
						showMessage('error','<i class="fa fa-warning"></i> To Value Should Be Greater than Zero. ');
					}
				});
				
				
			});
		}, onSubmit : function() {
			showLayer();
			
			let jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			
			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			//temp basis testing purpose
			//no need to remove, just make it 0
			jsonObject["BillingPartyId"] = billingPartyId;
			jsonObject.isExcel = isExcel;
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/lRRegisterReportWS/getLRRegisterDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			$("#ddmRegisterReportDiv").empty();
			$("#SummaryDiv").empty();

			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				
				if(isExcel && response.FilePath != undefined)
					downloadFile(response, CUSTOMER_ACCESS_URL_CONSTANT);
					
				return;
			}

			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				
				let tableProperties	= response.tableProperties;
				
				slickGridWrapper3.applyGrid({
						ColumnHead					: _.values(response.columnConfiguration), // *compulsory // for table headers
						ColumnData					: _.values(response.CorporateAccount), 	// *compulsory // for table's data
						Language					: {}, 			// *compulsory for table's header row language
						tableProperties				: response.tableProperties,
						SerialNo:[{						// optional field // for showing Row number
							showSerialNo	: tableProperties.showSerialNumber,
							SearchFilter	: false,	// for search filter on serial no
							ListFilter		: false,	// for list filter on serial no
							title			: "Sr No."
						}],
						NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
					});
			}
									
			hideLayer();
		}, downloadPOD	: function(response) {
			let jsonObject	= {};
			let selectionMsg	= ' Please, Select atleast 1 LR for POD !';
			const limitCheckBox	  = true;
			const maxSelection	  = 200;

			if(response.showDownloadPOD){
				let jsonObj = {};
				jsonObj.fromNum = $('#fromNum').val();
				jsonObj.toNum 	= $('#toNum').val();
				jsonObj.maxSelection = maxSelection;
				jsonObj.checkMaxDifference = true;
				
				if(jsonObj.fromNum > 0 && jsonObj.toNum > 0) {
					let gridObj 	= slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'editReport'});
					let rangeCheck 	= slickGridWrapper3.selectCheckboxesInRange(gridObj, jsonObj)
					
					if(!rangeCheck) {
						slickGridWrapper3.unselectAllCheckboxes(gridObj);
						return;
					}
				}
			}
			
			let selectedLRDetails = slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'editReport'}, selectionMsg);
			
			if(typeof selectedLRDetails == 'undefined')
				return;
					
			let selectedCheckBox  = slickGridWrapper3.limitCheckboxSelection({InnerSlickId : 'editReport'}, limitCheckBox, maxSelection);
			
			if(!selectedCheckBox)
				return;
					
			let	wayBillIds				= [];

			for(const element of selectedLRDetails) {
				wayBillIds.push(element.wayBillId);
			}
						
			jsonObject.BillingPartyId	= billingPartyId;
			jsonObject.wayBillIds		= wayBillIds.join(',');
			jsonObject.moduleId			= 2;//POD_WAYBILL
			jsonObject.serviceId		= 1; 
			
			showLayer();
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT + '/lRRegisterReportWS/getPhotoDetails.do?', _this.responseForZip, EXECUTE_WITH_ERROR);
		}, responseForZip : function(data) {
			hideLayer();
			let fileName	= data.fileName;
			
			if(data.message != undefined) {
				let errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}

			if(fileName == undefined)
				return;
				
			downloadZipFile(data, CUSTOMER_ACCESS_URL_CONSTANT);
		}
	});
});

function searchAllCharges(grid, dataViewObject, row) {
	require(['/ivcargo/resources/js/module/view/lrregister/showcharges.js',
		'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'], function(ShowCharges) {
		let object = new Object();
		object.row = dataViewObject.getItem(row)

		let btModal = new Backbone.BootstrapModal({
			content: new ShowCharges(object),
			modalWidth : 50,
			showFooter : true
		}).open();
		object.btModal = btModal;
		new ShowCharges(object)
		btModal.open();
	})
}  
		   
function allowOnlyNumeric(evt) {
	const iconForWarningMsg			= '<i class="fa fa-warning"></i>';
	const numericAllowWarningMsg	= iconForWarningMsg+' Only 0-9 allowed !';
	if (evt.ctrlKey == 1) {
		return true;
	}else if(evt.keyCode == 9) {
		return true;
	} else {
		let keynum 	= null;
		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
		console.log('else if  -- ')
			keynum = evt.which;
			console
		}
		if(keynum != null) {
			if((keynum >= 48 && keynum <= 57 ) || (keynum >= 96 && keynum <= 105)){
				hideAllMessages();
				return true;
			}else if(keynum == 8) {
				hideAllMessages();
				return true;
			} else {
				showMessage('warning', numericAllowWarningMsg);
				return false;
			}
		}
		return true;
	}
}