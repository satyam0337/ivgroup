var globalDivId;
var globalSourceBranchId;
var globalDestinationBranchId;

define(['selectizewrapper'], function(Selectizewrapper) {
    var _this;

    return {
        blockBookingLegDetails: function() {
            _this = this; 

            var blockReason = $('#blockReason').val().trim();
            console.log("blockReason :: " + blockReason);

            if (blockReason === "") {
                showMessage('error', "Please Enter a Reason for Blocking !");
                return false;
            }

            let jsonObject = {};
            if (globalSourceBranchId == null && globalDestinationBranchId == null) {
                jsonObject.sourceBranchId = $('#selectBranch').val();
                jsonObject.destinationBranchId = $('#etaDestBranch').val();
            } else {
                jsonObject.sourceBranchId = globalSourceBranchId;
                jsonObject.destinationBranchId = globalDestinationBranchId;
            }

            jsonObject.reasonForBlock = blockReason;

            showLayer();
            $('#blockBookingModal').modal('hide');
            getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/blockBooking.do?', _this.setResponseAfterBlockAndEnable.bind(_this), EXECUTE_WITH_NEW_ERROR);
        },

        enableBookingLegDetails: function() {
            _this = this;
            console.log('Enabling booking leg details...');
            var enableReason = $('#enableReason').val().trim();

            if (enableReason === "") {
                showMessage('error', "Please Enter a Reason for Enabling !");
                return false;
            }

            let jsonObject = {};
            
			if (globalSourceBranchId == null && globalDestinationBranchId == null) {
				jsonObject.blockBookingLegDetailsId = $('#enableBooking').val();
				jsonObject.sourceBranchId = $('#selectBranch').val();
				jsonObject.destinationBranchId = $('#etaDestBranch').val();
				
			} else {
				jsonObject.sourceBranchId = globalSourceBranchId;
				jsonObject.destinationBranchId = globalDestinationBranchId;
			}
            jsonObject.reasonForEnable = enableReason;

            showLayer();
            $('#enableBookingModal').modal('hide');
            getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/enableBooking.do?', _this.setResponseAfterBlockAndEnable.bind(_this), EXECUTE_WITH_NEW_ERROR);
        }, setResponseAfterBlockAndEnable: function(response) {
            console.log("stringify.response :: ", JSON.stringify(response));
            console.log("response :: ", response);
            if (response.message != undefined) {
                let messageObj = response.message;
                if (messageObj.description != undefined) {
                    showMessage('error', messageObj.description);
				} else {
					showMessage('success', response.message);
					/*if (globalSourceBranchId != null && globalDestinationBranchId != null) {
						setTimeout(function() {
							location.reload();
						}, 2000);
					}*/
					if (globalSourceBranchId != null && globalDestinationBranchId != null) {
						let jsonObject = {
							sourceBranchId: globalSourceBranchId,
							destinationBranchId: globalDestinationBranchId,
							targetDivId: globalDivId
						};
						_this.checkIfBlockDetailsExists(jsonObject); // Ensure this is bound correctly
					} else {
						_this.checkIfBlockDetailsExists(undefined);
					}
				}
            }
        },

        checkIfBlockDetailsExists: function(response) {
            _this = this;

            let jsonObject = {};
            if (response === undefined) {
                jsonObject.sourceBranchId = $('#selectBranch').val();
                jsonObject.destinationBranchId = $('#etaDestBranch').val();
                showLayer();
                getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/checkIfBlockDetailsExists.do?', _this.setResponseForBlock.bind(_this), EXECUTE_WITH_NEW_ERROR);
            } else if (response !== undefined) {
                let jsonObject = {
                    sourceBranchId: response.sourceBranchId,
                    destinationBranchId: response.destinationBranchId,
                    targetDivId: response.targetDivId
                };
                showLayer();
                getJSON(jsonObject, WEB_SERVICE_URL + '/branchActivationWS/checkIfBlockDetailsExists.do?', _this.setResponseForBlock.bind(_this), EXECUTE_WITH_NEW_ERROR);
            }
        },

        setResponseForBlock: function(response) {
            hideLayer();
            /* var sourceBranchId, destinationBranchId;
			if (response.BlockBookingLegDetails !== null) {
				 sourceBranchId = response.BlockBookingLegDetails.sourceBranchId;
				 destinationBranchId = response.BlockBookingLegDetails.destinationBranchId;
				console.log('sourceBranchId ::: ', sourceBranchId);
				console.log('destinationBranchId ::: ', destinationBranchId);
			}*/
		


            var targetDivId = response.targetDivId;
                    			 const matches = targetDivId.match(/blockAndEnableBooking-(\d+)-(\d+)/);
					  if (matches) {
        sourceBranchId = matches[1];
        destinationBranchId = matches[2];
    }
	
            var blockButtonId = 'blockBooking-' + sourceBranchId + '-' + destinationBranchId;

        var enableButtonId = 'enableBooking-' + sourceBranchId + '-' + destinationBranchId;

        var $blockButton = $('#' + blockButtonId);

        var $enableButton = $('#' + enableButtonId);
            if (!targetDivId) {
                $('#blockAndEnableBooking').empty();

                if (response.isBlocked) {
                    var blockBookingLegDetailObj = response.BlockBookingLegDetails;
                    var enableButton = $('<button>', {
                        type: 'button',
                        class: 'btn btn-success mb-2 mb-sm-0',
                        id: 'enableBooking',
                        'data-bs-toggle': 'modal',
                        'data-bs-target': '#enableBookingModal',
                        'data-tooltip': 'Enable Booking',
                        text: 'Enable Booking',
                        value: blockBookingLegDetailObj.blockBookingLegDetailsId
                    });
                    $('#blockAndEnableBooking').append(enableButton);

                    if ($('#blockBooking').length) {
                        $('#blockBooking').addClass('hide');
                    }
                } else {
                    var blockButton = $('<button>', {
                        type: 'button',
                        class: 'btn btn-danger mb-2 mb-sm-0',
                        id: 'blockBooking',
                        'data-bs-toggle': 'modal',
                        'data-bs-target': '#blockBookingModal',
                        'data-tooltip': 'Block Booking',
                        text: 'Block Booking'
                    });
                    $('#blockAndEnableBooking').append(blockButton);

                    if ($('#enableBooking').length) {
                        $('#enableBooking').addClass('hide');
                    }
                }
            } else if (targetDivId) {

				var sourceBranchId;
				var destinationBranchId;
				if(response.BlockBookingLegDetails == null){
					 const matches = targetDivId.match(/blockAndEnableBooking-(\d+)-(\d+)/);
					  if (matches) {
        sourceBranchId = matches[1];
        destinationBranchId = matches[2];
    }
				}
				



				var $targetDiv = $(targetDivId);
					console.log("jaskdajsdajksdkjas", $targetDiv)
if (typeof targetDivId !== 'string' || !targetDivId.startsWith('#')) {
    targetDivId = '#' + targetDivId;
}

var $targetDiv = $(targetDivId.startsWith('#') ? targetDivId : '#' + targetDivId);

/*if ($targetDiv.length === 0) {
    console.warn('Target div not found, creating it now.');
    $('<div>', {
        id: targetDivId.replace('#', ''), // Strip the '#' for ID
        class: 'textAlignLeft'
    }).appendTo('body'); // Append to the appropriate container
} else {
    console.log('Target div found:', $targetDiv);
}*/


				$targetDiv.empty();

				if (response.isBlocked) {

					if (response.BlockBookingLegDetails) {
						if ($enableButton.length) {
							$enableButton.removeClass('hide');
						}

						var blockBookingLegDetailObj = response.BlockBookingLegDetails;
						var enableButton = $('<button>', {
							type: 'button',
							class: 'btn btn-success mb-2 mb-sm-0',
							id: 'enableBooking-' + sourceBranchId + '-' + destinationBranchId,
							'data-bs-toggle': 'modal',
							'data-bs-target': '#enableBookingModal',
							'data-tooltip': 'Enable Booking',
							text: 'Enable Booking',
							value: blockBookingLegDetailObj.blockBookingLegDetailsId
						});

						$targetDiv.append(enableButton);

					}

					var blockButtonId = 'blockBooking-' + sourceBranchId + '-' + destinationBranchId;
					if ($('#' + blockButtonId).length) {
						$('#' + blockButtonId).addClass('hide');
					}
				} else {

					 if ($blockButton.length) {
                $blockButton.removeClass('hide');
            }
                var $targetDiv = $(targetDivId);

                    var blockButton = $('<button>', {
                        type: 'button',
                        class: 'btn btn-danger mb-2 mb-sm-0',
                        id: 'blockBooking-' + sourceBranchId + '-' + destinationBranchId,
                        'data-bs-toggle': 'modal',
                        'data-bs-target': '#blockBookingModal',
                        'data-tooltip': 'Block Booking',
                        text: 'Block Booking'
                    });

                
                    $targetDiv.append(blockButton);


                    var enableButtonId = 'enableBooking-'+ sourceBranchId + '-' + destinationBranchId;
                    if ($('#' + enableButtonId).length) {
                        $('#' + enableButtonId).addClass('hide');
                    }
                }
            }
        }
    };
});

$(document).on('click', '[id^=blockBooking], [id^=enableBooking]', function() {
    var buttonId = $(this).attr('id');
    var currentDivId = $(this).closest('div').attr('id');
    $('#blockReason').val('');
 $('#enableReason').val('');
    // Set globalDivId only if it hasn't been set yet
    if (!globalDivId && currentDivId && currentDivId.startsWith('blockAndEnableBooking-')) {
        globalDivId = currentDivId;
        extractBranchIdsFromDivId(globalDivId);
    } else if (globalDivId && !currentDivId.startsWith('blockAndEnableBooking-')) {
        console.log('Invalid div ID format');
    }
})

function extractBranchIdsFromDivId(divId) {
    const matches = divId.match(/blockAndEnableBooking-(\d+)-(\d+)/);
    if (matches) {
        globalSourceBranchId = matches[1];
        globalDestinationBranchId = matches[2];
    } else {
        console.error("Invalid div ID format");
    }
}
