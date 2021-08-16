import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { format } from 'd3-format';
import { Statistic, Row, Col, Icon, Popover } from 'antd';

import {
    selectAllRevenueTotal
} from '../../redux/dashboard/dashboard.selectors';

const RevenueTotalList = props => {
    const { revenueTotalList } = props;
    //console.log('Revenue Total List: ', revenueTotalList);
    return (
        <Row gutter={32} className="mi-revenue-list">
            {revenueTotalList.revenueTotal.sort((a,b)=> a.revenue < b.revenue ? 1 : a.revenue > b.revenue ? -1 : 0).slice(0,8)
            .map((data, index) => {
                const { revenue, collections, ref_collections } = data
                const projection = ref_collections > 0 ? ((collections / ref_collections) * 100) - 100 : (collections > 0 ? 100 : 0);
                return (
                    <Col key={index} span={12}>
                        <div className="mi-revenue-list__statistic-container">
                        <Statistic
                            className="mi-revenue-list__statistic"
                            title={<span>{revenue}</span>}
                            value={collections}
                            precision={0}
                        />
                        {!(projection === 0 && collections === 0) &&
                            <Statistic
                                value={Math.abs(projection)}
                                precision={1}
                                suffix={<Popover content={format(',')(collections - ref_collections)}>%</Popover>}
                                className="mi-revenue-list__statistic--sub"
                                valueStyle={{ color: ((projection > 0 || (projection === 0 && collections > 0)) ? '#3f8600' : '#cf1322') }}
                                prefix={(projection > 0 || (projection === 0 && collections > 0)) ? <Icon type="arrow-up" /> : <Icon type="arrow-down" />}
                            />
                        }
                        </div>
                    </Col>
                )
            })}
        </Row>
    )
}

const mapStateToProps = createStructuredSelector({
    revenueTotalList: selectAllRevenueTotal
});

export default connect(mapStateToProps)(RevenueTotalList);