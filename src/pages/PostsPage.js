import React, { useState, useEffect } from "react";
import { Tabs } from "antd";

import PendingPostsTable from "../components/PendingPostTable";
import ReportedPostsTable from "../components/ReportedPostTable";

const { TabPane } = Tabs;

function PostsPage() {
  const [tabTitles, setTabTitles] = useState({
    pending: "Pending Posts",
    suspended: "Reported Posts",
  });

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setTabTitles({
          pending: "Pending",
          suspended: "Reported",
        });
      } else {
        setTabTitles({
          pending: "Pending Posts",
          suspended: "Reported Posts",
        });
      }
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          fontFamily: "Montserrat",
          marginBottom: "30px",
        }}
      >
        Posts Management
      </h1>
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab={tabTitles.pending} key="1">
          {<PendingPostsTable />}
        </TabPane>
        <TabPane tab={tabTitles.suspended} key="2">
          {<ReportedPostsTable />}
        </TabPane>
      </Tabs>
    </div>
  );
}

export default PostsPage;
