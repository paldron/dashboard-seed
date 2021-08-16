import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import C3Chart from "react-c3js";
import { format } from "d3-format";
import { Statistic } from "antd";
import { getRefDate } from "../../services/api";

import {
  //selectAllRevenueTodayTotal,
  selectRevenueTableTotal,
  selectCollectionRate,
} from "../../redux/dashboard/dashboard.selectors";

class RevenueChartGauge extends React.Component {
  is_comp_loaded = true;

  componentDidMount() {
    this.is_comp_loaded = true;
  }

  componentWillUnmount() {
    this.is_comp_loaded = false;
  }

  render() {
    if (!this.is_comp_loaded) return <div>Processing...</div>;
    const { revenueTableTotal, collectionRate } = this.props;

    const { collection_sales_target } = revenueTableTotal;
    if (!collectionRate || collection_sales_target === 0)
      return <div>Loading...</div>;
    const totalDays = parseInt(getRefDate().endOf("month").format("D"), 10);
    const targetRate = collection_sales_target / (24 * 4 * totalDays);
    //const elapsedMins = getRefDate().format('HH:mm').split(':').map(val => parseInt(val,10));
    //const currentRate = revenueToday / ((elapsedMins[0]*4) + (elapsedMins[1]/15));
    //console.log("Current Rate: ", collectionRate);
    const combination = {
      data: {
        columns: [["Collection / 15 min", collectionRate]],
        type: "gauge",
      },
      gauge: {
        label: {
          format: function (value, ratio) {
            return format(".2s")(value);
          },
          extents: function (value, isMax) {
            return format(".1s")(value);
          },

          //show: false // to turn off the min/max labels.
        },
        //    min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
        max: targetRate * 3.5, // 100 is default
        //   units: ' $',
        //    width: 39 // for adjusting arc thickness
      },
      color: {
        pattern: ["#FF0000", "#F97600", "#F6C600", "#60B044"], // the three color levels for the percentage values.
        threshold: {
          unit: "value", // percentage is default
          max: targetRate * 2, // 100 is default
          values: [
            targetRate * 0.8,
            targetRate * 1.3,
            targetRate * 1.7,
            targetRate * 2,
          ],
        },
      },
      size: {
        height: 320,
      },
      tooltip: {
        format: {
          title: function (d) {
            return getRefDate().format(`D MMM YYYY`);
          },
          // value: function (value, ratio, id) {
          //     var format = id === 'data1' ? d3.format(',') : d3.format('$');
          //     return format(value);
          // }
          value: format("s"), // apply this format to both y and y2
        },
      },
    };
    return (
      <div className="mi-revenue-table__chart--container">
        <Statistic
          title="Minimum Rate"
          value={format(".2s")(targetRate)}
          precision={2}
          style={{ position: "absolute", top: "22.5%", right: "10%" }}
        />
        <C3Chart
          key={collectionRate}
          className="mi-revenue-table__chart"
          data={combination.data}
          color={combination.color}
          gauge={combination.gauge}
          max={combination.max}
          size={combination.size}
          tooltip={combination.tooltip}
        />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  revenueTableTotal: selectRevenueTableTotal,
  collectionRate: selectCollectionRate,
  //revenueToday: selectAllRevenueTodayTotal
});

export default connect(mapStateToProps)(RevenueChartGauge);
