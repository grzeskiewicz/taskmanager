import React from 'react';
import socket from './User'
import './css/adminPanel.css';
import Reports from './Reports';
import { authServices } from './services.js';
import UserCreator from './UserCreator';
import UserEditor from './UserEditor';
import CreateTask from './CreateTask';



class AdminPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedUsername: '', userStats: '', showUserCreator: false, showMenu: '' };
        this.selectUser = this.selectUser.bind(this);
        this.showUserCreator = this.showUserCreator.bind(this);

    }
    componentDidMount() {
        socket.on('userlist', (async (msg) => {
            this.setState({ userStats: await this.getAllUsers(msg) });
        }));


    }
    componentWillUnmount() { }

    selectUser(user) {
        this.setState({ selectedUsername: user.username, tasklist: '' });
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


    showMenu(n) {
        this.setState({ showMenu: n });
    }


    showUserCreator() {
        this.setState({ showUserCreator: !this.state.showUserCreator });
        console.log(this.state.showUserCreator);
    }

    render() {
        let selectedUsername = this.state.selectedUsername;
        let userStats = this.state.userStats;
        let userStatsMap = "Waiting for server data...";

        if (userStats !== '') {
            userStatsMap = this.state.userStats.map((user, index) => {
                console.log(user);
                return (
                    <li key={index} className={(this.state.selectedUsername === user.username ? 'selected' : '')} onClick={() => this.selectUser(user)}>
                        <figure className={(user.online === true ? 'online' : 'offline')}>&bull;</figure>
                        {user.username}
                    </li>
                );
            });

        }
        return (
            <div id="admin-panel">
                <div id="menu">
                    <div onClick={() => this.showMenu(1)}>TASK MANAGER</div>
                    <div onClick={() => this.showMenu(2)}>USER MANAGER</div>
                    <div onClick={() => this.showMenu(3)}>REPORTS</div>
                </div>

                {this.state.showMenu === 1 ?
                    <div id="task-manager-wrapper">
                        <div id="userlist"><ul>{userStatsMap}</ul></div>
                        {selectedUsername !== '' ?
                            <div id="task-div">
                                <CreateTask username={this.state.selectedUsername} />
                                <SelectedUserTasks username={this.state.selectedUsername} />
                            </div>
                            : null}
                    </div>
                    : ''}

                {this.state.showMenu === 2 ?
                    <div id="user-manager">
                        <UserEditor userStats={this.state.userStats} />
                        {this.state.showUserCreator ? <UserCreator showUserCreator={() => this.showUserCreator} /> : <button id="showUserCreator" onClick={this.showUserCreator}> Add new user</button>}
                    </div>
                    : ''}

                {this.state.showMenu === 3 ? <Reports /> : ''}

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


        socket.on('reset', (tasklist => {
            if (tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
            console.log('reset', this.state);

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
        console.log('cancelling', task);
        socket.emit('cancel', task);
    }

    resetTask(task) {
        socket.emit('reset', task);
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
                    <td className="reset">{task.status === 'overdue' || task.status === 'timeup' ? <button onClick={() => this.resetTask(task)}>Reset</button> : '-'}</td>
                </tr>
            );
        }) : null;

        return (
            <div id="task-manager">
                <table id="tasks">
                    <thead><tr><th>Room</th><th>Content</th><th>Status</th><th>Time to accept</th><th>Timeleft</th><th>Cancel</th><th>Reset</th></tr></thead>
                    <tbody>{tasklist}</tbody>
                </table>
            </div>

        );
    }
}




export default AdminPanel;