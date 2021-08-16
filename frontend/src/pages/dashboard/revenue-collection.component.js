import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { format } from 'd3-format';
import { Table, Statistic, Icon, Carousel, Row, Col, Card, Popover, Affix, Button } from 'antd';

import { loadRevenueCollection, downloadSaData, downloadZoneData } from '../../redux/dashboard/dashboard.actions';
import {
    selectRevenueTable, selectSaRevenueTable, selectLoading
} from '../../redux/dashboard/dashboard.selectors';

import RevenueCharts from './revenue-charts.component';
import ComplaintSection from './complaint-section.component';
import RevenueTotalList from './revenue-list.component';
import RevenueTargetChart from './revenue-chart-target.component';

const getLevelColor = level => {
    if (level < 50)
        return '#cf1322';
    if (level < 70)
        return 'orangered';
    if (level < 85)
        return 'orange';
    if (level < 100)
        return '#108ee9';

    return '#3f8600';
}

const tablePrecision = 1;

const columns = [
    {
        title: 'Area',
        dataIndex: 'location',
        key: 'location',
        width: 170,
        fixed: 'left',
        className: 'mi-fixed-col'
    },
    {
        title: "Active Customer's Transactions",
        children: [
            {
                title: 'Sales Collection',
                children: [
                    {
                        title: 'Cust #',
                        dataIndex: 'customer_count',
                        key: 'customer_count',
                        width: 80,
                        render: text => (
                            <Statistic
                                value={text}
                                className="mi-statistic__projection"
                            />
                        )
                    },
                    {
                        title: 'Trans.',
                        dataIndex: 'transactions_sales',
                        key: 'transactions_sales',
                        width: 80,
                        render: text => (
                            <Statistic
                                value={text}
                                className="mi-statistic__projection"
                            />
                        )
                    },
                    {
                        title: 'Collection',
                        //dataIndex: 'collection_sales',
                        key: 'collection_sale',
                        render: (text, record) => {
                            let projection = record.collection_projection > 0 ? ((record.collection_sales / record.collection_projection) * 100) - 100 : 0;
                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                    <Statistic
                                        value={record.collection_sales}
                                        precision={0}
                                        className="mi-statistic__projection"

                                    />
                                    <Statistic
                                        value={Math.abs(projection)}
                                        precision={tablePrecision}
                                        suffix={<Popover content={format(',')(record.collection_sales - record.collection_projection)}>%</Popover>}
                                        className="mi-statistic__projection mi-statistic__projection--inner"
                                        valueStyle={{ color: (projection > 0 ? '#3f8600' : '#cf1322') }}
                                        prefix={projection > 0 ? <Icon type="arrow-up" /> : <Icon type="arrow-down" />}
                                    />
                                </div>
                            )
                        }
                    },
                    {
                        title: 'Target ( % Collected )',
                        //dataIndex: 'collection_sales_target',
                        key: 'collection_sales_target',
                        render: (text, record) => {
                            let collected = record.collection_sales_target > 0 ? (record.collection_sales / record.collection_sales_target) * 100 : 100;
                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                    <Statistic
                                        value={record.collection_sales_target}
                                        precision={0}
                                        className="mi-statistic__projection"

                                    />
                                    <Statistic
                                        value={collected}
                                        precision={tablePrecision}
                                        suffix={<Popover content={format(',')(record.collection_sales - record.collection_sales_target)}>% )</Popover>}
                                        className="mi-statistic__projection mi-statistic__projection--inner"
                                        valueStyle={{ color: getLevelColor(collected) }}
                                        prefix="( "
                                    />
                                </div>
                            )
                        },
                        sorter: (a, b) => {
                            let collectedA = a.collection_sales_target > 0 ? (a.collection_sales / a.collection_sales_target) * 100 : 100;
                            let collectedB = b.collection_sales_target > 0 ? (b.collection_sales / b.collection_sales_target) * 100 : 100;
                            return collectedA - collectedB;
                        },
                        defaultSortOrder: 'descend'
                    }
                ]
            },
            {
                title: 'Reconnection',
                children: [
                    {
                        title: 'Req.',
                        dataIndex: 'recon_req',
                        key: 'recon_req',
                        width: 50,
                    },
                    {
                        title: 'Collected',
                        //dataIndex: 'recon_collection',
                        key: 'recon_collection',
                        render: (text, record) => {
                            let projection = record.recon_projection > 0 ? ((record.recon_collection / record.recon_projection) * 100) - 100 : (record.recon_collection > 0 ? 100 : 0);
                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                    <Statistic
                                        value={record.recon_collection}
                                        precision={0}
                                        className="mi-statistic__projection"

                                    />
                                    {!(projection === 0 && record.recon_collection === 0) &&
                                        <Statistic
                                            value={Math.abs(projection)}
                                            precision={tablePrecision}
                                            suffix={<Popover content={format(',')(record.recon_collection - record.recon_projection)}>%</Popover>}
                                            className="mi-statistic__projection mi-statistic__projection--inner"
                                            valueStyle={{ color: ((projection > 0 || (projection === 0 && record.recon_collection > 0)) ? '#3f8600' : '#cf1322') }}
                                            prefix={(projection > 0 || (projection === 0 && record.recon_collection > 0)) ? <Icon type="arrow-up" /> : <Icon type="arrow-down" />}
                                        />
                                    }
                                </div>
                            )
                        }
                    }
                ]
            }
        ]
    },
    {
        title: 'New Connection',
        children: [
            {
                title: 'Added',
                dataIndex: 'connection_count',
                key: 'connection_count',
                width: 59,
            },
            {
                title: 'Water',
                //dataIndex: 'connection_water_collection',
                key: 'connection_water_collection',
                render: (text, record) => {
                    let projection = record.connection_water_projection > 0 ? ((record.connection_water_collection / record.connection_water_projection) * 100) - 100 : (record.connection_water_collection > 0 ? 100 : 0);
                    return (
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Statistic
                                value={record.connection_water_collection}
                                precision={0}
                                className="mi-statistic__projection"

                            />
                            {!(projection === 0 && record.connection_water_collection === 0) &&
                                <Statistic
                                    value={Math.abs(projection)}
                                    precision={tablePrecision}
                                    suffix={<Popover content={format(',')(record.connection_water_collection - record.connection_water_projection)}>%</Popover>}
                                    className="mi-statistic__projection mi-statistic__projection--inner"
                                    valueStyle={{ color: ((projection > 0 || (projection === 0 && record.connection_water_collection > 0)) ? '#3f8600' : '#cf1322') }}
                                    prefix={(projection > 0 || (projection === 0 && record.connection_water_collection > 0)) ? <Icon type="arrow-up" /> : <Icon type="arrow-down" />}
                                />
                            }
                        </div>
                    )
                }
            },
            {
                title: 'Sewer',
                dataIndex: 'connection_sewer_collection',
                key: 'connection_sewer_collection',
                render: (text, record) => {
                    let projection = record.connection_sewer_projection > 0 ? ((record.connection_sewer_collection / record.connection_sewer_projection) * 100) - 100 : (record.connection_sewer_collection > 0 ? 100 : 0);
                    return (
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Statistic
                                value={record.connection_sewer_collection}
                                precision={0}
                                className="mi-statistic__projection"

                            />
                            {!(projection === 0 && record.connection_sewer_collection === 0) &&
                                <Statistic
                                    value={Math.abs(projection)}
                                    precision={tablePrecision}
                                    suffix={<Popover content={format(',')(record.connection_sewer_collection - record.connection_sewer_projection)}>%</Popover>}
                                    className="mi-statistic__projection mi-statistic__projection--inner"
                                    valueStyle={{ color: ((projection > 0 || (projection === 0 && record.connection_sewer_collection > 0)) ? '#3f8600' : '#cf1322') }}
                                    prefix={(projection > 0 || (projection === 0 && record.connection_sewer_collection > 0)) ? <Icon type="arrow-up" /> : <Icon type="arrow-down" />}
                                />}
                        </div>
                    )
                }
            },
            // {
            //     title: 'Target',
            //     dataIndex: 'connection_target',
            //     key: 'connection_target'
            // }
        ]
    }
];

const saColumns = [
    {
        title: 'Staff',
        dataIndex: 'location',
        key: 'location',
        width: 270,
        fixed: 'left',
    },
    {
        title: "Active Customer's Transactions",
        children: [
            {
                title: 'Sales Collection',
                children: [
                    {
                        title: 'Cust #',
                        dataIndex: 'customer_count',
                        key: 'customer_count',
                        render: text => (
                            <Statistic
                                value={text}
                                className="mi-statistic__projection"
                            />
                        )
                    },
                    {
                        title: 'Trans.',
                        dataIndex: 'transactions_sales',
                        key: 'transactions_sales',
                        render: text => (
                            <Statistic
                                value={text}
                                className="mi-statistic__projection"
                            />
                        )
                    },
                    {
                        title: 'Collection',
                        //dataIndex: 'collection_sales',
                        key: 'collection_sale',
                        render: (text, record) => {
                            let projection = record.collection_projection > 0 ? ((record.collection_sales / record.collection_projection) * 100) - 100 : 0;
                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                    <Statistic
                                        value={record.collection_sales}
                                        precision={0}
                                        className="mi-statistic__projection"

                                    />
                                    <Statistic
                                        value={Math.abs(projection)}
                                        precision={tablePrecision}
                                        suffix={<Popover content={format(',')(record.collection_sales - record.collection_projection)}>%</Popover>}
                                        className="mi-statistic__projection mi-statistic__projection--inner"
                                        valueStyle={{ color: (projection > 0 ? '#3f8600' : '#cf1322') }}
                                        prefix={projection > 0 ? <Icon type="arrow-up" /> : <Icon type="arrow-down" />}
                                    />
                                </div>
                            )
                        }
                    },
                    {
                        title: 'Target ( % Collected )',
                        //dataIndex: 'collection_sales_target',
                        key: 'collection_sales_target',
                        render: (text, record) => {
                            let collected = record.collection_sales_target > 0 ? (record.collection_sales / record.collection_sales_target) * 100 : 100;
                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                    <Statistic
                                        value={record.collection_sales_target}
                                        precision={0}
                                        className="mi-statistic__projection"

                                    />
                                    <Statistic
                                        value={collected}
                                        precision={tablePrecision}
                                        suffix={<Popover content={format(',')(record.collection_sales - record.collection_sales_target)}>% )</Popover>}
                                        className="mi-statistic__projection mi-statistic__projection--inner"
                                        valueStyle={{ color: getLevelColor(collected) }}
                                        prefix="( "
                                    />
                                </div>
                            )
                        },
                        sorter: (a, b) => {
                            let collectedA = a.collection_sales_target > 0 ? (a.collection_sales / a.collection_sales_target) * 100 : 100;
                            let collectedB = b.collection_sales_target > 0 ? (b.collection_sales / b.collection_sales_target) * 100 : 100;
                            return collectedA - collectedB;
                        },
                        defaultSortOrder: 'descend'
                    }
                ]
            },
            {
                title: 'Reconnection',
                children: [
                    {
                        title: 'Req.',
                        dataIndex: 'recon_req',
                        key: 'recon_req'
                    },
                    {
                        title: 'Collected',
                        //dataIndex: 'recon_collection',
                        key: 'recon_collection',
                        render: (text, record) => {
                            let projection = record.recon_projection > 0 ? ((record.recon_collection / record.recon_projection) * 100) - 100 : (record.recon_collection > 0 ? 100 : 0);
                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                    <Statistic
                                        value={record.recon_collection}
                                        precision={0}
                                        className="mi-statistic__projection"

                                    />
                                    {!(projection === 0 && record.recon_collection === 0) &&
                                        <Statistic
                                            value={Math.abs(projection)}
                                            precision={tablePrecision}
                                            suffix={<Popover content={format(',')(record.recon_collection - record.recon_projection)}>%</Popover>}
                                            className="mi-statistic__projection mi-statistic__projection--inner"
                                            valueStyle={{ color: ((projection > 0 || (projection === 0 && record.recon_collection > 0)) ? '#3f8600' : '#cf1322') }}
                                            prefix={(projection > 0 || (projection === 0 && record.recon_collection > 0)) ? <Icon type="arrow-up" /> : <Icon type="arrow-down" />}
                                        />
                                    }
                                </div>
                            )
                        }
                    }
                ]
            }
        ]
    },
    {
        title: 'Meter Reading',
        children: [
            {
                title: 'Reads',
                //dataIndex: 'connection_count',
                key: 'meter_read',
                render: (text, record) => {
                    let projection = record.proj_readings > 0 ? ((record.current_readings / record.proj_readings) * 100) - 100 : (record.current_readings > 0 ? 100 : 0);
                    return (
                        <div style={{ display: 'flex', justifyContent: 'space-around', position: 'relative' }}>
                            <Statistic
                                value={record.current_readings}
                                precision={0}
                                className="mi-statistic__projection"

                            />
                            {!(projection === 0 && record.current_readings === 0) &&
                                <Statistic
                                    value={Math.abs(projection)}
                                    precision={tablePrecision}
                                    suffix={<Popover content={format(',')(record.current_readings - record.proj_readings)}>%</Popover>}
                                    className="mi-statistic__projection mi-statistic__projection--inner"
                                    valueStyle={{ color: ((projection > 0 || (projection === 0 && record.current_readings > 0)) ? '#3f8600' : '#cf1322') }}
                                    prefix={(projection > 0 || (projection === 0 && record.current_readings > 0)) ? <Icon type="arrow-up" /> : <Icon type="arrow-down" />}
                                />
                            }
                        </div>
                    )
                }
            },
            {
                title: <span>Water Sold ( m<sup style={{ fontSize: 10 }}>3</sup> )</span>,
                //dataIndex: 'connection_water_collection',
                key: 'connection_water_collection',
                render: (text, record) => {
                    let projection = record.proj_previous_cons > 0 ? ((record.current_cons / record.proj_previous_cons) * 100) - 100 : (record.current_cons > 0 ? 100 : 0);
                    return (
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Statistic
                                value={record.current_cons}
                                precision={0}
                                className="mi-statistic__projection"

                            />
                            {!(projection === 0 && record.current_cons === 0) &&
                                <Statistic
                                    value={Math.abs(projection)}
                                    precision={tablePrecision}
                                    suffix={<Popover content={format(',')(record.current_cons - record.proj_previous_cons)}>%</Popover>}
                                    className="mi-statistic__projection mi-statistic__projection--inner"
                                    valueStyle={{ color: ((projection > 0 || (projection === 0 && record.current_cons > 0)) ? '#3f8600' : '#cf1322') }}
                                    prefix={(projection > 0 || (projection === 0 && record.current_cons > 0)) ? <Icon type="arrow-up" /> : <Icon type="arrow-down" />}
                                />
                            }
                        </div>
                    )
                }
            },
        ]
    }
];

class RevenueCollection extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.crousel = React.createRef();
        this.shouldNavigate = true;
        this.currentSlide = 0;
    }

    navigateToNextScreen(page) {
        this.crousel.goTo(page % 4);
    }

    startPreview() {
        // let i = 0;
        // let starterLoop = setInterval(()=>{

        // },3000);
    }

    componentDidMount() {
        this.props.loadRevenueCollection();
        this.crousel.goTo(0);
        let postNavigate = null;
        setInterval(() => {
            this.props.loadRevenueCollection();
            clearTimeout(postNavigate);
            if (!this.shouldNavigate) {
                postNavigate = setTimeout(() => {
                    if (this.shouldNavigate) {
                        this.navigateToNextScreen(this.currentSlide);
                        if (this.currentSlide === 4)
                            this.currentSlide = 0;
                        this.currentSlide++;
                    }
                }, 7000);
                return;
            }
            this.navigateToNextScreen(this.currentSlide);
            if (this.currentSlide === 4)
                this.currentSlide = 0;
            this.currentSlide++;
            // setTimeout(()=>{
            //     this.props.loadRevenueCollection();
            // },3500);
        }, 42000)
    }

    render() {
        const { revenueTable, saRevenueTable, loading, downloadSaData, downloadZoneData } = this.props;

        return (
            <div>

                <div
                    onMouseEnter={() => { this.shouldNavigate = false; }}
                    onMouseLeave={() => { this.shouldNavigate = true; }}
                >
                    <Carousel
                        className="mi-revenue-table__carousel"
                        dotPosition="top"
                        fade={true}
                        easing="easein"
                        beforeChange={(c, n) => {
                            //console.log("Slide About to change: ", c, n)
                            this.currentSlide = n + 1;
                        }}
                        ref={node => {
                            this.crousel = node;
                        }}
                    >
                        <RevenueCharts />

                        <Row>
                            <Col span={24}>
                                <div>
                                    <Affix style={{ position: 'absolute', right: 10, top: 10, zIndex: 1000 }}>
                                        <Button shape="circle" icon="download" title="Download" onClick={() => downloadZoneData(revenueTable)} />
                                    </Affix>
                                    <Table
                                        columns={columns}
                                        dataSource={revenueTable}
                                        bordered
                                        size="middle"
                                        pagination={false}
                                        className="mi-revenue-table"
                                        expandRowByClick={true}
                                        scroll={{ x: 'max-content' }}
                                        loading={loading}
                                    />
                                </div>
                            </Col>
                            <Col span={24} style={{ marginTop: '2rem' }} className="mi-hide-xl">
                                <Card
                                    title={<span>Target Revenue <sub style={{ fontStyle: 'italic', float: 'right' }}>( Financial Year )</sub></span>}
                                    hoverable
                                    loading={loading}
                                    className="mi-revenue-table__chart-card mi-revenue-table__chart-card--xl"
                                >
                                    <RevenueTargetChart />
                                </Card>
                            </Col>
                            <Col span={24} className="mi-hide-xl" style={{ marginTop: '2rem' }}>
                                <Card
                                    title={<span>Revenue <sub style={{ fontStyle: 'italic', float: 'right' }}>( This month )</sub></span>}
                                    hoverable
                                    loading={loading}
                                    className="mi-revenue-table__chart-card mi-revenue-table__chart-card--xl"
                                >
                                    <RevenueTotalList />
                                </Card>
                            </Col>
                        </Row>


                        <Row>
                            <Col span={24}>
                                <div>
                                    <Affix style={{ position: 'absolute', right: 10, top: 10, zIndex: 1000 }}>
                                        <Button shape="circle" icon="download" title="Download" onClick={() => downloadSaData(saRevenueTable)} />
                                    </Affix>
                                    <Table
                                        columns={saColumns}
                                        dataSource={saRevenueTable}
                                        bordered
                                        size="middle"
                                        pagination={{ pageSize: revenueTable.length - 1 }}
                                        className="mi-revenue-table"
                                        expandRowByClick={true}
                                        scroll={{ x: 'max-content' }}
                                        loading={loading}
                                    />
                                </div>
                            </Col>
                            <Col span={24} style={{ marginTop: '2rem' }} className="mi-hide-xl">
                                <Card
                                    title={<span>Target Revenue <sub style={{ fontStyle: 'italic', float: 'right' }}>( Financial Year )</sub></span>}
                                    hoverable
                                    className="mi-revenue-table__chart-card mi-revenue-table__chart-card--xl"
                                    loading={loading}
                                >
                                    <RevenueTargetChart />
                                </Card>
                            </Col>
                            <Col span={24} className="mi-hide-xl" style={{ marginTop: '2rem' }}>
                                <Card
                                    title={<span>Revenue <sub style={{ fontStyle: 'italic', float: 'right' }}>( This month )</sub></span>}
                                    hoverable
                                    loading={loading}
                                    className="mi-revenue-table__chart-card mi-revenue-table__chart-card--xl"
                                >
                                    <RevenueTotalList />
                                </Card>
                            </Col>
                        </Row>


                        <ComplaintSection />

                    </Carousel>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    loadRevenueCollection: () => dispatch(loadRevenueCollection()),
    downloadSaData: data => dispatch(downloadSaData(data)),
    downloadZoneData: data => dispatch(downloadZoneData(data))
});

const mapStateToProps = createStructuredSelector({
    revenueTable: selectRevenueTable,
    saRevenueTable: selectSaRevenueTable,
    loading: selectLoading
});

export default connect(mapStateToProps, mapDispatchToProps)(RevenueCollection);