import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import C3Chart from "react-c3js";
import { format } from "d3-format";
import { getRefDate } from "../../services/api";

import {
  selectCollectionSalesTarget,
  selectSalesCollectionChartAll,
} from "../../redux/dashboard/dashboard.selectors";

const colors = {
  primary: "#01a8fe",
  def: "#aec9d8",
  success: "#46be8a",
  danger: "#fb434a",
};

class DailyCollectionChart extends React.Component {
  is_comp_loaded = true;

  componentDidMount() {
    this.is_comp_loaded = true;
  }

  componentWillUnmount() {
    this.is_comp_loaded = false;
  }
  render() {
    if (!this.is_comp_loaded) return <div>Processing...</div>;
    const { collectionSalesTarget, salesCollectionChartAll } = this.props;
    const projectionName = salesCollectionChartAll[2];
    const collectionTarget =
      collectionSalesTarget /
      parseInt(getRefDate().endOf("month").format("D"), 10);
    const combination = {
      data: {
        x: "x",
        columns: salesCollectionChartAll,
        type: "bar",
        types: {
          Collections: "line",
        },
        colors: {
          Collections: colors.primary,
          [projectionName ? projectionName[0] : "None"]: colors.def,
        },
        // color: function (color, d) {
        //     // d will be 'id' when called for legends
        //     return d.id && d.id === 'data3' ? d3.rgb(color).darker(d.value / 150) : color;
        // }
        // labels: {
        //     //            format: function (v, id, i, j) { return "Default Format"; },
        //     format: {
        //         Collections: format('s'),
        //         //                data1: function (v, id, i, j) { return "Format for data1"; },
        //     },
        // }
      },
      axis: {
        y: {
          tick: {
            format: format("~s"),
          },
        },
      },
      // color: {
      //     pattern: [colors.primary, colors.def, '#3f8600'],
      // },
      grid: {
        x: {
          show: !0,
        },
        y: {
          show: !0,
          lines: [
            { value: collectionTarget, class: "gridTarget", text: "Target" },
          ],
        },
      },
      tooltip: {
        format: {
          title: function (d) {
            return (
              getRefDate().format(`${d} MMM YYYY`) +
              ` [ ${format("~s")(collectionTarget)} ]`
            );
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
      <C3Chart
        className="mi-revenue-table__chart"
        key={collectionTarget}
        data={combination.data}
        color={combination.color}
        grid={combination.grid}
        axis={combination.axis}
        tooltip={combination.tooltip}
      />
    );
  }
}

const mapStateToProps = createStructuredSelector({
  collectionSalesTarget: selectCollectionSalesTarget,
  salesCollectionChartAll: selectSalesCollectionChartAll,
});

export default connect(mapStateToProps)(DailyCollectionChart);
