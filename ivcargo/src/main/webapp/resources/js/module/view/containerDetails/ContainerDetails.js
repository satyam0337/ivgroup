define([ 'marionette'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
		 ,'slickGridWrapper2'
         ,'JsonUtility'
         ,'messageUtility'
         ,PROJECT_IVUIRESOURCES + '/resources/js/validation/regexvalidation.js'
         ,'nodvalidation'
		 ,'focusnavigation'
         ],
         function(Marionette, UrlParameter, slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	ContainerDetails,
	containerTypeArray,
	doneTheStuff = false,
	editContainer = false,
	deleted = false,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
			wayBillId 				= UrlParameter.getModuleNameFromParam('wayBillId');
			jsonObject.waybillId	= wayBillId;
			
		}, render: function() {
			
			jsonObject				= new Object();
			jsonObject.waybillId	= wayBillId;
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/containerDetailsWS/getContainerDetails.do?', _this.setContainerDetails, EXECUTE_WITHOUT_ERROR);
	
		}, setContainerDetails : function(response) {
			
			containerTypeArray		= new Array(); 
			containerTypeArray[0] = {'Id':1,'Value':'20ft Single'};
			containerTypeArray[1] = {'Id':2,'Value':'20ft Double'};
			containerTypeArray[2] = {'Id':3,'Value':'40ft Single'};
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/waybill/ContainerDetails/ContainerDetails.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(response.message != undefined) {
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					hideLayer();
					setTimeout(() => {
						window.close();
					}, 1000);
					return;
				}

				ContainerDetails		= response.CorporateAccount;
				editContainer			= response.editContainer;
				
				hideLayer();
				slickGridWrapper2.setGrid(response);
				
				$("#edit").click(function(){
					_this.editContainerDetails();
				});
				
				$("#view").click(function(){
					_this.viewContainerDetails();
				});

				if(editContainer)
					$('#edit').removeClass('hide');
				else
					$('#edit').addClass('hide');
			});
		}, viewContainerDetails : function() {
			$("#bottom-border-boxshadow").addClass('hide');
			$("#middle-border-boxshadow").removeClass('hide');
		}, editContainerDetails : function() {
			$("#middle-border-boxshadow").addClass('hide');
			$("#bottom-border-boxshadow").removeClass('hide');
			
			_this.setEditContainerDetails();
			
			$("#update").click(function(){
				_this.update();
			});
			$("#delete").click(function(){
				_this.deleteContainerDetails();
			});
			
		}, setEditContainerDetails : function() {
			if(ContainerDetails != undefined){
				var columnArray		= new Array();
				var styleTag		= 'text-align: center; vertical-align: middle; text-transform: uppercase';
				var classTag		= 'form-control';
					
				for (var i = 0; i < 2; i++) {
					
					var obj					= ContainerDetails[i];
					var primaryId;
					var containerType;		 
					var containerNumber;		
					var containerSize;	
					var sealNumber;
					
					if(obj != undefined){
						primaryId			= obj.containerDetailsId;
						containerType		= obj.containerType;
						containerNumber		= obj.containerNumber;
						containerSize		= obj.containerSize;
						sealNumber			= obj.sealNumber;
					} else {
						primaryId			= 0;
						containerType		= 0;
						containerNumber		= '';
						containerSize		= 0;
						sealNumber			= '';
					}
					
					if(!$('#'+primaryId).exists()){
						columnArray.push("<td style='"+styleTag+"' id='contTypeTd_"+(i+1)+"' ></td>");
						columnArray.push("<td style='"+styleTag+"' ><input type='text' style='"+styleTag+"' class='"+classTag+"' onblur='validateContainerNumber(this,"+(i+1)+");' id='contNo_" + (i+1) + "' value='"+containerNumber+"'></input></td>");
						columnArray.push("<td style='"+styleTag+"' ><input type='text' style='"+styleTag+"' class='"+classTag+"' onkeypress='return allowOnlyNumeric(event);' onblur='validateContainerSize(this,"+(i+1)+");' id='contSize_" + (i+1) + "' value='"+containerSize+"'></input></td>");
						columnArray.push("<td style='"+styleTag+"' ><input type='text' style='"+styleTag+"' class='"+classTag+"' onblur='validateSealNumber(this,"+(i+1)+");' id='sealNo_" + (i+1) + "' value='"+sealNumber+"'></input></td>");
						columnArray.push("<td style='"+styleTag+"' class='hide' ><input type='hidden' id='contDetailsId_" + (i+1) + "' value='"+primaryId+"'></input></td>");
						
						$('#containerDetailsBody').append('<tr id="'+primaryId+'">' + columnArray.join(' ') + '</tr>');
						
						_this.createContainerTypeSelection(containerType, i + 1);
						
						if($("#contType_1").val() == 1 || $("#contType_1").val() == 3){
							$("#contType_2").prop( "disabled", true );
						} 
						
						columnArray	= [];
					}
				}
			}
			
		}, createContainerTypeSelection : function(containerTypeId, i) {
			var containerTypeSel = $('<select id="contType_'+ i +'" onchange="validateContainer(this);" name="contType_'+ i +'" class="form-control" data-tooltip = "Container Type" style = "width: 180px;"/>');
			containerTypeSel.append($("<option>").attr('value', 0).text('---Container Type---'));
			$(containerTypeArray).each(function() {
				if(containerTypeId == this.Id) {
					containerTypeSel.append($("<option selected='selected'>").attr('value', this.Id).text(this.Value));
				} else {
					containerTypeSel.append($("<option>").attr('value', this.Id).text(this.Value));
				}
			});
			
			$('#contTypeTd_' + i).append(containerTypeSel);
		}, update : function() {
			var containerDetailsArray 	= [];
			var containerDetailsData 	= {};
			
			if(!_this.validateContainerBeforeUpdate())
				return;
			
			if($("#contType_1").val() > 0){
				containerDetailsData 							= {};
				containerDetailsData.containerDetailsId			= $("#contDetailsId_1").val();
				containerDetailsData.containerNumber			= $("#contNo_1").val();
				containerDetailsData.containerSize				= $("#contSize_1").val();
				containerDetailsData.containerType				= $("#contType_1").val();
				containerDetailsData.sealNumber					= $("#sealNo_1").val();
				containerDetailsData.wayBillId					= wayBillId;

				containerDetailsArray.push(containerDetailsData);
			}

			if($("#contType_2").val() > 0){
				containerDetailsData 							= {};
				containerDetailsData.containerDetailsId			= $("#contDetailsId_2").val();
				containerDetailsData.containerNumber			= $("#contNo_2").val();
				containerDetailsData.containerSize				= $("#contSize_2").val();
				containerDetailsData.containerType				= $("#contType_2").val();
				containerDetailsData.sealNumber					= $("#sealNo_2").val();
				containerDetailsData.wayBillId					= wayBillId;

				containerDetailsArray.push(containerDetailsData);
			}
				
			if(containerDetailsArray != undefined){
				if(!doneTheStuff){
					var ans = confirm('Are you sure you want to update?');

					if(ans){
						showLayer();
						doneTheStuff				= true;
						var jsonObject				= new Object();
						jsonObject.updateArray  	= JSON.stringify(containerDetailsArray);
						jsonObject.historyArray  	= JSON.stringify(ContainerDetails);
						jsonObject.waybillId  		= wayBillId;

						getJSON(jsonObject, WEB_SERVICE_URL + '/containerDetailsWS/updateContainerDetails.do?', _this.responseAfterUpdate, EXECUTE_WITHOUT_ERROR);
					} else {
						doneTheStuff				= false;
						hideLayer();
					}
				} 
			}
	
		} , deleteContainerDetails : function(){
			if(!deleted){
				var ans = confirm('Are you sure you want to delete container details from this LR?');
				if(ans){
					showLayer();
					deleted						= true;
					var jsonObject				= new Object();
					jsonObject.historyArray  	= JSON.stringify(ContainerDetails);
					jsonObject.waybillId  		= wayBillId;

					getJSON(jsonObject, WEB_SERVICE_URL + '/containerDetailsWS/deleteContainerDetails.do?', _this.responseAfterUpdate, EXECUTE_WITHOUT_ERROR);
				} else {
					deleted				= false;
					hideLayer();
				}
			} 
		} , validateContainerBeforeUpdate : function(){
			
			if($('#contType_1').val() <= 0){
				if($('#contType_2').val() <= 0){
					showMessage('info','Please select container type');
					$('#contType_1').focus();
					return false;
				}
			} else if($('#contType_2').val() <= 0){
				if($('#contType_1').val() <= 0){
					showMessage('info','Please select container type');
					$('#contType_1').focus();
					return false;
				}
			}
			
			if($('#contType_1').val() > 0 && $('#sealNo_1').val() == ''){
				showMessage('info','Please enter seal number');
				$('#sealNo_1').focus();
				return false;
			}
			
			if($('#contType_2').val() > 0 && $('#sealNo_2').val() == ''){
				showMessage('info','Please enter seal number');
				$('#sealNo_2').focus();
				return false;
			}

			if($('#contType_1').val() > 0 && ($('#contSize_1').val() <= 0 || $('#contSize_1').val() == '')){
				showMessage('info','Please enter container size');
				$('#contSize_1').focus();
				return false;
			}
			
			if($('#contType_2').val() > 0 && ($('#contSize_2').val() <= 0 || $('#contSize_2').val() == '')){
				showMessage('info','Please enter container size');
				$('#contSize_2').focus();
				return false;
			}

			if($('#contType_1').val() > 0 && $('#contNo_1').val() == ''){
				showMessage('info','Please enter container number');
				$('#contNo_1').focus();
				return false;
			}
			
			if($('#contType_2').val() > 0 && $('#contNo_2').val() == ''){
				showMessage('info','Please enter container number');
				$('#contNo_2').focus();
				return false;
			}
			
			var containerType1 = $("#contType_1").val();
			var containerType2 = $("#contType_2").val();
			
			if(containerType1 == 1 || containerType1 == 3){
				if(containerType2 > 0){
					showMessage('info','Cannot select single and double both at the same time.');
					return false;
				}
			} else if(containerType1 == 2){
				if(containerType2 < 0){
					showMessage('info','Please enter one more details for 20ft double conatiner.');
					$("#contType_1").focus();
					return false;
				}
				if(containerType1 < 0){
					showMessage('info','Please enter one more details for 20ft double conatiner.');
					$("#contType_2").focus();
					return false;
				}
				var containerSize = Number($('#contSize_2').val());
				if(containerSize <= 0 || containerSize == ''){
					showMessage('info','Please select conatiner size');
					$('#contSize_2').focus();
					hideLayer();
					return false;
				}
			}
			
			if(!_this.validContainerSize()){
				return false;
			}
			
			return true;
		} , validContainerSize : function(){
			var cont1 = $('#contType_1').val();
			var cont2 = $('#contType_2').val();
			if(cont1 > 0){
				if(cont1 == 1 || cont1 == 2){
					if($('#contSize_1').val() > 20){
						showMessage('info','Cannot add size more than 20ft.');
						$('#contSize_1').val(0);
						$('#contSize_1').focus();
						hideLayer();
						return false;
					}
				} else {
					if($('#contSize_1').val() > 40){
						showMessage('info','Cannot add size more than 40ft.');
						$('#contSize_1').val(0);
						$('#contSize_1').focus();
						hideLayer();
						return false;
					}
				}
			} 
			
			if(cont2 > 0){
				if(cont1 == 1 || cont1 == 2){
					if($('#contSize_2').val() > 20){
						showMessage('info','Cannot add size more than 20ft.');
						$('#contSize_2').val('');
						$('#contSize_2').focus();
						hideLayer();
						return false;
					}
				} else {
					if($('#contSize_2').val() > 40){
						showMessage('info','Cannot add size more than 40ft.');
						$('#contSize_2').val('');
						$('#contSize_2').focus();
						hideLayer();
						return false;
					}
				}
			}
			return true;
		} , responseAfterUpdate : function(response){
			if(response.message != undefined) {
				var message = response.message;
				showMessage(message.typeName, message.typeSymble + ' ' + message.description);
				hideLayer();
				setTimeout(() => {
					window.close();
				}, 1000);
				return;
			}
		}
	});
});

function validateContainer(obj){
	var value 	= obj.value;
	var id 		= obj.id;
	
	if(value == 1 || value == 3){ //single
		if(id == 'contType_1'){
			$("#contType_2").val(0);
			$("#contType_2").prop( "disabled", true );
			$("#contNo_2").prop( "disabled", true );
			$("#contSize_2").prop( "disabled", true );
			$("#sealNo_2").prop( "disabled", true );
		} else {
			$("#contType_1").val(0);
			$("#contType_1").prop( "disabled", true );
			$("#contNo_1").prop( "disabled", true );
			$("#contSize_1").prop( "disabled", true );
			$("#sealNo_1").prop( "disabled", true );
		}
	} else if(value == 2){
		if(id == 'contType_1'){
			$("#contType_2").val(2);
			$("#contType_2").prop( "disabled", true );
			$("#contNo_2").prop( "disabled", false );
			$("#contSize_2").prop( "disabled", false );
			$("#sealNo_2").prop( "disabled", false );
		} else {
			$("#contType_1").val(2);
			$("#contType_1").prop( "disabled", true );
			$("#contNo_1").prop( "disabled", false );
			$("#contSize_1").prop( "disabled", false );
			$("#sealNo_1").prop( "disabled", false );
		}
	} else {
		$("#contType_2").val(0);
		$("#contType_2").prop( "disabled", true );
	}
}

function validateContainerNumber(obj,i){
	
	var containerType = Number($('#contType_'+i).val());
	if(containerType <= 0){
		showMessage('info','Please select conatiner type');
		$('#contType_'+i).focus();
		hideLayer();
		return false;
	}
}
function validateContainerSize(obj,i){
	var id	 		= obj.id;
	var value 		= obj.value;
	var containerNo = Number($('#contNo_'+i).val());
	if(containerNo.length <= 0){
		showMessage('info','Please enter conatiner number');
		$('#contNo_'+i).focus();
		hideLayer();
		return false;
	}
	
	var containerType = Number($('#contType_'+i).val());
	if(containerType == 1 || containerType == 2){
		if(value > 20){
			showMessage('info','Cannot add size more than 20ft.');
			$('#'+id).val(0);
			$('#'+id).focus();
			hideLayer();
			return false;
		}
	} else {
		if(value > 40){
			showMessage('info','Cannot add size more than 40ft.');
			$('#'+id).val(0);
			$('#'+id).focus();
			hideLayer();
			return false;
		}
	}
	
}
function validateSealNumber(obj,i){
	var containerSize = Number($('#contSize_'+i).val());
	if(containerSize <= 0 || containerSize == ''){
		showMessage('info','Please select conatiner size');
		$('#contSize_'+i).focus();
		hideLayer();
		return false;
	}
	
}