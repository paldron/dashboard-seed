import React from "react";
import { Row, Col } from "antd";
import { getRefDate } from "../../services/api";

import RevenueCollection from "./revenue-collection.component";
import OrgTargetList from "./org-target.component";
import RevenueTableHead from "./revenue-table-head.component";
import BillCalculator from "./bill-calculator.component";
import Logo from "../../assets/img/mu_logo.png";

const Page = (props) => {
  return (
    <div>
      <Row gutter={8}>
        <Col lg={{ span: 4 }} md={{ span: 6 }} xs={{ span: 24 }}>
          <div className="mi-app-logo">
            <img src={Logo} alt="Logo" />
          </div>
        </Col>
        <Col lg={{ span: 20 }} md={{ span: 18 }} xs={{ span: 24 }}>
          <div className="mi-revenue-table__header">
            <h1>{getRefDate().format("MMM - YYYY")}</h1>
            <h4>
              As at: <span>{getRefDate().format("DD. MM. YYYY")}</span>
            </h4>
          </div>
          <RevenueTableHead />
        </Col>
      </Row>
      <Row gutter={8} type="flex">
        <Col xl={{ span: 4, order: 1 }} xs={{ span: 24, order: 2 }}>
          <OrgTargetList />
          <BillCalculator />
        </Col>
        <Col xl={{ span: 20, order: 2 }} xs={{ span: 24, order: 1 }}>
          <RevenueCollection />
        </Col>
      </Row>
    </div>
  );
};

export default Page;
