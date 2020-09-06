import React from 'react';
import socket from './User'
import './css/createTask.css';


class CreateTask extends React.Component { //split into new task form and tasklist
    constructor(props) {
        super(props);
        this.state = { room: '', content: '', roomError: '' };
        this.handleRoom = this.handleRoom.bind(this);
        this.handleTaskContent = this.handleTaskContent.bind(this);
        this.createTask = this.createTask.bind(this);
    }

    handleTaskContent(event) {
        this.setState({ taskcontent: event.target.value });
    }

    handleRoom(event) {
        isNaN(Number(event.target.value)) ? this.setState({ roomError: 'Room has to be a number!', room: event.target.value }) : this.setState({ room: event.target.value, roomError: '' });
    }

    createTask(event) {
        event.preventDefault();
        let sendOffline = true;
        if (!this.props.isSelectedUserOnline) {
            sendOffline = window.confirm(`Are you sure you want to send a task to ${this.props.username}? User is OFFLINE!`);
        }

        if (sendOffline) {
            const task = {
                username: this.props.username,
                room: this.state.room,
                content: this.state.taskcontent
            };
            socket.emit('newtask', task);
        }

        event.target.reset();
        this.setState({ taskcontent: '', room: '' });

    }

    render() {
        return (
            <div id="create-task">
                <form onSubmit={this.createTask}>
                    <input name='room' autoFocus placeholder='Room Place' value={this.state.room} onChange={this.handleRoom} required></input>
                    <textarea name='taskcontent' placeholder='Task to do' value={this.state.taskcontent} onChange={this.handleTaskContent} required></textarea>
                    <button type='submit'>Send task</button>
                    {this.state.roomError !== '' ? <p>{this.state.roomError}</p> : ''}
                </form>
            </div>
        );
    }
}


export default CreateTask;