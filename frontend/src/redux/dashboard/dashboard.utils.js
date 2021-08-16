import moment from 'moment';

const row = {
    location: '',
    customer_count: 0,
    customer_active: 0,
    customer_inactive: 0,
    transactions_sales: 0,
    collection_sales: 0,
    collection_projection: 0,
    collection_sales_target: 0,
    recon_req: 0,
    recon_collection: 0,
    recon_projection: 0,
    connection_count: 0,
    connection_water_collection: 0,
    connection_water_projection: 0,
    connection_sewer_collection: 0,
    connection_sewer_projection: 0,
    connection_target: 0,
    sa: 0,
    current_readings: 0,
    proj_readings: 0,
    current_cons: 0,
    previous_cons: 0,
    proj_previous_cons: 0,
    previous_due: 0
}

export const groupToZoneRevenue = revenue => {
    let retVal = {};
    Object.keys(revenue).forEach(revKey => {
        let tempVal = revenue[revKey].reduce((revAcc, data) => {
            let dataKey = `${data.zone}_${data.street}`;
            if (revAcc[dataKey]) {
                let tempData = Object.keys(revAcc[dataKey]) // Get accoumulator (Row) key
                    .reduce((accR, keyR) => ({ // Cycle through with key to extract summation
                        ...accR,
                        [keyR]: accR[keyR] + data[keyR]
                    }), revAcc[dataKey]);
                return { ...revAcc, [dataKey]: tempData };
            } else {
                const { trans_date, zone, street, ...zoneData } = data;
                return { ...revAcc, [dataKey]: zoneData }
            }
        }, {});
        retVal[revKey] = Object.keys(tempVal).map(zoneKey => {
            const [zone, street] = zoneKey.split('_');
            return {
                ...tempVal[zoneKey],
                zone,
                street
            }
        });
    });
    //console.log("Zone structure Revenue: ",retVal);
    return retVal;
}

export const groupToDayRevenue = revenue => {
    let retVal = {};
    Object.keys(revenue).forEach(revKey => {
        let tempVal = revenue[revKey].reduce((revAcc, data) => {
            let dataKey = `${data.trans_date}`;
            if (revAcc[dataKey]) {
                let tempData = Object.keys(revAcc[dataKey]) // Get accoumulator (Row) key
                    .reduce((accR, keyR) => ({ // Cycle through with key to extract summation
                        ...accR,
                        [keyR]: accR[keyR] + data[keyR]
                    }), revAcc[dataKey]);
                return { ...revAcc, [dataKey]: tempData };
            } else {
                const { trans_date, zone, street, revenue, ...dayData } = data;
                return { ...revAcc, [dataKey]: dayData }
            }
        }, {});
        retVal[revKey] = Object.keys(tempVal).map(dateKey => {
            return {
                ...tempVal[dateKey],
                trans_date: dateKey,
                day: moment(dateKey).format('DD')
            }
        });
    });
    //console.log("Day structure Revenue: ",retVal);
    return retVal;
}

export const groupToDayReadings = readings => {
    let retVal = {};
    Object.keys(readings).forEach(revKey => {
        let tempVal = readings[revKey].reduce((revAcc, data) => {
            let dataKey = `${data.read_day}`;
            if (revAcc[dataKey]) {
                let tempData = Object.keys(revAcc[dataKey]) // Get accoumulator (Row) key
                    .reduce((accR, keyR) => ({ // Cycle through with key to extract summation
                        ...accR,
                        [keyR]: accR[keyR] + data[keyR]
                    }), revAcc[dataKey]);
                return { ...revAcc, [dataKey]: tempData };
            } else {
                const { read_day, zone, street, sa_id, ...dayData } = data;
                return { ...revAcc, [dataKey]: dayData }
            }
        }, {});
        retVal[revKey] = Object.keys(tempVal).map(dateKey => {
            return {
                ...tempVal[dateKey],
                read_day: dateKey,
                day: moment(dateKey).format('DD')
            }
        });
    });
    //console.log("Day structure Readings: ",retVal);
    return retVal;
}

export const groupToDayConnections = connections => {
    let retVal = {};
    Object.keys(connections).forEach(revKey => {
        let tempVal = connections[revKey].reduce((revAcc, data) => {
            let dataKey = `${data.con_day}`;
            if (revAcc[dataKey]) {
                let tempData = Object.keys(revAcc[dataKey]) // Get accoumulator (Row) key
                    .reduce((accR, keyR) => ({ // Cycle through with key to extract summation
                        ...accR,
                        [keyR]: accR[keyR] + data[keyR]
                    }), revAcc[dataKey]);
                return { ...revAcc, [dataKey]: tempData };
            } else {
                const { con_day, zone, street, sa_id, ...dayData } = data;
                return { ...revAcc, [dataKey]: dayData }
            }
        }, {});
        retVal[revKey] = Object.keys(tempVal).map(dateKey => {
            return {
                ...tempVal[dateKey],
                con_day: dateKey,
                day: moment(dateKey).format('DD')
            }
        });
    });
    //console.log("Day structure Connections: ", retVal);
    return retVal;
}

export const sortRevenueTable = (revenue, customers, zones) => {

    return zones.map(({ zone }) => {
        let retVal = {
            ...row,
            location: zone,
            key: zone,
            children: []
        }
        retVal.children = customers.filter(loc => loc.zone === zone).map(data => {
            let streetData = {
                ...row,
                location: data.street,
                customer_count: data.active_customers + data.inactive_customers,
                key: `${zone}_${data.street}`,
                connection_count: data.connected_customers,
                sa: (data.sa_id ? data.sa_id : 0),
                current_readings: data.current_readings,
                proj_readings: data.proj_readings,
                current_cons: data.current_cons,
                previous_cons: data.previous_cons,
                proj_previous_cons: data.proj_previous_cons,
                customer_active: data.active_customers,
                customer_inactive: data.inactive_customers
            }
            retVal.customer_count += data.active_customers + data.inactive_customers;
            retVal.connection_count += data.connected_customers;
            retVal.current_readings += data.current_readings;
            retVal.proj_readings += data.proj_readings;
            retVal.current_cons += data.current_cons;
            retVal.previous_cons += data.previous_cons;
            retVal.proj_previous_cons += data.proj_previous_cons;
            retVal.customer_active += data.active_customers;
            retVal.customer_inactive += data.inactive_customers;

            if (!revenue.billCollection) {
                return streetData;
            }

            const billRevenue = revenue.billCollection.find(rev => rev.zone === zone && rev.street === data.street);
            if (!!billRevenue) {
                retVal.transactions_sales += billRevenue.transactions;
                streetData.transactions_sales = billRevenue.transactions;
                retVal.collection_sales += billRevenue.collections;
                streetData.collection_sales = billRevenue.collections;
            }

            const billProjection = revenue.refCollection.find(rev => rev.zone === zone && rev.street === data.street);
            if (!!billProjection) {
                retVal.collection_projection += billProjection.collections;
                streetData.collection_projection = billProjection.collections;
                retVal.previous_due += billProjection.opening * 0.20;
                streetData.previous_due = billProjection.opening * 0.20;
                retVal.collection_sales_target += billProjection.charge + (billProjection.opening * 0.20);
                streetData.collection_sales_target = billProjection.charge + (billProjection.opening * 0.20);
                retVal.recon_projection += billProjection.recon_collections;
                streetData.recon_projection = billProjection.recon_collections;
            }

            const connectionProjection = revenue.connRefCollection.find(rev => rev.zone === zone && rev.street === data.street);
            if (!!connectionProjection) {
                retVal.connection_water_projection += connectionProjection.con_water;
                streetData.connection_water_projection = connectionProjection.con_water;
                retVal.connection_sewer_projection += connectionProjection.con_sewer;
                streetData.connection_sewer_projection = connectionProjection.con_sewer;
            }

            const connectionRevenue = revenue.newConnection.find(rev => rev.zone === zone && rev.street === data.street);
            if (!!connectionRevenue) {
                retVal.connection_water_collection += connectionRevenue.water;
                streetData.connection_water_collection = connectionRevenue.water;
                retVal.connection_sewer_collection += connectionRevenue.sewer;
                streetData.connection_sewer_collection = connectionRevenue.sewer;
            }

            const reconnectionRevenue = revenue.reconCollection.find(rev => rev.zone === zone && rev.street === data.street);
            if (!!reconnectionRevenue) {
                retVal.recon_req += reconnectionRevenue.transactions;
                streetData.recon_req = reconnectionRevenue.transactions;
                retVal.recon_collection += reconnectionRevenue.collections;
                streetData.recon_collection = reconnectionRevenue.collections;
            }

            return streetData;
        });
        return retVal;
    });
}

export const extractSaRevenue = (data, sa) => {
    let streetData = data.reduce((acc, zone) => {
        return [...acc, ...zone.children]
    }, []);
    return sa.filter(s => s.sa_id !== 1169).map(staff => {
        let staffLoc = streetData.filter(street => street.sa === staff.sa_id);
        return {
            location: staff.staff_name.toUpperCase(),
            customer_count: staffLoc.reduce((acc, street) => acc + street.customer_count, 0),
            transactions_sales: staffLoc.reduce((acc, street) => acc + street.transactions_sales, 0),
            collection_sales: staffLoc.reduce((acc, street) => acc + street.collection_sales, 0),
            collection_projection: staffLoc.reduce((acc, street) => acc + street.collection_projection, 0),
            collection_sales_target: staffLoc.reduce((acc, street) => acc + street.collection_sales_target, 0),
            recon_req: staffLoc.reduce((acc, street) => acc + street.recon_req, 0),
            recon_collection: staffLoc.reduce((acc, street) => acc + street.recon_collection, 0),
            recon_projection: staffLoc.reduce((acc, street) => acc + street.recon_projection, 0),
            connection_count: staffLoc.reduce((acc, street) => acc + street.connection_count, 0),
            connection_water_collection: staffLoc.reduce((acc, street) => acc + street.connection_water_collection, 0),
            connection_water_projection: staffLoc.reduce((acc, street) => acc + street.connection_water_projection, 0),
            connection_sewer_collection: staffLoc.reduce((acc, street) => acc + street.connection_sewer_collection, 0),
            connection_sewer_projection: staffLoc.reduce((acc, street) => acc + street.connection_sewer_projection, 0),
            previous_due: staffLoc.reduce((acc, street) => acc + street.previous_due, 0),
            connection_target: 0,
            sa: 0,
            children: staffLoc,
            key: staff.sa_id,
            proj_readings: staffLoc.reduce((acc, street) => acc + street.proj_readings, 0),
            current_cons: staffLoc.reduce((acc, street) => acc + street.current_cons, 0),
            previous_cons: staffLoc.reduce((acc, street) => acc + street.previous_cons, 0),
            proj_previous_cons: staffLoc.reduce((acc, street) => acc + street.proj_previous_cons, 0),
            current_readings: staffLoc.reduce((acc, street) => acc + street.current_readings, 0)
        }
    });
}

export const extractRevenueTableTotal = data => {
    const { location, sa, ...extracts } = row;
    return data.reduce((acc, zone) => {
        return Object.keys(acc)
            .reduce((accR, key) => ({ ...accR, [key]: accR[key] + zone[key] }), acc);
    }, { ...extracts });
}

export const extractAllRevenueTotal = revenue => {
    let retVal = {};
    Object.keys(revenue).forEach(revKey => {
        let tempVal = revenue[revKey].reduce((revAcc, data) => {
            let dataKey = `${data.revenue}`;
            if (revAcc[dataKey]) {
                let tempData = Object.keys(revAcc[dataKey]) // Get accoumulator (Row) key
                    .reduce((accR, keyR) => ({ // Cycle through with key to extract summation
                        ...accR,
                        [keyR]: accR[keyR] + (data[keyR] ? data[keyR] : 0)
                    }), revAcc[dataKey]);
                return { ...revAcc, [dataKey]: tempData };
            } else {
                const { trans_date, revenue, ...dayData } = data;
                return {
                    ...revAcc,
                    [dataKey]: {
                        collections: 0,
                        ref_collections: 0,
                        transactions: 0,
                        ref_transactions: 0,
                        water_only: 0,
                        ...dayData
                    }
                }
            }
        }, {});
        retVal[revKey] = Object.keys(tempVal).map(dateKey => {
            return {
                ...tempVal[dateKey],
                revenue: dateKey
            }
        });
    });
    //console.log("All Revenue Total: ", retVal);
    return retVal;
}

const complaintStructure = {
    resolved: 0,
    ref_resolved: 0,
    in_progress: 0,
    ref_in_progress: 0,
    unattended: 0,
    ref_unattended: 0
}

const complaintSorter = (a,b) => a.complaint > b.complaint ? 1 : a.complaint < b.complaint ? -1 : 0;

export const sortComplaintsTable = complaints => {
    const complaintStructureKeys = Object.keys(complaintStructure);
    let retVal = [], ids = 1;
    let tempData = complaints.reduce((acc, data) => {
        const { complaint, comp_date, zone, street, ...tempComp } = data;
        // const checkData = {...complaintStructure, ...tempComp};
        // if(checkData.resolved === 0 &&
        //     checkData.ref_resolved === 0 &&
        //     checkData.in_progress === 0 &&
        //     checkData.ref_in_progress === 0 &&
        //     checkData.unattended === 0 &&
        //     checkData.ref_unattended === 0)
        //     return acc;

        let compKey = complaint.toUpperCase();
        if (acc[compKey]) {
            complaintStructureKeys.forEach(key => {
                acc[compKey][key] += data[key] ? data[key] : 0;
            });
            let zoneFound = false;
            acc[compKey].children.map(zoneChild => {
                if (zoneChild.complaint === data.zone) {
                    zoneFound = true;
                    complaintStructureKeys.forEach(key => {
                        zoneChild[key] += data[key] ? data[key] : 0;
                    });
                    let streetFound = false;
                    zoneChild.children.map((streetChild) => {
                        if (streetChild.complaint === data.street) {
                            streetFound = true;
                            complaintStructureKeys.forEach(key => {
                                streetChild[key] += data[key] ? data[key] : 0;
                            });
                        }
                        return streetChild;
                    });
                    if (!streetFound) {
                        //const {compaint, comp_date, zone, street, ...tempComp} = data;
                        zoneChild.children.push({
                            ...complaintStructure,
                            ...tempComp,
                            complaint: street,
                            key: street+ids
                        });
                    }
                }
                zoneChild.children = zoneChild.children.sort(complaintSorter);
                return zoneChild;
            });
            if (!zoneFound) {
                //const {compaint, comp_date, zone, street, ...tempComp} = data;
                acc[compKey].children.push({
                    ...complaintStructure,
                    children: [{
                        ...complaintStructure,
                        ...tempComp,
                        complaint: street,
                        key: street+ids
                    }],
                    ...tempComp,
                    complaint: zone,
                    key: zone+ids
                });
            }
        } else {
            //const {complaint, comp_date, zone, street, ...tempComp} = data;
            acc[compKey] = {
                complaint: compKey,
                ...complaintStructure,
                children: [{
                    ...complaintStructure,
                    children: [{
                        ...complaintStructure,
                        ...tempComp,
                        complaint: street,
                        key: street+ids
                    }],
                    ...tempComp,
                    complaint: zone,
                    key: zone+ids
                }],
                ...tempComp,
                key: compKey
            }
        }
        ids++;
        acc[compKey].children = acc[compKey].children.sort(complaintSorter);
        return acc;
    }, {});

    Object.keys(tempData).forEach(key =>{
        retVal.push(tempData[key])
    });

    return retVal.sort(complaintSorter);
}

export const groupToDayComplaints = complaints => {
    let retVal = {};
    Object.keys(complaints).forEach(revKey => {
        let tempVal = complaints[revKey].reduce((revAcc, data) => {
            let dataKey = `${data.comp_date}`;
            if (revAcc[dataKey]) {
                let tempData = Object.keys(revAcc[dataKey]) // Get accoumulator (Row) key
                    .reduce((accR, keyR) => ({ // Cycle through with key to extract summation
                        ...accR,
                        [keyR]: accR[keyR] + data[keyR]
                    }), revAcc[dataKey]);
                return { ...revAcc, [dataKey]: tempData };
            } else {
                const { comp_date, zone, street, complaint, ...dayData } = data;
                return { ...revAcc, [dataKey]: dayData }
            }
        }, {});
        retVal[revKey] = Object.keys(tempVal).map(dateKey => {
            return {
                ...tempVal[dateKey],
                comp_date: dateKey,
                day: moment(dateKey).format('DD')
            }
        });
    });
    //console.log("Day structure Complaint: ", retVal);
    return retVal;
}