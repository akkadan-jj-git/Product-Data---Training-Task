/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/email', 'N/record', 'N/search'],
    /**
 * @param{email} email
 * @param{record} record
 * @param{search} search
 */
    (serverWidget, email, record, search) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try{
                if(scriptContext.request.method === 'GET'){
                    let form = serverWidget.createForm({
                        title: 'Product Stock Date'
                    });
                    form.clientScriptFileId = 4050;
                    let group1 = form.addFieldGroup({
                        id: 'custpage_fieldgroup1',
                        label: 'Filter'
                    });
                    let stdate = form.addField({
                        id: 'custpage_startddate',
                        label: 'Start Date',
                        type: serverWidget.FieldType.DATE,
                        container: 'custpage_fieldgroup1'
                    });
                    stdate.setHelpText({help: "Mandatory field to specify the beginning of the date range."});
                    stdate.isMandatory = true;
                    let eddate = form.addField({
                        id: 'custpage_endddate',
                        label: 'End Date',
                        type: serverWidget.FieldType.DATE,
                        container: 'custpage_fieldgroup1'
                    });
                    eddate.setHelpText({help: "Mandatory field to specify the end of the date range."});
                    eddate.isMandatory = true;
                    let low = form.addField({
                        id: 'custpage_lowcheck',
                        label: 'Low Stock Products',
                        type: serverWidget.FieldType.CHECKBOX,
                        container: 'custpage_fieldgroup1'
                    });
                    low.setHelpText({help: "Filter to show products with stock levels below 10, within the date range."});
                    let high = form.addField({
                        id: 'custpage_highcheck',
                        label: 'High Stock Products',
                        type: serverWidget.FieldType.CHECKBOX,
                        container: 'custpage_fieldgroup1'
                    });
                    high.setHelpText({help: "Filter to show products with stock levels above 10, within the date range."});
                    let find = form.addButton({id: 'custpage_finddata',label: 'Fetch Data',functionName: 'fetchProducts'});
                    let subList = form.addSublist({id: 'custpage_sublist1',label: 'Results',type: serverWidget.SublistType.LIST});
                    subList.addField({id: 'custpage_internalid',label: 'Internal Id',type: serverWidget.FieldType.INTEGER});
                    subList.addField({id: 'custpage_name',label: 'Product Name',type: serverWidget.FieldType.TEXT});
                    subList.addField({id: 'custpage_stocklevel',label: 'Stock Level',type: serverWidget.FieldType.INTEGER});
                    subList.addField({id: 'custpage_lastpurchasedate',label: 'Last Purchase Date',type: serverWidget.FieldType.DATE});
                    subList.addField({id: 'custpage_select',label: 'Select',type: serverWidget.FieldType.CHECKBOX});
                    // Set values for the subList
                    let passedreq = scriptContext.request.parameters.cb;
                    let passedsdate = scriptContext.request.parameters.s;
                    let passededate = scriptContext.request.parameters.e;
                    if(passedreq){
                        let filter = [
                            ["transaction.type", "anyof", "PurchOrd"], "AND", 
                            ["transaction.mainline", "is", "F"], "AND", 
                            ["transaction.trandate", "within", passedsdate, passededate]
                        ]
                        if(passedreq === 'T'){filter.push("AND", ["sum(quantityavailable)", "lessthanorequalto", "500"]);}
                        else{filter.push('AND', ["sum(quantityavailable)", 'greaterthanorequalto', "500"]);}
                        log.debug('Filter', filter);
                        let itemSearch = search.create({
                            type: search.Type.ITEM,
                            filters: filter,
                            columns: [
                                search.createColumn({ name: "itemid", summary: "GROUP", label: "Name" }),
                                search.createColumn({ name: "internalid", summary: "GROUP", label: "Internal ID" }),
                                search.createColumn({ name: "trandate", join: "transaction", summary: "MAX", label: "Date" }),
                                search.createColumn({ name: "quantityavailable", summary: "SUM", label: "Available" }),
                                search.createColumn({ name: "quantityonhand", summary: "SUM", label: "On Hand" })
                             ]
                        })
                        let searchResult = itemSearch.run().getRange({
                            start: 0,
                            end: 1000
                        });
                        log.debug('Result Length', searchResult);
                        for(let i = 0; i < searchResult.length; i++){
                            let id = searchResult[i].getValue({name: 'internalid', summary: 'GROUP', label: "Internal ID"});
                            let name = searchResult[i].getValue({name: 'itemid', summary: 'GROUP', label: "Name"});
                            let stock = searchResult[i].getValue({name: 'quantityavailable', summary: 'SUM', label: "Available"});
                            let date = searchResult[i].getValue({name: "trandate", join: "transaction", summary: "MAX", label: "Date"});
                            // log.debug('id', id);
                            // log.debug('name', name);
                            // log.debug('stock', stock);
                            // log.debug('date', date);
                            subList.setSublistValue({ id: 'custpage_internalid', line: i, value: id });
                            subList.setSublistValue({ id: 'custpage_name', line: i, value: name });
                            subList.setSublistValue({ id: 'custpage_stocklevel', line: i, value: stock });
                            subList.setSublistValue({ id: 'custpage_lastpurchasedate', line: i, value: date });
                        }
                    }
                    scriptContext.response.writePage(form);
                }
            }
            catch(e){
                log.debug('Error@onRequest', e.message + e.stack);
            }
        }
        return {onRequest}
    });