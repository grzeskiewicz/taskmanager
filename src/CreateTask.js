import React from 'react';
import socket from './User'

class CreateTask extends React.Component { //split into new task form and tasklist
    constructor(props) {
        super(props);
        this.state = { room: '', content: '' };
        this.handleRoom = this.handleRoom.bind(this);
        this.handleTaskContent = this.handleTaskContent.bind(this);
        this.createTask = this.createTask.bind(this);
    }

    handleTaskContent(event) {
        this.setState({ taskcontent: event.target.value });
    }

    handleRoom(event) {
        this.setState({ room: event.target.value });
    }

    createTask(event) {
        event.preventDefault();
        const task = {
            username: this.props.username,
            room: this.state.room,
            content: this.state.taskcontent
        };
        socket.emit('newtask', task);
        console.log('emit',task)
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
                </form>
            </div>

        );
    }
}


export default CreateTask;