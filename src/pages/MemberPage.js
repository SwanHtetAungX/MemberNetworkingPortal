import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import ActiveMembersTable from '../components/ActiveMemberTable';
import PendingMembersTable from '../components/PendingMemberTable';
import SuspendedMembersTable from '../components/SuspenedMemberTable';

const { TabPane } = Tabs;

function MembersPage() {
  const [tabTitles, setTabTitles] = useState({
    active: "Active Members",
    pending: "Pending Members",
    suspended: "Suspended Members"
  });

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setTabTitles({
          active: "Active",
          pending: "Pending",
          suspended: "Suspended"
        });
      } else {
        setTabTitles({
          active: "Active Members",
          pending: "Pending Members",
          suspended: "Suspended Members"
        });
      }
    }

    window.addEventListener('resize', handleResize);

  
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: 'center', fontFamily: "Montserrat", marginBottom: "30px" }}>Member Management</h1>
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab={tabTitles.active} key="1">
          {<ActiveMembersTable/>}
        </TabPane>
        <TabPane tab={tabTitles.pending} key="2">
          {<PendingMembersTable/>}
        </TabPane>
        <TabPane tab={tabTitles.suspended} key="3">
          {<SuspendedMembersTable/>}
        </TabPane>
      </Tabs>
    </div>
  );
}

export default MembersPage;
