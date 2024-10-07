    /**
    * @NApiVersion 2.x
    * @NScriptType Suitelet
    */

    define(['N/ui/serverWidget', 'N/search', 'N/log'], function (serverWidget, search, log) {

        function onRequest(scriptContext) {
            if (scriptContext.request.method === 'GET') {
                var form = serverWidget.createForm({
                    title: 'CUSTOMER INVOICE'
                })

                var customerId = scriptContext.request.parameters.custpage_custname
                var transactionDate = scriptContext.request.parameters.custpage_transactiondate
                var invoiceId = scriptContext.request.parameters.custpage_invid

                var invoiceArrayParam = scriptContext.request.parameters.custpage_invoices
                var invoiceArray = invoiceArrayParam ? invoiceArrayParam : []
                // var invoiceArray = []
                // if(invoiceArrayParam){
                //     invoiceArray = invoiceArrayParam
                // }
                log.debug('Received Invoice Array', invoiceArray);


                var custField = form.addField({
                    id: 'custpage_custname',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Customer Name',
                    source: 'customer'
                })

                if (customerId) {
                    custField.defaultValue = customerId
                }

                var invField = form.addField({
                    id: 'custpage_inv',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Invoice Id'
                })

                if(invoiceId){
                    invField.defaultValue = invoiceId
                }

                var dateField = form.addField({
                    id: 'custpage_transactiondate',
                    type: serverWidget.FieldType.DATE,
                    label: 'Transaction Date'
                })

                if(transactionDate){
                    dateField.defaultValue = transactionDate
                }

                var sublist = form.addSublist({
                    id: 'custpage_sublist',
                    type: serverWidget.SublistType.LIST,
                    label: 'Invoices'
                })

                sublist.addField({
                    id: 'custpage_checkbox',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'select'
                })

                sublist.addField({
                    id: 'custpage_invid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Invoice ID'
                })

                sublist.addField({
                    id: 'custpage_invinternalid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Invoice Internal ID'
                })

                sublist.addField({
                    id: 'custpage_invdate',
                    type: serverWidget.FieldType.DATE,
                    label: 'Invoice Date'
                })

                sublist.addField({
                    id: 'custpage_invototal',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Total Amount'
                })

                var Sendemail = form.addButton({
                    id: 'custpage_refresh',
                    label: 'Send Email',
                    functionName: 'getMails()'
                })

                form.clientScriptModulePath = 'SuiteScripts/CLI_SL_Q1.js'

                // log.debug('Selected Customer ID', customerId)
                // log.debug('Selected Date is ', transactionDate)

                var myFilters = []
                if(customerId){
                    myFilters.push(['entity', 'anyof', customerId])
                }
                if(transactionDate){
                    myFilters.push('AND', ['trandate', 'on', transactionDate])
                }
                if(invoiceId){
                    myFilters.push('AND', ['tranid', 'is', invoiceId])
                }
                if (customerId || transactionDate || invoiceId) {
                    try {
                        var invoiceSearch = search.create({
                            type: 'invoice',
                            filters: myFilters,
                            columns: [
                                { name: 'tranid', summary: search.Summary.GROUP },
                                { name: 'internalid', summary: search.Summary.GROUP},
                                { name: 'trandate', summary: search.Summary.GROUP },
                                { name: 'total', summary: search.Summary.SUM }
                            ]
                        })

                        var i = 0

                        invoiceSearch.run().each(function (result) {
                            sublist.setSublistValue({
                                id: 'custpage_invid',
                                line: i,
                                value: result.getValue({ name: 'tranid', summary: search.Summary.GROUP })
                            })

                            sublist.setSublistValue({
                                id: 'custpage_invinternalid',
                                line: i,
                                value: result.getValue({ name: 'internalid', summary: search.Summary.GROUP })
                            })

                            sublist.setSublistValue({
                                id: 'custpage_invdate',
                                line: i,
                                value: result.getValue({ name: 'trandate', summary: search.Summary.GROUP })
                            })

                            sublist.setSublistValue({
                                id: 'custpage_invototal',
                                line: i,
                                value: result.getValue({ name: 'total', summary: search.Summary.SUM })
                            })
                            i++
                            return true
                        })

                    } catch (error) {
                        log.error('Error is ', error)
                        throw error
                    }
                }
                scriptContext.response.writePage(form)
            }
        }
        return {
            onRequest: onRequest
        }

    }) 
