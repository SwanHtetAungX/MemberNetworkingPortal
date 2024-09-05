import React from 'react';
import { Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const EventCardList = ({ selectedDate, events, setIsModalVisible }) => {
  return (
    <Card
      title={`Events for ${selectedDate}`}
      extra={<Button icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Event</Button>}
    >
      <ul>
        {events.length > 0 ? (
          events.map((event, index) => (
            <li key={index}>{event.title}</li>
          ))
        ) : (
          <li>No events for this day</li>
        )}
      </ul>
    </Card>
  );
};

export default EventCardList;
