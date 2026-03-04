define(['selectize']
,function(Selectize) {
	return {
		setAutocomplete : function(jsonInObject) {
			var options = {
					elementId : ""
					,valueField : 'id'//primary key of input or value attribute of drop-down
					,labelField : 'title'
					,searchField : 'title'
					,create : false // set to true if user can add new dropdown 
					,maxItems : 1 // set maximum number of items to add specific number of values or set to null to add multiple items user needs
					,items : []//default item selected in dropdown 
					,plugins : ['remove_button','no_results']
					,jsonResultList : {}//default Dropdown values as json object 
					,dataType : 'application/json'
					,url : ""
					,preload : true//initialize on focus or true to initialize on load 
					,urlParametersJsonObject : {}//pass JSON object to add in url at the time calling the url
					,onChange : null
					,responseObjectKey : null
			}

			var jsonOptions = $.extend(options, jsonInObject);

			if(jsonOptions.jsonResultList.length == 1)
				jsonOptions.items = [jsonOptions.jsonResultList[0][jsonOptions.valueField]]

			if($('#' + jsonOptions.elementId)[0].selectize != undefined) {
				var control = $('#' + jsonOptions.elementId)[0].selectize;
				control.clearOptions();
				control.clear();
				
				if(Object.keys(jsonOptions.jsonResultList).length) {
					control.addOption(jsonOptions.jsonResultList)
					control.refreshOptions();
					return;
				} else {
					control.load(function(callback) {
						if(jsonOptions.url.length <= 0){return callback()}
						var Model = Backbone.Model.extend({});
						var model = new Model();
						model.url = jsonOptions.url;

						var jsonInObject = jsonOptions.urlParametersJsonObject;
						
						if (jsonInObject == null)
							jsonInObject	= new Object();

						//jsonInObject.query = query;
						if(typeof(Storage) === "undefined")
							jsonInObject.executiveId	= window.sessionStorage.getItem('currentExecutiveId');
						else
							jsonInObject.executiveId	= window.sessionStorage.currentExecutiveId;

						model.fetch({
							data : jsonInObject,
							success : function(collection, response, options) {
								if (isError(response))
									return callback();

								if(jsonOptions.responseObjectKey != undefined)
									callback(response[jsonOptions.responseObjectKey]);
								else
									callback(response);
							}, error : function(err) {
								showMessage('error', 'Not able to execute process !')
								callback()
							}
						});
					});
					return;
				}
			}
				
			$('#'+jsonOptions.elementId).selectize(
						{
							maxItems : jsonOptions.maxItems,
							valueField : jsonOptions.valueField,
							labelField : jsonOptions.labelField,
							searchField : jsonOptions.searchField,
							plugins:jsonOptions.plugins,
							create : jsonOptions.create,
							options: jsonOptions.jsonResultList,
							items:jsonOptions.items,
							preload:jsonOptions.preload,
							load: function(query, callback) {
								if(jsonOptions.url.length <= 0){return callback()}
								var Model = Backbone.Model.extend({});
								var model = new Model();

								model.url = jsonOptions.url;

								var jsonInObject = jsonOptions.urlParametersJsonObject;
								
								if (jsonInObject == null)
									jsonInObject	= new Object();

								jsonInObject.query = query;
								
								if(typeof(Storage) === "undefined")
									jsonInObject.executiveId	= window.sessionStorage.getItem('currentExecutiveId');
								else
									jsonInObject.executiveId	= window.sessionStorage.currentExecutiveId;

								model.fetch({
									data : jsonInObject,
									success : function(collection, response, options) {
										if (isError(response))
											return callback();

										if(jsonOptions.responseObjectKey != undefined)
											callback(response[jsonOptions.responseObjectKey]);
										else
											callback(response);
									}, error : function(err) {
										showMessage('error', 'Not able to execute process !')
										callback()
									}
								});
							}, onChange : function() {
								if(jsonOptions.onChange != undefined)
									jsonOptions.onChange($("#" + jsonOptions.elementId).val())
								
								$("#" + jsonOptions.elementId + '_wrapper').trigger('click');
								$(jsonOptions.elementId).trigger('change');
								
								if(typeof initialiseFocus != 'undefined')
									initialiseFocus();						
							}
						});
			}
		}
	});