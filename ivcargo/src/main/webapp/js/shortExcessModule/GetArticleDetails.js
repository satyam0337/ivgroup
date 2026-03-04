/**
 * @Author	Anant Chaudhary	30-10-2015
 */

/*
 * 		Please include createDom.js file to work this function 
 */

var shortReceieve	= 1;
var damageReceieve	= 2;

function getArticleDetailsByDispatchLedger(wayBillId, dispatchLedgerId, filter) {
	
	var jsonObjectData = new Object();
	
	jsonObjectData.WayBillId		= wayBillId;
	jsonObjectData.DispatchLedgerId	= dispatchLedgerId;
	jsonObjectData.Filter			= 4;
	
	var jsonStr = JSON.stringify(jsonObjectData);
	
	$.getJSON("ArticleDetails.do?pageId=330&eventId=22", 
			{json:jsonStr}, function(data) {
		
			if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {
				showMessage('info', data.errorDescription);
			} else {
				if(filter == shortReceieve) {
					getArticleDetailsForShortEntry(data);
				} else if(filter == damageReceieve) {
					getArticleDetailsForDamageEntry(data);
				}
			}
	});
}

function getArticleDetailsForShortEntry(data) {
	removeTableRows('articleDetailsForShort', 'tbody');
	
	if(data.dispatchArtDetCollection) {
		var conDetails	= data.dispatchArtDetCollection;

		if(conDetails.length > 0) {
			for(var i = 0; i < conDetails.length; i++) {
				var dispatchCon = conDetails[i];
				
				var wayBillId				= dispatchCon.wayBillId;
				var packingType 			= dispatchCon.packingTypeName;
				var packingTypeId			= dispatchCon.packingTypeMasterId;
				var totalArticle			= dispatchCon.quantity;
				var saidToContain			= dispatchCon.saidToContain;
				var consignmentDetailsId	= dispatchCon.consignmentDetailsId;

				var row						= createRow('shortArticleDetailsRow' + [i + 1], '');
				
				var articleTypeCol			= createNewColumn(row, 'shortArticleType_1' + [i + 1], 'titletd', '', 'center', '', '');
				var shortPackingTypeIdCol	= createNewColumn(row, 'shortPackingTypeMasterId_1' + [i + 1], 'titletd', '', 'center', 'display: none', '');
				var shortTotalArticleCol	= createNewColumn(row, 'shortTotalArticle_1' + [i + 1], 'titletd', '', 'center', '', '');
				var shortArticleCol			= createNewColumn(row, 'shortArticle_1' + [i + 1], 'titletd', '', 'center', '', '');
				var shortSaidToContainCol	= createNewColumn(row, 'shortSaidToContain_1' + [i + 1], 'titletd', '', 'center', '', '');
				
				var packingTypejsonObject			= new Object();
				var packingTypeIdJsonObject			= new Object();
				var totalArticleJsonObject			= new Object();
				var shortArticleJsonObject			= new Object();
				var damageArticleJsonObject			= new Object();
				var saidToContainJsonObject			= new Object();
				var consignmentDetailsIdJsonObject	= new Object();
				
				packingTypejsonObject.type		= 'text';
				packingTypejsonObject.id		= 'shortArticleType_' + wayBillId + '_' + [i + 1];
				packingTypejsonObject.name		= 'shortArticleType_' + wayBillId + '_' + [i + 1];
				packingTypejsonObject.value 	= packingType;
				packingTypejsonObject.readonly	= 'readonly';
				packingTypejsonObject.class		= "form-control";
				packingTypejsonObject.onfocus	= "showInfo(this, 'Article Type')";
				
				createInput(articleTypeCol, packingTypejsonObject);
				
				packingTypeIdJsonObject.type		= 'text';
				packingTypeIdJsonObject.id			= 'shortPackingTypeMasterId_' + wayBillId + '_' + [i + 1];
				packingTypeIdJsonObject.name		= 'shortPackingTypeMasterId_' + wayBillId + '_' + [i + 1];
				packingTypeIdJsonObject.value 		= packingTypeId;
				packingTypeIdJsonObject.style		= "display: none";
				
				createInput(shortPackingTypeIdCol, packingTypeIdJsonObject);
				
				consignmentDetailsIdJsonObject.type		= 'hidden';
				consignmentDetailsIdJsonObject.id		= 'shortConsignmentDetailsId_' + wayBillId + '_' + [i + 1];
				consignmentDetailsIdJsonObject.name		= 'shortConsignmentDetailsId_' + wayBillId + '_' + [i + 1];
				consignmentDetailsIdJsonObject.value 	= consignmentDetailsId;
				
				createInput(shortPackingTypeIdCol, consignmentDetailsIdJsonObject);
				
				shortArticleJsonObject.type			= 'text';
				shortArticleJsonObject.id			= 'shortArticle_' + wayBillId + '_' + [i + 1];
				shortArticleJsonObject.name			= 'shortArticle_' + wayBillId + '_' + [i + 1];
				shortArticleJsonObject.value		= '0';
				shortArticleJsonObject.placeholder	= 0;
				shortArticleJsonObject.class		= "form-control";
				shortArticleJsonObject.onfocus		= "showInfo(this, 'Short Article');resetTextFeild(this, 0);";
				shortArticleJsonObject.onkeypress	= "return noNumbers(event);if(event.altKey==1){return false;}";
				shortArticleJsonObject.onblur		= "validateTotalShortArt(); clearIfNotNumeric(this,'0');resetTextFeild(this, 0);";
				shortArticleJsonObject.onkeyup		= "validateTotalShortArt(); calculateActualUnloadWeightShortWeightForShort('"+ wayBillId +"');";
				shortArticleJsonObject.maxlength	= 4;
				
				totalArticleJsonObject.type		= 'text';
				totalArticleJsonObject.id		= 'totalShortArticle_' + wayBillId + '_' + [i + 1];
				totalArticleJsonObject.name		= 'totalShortArticle_' + wayBillId + '_' + [i + 1];
				totalArticleJsonObject.value	= totalArticle;
				totalArticleJsonObject.readonly	= 'readonly';
				totalArticleJsonObject.class	= "form-control";
				totalArticleJsonObject.onfocus	= "showInfo(this, 'Total Article')";
				
				createInput(shortArticleCol, shortArticleJsonObject);
				createInput(shortTotalArticleCol, totalArticleJsonObject);	
										
				saidToContainJsonObject.type		= 'text';
				saidToContainJsonObject.id			= 'shortSaidToContain_' + wayBillId + '_' + [i + 1];
				saidToContainJsonObject.name		= 'shortSaidToContain_' + wayBillId + '_' + [i + 1];
				saidToContainJsonObject.value		= saidToContain;
				saidToContainJsonObject.readonly	= 'readonly';
				saidToContainJsonObject.class		= "form-control";
				saidToContainJsonObject.onfocus		= "showInfo(this,'Insert Short Article')";

				createInput(shortSaidToContainCol, saidToContainJsonObject);
				
				appendRowInTable('shortArticleDetailsId', row);
			}
		}
	}
}

function getArticleDetailsForDamageEntry(data) {
	removeTableRows('articleDetailsForDamage', 'tbody');
	
	if(data.dispatchArtDetCollection) {
		var conDetails	= data.dispatchArtDetCollection;

		if(conDetails.length > 0) {
			for(var i = 0; i < conDetails.length; i++) {
				var dispatchCon = conDetails[i];
				
				var wayBillId				= dispatchCon.wayBillId;
				var packingType 			= dispatchCon.packingTypeName;
				var packingTypeId			= dispatchCon.packingTypeMasterId;
				var totalArticle			= dispatchCon.quantity;
				var saidToContain			= dispatchCon.saidToContain;
				var consignmentDetailsId	= dispatchCon.consignmentDetailsId;

				var row		= createRow('damageArticleDetailsRow' + [i + 1], '');
				
				var articleTypeCol			= createNewColumn(row, 'damageArticleType_1' + [i + 1], 'titletd', '', 'center', '', '');
				var damagePackingTypeIdCol	= createNewColumn(row, 'damagePackingTypeMasterId_1' + [i + 1], 'titletd', '', 'center', 'display: none', '');
				var damageTotalArticleCol	= createNewColumn(row, 'damageTotalArticle_1' + [i + 1], 'titletd', '', 'center', '', '');
				var damageArticleCol		= createNewColumn(row, 'damageArticle_1' + [i + 1], 'titletd', '', 'center', '', '');
				var damageSaidToContainCol	= createNewColumn(row, 'damageSaidToContain_1' + [i + 1], 'titletd', '', 'center', '', '');
				
				var packingTypejsonObject			= new Object();
				var packingTypeIdJsonObject			= new Object();
				var totalArticleJsonObject			= new Object();
				var shortArticleJsonObject			= new Object();
				var damageArticleJsonObject			= new Object();
				var saidToContainJsonObject			= new Object();
				var consignmentDetailsIdJsonObject	= new Object();
				
				packingTypejsonObject.type		= 'text';
				packingTypejsonObject.id		= 'damageArticleType_' + wayBillId + '_' + [i + 1];
				packingTypejsonObject.name		= 'damageArticleType_' + wayBillId + '_' + [i + 1];
				packingTypejsonObject.value 	= packingType;
				packingTypejsonObject.readonly	= 'readonly';
				packingTypejsonObject.class		= "pure-input-1";
				packingTypejsonObject.onfocus	= "showInfo(this, 'Article Type')";
				
				createInput(articleTypeCol, packingTypejsonObject);
				
				packingTypeIdJsonObject.type		= 'text';
				packingTypeIdJsonObject.id			= 'damagePackingTypeMasterId_' + wayBillId + '_' + [i + 1];
				packingTypeIdJsonObject.name		= 'damagePackingTypeMasterId_' + wayBillId + '_' + [i + 1];
				packingTypeIdJsonObject.value 		= packingTypeId;
				packingTypeIdJsonObject.style		= "display: none";
				
				createInput(damagePackingTypeIdCol, packingTypeIdJsonObject);
				
				consignmentDetailsIdJsonObject.type		= 'hidden';
				consignmentDetailsIdJsonObject.id		= 'damageConsignmentDetailsId_' + wayBillId + '_' + [i + 1];
				consignmentDetailsIdJsonObject.name		= 'damageConsignmentDetailsId_' + wayBillId + '_' + [i + 1];
				consignmentDetailsIdJsonObject.value 	= consignmentDetailsId;
				
				createInput(damagePackingTypeIdCol, consignmentDetailsIdJsonObject);
				
				totalArticleJsonObject.type		= 'text';
				totalArticleJsonObject.id		= 'totalDamageArticle_' + wayBillId + '_' + [i + 1];
				totalArticleJsonObject.name		= 'totalDamageArticle_' + wayBillId + '_' + [i + 1];
				totalArticleJsonObject.value	= totalArticle;
				totalArticleJsonObject.readonly	= 'readonly';
				totalArticleJsonObject.class	= "pure-input-1";
				totalArticleJsonObject.onfocus	= "showInfo(this, 'Total Article')";
											
				createInput(damageTotalArticleCol, totalArticleJsonObject);			
				
				damageArticleJsonObject.type		= 'text';
				damageArticleJsonObject.id			= 'damageArticle_' + wayBillId + '_' + [i + 1];
				damageArticleJsonObject.name		= 'damageArticle_' + wayBillId + '_' + [i + 1];
				damageArticleJsonObject.value		= '0';
				damageArticleJsonObject.placeholder	= 0;
				damageArticleJsonObject.class		= "pure-input-1";
				damageArticleJsonObject.onfocus		= "showInfo(this, 'Damage Article');resetTextFeild(this, 0);";
				damageArticleJsonObject.onblur		= "validateTotalDamageArt(); clearIfNotNumeric(this,'0');resetTextFeild(this, 0);";
				damageArticleJsonObject.onkeyup		= "validateTotalDamageArt(); calculateActualUnloadWeightShortWeightForDamage('"+ wayBillId +"');";
				damageArticleJsonObject.maxlength	= 4;
				
				createInput(damageArticleCol, damageArticleJsonObject);
				
				saidToContainJsonObject.type		= 'text';
				saidToContainJsonObject.id			= 'damageSaidToContain_' + wayBillId + '_' + [i + 1];
				saidToContainJsonObject.name		= 'damageSaidToContain_' + wayBillId + '_' + [i + 1];
				saidToContainJsonObject.value		= saidToContain;
				saidToContainJsonObject.readonly	= 'readonly';
				saidToContainJsonObject.class		= "pure-input-1";

				createInput(damageSaidToContainCol, saidToContainJsonObject);
				
				appendRowInTable('damageArticleDetailsId', row);
			}
		}
	}
}