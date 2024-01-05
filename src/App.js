import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import fiLocale from '@fullcalendar/core/locales/fi';
import ReactModal from 'react-modal';
import './Calendar.css';

ReactModal.setAppElement('#root');

function Calendar() {
    // ... other state variables ...
    const [isChecked, setIsChecked] = useState(false);
    const calendarRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [events, setEvents] = useState();
    const [daysEvents, setDaysEvents] = useState();
    const handleDeleteEvent = () => {
        fetch(`https://serveri-gopqbrbwda-oe.a.run.app/events/${selectedEvent.id}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            console.log('Success:', data);
            // Remove the deleted event from the events state
            const updatedEvents = events.filter(event => event.id !== selectedEvent.id);
            setEvents(updatedEvents);
            setModalVisible(false);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };
    

    const handleEventClick = async (info) => {
        console.log("Event clicked: ", info);
        const eventId = info.event.id;
    
        try {
            const response = await fetch(`https://serveri-gopqbrbwda-oe.a.run.app/events/${eventId}`);
            const event = await response.json();
            console.log("Event: ", event);
            setSelectedEvent({ id: eventId, title: event.title, description: event.description, starttime: event.starttime, ketatulos: event.ketatulos, start: event.start });
            setModalVisible(true);
            setIsEditing(true);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    
    const convertEvents = (serverEvents) => {
        return serverEvents.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        ketatulos: event.ketatulos,
        start: new Date(event.start), 
        end: new Date(event.start).setHours(new Date(event.start).getHours() + 1), 
    }))};

    const handleDateClick = async (info) => {
        // info.dateStr will contain the date clicked in the format 'YYYY-MM-DD'
        setSelectedDate(info.dateStr);
        setSelectedEvent(null);
        setIsEditing(false);
        try {
            const response = await fetch(`https://serveri-gopqbrbwda-oe.a.run.app/events/date/${info.dateStr}`);
            const events = await response.json();
            const convertedEvents = convertEvents(events);
            setDaysEvents(convertedEvents); // Set the events of the selected day
            setModalVisible(true);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleEventSubmit = (e) => {
        console.log('handleEventSubmit')
        e.preventDefault();
    
        if (isEditing) {
            // ... existing code for updating an event ...
        } else {
            const newEvent = {
                title: selectedEvent.title,
                start: selectedDate,
                description: selectedEvent.description,
                starttime: selectedEvent.starttime,
                ketatulos: selectedEvent.ketatulos,
            };
    
            // Send a POST request to the server
            fetch('https://serveri-gopqbrbwda-oe.a.run.app/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEvent),
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                const createdEvent = data;
                console.log('Success:', events);
                const convertedEvents = convertEvents([createdEvent]);
                setEvents([...events, ...convertedEvents]);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    
            setModalVisible(false);
        }
    };

    const fetchEvents = async () => {
        fetch('https://serveri-gopqbrbwda-oe.a.run.app/events')
          .then(response => response.json())
          .then(data => {
            data.forEach(event => {
                console.log(new Date(event.start))

            })
            const convertedEvents = convertEvents(data);
            return setEvents(convertedEvents)})
          .catch(error => console.error('Error:', error));
    }

    useEffect(() => {
        if (!events) {
            console.log('fetching events')
            fetchEvents()
        }
        
    }, [events]);

    const changeInput = (key, value) => {
        setSelectedEvent({ ...selectedEvent, [key]: value });
    }

    return (
        <div>
    <ReactModal
    isOpen={modalVisible}
    onRequestClose={() => setModalVisible(false)}
    contentLabel="Event Details"
    style={{
        overlay: {
            zIndex: 1000
        }
    }}
>
            
                <h2>Event Details</h2>
                <form onSubmit={handleEventSubmit}>
                    <div>  
                        <label>
                            Title:
                            <input type="text" value={(selectedEvent && selectedEvent.title) || ''} onChange={e => changeInput('title', e.target.value)} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Description:
                            <input type="text" value={(selectedEvent && selectedEvent.description) || ''} onChange={e => changeInput('description', e.target.value)} />
                        </label>
                    </div>      
                    <div>
                        <label>
                            Start time:
                            <input type="text" value={(selectedEvent && selectedEvent.starttime) || ''} onChange={e => changeInput('starttime', e.target.value)} />
                        </label>
                    </div>      
                    <div>
                        <label>
                            Ketä tulos:
                            <input type="text" value={(selectedEvent && selectedEvent.ketatulos) || ''} onChange={e => changeInput('ketatulos', e.target.value)} />
                        </label>
                    </div>      
                    <button type="submit" style={{backgroundColor: '#3a87ad', color: 'white'}}>
                        {isEditing ? 'Save Changes' : 'Add Event'}
                    </button>
                </form>
                <button onClick={() => setModalVisible(false)}>Close</button>
                {isEditing &&<button onClick={handleDeleteEvent} style={{backgroundColor: '#f00', color: 'white'}}>Delete Event</button>}

            </ReactModal>
            <FullCalendar
  ref={calendarRef}
  plugins={[dayGridPlugin, interactionPlugin]}
  displayEventTime={false}
  initialView="dayGridMonth"
  selectable={true}
  events={events} // pass the events here
  dateClick={handleDateClick}
  eventClick={handleEventClick}
  locale={fiLocale}
/>
        </div>
    );
}

export default Calendar;