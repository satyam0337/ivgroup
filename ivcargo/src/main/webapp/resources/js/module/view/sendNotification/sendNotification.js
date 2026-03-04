define([ 'marionette'
	,'JsonUtility'
	,'messageUtility'
	,'/ivcargo/resources/js/generic/urlparameter.js'
	,'jquerylingua'
	,'language'
	,'nodvalidation'
	,'focusnavigation'
	,'autocomplete'
	,'selectizewrapper'
	,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
	],
	function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation,AutoComplete,Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
	wayBillId,
	myNod,
	_this = '',
	redirectFilter = 0;
	var execId='';
	var accountGroupId ='';
	var executiveTypeId ='';
	var languageTypeId =0;
	var serverIdentifier ='';
	var executiveTypeList	    = new Array();
	var accountGroupList	    = new Array();
	var accountGroupListFinal	= new Array();
	var languageTypeList	    = new Array();
	var CUSTOM_NOTIF_IDENTIFIER = 3;
	var	LANGUAGE_TYPE_ENGLISH	= 1; 
	var	LANGUAGE_TYPE_OTHER	    = 2; 
	var notiKey ="key =AAAAuditxFk:APA91bETx93raqLSdS3UmzNx-3jIykQEyVAemvOyKS7QSRgY-Y8wLoXzlwxT1OKmfTaUQigC7xHm1YzU5NwazJjVUI0I8CQbVE1n768gBDFIqGNe46Dn16eI7ZgyR2OLiqr1gVfPCVe_";
	var notiUrl = "https://fcm.googleapis.com/fcm/send";
	var notificationMessageString ='';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//initialize is the first function called on call new view()
			_this = this;
		},
		render: function() {
			var jsonObject	= new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/accountGroupWS/getAllAccountGroupList.do?', _this.setGroup, EXECUTE_WITHOUT_ERROR);
			return _this;
		},
		setGroup : function(response){
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/sendNotification/sendNotification.html",
					function() {
				baseHtml.resolve();

			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				_.keys(response.allAdminsandAllUsersConstant.htData).forEach(function (key) {
					var executiveType			= new Object();
					executiveType.executiveTypeId   = response.allAdminsandAllUsersConstant.htData[key];
					executiveType.executiveTypeName = key;
					executiveTypeList.push(executiveType);
					var executiveType			= new Object();
					executiveType.executiveTypeId   = response.allAdminsandAllUsersConstant.htData[key];
					executiveType.executiveTypeName = key;
					executiveTypeList.push(executiveType);
					var languageTypeeng = new Object();
					languageTypeeng.languageEleId = 1;
					languageTypeeng.languageEleTypeName ='English'
						var languageTypeother = new Object();
					languageTypeother.languageEleId = 2;
					languageTypeother.languageEleTypeName ='Other'
						languageTypeList.push(languageTypeeng);
					languageTypeList.push(languageTypeother);
				});
				var res = Object.values(response) ;

				accountGroupList = res;
				var accountGroup   = new Object();
				accountGroup.accountGroupId =-1
				accountGroup.accountGroupDescription = "ALL GROUPS"
					accountGroupList.push(accountGroup)
					accountGroupListFinal.push(accountGroup)
					_this.addData()

					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	accountGroupListFinal,
						valueField		:	'accountGroupId',
						labelField		:	'accountGroupDescription',
						searchField		:	'accountGroupDescription',
						elementId		:	'accountGroupEle',
						create			: 	false,
						maxItems		: 	1,
						onChange		:   _this.onGroupSelect
					});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	 executiveTypeList,
					valueField		:	'executiveTypeId',
					labelField		:	'executiveTypeName',
					searchField		:	'executiveTypeName',
					elementId		:	'executiveTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:   _this.onExecutiveTypeSelect
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	 languageTypeList,
					valueField		:	'languageEleId',
					labelField		:	'languageEleTypeName',
					searchField		:	'languageEleTypeName',
					elementId		:	'languageTypeEle',
					create			: 	false,
					maxItems		: 	1,
					onChange		:   _this.onLanguageTypeSelect
				});
				$("#sendNotification").click(function() {
					_this.sendNotification();
				});
			});
			hideLayer();
			setTimeout(function() { 
				$('#notificationMessage').val(''); // for firefox
			}, 200);

		},onGroupSelect : function(value){
			accountGroupId = value;
		},
		onExecutiveTypeSelect : function(value){
			executiveTypeId = value;
		},
		onLanguageTypeSelect : function(value){
			languageTypeId = value;
		},
		addData:function()
		{
			if(accountGroupList!= undefined && accountGroupList.length > 0)
			{
				for(var i =0;i<accountGroupList.length;i++)
				{
					accountGroupListFinal.push(accountGroupList[i]);
				}
			}
		},

		validateForm :function(){
			var notiMesString=$('#notificationMessage').val();
			if(accountGroupId ==0){
				showMessage('error','Please Select AccountGroup');
				toogleElement('error','block');
				accountGroupEle.focus();
			}
			else if(executiveTypeId<=0)
			{
				showMessage('error','Please Select Executive Type');
				return;
			}
			else if(notiMesString.length <=0)
			{
				showMessage('error','Please Enter Notification Message');
				return;
			}
			else if(languageTypeId<=0)
			{
				showMessage('error','Please Select Language');
				return;
			}
			if(languageTypeId == LANGUAGE_TYPE_ENGLISH){
				if(notiMesString.length >=450)
				{
					showMessage('error','Notification Message Length Should Not Be Greater Than 450 Characters');
				}else{
					_this.getServerIdFromAccountGroupId();
					_this.sendFinalNotification();
					toogleElement('error','none');
				}
			}

			else{
				_this.getServerIdFromAccountGroupId();
				_this.sendFinalNotification();
				toogleElement('error','none');
			}
		}, 

		sendNotification :  function(){
			_this.validateForm();
		},
		sendFinalNotification : function(){
			var jsonObject = new Object();
			showLayer();
			jsonObject["accountGroupId"] = accountGroupId;
			jsonObject["executiveType"] = executiveTypeId;
			jsonObject["notificationString"] = $("#notificationMessage").val();
			jsonObject["serverIdentifier"] = serverIdentifier;
			jsonObject["languageTypeId"] = languageTypeId;
			getJSON(jsonObject, WEB_SERVICE_URL + "/mobileNotificationWS/sendNotification.do?", _this.afterUpdate, EXECUTE_WITHOUT_ERROR );	
		}, afterUpdate : function(response){
			hideLayer();
			if (!response || jQuery.isEmptyObject(response)) {
				_this.clearTextfieldData();
				showMessage('error', "System error"); // show message to show system processing error massage on top of the window.
				hideLayer();
			} else {
				if(response.Message!=null )
				{
					showMessage('success',response.Message);
					_this.clearTextfieldData();
				}
				else
				{
					if(languageTypeId == LANGUAGE_TYPE_ENGLISH){
						showMessage('success', response.message.description)
					}
					else{
						if(response.mobileNotificationsList!=undefined){
							for(var i =0;i<response.mobileNotificationsList.length;i++){
								var token = response.mobileNotificationsList[i].tokenForNotification;
								if(token!=undefined && token.length > 0){
									_this.sendOtherLanguageNotification(token);
								}
							}
							_this.clearTextfieldData();
							showMessage('success', 'Notification Send Sucessfully!')
						}else{
							_this.clearTextfieldData();
							showMessage('success', 'Something Went Wrong!')
						}
					}
				}
			} 
		},
		getServerIdFromAccountGroupId :function()
		{
			if(accountGroupId > 0 )
			{
				if(accountGroupList!= undefined && accountGroupList.length > 0)
				{
					for(var i =0;i<accountGroupList.length;i++)
					{
						if(accountGroupId == accountGroupList[i].accountGroupId)
						{
							serverIdentifier = accountGroupList[i].accountGroupServerIdentifier;
						}
					}
				}
			}
		},

		clearTextfieldData:function(){
			$('#notificationMessage').val('');
			var selectize = $("#accountGroupEle")[0].selectize;
			selectize.clear();
			var selectize = $("#executiveTypeEle")[0].selectize;
			selectize.clear();
			var $inputs = $(':input');
			$inputs.each(function(index) {
				$(this).val('');
			});
		},
		sendOtherLanguageNotification:function(token){
			var accountGroupSelectize 		= $('#accountGroupEle').get(0).selectize;
			var currentAccountGroup 		= accountGroupSelectize.getValue(); 
			var accountGroupOption 			= accountGroupSelectize.options[ currentAccountGroup ];
			var groupName					= accountGroupOption.accountGroupDescription;
			var message   = 	$("#notificationMessage").val();
			var finalNotificationString  = groupName+ "    "+'\n'+message;
			var settings = {
					"url": notiUrl,
					"method": "POST",
					"timeout": 0,
					"headers": {
						"Content-Type": "application/json",
						"Authorization": notiKey
					},
					"data": JSON.stringify({"to":token,"notification":{"sound":"default","body":finalNotificationString,"title":"IVCargo","content_available":true,"priority":"high"},"data":{"sound":"default","body":"test body","title":"test title","content_available":true,"priority":"high"}}),
			};

			$.ajax(settings).done(function (response) {
				console.log(response);
			});
		},
	});
});



