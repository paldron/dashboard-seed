import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import C3Chart from "react-c3js";
import { format } from "d3-format";
import moment from "moment";

import { selectRevenueTargetChart } from "../../redux/organization/org.selectors";

// const colors = {
//     primary: '#01a8fe',
//     sewer: '#b86e00',
//     def: '#acb7bf',
//     success: '#46be8a',
//     danger: '#fb434a',
// }

class RevenueTargetChart extends React.Component {
  is_comp_loaded = true;

  componentDidMount() {
    this.is_comp_loaded = true;
  }

  componentWillUnmount() {
    this.is_comp_loaded = false;
  }
  render() {
    if (!this.is_comp_loaded) return <div>Processing...</div>;
    const { targetChart } = this.props;
    //console.log("Rev Target Chart: ",targetChart);
    const combination = {
      data: {
        x: "x",
        columns: targetChart,
        type: "bar",
        types: {
          Collection: "spline",
        },
        colors: {
          Bill: "#4fcdff",
          Collection: "#035e30",
          Collection_Target: "#a5b39e",
          Bill_Target: "#b2d7e0", //'#e2debc'
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
        x: {
          type: "timeseries",
          tick: {
            format: "%m",
          },
        },
        y: {
          tick: {
            format: (v) => format("~s")(v).replace(/G/, "B"),
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
        },
      },
      tooltip: {
        format: {
          title: function (d) {
            return moment(d.toString()).format(`MMM YYYY`);
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
        <C3Chart
          className="mi-revenue-table__chart"
          data={combination.data}
          color={combination.color}
          grid={combination.grid}
          axis={combination.axis}
          tooltip={combination.tooltip}
        />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  targetChart: selectRevenueTargetChart,
});

export default connect(mapStateToProps)(RevenueTargetChart);
