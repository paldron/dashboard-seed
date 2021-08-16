import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import C3Chart from "react-c3js";
import { format } from "d3-format";
import { getRefDate } from "../../services/api";

import { selectConnectionsChart } from "../../redux/dashboard/dashboard.selectors";

const colors = {
  primary: "#01a8fe",
  sewer: "#b86e00",
  def: "#acb7bf",
  success: "#46be8a",
  danger: "#fb434a",
};

class ConnectionsChart extends React.Component {
  is_comp_loaded = true;

  componentDidMount() {
    this.is_comp_loaded = true;
  }

  componentWillUnmount() {
    this.is_comp_loaded = false;
  }
  render() {
    if (!this.is_comp_loaded) return <div>Processing...</div>;
    const { connectionsChart } = this.props;
    const connProjectionKey = connectionsChart[2]
      ? connectionsChart[2][0]
      : "None";
    const discoProjectionKey = connectionsChart[4]
      ? connectionsChart[4][0]
      : "None";
    const reconProjectionKey = connectionsChart[6]
      ? connectionsChart[6][0]
      : "None";
    //console.log("Connections Chart: ",connectionsChart);
    const combination = {
      data: {
        x: "x",
        columns: connectionsChart,
        type: "bar",
        types: {
          Connection: "area-spline",
          Disconnection: "line",
          Reconnection: "spline",
        },
        colors: {
          Reconnection: colors.primary,
          Connection: "green",
          Disconnection: "maroon",
          [connProjectionKey]: "#c7f1c7", // #ccdee7
          [discoProjectionKey]: "#c98b8b", //'#e2debc'
          [reconProjectionKey]: "#ccdee7",
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
            format: format(","),
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
            return getRefDate().format(`${d} MMM YYYY`);
          },
          // value: function (value, ratio, id) {
          //     var format = id === 'data1' ? d3.format(',') : d3.format('$');
          //     return format(value);
          // }
          value: format("~s"), // apply this format to both y and y2
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
  connectionsChart: selectConnectionsChart,
});

export default connect(mapStateToProps)(ConnectionsChart);
