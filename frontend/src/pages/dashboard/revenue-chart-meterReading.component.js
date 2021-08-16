import React from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import C3Chart from "react-c3js";
import { format } from "d3-format";
import { Button, Affix } from "antd";
import { getRefDate } from "../../services/api";

import { selectReadingsChart } from "../../redux/dashboard/dashboard.selectors";

import { downloadSaMonthReadings } from "../../redux/dashboard/dashboard.actions";

const colors = {
  primary: "#37a3da",
  sewer: "#b86e00",
  def: "#acb7bf",
  success: "#46be8a",
  danger: "#fb434a",
};

class ReadingsChart extends React.Component {
  is_comp_loaded = true;

  componentDidMount() {
    this.is_comp_loaded = true;
  }

  componentWillUnmount() {
    this.is_comp_loaded = false;
  }
  render() {
    if (!this.is_comp_loaded) return <div>Processing...</div>;
    const { readingsChart, downloadSaMonthReadings } = this.props;
    const readingProjectionKey = readingsChart[2]
      ? readingsChart[2][0]
      : "None";
    const consProjectionKey = readingsChart[4] ? readingsChart[4][0] : "None";
    //console.log("Readings Chart: ",readingsChart,readingsChart);
    const combination = {
      data: {
        x: "x",
        columns: readingsChart,
        type: "bar",
        types: {
          Consumption: "area-spline",
          Meter_Read: "line",
        },
        colors: {
          Consumption: colors.primary,
          Meter_Read: "#004b41",
          [consProjectionKey]: "#a6d7f8", //#ccdee7',
          [readingProjectionKey]: "#dfcfc0", //'#e2debc'
        },
        axes: {
          Consumption: "y2",
          [consProjectionKey]: "y2",
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
        y2: {
          show: true,
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
          lines: [{ value: 15, class: "gridTarget", text: "Cycle" }],
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
          value: format("s"), // apply this format to both y and y2
        },
      },
      point: {
        show: true,
      },
    };
    return (
      <>
        <Affix
          style={{ position: "absolute", right: 10, top: 30, zIndex: 1000 }}
        >
          <Button
            shape="circle"
            icon="download"
            title="Download"
            onClick={() => downloadSaMonthReadings()}
          />
        </Affix>
        <C3Chart
          className="mi-revenue-table__chart"
          data={combination.data}
          grid={combination.grid}
          axis={combination.axis}
          tooltip={combination.tooltip}
          point={combination.point}
        />
      </>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  readingsChart: selectReadingsChart,
});

const mapDispatchToProps = (dispatch) => ({
  downloadSaMonthReadings: () => dispatch(downloadSaMonthReadings()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReadingsChart);
