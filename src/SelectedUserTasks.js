import React from 'react';
import socket from './User'
import './css/adminPanel.css';

class SelectedUserTasks extends React.Component { //split into new task form and tasklist
    constructor(props) {
        super(props);
        this.state = { tasklist: '' };
    }


    componentDidMount() { // TODO: check those below
        socket.on('usertasks', (tasklist => {
            if (tasklist[0] && tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
            if (!tasklist[0]) this.setState({ tasklist: '' });
        }));

        socket.on('timeup', (tasklist => {
            if (tasklist[0] && tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });


        }));

        socket.on('overdue', (tasklist => {
            if (tasklist[0] && tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });

        }));

        socket.on('countdown', (tasklist => {
            if (tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
        }));

        socket.on('userfinished', (tasklist => {
            if (tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
        }));


        socket.on('cancelled', (tasklist => {
            if (tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
        }));


        socket.on('reset', (tasklist => {
            if (tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
        }));


        socket.on('userlogout', (username => {
            console.log(this.props.username, username);
        }));
    }
    componentWillUnmount() { }


    parseTimeLeft(time) {
        const minutes = Math.floor(time / 60) < 10 ? `0${Math.floor(time / 60)}` : Math.floor(time / 60);
        const seconds = time % 60 < 10 ? `0${time % 60}` : time % 60;
        return `${minutes}:${seconds}`;
    }


    cancelTask(task) {
        console.log(task);
        socket.emit('cancel', task);
    }

    resetTask(task) {
        console.log(task);
        socket.emit('reset', task);
    }


    render() {
        const tasklist = this.state.tasklist ? [...this.state.tasklist].map((task, index) => {
            const startDate = new Date(task.date);
            const hh= startDate.getHours() < 10 ? `0${startDate.getHours()}` : `${startDate.getHours()}`;
            const mm = startDate.getMinutes() < 10 ? `0${startDate.getMinutes()}` : `${startDate.getMinutes()}`;
            const start = `${hh}:${mm}`;
        return (
            <tr key={index}>
                <td>{task.room}</td>
                <td>{task.content}</td>
                <td>{task.status}</td>
                <td>{this.parseTimeLeft(task.timetoaccept)}</td>
                <td>{this.parseTimeLeft(task.timeleft)}</td>
                <td>{start}</td>
                <td className="cancel">{task.status === 'cancelled' || task.status === 'done' ? '-' : <button onClick={() => this.cancelTask(task)}>Cancel</button>}</td>
                <td className="reset">{task.status === 'overdue' || task.status === 'timeup' ? <button onClick={() => this.resetTask(task)}>Reset</button> : '-'}</td>
            </tr>
        );
    }) : <tr><td></td><td></td><td></td><td>No tasks sent to user yet.</td><td></td><td></td><td></td><td></td></tr>;

return (
    <div id="task-manager">
        <table id="tasks">
            <thead><tr><th>Room</th><th>Content</th><th>Status</th><th>Time to accept</th><th>Timeleft</th><th>Creation time</th><th>Cancel</th><th>Reset</th></tr></thead>
            <tbody>{tasklist}</tbody>
        </table>
    </div>

);
    }
}


export default SelectedUserTasks;