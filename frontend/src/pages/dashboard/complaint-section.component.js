import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Row, Col, Card } from 'antd';

import ComplaintsTable from './revenue-table-complaints.component';
import ComplaintChart from './complaint-chart.component';
import ComplaintDonutStatus from './complaint-donut-status.component';
import ComplaintDonutList from './complaint-donut-list.component';

import {
    selectLoading
} from '../../redux/dashboard/dashboard.selectors';

const ComplaintSection = props => {
    const { loading } = props;
    return (
        <Row>
            <Row gutter={16}>
                <Col xl={{ span: 16 }} xs={{ span: 24 }}>
                    <ComplaintsTable />
                </Col>
                <Col xl={{ span: 8 }} xs={{ span: 24 }}>
                    <Card
                        title={<span>Complaints <sub style={{ fontStyle: 'italic', float: 'right' }}>( Month )</sub></span>}
                        hoverable
                        loading={loading}
                        className="mi-revenue-table__chart-card mi-revenue-table__chart-card__status"
                    >
                        <ComplaintDonutList />
                    </Card>

                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '2rem' }}>
                <Col xl={{ span: 16 }} xs={{ span: 24 }}>
                    <Card
                        title={<span>Complaints <sub style={{ fontStyle: 'italic', float: 'right' }}>( Daily )</sub></span>}
                        hoverable
                        loading={loading}
                        className="mi-revenue-table__chart-card"
                    >
                        <ComplaintChart />
                    </Card>
                </Col>
                <Col xl={{ span: 8 }} xs={{ span: 24 }}>
                    <Card
                        title={<span>Status <sub style={{ fontStyle: 'italic', float: 'right' }}>( Month )</sub></span>}
                        hoverable
                        loading={loading}
                        className="mi-revenue-table__chart-card mi-revenue-table__chart-card__status"
                    >
                        <ComplaintDonutStatus />
                    </Card>
                </Col>
            </Row>
        </Row>
    )
}

const mapStateToProps = createStructuredSelector({
    loading: selectLoading
})

export default connect(mapStateToProps)(ComplaintSection);