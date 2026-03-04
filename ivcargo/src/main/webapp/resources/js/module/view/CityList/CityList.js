define(['marionette'
	 ,'JsonUtility'
	 ,'messageUtility'
	 ,'/ivcargo/resources/js/generic/urlparameter.js'
	 ,'jquerylingua'
	 ,'language'
	 ],function(Marionette,JsonUtility,MessageUtility,UrlParameter,Lingua,Language){
	 'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	
	
	accountGroupId,
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			_this = this;
			accountGroupId	=	UrlParameter.getModuleNameFromParam('accountGroupId');
			jsonObject.accountGroupId	= accountGroupId;
			
		},render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/CityListWS/getCityDetails.do?', _this.getResponseForView, EXECUTE_WITHOUT_ERROR);
			return _this;
		},getResponseForView:function(response){
			var responseOut = response;
			console.log('responseOut ',responseOut)
		}
	})
});