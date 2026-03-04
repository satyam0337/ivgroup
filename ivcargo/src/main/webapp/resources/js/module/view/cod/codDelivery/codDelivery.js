	let list = null;
	let lsSourceBranchId =0;
	let  id = 0;

define([ 'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(slickGridWrapper2, Selection) {
	'use strict';
	var jsonObject = new Object(), myNod,myNod1,  _this = '', BRANCH_SELECTION = 1, PARTY_SELECTION = 2, WAYBILL_NUMBER_SELECTION = 3, COD_NUMBER_SELECTION = 5;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/codDeliveryWS/getCODDeliveryElement.do?',_this.setElementDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setElementDetails : function(response){
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/cod/codDelivery.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				response.isCalenderSelection	= response['date'];
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				
				response.elementConfiguration	= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				var autoSelectionName 			= new Object();
				autoSelectionName.primary_key 	= 'selectionId';
				autoSelectionName.field 		= 'selectionName';
				autoSelectionName.callBack 		= _this.onSearchBySelect;
				$("#searchByOptionEle").autocompleteCustom(autoSelectionName);
				
				var autoSelectionNameInstance 	= $("#searchByOptionEle").getInstance();

				$(autoSelectionNameInstance).each(function() {
					this.option.source 			= response.selectionArr;
				});

				if(response.branchList != undefined) {
					var codBranchAutoComplete 			= new Object();
					codBranchAutoComplete.primary_key 	= 'branchId';
					codBranchAutoComplete.field 		= 'branchName';
					codBranchAutoComplete.url			= response.branchList;
					$("#codBranchEle").autocompleteCustom(codBranchAutoComplete);
					
					var codBranchAutoComplete1 = new Object();
					codBranchAutoComplete1.primary_key 	= 'branchId';
					codBranchAutoComplete1.field 		= 'branchName';
					codBranchAutoComplete1.url			= response.branchList;
					$("#codBranchElepopup").autocompleteCustom(codBranchAutoComplete1);
					
					let partyNameAutoComplete = new Object();
					partyNameAutoComplete.primary_key = 'corporateAccountId';
					partyNameAutoComplete.url = WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do';
					partyNameAutoComplete.field = 'corporateAccountDisplayName';
					$("#partyNameEle").autocompleteCustom(partyNameAutoComplete);
					
				}
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#codBranchEle',
					validate		: 'validateAutocomplete:#codBranchEle_primary_key',
					errorMessage	: 'Select COD Branch !'
				});

				myNod1 = nod();
				myNod1.configure({
					parentClass:'validation-message'
				});
			
				myNod.add({
					selector		: '#wayBillNumberEle',
					validate		: 'validateAutocomplete:#lrNumberEleEle_primary_key',
					errorMessage	: 'Select LR Number !'
				});

				hideLayer();
				
				$("#codNumberEle" ).keydown(function(e) {
					if (e.which == 13) {
						_this.searchCOD();
					}
				});

				$("#findNumberBtn").click(function() {
					if($('#searchByOptionEle_primary_key').val() == BRANCH_SELECTION) {
						myNod.performCheck();
						
						if(myNod1.areAll('valid'))
							_this.searchCOD();	
					} else if($('#searchByOptionEle_primary_key').val() == COD_NUMBER_SELECTION) {
						myNod1.performCheck();
						
						if(myNod1.areAll('valid'))
							_this.searchCOD();								
					}  else if($('#searchByOptionEle_primary_key').val() == WAYBILL_NUMBER_SELECTION) {
						myNod1.performCheck();
						
						if(myNod1.areAll('valid'))
							_this.searchCOD();								
					}	else if($('#searchByOptionEle_primary_key').val() == PARTY_SELECTION) {
						myNod1.performCheck();
						
						if(myNod1.areAll('valid'))
							_this.searchCOD();								
					}
				});
				
				$('#saveRates').click(function() { //bt
					if ($('input[type="checkbox"]:checked').length === 0) {
						showAlertMessage('error', 'Please Select At Least One CheckBox');
						return false; // Prevent default action
					}
					
					_this.saveRates()
				});
			});
			
		}, onSearchBySelect : function() {
			if($('#searchByOptionEle_primary_key').val() == BRANCH_SELECTION) {
				$('.codBranch').removeClass('hide');
				$('.lrNumber').addClass('hide');
				$('.codNumber').addClass('hide');
				$('.codParty').addClass('hide');
			} else if($('#searchByOptionEle_primary_key').val() == COD_NUMBER_SELECTION) {
				$('.codNumber').removeClass('hide');
				$('.codBranch').addClass('hide');
				$('.lrNumber').addClass('hide');
				$('.codParty').addClass('hide');
			} else if($('#searchByOptionEle_primary_key').val() == WAYBILL_NUMBER_SELECTION) {
				$('.lrNumber').removeClass('hide');
				$('.codBranch').addClass('hide');
				$('.codNumber').addClass('hide');
				$('.codParty').addClass('hide');
			}else if($('#searchByOptionEle_primary_key').val() == PARTY_SELECTION) {
				$('.codParty').removeClass('hide');
				$('.codBranch').addClass('hide');
				$('.lrNumber').addClass('hide');
				$('.codNumber').addClass('hide');
			}
		}, searchCOD : function() {
			showLayer();
			
			var jsonObject = new Object();
		
			jsonObject.codReceiveNumber			= $('#codNumberEle').val();
			jsonObject.searchBy 				= $('#searchByOptionEle_primary_key').val();
			jsonObject.codBranchId  			= $("#codBranchEle_primary_key").val();
			jsonObject.lrNumber					= $('#singleLREle').val();
			jsonObject.corporateAccountId  		= $("#partyNameEle_primary_key").val();

			getJSON(jsonObject, WEB_SERVICE_URL+'/codDeliveryWS/getCodDetailsForDelivery.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			hideLayer();
			$('#mainTable').empty();

			list = response.codDeliveryList;

			if(list.length  > 0){
				$('#bottom-border-boxshadow').removeClass('hide');
				
				let headerColumnArray = new Array();
				headerColumnArray.push("<th style='width:50px; text-align: center; font-size:18px;box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white'   ><label class='switch m-auto'> <input type='checkbox' id='checkboxAll' onchange='checkBoxForAll();'  value='checkboxAll' unchecked> <span class='slider round'></span></label> </th>");
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >LR Number</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >Delivery Date</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  >Consignor</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  > Consignee</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  > From</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white"  > To</th>');
				headerColumnArray.push('<th style="text-align: center;font-size:18px; box-shadow: 10px 10px 5px lightblue; background-color:coral; color:white" >COD Amount </th>');
				headerColumnArray.push("<th style='text-align: center;display:none ; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='oxAll' value='checkboxAll' unchecked> </th>");
				headerColumnArray.push("<th style='text-align: center;display:none ; font-size:15px;'><input style='font-weight:bold;' type='hidden' id='xAll' value='checkboxAll' unchecked> </th>");

				$('#mainTable').append('<tr>' + headerColumnArray.join(' ') +' </tr>');
				
				for(let i=0;i < list.length;i++){
					var data = list[i];
	
					let dataColumnArray = new Array();
      				dataColumnArray.push("<td style='text-align: center;vertical-align:middle;font-size:15px; '> <label class='switch m-auto'> <input  id='check_"+i+"' value='check_"+i+"' type='checkbox' unchecked><span class='slider round'></span></label> </td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.wayBillNumber+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.creationDateTime+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.consignor+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;'>" +data.consignee+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;' id='codNumber"+i+"'>" +data.sourceBranch+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle; font-size:15px;' id='codNumber"+i+"'>" +data.lrDestinationBranch+ "</td>");
					dataColumnArray.push("<td style='text-align: center;vertical-align:middle;font-size:15px;' id='lsNumber_"+i+"'>" +data.codAmount+ "</td>");

					$("#mainTable").append('<tr>' +dataColumnArray.join(' ')+ '</tr>');
				}	
				
				let totalArray = new Array();
					
				$("#mainTable").append('<tr>' +totalArray.join(' ')+ '</tr>');
			}
		},saveRates : function() {
			showLayer();
			let jsonObject = _this.getDataToSave();
			
			getJSON(jsonObject,WEB_SERVICE_URL + '/codDeliveryWS/insertAndUpdateCodDetailsForDelivery.do?' ,_this.setResponse, EXECUTE_WITHOUT_ERROR);
		},setResponse : function(response){
			hideLayer();
			
			if(response.message != undefined) {
				hideLayer();
				var errorMessage = response.message;
				
				if(errorMessage.typeName == 'success') {
					showMessage(errorMessage.typeName, 'COD Deliver Number '+response.codDeliveryNumber+' Successfully Deliver');
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
					
					var MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=codDeliver='+'&masterid2='+response.codDeliveryNumber);
					setTimeout(function(){ location.reload(); }, 1000);
				} else
					showAlertMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
			}
		
			_this.onSubmit();
		}, getDataToSave :function(){
			let jsonObject 			= new Object();
			let codDetailsArray = new Array();
			var totalCodAmount =0;
			for(let i=0 ; i < list.length;i++){
				let ischeck = $("#check_"+i).prop("checked");
				
				if(ischeck){
					let codData = new Object();
					id = $("#check_"+i).val();
				
					codData.lsSourceBranchId		=$('#codBranchEle_'+i).text();
					codData.pendingCodSettlementId  = list[i].pendingCodSettlementId
					codData.codAmount          		= list[i].codAmount
					codData.sourceBranchId			= list[i].sourceBranchId;
					codData.wayBillId       		= list[i].wayBillId
					codData.lrDestinationBranchId	= list[i].lrDestinationBranchId;
					codData.codReceiveSummaryId		= list[i].codReceiveSummaryId;
					codData.codReceiveLedgerId		= list[i].codReceiveLedgerId;
					codData.status					= 3;

					codDetailsArray.push(codData);
				}

				 lsSourceBranchId =$('#branchId_'+i).text();
			}

			jsonObject.CodDetails = JSON.stringify(codDetailsArray);
			
			return jsonObject;
		}
	});
});


function checkBoxForAll(){
	for(let i = 0; i < list.length; i++) {
		$("#check_"+i).prop("checked", $("#checkboxAll").prop("checked"));
	}
}

$('input[type="checkbox"]').change(function() {
    var anyChecked = $('input[type="checkbox"]:checked').length > 0;
    $('#saveRate').prop('disabled', !anyChecked);
});