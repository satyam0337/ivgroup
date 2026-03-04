/**
 *  define(['moduleURL1', 'moduleURL2'], function (module1Obj, module2Obj) {
        	module1 should consist of moduleURL1 URL and module1Obj is the Object corresponding to moduleURL1
            modules module1Obj and module2Obj are now available for use.
        });
    });
 */
define([
        //the file which has only name they are are already  been loaded
        'marionette'//Marionette
        //marionette JS framework
        ,PROJECT_IVUIRESOURCES+'/resources/js/backbone/backbone.bootstrap-modal.js'
        ,'language'//import in require.config
        ,'elementmodel'
        ,'errorshow'
        ,'messageUtility'
        ,'JsonUtility'
        ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/trafficwisesearch/settrafficwisesearchdetails.js'
        ], function(Marionette) {
	var _this = this;
	var jsonObject = new Object(),childwin;
	return Marionette.Behavior.extend({
		defaults: {
			fieldSelector: ":input",
		},
		onSearchLRDetails: function() {
			_this = this;

			if(!_this.validateElements())
				return false;
			
			if($('#excBranchesSelectEle').val() != '')
				jsonObject["searchByBranchesId"] 	= $('#excBranchesSelectEle').val();
			
			if($('#subregionSelectEle_primary_key').val() != '')
				jsonObject["subRegionId"] 			= $('#subregionSelectEle_primary_key').val();
			
			if($('#branchesSelectEle').val() != '')
				jsonObject["destinationBranchId"] 	= $('#branchesSelectEle').val();
			
			if(!_this.checkForAllSelection('excBranchesSelectEle', 'From Branch'))
				return false;
			
			if(!_this.checkForAllSelection('branchesSelectEle', 'To Branch'))
				return false;
			
			showLayer();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/trafficWiseSearchWS/getTrafficWiseSearchDetails.do', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			hideAllMessages();
			
			if(response.message != undefined) {
				hideLayer();
				var infoMessage = response.message;
				showMessage(infoMessage.typeName, iconForInfoMsg + infoMessage.description);
				changeDisplayProperty('bottom-border-boxshadow', 'none');
				$("#printTrafficSearchDetails tr").remove();
				$("#trafficSearchDetails tr").remove();
				return;
			}
			
			setTrafficWiseSearchDetails(response);

			$("#trafficSearchDetails tr").click(function(){
				$(this).addClass('selected').siblings().removeClass('selected');    
				var value	= $(this).find('td:first').html();
			});
			
			hideLayer();
		}, validateElements : function() {
			if(!validateInputTextFeild(3, 'excBranchesSelectEle', 'excBranchesSelectEle', 'error', branchNameErrMsg))
				return false;
			
			if(!validateInputTextFeild(3, 'subregionSelectEle_primary_key', 'subregionSelectEle', 'error', subRegionNameErrMsg))
				return false;
			
			if(!validateInputTextFeild(3, 'branchesSelectEle', 'branchesSelectEle', 'error', subRegionNameErrMsg))
				return false;
			
			return true;
		}, checkForAllSelection : function(id, branchName) {
			var selectedBranch = $('#' + id).val();
			var selectedSubRegion = $('#' + id).val();
			var selectedArr = selectedBranch.split(',');
			
			if(selectedArr.length > 1 && isValueExistInArray(selectedArr, 0)) {
				showMessage('error', "Not Allowed Select Another Branch With All Branch Selection !!");
				return false;
			}
		
			if(selectedBranch == "") {
				showMessage('error', ' Select proper ' + branchName +' !!');
				$('#' + id).focus();
				return false;
			}
		
			if(selectedSubRegion == "") {
				showMessage('error', ' Select proper ' + branchName +' !!');
				return false;
			}
		
			return true;
		}, onPrintLRDetails : function() {
			if($('#excBranchesSelectEle').val() != '')
				var searchByBranchesId = $('#excBranchesSelectEle').val();
			
			if($('#subregionSelectEle_primary_key').val() != '')
				var subRegionId = $('#subregionSelectEle_primary_key').val();
			
			if($('#branchesSelectEle').val() != '')
				var destinationBranchId = $('#branchesSelectEle').val();
			
			childwin = window.open("printWayBill.do?pageId=340&eventId=10&modulename=trafficWisePrint&masterid1="+searchByBranchesId+"&masterid2="+subRegionId+"&masterid3="+destinationBranchId,"newwin","width=800,height=800");
			
			hideLayer();
			
		}
	});
});