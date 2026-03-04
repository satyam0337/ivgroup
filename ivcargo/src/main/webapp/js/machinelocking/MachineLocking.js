
var unreg		= 1;
var difper		= 2;
var option		= 3;
var list		= 4;
var	again		= 1;

var url	= "";

var isFirefox = new Boolean();
var isChrome = new Boolean();

//Sort HTML Select by Text
function sortDropDownListByText(selectId, filter) {

	if (filter == true) {
		var foption = $('#'+ selectId + ' option:first');
		var soptions = $('#'+ selectId + ' option:not(:first)').sort(function(a, b) {
			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
		});
		$('#' + selectId).html(soptions).prepend(foption);
	} else if (filter == false) {
		var soptions = $('#'+ selectId + ' option').sort(function(a, b) {
			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1;
		});
		$('#' + selectId).html(soptions);
	}
}

//Hide Error
function reseterror() {
	$("#basicError").attr("hidden", "");
}

//Iterate JSON Object And Create UL LI or Select Option
function iterateJson(jsonObject,Id,task,url) {
	for (var key in jsonObject) {
		if (jsonObject.hasOwnProperty(key)) {
			if (task == option) {
				createOption(Id,key,jsonObject[key]);
			} else if (task == list) {
				createList(Id,key,jsonObject[key],url);
			}
		}
	}
}

//Iterate JSON Object And Remove Select Option
function iterateJsonForRemove(jsonObject,Id) {
	for (var key in jsonObject) {
		removeOption(Id,key);
	}
}

//Get HTML Select length
function getHtmlSelectLength(Id) {
	return $('#'+Id+' option').length;
}

//Get HTML Select defined options length
function getHtmlSelectOptionValue(Id,index) {
	return $('#'+Id+' option:eq('+index+')').val();
}

//Create UL LI tag In HTML
function createList(parentId,executiveId,value,url) {

	var newItem;

	if (url == '#') {
		newItem = $("<li />", {
			id		: executiveId
		});
	} else {
		newItem = $("<li />", {
			id		: executiveId,
			style	: "text-decoration: underline;",
			onclick	: 'showOverlay(this);',
			tag		: parentId,
			//class	: "tooltip",
			title	: "Click on name to change user permission"
		});
	}

	newItem.html(value);
	$('#'+parentId).append(newItem);
}

//show overLay when click on link
function showOverlay(parentid) {

	var name			= $(parentid).html();
	var executiveid		= $(parentid).attr('id');
	var executiveType	= $(parentid).attr('tag');

	if (name == 'IV Admin') {
		alert('You Can not change IV Admin permission');
		return false;
	}

	if (executiveType == 'registeredlist') {

		$('#executivePermission').html('Register');
		disableradio('regexecutive', 'unregisterexecutive', 'everyWhere', 'reRegisterPer', 'allowanotherbr');

	} else if (executiveType == 'unregisteredlist') {

		$('#executivePermission').html('Unregister');
		disableradio('unregisterexecutive', 'regexecutive', 'everyWhere', 'reRegisterPer', 'allowanotherbr');

	} else if (executiveType == 'everywherelist') {

		$('#executivePermission').html('Every Where Login');
		disableradio('everyWhere', 'regexecutive', 'unregisterexecutive', 'reRegisterPer', 'allowanotherbr');

	} else if (executiveType == 'reregisterlist') {

		$('#executivePermission').html('Re Register PC');
		disableradio('reRegisterPer', 'regexecutive', 'unregisterexecutive', 'everyWhere', 'allowanotherbr');

	} else if (executiveType == 'anotherbranchlist') {

		$('#executivePermission').html('Login Another Branch');
		disableradio('', 'regexecutive', 'unregisterexecutive', 'everyWhere', 'reRegisterPer');

	} else {
		alert('Not Proper Selection');
	}

	toggleOverlay();

	$('#executiveName').html(name);
	$('#executiveId').html(executiveid);

}

//disabled radio on pop up according to executive login type
function disableradio(radioid1, radioid2, radioid3, radioid4, radioid5) {
	jQuery('#'+radioid1).attr('disabled', 'disabled');
	jQuery('#'+radioid2).removeAttr('disabled');
	jQuery('#'+radioid3).removeAttr('disabled');
	jQuery('#'+radioid4).removeAttr('disabled');
	jQuery('#'+radioid5).removeAttr('disabled');
}

function hideOverlay() {

	$('#executiveName').html('');
	$('#executiveId').html('');

	hideBranches();
	toggleOverlay();
	removeOption('anobranchId',null);
	removeOption('selectedBranches',null);

	$("input:radio").attr("checked", false);

	again = 1;

}

//toggle overLay when click on link
function toggleOverlay() {
	var overlay = document.getElementById('ExecutiveOverlay');
	var specialBox = document.getElementById('ExecutiveDialog');
	overlay.style.opacity = .8;
	if(overlay.style.display == "block"){
		overlay.style.display = "none";
		specialBox.style.display = "none";
	} else {
		overlay.style.display = "block";
		specialBox.style.display = "block";
	}
}

//Iterate UL list to check executive if matches remove it and if equals to 1 set No Executives
function iterateListforRemove(Id, executiveName) {
	var i = 0;
	var j = 0;

	$('#'+Id+' li').each(function(n,v) {
		i++;
		if($(this).text() == executiveName) {
			j++;
			$(this).remove();
		}
	});

	if (i == 1 && j == 1) {
		createList(Id,0,"No Executives",'#');
	}
}

//Iterate HTML Select Options to check if matches remove it
function iterateSelectforRemove(Id, executiveId) {
	$('#' +Id+' option').each(function(n,v) {
		if($(this).val() == executiveId) {
			$(this).remove();
		}
	});
}

//Iterate HTML Select Options to remove branch and add to another HTML Select
function iterateSelectforUpdate(addId,removeId) {
	$('#' +removeId+' option').each(function(n,v) {
		if($(this).val() != 1 && $(this).val() != 0) {
			createOption(addId,$(this).val(),$(this).text());
			$(this).remove();
		}
	});
}

//Common JSON Object Iteration With Check
function commonIterate(jsonObject,Id,task,url) {
	
	if (!jQuery.isEmptyObject(jsonObject)) {
		if (task == option) {
			iterateJson(jsonObject,Id,option,url);
		} else if (task == list) {
			iterateJson(jsonObject,Id,list,url);
		}
	} else {
		if (task == list) {
			createList(Id,0,"No Executives",'#');
		}
	}
}

//Show error
function showError(id,error) {
	document.getElementById(id).removeAttribute("hidden");
	document.getElementById(id).innerHTML = error;
}

//Clear All HTML Select and UL Tags
function clearAll(clear) {

	removeOption('regbranches',null);
	removeOption('unregbranches',null);

	createOption("regbranches",0,'--- Select Branch ---');
	createOption("unregbranches",0,'--- Select Branch ---');

	removeOption('regpc',null);
	removeOption('unregpc',null);

	createOption("regpc",0,'--- Select Machine ---');
	createOption("unregpc",0,'--- Select Machine ---');

	removeOption('reregpc',null);

	createOption("reregpc",0,'--- Select Machine ---');

	$('#registeredlist li').remove();
	$('#unregisteredlist li').remove();
	$('#everywherelist li').remove();
	$('#reregisterlist li').remove();
	$('#anotherbranchlist li').remove();

	if (clear) {
		createList('registeredlist',	0,	"No Executives",	'#');
		createList('unregisteredlist',	0,	"No Executives",	'#');
		createList('everywherelist',	0,	"No Executives",	'#');
		createList('reregisterlist',	0,	"No Executives",	'#');
		createList('anotherbranchlist',	0,	"No Executives",	'#');
	}

}

//Get Data According to Executive Type and Display In HTML Select
function populateDataAdminWise(pagename) {

	var jsonObject						= new Object();
	var jsonObjectGroupRegions			= new Object();
	var jsonObjectSubRegionForRegion	= new Object();
	var jsonObjectBranch				= new Object();

	jsonObject.filter		= 3;
	jsonObject.pageName		= pagename;

	var jsonStr = JSON.stringify(jsonObject); // Converting JSON into String

	$.getJSON("MachineLocking.do?pageId=297&eventId=7",
			{json:jsonStr}, function(data) {

				if (data.error) {
					showError("basicError",data.error);
					return false;
				}

				jsonObjectGroupRegions			= data.groupRegions;
				jsonObjectSubRegionForRegion	= data.subRegionForRegion;
				jsonObjectBranch				= data.branch;

				if (!jQuery.isEmptyObject(jsonObjectGroupRegions)) {

					iterateJson(jsonObjectGroupRegions, "region", option);
					sortDropDownListByText("region", true);

					$("#everyWhere").removeAttr("hidden");
					$("#everyWherelable").removeAttr("hidden");

				} else if (!jQuery.isEmptyObject(jsonObjectSubRegionForRegion)) {

					$("#regiondiv").attr("hidden","");

					iterateJson(jsonObjectGroupRegions, "subRegion", option);
					sortDropDownListByText("subRegion", true);

				} else if (!jQuery.isEmptyObject(jsonObjectBranch)) {

					$("#regiondiv").attr("hidden","");
					$("#subRegiondiv").attr("hidden","");

					iterateJson(jsonObjectGroupRegions, "searchBranch", option);
					sortDropDownListByText("searchBranch", true);

				} else {

					$("#regiondiv").attr("hidden","");
					$("#subRegiondiv").attr("hidden","");
					$("#searchBranchdiv").attr("hidden", "");

					if (pagename == 'MachineLockingMachinePermissionMaster') {
						pcRegisterConfigMaster(data.pc);
					} else if (pagename == 'MachineLockingRegisterAgainMaster') {
						pcReregisterConfigMaster(data.pc);
					} else if (pagename == 'MachineLockingExecutiveMaster') {
						pcRegisterExecutiveConfigMaster(data.executive);
					}
				}
			});

	return false;
}

//Display Registered / Unregistered Machine on Page Load For Registration
function pcRegisterConfigMaster(data) {

	var jsonObjectRegister		= new Object();
	var jsonObjectUnregister	= new Object();

	if (!jQuery.isEmptyObject(data)) {

		jsonObjectRegister		= data.register;
		jsonObjectUnregister	= data.unregister;

		commonIterate(jsonObjectRegister, "#regpc", option, url);

		commonIterate(jsonObjectUnregister, "#unregpc", option, url);

		sortDropDownListByText("regpc", true);
		sortDropDownListByText("unregpc", true);
	}
}

//Display Registered / Unregistered Machine on Page Load for Re Registration
function pcReregisterConfigMaster(data) {

	var jsonObjectRegister		= new Object();
	var jsonObjectUnregister	= new Object();

	if (!jQuery.isEmptyObject(data)) {

		jsonObjectRegister		= data.register;
		jsonObjectUnregister	= data.unregister;

		commonIterate(jsonObjectRegister, "#reregpc", option, url);

		commonIterate(jsonObjectUnregister, "#reregpc", option, url);

		sortDropDownListByText("reregpc", true);
	}
}

//Display Different Executives on Page Load
function pcRegisterExecutiveConfigMaster(data) {

	var jsonObjectRegister			= new Object();
	var jsonObjectUnregister		= new Object();
	var jsonObjectEveryWhere		= new Object();
	var jsonObjectReRegister		= new Object();
	var jsonObjectAnotherBranch		= new Object();

	if (!jQuery.isEmptyObject(data)) {

		jsonObjectRegister			= data.register;
		jsonObjectUnregister		= data.unregister;
		jsonObjectEveryWhere		= data.everywhere;
		jsonObjectReRegister		= data.reregister;
		jsonObjectAnotherBranch		= data.anobranch;

		clearAll(false);

		// Permission  list
		commonIterate(jsonObjectRegister,"registeredlist", list, url);
		commonIterate(jsonObjectUnregister,"unregisteredlist", list, url);
		commonIterate(jsonObjectEveryWhere,"everywherelist", list, url);
		commonIterate(jsonObjectReRegister,"reregisterlist", list, url);
		commonIterate(jsonObjectAnotherBranch,"anotherbranchlist", list, url);

	}
}

//get Sub Regions From Regions
function populateSubRegions(obj,id){

	clearAll(true);

	document.getElementById('searchBranch').options.length=1;;
	document.getElementById('searchBranch').options[0].text ='------Select Branch  ----';
	document.getElementById('searchBranch').options[0].value=0;

	document.getElementById('subRegion').options.length=1;;
	document.getElementById('subRegion').options[0].text ='------Select Sub Region  ----';
	document.getElementById('subRegion').options[0].value=0;

	populateSubRegionsByRegionId(obj.value,id,false,false);
}

//get Branches for Group
function populateBranches(obj,id){

	clearAll(true);

	document.getElementById('searchBranch').options.length=1;;
	document.getElementById('searchBranch').options[0].text ='------Select Branch  ----';
	document.getElementById('searchBranch').options[0].value=0;

	populatePhysicalBranchesOnlyBySubRegionId(obj.value,id,false,false);
}

//Executive Register
//JSON
function populateExecutives(branchId) {

	var jsonObject					= new Object();
	var jsonObjectRegister			= new Object();
	var jsonObjectUnregister		= new Object();
	var jsonObjectEveryWhere		= new Object();
	var jsonObjectReRegister		= new Object();
	var jsonObjectAnotherBranch		= new Object();

	jsonObject.branchId		= branchId;
	jsonObject.filter		= 1;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("MachineLocking.do?pageId=297&eventId=7", 
			{json:jsonStr}, function(data) {

				if (data.error) {
					showError("basicError",data.error);
					return false;
				}

				jsonObjectRegister			= data.register;
				jsonObjectUnregister		= data.unregister;
				jsonObjectEveryWhere		= data.everywhere;
				jsonObjectReRegister		= data.reregister;
				jsonObjectAnotherBranch		= data.anobranch;

				clearAll(false);

				// Permission  list
				commonIterate(jsonObjectRegister,"registeredlist", list, url);
				commonIterate(jsonObjectUnregister,"unregisteredlist", list, url);
				commonIterate(jsonObjectEveryWhere,"everywherelist", list, url);
				commonIterate(jsonObjectReRegister,"reregisterlist", list, url);
				commonIterate(jsonObjectAnotherBranch,"anotherbranchlist", list, url);

			});

	return false;
}

//get branches for login another branch permission
function showBranchestoSelect() {

	$("#anotherbranchConboBoxes").removeAttr("hidden");

	if (again == 1) {

		removeOption('anobranchId',null);
		removeOption('selectedBranches',null);

		var jsonObject						= new Object();
		var jsonObjectRegister				= new Object();
		var jsonObjectUnregister			= new Object();
		var jsonObjectExecutiveanobranches	= new Object();

		jsonObject.executiveId		= $('#executiveId').html();
		jsonObject.filter			= 21;

		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("MachineLocking.do?pageId=297&eventId=7",
				{json:jsonStr}, function(data) {

					if (data.error) {
						showError("basicError",data.error);
						return false;
					}

					jsonObjectRegister				= data.register;
					jsonObjectUnregister			= data.unregister;
					jsonObjectExecutiveanobranches	= data.executiveanobranches;

					if (!jQuery.isEmptyObject(jsonObjectRegister)) {
						iterateJson(jsonObjectRegister, "anobranchId", option, '#');
					}

					if (!jQuery.isEmptyObject(jsonObjectUnregister)) {
						iterateJson(jsonObjectUnregister, "anobranchId", option, '#');
					}

					if (!jQuery.isEmptyObject(jsonObjectExecutiveanobranches)) {
						iterateJson(jsonObjectExecutiveanobranches, "selectedBranches", option, '#');
						iterateJsonForRemove(jsonObjectExecutiveanobranches,'anobranchId');
					}

					sortDropDownListByText('anobranchId', false);
					sortDropDownListByText('selectedBranches', false);

				});

		again = 2;
		return false;
	} else {
		return false;
	}
}

//hide HTML Select for login Another Branch
function hideBranches() {
	$("#anotherbranchConboBoxes").attr("hidden", "");
}

//Changes HTML Select branch from unalloted to alloted
function changevalueanobr() {

	var executiveId;
	var executiveName;

	executiveId			= $('#anobranchId').val();
	executiveName		= $('#anobranchId :selected').text();

	createOption("selectedBranches",executiveId,executiveName);
	removeOption('anobranchId',executiveId);

	sortDropDownListByText('anobranchId', false);
	sortDropDownListByText('selectedBranches', false);

}

//Changes HTML Select branch from alloted to unalloted
function changevalueselected() {

	var executiveId;
	var executiveName;

	executiveId			= $('#selectedBranches').val();
	executiveName		= $('#selectedBranches :selected').text();

	createOption("anobranchId",executiveId,executiveName);
	removeOption('selectedBranches',executiveId);

	sortDropDownListByText('anobranchId', false);
	sortDropDownListByText('selectedBranches', false);

}

//Allow permission To user in overlay and change into display list
function allowpermission() {

	var jsonObject			= new Object();
	var executiveId;
	var branchId;
	var anotherBranches		= '';

	if (validateexecutive() == true) {

		var answer = confirm("Change Executive Permission ?");

		if (answer == true) {

			var radiobuttonvalue = $('input:radio[name=executivePermission]:checked').val();

			executiveId			= $('#executiveId').html();
			executiveName		= $('#executiveName').html();
			branchId			= $('#searchBranch').val();

			$('#selectedBranches option').each(function() {
				anotherBranches = ($(this).val()) + ',' + anotherBranches;
			});

			if (radiobuttonvalue == 'Unregister') {
				jsonObject.filter				= 13;
			} else if (radiobuttonvalue == 'Register') {
				jsonObject.filter				= 14;
			} else if (radiobuttonvalue == 'AnotherBranch') {
				jsonObject.filter				= 15;
			} else if (radiobuttonvalue == 'ReRegister') {
				jsonObject.filter				= 17;
			} else if (radiobuttonvalue == 'EveryWhere') {
				jsonObject.filter				= 16;
			} else {
				alert('Not Proper Selection');
			}

			jsonObject.branchId				= branchId;
			jsonObject.executiveId			= executiveId;
			jsonObject.anotherBranches		= anotherBranches;

			var jsonStr = JSON.stringify(jsonObject);

			$.getJSON("MachineLocking.do?pageId=297&eventId=7",
					{json:jsonStr}, function(data) {

						if (data.error) {
							showError("basicError",data.error);
							return false;
						}

						if (radiobuttonvalue == 'Unregister') {
							adjustlist('unregisteredlist','registeredlist','everywherelist'
									,'anotherbranchlist','reregisterlist', executiveId,  executiveName);
						} else if (radiobuttonvalue == 'Register') {
							adjustlist('registeredlist','unregisteredlist','everywherelist'
									,'anotherbranchlist','reregisterlist', executiveId,  executiveName);
						} else if (radiobuttonvalue == 'AnotherBranch') {
							adjustlist('anotherbranchlist','unregisteredlist','everywherelist'
									,'registeredlist','reregisterlist', executiveId,  executiveName);
						} else if (radiobuttonvalue == 'ReRegister') {
							adjustlist('reregisterlist','unregisteredlist','everywherelist'
									,'registeredlist','anotherbranchlist', executiveId,  executiveName);
						} else if (radiobuttonvalue == 'EveryWhere') {
							adjustlist('everywherelist','unregisteredlist','registeredlist'
									,'anotherbranchlist','reregisterlist', executiveId,  executiveName);
						}

						$("#result").removeAttr("hidden");
						$("#result").html(data.result +' to Executive '+executiveName);
						$("#basicError").attr("hidden","");

					});

			hideOverlay();
			return false;

		}
	}
}

//validate radio button is checked or not
function validateexecutive() {

	var radiobuttonvalue = $('input:radio[name=executivePermission]:checked').val();

	if(radiobuttonvalue == undefined)
	{
		alert('Please Select Permission');
		return false;
	} else {
		return true;
	}
}

//adjust list when permission in changed
function adjustlist(appendlist, removelist1, removelist2,
		removelist3, removelist4, executiveId, executiveName) {

	iterateListforRemove(appendlist, executiveName);

	createList(appendlist,executiveId,executiveName,url);

	iterateListforRemove(appendlist, 'No Executives');

	iterateListforRemove(removelist1, executiveName);
	iterateListforRemove(removelist2, executiveName);
	iterateListforRemove(removelist3, executiveName);
	iterateListforRemove(removelist4, executiveName);

}

//Register Machine
//JSON
function populateRegPC(branchId) {

	var jsonObject				= new Object();
	var jsonObjectRegister		= new Object();
	var jsonObjectUnregister	= new Object();

	jsonObject.branchId		= branchId;
	jsonObject.filter		= 2;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("MachineLocking.do?pageId=297&eventId=7",
			{json:jsonStr}, function(data) {

				if (data.error) {
					showError("basicError",data.error);
					return false;
				}

				jsonObjectRegister		= data.register;
				jsonObjectUnregister	= data.unregister;

				clearAll();

				if (!jQuery.isEmptyObject(jsonObjectRegister)) {
					iterateJson(jsonObjectRegister, "regpc", option);
				}

				if (!jQuery.isEmptyObject(jsonObjectUnregister)) {
					iterateJson(jsonObjectUnregister, "unregpc", option);
				}

				sortDropDownListByText("regpc", true);
				sortDropDownListByText("unregpc", true);

			});

	return false;
}

//unregister Seleted Machine
function unregpcs() {

	var jsonObject				= new Object();
	var machinelockingId;
	var machinelockingName;
	var branchId;

	if (validateElementpc(1)) {

		var answer = confirm("Unregistered Machine ?");

		if (answer == true) {

			machinelockingId		= $('#regpc').val();
			machinelockingName		= $('#regpc :selected').text();
			branchId				= $('#searchBranch').val();

			jsonObject.filter			= 11;
			jsonObject.branchId			= branchId;
			jsonObject.machinelockingId		= machinelockingId;

			var jsonStr = JSON.stringify(jsonObject);

			$.getJSON("MachineLocking.do?pageId=297&eventId=7",
					{json:jsonStr}, function(data) {

						if (data.error) {
							showError("basicError",data.error);
							return false;
						}

						createOption("unregpc",machinelockingId,machinelockingName);
						removeOption('regpc',machinelockingId);

						$("#result").removeAttr("hidden");
						$("#result").html(data.result +' '+machinelockingName);
						$("#basicError").attr("hidden","");

						sortDropDownListByText('regpc', true);
						sortDropDownListByText('unregpc', true);

					});

			return false;
		} else {
			return false;
		}
	}
}

//register Seleted Machine
function regpcs() {

	var jsonObject				= new Object();
	var machinelockingId;
	var machinelockingName;
	var branchId;

	if (validateElementpc(2)) {

		var answer = confirm("Registered Machine ?");

		if (answer == true) {

			machinelockingId		= $('#unregpc').val();
			machinelockingName		= $('#unregpc :selected').text();
			branchId				= $('#searchBranch').val();

			jsonObject.filter			= 12;
			jsonObject.branchId			= branchId;
			jsonObject.machinelockingId		= machinelockingId;

			var jsonStr = JSON.stringify(jsonObject);

			$.getJSON("MachineLocking.do?pageId=297&eventId=7",
					{json:jsonStr}, function(data) {

						if (data.error) {
							showError("basicError",data.error);
							return false;
						}

						createOption("regpc",machinelockingId,machinelockingName);
						removeOption('unregpc',machinelockingId);

						$("#result").removeAttr("hidden");
						$("#result").html(data.result +' '+machinelockingName);
						$("#basicError").attr("hidden","");

						sortDropDownListByText('regpc', true);
						sortDropDownListByText('unregpc', true);

					});

			return false;
		} else {
			return false;
		}
	}
}

//validate Machine
function validateElementpc(val) {

	if (val == 1) {
		if (document.getElementById('regpc').value == 0) {
			document.getElementById("basicError").removeAttribute("hidden");
			document.getElementById("basicError").innerHTML = 'Please Select Machine!';
			$("#regpc").focus();
			return false;
		}
	}

	if (val == 2) {
		if (document.getElementById('unregpc').value == 0) {
			document.getElementById("basicError").removeAttribute("hidden");
			document.getElementById("basicError").innerHTML = 'Please Select Machine!';
			$("#unregpc").focus();
			return false;
		}
	}

	return true;
}

//Re Register Machine
//JSON
function populateReRegPC(branchId) {

	var jsonObject				= new Object();
	var jsonObjectRegister		= new Object();
	var jsonObjectUnregister	= new Object();

	jsonObject.branchId		= branchId;
	jsonObject.filter		= 2;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("MachineLocking.do?pageId=297&eventId=7", 
			{json:jsonStr}, function(data) {

				if (data.error) {
					showError("basicError",data.error);
					return false;
				}

				jsonObjectRegister		= data.register;
				jsonObjectUnregister	= data.unregister;

				clearAll();

				if (!jQuery.isEmptyObject(jsonObjectRegister)) {
					iterateJson(jsonObjectRegister, "reregpc", option);
				}

				if (!jQuery.isEmptyObject(jsonObjectUnregister)) {
					iterateJson(jsonObjectUnregister, "reregpc", option);
				}

				sortDropDownListByText("reregpc", true);

			});

	return false;
}

//Re register pc permission
function reregpcs() {

	var jsonObject				= new Object();
	var machinelockingId;
	var machinelockingName;
	var branchId;

	if (validateElementrepc()) {

		var answer = confirm("Allow Permission to Reregistered Machine ?");

		if (answer == true) {
			machinelockingId		= $('#reregpc').val();
			machinelockingName		= $('#reregpc :selected').text();
			branchId				= $('#searchBranch').val();

			jsonObject.filter			= 10;
			jsonObject.branchId			= branchId;
			jsonObject.machinelockingId		= machinelockingId;

			var jsonStr = JSON.stringify(jsonObject);

			$.getJSON("MachineLocking.do?pageId=297&eventId=7",
					{json:jsonStr}, function(data) {

						if (data.error) {
							showError("basicError",data.error);
							return false;
						}

						$("#result").removeAttr("hidden");
						$("#result").html(data.result +' '+machinelockingName);
						$("#basicError").attr("hidden","");

						sortDropDownListByText('reregpc', true);

					});

			return false;
		} else {
			return false;
		}
	}
}

//valodate re registered pc HTML Selrct
function validateElementrepc() {

	if (document.getElementById('reregpc').value == 0) {
		document.getElementById("basicError").removeAttribute("hidden");
		document.getElementById("basicError").innerHTML = 'Please Select Machine!';
		$("#reregpc").focus();
		return false;
	}

	return true;
}

//Config Branch
//JSON
function populateBranchesForConfig() {

	var jsonObject				= new Object();
	var jsonObjectRegister		= new Object();
	var jsonObjectUnregister	= new Object();

	jsonObject.filter		= 4;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("MachineLocking.do?pageId=297&eventId=7",
			{json:jsonStr}, function(data) {

				if (data.error) {
					showError("basicError",data.error);
					return false;
				}

				jsonObjectRegister		= data.register;
				jsonObjectUnregister	= data.unregister;

				clearAll();

				if (!jQuery.isEmptyObject(jsonObjectRegister)) {
					iterateJson(jsonObjectRegister, "regbranches", option);
				}

				if (!jQuery.isEmptyObject(jsonObjectUnregister)) {
					iterateJson(jsonObjectUnregister, "unregbranches", option);
				}

				$("#result").attr("hidden", "");

				sortDropDownListByText('regbranches', true);
				sortDropDownListByText('unregbranches', true);

				if (!jQuery.isEmptyObject(jsonObjectRegister)) {
					createSecondOptions('regbranches',1,'All');
				}

				if (!jQuery.isEmptyObject(jsonObjectUnregister)) {
					createSecondOptions('unregbranches',1,'All');
				}

			});

	return false;
}

//unregister Selected Branch
function unregbr() {

	var jsonObject				= new Object();
	var id;
	var name;

	if (validateElementbr(1)) {

		var answer = confirm("Unregistered Branch ?");

		if (answer == true) {

			id		= $('#regbranches').val();
			name	= $('#regbranches :selected').text();

			if (id != 1) {
				jsonObject.filter		= 8;
				jsonObject.branchId		= id;
			} else {
				jsonObject.filter		= 22;
			}

			var jsonStr = JSON.stringify(jsonObject);

			$.getJSON("MachineLocking.do?pageId=297&eventId=7",
					{json:jsonStr}, function(data) {

						if (data.error) {
							showError("basicError",data.error);
							return false;
						}

						if (id != 1) {
							createOption("unregbranches",id,name);
							removeOption('regbranches',id);
						} else {
							iterateSelectforUpdate('unregbranches','regbranches');
						}

						removeOption('regbranches',1);
						removeOption('unregbranches',1);

						$("#result").removeAttr("hidden");
						$("#result").html(name + ' ' + data.result);
						$("#basicError").attr("hidden","");

						sortDropDownListByText('regbranches', true);
						sortDropDownListByText('unregbranches', true);

						if (getHtmlSelectOptionValue('unregbranches',1) != 1) {
							createSecondOptions('unregbranches',1,'All');
						}

						if(getHtmlSelectLength('regbranches') > 1 && getHtmlSelectOptionValue('regbranches',1) != 1) {
							createSecondOptions('regbranches',1,'All');
						}

						if(getHtmlSelectLength('unregbranches') < 3 && getHtmlSelectOptionValue('regbranches',1) == 1) {
							removeOption('unregbranches',id);
						}
					});
			return false;
		} else {
			return false;
		}
	}
}

//register Selected Branch
function regbr() {

	var jsonObject				= new Object();
	var id;
	var name;

	if (validateElementbr(2)) {

		var answer = confirm("Registered Branch ?");

		if (answer == true) {
			id		= $('#unregbranches').val();
			name	= $('#unregbranches :selected').text();

			if (id != 1) {
				jsonObject.filter		= 9;
				jsonObject.branchId		= id;
			} else {
				jsonObject.filter		= 23;
			}

			var jsonStr = JSON.stringify(jsonObject);

			$.getJSON("MachineLocking.do?pageId=297&eventId=7",
					{json:jsonStr}, function(data) {

						if (data.error) {
							showError("basicError",data.error);
							return false;
						}

						if (id != 1) {
							createOption("regbranches",id,name);
							removeOption('unregbranches',id);
						} else {
							iterateSelectforUpdate('regbranches','unregbranches');
						}

						removeOption('unregbranches',1);
						removeOption('regbranches',1);

						$("#result").removeAttr("hidden");
						$("#result").html(name + ' ' + data.result);
						$("#basicError").attr("hidden","");

						sortDropDownListByText('regbranches', true);
						sortDropDownListByText('unregbranches', true);

						if (getHtmlSelectOptionValue('regbranches',1) != 1) {
							createSecondOptions('regbranches',1,'All');
						}

						if(getHtmlSelectLength('unregbranches') > 1 && getHtmlSelectOptionValue('unregbranches',1) != 1) {
							createSecondOptions('unregbranches',1,'All');
						}

						if(getHtmlSelectLength('regbranches') < 3 && getHtmlSelectOptionValue('unregbranches',1) == 1) {
							removeOption('unregbranches',id);
						}
					});
			return false;
		} else {
			return false;
		}
	}
}

//validate Branches HTML select
function validateElementbr(val) {

	if (val == 1) {
		if (document.getElementById('regbranches').value == 0) {
			document.getElementById("basicError").removeAttribute("hidden");
			document.getElementById("basicError").innerHTML = 'Please Select Branch!';
			$("#regbranches").focus();
			return false;
		}
	}

	if (val == 2) {
		if (document.getElementById('unregbranches').value == 0) {
			document.getElementById("basicError").removeAttribute("hidden");
			document.getElementById("basicError").innerHTML = 'Please Select Branch!';
			$("#unregbranches").focus();
			return false;
		}
	}

	return true;
}

//Group Master
//check group is register or not
function checkGroup() {
	var jsonObject				= new Object();

	jsonObject.filter		= 5;

	var jsonStr = JSON.stringify(jsonObject);

	$.getJSON("MachineLocking.do?pageId=297&eventId=7",
			{json:jsonStr}, function(data) {

				if (data.error) {
					showError("basicError",data.error);
					return false;
				}

				/*if (!jQuery.isEmptyObject(data)) {
					groupButtons(data);
					$("#result").attr("hidden", "");
				}*/
			});

	return false;
}

//register group
function regrGroup() {

	var jsonObject		= new Object();

	var answer = confirm("Register Group ?");

	if (answer == true) {

		jsonObject.filter		= 6;

		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("MachineLocking.do?pageId=297&eventId=7",
				{json:jsonStr}, function(data) {

					if (data.error) {
						showError("basicError",data.error);
						return false;
					}

					if (!jQuery.isEmptyObject(data)) {

						groupButtons(data);

						$("#result").removeAttr("hidden");
						$("#basicError").attr("hidden","");

					}
				});

		return false;

	} else {
		return false;
	}
}

//unregister group
function unregrGroup() {

	var jsonObject		= new Object();

	var answer = confirm("UnRegister Group ?");

	if (answer == true) {
		jsonObject.filter		= 7;

		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("MachineLocking.do?pageId=297&eventId=7",
				{json:jsonStr}, function(data) {

					if (data.error) {
						showError("basicError",data.error);
						return false;
					}

					if (!jQuery.isEmptyObject(data)) {

						groupButtons(data);

						$("#result").removeAttr("hidden");
						$("#basicError").attr("hidden","");

					}
				});

		return false;
	} else {
		return false;
	}
}

//check group that which button has to be shown
function groupButtons(data) {
	if (data.show == 'unreg') {

		$("#unregisterGroup").attr("disabled",true);
		$("#registerGroup").attr("disabled",false);

		$("#unregisterGroup").attr("class","btn_norm_disabled tooltip");
		$("#registerGroup").attr("class","btn-lg btn-primary");

	} else if (data.show == 'reg') {

		$("#registerGroup").attr("disabled",true);
		$("#unregisterGroup").attr("disabled",false);

		$("#registerGroup").attr("class","btn_norm_disabled tooltip");
		$("#unregisterGroup").attr("class","btn-lg btn-primary");

	}

	$("#result").html(data.result);
}

//Pc Register
//check which braowser is user using
function getBrowserName() {

	// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
	var isOpera = !!window.opera
	|| navigator.userAgent.indexOf(' OPR/') >= 0;

	// Firefox 1.0+
	isFirefox = typeof InstallTrigger !== 'undefined';

	// Chrome 1+
	isChrome = !!window.chrome && !isOpera;

	if (isFirefox) {
		$('#chromepluginl').remove();
//		document.getElementById("chromepluginl").setAttribute("hidden", "");
	} else if (isChrome) {
		$('#firefoxpluginl').remove();
//		document.getElementById("firefoxpluginl").setAttribute("hidden", "");
	}
}

//register pc with plugin
function registerpc() {

	var jsonObject		= new Object();
	var machinelockingId;
	var machinelockingName;
	var branchId;

	getBrowserName();
	
	if (isFirefox) {
		if (typeof plugin().load != 'function') {
			showError("basicError", 'Please Allow plugin and Reload page to use Register Machine');
			return false;
		}
	}

	var answer = confirm ("Confirm Machine Registration ?");

	if(answer == true) {

		jsonObject.filter		= 18;

		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("MachineLocking.do?pageId=297&eventId=7",
				{json:jsonStr}, function(data) {

					if (data.error) {
						showError("basicError",data.error);
						return false;
					}

					if (!jQuery.isEmptyObject(data)) {

						machinelockingId		= data.machinelockingId;
						machinelockingName		= data.machinelockingName;
						branchId				= data.branchId;

						var str = machinelockingId+'_'+machinelockingName+'_'+branchId;

						$("#registerfilecontent").html(str);

						if (isFirefox) {
							save();
							load();
						} else if (isChrome) {
							saveFile();
							loadFile();
						}

						$("#pcreg").html(machinelockingName);

					}
				});

		return false;
	} else {
		return false;
	}
}

//unregister pc which plugin file delete
function unregisterpc() {

	var jsonObject		= new Object();

	getBrowserName();
	
	if (isFirefox) {
		if (typeof plugin().load != 'function') {
			showError("basicError", 'Please Allow plugin and Reload page to use Register Machine');
			return false;
		}
	}

	var answer = confirm ("UnRegister this Machine?");

	if(answer == true) {

		jsonObject.filter			= 19;
		jsonObject.filecontent		= $('#filecontent').val();

		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("MachineLocking.do?pageId=297&eventId=7",
				{json:jsonStr}, function(data) {

					if (data && data.error) {
						showError("basicError",data.error);
						return false;
					}

					if (isFirefox) {
						deletef();
						load();
					} else if (isChrome) {
						deleteFileOrDirectory();
						loadFile();
					}

					$("#pcreg").html('');

				});

		return false;
	} else {
		return false;
	}

}

//reregister file which pc is given permission to register
function reregfile() {

	var jsonObject		= new Object();
	var machinelockingId;
	var machinelockingName;
	var branchId;

	getBrowserName();
	
	if (isFirefox) {
		if (typeof plugin().load != 'function') {
			showError("basicError", 'Please Allow plugin and Reload page to use Register Machine');
			return false;
		}
	}

	var answer = confirm("Re Register Machine ?");

	if (answer == true) {

		jsonObject.filter		= 20;

		var jsonStr = JSON.stringify(jsonObject);

		$.getJSON("MachineLocking.do?pageId=297&eventId=7",
				{json:jsonStr}, function(data) {

					if (data.error) {
						showError("basicError",data.error);
						return false;
					}

					if (!jQuery.isEmptyObject(data)) {

						machinelockingId		= data.machinelockingId;
						machinelockingName		= data.machinelockingName;
						branchId				= data.branchId;

						var str = machinelockingId+'_'+machinelockingName+'_'+branchId;

						$("#registerfilecontent").html(str);

						if (isFirefox) {
							save();
							load();
						} else if (isChrome) {
							saveFile();
							loadFile();
						}

						$("#pcreg").html(machinelockingName);

					} else {
						showError("loadchk","There is no machine for Re Register.");
					}
				});

		return false;
	} else {
		return false;
	}
}

//check pc file
function checkContent() {
	var filecontent = $("#filecontent").val();
	console.log(filecontent);

	if (filecontent != 'Not_Registerd') {

		$("#saveFileChrome").attr("disabled",true);
		$("#saveFileFirefox").attr("disabled",true);
		$("#deleteFileOrDirectoryChrome").attr("disabled",false);
		$("#deleteFileOrDirectoryFirefox").attr("disabled",false);

		$("#saveFileChrome").attr("class", "btn_norm_disabled tooltip");
		//$("#saveFileFirefox").attr("class", "btn_norm_disabled tooltip");
		$("#deleteFileOrDirectoryChrome").attr("class", "btn_norm tooltip");
		//$("#deleteFileOrDirectoryFirefox").attr("class", "btn_norm tooltip");

		$("#reregisterfile").attr("disabled",true);
		//$("#reregisterfile").attr("class", "btn_norm_disabled tooltip");

	} else if (filecontent == 'Not_Registerd') {

		$("#saveFileChrome").attr("disabled",false);
		$("#saveFileFirefox").attr("disabled",false);
		$("#deleteFileOrDirectoryChrome").attr("disabled",true);
		$("#deleteFileOrDirectoryFirefox").attr("disabled",true);

		$("#saveFileChrome").attr("class", "btn_norm tooltip");
		//$("#saveFileFirefox").attr("class", "btn_norm tooltip");
		$("#deleteFileOrDirectoryChrome").attr("class", "btn_norm_disabled tooltip");
		//$("#deleteFileOrDirectoryFirefox").attr("class", "btn_norm_disabled tooltip");

		$("#reregisterfile").attr("disabled",false);
		//$("#reregisterfile").attr("class", "btn_norm tooltip");
	}
}
