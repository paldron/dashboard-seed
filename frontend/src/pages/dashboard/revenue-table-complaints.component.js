import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { format } from 'd3-format';
import { Table, Statistic, Icon, Popover } from 'antd';

import {
    selectComplaintsTable, selectLoading
} from '../../redux/dashboard/dashboard.selectors';

const columns = [
    {
        title: 'COMPLAINTS',
        dataIndex: 'complaint',
        key: 'complaint',
        width: 170,
        fixed: 'left',
        className: 'mi-complaint-title'
    },
    {
        title: 'Unattended',
        dataIndex: 'unattended',
        key: 'unattended',
        //width: 170
    },
    {
        title: 'In Progress',
        dataIndex: 'in_progress',
        key: 'in_progress',
        //width: 170
    },
    {
        title: 'Resolved',
        dataIndex: 'resolved',
        key: 'resolved',
        //width: 170
    },
    {
        title: 'Total',
        //dataIndex: 'resolved',
        key: 'total',
        render: (text, record) => {
            let totalComp = record.resolved + record.in_progress + record.unattended;
            return (
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Statistic
                        value={totalComp}
                        precision={0}
                        className="mi-statistic__projection"

                    />
                </div>
            )
        }
        //width: 170
    },
    {
        title: 'Last Month',
        dataIndex: 'resolved',
        key: 'last_comp',
        render: (text, record) => {
            let totalCompRef = record.ref_resolved + record.ref_in_progress + record.ref_unattended;
            return (
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Statistic
                        value={totalCompRef}
                        precision={0}
                        className="mi-statistic__projection"

                    />
                </div>
            )
        }
        //width: 170
    },
    {
        title: 'Projection',
        //dataIndex: 'resolved',
        key: 'projections',
        render: (text, record) => {
            let totalComp = record.resolved + record.in_progress + record.unattended;
            let totalCompRef = record.ref_resolved + record.ref_in_progress + record.ref_unattended;
            let projection = totalCompRef > 0 ? ((totalComp / totalCompRef) * 100) - 100 : (totalComp > 0 ? 100 : 0);
            return (
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    {!(projection === 0 && totalComp === 0) &&
                        <Statistic
                            value={Math.abs(projection)}
                            precision={0}
                            suffix={<Popover content={format(',')(totalComp - totalCompRef)}>%</Popover>}
                            className="mi-statistic__projection mi-statistic__projection--inner"
                            valueStyle={{ color: ((projection > 0 || (projection === 0 && totalComp > 0)) ? '#cf1322' : '#3f8600' ) }}
                            prefix={(projection > 0 || (projection === 0 && totalComp > 0)) ? projection === 0 ? <Icon type="frown" style={{color: 'black'}} /> : <Icon type="arrow-up" /> : <Icon type="arrow-down" />}
                        />
                    }
                </div>
            )
        }
        //width: 170
    },
]

const ComplaintsTable = props => {
    const { complaintsData, loading } = props;
    
    return (
        <Table
            columns={columns}
            dataSource={complaintsData}
            bordered
            size="middle"
            loading={loading}
            pagination={{ pageSize: 7 }}
            expandRowByClick={true}
            className="mi-revenue-table"
            scroll={{x: 'max-content'}}
        />
    )
}

const mapStateToProps = createStructuredSelector({
    complaintsData: selectComplaintsTable,
    loading: selectLoading
});

export default connect(mapStateToProps)(ComplaintsTable);