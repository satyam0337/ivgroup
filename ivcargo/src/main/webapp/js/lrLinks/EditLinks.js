
var wayBillData				= null;
var listParentId			= '';

/*
 * Create list for edit lr data. with frild permission. if list is already present no0 data will be added.
 */
function createEditList(execFldPermissions, TransComMas, CrgTypMas, data, configuration) {

	if (configuration.GenerateCashReciptLinks != 'true') {
		hideLinks();
	}

	if (configuration.GenerateCashReciptEdit != 'true') {
		return;
	}

	if ($("#editLinks1 li").length > 0) {
		showLinks();
		return;
	}

	listParentId			= 'editLinks1';

	var ListJO				= null;
	var LinkJO				= null;

	wayBillData				= data;
	TransportCommonMaster	= TransComMas;
	ChargeTypeMaster		= CrgTypMas;

	ListJO	= new Object();

	LinkJO	= new Object();
	LinkJO.href		= '#';

	if(execFldPermissions[FeildPermissionsConstant.Edit_Customer] != null) {
		createTag(ListJO, LinkJO, 'EditCustomer', 'Edit Customer', 'editLinkAction(this);', TransportCommonMaster.EDIT_LINKS_CUSTOMER);
	}

	if((execFldPermissions[FeildPermissionsConstant.EDIT_TOPAY_LR_RATE] != null) 
			|| (execFldPermissions[FeildPermissionsConstant.EDIT_PAID_LR_RATE] != null)) {
		createTag(ListJO, LinkJO, 'EditLRRate', 'Edit LR Rate', 'editLinkAction(this);', TransportCommonMaster.EDIT_LINKS_LR_RATE);
	}
	
	if(execFldPermissions[FeildPermissionsConstant.EDIT_CONSIGNMENT] != null) {
		createTag(ListJO, LinkJO, 'EditArticle', 'Edit Art', 'editLinkAction(this);', TransportCommonMaster.EDIT_LINKS_CONSIGNMENT);
	}

	showLinks();
}

function showLinks() {
	if ($("#editLinks1 li").length > 0) {
		$('#editLinksHead').switchClass("visibility-visible", "visibility-hidden");
		if (configuration.GenerateCashReciptEdit == 'true') {
			$('#lrLinks').switchClass("visibility-visible", "visibility-hidden");
		}
	}
}

function hideEditLinks() {
	$('#editLinksHead').switchClass("visibility-hidden", "visibility-visible");
	if (configuration.GenerateCashReciptEdit == 'true') {
		$('#lrLinks').switchClass("visibility-hidden", "visibility-visible");
	}
}


/*
 * create li tag fo links
 */
function createTag(ListJO, LinkJO, listid, linktext, evtfun, filter) {

	var newListAttr			= null;
	var newLinkAttr			= null;

	LinkJO.html		= linktext;
	LinkJO.onClick	= evtfun;
	newLinkAttr		= createHyperLink(LinkJO);

	newLinkAttr.attr({
		'data-filter' : filter
	});

	ListJO.id		= listid;
	ListJO.html		= newLinkAttr;
	newListAttr		= createList(listParentId, ListJO);

	return newListAttr;
}

/*
 * check if customer have permission or not. if not then error msg will show else window will open for edition.
 */
function editLinkAction(obj) {

	var waybillMod				= wayBillData.waybillMod;
	var consignmentSummary		= wayBillData.consignmentSummary;
	var jsonObject				= new Object();
	var filter					= $(obj).data('filter');

	jsonObject.waybillId						= waybillMod.wayBillId;
	jsonObject.wayBillStatus					= waybillMod.status;
	jsonObject.wayBillTypeId					= waybillMod.wayBillTypeId;
	jsonObject.sourceBranchId					= waybillMod.sourceBranchId;
	jsonObject.wayBillNo						= waybillMod.wayBillNumber;
	jsonObject.prevDeliveryToId					= consignmentSummary.deliveryTo;
	jsonObject.remark							= waybillMod.remark;
	jsonObject.dstBranchId						= waybillMod.destinationBranchId;
	jsonObject.wayBillCreationtimestamp			= waybillMod.creationDateTimeStamp;
	jsonObject.wayBillBranchId					= waybillMod.wayBillBranchId;
	jsonObject.wayBillBookingCrossingAgentId	= waybillMod.wayBillBookingCrossingAgentId;
	jsonObject.freightAmount					= $('#deliveryCharge'+ChargeTypeMaster.FREIGHT).val();
	jsonObject.paymentType						= consignmentSummary.paymentType;
	
	var url	= '';
	
	if(filter == TransportCommonMaster.EDIT_LINKS_CUSTOMER)
		url = WEB_SERVICE_URL + '/updateCustomerWS/customerLinkFromDelivery.do';
	else if (filter == TransportCommonMaster.EDIT_LINKS_LR_RATE)
		url = WEB_SERVICE_URL + '/editLRRateWS/lrRateLinkFromDelivery.do';
	else if (filter == TransportCommonMaster.EDIT_LINKS_CONSIGNMENT)
			url = WEB_SERVICE_URL + '/editConsignmentWS/getDataToEditConsignment.do';
	
	showLayer();
	
	$.ajax({
		type		: 	"POST",
		url			: 	url,
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				hideLayer();
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				return;
			}
			
			hideLayer();
			
			openWindow(data, filter);
		}
	});
}

/*
 * open window for edition after all condition are matched.
 * different cases for different king of url
 */
function openWindow(data, filter) {
	var	url = '';

	switch (filter) {
	case TransportCommonMaster.EDIT_LINKS_CUSTOMER:
		url = 
			'updateCustomer.do?pageId=25&eventId=3' +
			'&wayBillId=' + data.waybillId +
			'&isUpdateCustomerWithRate=true' +
			'&redirectFilter=7' +
			'&freightAmount=' + data.freightAmount;

		childwin = window.open (url,"newwindow",config="left=300,top=120,height=500,width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");

		break;
	case TransportCommonMaster.EDIT_LINKS_LR_RATE:
		url = 
			'editWayBillCharges.do?pageId=340&eventId=2&modulename=editLRRate&wayBillId=' + data.waybillId +
			'&redirectFilter=7';

		childwin	= window.open (url, 'newwindow', config='left=300,top=100,width=650,height=600, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');

		break;
	case TransportCommonMaster.EDIT_LINKS_CONSIGNMENT:
		url = 
			'updateConsignment.do?pageId=340&eventId=2&modulename=editConsignment&wayBillId=' + data.WayBill.wayBillId +
			'&wayBillNo=' + data.WayBill.wayBillNumber + '&redirectFilter=7';
			

		childwin = window.open (url,"newwindow",config="left=300,top=120,height=500,width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no");

		break;
	default:
		break;
	}

	return url;
}

