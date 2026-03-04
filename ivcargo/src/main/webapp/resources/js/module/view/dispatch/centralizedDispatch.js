var selectedRowsCount		=0,
pendingArraylength			= 0,
tableData					=	new Array(),
selectedWayBillIdsArray		=	null,
pendingLRsArray				= 	new Array(),
tableDataKey				= 	new Array(),
pendingDispatchFinalArr		= 	new Array(),
destinationBranches			= 	new Array(),
finalHm						=	new Object(),
pendingDispatchArrHm		=	new Object(),
pendingDispatchBranchId		=	0,
prevBillSelectionId			= 	0;
define([  
		PROJECT_IVUIRESOURCES + '/resources/js/module/view/dispatch/centralizedDispatchFilePath.js'
		,'selectizewrapper'
		,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
		,'JsonUtility'
		,'messageUtility'
		,'jquerylingua'
		,'language'
        ,'autocomplete'
        ,'autocompleteWrapper'
        ,'nodvalidation'
        ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
        ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
        ,'focusnavigation'//import in require.config
        ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populatesubregionandbranch.js'//PopulateAutocomplete
		,PROJECT_IVUIRESOURCES + '/resources/js/filterTable/excel-bootstrap-table-filter-bundle.js'
          ],function(FilePath, Selectizewrapper, UrlParameter) {
	'use strict';
	let jsonObject = new Object(), myNod,sourceBranchArray	=	new Array(),doneTheStuff	= false, _this = '',  
	allOptionsForBranch	= false, allowSubRegionWiseBraches	= false,dispatchId, centralizedDispatchConfig = null, lsNumber, showSourceBranchesSelection = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			dispatchId 				= UrlParameter.getModuleNameFromParam(MASTERID);
			lsNumber   				= UrlParameter.getModuleNameFromParam(MASTERID2);
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/centralizedDispatchWS/getDispatchElementConfiguration.do?',	_this.renderElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderElements : function(response){
			hideLayer();
			tableDataKey				= Object.keys(response.configuration);
			tableData					= response.configuration;
			centralizedDispatchConfig	= response;
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/dispatch/centralizedDispatch.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(response.billSelection) {
					$('#BillSelection').removeClass('hide');
					_this.setBillSelection(response);
				}
				
				if(dispatchId != null && lsNumber != null) {
					showMessage('success', 'LS ' + lsNumber + ' created successfully !');
					$('.printButton').removeClass('hide');
						$("#rePrint").click(function() {
							_this.openPrint(dispatchId);
						});
						
					_this.openPrint(dispatchId);
					$('#lsNumber').html(lsNumber)
					hideLayer();
				}
			
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (!response[element])
						$("*[data-attribute="+ element+ "]").addClass("hide");
				}
				
				sourceBranchArray			= response.sourceBranchCollection;
				allOptionsForBranch			= response.AllOptionsForBranch;
				allowSubRegionWiseBraches	= response.allowSubRegionWiseSourceBraches;
				showSourceBranchesSelection	= response.showSourceBranchesSelection;
				
				let subRegionAutoComplete = new Object();
				subRegionAutoComplete.primary_key 	= 'subRegionId';
				subRegionAutoComplete.field 		= 'subRegionName';
				subRegionAutoComplete.url			= response.sourceAreaCollection;
				subRegionAutoComplete.callBack 		= _this.onSubRegionSelect;
				$("#subRegionEle").autocompleteCustom(subRegionAutoComplete);
				
				loadLanguageWithParams(FilePath.loadLanguage());
				
				if(showSourceBranchesSelection)
					$('#sourceBranch').removeClass('hide');
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#branchSelectEle',
					validate : 'presence',
					errorMessage: 'Select proper Region !'
				});

				myNod.add({
					selector: '#subRegionEle',
					validate : 'presence',
					errorMessage: 'Select proper Area !'
				});

				myNod.add({
					selector: '#branchEle',
					validate : 'presence',
					errorMessage: 'Select proper Branch !'
				});
				
				if($('#billSelectionEle').exists() && $('#billSelectionEle').is(":visible")){
					myNod.add({
						selector: '#billSelectionEle',
						validate: 'presence',
						errorMessage: 'Please Select Bill Selection Type !'
					});
				}

				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.submitData();
				});
				
				$("#singleLREle").keydown(function (event) {
					if(getKeyCode(event) == 13){_this.submitDataOnLRNumber();}
				});

				_this.setCrossingAgent(response.crossingAgentArr);
				_this.setVehicleNumber();
				_this.setLicenceNumber();
				
				$("#manualLSDateEle").SingleDatePickerCus({
					minDate 	: response.minDate,
					maxDate		: response.maxDate,
					startDate 	: response.maxDate
				});
			});
			
			hideLayer();
		}, onSubRegionSelect : function() {
			let subRegionId = Number($('#subRegionEle_primary_key').val());
			let array = sourceBranchArray.filter(function(el) { return el.branchSubregionId == subRegionId; });
			
			if(allOptionsForBranch)
				array.unshift({ branchId: 0, branchName: "All" });
				
			array.unshift({branchName:"Select"});
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	array,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'branchEle',
				create			: 	false,
				maxItems		: 	1,
				onChange		:   _this.onBranchSelect
			});
		}, onBranchSelect : function() {
			jsonObject = new Object();
			jsonObject.sourceBranchId = Number($('#branchEle').val());
			jsonObject.subRegionId = Number($('#subRegionEle_primary_key').val());
			getJSON(jsonObject,	WEB_SERVICE_URL + '/centralizedDispatchWS/getOperationalBranchOption.do?', _this.setOperationalBranch,EXECUTE_WITHOUT_ERROR);
		}, setOperationalBranch : function (jsonObj) {
			let branchCollection = jsonObj.branchCollection;
			branchCollection.unshift({branchId:0,branchName:"All"});
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	branchCollection,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'branchSelectEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, submitData : function() {
			jsonObject = new Object();
			jsonObject.sourceBranchId 		= Number($('#branchEle').val());
			jsonObject.destinationBranchId 	= Number($('#branchSelectEle').val());
			jsonObject.lrNumber 			= '';
			jsonObject.subRegionId 			= Number($('#subRegionEle_primary_key').val());
			jsonObject.billSelectionId		= $('#billSelectionEle_primary_key').val();
			getJSON(jsonObject,	WEB_SERVICE_URL + '/centralizedDispatchWS/getPendingWaybillForCentralizedDispatch.do?', _this.setReportData,EXECUTE_WITHOUT_ERROR);
		}, submitDataOnLRNumber : function() {
			jsonObject = new Object();
			jsonObject.lrNumber 			= $('#singleLREle').val();
			getJSON(jsonObject,	WEB_SERVICE_URL + '/centralizedDispatchWS/getPendingWaybillForCentralizedDispatch.do?', _this.setDataOnLrNumber,EXECUTE_WITHOUT_ERROR);
		}, setReportData : function(response) {
			showLayer();
			$('#reportData1 tbody').empty();
		
			if(response.pendingDispatchArr != undefined){
				var	pendingDispatchArr 		= response.pendingDispatchArr;
				pendingDispatchArrHm 		= response.pendingDispatchArrHm;
				pendingArraylength			= pendingDispatchArr.length;
				selectedWayBillIdsArray		= new Array();
				
				if(pendingDispatchBranchId == 0)
					pendingDispatchBranchId = Number($('#branchEle').val());
				else if(pendingDispatchBranchId !=  Number($('#branchEle').val())){
					showMessage('error', iconForErrMsg + 'Select Same Branch LRs !');
					hideLayer();
					return;
				}
				
				/*Header data Start*/
				_this.setHeaderRow(true,'reportData1'); 
				/*header data End*/
					
				/*Table data Start*/		
					_this.setTableDataRow(pendingDispatchArr,true,'reportData1'); 
					$('#table').excelTableFilter();
				/*Table data End*/	  
				
				/*Footer data Start*/
					_this.setFooterRow(pendingDispatchArr,true,'reportData1');
				/*Foor data End*/	
					}				
				  
				  /*		On checkBox Select*/
				  $("#selectAll").click(function(){
					if($("#selectAll").prop("checked")){
						selectedWayBillIdsArray = pendingDispatchArr.reduce(function (accumulator, curValue) {
							accumulator.push(curValue["wayBillId"]);
							return accumulator;
						}, [])
					 	selectedRowsCount =	selectedWayBillIdsArray.length;
					}else{
						selectedRowsCount = 0;
						selectedWayBillIdsArray = []
					}
							
					$("input[type=checkbox]").prop('checked', $(this).prop('checked'));
					$(".checkBoxdatatd").prop('checked', $(this).prop('checked'));
				});
			
                $("input[type=checkbox]").click(function(e) {
					var waybIllId	=	Number(e.target.value);
					var indexPos	= 	selectedWayBillIdsArray.indexOf(waybIllId);
						    if (!$(this).prop("checked") && $("#selectAll").prop("checked") ) {
								selectedRowsCount = selectedRowsCount - 1;
						        $("#selectAll").prop("checked", false);
						        selectedWayBillIdsArray.splice(indexPos, 1)
						    }else if(!$("#selectAll").prop("checked") && $(this).prop("checked")){
								selectedRowsCount = selectedRowsCount + 1;
								selectedWayBillIdsArray.push(waybIllId)
							}else if(!$(this).prop("checked") && selectedRowsCount > 0){
								selectedRowsCount = selectedRowsCount - 1;
								 selectedWayBillIdsArray.splice(indexPos, 1);
							}
					});
			
			/*TO Close Filter PopUp*/
				$(".closeFilter").click(function(){$('.dropdown-filter-content').css("display", 'none');});
				
			$('#btnTrigger').click();
			
			hideLayer();
			
				$("#add").click(function() {
					if(selectedRowsCount<=0){
						showMessage("error", "Please Select AtLeast One Lr For Dispatch");
					}else{
						$('#closeModel').click();
						_this.setDispatchData();
					}
				});
		},setDataOnLrNumber : function(response) {
			let	lrWiseHm					= response.pendingDispatchArrHm;
			let	lrWiseHmKey					=  Object.keys(lrWiseHm);
				selectedWayBillIdsArray		= new Array();
			let pendingDispatchStockBranchId	= lrWiseHm[lrWiseHmKey][0].pendingDispatchStockBranchId;
			let billSelectionId					= lrWiseHm[lrWiseHmKey][0].billSelectionId;
			let srcAreaBranchId					= Number($('#branchEle').val());
			pendingDispatchArrHm[lrWiseHmKey] = lrWiseHm[lrWiseHmKey];
	
			if(centralizedDispatchConfig.billSelection && prevBillSelectionId <= 0){
				prevBillSelectionId = lrWiseHm[lrWiseHmKey][0].billSelectionId
			}

			if((srcAreaBranchId > 0 && srcAreaBranchId != pendingDispatchStockBranchId) || (pendingDispatchBranchId > 0 && pendingDispatchStockBranchId != pendingDispatchBranchId)){
				showMessage('error', iconForErrMsg + 'Select Same Branch LRs !');
				return;
			} else if(prevBillSelectionId > 0 && billSelectionId > 0 && billSelectionId != prevBillSelectionId){
				showMessage('error', iconForErrMsg + 'Bill Lrs Not Allowed with Estimate Lrs !');
				return;				
			} else
				pendingDispatchBranchId = pendingDispatchStockBranchId;
		
			selectedWayBillIdsArray.push(Number(lrWiseHmKey));
			_this.setDispatchData();
		},setDispatchData : function() {
			
				var duplicateLRAdded	= false;
			//	pendingDispatchFinalArr = new Array();
				selectedWayBillIdsArray.forEach((element) => {
					if (!pendingLRsArray.includes(element)){ 
						pendingLRsArray.unshift(element);
					} else
					    duplicateLRAdded = true;
					});
					selectedWayBillIdsArray = [];
					
					if(duplicateLRAdded)
						showMessage("error", "LR Already Added !");
			
				pendingLRsArray.forEach((element) => {
					if(finalHm[element] == undefined && pendingDispatchArrHm[element] != undefined){
					   pendingDispatchFinalArr.unshift(pendingDispatchArrHm[element][0]);
					   finalHm[element]	= pendingDispatchArrHm[element][0]
					   }
					});
					
			if(pendingDispatchFinalArr != undefined){
					
					/*Header data Start*/
					 	_this.setHeaderRow(false,'dispatchtableData'); 
					/*header data End*/
					
					/*Table data Start*/		
					_this.setTableDataRow(pendingDispatchFinalArr,false,'dispatchtableData'); 
					  $('#dispatchtable').excelTableFilter();
					/*Table data End*/	  
			
					/*Footer data Start*/
					_this.setFooterRow(pendingDispatchFinalArr,false,'dispatchtableData');
					/*Foor data End*/	
					}
					
				/*	SummaryData*/
					_this.setSummaryData();	
			
			$(".closeFilter").click(function(){$('.dropdown-filter-content').css("display", 'none');});		
						
			$('.remove').click(function(event) {
				let rowId =	(event.target.id).split('_')[1];
				_this.removeDataRow(rowId);
			});
			
			$('#dispatch').click(function() {
				$('#dispatchtruckData').click();
				
				if(pendingDispatchFinalArr.length == 0) {
					$('.close').click();
				 	$('#dispatchModel').modal('toggle');
					showMessage('error', 'Please Select At Least One LR');
				} else
					_this.setDispatchTruckData();
			});
			
			$('#middle-border-boxshadow').removeClass('hide');
			$('#dispatch').removeClass('hide');
			$('#dispatchDataTable').removeClass('hide');
			$('#saveChargesBtn').removeClass('hide');
		}, removeDataRow: function(rowId) {
			var row = $('#removeBookingCharges_' + rowId).closest('tr');
			setTimeout(function() {
				let siblings = row.siblings();
				row.remove();
				
				siblings.each(function(index) {
					this.firstChild.nextElementSibling.innerHTML=index + 1;
				});
				
			}, 100);
			
			let wayBillId	=	 Number(rowId);
			let indexPos	= 	pendingLRsArray.indexOf(wayBillId);
			 pendingLRsArray.splice(indexPos, 1);
	
			pendingDispatchFinalArr = pendingDispatchFinalArr.filter(function(el) { return el.wayBillId != wayBillId; });
			_this.setFooterRow(pendingDispatchFinalArr,false,'dispatchtableData'); 
			finalHm[wayBillId] = undefined ;
			
			if(pendingDispatchFinalArr.length == 0){
				pendingDispatchBranchId = 0;
				prevBillSelectionId = 0;
				$('#dispatch').addClass('hide');
			}
			
			_this.setSummaryData();	
		}, setHeaderRow: function(showCheckBox,tableId) {
			let headerColumnArray		= new Array();
			$('#'+tableId+' thead').empty();
					
			if(showCheckBox)
				headerColumnArray.push("<th class='checkBox'  style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'><input type='checkBox' id='selectAll'></th>");
			else
				headerColumnArray.push("<th class='checkBox'  style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'>Remove</th>");
					
			headerColumnArray.push("<th class='srNo' style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'>Sr No.</th>");
					
			for (const element of tableData) {
				let showColumn				=	element.show;
				let value					=	element.dataDtoKey;
				let columnDisplayCssClass	=	element.columnDisplayCssClass;
				var columnWidth				=	element.columnWidth;
				var fontSize				=	element.fontSize;
				let header					=	element.title;
								
				if(showColumn)
					headerColumnArray.push("<th class='"+columnDisplayCssClass+" "+value+"' style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'>"+header+"</th>");
			}
					
			$('#'+tableId+' thead').append('<tr>' + headerColumnArray.join(' ') + '</tr>');
			headerColumnArray	=	[];
		}, setTableDataRow: function(pendingDispatchFinalArr,showCheckBox,tableId) {
			let columnArray				= new Array();
			let count					= 0;
			$('#'+tableId+' tbody').empty();
					
				for (let i = 0; i < pendingDispatchFinalArr.length; i++) {
					var obj = pendingDispatchFinalArr[i];
					count =count + 1;
					
					if(showCheckBox)
						columnArray.push("<td class='checkBoxdatatd' style='text-align: center; vertical-align: middle; font-size:15px;''><input type='checkBox' value='"+obj["wayBillId"]+"'></td>");
					else
						columnArray.push("<td class='' style='text-align: center; vertical-align: middle; font-size:13px;''><button style='border-radius:10px;' type='button' class='btn btn-danger btn-sm remove' id='removeBookingCharges_" + obj["wayBillId"] + "'>Remove</button></td>");
					
					columnArray.push("<td class='datatd bold' row='row_"+count+"' value='"+obj["wayBillId"]+"' style='text-align: center; vertical-align: middle; font-size:15px;''>" + count + "</td>");
					
					for (const element of tableData) {
						var showColumn				= element.show;
						var value					= element.dataDtoKey;
						var columnDisplayCssClass	= element.columnDisplayCssClass;
						var columnWidth				= element.columnWidth;
						var fontSize				= element.fontSize;
						//var wayBillIdStr			=	"wayBillId";
						
						if(showColumn){
							columnArray.push("<td class='"+columnDisplayCssClass+"' id='"+value+"_"+obj["wayBillId"]+"' style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'>"+obj[value]+"</td>");
						}
					}	
					$('#'+tableId+' tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray	= [];
				}
		}, setFooterRow: function(pendingDispatchFinalArr,showCheckBox,tableId) {
			let totalColumnArray		= new Array();
				$('#'+tableId+' tfoot').empty();
		
			totalColumnArray.push("<td><b>Total</b></td>");
			totalColumnArray.push("<td><b></b></td>");
						 
			$('.checkBox').children("div").css({"width": '40px',"display":"none"});
			$('.srNo').children("div").css({"width": '60px',"display":"none"});
				
			$(".dropdown-filter-menu-search").after("<button style='margin-top:10px;' class='closeFilter'><b>Close</b></button>");
		
			for (const element of tableData) {
				let showColumn				= element.show;
				var value					= element.dataDtoKey;
				let columnDisplayCssClass	= element.columnDisplayCssClass;
				let columnWidth				= element.columnWidth;
				let fontSize				= element.fontSize;
				let displayColumnTotal			= element.displayColumnTotal;
						
				if(showColumn){		
					$('.'+value+' .dropdown-filter-dropdown').addClass(''+columnDisplayCssClass+'');
				 	$('.'+value).children("div").css("width", ''+columnWidth+'px');
						
					if(displayColumnTotal){
						let total =	  pendingDispatchFinalArr.reduce((a, b) => a + (b[value] || 0), 0);
						totalColumnArray.push("<td class='"+columnDisplayCssClass+" ' style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'> "+total+" </td>");
					} else
						totalColumnArray.push("<td class='"+columnDisplayCssClass+"' style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'>  </td>");
				}
			}
					
			$('#'+tableId+' tfoot').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
			totalColumnArray	=	[];
						
			$('td').css("padding", '4px');
					 
			 /*TO Hidw footer if filter selected*/
			$(document).click(function() {
				if ($('.dropdown-filter-content').is(":visible"))
			 		  $('tfoot').addClass('hide');
				else
					 $('tfoot').removeClass('hide');
			});
		}, setSummaryData: function() {
			let totalLrs 		= 0;
			let partialLrs 		= 0;
			let weight 			= 0;
			let article			= 0;
			let totalPaid		= 0;
			let totalToPay		= 0;
			let totalTbb		= 0;
			let totalAmount		= 0;
			 
			for(let key in finalHm){
				if(finalHm[key] != undefined){
					let obj = finalHm[key];
					totalLrs = totalLrs + 1;
					
					if(obj.partial)
						partialLrs =  partialLrs +1;
						
					if(obj.wayBillTypeId == 1){
						totalPaid = totalPaid + obj.amount;
					}else if(obj.wayBillTypeId == 2){
						totalToPay = totalToPay + obj.amount;
					}else if(obj.wayBillTypeId == 4){
						totalTbb = totalTbb + obj.amount;
					}
				 	weight = weight + obj.consignmentSummaryActualWeight;
				 	article =  article + obj.pendingDispatchArticleQuantity;
				 	totalAmount = totalAmount + obj.amount;
				 	destinationBranches.push(obj.wayBillDestinationBranchId);
				}
			}
			
			$('#datatotalNumberofRows').html(totalLrs);
			$('#datasummaryPartial').html(partialLrs);
			$('#datapendingWeight').html(weight);
			$('#datapendingQuantity').html(article);
			$('#datasummarytotalPaidAmount').html(totalPaid);
			$('#datasummarytotalToPayAmount').html(totalToPay);
			$('#datasummarytotalTbbAmount').html(totalTbb);
			$('#datasummarytotalAmount').html(totalAmount);
		}, setDispatchTruckData : function () {
			showLayer();
				myNod = nod();
				_this.getDestination();
				
				if(showSourceBranchesSelection) {
					if(allowSubRegionWiseBraches)
						_this.setSource({});
					else
						_this.getSource();
				}
				
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#vehicleNumberEle',
					validate: 'validateAutocomplete:#vehicleNumberEle_primary_key',
					errorMessage: 'Select proper Vehicle !'
				});

				myNod.add({
					selector: '#driverNameEle',
					validate : 'presence',
					errorMessage: 'Select Enter Driver Name !'
				});

				myNod.add({
					selector: '#driverMobileNumberEle',
					validate		: 'presence',
					errorMessage: 'Select Enter Driver Mobile Number !'
				});
				
				myNod.add({
					selector: '#driverMobileNumberEle',
					validate		: 'integer',
					errorMessage	: 'Should be numeric'
				});
				
				myNod.add({
					selector		: '#truckDestinationEle',
					validate		: 'presence',
					errorMessage	: 'Select Truck Destination !'
				});
				
				setTimeout(function(){
					if($('#sourceBranchEle').exists() && $('#controlinput_sourceBranchEle').is(":visible")) {
						myNod.add({
							selector		: '#sourceBranchEle',
							validate		: 'presence',
							errorMessage	: 'Select Source Branch !'
						});
					}
				},1000);
			
			$(".dispatchFinalData").click(function() {
				myNod.performCheck();
				
				if(myNod.areAll('valid')){
					if($('#manualLSDateEle').is(":visible") && !_this.validateManualLsDateWithAllLrs(pendingDispatchFinalArr))
						return false;
						
					if($('#controlinput_sourceBranchEle').is(":visible") && $('#sourceBranchEle').val() == $('#truckDestinationEle').val()) {
						showMessage('error','Source Branch And Unloading Branch Cannot Be Same !');
						return false;					
					}
					
					if(centralizedDispatchConfig.blockDispatchWithSameSourceAndDestinationBranch && $('#branchEle').val() == $('#truckDestinationEle').val()) {
						showMessage('error','Source Branch And Unloading Branch Cannot Be Same !');
						return false;					
					}
					
					let finalJsonObj = new Object();
					finalJsonObj.lrArray  			= JSON.stringify(pendingDispatchFinalArr);
					//finalJsonObj.lorryHireDetails	= JSON.stringify(lorryHireDetails);
					
					let jsonObject = new Object();
					let $inputs = $('#truckInfo :input');
					//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
					$inputs.each(function () {
						if($(this).val() != ""){
							jsonObject[$(this).attr('name')] = $.trim($(this).val());
						}
					});
					
					if(Number($('#branchEle').val()) > 0)
						jsonObject["sourceBranchId"] = Number($('#branchEle').val());
					else
						jsonObject["sourceBranchId"] = pendingDispatchBranchId;

					if($('#crossingAgentSelectEle_primary_key').val() > 0){
						jsonObject["crossingAgentId"] = $('#crossingAgentSelectEle_primary_key').val();
						jsonObject["isAgentCrossing"] = true;
					}
					
					jsonObject['truckDestinationEle_primary_key']	= $('#truckDestinationEle').val();
					jsonObject['manualLSDate']						= $('#manualLSDateEle').val();
					
					if(!$('#truckDestinationEle').exists())
						jsonObject['truckDestinationEle_primary_key']	= pendingDispatchFinalArr[0].wayBillDestinationBranchId;
						
					if($('#vehicleAgentListEle_primary_key').val() > 0)
						jsonObject["vehicleAgentMasterId"] 		= $('#vehicleAgentListEle_primary_key').val();
						
					if($('#sourceBranchEle').length > 0 && $('#sourceBranchEle').val() > 0)
						jsonObject["sourceBranchId"] = $('#sourceBranchEle').val();
					
					jsonObject.blockDispatchWithSameSourceAndDestinationBranch	= centralizedDispatchConfig.blockDispatchWithSameSourceAndDestinationBranch;
					
					finalJsonObj.jsondata = JSON.stringify(jsonObject);
					finalJsonObj.isCentralizedDispatch = true;
					
					$('#closetruckInfoModel').click();
				
					let btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Do you sure you want to Dispatch ?",
						modalWidth 	: 	30,
						title		:	'Dispatch',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
							
					btModalConfirm.on('ok', function() {
						$('#modalBody:first *:input[type!=hidden]:first').focus();
							if(!doneTheStuff) {
								getJSON(finalJsonObj, WEB_SERVICE_URL+'/dispatchWs/validateAnddispatchWayBills.do', _this.onDispatch, EXECUTE_WITH_ERROR); //submit JSON
								doneTheStuff	= true;
								showLayer();
							}
						});
							
						btModalConfirm.on('cancel', function() {
							$(".ok").removeClass('hide');
							$(".ok").attr("disabled", false);
							doneTheStuff	= false;
							hideLayer();
						});
					}
				});
				
			hideLayer();
			setTimeout(function(){$('#vehicleNumberEle').focus();},1000);
		}, setVehicleNumber : function () {		
			let autoVehicleNumber = new Object();
			autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
			autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
			autoVehicleNumber.field 		= 'vehicleNumber';
			
			autoVehicleNumber.callBack		= _this.getValidateVehicleNumber;
			$("#vehicleNumberEle").autocompleteCustom(autoVehicleNumber);
			
			let vehicleAgentAutoComplete = new Object();
			vehicleAgentAutoComplete.url = WEB_SERVICE_URL + '/autoCompleteWS/getVehicleAgentAutocomplete.do';
			vehicleAgentAutoComplete.primary_key = 'vehicleAgentMasterId';
			vehicleAgentAutoComplete.field = 'name';
			$("#vehicleAgentListEle").autocompleteCustom(vehicleAgentAutoComplete);
			
		}, getValidateVehicleNumber : function() {
			_this.getVehicleDataOnVehicleSelect();
		}, getVehicleDataOnVehicleSelect : function() {
			let jsonObject = new Object();
			
			if($("#" + $(this).attr("id") + "_primary_key").val() == undefined )
				jsonObject.vehicleNumberMasterId = $("#vehicleNumberEle_primary_key").val();
			else
				jsonObject.vehicleNumberMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
			
			jsonObject["vehicleNumberEle"]				= $('#vehicleNumberEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/dispatchWs/getVehicleNumberDetailsForDispatch.do', _this.setVehicleNumberData, EXECUTE_WITHOUT_ERROR);
		}, setVehicleNumberData  : function(response){
			let vehicleNumberMaster			= response.vehicleNumberMaster;
			$("#vehicleAgentListEle").val(vehicleNumberMaster.vehicleAgentName);
			setTimeout(function(){
				$(".ac_result_area").css('display','none');
				$("#vehicleAgentListEle_primary_key").val(vehicleNumberMaster.vehicleAgentMasterId);
			},600);
			
			if (vehicleNumberMaster.vehicleOwner == HIRED_VEHICLE_ID || vehicleNumberMaster.vehicleOwner == ATTACHED_VEHICLE_ID ) {
				myNod.add({
					selector: '#vehicleAgentListEle',
					validate: 'validateAutocomplete:#vehicleAgentListEle_primary_key',
					errorMessage: 'Select proper Vehicle Agent'
				});
			} else {
				myNod.remove('vehicleAgentListEle');
			}
		}, setCrossingAgent : function (crossingAgentArr) {
			let crossingAgent = new Object();
			crossingAgent.url 			= crossingAgentArr;
			crossingAgent.primary_key 	= 'crossingAgentMasterId';
			crossingAgent.field 		= 'name';
			$("#crossingAgentSelectEle").autocompleteCustom(crossingAgent);
		}, setLicenceNumber : function () {
			let autoLicenceNumber = new Object();
			autoLicenceNumber.url 			= WEB_SERVICE_URL+'/dispatchWs/getLicenceNumberForDispatch.do';
			autoLicenceNumber.primary_key 	= 'driverMasterId';
			autoLicenceNumber.field 		= 'licenceNumberWithDriverName';
			autoLicenceNumber.callBack 		= _this.getDriverNameAndMobNum;
			autoLicenceNumber.show_field 	= 'driverMasterId, driverName, mobileNumber, licenceNumber'; //do not remove driverMasterId from here
			autoLicenceNumber.sub_info 		= true;
			
			$("#driverLicenceNumberEle").autocompleteCustom(autoLicenceNumber);
		},getDriverNameAndMobNum : function() {
			let jsonValue 	= $('#'+$(this).attr('id')).attr('sub_info');
			let obj 		= eval( '(' + jsonValue + ')' );
			//$("#driverLicenceNumberEle").val(obj.licenceNumber);
			$("#driverNameEle").val(obj.driverName);
			$("#driverMobileNumberEle").val(obj.mobileNumber);
			$("#driverIdEle").val(obj.driverMasterId);
			$('#driverLicenceNumberEle_primary_key').val(obj.driverMasterId);
		}, getDestination : function() {
			destinationBranches = getUniqueArr(destinationBranches);
			let object = new Object();
			object.destinationBranchIds = destinationBranches.join(",");
			object.sourceBranchId = Number($('#branchEle_primary_key').val()); 
			object.showCurrentBranchInDestinationList = centralizedDispatchConfig.showCurrentBranchInDestinationList;
			getJSON(object, WEB_SERVICE_URL+'/dispatchWs/getDispatchDestination.do', _this.setDestination, EXECUTE_WITH_ERROR);
		}, setDestination : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.destinationBranch,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'truckDestinationEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, getSource : function() {
			let object = new Object();
			object.executiveId = localStorage.getItem("executiveIdCheck");
			getJSON(object, WEB_SERVICE_URL+'/selectOptionsWS/getBranchAutocomplete.do', _this.setSource, EXECUTE_WITH_ERROR);
		}, setSource : function(response) {
			if(allowSubRegionWiseBraches) {
				let subRegionId = Number($('#subRegionEle_primary_key').val());
				let branchEle	= Number($('#branchEle').val());
				
				let array = sourceBranchArray.filter(function(el) { return el.branchSubregionId == subRegionId; });
				
				if(branchEle > 0)
					array = array.filter(function(el) { return el.branchId === branchEle; });

				response.branchList = array;
			}
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.branchList,
				valueField		:	'branchId',
				labelField		:	'branchName',
				searchField		:	'branchName',
				elementId		:	'sourceBranchEle',
				create			: 	false,
				maxItems		: 	1
			});
		}, onDispatch : function(response) {
			if(response.message != undefined){
				hideLayer();
				doneTheStuff = false;
				TOKEN_KEY			= response.TOKEN_KEY;
				TOKEN_VALUE			= response.TOKEN_VALUE;
				return;
			} else
				$('.close').click();
			
			let MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=centralizedDispatch&'+MASTERID+"="+response.dispatchLedgerId+'&'+MASTERID2+"="+response.lsNumber,{trigger: true});
			hideLayer();
			location.reload();
		}, setBillSelection : function(response) {
			let billSelectionAutoComplete 				= new Object();
			billSelectionAutoComplete.url 				= response.billSelectionList;
			billSelectionAutoComplete.primary_key 		= 'billSelectionId';
			billSelectionAutoComplete.field 			= 'billSelectionName';
			$('#billSelectionEle').autocompleteCustom(billSelectionAutoComplete);
		}, validateManualLsDateWithAllLrs : function(dispatchData) {
			for(const element of dispatchData){
				let waybillDate  = element.incomingDateTimeStampString;
				
				waybillDate  = waybillDate.split("-");
				waybillDate = new Date(waybillDate[2], parseInt(waybillDate[1],10) - 1, waybillDate[0]);
				
				let manualLSDate = $('#manualLSDateEle').val().split("-");
				manualLSDate = new Date(manualLSDate[2], parseInt(manualLSDate[1],10) - 1, manualLSDate[0]);
				
				if(waybillDate > manualLSDate) {
					showMessage('error','Manual LS Date earlier than Booking/Receive Date of LR Number ' + element.wayBillNumber);
					return false;
				}
			}
			
			return true;
		}, openPrint : function(dispatchId) {
			window.open('InterBranch.do?pageId=340&eventId=10&modulename=loadingSheetPrintDestinationWise&masterid=' + dispatchId + '&isReprint=true', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');	
		}
	});
});
