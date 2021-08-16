import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import C3Chart from "react-c3js";
import { format } from "d3-format";
import { getRefDate } from "../../services/api";

import { selectComplaintDonut } from "../../redux/dashboard/dashboard.selectors";

// const colors = {
//     primary: '#01a8fe',
//     def: '#31586d',
//     success: '#46be8a',
//     danger: '#fb434a',
// }

class ComplaintDonut extends React.Component {
  is_comp_loaded = true;

  componentDidMount() {
    this.is_comp_loaded = true;
  }

  componentWillUnmount() {
    this.is_comp_loaded = false;
  }
  render() {
    if (!this.is_comp_loaded) return <div>Processing...</div>;
    const { complaintDonut } = this.props;
    //console.log("Donut: ", complaintDonut);
    const combination = {
      data: {
        columns: complaintDonut.types
          .sort((a, b) => (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0))
          .slice(-4),
        type: "donut",
      },
      donut: {
        title: "Distribution",
      },
      tooltip: {
        format: {
          title: function (d) {
            return getRefDate().format(`MMM YYYY`);
          },
          // value: function (value, ratio, id) {
          //     var format = id === 'data1' ? d3.format(',') : d3.format('$');
          //     return format(value);
          // }
          value: format(","), // apply this format to both y and y2
        },
      },
      color: {
        // #9edae5 #17becf
        pattern: [
          "#ff9896",
          "#aec7e8",
          "#c4b37e",
          "#97887e",
          "#e377c2",
          "#f7b6d2",
          "#7f7f7f",
          "#c7c7c7",
          "#bcbd22",
          "#dbdb8d",
          "#17becf",
          "#9edae5",
          "#2ca02c",
          "#98df8a",
          "#1f77b4",
          "#ffbb78",
          "#d62728",
        ],
      },
    };

    return (
      <div className="mi-revenue-table__chart--container">
        <C3Chart
          className="mi-revenue-table__chart"
          data={combination.data}
          color={combination.color}
          tooltip={combination.tooltip}
          donut={combination.donut}
        />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  complaintDonut: selectComplaintDonut,
});

export default connect(mapStateToProps)(ComplaintDonut);
