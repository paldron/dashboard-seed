import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import C3Chart from "react-c3js";
import { format } from "d3-format";
import { getRefDate } from "../../services/api";

import { selectComplaintDonut } from "../../redux/dashboard/dashboard.selectors";

const colors = {
  primary: "#96b2b8",
  def: "#31586d",
  success: "#46be8a",
  danger: "#fb434a",
};

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
    const projectionName =
      complaintDonut.state && complaintDonut.state[3]
        ? complaintDonut.state[3][0]
        : "None";
    const combination = {
      data: {
        columns: complaintDonut.state,
        type: "donut",
        colors: {
          [projectionName]: colors.danger,
          Resolved: colors.success,
          In_Progress: colors.primary,
          Unattended: colors.def,
        },
      },
      donut: {
        title: "Complaints",
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
