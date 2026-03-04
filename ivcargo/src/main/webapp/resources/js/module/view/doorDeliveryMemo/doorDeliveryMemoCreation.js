let LRDetailsData,
pendingDeliveryStockHm = new Object(),
selectedRowsCount		=0,
tableData					= new Array(),
pendingLRsArray				= 	new Array(),
pendingDeliveryFinalArr		= 	new Array(),
finalHm						=	new Object(),
branchList,destBranchList,
partialConsignmentDataArr = new Array(),
pendingDeliveryArticles		= null,
pendingDeliveryFlag		= false,
chargesDisplayMap = {},
wayBillDlyChargeMap = {},
chargesNameHM = {},
chargIdWiseHM = {},
executiveEle	= null;
define([  
          PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		  ,'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
          ,PROJECT_IVUIRESOURCES + '/resources/js/filterTable/excel-bootstrap-table-filter-bundle.js'
          ],function(Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, ddmNode, _this = '', showAllDeliveryCharges	= false, selectedWayBillIdsArray = null;
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/doorDeliveryMemoWS/getConfigurationForCreateDdm.do?',	_this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			tableData					= response.tableConfig.columnConfigurationList;
			branchList					= response.branchList;
			destBranchList				= response.destBranchList;
			chargesNameHM 				= response.chargesNameHM;
			chargIdWiseHM				= response.chargIdWiseHM;
			showAllDeliveryCharges		= response.showAllDeliveryCharges;
			executiveEle				= response.executive;
		
			$("#mainContent").load("/ivcargo/html/module/ddm/doorDeliveryMemoCreation.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").addClass("show");
				}
				
				if(response.showDeliveryFor) {
					$("*[data-attribute='deliveryFor']").addClass("show");
					_this.setDeliveryFor();
				} else
					$("*[data-attribute='deliveryFor']").remove();
					
				_this.initialisevehicleAutocomplete();
				_this.setDDMDestBranch();
				_this.initialiseVehicleAgentAutocomplete();
				
				if(response.allowDDMAfterBooking) {
					let branchAutoComplete		 	= new Object();
					branchAutoComplete.primary_key 	= 'branchId';
					branchAutoComplete.url 			=  branchList;
					branchAutoComplete.field 		= 'branchName';
					$("#destBranchEle").autocompleteCustom(branchAutoComplete).html();
					$("*[data-attribute='region']").remove()
					$("*[data-attribute='subRegion']").remove()
					$("*[data-attribute='branch']").remove()
				} else {
					let elementConfiguration				= new Object();
					elementConfiguration.regionElement			= $('#regionEle');
					elementConfiguration.subregionElement		= $('#subRegionEle');
					elementConfiguration.branchElement			= $('#branchEle');
					response.elementConfiguration				= elementConfiguration;
					
					response.sourceAreaSelection				= true;
					response.destinationBranchSelection			= true;
					
					Selection.setSelectionToGetData(response);
					_this.setDestBranch();
				}
				
				myNod = Selection.setNodElementForValidation(response);
				ddmNode	= nod();
				
				addAutocompleteElementInNode(myNod, 'destBranchEle', 'Select Branch !');
				
				if(response.showDeliveryFor)
					addAutocompleteElementInNode(myNod, 'deliveryForEle', 'Select Delivery For !');
			
				addAutocompleteElementInNode(ddmNode, 'truckNumberEle', 'Select Vehicle Number !');
				addAutocompleteElementInNode(ddmNode, 'ddmDestBranchEle', 'Select DDM Destination Branch !');
				
				hideLayer();
				
				$("#searchBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				$("#lrNumberEle").keydown(function (event) {
					if(getKeyCode(event) == 13 && $('#lrNumberEle').val() != ''){
						_this.searchOnLrNumber();
					}
				});
				
				$('#createDdm').click(function() {
				
					if(pendingDeliveryFinalArr.length == 0){
						$('.close').click();
					 	$('#deliveryModel').modal('toggle');
						showMessage('error', 'Please Select At Least One LR');
					} else{
						ddmNode.performCheck();
						
						if(ddmNode.areAll('valid')){
							if(_this.createDDMValidation() && confirm("Are you sure you want to create ddm ?")) {
								_this.createDDM();
							}
						}
					}
				});
			});
		}, createDDMValidation : function(){
			let branchflag	= false;
			
			let driverNameEle = $('#driverNameEle').val();
			let driverNumberEle = $('#driverNumberEle').val();
			
			if(driverNameEle == undefined || driverNameEle == null || driverNameEle.trim() == '') {
				showMessage('error', 'Plase enter Driver Name!');
				return false;
			}
			
			if(driverNumberEle == undefined || driverNumberEle == null || driverNumberEle.trim() == '') {
				showMessage('error', 'please enter Driver Number!');
				return false;
			}
			
			for(const element of pendingDeliveryFinalArr) {
				let wayBillBranchId	= element.wayBillBranchId;
				
				if(parseInt(executiveEle.branchId) == parseInt(wayBillBranchId)) { //executiveBranchId defined global on main page
					branchflag = true;
					break;
				}
			}
			
			if(!branchflag) {
				showMessage('error', "You are not allowed to Load other Branch LR's !! !!");
				return false;
			}
			
			return true;
		}, setDeliveryFor : function() {
			$('#deliveryForType').removeClass('hide');
			_this.setDeliveryForAutocompleteInstance();
			
			let autoSelectType = $("#deliveryForEle").getInstance();
			
			let SelectTYPE = [
					{ "deliveryForId":1, "deliveryForName": "GODOWN" },
					{ "deliveryForId":2, "deliveryForName": "DOOR" },
					{ "deliveryForId":3, "deliveryForName": "BOTH" },
			]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setDeliveryForAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'deliveryForId';
			autoSelectTypeName.field 		= 'deliveryForName';

			$("#deliveryForEle").autocompleteCustom(autoSelectTypeName)
		}, setDDMDestBranch : function() {
			_this.setDDMDestBranchAutocompleteInstance();
			
			let autoSelectType = $("#ddmDestBranchEle").getInstance();
			
			$( autoSelectType ).each(function() {
				this.option.source = branchList;
			})
		}, setDDMDestBranchAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'branchId';
			autoSelectTypeName.field 		= 'branchName';

			$("#ddmDestBranchEle").autocompleteCustom(autoSelectTypeName)
		}, setDestBranch : function() {
			_this.setDestBranchAutocompleteInstance();
			
			let autoSelectType = $("#destBranchEle").getInstance();
			
			$( autoSelectType ).each(function() {
				this.option.source = destBranchList;
			})
		}, setDestBranchAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'locationsMappingAssignedLocationId';
			autoSelectTypeName.field 		= 'locationsMappingName';
	
			$("#destBranchEle").autocompleteCustom(autoSelectTypeName)
		}, onSubmit : function() {
			showLayer();
			let jsonObj = Selection.getElementData();

			jsonObj["deliveryForId"] 	= $('#deliveryForEle_primary_key').val();
			jsonObj["wayBillNumber"] 	= "";
			jsonObj["destinationBranchId"] 	= $('#destBranchEle_primary_key').val();
			
			getJSON(jsonObj, WEB_SERVICE_URL+'/doorDeliveryMemoWS/getDataToCreateDoorDeliveryMemo.do', _this.setDdmData, EXECUTE_WITH_ERROR);
		} , searchOnLrNumber : function() {
			showLayer();
			let jsonObj = new Object();
			jsonObj["wayBillNumber"] 	= $('#lrNumberEle').val();
			
			getJSON(jsonObj, WEB_SERVICE_URL+'/doorDeliveryMemoWS/getDataToCreateDoorDeliveryMemo.do', _this.setDataOnLrNumber, EXECUTE_WITH_ERROR);
		}, initialisevehicleAutocomplete : function() {
			let autoVehicleNumber = new Object();
			autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do';
			autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
			autoVehicleNumber.field 		= 'vehicleNumber';

			$("#truckNumberEle").autocompleteCustom(autoVehicleNumber)
		}, initialiseVehicleAgentAutocomplete : function() {
			let autoVehicleNumber = new Object();
			autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleAgentAutocomplete.do';
			autoVehicleNumber.primary_key 	= 'vehicleAgentMasterId';
			autoVehicleNumber.field 		= 'name';

			$("#vehicleAgentEle").autocompleteCustom(autoVehicleNumber)
		}, setDdmData : function(response) {
			showLayer();
			$('#reportData1 tbody').empty();
			
			if(response.message != undefined) {
				hideLayer();
				return;
			}
		
			let	pendingDeliveryStockList 		= response.pendingDeliveryStockList;

			if(pendingDeliveryStockList != undefined) {
				pendingDeliveryStockHm 		= response.pendingDeliveryStockHm;
				selectedWayBillIdsArray		= new Array();
				let dlyDisplayChargesHM		= response.chargesDisplayMap;
				let wayBillDlyChargeHm		= response.wayBillDlyChargesHm;
				
				for (let waybillId in dlyDisplayChargesHM) {
					if (!chargesDisplayMap[Number(waybillId)])
				   		 chargesDisplayMap[Number(waybillId)] = dlyDisplayChargesHM[Number(waybillId)];
  				}
				
				for (let waybillId in wayBillDlyChargeHm) {
					if (!wayBillDlyChargeMap[Number(waybillId)])
				   		 wayBillDlyChargeMap[Number(waybillId)] = wayBillDlyChargeHm[Number(waybillId)];
  				}
				
				/*Header data Start*/
				_this.setHeaderRow(true,'reportData1'); 
				/*header data End*/
					
				/*Table data Start*/		
				_this.setTableDataRow(pendingDeliveryStockList, true, 'reportData1'); 
				$('#table').excelTableFilter();
				/*Table data End*/	  
				
				/*Footer data Start*/
				_this.setFooterRow(pendingDeliveryStockList, true, 'reportData1');
				/*Foor data End*/	
			}				
				  
			$("#selectAll").click(function() {
				if($("#selectAll").prop("checked")) {
					selectedWayBillIdsArray = pendingDeliveryStockList.reduce(function (accumulator, curValue) {
						accumulator.push(curValue["wayBillId"]);
						return accumulator;
					}, [])
				 	selectedRowsCount =	selectedWayBillIdsArray.length;
				} else {
					selectedRowsCount = 0;
					selectedWayBillIdsArray = []
				}
						
				$("input[type=checkbox]").prop('checked', $(this).prop('checked'));
				$(".checkBoxdatatd").prop('checked', $(this).prop('checked'));
			});
			
            $("input[type=checkbox]").click(function(e) {
				let waybIllId	= Number(e.target.value);
				let indexPos	= selectedWayBillIdsArray.indexOf(waybIllId);
				
				if (!$(this).prop("checked") && $("#selectAll").prop("checked") ) {
					selectedRowsCount = selectedRowsCount - 1;
				    $("#selectAll").prop("checked", false);
				    selectedWayBillIdsArray.splice(indexPos, 1)
				} else if(!$("#selectAll").prop("checked") && $(this).prop("checked")){
					selectedRowsCount = selectedRowsCount + 1;
					selectedWayBillIdsArray.push(waybIllId)
				} else if(!$(this).prop("checked") && selectedRowsCount > 0){
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
					showMessage("error", "Please Select AtLeast One Lr For DDM");
				}else{
					$('#closeModel').click();
					_this.setDispatchData();
				}
			});
		},setDataOnLrNumber : function(response) {
			let	lrWiseHm				= response.pendingDeliveryStockHm;
			
			if(lrWiseHm == undefined || lrWiseHm == null || Object.keys(lrWiseHm).length == 0) {
			    hideLayer();
				return;
			}
								
			let dlyDisplayChargesHM		= response.chargesDisplayMap;
			let	lrWiseHmKey				= Object.keys(lrWiseHm);
			let wayBillDlyChargeHm		= response.wayBillDlyChargesHm;
			
			selectedWayBillIdsArray		= new Array();
			pendingDeliveryStockHm[lrWiseHmKey] = lrWiseHm[lrWiseHmKey];
			
			if (!chargesDisplayMap[Number(lrWiseHmKey)])
				chargesDisplayMap[Number(lrWiseHmKey)] = dlyDisplayChargesHM[Number(lrWiseHmKey)];
	
			if (!wayBillDlyChargeMap[Number(lrWiseHmKey)])
 				wayBillDlyChargeMap[Number(lrWiseHmKey)] = wayBillDlyChargeHm[Number(lrWiseHmKey)];
						 
			selectedWayBillIdsArray.push(Number(lrWiseHmKey));
			_this.setDispatchData();
		}, setDispatchData : function() {
			
			let duplicateLRAdded	= false;
			let pendingLRsArrayDb	= new Array();
			
			selectedWayBillIdsArray.forEach((element) => {
				if (!pendingLRsArray.includes(element)){ 
					pendingLRsArrayDb.unshift(element);
					pendingLRsArray.push(element);
				} else {
				    duplicateLRAdded = true;
				}
			});
			
			selectedWayBillIdsArray = [];
					
			if(duplicateLRAdded)
				showMessage("error", "LR Already Added !");
			
			pendingLRsArrayDb.forEach((element) => {
				if(finalHm[element] == undefined && pendingDeliveryStockHm[element] != undefined){
				   pendingDeliveryFinalArr.unshift(pendingDeliveryStockHm[element]);
				   finalHm[element]	= pendingDeliveryStockHm[element][0]
			   }
			});
					
			if(pendingDeliveryFinalArr != undefined) {
				/*Header data Start*/
				 _this.setHeaderRow(false, 'DeliveryTableData'); 
				/*header data End*/
				
				/*Table data Start*/		
				_this.setTableDataRow(pendingDeliveryFinalArr, false, 'DeliveryTableData'); 
				 $('#dispatchtable').excelTableFilter();
				/*Table data End*/	  
		
				/*Footer data Start*/
				_this.setFooterRow(pendingDeliveryFinalArr, false, 'DeliveryTableData');
				/*Foor data End*/	
			}
					
			$(".closeFilter").click(function(){$('.dropdown-filter-content').css("display", 'none');});		
						
			$('.remove').click(function(event) {
				_this.removeDataRow((event.target.id).split('_')[1]);
			});
			
			$('.partialDoorDelivery').click(function(event) {
				pendingDeliveryArticles	= [];
				_this.partialDoorDelivery((event.target.id).split('_')[1]);
			});
			
			$('#doorDelivery').removeClass('hide');
			$('#bottom-border-boxshadow').removeClass('hide');
			$('#saveChargesBtn').removeClass('hide');
			$('#middle-border-boxshadow').removeClass('hide');
		}, removeDataRow: function(rowId) {
			let row = $('#removeBookingCharges_' + rowId).closest('tr');
			
			setTimeout(function() {
				let siblings = row.siblings();
				row.remove();
				
				siblings.each(function(index) {
					this.firstChild.nextElementSibling.nextElementSibling.innerHTML=index + 1;
				});
				
			}, 100);
			
			let wayBillId	= Number(rowId);
			let indexPos	= pendingLRsArray.indexOf(wayBillId);
			pendingLRsArray.splice(indexPos, 1);
	
			pendingDeliveryFinalArr = pendingDeliveryFinalArr.filter(function(el) { return el.wayBillId != wayBillId; });
			_this.setFooterRow(pendingDeliveryFinalArr,false,'DeliveryTableData'); 
			
			finalHm[wayBillId] = undefined ;
			
			if(pendingDeliveryFinalArr.length == 0)
				$('#doorDelivery').addClass('hide');
			
			calculateChargesTotal();
			calculateTotalDeliveryAmount();
		}, viewPartialDetails: function(res) {
			if(res.message != undefined) {
				return;
			} else if(res != null && !res.invalid) {
				if(res.pendingDeliveryArticleDetails == undefined || res.pendingDeliveryArticleDetails == null || res.pendingDeliveryArticleDetails.length == 0)
					return;
				else {
					pendingDeliveryArticles	= res.pendingDeliveryArticleDetails;
				}
			}
			
			$('#partialDDMConsignmentData').empty();
			$('#partialDDMWeightData thead').empty();
			$('#partialDDMActionButtons').empty();
			
			let wayBillId 		= pendingDeliveryArticles[0].wayBillId;
			let deliveryWeight	= 0;
	
			for(const element of pendingDeliveryArticles) {
				let deliveryQuantity	= element.pendingQuantity;
				deliveryWeight			= pendingDeliveryArticles[0].weight;
				let packingTypeName 	= element.packingTypeName;
				let pendingArts			= element.pendingQuantity;
				
				if(partialConsignmentDataArr != null && partialConsignmentDataArr.length > 0) {
					let dataObj = partialConsignmentDataArr.find(function(consignment) {
						if(consignment.pendingDeliveryStockArticleDetailsId == element.pendingDeliveryStockArticleDetailsId)
							return consignment;
					});
					
					if(dataObj != undefined && dataObj != 'undefined') {
						deliveryQuantity = dataObj.quantity;
						deliveryWeight	 = dataObj.weight;
					}
				} 
				 	
				let pendingDeliveryStockArticleDetailsId	= element.pendingDeliveryStockArticleDetailsId;
				let dataColumnArray			= new Array();
				$(".creditlevel").css("font-size", "16px");
				
				dataColumnArray.push("<td class ='thead-inverse textClass'>" + packingTypeName + "</td>");
				dataColumnArray.push("<td class ='thead-inverse textClass'>" + pendingArts + "</td>");
				dataColumnArray.push("<td style='display:none'><input id='pendingQty_" + pendingDeliveryStockArticleDetailsId+"'  value='" + pendingArts + "'></td>");
				dataColumnArray.push("<td class ='thead-inverse textClass' ><input class='widthInPx form-control' type='number' id='deliverQuantity_" + pendingDeliveryStockArticleDetailsId+"' value='"+ deliveryQuantity +"' max='"+pendingArts+"' min='1' maxlength='4' onkeypress='return noNumbers(event);' onblur='hideInfo();clearIfNotNumeric(this,0);validatePartialQuantity("+pendingDeliveryStockArticleDetailsId+");'></td>");
				$('#partialDDMConsignmentData').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			
				$(".textClass").css("font-size", "16px");
				$(".widthInPx").css("width", "70px");
			}
			
			let dataColumnArray2	= new Array();
			
			dataColumnArray2.push("<td class ='thead-inverse textClass' style='width:30%'><span style='width:60%'>Weight : <span style='padding-left:20px'><span id= 'totalWeight'>"+pendingDeliveryArticles[0].actualWeight+"</span></td>");
			dataColumnArray2.push("<td class ='thead-inverse textClass' style='width:30%'><span>Deliver Weight</span></td>");
			dataColumnArray2.push("<td class ='thead-inverse textClass' style='width:30%'><input readonly disabled  id='deliverWeight' class='form-control' value='"+ deliveryWeight.toFixed(2) +"'></td>");
			
			$('#partialDDMWeightData thead').append('<tr>' + dataColumnArray2.join(' ') + '</tr>');
			
			$(".textClass").css("font-size", "16px");
			$(".widthInPx").css("width", "70px");
			
			let dataDivArray = [];

			dataDivArray.push("<button type='button' id='updatePartialDelData' class='btn btn-danger' onclick='cancelPartialDDMDetailsData(\"" + wayBillId + "\")' value='" + wayBillId + "'>Delete</button>");
			dataDivArray.push("<button type='button' id='updatePartialDelData' class='btn btn-primary' onclick='updatePartialDDMDetailsData(\"" + wayBillId + "\")' value='" + wayBillId + "'>Add</button>");
			
			$('#partialDDMActionButtons').append(dataDivArray.join(''));

			$("#partialDDMLrDeliveryModal").modal({
				backdrop: 'static',
				keyboard: false
			});
			
		}, partialDoorDelivery : function(rowId) {
			let jsonObject			= new Object();
			jsonObject.waybillId	= Number(rowId);;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/generatePartialCRWS/getPendingDeliveryConsignmentDetails.do', _this.viewPartialDetails, EXECUTE_WITH_ERROR);
			
		}, setHeaderRow: function(showCheckBox, tableId) {
			let headerColumnArray		= new Array();
			
			$('#' + tableId +' thead').empty();
			let showChargesFlag	= true;
					
			if(showCheckBox)
				headerColumnArray.push("<th class='checkBox'  style='width:px;font-size:px;'><input type='checkBox' id='selectAll'></th>");
			else {
				headerColumnArray.push("<th class='checkBox'  style='width:px;font-size:px;'>Remove</th>");
				headerColumnArray.push("<th class='checkBox'  style='width:px;font-size:px;'>Partial DDM</th>");
			}
					
			headerColumnArray.push("<th class='srNo' style='width:px;font-size:px;'>Sr No.</th>");
					
			for (const element of tableData) {
				let showColumn				= element.show;
				let value					= element.dataDtoKey;
				let columnDisplayCssClass	= element.columnDisplayCssClass;
				let columnWidth				= element.columnWidth;
				let fontSize				= element.fontSize;
				let header					= element.title;
				showChargesFlag	= true;
				let showChargesClass	= "";
				
				if(chargIdWiseHM != undefined && chargIdWiseHM != null && chargIdWiseHM[value] != undefined) {
					let chargeId = chargIdWiseHM[value];
					
					if(chargeId != undefined && chargeId != 'undefined' && Number(chargeId) > 0){
						showChargesClass	= "showCharges"
						
						if(showCheckBox)
							showChargesFlag = false;
					}
				}
								
				if(showColumn && showChargesFlag)
					headerColumnArray.push("<th class='"+columnDisplayCssClass+" "+ showChargesClass+ " "+value+"' style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'>"+header+"</th>");
			}
					
			if(showChargesFlag)
				headerColumnArray.push("<th class='' style='width:'> Delivery Amount </th>");
			
			$('#'+tableId+' thead').append('<tr>' + headerColumnArray.join(' ') + '</tr>');
		}, setTableDataRow: function(deliveryFinalArr,showCheckBox,tableId) {
			let columnArray				= new Array();
			let count					= 0;
			
			for (const element of deliveryFinalArr) {
				let obj			= element;
				let chargesMap = wayBillDlyChargeMap[Number(obj["wayBillId"])];
				
				if(chargesNameHM != undefined && chargesNameHM != null)
					for(let chargeId in chargesNameHM) {
						let chargeName	= chargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
						obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? chargesMap[chargeId] : 0) : 0;
					}
			}
			
			$('#'+tableId+' tbody').empty();
					
				for (const element of deliveryFinalArr) {
					let obj = element;
					count = count + 1;
					
					let dlyAmt = obj.deliveryAmount;
					let bookingTotal = 0.0;
					let chargValueMap = wayBillDlyChargeMap[Number(obj["wayBillId"])];
					
					if(obj.wayBillInfoWayBillTypeId == WAYBILL_TYPE_TO_PAY)
						bookingTotal = obj.wayBillInfoBookingTotal;
					
					let isChargeDisable = chargesDisplayMap[Number(obj["wayBillId"])];
					
					let disabledAttr = isChargeDisable ? "disabled" : "";
					
					if(showCheckBox)
						columnArray.push("<td class='checkBoxdatatd' style='text-align: center; vertical-align: middle; font-size:15px;''><input type='checkBox' value='"+obj["wayBillId"]+"'></td>");
					else {
						columnArray.push("<td class='' style='text-align: center; vertical-align: middle; font-size:13px;''><button style='border-radius:10px;' type='button' class='btn btn-danger btn-sm remove' id='removeBookingCharges_" + obj["wayBillId"] + "'>Remove</button></td>");
						columnArray.push("<td class='' style='text-align: center; vertical-align: middle; font-size:13px;''><button style='border-radius:10px;' type='button' class='btn btn-danger btn-sm partialDoorDelivery' id='partialDDM_" + obj["wayBillId"] + "'>Partial DDM</button></td>");
					}
					
					columnArray.push("<td class='datatd bold' row='row_"+count+"' value='"+obj["wayBillId"]+"' style='text-align: center; vertical-align: middle; font-size:15px;''>" + count + "</td>");
					//columnArray.push("<td style='display: none;'><input type='hidden' id='wayBillBranchId_" + obj["wayBillId"] + "' value='" + obj["wayBillBranchId"] + "' /></td>");
					
					let showChargesFlag	= true;
					
					for (const element1 of tableData) {
						let showColumn				= element1.show;
						let value					= element1.dataDtoKey;
						let columnDisplayCssClass	= element1.columnDisplayCssClass;
						let columnWidth				= element1.columnWidth;
						let fontSize				= element1.fontSize;
						showChargesFlag			= true;

						if(showColumn) {
							let cellContent = obj[value];
							
							if(chargIdWiseHM != undefined && chargIdWiseHM != null && chargIdWiseHM[value] != undefined) {
								let chargeId = chargIdWiseHM[value];
								
								if (chargeId != undefined && chargeId != 'undefined' && Number(chargeId) > 0) {
									if (showCheckBox)
										showChargesFlag = false;
									else {
										let chargeValue = 0.00;
										
										if(chargValueMap != undefined && chargValueMap != null && chargValueMap[chargeId] != undefined)
											chargeValue = chargValueMap[chargeId];
										
										columnWidth	= 100;
										cellContent = "<input type='text' class='form-control' id='charges_" + obj["wayBillId"] + "_" + chargeId + "' " + disabledAttr+" value='"+chargeValue+"' maxlength='4' "+
									        "onkeyup='calculateTotal(" + obj["wayBillId"] + ", "+ bookingTotal +"); calculateSingleChargeTotal("+ chargeId+")'oninput='this.value=this.value.replace(/[^0-9]/g,\"\").slice(0,6);'/>";
									}
								}
							}
							
							if(showChargesFlag) {
						        columnArray.push( "<td class='" + columnDisplayCssClass + " bold fontSize15px' id='" + value + "_" + obj["wayBillId"] + "' " +
						        "style='width:" + columnWidth + "px;font-size:" + fontSize + "px;'>" + cellContent +"</td>" );
						    }
						 }
					}	
					
					if(showChargesFlag) {
						columnArray.push("<td class='bold fontSize15px'" + disabledAttr + " id='dlyAmount_" + obj["wayBillId"] + "' " +
						"style='width:200px;'> <input type='text' class='form-control' id='deliveryAmt_" + obj["wayBillId"] + "' value='"+ dlyAmt +"'></td>");
					}
					
					$('#'+tableId+' tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray	= [];
				}
		}, setFooterRow: function(deliveryFinalArr,showCheckBox,tableId) {
			let totalColumnArray		= new Array();
			let showChargesFlag	= true;
			
			$('#'+tableId+' tfoot').empty();
		
			totalColumnArray.push("<td><b>Total</b></td>");
			
			if(!showCheckBox)
				totalColumnArray.push("<td></td>");
				
			totalColumnArray.push("<td><b></b></td>");
						 
			$('.checkBox').children("div").css({"width": '40px',"display":"none"});
			$('.srNo').children("div").css({"width": '60px',"display":"none"});
				
			$(".dropdown-filter-menu-search").after("<button style='margin-top:10px;' class='closeFilter'><b>Close</b></button>");
			
			let totalDeliveryAmount = deliveryFinalArr.reduce((sum, obj) => {
			    return sum + (parseFloat(obj.deliveryAmount) || 0);
			}, 0);
		
			let id = 0;
			
			for (const element of tableData) {
				let showColumn				= element.show;
				let value					= element.dataDtoKey;
				let columnDisplayCssClass	= element.columnDisplayCssClass;
				let columnWidth				= element.columnWidth;
				let fontSize				= element.fontSize;
				let displayColumnTotal		= element.displayColumnTotal;
				showChargesFlag				= true;
				let showChargesClass		= "";
				
				let total =	deliveryFinalArr.reduce((a, b) => a + (b[value] || 0), 0);
				
				if(chargIdWiseHM != undefined && chargIdWiseHM != null && chargIdWiseHM[value] != undefined) {
					let chargeId = chargIdWiseHM[value];
								
					if(chargeId != undefined && chargeId != 'undefined' && Number(chargeId) > 0) {
						showChargesClass	= "showCharges"
						id = chargeId;
						
						if(showCheckBox)
							showChargesFlag = false;
					}
				}
						
				if(showColumn && showChargesFlag) {
					$('.' + value + ' .dropdown-filter-dropdown').addClass(''+columnDisplayCssClass+'');
				 	$('.' + value).children("div").css("width", ''+columnWidth+'px');
						
					if(displayColumnTotal)
						totalColumnArray.push("<td class='" + columnDisplayCssClass + " "+ showChargesClass + " bold fontSize15px ' id='chargeTotal_" + id + "'style='width:" + columnWidth + "px;font-size:" + fontSize + "px;'>" + total + "</td>");
					else
						totalColumnArray.push("<td class='" + columnDisplayCssClass + " " + showChargesClass + "' style='width:" + columnWidth + "px;font-size:"+fontSize+"px;'>  </td>");
				}
			}
			
			if(showChargesFlag)
				totalColumnArray.push("<td class='bold fontSize15px' style='' id='totalDly'> "+ totalDeliveryAmount +" </td>");
					
			$('#'+tableId+' tfoot').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
						
			$('td').css("padding", '4px');
					 
			 /*TO Hidw footer if filter selected*/
			$(document).click(function() {
				if ($('.dropdown-filter-content').is(":visible"))
			 		  $('tfoot').addClass('hide');
				else
					 $('tfoot').removeClass('hide');
			});
		}, createDDM : function() {
			showLayer();
			let jsonObject = new Object();
			
			let chargeValues = [];

			if(showAllDeliveryCharges){
				$('input[id^="charges_"]').each(function () {
				    const parts = this.id.split('_'); // ["chargesId", wayBillId, chargeId]
				    const wayBillId = parts[1];
				    const chargeId = parts[2];
				    const value = $(this).val();
				
					if(value > 0){
					    chargeValues.push({
					        wayBillId: wayBillId,
					        wayBillDeliveryChargesId: chargeId,
					        wayBillDeliverychargeAmount: value
					    });
					}
				});
			}
			
			let ddmLrDetailsArr = [];
			
			for(const element of pendingDeliveryFinalArr) {
				let obj = new Object();
				
				obj.wayBillId			= element.wayBillId;
				obj.quantity			= element.consignmentSummaryQuantity;
				obj.actualWeight		= element.consignmentSummaryActualWeight;
				obj.wayBillTypeId		= element.wayBillInfoWayBillTypeId;
				obj.wayBillNumber		= element.wayBillNumber;
				obj.sourceBranchId		= element.wayBillInfoSourceBranchId;
				obj.destinationBranchId	= element.wayBillInfoDestinationBranchId;
				obj.wayBillStatus		= element.wayBillStatus;
				
				ddmLrDetailsArr.push(obj)
			}
			
			jsonObject.wayBillColl  			= JSON.stringify(ddmLrDetailsArr);
			jsonObject.chargeValues				= JSON.stringify(chargeValues);
			
			jsonObject["branchId"] 				= Number($('#branchEle_primary_key').val());
			jsonObject["subRegionId"] 			= Number($('#subRegionEle_primary_key').val());
			jsonObject["regionId"] 				= Number($('#regionEle_primary_key').val());
			jsonObject["destinationBranchId"] 	= Number($('#destBranchEle_primary_key').val());
			jsonObject["deliveryForId"] 		= Number($('#deliveryForEle_primary_key').val());
			
			jsonObject["vehicleNumberMasterId"] 				= $('#truckNumberEle_primary_key').val();
			jsonObject["vehicleNumber"] 						= $('#truckNumberEle').val();
			jsonObject["vehicleAgentId"] 						= $('#vehicleAgentEle_primary_key').val();
			jsonObject["vehicleAgentName"] 						= $('#vehicleAgentEle').val();
			jsonObject["deliveryRunSheetLedgerDriverName"] 		= $('#driverNameEle').val();
			jsonObject["deliveryRunSheetLedgerDriverMobileNo"] 	= $('#driverNumberEle').val();
			jsonObject["deliveryRunSheetLedgerDestinationBranchId"] 	= $('#ddmDestBranchEle_primary_key').val();
			jsonObject["deliveryRunSheetLedgerDestinationBranchName"] 	= $('#ddmDestBranchEle').val();
			jsonObject["deliveryRunSheetLedgerDeliveryExecutiveName"] 	= $('#executiveNumberEle').val();
			jsonObject["deliveryRunSheetLedgerLorryHireAmount"] 		= $('#lorryHireEle').val();
			jsonObject["deliveryRunSheetLedgerRemark"] 					= $('#remarkEle').val();

			jsonObject.partialConsignmentDataArr  	= JSON.stringify(partialConsignmentDataArr);
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/doorDeliveryMemoWS/createDoorDeliveryMemo.do', _this.setResponseAfterDDM, EXECUTE_WITH_ERROR);
		}, setResponseAfterDDM : function(response) {
			if(response.message != undefined) {
				hideLayer();
				return;
			}

			let deliveryRunSheetId	= response.DeliveryRunSheetLedgerId;
			let ddmNo	= response.DDMNumber;
			
			setTimeout(function() { 
				window.open('DDMPrint.do?pageId=304&eventId=4&deliveryRunSheetLedgerId='+deliveryRunSheetId+'&DDMNo='+ddmNo);
			}, 100);
			
			setTimeout(function(){ 
				location.reload(); 
			}, 1000);
		}
	});
});

function validatePartialQuantity(id) {
	let parQuantity = Number($('#deliverQuantity_' + id).val());
	let pendingQty 	= Number($('#pendingQty_' + id).val());
	
	if(Number(parQuantity) > Number(pendingQty)) {
		showMessage('error', 'You can not enter Quantity greater than '+pendingQty+'!');
		$('#deliverQuantity_' + id).val(0)
		return false;
	} else if(parQuantity < 0) {
		showMessage('error', 'You can not enter Quantity less than 0!');
		$('#deliverQuantity_' + id).val(0)
		return false;
	} 
	
	let singleQtyWeight = pendingDeliveryArticles[0].actualWeight / pendingDeliveryArticles[0].totalQuantity;
	
	let totalQtyForDeliver = 0;
	
	for(const element of pendingDeliveryArticles) {
		let pendingDeliveryStockArticleDetailsId = element.pendingDeliveryStockArticleDetailsId;
		
		if(Number($('#deliverQuantity_' + pendingDeliveryStockArticleDetailsId).val()) > 0)
			totalQtyForDeliver += Number($('#deliverQuantity_' + pendingDeliveryStockArticleDetailsId).val());
	}

	$('#deliverWeight').val((totalQtyForDeliver * singleQtyWeight).toFixed(2));
}

function updatePartialDDMDetailsData(wayBillIdToUpdate) {
	partialConsignmentDataArr = partialConsignmentDataArr.filter(obj => 
        obj.wayBillId !== wayBillIdToUpdate
    );
    
	let totalQtyForDeliver = 0;
	
	for(const element of pendingDeliveryArticles) {
		let id = element.pendingDeliveryStockArticleDetailsId;
		
		if(Number($('#deliverQuantity_' + id).val()) > 0)
			totalQtyForDeliver += Number($('#deliverQuantity_' + id).val());
	}
	
	let singleQtyWeight = pendingDeliveryArticles[0].actualWeight / pendingDeliveryArticles[0].totalQuantity;
	let dlyWeight = totalQtyForDeliver * singleQtyWeight;
	
	for(const element of pendingDeliveryArticles) {
		let id = element.pendingDeliveryStockArticleDetailsId;
		
		if(Number($('#deliverQuantity_' + id).val()) > 0) {
			let parQuantity = Number($('#deliverQuantity_' + id).val());
			let pendingQty = Number($('#pendingQty_' + id).val());
			
			if(Number(parQuantity) > Number(pendingQty)) {
				showMessage('error', 'You can not enter Quantity greater than ' + pendingQty + '!');
				$('#deliverQuantity_' + id).val(0)
				return false;
			}
			
			let dataObj = partialConsignmentDataArr.find(function(consignment) {
				if(consignment.pendingDeliveryStockArticleDetailsId == id)
					return consignment;
			});
			
			if(dataObj != undefined && dataObj != 'undefined') {
				dataObj.quantity = parQuantity;
				dataObj.weight			= dlyWeight;
			} else {
				let obj = new Object();
				obj.packingTypeMasterId		= element.packingTypeMasterId;
				obj.quantity 				= parQuantity;
				obj.consignmentDetailsId	= element.consignmentDetailsId;
				obj.wayBillId				= element.wayBillId;
				obj.pendingDeliveryStockArticleDetailsId			= element.pendingDeliveryStockArticleDetailsId;
				obj.weight					= dlyWeight;
				partialConsignmentDataArr.push(obj);
			}
		}
	}
	
	if(partialConsignmentDataArr != null && partialConsignmentDataArr.length > 0)
		pendingDeliveryFlag	= true;
	
	$('#partialDDMLrDeliveryModal').modal('hide');
}
		
function cancelPartialDDMDetailsData(wayBillIdToRemove) {
	 partialConsignmentDataArr = partialConsignmentDataArr.filter(obj => 
        obj.wayBillId != wayBillIdToRemove
    );
	
	$('#partialDDMLrDeliveryModal').modal('hide');
	pendingDeliveryFlag = false;
}

function calculateTotal(wayBillId, bookingTotal) {
	let dlyAmt = 0;
	
	for(let chargeId in chargesNameHM) {
		let chargeVal = $('#charges_' + wayBillId + '_' + chargeId).val();
		
		if(chargeVal != undefined && Number(chargeVal) > 0)
			dlyAmt	+= Number(chargeVal);
	}
	
	$('#deliveryAmt_' + wayBillId).val(bookingTotal + dlyAmt);
	
	let dlyFinalTotal = 0;
	
	for(const element of pendingDeliveryFinalArr) {
		dlyFinalTotal += Number($('#deliveryAmt_' + element.wayBillId).val());
	}
	
	$('#totalDly').text(dlyFinalTotal);
}

function calculateSingleChargeTotal(chargeId) {
	let totalChargeAmt = 0;
	
	for(const element of pendingDeliveryFinalArr) {
		totalChargeAmt += Number($('#charges_' + element.wayBillId + '_' + chargeId).val());
	}
	
	$('#chargeTotal_' + chargeId).text(totalChargeAmt);
}

function calculateChargesTotal() { 
	for(let chargeId in chargesNameHM) {
		let chargeVal = 0;
		
		for(const element of pendingDeliveryFinalArr) {
			let chargeValue = $('#charges_' + element.wayBillId + '_' + chargeId).val();
		
			if(chargeValue != undefined && chargeValue != null && Number(chargeValue))
				chargeVal += Number(chargeValue);
		}
		
		$('#chargeTotal_' + chargeId).text(chargeVal);
	}
}

function calculateTotalDeliveryAmount() {
	let dlyFinalTotal = 0;
	
	for(const element of pendingDeliveryFinalArr) {
		dlyFinalTotal += Number($('#deliveryAmt_' + element.wayBillId).val());
	}
	
	$('#totalDly').text(dlyFinalTotal);
}
