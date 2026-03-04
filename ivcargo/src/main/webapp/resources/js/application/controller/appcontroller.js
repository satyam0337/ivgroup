//Filename: router.js
define(['backbone','marionette']
,function(Backbone,Marionette) {
	console.log('hetre')
	return Marionette.Object.extend({
		dispatch:function(options){
			console.log(options);
			require(['resources/js/module/view/newdispatch/dispatch.js'],function(Dispatch){
				new Dispatch();
			})
		}
		
	});
});
