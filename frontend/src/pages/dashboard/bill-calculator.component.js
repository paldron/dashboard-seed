import React from "react";
import {
  Typography,
  Row,
  Col,
  Input,
  Spin,
  Descriptions,
  notification,
  Empty,
  Divider,
  InputNumber,
  Card,
  Checkbox,
} from "antd";
import { format } from "d3-format";
import { apiFetch, getRefDate } from "../../services/api";

const { Text } = Typography;
const toMoneyPr = format(",.2f");
const toMoney = format(",");
const { Meta } = Card;

let postTime = null;

class BillCalculator extends React.Component {
  state = {
    value: "",
    loadingAccount: false,
    account: "",
    units: 0,
    amount: 0,
    monthPayment: 0,
    tariff: [],
    tariff_sewer: 0,
    tariff_linear: 0,
    category: "",
    meter: "",
    customerName: "",
    accountExists: false,
    is_sewered: false,
    category_id: "",
    hasFocus: false,
    isPrepaid: false,
    previousUnits: 0,
  };

  onChange = (e) => {
    const { value } = e.target;
    if (!isNaN(value)) {
      this.setState({ value });
      if (value.length === 5) {
        this.setState({
          loadingAccount: true,
          units: 0,
          amount: 0,
          monthPayment: 0,
          tariff: [],
          tariff_sewer: 0,
          tariff_linear: 0,
          category: "",
          meter: "",
          customerName: "",
          accountExists: false,
          is_sewered: false,
          category_id: "",
          isPrepaid: false,
          previousUnits: 0,
        });
        clearTimeout(postTime);
        postTime = setTimeout(() => {
          this.fetchAccountDetails(value);
        }, 800);
      } else
        this.setState({
          account: "",
          units: 0,
          amount: 0,
        });
    }
  };

  fetchAccountDetails = (account) => {
    apiFetch("POST", "/api/dashboard/customerInfo", {
      account,
    })
      .then((data) => {
        if (data[0].length === 0) {
          this.setState({
            loadingAccount: false,
          });
          return;
        }
        this.setState({
          loadingAccount: false,
          accountExists: true,
          customerName: data[0][0].customerName,
          category: data[0][0].category,
          category_id: data[0][0].category_id,
          is_sewered: data[0][0].is_sewered,
          meter: data[0][0].meter_number,
          monthPayment: data[1][0].paid ? data[1][0].paid : 0,
          tariff:
            data[0][0].category_id === "5"
              ? [{ startunit: 0, endunit: 0, rate: data[4][0].rate }]
              : data[2],
          tariff_sewer: data[3][0] ? data[3][0].rate : 0,
          tariff_linear: data[4][0] ? data[4][0].rate : 0,
        });
      })
      .catch((e) => {
        notification.error({
          key: "constomerInfoError",
          message: "Fetch Error",
          description: e.massage ? e.message : "Network Error",
          duration: 3,
        });
        this.setState({ loadingAccount: false });
      });
  };

  onUnitChange = (value) => {
    if (isNaN(value) || value == null || `${value}`.length === 0 || value < 0) {
      return;
    }
    const tempStr = `${value}`;
    value = parseFloat(
      tempStr[value.length - 1] === "."
        ? tempStr.substring(0, value.length - 1)
        : tempStr
    );
    const {
      tariff,
      category_id,
      tariff_linear,
      tariff_sewer,
      is_sewered,
      isPrepaid,
      previousUnits,
      monthPayment,
    } = this.state;
    if (category_id === "5") {
      this.setState({
        units: value,
        amount: value * tariff_linear,
      });
      return;
    }
    const orgUnits = value;
    let waterCharge = 0;
    value += isPrepaid ? previousUnits : 0;
    for (let i = 0; i < tariff.length; i++) {
      const band = tariff[i];
      if (band.endunit !== 0 && band.endunit <= value) {
        waterCharge += (band.endunit - band.startunit) * band.rate;
        if (band.endunit === value) break;
      } else if (band.endunit === 0 && band.startunit < value) {
        waterCharge += (value - band.startunit) * band.rate;
        break;
      } else {
        waterCharge += (value - band.startunit) * band.rate;
        break;
      }
    }
    const sewerCharge = is_sewered ? value * tariff_sewer * 1.19 : 0;
    this.setState({
      units: orgUnits,
      amount: sewerCharge + waterCharge * 1.01 - (isPrepaid ? monthPayment : 0),
    });
  };

  onAmountChange = (value, getUnits = false) => {
    if (isNaN(value) || value == null || `${value}`.length === 0 || value < 0)
      return;
    const tempStr = `${value}`;
    value = parseFloat(
      tempStr[value.length - 1] === "."
        ? tempStr.substring(0, value.length - 1)
        : tempStr
    );
    const {
      tariff,
      category_id,
      tariff_linear,
      tariff_sewer,
      is_sewered,
      isPrepaid,
      monthPayment,
      previousUnits,
    } = this.state;
    if (category_id === "5") {
      if (getUnits) return value / (tariff_linear * 1.0);
      this.setState({
        units: value / (tariff_linear * 1.0),
        amount: value,
      });
      return;
    }
    const orgAmount = value;
    let units = 0;
    let compAmount = 0;
    value += isPrepaid && !getUnits ? monthPayment : 0;
    for (let i = 0; i < tariff.length; i++) {
      const band = tariff[i];
      const tempUnits =
        band.endunit !== 0 ? (band.endunit - band.startunit) * 1.0 : 0;
      compAmount +=
        tempUnits * 1.01 * band.rate +
        (is_sewered ? tempUnits * 1.19 * tariff_sewer : 0);
      if (compAmount >= value) {
        units +=
          tempUnits -
          (compAmount - value) /
            (1.01 * band.rate + (is_sewered ? 1.19 * tariff_sewer : 0));
        break;
      } else if (band.endunit === 0 && compAmount < value) {
        units +=
          (value - compAmount) /
          (1.01 * band.rate + (is_sewered ? 1.19 * tariff_sewer : 0));
        break;
      } else {
        units += tempUnits;
      }
    }
    if (getUnits) return units;
    this.setState({
      amount: orgAmount,
      units: (units - (isPrepaid ? previousUnits : 0)).toFixed(7),
    });
  };

  onFocus = () => {
    this.setState({ hasFocus: true });
  };

  onBlur = () => {
    this.setState({ hasFocus: false });
  };

  onPrepaidCheck = (e) => {
    const { monthPayment, units } = this.state;
    this.setState(
      {
        isPrepaid: e.target.checked,
        previousUnits: e.target.checked
          ? parseFloat(this.onAmountChange(monthPayment, true))
          : 0,
      },
      () => {
        this.onUnitChange(units);
      }
    );
  };

  render() {
    const {
      value,
      loadingAccount,
      customerName,
      category,
      meter,
      monthPayment,
      accountExists,
      tariff,
      amount,
      units,
      hasFocus,
      isPrepaid,
    } = this.state;
    const validFormat = value.length === 5;
    const currentMonth = getRefDate().format("MMM YYYY");
    //console.log({ amount, units });
    return (
      <Card className="bill-calculator" title={null}>
        <div className="bill-calculator__title">
          <Text>Calculate Bill</Text>
        </div>
        <Row type="flex" justify="space-around">
          <Col span={8}>
            <Text className="account-label">Ac. #</Text>
          </Col>
          <Col span={14}>
            <Input
              className="bill-calculator__input"
              onChange={this.onChange}
              minLength={5}
              maxLength={5}
              value={value}
              size="small"
              style={{ textAlign: "center" }}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
            />
            <br />
            {!validFormat && hasFocus && (
              <Text
                style={{
                  fontStyle: "italic",
                  color: "orangered",
                  fontSize: "1.2rem",
                }}
              >
                5 digits required
              </Text>
            )}
          </Col>
        </Row>
        <div
          className="bill-calculator__body"
          style={{ marginTop: loadingAccount ? "4rem" : "1.1rem" }}
        >
          <Spin spinning={loadingAccount && validFormat} tip="Loading...">
            <div>
              {validFormat && !loadingAccount && accountExists && (
                <div>
                  <Descriptions
                    title={<Text ellipsis>{customerName}</Text>}
                    layout="vertical"
                    column={2}
                    size="small"
                    colon={false}
                  >
                    <Descriptions.Item label="Meter">{meter}</Descriptions.Item>
                    <Descriptions.Item label="Category">
                      {category}
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={`${currentMonth} Payment`}
                      span={2}
                    >
                      <Text strong>{toMoney(monthPayment)} /-</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tariff" span={2}>
                      <Row style={{ borderBottom: "1px dashed black" }}>
                        <Col span={8}>From</Col>
                        <Col span={8}>To</Col>
                        <Col span={8}>Rate</Col>
                      </Row>
                      {tariff.map((t, i) => (
                        <Row key={`${i + 2}_rt`}>
                          <Col span={8}>{t.startunit}</Col>
                          <Col span={8}>
                            {t.endunit === 0 ? "MAX" : t.endunit}
                          </Col>
                          <Col span={8}>{toMoney(t.rate)}</Col>
                        </Row>
                      ))}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider className="my-0">
                    Calculate <Checkbox onChange={this.onPrepaidCheck} />
                  </Divider>
                  {isPrepaid && <Text>For Prepaid:</Text>}
                  <Row gutter={12}>
                    <Col span={12}>Units</Col>
                    <Col span={12}>Amount</Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <InputNumber
                        min={0}
                        value={units}
                        onChange={this.onUnitChange}
                      />
                    </Col>
                    <Col span={12}>
                      <InputNumber
                        min={0}
                        value={amount}
                        onChange={this.onAmountChange}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Text
                      style={{
                        textAlign: "end",
                        display: "inline-block",
                        width: "100%",
                      }}
                    >
                      {toMoneyPr(amount)} /-
                    </Text>
                  </Row>
                </div>
              )}
              {!accountExists && !loadingAccount && validFormat && (
                <Empty description="Does Not Exists" />
              )}
            </div>
          </Spin>
        </div>
        <Meta
          description="by Augusto Shoo"
          style={{ position: "absolute", bottom: 0, fontStyle: "italic" }}
        />
      </Card>
    );
  }
}

export default BillCalculator;
