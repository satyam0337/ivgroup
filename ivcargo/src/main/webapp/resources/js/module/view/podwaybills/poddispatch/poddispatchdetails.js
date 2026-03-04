define([
	'marionette'//Marionette
	,'nodvalidation'//import in require.config
	,'errorshow'//import in require.config
	,'focusnavigation'//import in require.config
	,'autocompleteWrapper',//
	,'JsonUtility'
	,'messageUtility'
	], function (Marionette) {
	var 
	podDispatchData,
	myNod,
	_this;
	return Marionette.ItemView.extend({
		initialize: function(data) {
			//_this object is added because this object is not found in onRender function
			podDispatchData 			= data.slickData;

			_this = this;
		},
		render: function(){
			//this is the first method called when this function is called
			//triggerMethod onBeforeRender
			this.triggerMethod("before:render");
			//triggerMethod onRender
			this.triggerMethod("render");
			//triggerMethod onAfterRender
			this.triggerMethod("after:render");
		}, onBeforeRender: function() {

		}, onRender: function(){
			getJSON(null, WEB_SERVICE_URL+'/podDispatchWS/getPODDispatchDetailsElement.do', _this.setElements, EXECUTE_WITH_ERROR);
			return _this;
		}, onAfterRender: function() {

		}, setElements : function(response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			setTimeout(function(){
				$("#modalBody").load("/ivcargo/html/module/podwaybills/podDispatch/podDispatchDetails.html",function() {
					baseHtml.resolve();
				});
			},200);

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}

				var destinationBranchAutoComplete = new Object();
				destinationBranchAutoComplete.primary_key = 'branchId';
				destinationBranchAutoComplete.field = 'branchName';
				$("#destinationBranchEle").autocompleteCustom(destinationBranchAutoComplete);

				_this.setBranch(response);

				var courierNameAutoComplete = new Object();
				courierNameAutoComplete.primary_key = 'courierId';
				courierNameAutoComplete.callBack = _this.onCourierNameSelect;
				courierNameAutoComplete.field = 'name';
				$("#courierNameEle").autocompleteCustom(courierNameAutoComplete);

				if(response.Courier_List != undefined) {
					var courierName = $("#courierNameEle").getInstance();
					
					$(courierName).each(function() {
						this.option.source = response.Courier_List;
					});
				}

				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#destinationBranchEle',
					validate		: 'validateAutocomplete:#destinationBranchEle_primary_key',
					errorMessage	: 'Select Proper Destination !'
				});

				$(".ok").on('click', function() {
					myNod.performCheck();

					if(myNod.areAll('valid')){
						var jsonObject = new Object();

						jsonObject.lrArray  			= JSON.stringify(podDispatchData);

						var $inputs = $('#modalBody :input');
						//this will iterate all elements and will set the name as key and value of Element as value in jsonObject
						$inputs.each(function () {
							if($(this).val() != "")
								jsonObject[$(this).attr('name')] = $.trim($(this).val());
						});

						var btModalConfirm = new Backbone.BootstrapModal({
							content		: 	"Are you sure you want to Dispatch POD ?",
							modalWidth 	: 	30,
							title		:	'Dispatch',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();

						btModalConfirm.on('ok', function() {
							getJSON(jsonObject, WEB_SERVICE_URL+'/podDispatchWS/validateAndDispatchPOD.do', _this.onDispatch, EXECUTE_WITH_ERROR); //submit JSON
							showLayer();
						});
					}
				});
			});
		}, setBranch : function (response) {
			var destinationBranchName = $("#destinationBranchEle").getInstance();
			$(destinationBranchName).each(function() {
				this.option.source = response.sourceBranch;
			});
		}, onCourierNameSelect : function() {
			jsonObject = new Object();
			jsonObject.CourierId = $("#" + $(this).attr("id") + "_primary_key").val();
			getJSON(jsonObject,	WEB_SERVICE_URL + '/courierWS/getCourierByCourierId.do', _this.setCourierDetails,EXECUTE_WITHOUT_ERROR);
		}, setCourierDetails : function (response) {
			var courierDetails = response.Courier_List[0];
			var contactNumber;
			
//			$('#wayNoEle').val(courierDetails.wayNo);
			if(courierDetails.mobileNo != undefined && courierDetails.mobileNo != "") {
				contactNumber	= courierDetails.mobileNo;

				if(courierDetails.phoneNo != undefined && courierDetails.phoneNo != "")
					contactNumber	= contactNumber+", "+courierDetails.phoneNo;
			} else
				contactNumber	= courierDetails.phoneNo;

			$('#contactNumberEle').val(contactNumber);
		}, onDispatch : function(response) {
			if(response.message != undefined){
				hideLayer();
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			hideLayer();
			var MyRouter = new Marionette.AppRouter({});
			MyRouter.navigate('&modulename=podDispatch&masterid='+response.podDispatchId+'&masterid2='+response.podDispatchNumber);
			location.reload();
		}
	});	
});