var branchId;
var remark;
var executiveId;
var executiveName;
var executiveMobile;
define(['marionette'//Marionette
     ,'/ivcargo/resources/js/blockenablebooking/commonfunctionblockenable.js'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	 ,'messageUtility'
	 ,'JsonUtility'
	 ,"focusnavigation"
	 ,'nodvalidation'
	 ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
], function(Marionette,blockbooking) { 
	'use strict';
	let jsonObject = new Object(),_this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchActivationWS/getActivatedRouteDetails.do?', _this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements : function(response) {

			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			let blockEnableBookingHtml = new $.Deferred();

			loadelement.push(baseHtml);
			loadelement.push(blockEnableBookingHtml);
			
			$("#mainContent").load("/ivcargo/html/module/tce/tceActivatedRoute.html", function() {
				baseHtml.resolve();
			});
			
			$("#modalContentBlockEnable").load("/ivcargo/html/module/blockEnableBooking/blockEnableBookingModal.html", function() {
					blockEnableBookingHtml.resolve();
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
				
					$('#submitBlockBooking').on('click', function() {
					    blockbooking.blockBookingLegDetails();
					 });
					 
					  $('#blockReason').on('input', function() {
			              var currentLength = $(this).val().length;
			              $('#charCount').text(currentLength + '/500 characters used');
			          });
					 
					 $('#submitEnableBooking').on('click', function() {
					    blockbooking.enableBookingLegDetails();
					 });
					 
					  $('#enableReason').on('input', function() {
			              var currentLength = $(this).val().length;
			              $('#enableCharCount').text(currentLength + '/500 characters used');
			          });


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
			showLayer();

			let tceBranchList = response.activatedRoute;
			let executive = response.executive;
			
			

			$('#dataTable thead').empty();
			$('#dataTable tbody').empty();
                  
		 	let headerColumnArray = new Array();
				    
         	headerColumnArray.push("<th class='textAlignCenter'>Source Branch</th>");
         	headerColumnArray.push("<th class='textAlignCenter'>Destination Branch</th>");
         	headerColumnArray.push("<th class='textAlignCenter'>No Of Slab</th>");
       		//headerColumnArray.push("<th class='textAlignCenter'>Block Booking</th>");
		    headerColumnArray.push("<th class='textAlignCenter'>Actions</th>");

       		

          	$('#dataTable thead').append('<tr class="textAlignLeft">' + headerColumnArray.join(' ') + '</tr>');
             if(tceBranchList != undefined && tceBranchList != null && tceBranchList.length > 0){
				
		          	for(let data of tceBranchList) {
						 var  sourceBranchId = data.sourceBranchId;
						 var destinationBranchId = data.destinationBranchId;
						 
		            	let dataColumnArray = new Array();
		
						dataColumnArray.push("<td class='textAlignLeft'><a target=='_blank' href='master.do?pageId=340&eventId=13&modulename=tceBranchActivation&masterid=" + data.sourceBranchId + "'>" +data.sourceBranch + "</a></td>");
						dataColumnArray.push("<td class='textAlignLeft'><a target=='_blank' href='master.do?pageId=340&eventId=13&modulename=tceBranchActivation&masterid=" + data.destinationBranchId + "'>" +data.destinationBranch + "</a></td>");
		            	dataColumnArray.push("<td class='textAlignLeft'>" + data.noOfSlabRates + "</td>");
		                //dataColumnArray.push("<td class='textAlignLeft'><button class='btn btn-danger deactivateBranchBtn' data-branch-id='" + data.branchId + "' data-executive-id='" + executive.executiveId + "' data-executive-mobile-number='" + executive.executiveMobileNumber + "' data-executive-name='" + executive.executiveName + "'>Deactivate Branch</button></td>");
		               dataColumnArray.push("<td class='textAlignLeft'><div id='blockAndEnableBooking-" + data.sourceBranchId + "-" + data.destinationBranchId + "'></div></td>");

							$('#dataTable tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
						/*	let targetDivId = '#blockAndEnableBooking-' + sourceBranchId + '-' + destinationBranchId;
							
							

                let jsonObject = {
                    sourceBranchId: sourceBranchId,
                    destinationBranchId: destinationBranchId,
                    targetDivId: targetDivId
                };
                blockbooking.checkIfBlockDetailsExists(jsonObject);*/
        }
				new DataTable('#dataTable', {
					
					drawCallback: () => {
						for(let data of tceBranchList) {
										 var  sourceBranchId = data.sourceBranchId;
										 var destinationBranchId = data.destinationBranchId;
						
											let targetDivId = '#blockAndEnableBooking-' + sourceBranchId + '-' + destinationBranchId;
											
											
				 setTimeout(function() {
				                let jsonObject = {
				                    sourceBranchId: data.sourceBranchId,
				                    destinationBranchId: data.destinationBranchId,
				                    targetDivId: targetDivId
				                };
				
				                blockbooking.checkIfBlockDetailsExists(jsonObject);
				            }, 0);  
				        }
					}
				});
			 }
			hideLayer();
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
            
             $('#dataTable').on('click', '.actionBtn', function() {
                let action = $(this).data('action');
                let sourceBranchId = $(this).data('source-branch-id');
                let destinationBranchId = $(this).data('destination-branch-id');

                if (action === 'block') {
                    blockbooking.blockBookingLegDetails(sourceBranchId, destinationBranchId);

                } else if (action === 'enable') {
                    blockbooking.enableBookingLegDetails(sourceBranchId, destinationBranchId);
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

                $('#deactivateBranchModal').modal('hide');
                _this.saveDeactivationInformation();
            });
		}, checkBranchDeactivationStatus: function(branchId) {

			let jsonObject = new Object();
			showLayer();


			jsonObject.branchId = branchId;

			getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/checkBranchDeactivationStatus.do?', _this.setResponseForActivation, EXECUTE_WITHOUT_ERROR);

		},setResponseForActivation : function(response) {
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

            showLayer();
            let jsonObject = _this.getDataToSave();
             
            
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
			if (response && response.message === "Deactivated Branch Successfully!") {
        showMessage('success', 'Deactivated Branch Successfully!');
    }else if (response && response.message === "Branch Already Deactivated") {
		        showMessage('info', 'Branch Already Deactivated');
    }
    else {
        showMessage('error', 'Deactivation failed');
    }
			setTimeout(function() {
				location.reload();
			}, 1000);
				},
    });
});
