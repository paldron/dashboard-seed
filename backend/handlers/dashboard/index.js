const revenue = require('./revenueCollection');
const saRecords = require('./saRecords');
const customerInfo = require('./customerInfo')
module.exports.revenueCollection = revenue.revenueCollection;
module.exports.saReadings = saRecords.saReadings;
module.exports.customerInfo = customerInfo.customerInfo;