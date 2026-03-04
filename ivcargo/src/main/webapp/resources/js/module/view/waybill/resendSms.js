define([
  PROJECT_IVUIRESOURCES + '/resources/js/generic/urlparameter.js',
  'JsonUtility',
  'messageUtility',
  'focusnavigation',
  PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
], function (UrlParameter) {
  'use strict';

  let _this = '', waybillId, status, moduleId, wayBillTypeId, billingPartyPhone = null;

  return Marionette.LayoutView.extend({
    initialize: function () {
      _this = this;
      this.$el.html(this.template);
      waybillId = UrlParameter.getModuleNameFromParam('waybillId');
    },

    render: function () {
      let jsonObject = {
        waybillId: waybillId
      };
      showLayer();
      getJSON(jsonObject, WEB_SERVICE_URL + '/sendSmsWS/getSmsConfigProperties.do', _this.handlePermissionResponse, EXECUTE_WITH_ERROR);
    },

    handlePermissionResponse: function (response) {
      let loadelement = new Array();
      let baseHtml = new $.Deferred();
      loadelement.push(baseHtml);
      $("#mainContent").load("/ivcargo/html/module/waybill/resendSms/resendSms.html", function () {
        baseHtml.resolve();
      });

      $.when.apply($, loadelement).done(function () {
        hideLayer();

        moduleId = response.moduleId;

        let $recipientsRow = $('#recipients-row'),
          $consignor	= $('#consignor-container'),
          $consignee	= $('#consignee-container'),
          $billingParty	= $('#billingparty-container'),
          $sendBtn		= $('#resendMessageBtn');

        if (response.message && response.message.type === MESSAGE_TYPE_ERROR) {
          showAlertMessage(response.message.typeName, response.message.description);
          $recipientsRow.addClass('hide');
          $sendBtn.addClass('hide');
          return;
        }

        let consignorAllowed	= response.isSmsSendAllowForConsignor;
        let consigneeAllowed	= response.isSmsSendAllowForConsignee;
        let billingPartyAllowed = response.isSmsSendAllowForBilling;

        $recipientsRow.removeClass('hide');
        $consignor.toggleClass('hide', !consignorAllowed);
        $consignee.toggleClass('hide', !consigneeAllowed);
        $billingParty.toggleClass('hide', !billingPartyAllowed);

        $sendBtn.removeClass('hide');

        $sendBtn.off('click').on('click', function () {
          _this.showSmsConfirmModal();
        });
      });
    },

    showSmsConfirmModal: function () {
      let consignorChecked = $('#consignorCheckbox').is(':checked');
      let consigneeChecked = $('#consigneeCheckbox').is(':checked');
      let billingChecked = $('#billingPartyCheckbox').is(':checked');

      let hasSelection =
        ($('#consignor-container').is(':visible') && consignorChecked) ||
        ($('#consignee-container').is(':visible') && consigneeChecked) ||
        ($('#billingparty-container').is(':visible') && billingChecked);

      if (!hasSelection) {
        showAlertMessage('info', 'Select at least one recipient for SMS.');
        return;
      }

      new Backbone.BootstrapModal({
        content: 'Send SMS to selected recipients?',
        title: 'Confirm SMS',
        okText: 'Send',
        showFooter: true
      }).open().on('ok', () => this.submitSms());
    },

    submitSms: function () {
      let payload = {
        moduleId: moduleId,
        waybillId: waybillId,
        isConsignor: $('#consignorCheckbox').is(':checked'),
        isConsignee: $('#consigneeCheckbox').is(':checked'),
        isBillingParty: $('#billingPartyCheckbox').is(':checked'),
      };
      showLayer();
      getJSON(payload, WEB_SERVICE_URL + '/sendSmsWS/sendSms.do', _this.handleAfterSubmission, EXECUTE_WITH_ERROR);
    },

    handleAfterSubmission: function (response) {
      if (response.message && response.message.type === MESSAGE_TYPE_SUCCESS) {
		  setTimeout(() => {
			hideLayer();
			window.close();
		  }, 1000);
      }
    }
  });
});
