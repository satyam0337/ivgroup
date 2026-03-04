define([PROJECT_IVUIRESOURCES+'/resources/js/dummyls/dummylsinit.js'],
		function(DummyInIt){
	'use strict';// this basically give strictness to this specific js
	var 
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(){
			_this = this;
		},render: function() {
			DummyInIt.renderElements();
		}
	});
});