var branchId;
var remark;
var executiveId;
var executiveName;
var executiveMobile;
define(['marionette'//Marionette
	 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	 ,'messageUtility'
	 ,'JsonUtility'
	 ,"focusnavigation"
	 ,'nodvalidation'
	 ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
], function(Marionette) { 
	'use strict';
	let jsonObject = new Object(),_this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchActivationWS/getBranchActivationDetails.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements : function(response) {

			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/tce/tce.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				if(response.message != undefined) {
					hideLayer();
					let errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					return;
				}
				
				_this.tableData(response);
				_this.setupEventHandlers();

		/*
			 $('#remark').on('input', function() {
        if ($(this).val().trim() !== "") {
            $('#confirmationMessage').show();
            $('#cancelButton').show();
            $('#confirmDeactivateBtn').show();
        } else {
            $('#confirmationMessage').hide();
            $('#cancelButton').hide();
            $('#confirmDeactivateBtn').hide();
        }
    });*/

/*    $('#dataTable').on('click', '.deactivateBranchBtn', function() {
		branchId = $(this).data('branch-id');
		executiveId = $(this).data('executive-id');
		executiveName = $(this).data('executive-name');
		executiveMobile =  $(this).data('executive-mobile-number');*/


     /*   $('#deactivateBranchModal').data('branch-id', branchId);
        $('#deactivateBranchModal').data('executive-id', executiveId);
        $('#deactivateBranchModal').data('executive-mobile-number', executiveMobile);
        $('#deactivateBranchModal').data('executive-name', executiveName);
*/
 /*       $('#remark').val('');
        $('#confirmationMessage').hide();
        $('#cancelButton').hide();
        $('#confirmDeactivateBtn').hide();
        $('#deactivateBranchModal').modal('show');    });*/

    // Handle confirm deactivation button click
/*    $('#confirmDeactivateBtn').on('click', function() {
*/		//branchId = $('#deactivateBranchModal').data('branch-id');
/*		remark = $('#remark').val();
*/		/*executiveId = $('#deactivateBranchModal').data('executive-id');
		executiveMobile = $('#deactivateBranchModal').data('executive-mobile-number');
		executiveName = $('#deactivateBranchModal').data('executive-name');
*/
   /*     console.log("Branch ID:", branchId, "Remark:", remark);
        console.log("Executive ID:", executiveId, "Executive Mobile:", executiveMobile, "Executive Name:", executiveName);

   */
      /*  $('#deactivateBranchModal').modal('hide');
        _this.saveDeactivationInformation();
    });*/
    
    
 /*   $('#confirmDeactivateBtn').click(function() {
					
					_this.saveDeactivationInformation(response)
				});*/
    

				hideLayer();
			});
		}, tableData : function(response) {
			let tceBranchList = response.tceBranchList;
			let executive = response.executive;
			
			

			$('#dataTable thead').empty();
			$('#dataTable tbody').empty();
                  
		 	let headerColumnArray = new Array();
				    
         	headerColumnArray.push("<th class='textAlignCenter'>Branch Name</th>");
         	headerColumnArray.push("<th class='textAlignCenter'>Status</th>");
         	headerColumnArray.push("<th class='textAlignCenter'>City</th>");
       		headerColumnArray.push("<th class='textAlignCenter'>Progress (%)</th>")
       		headerColumnArray.push("<th class='textAlignCenter'>Branch Deactivation</th>");

       		

          	$('#dataTable thead').append('<tr class="textAlignLeft">' + headerColumnArray.join(' ') + '</tr>');
             
          	for(let data of tceBranchList) {
            	let dataColumnArray = new Array();

				dataColumnArray.push("<td class='textAlignLeft'><a target=='_blank' href='master.do?pageId=340&eventId=13&modulename=tceBranchActivation&masterid=" + data.branchId + "'>" +data.branchName + "</a></td>");
            	dataColumnArray.push("<td class='textAlignLeft'>" + data.statusStr + "</td>");
            	dataColumnArray.push("<td class='textAlignLeft'>" + data.city + "</td>");
            	dataColumnArray.push("<td class='textAlignLeft'>" + data.percentage + "</td>");
               // dataColumnArray.push("<td class='textAlignLeft'><button class='btn btn-danger deactivateBranchBtn' data-branch-id='" + data.branchId + "' data-executive-id='" + executive.executiveId + "' data-executive-mobile-number='" + executive.executiveMobileNumber + "' data-executive-name='" + executive.executiveName + "'>Deactivate Branch</button></td>");

					if (data.statusStr === "Active") {
						dataColumnArray.push("<td class='textAlignLeft'><button class='btn btn-danger deactivateBranchBtn' data-branch-id='" + data.branchId + "' data-executive-id='" + executive.executiveId + "' data-executive-mobile-number='" + executive.executiveMobileNumber + "' data-executive-name='" + executive.executiveName + "'>Deactivate Branch</button></td>");
					} else {
						dataColumnArray.push("<td class='textAlignLeft'></td>");
					}

	        	$('#dataTable tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
		}
			
			new DataTable('#dataTable');
		},setupEventHandlers: function() {
            // Show the confirmation message and buttons when the user enters a remark
            $('#remark').on('input', function() {
                if ($(this).val().trim() !== "") {
                    $('#confirmationMessage').show();
                    $('#cancelButton').show();
                    $('#confirmDeactivateBtn').show();
                } else {
                    $('#confirmationMessage').hide();
                    $('#cancelButton').hide();
                    $('#confirmDeactivateBtn').hide();
                }
            });

            // Attach event listener to the dynamically added button
			$('#dataTable').on('click', '.deactivateBranchBtn', function() {
				branchId = $(this).data('branch-id');
				executiveId = $(this).data('executive-id');
				executiveName = $(this).data('executive-name');
				executiveMobile = $(this).data('executive-mobile-number')


				_this.checkBranchDeactivationStatus(branchId);

			});
               /* $('#remark').val('');
                $('#confirmationMessage').hide();
                $('#cancelButton').hide();
                $('#confirmDeactivateBtn').hide();
                $('#deactivateBranchModal').modal('show');
            });*/

            // Handle confirm deactivation button click
		$('#confirmDeactivateBtn').on('click', function() {
                remark = $('#remark').val();

                console.log("Branch ID:", branchId, "Remark:", remark);
                console.log("Executive ID:", executiveId, "Executive Name:", executiveName);
                console.log("Executive ID:", executiveMobile);

                $('#deactivateBranchModal').modal('hide');
                _this.saveDeactivationInformation();
            });
		}, checkBranchDeactivationStatus: function(branchId) {

			let jsonObject = new Object();
			showLayer();


			jsonObject.branchId = branchId;
			console.log("jsonObject:", jsonObject);

			getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/checkBranchDeactivationStatus.do?', _this.setResponseForActivation, EXECUTE_WITHOUT_ERROR);

		},setResponseForActivation : function(response) {
			console.log("response_______"+response);
			hideLayer();
			if (response && response.message === "Branch is Already Deactivated!") {
                showMessage('info', 'Branch is Already Deactivated');
            } else if(response && response.message === "Branch is Active"){
				  $('#remark').val('');
                $('#confirmationMessage').hide();
                $('#cancelButton').hide();
                $('#confirmDeactivateBtn').hide();
                $('#deactivateBranchModal').modal('show');
            }else if(response && response.message === "Branch Not Found")
               showMessage('error', 'Branch Not Found');

		},saveDeactivationInformation : function() {
               console.log("Saving Deactivation Information");

            console.log("Branch ID:", branchId);
            console.log("Remark:", remark);
            console.log("Executive ID:", executiveId);
            console.log("Executive Name:", executiveName);
           console.log("Executive Name:", executiveMobile);

            showLayer();
            let jsonObject = _this.getDataToSave();
             
             
             console.log("jsonObject:", jsonObject);

            
            getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/deactivateBranchdetails.do?', _this.setResponse, EXECUTE_WITHOUT_ERROR);
        }, getDataToSave : function() {
            let jsonObject = new Object();
			jsonObject.branchId = branchId;
			jsonObject.remark = remark;
			jsonObject.executiveId = executiveId;
			jsonObject.executiveName = executiveName;
			jsonObject.executiveMobile = executiveMobile;

            return jsonObject;
        },setResponse : function(response){
			hideLayer();
					let message	= response.message;
			if(message.type != MESSAGE_TYPE_ERROR) {
				        showMessage('success', message.description); // Adjust accordingly if `description` is the right field to display

				setTimeout(function() {
					location.reload();
				}, 2000);
			}
			else {
        // If it's an error, show the error message
        showMessage('error', message.description); // Adjust accordingly if `description` is the right field to display
    }
 
				},
    });
});
