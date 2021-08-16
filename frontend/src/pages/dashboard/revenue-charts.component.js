import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Row, Col, Card, Carousel } from 'antd';

import DailyCollectionChart from './revenue-chart-daily-collection.component';
import NewConnectionChart from './revenue-chart-newConnection.component';
import ReadingsChart from './revenue-chart-meterReading.component';
import ConnectionsChart from './revenue-chart-connections.component';
import RevenueTotalList from './revenue-list.component';
import RevenueChartGauge from './revenue-chart-gauge.component';
import RevenueTargetChart from './revenue-chart-target.component';

import {
    selectLoading
} from '../../redux/dashboard/dashboard.selectors';

const RevenueCharts = props => {
    const { loading } = props;
    return (
        <Row >
            <Row gutter={16} type="flex">
                <Col xl={{ span: 16 }} xs={{ span: 24 }}>
                    <Card
                        title={<span>Daily Collection <sub style={{ fontStyle: 'italic', float: 'right' }}>( All Revenue )</sub></span>}
                        hoverable
                        loading={loading}
                        className="mi-revenue-table__chart-card"
                    >
                        <DailyCollectionChart />
                    </Card>
                </Col>
                <Col xl={{ span: 8 }} xs={{ span: 24 }}>
                    <Carousel
                        className="mi-revenue-table__carousel mi-revenue-table__carousel--right"
                        autoplay
                        autoplaySpeed={13000}
                        pauseOnHover={true}
                        fade={true}
                        easing="easein">
                        <Card
                            title={<span>Collection Rate <sub style={{ fontStyle: 'italic', float: 'right' }}>( Tsh )</sub></span>}
                            hoverable
                            loading={loading}
                            className="mi-revenue-table__chart-card mi-revenue-table__chart-card__rate"
                        >
                            <RevenueChartGauge />
                        </Card>
                        <Card
                            title={<span>New Connetion <sub style={{ fontStyle: 'italic', float: 'right' }}>( Collection Daily )</sub></span>}
                            hoverable
                            loading={loading}
                            className="mi-revenue-table__chart-card"
                        >
                            <NewConnectionChart />
                        </Card>
                        <Card
                            title={<span>Connection <sub style={{ fontStyle: 'italic', float: 'right' }}>( Activities )</sub></span>}
                            hoverable
                            loading={loading}
                            className="mi-revenue-table__chart-card"
                        >
                            <ConnectionsChart />
                        </Card>
                    </Carousel>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '2rem' }}>
                <Col xl={{ span: 16 }} xs={{ span: 24 }}>
                    <Card
                        title={<span>Meter Reading <sub style={{ fontStyle: 'italic', float: 'right' }}>( Consumptions )</sub></span>}
                        hoverable
                        loading={loading}
                        className="mi-revenue-table__chart-card"
                    >
                        <ReadingsChart />
                    </Card>
                </Col>
                <Col xl={{ span: 8 }} xs={{ span: 24 }}>
                    <Carousel
                        className="mi-revenue-table__carousel mi-revenue-table__carousel--right mi-revenue-table__carousel--target"
                        autoplay
                        autoplaySpeed={20000}
                        pauseOnHover={true}
                        fade={true}
                        easing="easein">
                        <Card
                            title={<span>Target Revenue <sub style={{ fontStyle: 'italic', float: 'right' }}>( Financial Year )</sub></span>}
                            hoverable
                            loading={loading}
                            className="mi-revenue-table__chart-card"
                        >
                            <RevenueTargetChart />
                        </Card>
                        <Card
                            title={<span>Revenue <sub style={{ fontStyle: 'italic', float: 'right' }}>( This month )</sub></span>}
                            hoverable
                            loading={loading}
                            className="mi-revenue-table__chart-card"
                        >
                            <RevenueTotalList />
                        </Card>
                    </Carousel>
                </Col>
            </Row>
        </Row>
    )
}

const mapStateToProps = createStructuredSelector({
    loading: selectLoading
})

export default connect(mapStateToProps)(RevenueCharts);