package com.ivcargo.reports;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;

import com.businesslogic.properties.impl.PropertyConfigValueBLLImpl;
import com.iv.constant.properties.customgroupaddress.CustomGroupAddressPropertiesConstant;
import com.iv.dto.model.PrintHeaderModel;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;
import com.ivcargo.utils.CacheManip;
import com.platform.dao.CustomGroupMapperDao;
import com.platform.dto.Branch;
import com.platform.dto.CustomGroupMapper;
import com.platform.dto.Executive;
import com.platform.dto.PropertiesFileConstants;
import com.platform.dto.configuration.modules.RegionOrBranchWiseGroupNameDTO;
import com.platform.dto.configuration.report.CustomGroupConfigurationDTO;
import com.platform.dto.model.ReportViewModel;

public class ReportView {

	public static final String TRACE_ID 	= "ReportView";
	public static ReportView reportView 	= null;

	public static ReportView getInstance() {
		if(reportView == null)
			reportView = new ReportView();
		return reportView;
	}

	public ReportViewModel populateReportViewModel(final HttpServletRequest request, final ReportViewModel reportViewModel) throws Exception {
		try {
			final var	cache						= new CacheManip(request);
			final var	executive					= cache.getExecutive(request);

			if(executive == null)
				return new ReportViewModel();

			var			branch						= cache.getGenericBranchDetailCache(request, executive.getBranchId());
			final var	accountGroup 				= cache.getAccountGroupById(request, executive.getAccountGroupId());

			final var	configuration				= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.REGION_OR_BRANCH_WISE_GROUPNAME_CONFIG);
			final var	customGroupConfig			= PropertyConfigValueBLLImpl.getInstance().getConfiguration(executive, PropertiesFileConstants.CUSTOM_GROUP_CONFIG);
			final var	branchWise					= configuration.getBoolean(RegionOrBranchWiseGroupNameDTO.IS_BRANCH_WISE, false);
			final var	regionWise					= configuration.getBoolean(RegionOrBranchWiseGroupNameDTO.IS_REGION_WISE, false);

			createDtoToSetPrintHeader(reportViewModel, branch);
			reportViewModel.setAccountGroupName(accountGroup.getDescription());
			reportViewModel.setAccountGroupNumber(accountGroup.getPhoneNumber());
			reportViewModel.setCompanyPanNumber(accountGroup.getPanNumber());
			reportViewModel.setCompanyGstNumber(accountGroup.getGstNumber());
			reportViewModel.setAccountGroupId(executive.getAccountGroupId());
			reportViewModel.setCompanyWebsite(accountGroup.getWebsite());
			reportViewModel.setCompanyHelplineNumbers(accountGroup.getHelplineNumbers());
			reportViewModel.setCompanyEmailAddress(accountGroup.getEmailAddress());
			reportViewModel.setCompanyAddress(accountGroup.getAddress());

			if (customGroupConfig.getBoolean(CustomGroupConfigurationDTO.SINGLE_GROUP_ADDRESS_IN_ALL_PRINT)) {
				branch	= cache.getGenericBranchDetailCache(request, customGroupConfig.getLong(CustomGroupConfigurationDTO.SINGLE_GROUP_ADDRESS_BRANCH_ID));
				reportViewModel.setBranchPhoneNumber(branch.getPhoneNumber());
				reportViewModel.setBranchAddress(branch.getAddress());
			} else if (customGroupConfig.getBoolean(CustomGroupConfigurationDTO.CUSTOM_GROUP_ADDESS_ALLOWED)) {
				final var 	branchId			= request.getAttribute("customAddressBranchId") != null ? Long.parseLong(request.getAttribute("customAddressBranchId") + "") : 0;
				final var 	identifier			= request.getAttribute("customAddressIdentifer") != null ? Short.parseShort(request.getAttribute("customAddressIdentifer") + "") : 0;
				final var	customGroupMapper	= cache.getCustomGroupData(request, executive.getAccountGroupId(), identifier, branchId);

				if (customGroupMapper == null || customGroupMapper.getAccountGroupPrintConstant() == 0)
					reportViewModel.setAccountGroupName("--");
				else
					reportViewModel.setAccountGroupName(customGroupMapper.getCompanyName());

				if(customGroupConfig.getBoolean(CustomGroupConfigurationDTO.CUSTOM_GROUP_LOGO_ALLOWED, false))
					if(customGroupMapper != null)
						reportViewModel.setImagePath("/images/Logo/" + executive.getAccountGroupId() + "_" + customGroupMapper.getAccountGroupPrintConstant() + ".jpg");
					else if(customGroupConfig.getBoolean(CustomGroupConfigurationDTO.SINGLE_LOGO_ALLOW_FOR_ALL_BRANCHES, false))
						reportViewModel.setImagePath("/images/Logo/" + executive.getAccountGroupId() + ".jpg");
					else
						reportViewModel.setAccountGroupName(accountGroup.getDescription());
			} else if(regionWise) {
				final var regionIdWiseGroupName	= getGroupNameByRegionId(request, configuration);
				reportViewModel.setAccountGroupName(regionIdWiseGroupName != null ? regionIdWiseGroupName : accountGroup.getDescription());
			} else if(branchWise) {
				final var branchIdWiseGroupName	= getGroupNameByBranchId(request, configuration);
				reportViewModel.setAccountGroupName(branchIdWiseGroupName != null ? branchIdWiseGroupName : accountGroup.getDescription());
			} else
				reportViewModel.setAccountGroupName(accountGroup.getDescription());

			return reportViewModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getGroupNameByRegionId(final HttpServletRequest request, final ValueObject configuration) throws Exception {
		try {
			final var	executive					= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);
			final var	regionIdWiseGroupNameHM		= new HashMap<Long, String>();
			final var	regionIdWiseGroupName 		= configuration.getString(RegionOrBranchWiseGroupNameDTO.IS_REGIONID_GROUPNAME);
			final var	regionIdWiseGroupNameArr	= regionIdWiseGroupName.split(",");

			for(final String regionIdgroupName: regionIdWiseGroupNameArr) {
				final var regIdGroupName = regionIdgroupName.split("_");
				regionIdWiseGroupNameHM.put(Long.parseLong(StringUtils.trim(regIdGroupName[0])), StringUtils.trim(regIdGroupName[1]));
			}

			return regionIdWiseGroupNameHM.get(executive.getRegionId());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private String getGroupNameByBranchId(final HttpServletRequest request, final ValueObject configuration) throws Exception {
		try {
			final var	executive					= (Executive) request.getSession().getAttribute(Executive.EXECUTIVE);
			final var	branchIdWiseGroupNameHM		= new HashMap<Long, String>();
			final var	branchIdWiseGroupName 		= configuration.getString(RegionOrBranchWiseGroupNameDTO.IS_BRANCHID_GROUPNAME);
			final var	branchIdWiseGroupNameArr	= branchIdWiseGroupName.split(",");

			for(final String branchIdgroupName : branchIdWiseGroupNameArr) {
				final var branchIdGroupName = branchIdgroupName.split("_");
				branchIdWiseGroupNameHM.put(Long.parseLong(StringUtils.trim(branchIdGroupName[0])), StringUtils.trim(branchIdGroupName[1]));
			}

			return branchIdWiseGroupNameHM.get(executive.getBranchId());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private void createDtoToSetPrintHeader(final ReportViewModel reportViewModel, final Branch branch) throws Exception {
		try {
			reportViewModel.setBranchName(branch.getName());
			reportViewModel.setBranchDisplayName(branch.getDisplayName());
			reportViewModel.setBranchContactDetailContactPersonName(branch.getContactPersonName());
			reportViewModel.setBranchContactDetailMobileNumber(branch.getMobileNumber());
			reportViewModel.setBranchContactDetailMobileNumber2(branch.getMobileNumber2());
			reportViewModel.setBranchContactDetailPhoneNumber(branch.getPhoneNumber());
			reportViewModel.setBranchContactDetailPhoneNumber2(branch.getPhoneNumber2());
			reportViewModel.setBranchPhoneNumber(branch.getPhoneNumber());
			reportViewModel.setBranchAddress(branch.getAddress());
			reportViewModel.setBranchContactDetailFaxNumber(branch.getFaxNumber());
			reportViewModel.setBranchContactDetailEmailAddress(branch.getEmailAddress());
			reportViewModel.setBranchGstin(branch.getGstn());
			reportViewModel.setBranchPanNumber(branch.getPanNumber());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public ReportViewModel getHeaderForCustomGroupAddress(final HttpServletRequest request, final Executive executive, final long branchId, final short identifier) throws Exception {
		String				accountGroupName			= null;

		try {
			final var	cache						= new CacheManip(request);
			final var	accountGroup				= cache.getAccountGroupByAccountGroupId(request, executive.getAccountGroupId());
			final var	customGroupAddressObject	= cache.getCustomGroupAddressConfiguration(request, executive.getAccountGroupId());

			if (customGroupAddressObject == null || !customGroupAddressObject.getBoolean(CustomGroupAddressPropertiesConstant.CUSTOM_GROUP_ADDRESS_ALLOWED))
				return null;

			final var	branch						= cache.getGenericBranchDetailCache(request, branchId);

			var	customGroupMapper	= new CustomGroupMapper();

			customGroupMapper.setIdentifier(identifier);
			customGroupMapper.setBranchId(branch.getBranchId());
			customGroupMapper.setAccountGroupId(branch.getAccountGroupId());

			customGroupMapper	= CustomGroupMapperDao.getInstance().getCustomGroupByIdentifierAndBranch(customGroupMapper);

			if (customGroupMapper == null)
				return null;

			final var			reportViewModel		= new ReportViewModel();

			accountGroupName	= customGroupAddressObject.getString("group" + customGroupMapper.getAccountGroupPrintConstant(), null);
			createDtoToSetPrintHeader(reportViewModel, branch);
			reportViewModel.setAccountGroupName(accountGroupName);
			reportViewModel.setAccountGroupId(executive.getAccountGroupId());

			reportViewModel.setCompanyWebsite(accountGroup != null ? accountGroup.getWebsite() : "");
			reportViewModel.setCompanyHelplineNumbers(accountGroup != null ? accountGroup.getHelplineNumbers() : "");
			reportViewModel.setCompanyPanNumber(accountGroup != null ? accountGroup.getPanNumber() : "");
			reportViewModel.setCompanyGstNumber(accountGroup != null ? accountGroup.getGstNumber() : "");
			reportViewModel.setAccountGroupNumber(accountGroup != null ? accountGroup.getPhoneNumber() : "");

			return reportViewModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public PrintHeaderModel setPrintHeaderModel(final HttpServletRequest request, final Executive executive, final long branchId, final short identifier) throws Exception {
		try {
			var	customGroupAddressModel	= getHeaderForCustomGroupAddress(request, executive, branchId, identifier);

			if(customGroupAddressModel == null) {
				customGroupAddressModel			= new ReportViewModel();
				customGroupAddressModel			= populateReportViewModel(request, customGroupAddressModel);
			}

			final var	printHeaderModel	= new PrintHeaderModel();
			printHeaderModel.setAccountGroupPhoneNo(customGroupAddressModel.getAccountGroupNumber());
			printHeaderModel.setBranchContactDetailContactPersonName(customGroupAddressModel.getBranchContactDetailContactPersonName());
			printHeaderModel.setBranchContactDetailMobileNumber(customGroupAddressModel.getBranchContactDetailMobileNumber());
			printHeaderModel.setBranchContactDetailMobileNumber2(customGroupAddressModel.getBranchContactDetailMobileNumber2());
			printHeaderModel.setBranchContactDetailPhoneNumber(customGroupAddressModel.getBranchContactDetailPhoneNumber());
			printHeaderModel.setBranchContactDetailPhoneNumber2(customGroupAddressModel.getBranchContactDetailPhoneNumber2());
			printHeaderModel.setBranchPhoneNumber(customGroupAddressModel.getBranchContactDetailPhoneNumber());
			printHeaderModel.setBranchAddress(customGroupAddressModel.getBranchAddress());
			printHeaderModel.setBranchContactDetailFaxNumber(customGroupAddressModel.getBranchContactDetailFaxNumber());
			printHeaderModel.setBranchContactDetailEmailAddress(customGroupAddressModel.getBranchContactDetailEmailAddress());
			printHeaderModel.setBranchGSTN(customGroupAddressModel.getBranchGstin());
			printHeaderModel.setBranchDisplayName(customGroupAddressModel.getBranchDisplayName());
			printHeaderModel.setBranchName(customGroupAddressModel.getBranchName());
			printHeaderModel.setAccountGroupName(customGroupAddressModel.getAccountGroupName());
			printHeaderModel.setOwnerAccountGroupName(customGroupAddressModel.getAccountGroupName());
			printHeaderModel.setAccountGroupId(customGroupAddressModel.getAccountGroupId());
			printHeaderModel.setCompanyWebsite(customGroupAddressModel.getCompanyWebsite());
			printHeaderModel.setCompanyGstNumber(customGroupAddressModel.getCompanyGstNumber());
			printHeaderModel.setCompanyPanNumber(customGroupAddressModel.getCompanyPanNumber());
			printHeaderModel.setCompanyHelplineNumbers(customGroupAddressModel.getCompanyHelplineNumbers());
			printHeaderModel.setBranchPanNumber(customGroupAddressModel.getBranchPanNumber());

			return printHeaderModel;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}