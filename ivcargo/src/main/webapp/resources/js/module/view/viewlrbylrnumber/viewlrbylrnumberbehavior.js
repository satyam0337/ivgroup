/**
 *	define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
			module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
			modules module1Obj and module2Obj are now available for use.
		});
	});
 */
define([
		//the file which has only name they are are already  been loaded
		'marionette'//Marionette
		//marionette JS framework
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/viewlrbylrnumber/statusdetails.js'
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/viewlrbylrnumber/viewpodphoto.js'
		,PROJECT_IVUIRESOURCES+'/resources/js/module/view/viewlrbylrnumber/lrstatusdetails.js'
		,'language'//import in require.config
		,PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
		,'elementmodel'
		,'errorshow'
		,'messageUtility'
		,'JsonUtility'
		], function(Marionette, StatusDetails, PodDetail, LRStatusDetails) {
	let _this, showEstimatedDeliveryDate, showLRStatusDetails;
	return Marionette.Behavior.extend({
		defaults: {
			fieldSelector: ":input",
		}, onDispatchDetails : function(){
			let btModal = new Backbone.BootstrapModal({
				content: new StatusDetails(),
				title:'Details',
				modalWidth : 40,
				cancelText:'',
				showFooter : true

			}).open();
		}, onViewPodDetails : function(){
			let btModal = new Backbone.BootstrapModal({
				content: new PodDetail(),
				title:'POD Details',
				modalWidth : 60,
				cancelText:'',
				showFooter : true

			}).open();
		}, onSearch: function() {
			_this = this;
			
			if(!_this.validateElements())
				return false;
			
			showLayer();
			let jsonObject = new Object();
			jsonObject.WAYBILLNUMBER = $("#lrNumberEle").val().trim();
			jsonObject.isCRMPage = true;
			getJSON(jsonObject, CUSTOMER_ACCESS_URL_CONSTANT+'/searchWayBillDetails/getWayBillDetails.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			hideAllMessages();

			if(response.message != undefined) {
				hideLayer();
				$('#myGrid').html('');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}

			hideLayer();

			require(['text!/ivcargo/template/lrsearch/lrsearch.html'], function(searchHtml) {
				$("#DataDiv").html(_.template(searchHtml));
				
				showEstimatedDeliveryDate	= response.showEstimatedDeliveryDate;
				showLRStatusDetails			= response.showLRStatusDetails;
				
				_this.setConsignorData(response.LRSEARCH);
				_this.setConsigneeData(response.LRSEARCH);
				_this.setLrData(response.LRSEARCH, response.podStatus, response.displayPODUploadLink, response.isPodRequiredForGroup);
				_this.setConsignmentDetails(response.LRSEARCH);
				
				if(response.LRSEARCH.accountGroupId == 580) {
					$('.weight').addClass('hide');
					$('.decValue').addClass('hide');
					$('.deliveredTo').addClass('hide');
					$('.deliveredToNo').addClass('hide');
					$('.crNo').addClass('hide');
					$('.consigneeNo').addClass('hide');
					$('.consignorNo').addClass('hide');
					
					$('#lrViewDetails').click(function() {
						_this.onLrStatusDetails();
					});
				}
			});
		},validateElements : function(){
			//this will check all the elements which have been added in configuration
			if(!myNod.areAll('valid')){
				showMessage('error', nod.constants.VALIDATIONMESSAGE);
			}
			myNod.performCheck();
			//this will give true if all elements validation is true
			return myNod.areAll('valid');

		},setConsignorData : function(consignorObj){
			$("*[data-consignor='name']").html(_this.checkCondition(consignorObj.consignorName));
			$("*[data-consignor='mobileNumber']").html(_this.checkCondition(consignorObj.consignorMobileNumber));
		},setConsigneeData : function(consigneeobj){
			$("*[data-consignee='name']").html(_this.checkCondition(consigneeobj.consigneeName));
			$("*[data-consignee='mobileNumber']").html(_this.checkCondition(consigneeobj.consigneeMobileNumber));
		},setLrData:function(lrObj,podStatus,displayPODUploadLink,isPodRequiredForGroup){
			$("*[data-lr='sourcebranch']").html(_this.checkCondition(lrObj.bookingWayBillTxnSourceBranch));
			$("*[data-lr='destinationBranch']").html(_this.checkCondition(lrObj.bookingWayBillTxnDestinationBranch));
			$("*[data-lr='currentStatus']").html(_this.checkCondition(lrObj.wayBillStatusString));
			$("*[data-lr='type']").html(_this.checkCondition(lrObj.bookingWayBillTxnWayBillType));
			$("*[data-lr='invoicenumber']").html(_this.checkCondition(lrObj.consignmentSummaryInvoiceNo));
			$("*[data-lr='actualWeight']").html(_this.checkCondition(lrObj.consignmentSummaryActualWeight));
			$("*[data-lr='chargedWeight']").html(_this.checkCondition(lrObj.consignmentSummaryChargeWeight));
			$("*[data-lr='declaredValue']").html(_this.checkCondition(lrObj.consignmentSummaryDeclaredValue));
			$("*[data-lr='totalQuantity']").html(_this.checkCondition(lrObj.consignmentSummaryQuantity));
			$("*[data-lr='bookingDate']").html(_this.checkCondition(lrObj.wayBillInfoBookingDateTimeString));
			$("*[data-lr='number']").html(_this.checkCondition(lrObj.bookingWayBillTxnWayBillNumber));
			$("*[data-lr='deliveredToName']").html(_this.checkCondition(lrObj.deliveryContactDetailsDeliveredToName));
			$("*[data-lr='deliveredToNumber']").html(_this.checkCondition(lrObj.deliveryContactDetailsDeliveredToNumber));
			$("*[data-lr='deliveredDateTime']").html(_this.checkCondition(lrObj.deliveryContactDetailsDeliveryDateTimeString));
			$("*[data-lr='crNumber']").html(_this.checkCondition(lrObj.deliveryContactDetailsWayBillDeliveryNumber));
			$("*[data-lr='estimatedDeliveryDate']").html(_this.checkCondition(lrObj.estimatedDeliveryDateString));
			
			$("#wayBillId").val(lrObj.bookingWayBillTxnWayBillId);
			$("#accountGroupId").val(lrObj.accountGroupId);
			
			if(jQuery.type( lrObj.lastReceivedDateTime ) === "undefined" || jQuery.type( lrObj.lastReceivedDateTime ) === "null" || !$.trim(lrObj.lastReceivedDateTime) ){
				$("#ReceivedAtDetails").addClass("hide");
			}else{
				$("#ReceivedAtDetails").removeClass("hide");
				$("*[data-lr='receivedDetails']").html(lrObj.godownName+"<span class='text-primary'> on </span>"+lrObj.lastReceivedDateTime)
			}
			
			if(!lrObj.showDispatchDetails)
				$("*[data-lr='dispatchDetails']").addClass("hide");
			else
				$("*[data-lr='dispatchDetails']").removeClass("hide");
			
			if(showEstimatedDeliveryDate)
				$("#estimateDlyDate").removeClass("hide");
			
			if(showLRStatusDetails)
				$("*[data-lr='lrViewDetails']").removeClass("hide");
			
			if(displayPODUploadLink) {
				$("*[data-lr='podDetails']").removeClass("hide");
				$("*[data-lr='podStatus']").html(podStatus);
			} else{
				$("*[data-lr='podDetails']").addClass("hide");
				$("*[data-lr='podStatus']").html(podStatus);
			}
		},setConsignmentDetails:function(consignmentDetailsObj){

			let consignmentArr 				= consignmentDetailsObj.consignmentDetails
			let classNameofQty 				= $("*[data-consignmentquantity='dynamic']").attr('class');
			let classNameofPackingType 		= $("*[data-consignmentpackingtype='dynamic']").attr('class');
			let classNameofSaidToContain 	= $("*[data-consignmentsaidtocontain='dynamic']").attr('class');

			let tbody = $("*[data-consignmentquantity='dynamic']").parent();

			for(let index in consignmentArr) {
				let newtr = $("<tr/>")

				let newtdQuantity = $("<td></td>");
				newtdQuantity.attr("class",classNameofQty);
				newtdQuantity.attr("data-selector",'qty'+consignmentArr[index].consignmentDetailsId);

				newtr.append(newtdQuantity);

				let newtdPackingType = $("<td></td>");
				newtdPackingType.attr("class",classNameofPackingType);
				newtdPackingType.attr("data-selector",'packingtype'+consignmentArr[index].consignmentDetailsId);
				newtr.append(newtdPackingType);

				let newtdSaidToContain = $("<td></td>");
				newtdSaidToContain.attr("class",classNameofSaidToContain);
				newtdSaidToContain.attr("data-selector",'saidToCOntain'+consignmentArr[index].consignmentDetailsId);
				newtr.append(newtdSaidToContain);

				$(tbody).before(newtr);
			}

			for(let index in consignmentArr){
				$("*[data-selector='qty"+consignmentArr[index].consignmentDetailsId+"']").html(consignmentArr[index].quantity);
				$("*[data-selector='packingtype"+consignmentArr[index].consignmentDetailsId+"']").html(consignmentArr[index].packingTypeName);
				$("*[data-selector='saidToCOntain"+consignmentArr[index].consignmentDetailsId+"']").html(consignmentArr[index].saidToContain);
			}
			$("*[data-consignmentquantity='dynamic']").parent().remove();
		},checkCondition:function(elemVal){
			if(jQuery.type( elemVal ) === "undefined" || jQuery.type( elemVal ) === "null" || !$.trim(elemVal) ){
				return "&nbsp;--"
			}
			return elemVal;
		}, onLrStatusDetails : function() {
			let object = {};
			
			object.isCustomerAccess = true;
			
			var btModal = new Backbone.BootstrapModal({
				content: new LRStatusDetails(object),
				title:'LR Status Details',
				modalWidth : 70,
				cancelText:'',
				showFooter : true

			}).open();
		}
	});
});