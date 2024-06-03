import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import './Calendar.css';
import useCalendar from '../../store/Calendar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';

const Calendar = () => {
    const { currentEvents: storeEvents, setCurrentEvents } = useCalendar();
    const [currentEvents, setLocalEvents] = useState([]);

    const fetchFirestoreData = async () => {
        const userEmail = auth.currentUser?.email;

        if (!userEmail) {
            console.error('User email not available.');
            return;
        }

        try {
            const tasksCollection = collection(db, 'tasks');
            const q = query(tasksCollection, where('assignedTo', '==', userEmail));
            const querySnapshot = await getDocs(q);

            const events = [];
            querySnapshot.forEach((doc) => {
                const taskData = doc.data();
                const issuedDate = taskData.issuedDate ? taskData.issuedDate.toDate() : null;

                if (issuedDate) {
                    events.push({
                        title: taskData.title,
                        start: issuedDate,
                        allDay: true,
                    });
                }
            });

            setCurrentEvents(events);
            setLocalEvents(events); 
        } catch (error) {
            console.error('Error fetching Firestore data:', error);
        }
    };

    useEffect(() => {
        fetchFirestoreData();
    }, []); 

    const handleEvents = (events) => {
        setLocalEvents(events);
    };

    const handleDateSelect = (selectInfo) => {
        let title = prompt('Please enter a title for the event');
        let calendarApi = selectInfo.view.calendar;

        calendarApi.unselect();

        if (title) {
            const newEvent = {
                title,
                start: selectInfo.start,
                end: selectInfo.end,
                allDay: selectInfo.allDay,
            };
            setLocalEvents((prevEvents) => [...prevEvents, newEvent]);
            setCurrentEvents((prevEvents) => [...prevEvents, newEvent]);
        }
    };

    const handleEventClick = (clickInfo) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            const updatedEvents = currentEvents.filter((event) => event !== clickInfo.event);
            setLocalEvents(updatedEvents);
            setCurrentEvents(updatedEvents);
        }
    };

    return (
        <div className="calendar-container">
            <div>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    allDaySlot={false}
                    initialView="timeGridWeek"
                    slotDuration={'01:00:00'}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    nowIndicator={true}
                    events={storeEvents} 
                    eventsSet={handleEvents}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                />
            </div>
        </div>
    );
};

export default Calendar;
