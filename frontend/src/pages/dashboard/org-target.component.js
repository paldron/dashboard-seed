import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { format } from 'd3-format';
import { Statistic, Icon, Card, Popover } from 'antd';

import { selectReducedRevenueTotal } from '../../redux/dashboard/dashboard.selectors';
import { selectRevenueKPI, selectOtherTargets, selectLoading } from '../../redux/organization/org.selectors';

const OrgTargetList = props => {
    //console.log("Target KPIs: ", props);
    const { revenueKPI, revenueTotal, otherTargets, loading } = props;
    const { water_only } = revenueTotal;
    const { bill, collection, targetBill, targetCollection, financialYear } = revenueKPI;
    const totalCollection = isNaN(water_only + collection) ? 0 : water_only + collection;
    const projectionCollection = targetCollection > 0 ? ((totalCollection / targetCollection) * 100) - 100 : (totalCollection > 0 ? 100 : 0);
    const projectionBill = targetBill > 0 ? ((bill / targetBill) * 100) - 100 : (bill > 0 ? 100 : 0);
    const NRW = 20.36;
    const projectionNRW = otherTargets.N > 0 ? ((NRW / otherTargets.N) * 100) - 100 : 100;
    return (
        <Card
            className="mi-org-target__card"
            title={financialYear}
            hoverable
            loading={loading}
            
        >
            <div className="mi-org-target__card--subtitle">
                Current Status
            </div>
            <div className="mi-org-target__statistic">
                <Statistic
                    value={format('.2~s')(targetBill).replace(/G/, 'B')}
                    precision={0}
                    title="Bill"
                />
                {!(projectionBill === 0 && bill === 0) &&
                    <Statistic
                        value={Math.abs(projectionBill)}
                        precision={1}
                        suffix={<Popover content={format('.2~s')(bill - targetBill).replace(/G/, 'B')}>%</Popover>}
                        className="mi-org-target__statistic--sub"
                        valueStyle={{ color: ((projectionBill > 0 || (projectionBill === 0 && bill > 0)) ? '#3f8600' : '#cf1322') }}
                        prefix={(projectionBill > 0 || (projectionBill === 0 && bill > 0)) ? <Icon type="rise" /> : <Icon type="fall" />}
                    />
                }
            </div>
            <div className="mi-org-target__statistic">
                <Statistic
                    value={format('.2~s')(targetCollection).replace(/G/, 'B')}
                    precision={0}
                    title="Collection"
                />
                {!(projectionCollection === 0 && totalCollection === 0) &&
                    <Statistic
                        value={Math.abs(projectionCollection)}
                        precision={1}
                        suffix={<Popover content={format('.2~s')(totalCollection - targetCollection).replace(/G/, 'B')}>%</Popover>}
                        className="mi-org-target__statistic--sub"
                        valueStyle={{ color: ((projectionCollection > 0 || (projectionCollection === 0 && totalCollection > 0)) ? '#3f8600' : '#cf1322') }}
                        prefix={(projectionCollection > 0 || (projectionCollection === 0 && totalCollection > 0)) ? <Icon type="rise" /> : <Icon type="fall" />}
                    />
                }
            </div>
            <div className="mi-org-target__statistic">
                <Statistic
                    value={format('.2~s')(otherTargets.N)}
                    precision={0}
                    title="NRW"
                />
                {!(projectionNRW === 0) &&
                    <Statistic
                        value={Math.abs(projectionNRW)}
                        precision={1}
                        suffix="%"
                        className="mi-org-target__statistic--sub"
                        valueStyle={{ color: ((projectionNRW > NRW) ? '#3f8600' : '#cf1322') }}
                        prefix={(projectionNRW > NRW) ? <Icon type="arrow-down" /> : <Icon type="arrow-up" />}
                    />
                }
            </div>
        </Card>
    )
}

const mapStateToProps = createStructuredSelector({
    revenueKPI: selectRevenueKPI,
    revenueTotal: selectReducedRevenueTotal,
    otherTargets: selectOtherTargets,
    loading: selectLoading
});

export default connect(mapStateToProps)(OrgTargetList);