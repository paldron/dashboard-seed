import React from "react";
import { Layout } from "antd";

import "./app-layout.styles.scss";

const { Content } = Layout;

class AppLayout extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <Layout className="app-right-layout">
        <Content className="mi-app-layout-content">
          <div className="page-custom">{children}</div>
        </Content>
        {/* <Footer style={{ textAlign: 'center' }}>MUWSA ©2019</Footer> */}
      </Layout>
    );
  }
}

export default AppLayout;
