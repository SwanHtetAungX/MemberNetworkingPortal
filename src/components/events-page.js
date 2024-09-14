import React, { useState, useEffect } from 'react';
import { Typography, Modal, Button, Form, Input, Checkbox} from 'antd';
import EventCalendar from './eventCalendar';
import EventCardList from './eventCardList';

const { Title } = Typography;

const EventPage = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventDates, setEventDates] = useState(new Set());
    const [isCreateModalVisible, setCreateModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [form] = Form.useForm(); // Form instance for Create and Edit

    
      // Function to refresh event dates and update the calendar
    const refreshEventDates = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5050/event/dates', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            setEventDates(new Set(result.dates));
        } catch (error) {
            console.error('Error fetching event dates:', error.message);
        }
    };

    // Fetch events based on selected date
    const fetchEvents = async (date) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5050/event/?date=${date}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();
            setEvents(result);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    useEffect(() => {
        if (selectedDate) fetchEvents(selectedDate);
    }, [selectedDate]);

    // Handle Create Event
    const handleCreateEvent = async (values) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch('http://localhost:5050/event/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...values,
                    date: selectedDate, // Set the selected date as the event date
                }),
            });
            setCreateModalVisible(false);
            form.resetFields(); // Reset form after submission
            fetchEvents(selectedDate);  // Refresh events list
            await refreshEventDates();// call function to update calendar
        } catch (error) {
            console.error("Error creating event:", error);
        }
    };

    // Handle Edit Event
    const handleEditEvent = async (values) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`http://localhost:5050/event/update/${currentEvent._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });
            setEditModalVisible(false);
            fetchEvents(selectedDate);  // Refresh events list
            await refreshEventDates();// call function to update calendar
        } catch (error) {
            console.error("Error editing event:", error);
        }
    };

    // Handle Delete Event
    const handleDeleteEvent = async (eventId) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`http://localhost:5050/event/delete/${eventId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchEvents(selectedDate);  // Refresh events list
            await refreshEventDates();// call function to update calendar
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    // Open the Create Event modal
    const openCreateModal = () => {
        form.resetFields();  // Reset form fields before creating new event
        setCreateModalVisible(true);
    };

    // Open the Edit Event modal with the selected event
    const openEditModal = (event) => {
        setCurrentEvent(event);
        form.setFieldsValue(event);  // Populate form with event data for editing
        setEditModalVisible(true);
    };

    return (
        <div className="mt-5">
            <Title level={3}>Event Planning</Title>
            <div className="row">
                <div className="col-md-7">
                    <EventCalendar onDateSelect={setSelectedDate} 
                    refreshEventDates={refreshEventDates}/>
                </div>

                {selectedDate && (
                    <div className="col-md-5">
                        <EventCardList
                            selectedDate={selectedDate}
                            events={events}
                            onEditEvent={openEditModal}
                            onDeleteEvent={handleDeleteEvent}
                            onCreateEvent={openCreateModal}
                        />
                    </div>
                )}
            </div>

            {/* Create Event Modal */}
            <Modal
                title="Create Event"
                visible={isCreateModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                footer={null}  // Use form submit instead of modal footer buttons
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateEvent}  // Calls handleCreateEvent on form submission
                >
                    <Form.Item
                        name="title"
                        label="Event Title"
                        rules={[{ required: true, message: 'Please enter the event title' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="location"
                        label="Location"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="time"
                        label="Time"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        name="isPublic"
                        valuePropName="checked"
                        label="Public Event"
                    >
                        <Checkbox />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save Event
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Event Modal */}
            <Modal
                title="Edit Event"
                visible={isEditModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={null}  // Use form submit instead of modal footer buttons
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditEvent}  // Calls handleEditEvent on form submission
                >
                    <Form.Item
                        name="title"
                        label="Event Title"
                        rules={[{ required: true, message: 'Please enter the event title' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="location"
                        label="Location"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="time"
                        label="Time"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        name="isPublic"
                        valuePropName="checked"
                        label="Public Event"
                    >
                        <Checkbox />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Update Event
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EventPage;
