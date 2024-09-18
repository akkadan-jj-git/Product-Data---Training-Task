/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/currentRecord'],

function(url, currentRecord) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        window.onbeforeunload = null;
    }

    function fetchProducts(){
        try{
            let fields = currentRecord.get();
            let sdate = fields.getText({fieldId: 'custpage_startddate'});
            let edate = fields.getText({fieldId: 'custpage_endddate'});
            let low = fields.getText({fieldId: 'custpage_lowcheck'});
            if(sdate && edate && low){
                let suiteletUrl = url.resolveScript({
                    scriptId: 'customscript_jj_sl_product_stock_data',
                    deploymentId: 'customdeploy_jj_sl_product_stock_data',
                    params: {
                        cb: low,
                        s: sdate,
                        e: edate
                    }
                });
                window.location.href = suiteletUrl;
            }
        }
        catch(e){
            log.debug('Error@fetchProducts', e.message + '\n' + e.stack);
        }
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        try{
            let fieldId = scriptContext.fieldId;

            if (fieldId === 'custpage_lowcheck' || fieldId === 'custpage_highcheck') {
                let checkbox1 = scriptContext.currentRecord.getValue({
                    fieldId: 'custpage_lowcheck'
                });
                let checkbox2 = scriptContext.currentRecord.getValue({
                    fieldId: 'custpage_highcheck'
                });

                if (checkbox1 && checkbox2) {
                    if (fieldId === 'custpage_lowcheck') {
                        scriptContext.currentRecord.setValue({
                            fieldId: 'custpage_highcheck',
                            value: false
                        });
                    } else if (fieldId === 'custpage_highcheck') {
                        scriptContext.currentRecord.setValue({
                            fieldId: 'custpage_lowcheck',
                            value: false
                        });
                    }
                }
            }
        }
        catch(e){
            log.debug('Error@fieldChanged', e.message + '\n' + e.stack);
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        fetchProducts: fetchProducts
    };
    
});
