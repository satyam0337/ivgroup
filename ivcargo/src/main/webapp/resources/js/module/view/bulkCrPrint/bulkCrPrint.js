define([
			'slickGridWrapper3',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
			'JsonUtility',
			'messageUtility',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			],//PopulateAutocomplete
			function(slickGridWrapper, Selection) {
			'use strict';
			let 
			_this = '',
			crNumberWithBranchCode = true,
			childwin,
			config,
			deliveryRunSheetLedgerId;

			let jsonObject = new Object(), myNod;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/bulkCrPrintWS/getBulkCRPrintElement.do?',	_this.renderElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderElements : function(response) {
					showLayer();

					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/bulkCrprint/bulkCRPrint.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();

						let elementConfiguration	= new Object();

						elementConfiguration.branchElement	= $('#branchEle');
						elementConfiguration.dateElement	= $('#dateEle');
						
						if(response.showSingleDate)
							response.isCalenderForSingleDate 	= response.showSingleDate;
						else
							response.isCalenderSelection	 	= true;
							
						response.elementConfiguration		= elementConfiguration;
						response.executiveTypeWiseBranch	= true;

						Selection.setSelectionToGetData(response);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector		: '#crNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter CR No !'
						});
						
						myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});
						
						myNod.add({
							selector		: '#crNumberFromEle',
							validate		: 'presence',
							errorMessage	: 'Select From Range !'
						});
						
						myNod.add({
							selector		: '#crNumberToEle',
							validate		: 'presence',
							errorMessage	: 'Select To Range !'
						});

						$("#findCR").click(function() {
							myNod.performCheck();
						
							let fromRange = 0; 
							let toRange  = 0; 
							let deff =0; 
						
							if(myNod.areAll('valid')) {
								if($('#crNumberFromEle').val().includes("/") && !$('#crNumberToEle').val().includes("/") ||
								!$('#crNumberFromEle').val().includes("/") && $('#crNumberToEle').val().includes("/")) {
									showMessage('error', iconForErrMsg + 'Please Enter Valid Range !');
									return;
								}
								
								if($('#crNumberFromEle').val().includes("/") && $('#crNumberToEle').val().includes("/")){
									fromRange 	= $('#crNumberFromEle').val().split("/")[1]; 
									toRange 	= $('#crNumberToEle').val().split("/")[1]; 
									crNumberWithBranchCode	= true;
								} else {
									crNumberWithBranchCode = false;
									fromRange 	= $('#crNumberFromEle').val(); 
								 	toRange		= $('#crNumberToEle').val(); 
								}
								
								deff = toRange - fromRange; 
								
								if(deff > response.maximumCrLimit) {
									showMessage('error', iconForErrMsg + 'Please Enter Range Upto '+response.maximumCrLimit+' CRs  !');
									return;
								} else if(deff < 0) {
									showMessage('error', iconForErrMsg + 'Please Enter Valid Range !');
									return;
								}
								
								_this.crDetails();
							}
						});

						$("#printMultiCR").click(function() {
							_this.printMultiCR();
						});
					});
				},crDetails : function() {
					showLayer();
					let jsonObject = new Object();
					
					if($("#dateEle").attr('data-startdate') != undefined){
						jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
					}
		
					if($("#dateEle").attr('data-enddate') != undefined){
						jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
					}

					jsonObject["crNumberFrom"] 						= $('#crNumberFromEle').val();
					jsonObject["crNumberTo"] 						= $('#crNumberToEle').val();
					jsonObject["sourceBranchId"] 					= $('#branchEle_primary_key').val();
					jsonObject["crNumberWithBranchCode"] 			= crNumberWithBranchCode;
					
					getJSON(jsonObject, WEB_SERVICE_URL+'/bulkCrPrintWS/getBulkCRDetails.do?', _this.crDetailsByCRNumber, EXECUTE_WITH_ERROR);
				},crDetailsByCRNumber : function(response) {
					if(response.message != undefined){
						hideLayer();
						$('#middle-border-boxshadow').hide();
						$('#bottom-border-boxshadow').hide();
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + '  ' +  errorMessage.description);
						return;
					}
					
					deliveryRunSheetLedgerId	= response.deliveryRunSheetLedgerId;

					let language	= {'partialheader' : 'Print CR'};

					if(response.CorporateAccount != undefined) {
						let tableProperties	= response.tableProperties;
					
						$('#bottom-border-boxshadow').show();
							hideAllMessages();

							slickGridWrapper.applyGrid({
								ColumnHead					: _.values(response.columnConfiguration), // *compulsory // for table headers
								ColumnData					: _.values(response.CorporateAccount), 	// *compulsory // for table's data
								Language					: language, 			// *compulsory for table's header row language
								tableProperties				: tableProperties,
								SerialNo:[{						// optional field // for showing Row number
									showSerialNo	: tableProperties.showSerialNumber,
									SearchFilter	: false,	// for search filter on serial no
									ListFilter		: false,	// for list filter on serial no
									title			: "Sr No."
								}],
								NoVerticalScrollBar			: false
							});
					}else {
						$('#bottom-border-boxshadow').hide();
					}

					hideLayer();
				}, printMultiCR	: function() {
					let selectionMsg	= ' Please, Select atleast 1 LR for Print !';
					let selectedLRDetails	= slickGridWrapper.getValueForSelectedData({InnerSlickId : 'crDetailsDiv'}, selectionMsg);

					if(typeof selectedLRDetails == 'undefined')
						return;
					
					let selectedLRDetailsLength	= selectedLRDetails.length;
					let	crIds					= [];

					for(let i = 0; i < selectedLRDetailsLength; i++) {
						crIds.push(selectedLRDetails[i].crId)
					}
						
					localStorage.setItem("crIdString", crIds.join(','));
					childwin = window.open('printWayBill.do?pageId=340&eventId=10&modulename=multiCRPrint&masterid=0&bulkCrPrint=true','newwindow', config='height=300,width=425, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}, printCR	: function(){
					newwindow=window.open('DoorDeliveryPrint.do?pageId=304&eventId=5&deliveryRunSheetLedgerId='+deliveryRunSheetLedgerId, 'newwindow', config='height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}
			});
		});
