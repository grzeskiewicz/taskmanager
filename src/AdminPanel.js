import React from 'react';
import socket from './User'
import { authServices } from './services.js';
import UserCreator from './UserCreator';
import CreateTask from './CreateTask';



class AdminPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedUsername: '', userStats: '' };
        this.selectUser = this.selectUser.bind(this);

    }
    componentDidMount() {
        socket.on('userlist', (async (msg) => {
            this.setState({ userStats: await this.getAllUsers(msg) });
        }));


    }
    componentWillUnmount() { }

    selectUser(user) {
        this.setState({ selectedUsername: user.username, tasklist: '' });
        console.log(this.state);
        socket.emit('gettasks', user.username);
    }

    getAllUsers(msg) {
        return authServices.getUsers().then(res => {
            const allUsersActivity = [];
            for (const user of res) {
                allUsersActivity.push({ username: user, online: false });
            }
            for (const user of allUsersActivity) {
                for (const userFromSocket of msg.userlist) {
                    if (user.username === userFromSocket) {
                        user.online = true;
                    }
                }
            }
            return allUsersActivity;
        });


    }

    render() {
        let selectedUsername = this.state.selectedUsername;
        let userStats = this.state.userStats;
        let userStatsMap = "Waiting for server data...";

        if (userStats !== '') {
            userStatsMap = this.state.userStats.map((user, index) => {
                console.log(user);
                return (
                    <li key={index} className={(this.state.selectedUsername === user.username ? 'selected' : '') + " " + (user.online === true ? 'online' : 'offline')} onClick={() => this.selectUser(user)}>{user.username}</li>
                );
            });

        }
        return (
            <div id="admin-panel">
                <div id="task-manager-wrapper">
                    <div id="userSelectionCreateTask-wrapper">
                        <div id="userlist"><ul>{userStatsMap}</ul></div>
                        {selectedUsername !== '' ? <CreateTask username={this.state.selectedUsername} /> : null }
                    </div>
                    {selectedUsername !== '' ? <SelectedUserTasks username={this.state.selectedUsername} /> : null}
                </div>
                
                <div id="user-manager">
                    <UserCreator />
                </div>

            </div>

        );
    }
}

class SelectedUserTasks extends React.Component { //split into new task form and tasklist
    constructor(props) {
        super(props);
        this.state = { tasklist: '' };
    }


    componentDidMount() {
        socket.on('usertasks', (tasklist => {
            if (tasklist[0] && tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
            if (!tasklist[0]) this.setState({ tasklist: '' });
            console.log(this.state);
        }));

        socket.on('timeup', (tasklist => {
            if (tasklist[0] && tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
            console.log('timeup', this.state);


        }));

        socket.on('overdue', (tasklist => {
            if (tasklist[0] && tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
            console.log('overdue', this.state);

        }));

        socket.on('countdown', (tasklist => {
            if (tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
            console.log('countdown', this.state);

        }));

        socket.on('userfinished', (tasklist => {
            if (tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
            console.log('finished', this.state);

        }));


        socket.on('cancelled', (tasklist => {
            if (tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
            console.log('cancl', this.state);

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
        socket.emit('cancel', task);
    }


    render() {
        const tasklist = this.state.tasklist ? [...this.state.tasklist].map((task, index) => {
            return (
                <tr key={index}>
                    <td>{task.room}</td>
                    <td>{task.content}</td>
                    <td>{task.status}</td>
                    <td>{this.parseTimeLeft(task.timetoaccept)}</td>
                    <td>{this.parseTimeLeft(task.timeleft)}</td>
                    <td className="cancel">{task.status === 'cancelled' || task.status === 'done' ? '-' : <button onClick={() => this.cancelTask(task)}>Cancel</button>}</td>
                    <td><button onClick={() => this.restartTask(task)}>Restart</button></td>
                </tr>
            );
        }) : null;

        return (
            <div id="task-manager">
                <table id="tasks">
                    <thead><tr><th>Room</th><th>Content</th><th>Status</th><th>Time to accept</th><th>Timeleft</th><th>Cancel</th><th>Restart</th></tr></thead>
                    <tbody>{tasklist}</tbody>
                </table>
            </div>

        );
    }
}


export default AdminPanel;