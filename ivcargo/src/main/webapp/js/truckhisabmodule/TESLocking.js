/***
 * Created By : Shailesh Khandare
 * Description : Locking for truck Engagement slip  
 * Date : 27-04-2016 
 */


/** 
 *function is to locking of truck Engagement slip for Truck Hisab Voucher  
 */
function lockTESForTruckHisabVoucher(vehicleId){
	var jSonObject			= null;
	var JsonOutObject		= null; 		
	var ajaxcount			= 0;
	
	jSonObject				= new Object();
	jSonObject.VehicleId	= vehicleId;
	JsonOutObject			= new Object();
	JsonOutObject			= jSonObject;			
	
	var jsonStr				= JSON.stringify(JsonOutObject);
	$.getJSON("/ivcargo/jsp/masters/MasterAjaxInterface.jsp?filter="+74, 
			{json:jsonStr}, function(data) {
					if(data.Sucess == 325){
						console.log("not allowed");
						showMessage('error',"Truck Hisab is not settled Please, settle truck hisab voucher!!");
						$("#searchVehicle").val("");
						$("#ownerName").val("");
						$("#searchVehicle").focus();
						$("#lorrySupplierName").val("")
						$("#supplierMobileNumber").val("")
						ajaxcount = Number(ajaxcount) + 1;
						
					}else{
						ajaxcount = 0;
						getSeletedItemData(vehicleId);
						
					}
			})
			
			if(Number(ajaxcount) > 0){
				return false;
			}else{
				return true;
			}
	
}