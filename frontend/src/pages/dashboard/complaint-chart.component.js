import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import C3Chart from "react-c3js";
import { format } from "d3-format";
import { getRefDate } from "../../services/api";

import { selectComplaintChart } from "../../redux/dashboard/dashboard.selectors";

const colors = {
  primary: "#96b2b8",
  def: "#31586d",
  success: "#46be8a",
  danger: "#fb434a",
};

class ComplaintChart extends React.Component {
  render() {
    const { complaintChart } = this.props;
    const projectionName = complaintChart[4] ? complaintChart[4][0] : "None";
    const combination = {
      data: {
        x: "x",
        columns: complaintChart,
        type: "bar",
        types: {
          [projectionName]: "area-spline",
        },
        colors: {
          [projectionName]: colors.danger,
          Unattended: colors.def,
          In_Progress: colors.primary,
          Resolved: colors.success,
        },
        groups: [["Unattended", "In_Progress", "Resolved"]],
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
          value: format(","), // apply this format to both y and y2
        },
      },
    };

    return (
      <C3Chart
        className="mi-revenue-table__chart"
        data={combination.data}
        grid={combination.grid}
        axis={combination.axis}
        tooltip={combination.tooltip}
      />
    );
  }
}

const mapStateToProps = createStructuredSelector({
  complaintChart: selectComplaintChart,
});

export default connect(mapStateToProps)(ComplaintChart);
