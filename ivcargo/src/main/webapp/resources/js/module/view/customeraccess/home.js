define(['errorshow'
        ,'text!'+PROJECT_IVUIRESOURCES+'/template/groupwisewelcomepage/jtcwelcometemplate.html'
        ],
        function(errorshow,pageTemplate) {
	var 
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			_this = this;
			_this.$el.html(_.template(pageTemplate));
		},
		render: function() {
			setTimeout(function(){hideLayer(),1});
			return _this;
		},onShow:function(){
			$("*[data-loggedIn='Name']").html(localStorage.getItem("currentCorporateAccountName"));
		}
	});
});