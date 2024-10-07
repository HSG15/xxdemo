/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/email', 'N/render', 'N/file', 'N/log', 'N/runtime'], function (record, email, render, file, log, runtime) {
 
    function getInputData(inputContext) {
 
        var jsonData = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_data' }));
        log.debug('Data in map-Reduce', jsonData)
        return jsonData;
    }
 
    function map(mapContext) {
        var valueData = JSON.parse(mapContext.value);
        log.debug('Inside Map Function')
        log.debug('Value data', valueData)
        var customerid= valueData.entity;
        var internalid= valueData.internalid;
 
        log.debug('After getting data')
 
        mapContext.write({ key: customerid, value: internalid });
        log.debug('Going out of Map Function')
    }
 
    function reduce(reduceContext) {
        var entity = reduceContext.key;
        var internalid = reduceContext.values;
        log.debug('Going Inside of reduce Function')
        var custemail = record.load({
            type: record.Type.CUSTOMER,
            id: parseInt(entity)
        }).getValue({ fieldId: 'email' });
 
        log.debug("custemail",custemail)
 
        if (custemail) {
 
            var attachmentfile = [];
            for (var index = 0; index < internalid.length; index++) {
                log.debug('Inside loop')
                var pdf = render.transaction({
                    entityId: parseInt(internalid[index]),
                    printMode: render.PrintMode.PDF,
                });
                log.debug('file.obj', pdf);
                // var pdffileId = pdf.save();
                // log.debug('pdf id ', pdffileId);
 
                // // var fileObj = file.load({id: pdf}).isOnline = true;
                // // var finalPDF = fileObj.save();
                // // log.debug('Final PDF', finalPDF);
 
                // var fileObj = file.load({
                //     id: parseInt(pdffileId)
                // });
                // fileObj.isOnline = true;
                // var fileId = fileObj.save();
                // log.debug('pdf id 2', fileId);
 
                // // var fileObj2 = file.load({
                // //     id: parseInt(pdffileId)
                // // });
 
                // // log.debug('pdf id 3', fileObj2);
 
                attachmentfile.push(pdf);
 
            }
 
            log.debug('Attachment', attachmentfile)
            try {
                email.send({
                    author: '-5',
                    recipients: custemail,
                    subject: 'Invoices',
                    body: 'Invoices of the customer are as follows',
                    attachment: attachmentfile
                });
                log.debug('Email Send')
            }
            catch (e) {
                log.debug('Email not send')
            }
        }
    }
 
    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce
    };
});