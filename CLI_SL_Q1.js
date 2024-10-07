/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(["N/currentRecord", "N/url", "N/format", "N/https"], function (currentRecord, url, format, https) {

    var invoiceArray = [];

    function fieldChanged(scriptContext) {
        var current_record = scriptContext.currentRecord;

        // Handle field change for customer name, transaction date, or invoice ID
        if (scriptContext.fieldId === "custpage_custname" || scriptContext.fieldId === "custpage_transactiondate" || scriptContext.fieldId === "custpage_invid") {
            var customerId = current_record.getValue("custpage_custname");
            var transactionDate = current_record.getValue("custpage_transactiondate");
            var invoiceId = current_record.getValue("custpage_invid");

            var tranDate = null;
            if (transactionDate) {
                tranDate = format.format({
                    value: transactionDate,
                    type: format.Type.DATE,
                });
            }

            //alert("Transaction date: " + tranDate);

            if (customerId || tranDate || invoiceId) {
                var suiteletUrl = url.resolveScript({
                    scriptId: "customscript_sl_techassign_q1",
                    deploymentId: "customdeploy_sl_techassign_q1",
                    params: {
                        custpage_custname: customerId, // Passed the selected customer ID as a parameter
                        custpage_transactiondate: tranDate,
                        custpage_invid: invoiceId
                    }
                });
                // Redirect to the Suitelet URL to refresh the page with the customer filter applied
                window.location.href = suiteletUrl;
            }
        }


        if (scriptContext.fieldId === 'custpage_checkbox' && scriptContext.sublistId === 'custpage_sublist') {
            var noOfLine = current_record.getLineCount({ sublistId: 'custpage_sublist' });
            //alert('no of line ', noOfLine)
            for (var i = 0; i < noOfLine; i++) {
                var isChecked = current_record.getSublistValue({
                    sublistId: 'custpage_sublist',
                    fieldId: 'custpage_checkbox',
                    line: i
                });

                if (isChecked == true) {
                    var selectedInvoiceInternalId = current_record.getSublistValue({
                        sublistId: 'custpage_sublist',
                        fieldId: 'custpage_invinternalid',
                        line: i,
                    });
                    invoiceArray.push(selectedInvoiceInternalId)
                }
            }
        }
    }

    function getMails() {
        if (invoiceArray.length > 0) {
            alert('invoice array length : ' + invoiceArray.length + '  Selected Invoice IDs: ' + invoiceArray.join(", "));

            var invoiceParam = JSON.stringify(invoiceArray);

            var suiteletUrl = url.resolveScript({
                scriptId: "customscript_sl_techassign_q1",
                deploymentId: "customdeploy_sl_techassign_q1",
                params: {
                    custpage_invoices: invoiceParam // passed invoice array as string
                }
            })

            window.location.href = suiteletUrl

        } else {
            alert('No invoices selected.');
        }
    }

    

    return {
        fieldChanged: fieldChanged,
        getMails: getMails
    };
});
