import React from 'react';
import { List, Button, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const EventCardList = ({ selectedDate, events, onEditEvent, onDeleteEvent, onCreateEvent }) => {
  return (
    <Card
      title={`Events on ${selectedDate || 'Select a Date'}`}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateEvent}>
          Add Event
        </Button>
      }
      style={{ width: '100%' }}
    >
      <List
        itemLayout="horizontal"
        dataSource={events}
        renderItem={event => (
          <List.Item
            actions={[
              /* Edit Button with Edit icon */
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() => onEditEvent(event)}>
              </Button>,

              /* Delete Button with Delete icon */
              <Button
                key="delete"
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDeleteEvent(event._id)}>
              </Button>
            ]}
          >
            <List.Item.Meta
              title={event.title}
              description={`${event.date} - ${event.location}`}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default EventCardList;
