import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { format } from 'd3-format';
import { Row, Col, Statistic, Icon, Card, Carousel, Popover } from 'antd';

import {
    selectReducedRevenueTotal,
    selectRevenueTableTotal,
    selectLoading
} from '../../redux/dashboard/dashboard.selectors';

const getLevelColor = level => {
    if (level < 50)
        return '#cf1322';
    if (level < 60)
        return 'orangered';
    if (level < 75)
        return 'orange';
    if (level < 85)
        return 'rgb(151, 111, 0)';
    if (level < 95)
        return 'rgb(0, 141, 151)';

    return '#3f8600';
}

const RevenueTableHead = props => {

    const { revenueTableTotal, revenueTotal, loading } = props;
    //console.log("Rev Total: ", revenueTotal);
    const { collections, ref_collections } = revenueTotal;
    const {
        customer_active,
        customer_inactive,
        connection_water_projection,
        connection_water_collection,
        connection_sewer_projection,
        connection_sewer_collection,
        connection_count,
        collection_projection,
        collection_sales,
        collection_sales_target,
        transactions_sales,
        recon_projection,
        recon_collection,
        proj_readings,
        current_readings,
        proj_previous_cons,
        current_cons,
        recon_req

    } = revenueTableTotal;
    const projectionConnWater = connection_water_projection > 0 ? ((connection_water_collection / connection_water_projection) * 100) - 100 : (connection_water_collection > 0 ? 100 : 0);
    const projectionConnSewer = connection_sewer_projection > 0 ? ((connection_sewer_collection / connection_sewer_projection) * 100) - 100 : (connection_sewer_collection > 0 ? 100 : 0);
    const projectionSalesCollection = collection_projection > 0 ? ((collection_sales / collection_projection) * 100) - 100 : (collection_sales > 0 ? 100 : 0);
    const salesTargetCollection = collection_sales_target > 0 ? (collection_sales / collection_sales_target) * 100 : 100;
    const projectionReconnection = recon_projection > 0 ? ((recon_collection / recon_projection) * 100) - 100 : (recon_collection > 0 ? 100 : 0);
    const projectionReadings = proj_readings > 0 ? ((current_readings / proj_readings) * 100) - 100 : (current_readings > 0 ? 100 : 0);
    const projectionCons = proj_previous_cons > 0 ? ((current_cons / proj_previous_cons) * 100) - 100 : (current_cons > 0 ? 100 : 0);
    const projectionCollections = ref_collections > 0 ? ((collections / ref_collections) * 100) - 100 : (collections > 0 ? 100 : 0);

    return (
        <Row gutter={16} style={{ marginBottom: 18 }} type="flex">
            <Col xl={{span: 4, order: 1}} md={{order: 2}} sm={{span: 8, order: 3}} xs={{span: 24, order: 1}}>
                <Card
                    title={<span>Customers<Icon type="team" style={{ color: 'rgba(0,0,0,.65)', marginLeft: 12 }}></Icon></span>}
                    className="mi-revenue-table__card mi-revenue-table__card-statistic mi-revenue-table__card--customer"
                    size="small"
                    hoverable
                    loading={loading}
                >
                    <Row type="flex" gutter={8} justify="space-around">

                        <Statistic
                            title="Active"
                            value={customer_active}
                            valueStyle={{ color: 'green' }}
                        />
                        <Statistic
                            title="Disco_"
                            value={customer_inactive}
                            valueStyle={{ color: 'grey' }}
                        />
                    </Row>
                </Card>
            </Col>
            <Col xl={{span: 12, order: 2}} md={{order: 3}} sm={{order: 1}} xs={{span: 24, order: 2}}>
                <Card
                    title={<span>Bill Collections<Icon type="dollar" style={{ color: 'rgba(0,0,0,.65)', marginLeft: 12 }}></Icon></span>}
                    className="mi-revenue-table__card mi-revenue-table__card-statistic"
                    size="small"
                    hoverable
                    loading={loading}
                >
                    <Row gutter={8}>
                        <Col md={{span: 7}} xs={{span: 24}}>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                                <Statistic
                                    value={collection_sales}
                                    precision={0}
                                    title="Payments"
                                />
                                {!(projectionSalesCollection === 0 && collection_sales === 0) &&
                                    <Statistic
                                        value={Math.abs(projectionSalesCollection)}
                                        precision={1}
                                        suffix={<Popover content={format(',')(collection_sales - collection_projection)}>%</Popover>}
                                        className="mi-revenue-table__card-statistic--sub"
                                        valueStyle={{ color: ((projectionSalesCollection > 0 || (projectionSalesCollection === 0 && collection_sales > 0)) ? '#3f8600' : '#cf1322') }}
                                        prefix={(projectionSalesCollection > 0 || (projectionSalesCollection === 0 && collection_sales > 0)) ? <Icon type="rise" /> : <Icon type="fall" />}
                                    />
                                }
                            </div>
                        </Col>
                        <Col md={{span: 7}} xs={{span: 24}}>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                                <Statistic
                                    value={collection_sales_target}
                                    precision={0}
                                    title={<span>Target <span style={{ fontSize: 10 }}>( % Coll)</span></span>}
                                />
                                <Statistic
                                    value={salesTargetCollection}
                                    precision={2}
                                    suffix={<Popover content={format(',')(collection_sales - collection_sales_target)}>% )</Popover>}
                                    className="mi-revenue-table__card-statistic--sub"
                                    valueStyle={{ color: getLevelColor(salesTargetCollection) }}
                                    prefix="( "
                                />
                            </div>
                        </Col>
                        <Col md={{span: 3}} xs={{span: 24}} style={{textAlign: 'center'}}>
                            <Statistic
                                value={transactions_sales}
                                title="Trans #"
                            />
                        </Col>
                        <Col md={{span: 7}} xs={{span: 24}}>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                                <Statistic
                                    value={recon_collection}
                                    precision={0}
                                    title={<span style={{ fontSize: 12 }}>Reconneciton</span>}
                                />
                                {!(projectionReconnection === 0 && recon_collection === 0) &&
                                    <Statistic
                                        value={Math.abs(projectionReconnection)}
                                        precision={1}
                                        suffix={<Popover content={format(',')(recon_collection - recon_projection)}>%</Popover>}
                                        className="mi-revenue-table__card-statistic--sub"
                                        valueStyle={{ color: ((projectionReconnection > 0 || (projectionReconnection === 0 && recon_collection > 0)) ? '#3f8600' : '#cf1322') }}
                                        prefix={(projectionReconnection > 0 || (projectionReconnection === 0 && recon_collection > 0)) ? <Icon type="rise" /> : <Icon type="fall" />}
                                    />
                                }
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col xl={{span: 8, order: 3}} md={{order: 1}} sm={{span: 16, order: 2}} xs={{span: 24, order: 3}}>
                <Carousel
                    className="mi-revenue-table__carousel mi-revenue-table__carousel--right"
                    dotPosition="top"
                    autoplay
                    autoplaySpeed={13000}
                    pauseOnHover={true}
                    fade={true}
                    easing="easein">
                    <Card
                        title={<span>Total Collection<Icon type="bank" style={{ color: 'rgba(0,0,0,.65)', marginLeft: 12, border: 'none' }}></Icon></span>}
                        className="mi-revenue-table__card mi-revenue-table__card-total"
                        size="small"
                        loading={loading}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                            <Statistic
                                value={collections}
                                precision={0}
                            />
                            {!(projectionCollections === 0 && collections === 0) &&
                                <Statistic
                                    value={Math.abs(projectionCollections)}
                                    precision={1}
                                    suffix={<Popover content={format(',')(collections - ref_collections)}>%</Popover>}
                                    className="mi-revenue-table__card-total--sub"
                                    valueStyle={{ color: ((projectionCollections > 0 || (projectionCollections === 0 && collections > 0)) ? '#3f8600' : '#cf1322') }}
                                    prefix={(projectionCollections > 0 || (projectionCollections === 0 && collections > 0)) ? <Icon type="rise" /> : <Icon type="fall" />}
                                />
                            }
                        </div>
                    </Card>
                    <Card
                        title={<span>New Connection<Icon type="branches" style={{ color: 'rgba(0,0,0,.65)', marginLeft: 12 }}></Icon></span>}
                        className="mi-revenue-table__card mi-revenue-table__card-statistic"
                        size="small"
                        hoverable
                        loading={loading}
                    >
                        <Row gutter={8}>
                            <Col md={{span: 9}} sm={{span: 12}} xs={{span: 24}}>
                                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                                    <Statistic
                                        value={connection_water_collection}
                                        precision={0}
                                        title="Water"
                                    />
                                    {!(projectionConnWater === 0 && connection_water_collection === 0) &&
                                        <Statistic
                                            value={Math.abs(projectionConnWater)}
                                            precision={1}
                                            suffix={<Popover content={format(',')(connection_water_collection - connection_water_projection)}>%</Popover>}
                                            className="mi-revenue-table__card-statistic--sub"
                                            valueStyle={{ color: ((projectionConnWater > 0 || (projectionConnWater === 0 && connection_water_collection > 0)) ? '#3f8600' : '#cf1322') }}
                                            prefix={(projectionConnWater > 0 || (projectionConnWater === 0 && connection_water_collection > 0)) ? <Icon type="rise" /> : <Icon type="fall" />}
                                        />
                                    }
                                </div>
                            </Col>
                            <Col md={{span: 9}} sm={{span: 12}} xs={{span: 24}}>
                                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                                    <Statistic
                                        value={connection_sewer_collection}
                                        precision={0}
                                        title="Sewer"
                                    />
                                    {!(projectionConnSewer === 0 && connection_sewer_collection === 0) &&
                                        <Statistic
                                            value={Math.abs(projectionConnSewer)}
                                            precision={1}
                                            suffix={<Popover content={format(',')(connection_sewer_collection - connection_sewer_projection)}>%</Popover>}
                                            valueStyle={{ color: ((projectionConnSewer > 0 || (projectionConnSewer === 0 && connection_sewer_collection > 0)) ? '#3f8600' : '#cf1322') }}
                                            prefix={(projectionConnSewer > 0 || (projectionConnSewer === 0 && connection_sewer_collection > 0)) ? <Icon type="rise" /> : <Icon type="fall" />}
                                            className="mi-revenue-table__card-statistic--sub"
                                        />
                                    }
                                </div>
                            </Col>
                            <Col md={{span: 6}} sm={{span: 12}} xs={{span: 24}} style={{textAlign: 'center'}}>
                                <Statistic
                                    value={connection_count}
                                    title="Connected"
                                />
                            </Col>
                        </Row>
                    </Card>
                    <Card
                        title={<span>Other<Icon type="audit" style={{ color: 'rgba(0,0,0,.65)', marginLeft: 12 }}></Icon></span>}
                        className="mi-revenue-table__card mi-revenue-table__card-statistic"
                        size="small"
                        hoverable
                        loading={loading}
                    >
                        <Row gutter={8}>
                            <Col md={{span: 11}} sm={{span: 12}} xs={{span: 24}}>
                                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                                    <Statistic
                                        value={current_cons}
                                        precision={0}
                                        title={<span>Cons. ( m<sup style={{ fontSize: 10 }}>3</sup> )</span>}
                                    />
                                    {!(projectionCons === 0 && current_cons === 0) &&
                                        <Statistic
                                            value={Math.abs(projectionCons)}
                                            precision={1}
                                            suffix={<Popover content={format(',')(current_cons - proj_previous_cons)}>%</Popover>}
                                            className="mi-revenue-table__card-statistic--sub"
                                            valueStyle={{ color: ((projectionCons > 0 || (projectionCons === 0 && current_cons > 0)) ? '#3f8600' : '#cf1322') }}
                                            prefix={(projectionCons > 0 || (projectionCons === 0 && current_cons > 0)) ? <Icon type="rise" /> : <Icon type="fall" />}
                                        />
                                    }
                                </div>
                            </Col>
                            <Col md={{span: 9}} sm={{span: 12}} xs={{span: 24}}>
                                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                                    <Statistic
                                        value={current_readings}
                                        precision={0}
                                        title="Meter Read"
                                    />
                                    {!(projectionReadings === 0 && current_readings === 0) &&
                                        <Statistic
                                            value={Math.abs(projectionReadings)}
                                            precision={1}
                                            suffix={<Popover content={format(',')(current_readings - proj_readings)}>%</Popover>}
                                            valueStyle={{ color: ((projectionReadings > 0 || (projectionReadings === 0 && current_readings > 0)) ? '#3f8600' : '#cf1322') }}
                                            prefix={(projectionReadings > 0 || (projectionReadings === 0 && current_readings > 0)) ? <Icon type="rise" /> : <Icon type="fall" />}
                                            className="mi-revenue-table__card-statistic--sub"
                                        />
                                    }
                                </div>
                            </Col>
                            <Col md={{span: 4}} sm={{span: 12}} xs={{span: 24}} style={{textAlign: 'center'}}>
                                <Statistic
                                    value={recon_req}
                                    title="Recon"
                                />
                            </Col>
                        </Row>
                    </Card>
                </Carousel>
            </Col>
        </Row>
    )
}

const mapStateToProps = createStructuredSelector({
    revenueTableTotal: selectRevenueTableTotal,
    revenueTotal: selectReducedRevenueTotal,
    loading: selectLoading
})

export default connect(mapStateToProps)(RevenueTableHead);