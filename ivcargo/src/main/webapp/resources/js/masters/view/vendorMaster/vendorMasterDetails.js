define([
    'slickGridWrapper2',
    'JsonUtility',
    'messageUtility'
], function(slickGridWrapper2) {
    'use strict';
    var jsonObject = new Object(), _this = '';
    
    return Marionette.LayoutView.extend({
        initialize: function() {
            _this = this;
        },
        render: function() {
            getJSON(jsonObject, WEB_SERVICE_URL + '/master/vendorMasterWS/getAllVendorDetailsByAccountGroupId.do?',  _this.setVendorMasterDetails, EXECUTE_WITHOUT_ERROR);
            return _this;
        },     
        setVendorMasterDetails: function(response) {
            if(response.message !== undefined) {
				 hideLayer();
                $('#middle-border-boxshadow').addClass('hide');
                let errorMessage = response.message;
                showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				setTimeout(function() {
					window.close();
				}, 200);
				return;
            }
             
            let loadelement = new Array();
            let baseHtml = new $.Deferred();
            loadelement.push(baseHtml);

            $("#mainContent").load("/ivcargo/html/master/vendorMaster/vendorMasterDetails.html", function() {
                baseHtml.resolve();
            });
            
            $.when.apply($, loadelement).done(function(){
                if(response.CorporateAccount !== undefined) {
                    $("*[data-selector=header]").html('Vendor Master Details');
                    hideAllMessages();
                    slickGridWrapper2.setGrid(response);
                }
                hideLayer();
            });
        }
    });
});