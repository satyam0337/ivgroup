/**
 *
 */
package com.ivcargo.actions.shortexcess;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import com.iv.utils.exception.ExceptionProcess;
import com.platform.dto.ConsignmentDetails;
import com.platform.dto.DispatchLedger;
import com.platform.dto.LHPV;
import com.platform.dto.shortexcess.ClaimEntry;
import com.platform.dto.shortexcess.DamageReceiveArticles;
import com.platform.dto.shortexcess.DamageReceiveReportDto;
import com.platform.dto.shortexcess.DamageSettlementReport;
import com.platform.dto.shortexcess.ExcessReceive;
import com.platform.dto.shortexcess.ExcessSettlementReport;
import com.platform.dto.shortexcess.NewFocLrDto;
import com.platform.dto.shortexcess.ShortReceive;
import com.platform.dto.shortexcess.ShortReceiveArticles;
import com.platform.dto.shortexcess.ShortReceiveReportDto;
import com.platform.dto.shortexcess.ShortSettlementReport;
import com.platform.dto.truckhisabmodule.DriverDailyAllowance;
import com.platform.dto.truckhisabmodule.MiscTypeMaster;
import com.platform.dto.truckhisabmodule.PumpNameMaster;
import com.platform.dto.truckhisabmodule.PumpReceipt;
import com.platform.dto.truckhisabmodule.TollTypeRateMaster;
import com.platform.dto.truckhisabmodule.TruckHisabVoucher;
import com.platform.dto.truckhisabmodule.VehicleHisabDateDetails;

/**
 * @author Anant Chaudhary	09-11-2015
 *
 */
public class CommonFuctionToConvertArrayListToJSONArray {

	private static final String TRACE_ID	= CommonFuctionToConvertArrayListToJSONArray.class.getName();

	public JSONArray getShortSettlementJSONArrayObject(final ArrayList<ShortSettlementReport> shortSettlementArrayList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			shortSettlementArrayList.forEach((final ShortSettlementReport shortSettlementReport) -> valueObjArray.put(new JSONObject(shortSettlementReport)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getExcessSettlementJSONArrayObject(final ArrayList<ExcessSettlementReport> exeSettlementReportsList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			exeSettlementReportsList.forEach((final ExcessSettlementReport excessSettlementReport) -> valueObjArray.put(new JSONObject(excessSettlementReport)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getExcessReceiveJSONArrayObject(final ArrayList<ExcessReceive> excessReceiveArtList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			excessReceiveArtList.forEach((final ExcessReceive excessReceive) -> valueObjArray.put(new JSONObject(excessReceive)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getShortReceiveListJSONArrayObject(final ArrayList<ShortReceive> shortReceiveArrayList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			shortReceiveArrayList.forEach((final ShortReceive shortReceive) -> valueObjArray.put(new JSONObject(shortReceive)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getShortReceiveArticleJSONArrayObject(final ArrayList<ShortReceiveArticles> shortReceiveArticleArrayList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			shortReceiveArticleArrayList.forEach((final ShortReceiveArticles shortReceiveArticles) -> valueObjArray.put(new JSONObject(shortReceiveArticles)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getDamageReceiveArticleJSONArrayObject(final ArrayList<DamageReceiveArticles> damageReceiveArticleArrayList) throws Exception {
		try {
			final var		valueObjArray = new JSONArray();

			damageReceiveArticleArrayList.forEach((final DamageReceiveArticles damageReceiveArticles) -> valueObjArray.put(new JSONObject(damageReceiveArticles)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getNewFocLrDetailsJSONArrayObject(final ArrayList<NewFocLrDto> newFocLrDtoArrayList) throws Exception {
		try {
			final var		valueObjectArray	= new JSONArray();

			newFocLrDtoArrayList.forEach((final NewFocLrDto newFocLrDto) -> valueObjectArray.put(new JSONObject(newFocLrDto)));

			return valueObjectArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getClaimEntryJSONArrayObject(final List<ClaimEntry> claimEntryArrayList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			claimEntryArrayList.forEach((final ClaimEntry claimEntry) -> valueObjArray.put(new JSONObject(claimEntry)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, null);
		}
	}

	public JSONArray getConsignmentDetailJSONArrayObject(final ArrayList<ConsignmentDetails> conDetailsArrayList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			conDetailsArrayList.forEach((final ConsignmentDetails consignmentDetails) -> valueObjArray.put(new JSONObject(consignmentDetails)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getShortReceiveReportJSONArrayObject(final ArrayList<ShortReceiveReportDto> shortReceiveArrayList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			shortReceiveArrayList.forEach((final ShortReceiveReportDto shortReceive) -> valueObjArray.put(new JSONObject(shortReceive)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getDamageReceiveReportJSONArrayObject(final ArrayList<DamageReceiveReportDto> damageReceiveArrayList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			damageReceiveArrayList.forEach((final DamageReceiveReportDto damageReceive) -> valueObjArray.put(new JSONObject(damageReceive)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getDamageSettlementJSONArrayObject(final ArrayList<DamageSettlementReport> damageSettlementArrayList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			damageSettlementArrayList.forEach((final DamageSettlementReport damageSettlementReport) -> valueObjArray.put(new JSONObject(damageSettlementReport)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getTollMasterJSONArrayObject(final ArrayList<TollTypeRateMaster> tollMasterArrayList) throws Exception {
		try {
			final var		valueObjArray = new JSONArray();

			tollMasterArrayList.forEach((final TollTypeRateMaster tollMaster) -> valueObjArray.put(new JSONObject(tollMaster)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getPumpReceiptJSONArrayObject(final List<PumpReceipt> pumpReceiptList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			pumpReceiptList.forEach((final PumpReceipt pumpReceipt) -> valueObjArray.put(new JSONObject(pumpReceipt)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getPumpNameJSONArrayObject(final ArrayList<PumpNameMaster> pumpNameMasterList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			pumpNameMasterList.forEach((final PumpNameMaster pumpNameMaster) -> valueObjArray.put(new JSONObject(pumpNameMaster)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getLHPVJSONArrayObject(final ArrayList<LHPV> lhpvArrayList) throws Exception {
		try {
			final var		valueObjArray = new JSONArray();

			lhpvArrayList.forEach((final LHPV lhpv) -> valueObjArray.put(new JSONObject(lhpv)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getDispatchLedgerJSONArrayObject(final ArrayList<DispatchLedger> dispatchledgerList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			dispatchledgerList.forEach((final DispatchLedger dispatchledger) -> valueObjArray.put(new JSONObject(dispatchledger)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getDriverDailyAllowanceJSONArrayObject(final List<DriverDailyAllowance> miscMasterArrayList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			miscMasterArrayList.forEach((final DriverDailyAllowance miscTypeMaster) -> valueObjArray.put(new JSONObject(miscTypeMaster)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getMiscMasterJSONArrayObject(final ArrayList<MiscTypeMaster> miscMasterArrayList) throws Exception {

		JSONArray valueObjArray = null;

		try {
			if(miscMasterArrayList != null && miscMasterArrayList.size() > 0 ) {
				valueObjArray = new JSONArray();

				for(final MiscTypeMaster miscTypeMaster : miscMasterArrayList)
					valueObjArray.put(new JSONObject(miscTypeMaster));
			}
			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		} finally {
			valueObjArray = null;
		}
	}

	public JSONArray getVehicleLastDateJSONArrayObject(final ArrayList<VehicleHisabDateDetails> vehicleHisabDateDetailsList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			vehicleHisabDateDetailsList.forEach((final VehicleHisabDateDetails vehicleHisabDateDetails) -> valueObjArray.put(new JSONObject(vehicleHisabDateDetails)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public JSONArray getTruckHisabVoucherJSONArrayObject(final ArrayList<TruckHisabVoucher> truckHisabVoucherList) throws Exception {
		try {
			final var	valueObjArray = new JSONArray();

			truckHisabVoucherList.forEach((final TruckHisabVoucher truckHisabVoucher) -> valueObjArray.put(new JSONObject(truckHisabVoucher)));

			return valueObjArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
