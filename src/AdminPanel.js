import React from 'react';
import socket from './User'
import './css/adminPanel.css';
import Reports from './Reports';
import { authServices } from './services.js';
import UserCreator from './UserCreator';
import UserEditor from './UserEditor';
import CreateTask from './CreateTask';
import SelectedUserTasks from './SelectedUserTasks';



class AdminPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedUsername: '', isSelectedUserOnline: '', userStats: '', showUserCreator: false, showMenu: '' };
        this.selectUser = this.selectUser.bind(this);
        this.showUserCreator = this.showUserCreator.bind(this);

    }
    componentDidMount() {
        socket.on('userlist', (async (msg) => {
            this.setState({ userStats: await this.getAllUsers(msg) });
            console.log(this.state);
            if (this.state.selectedUsername !== '') { //updating user status when user already selected
                for (const userState of this.state.userStats) {
                    if (userState.username === this.state.selectedUsername && userState.online) {
                        this.setState({ isSelectedUserOnline: true });
                        console.log(this.state);
                    }
                }
            }
        }));


    }
    componentWillUnmount() { }

    selectUser(user) {
        this.setState({ selectedUsername: user.username, tasklist: '', isSelectedUserOnline: user.online });
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
                                <SelectedUserTasks username={this.state.selectedUsername} />
                                <CreateTask username={this.state.selectedUsername} isSelectedUserOnline={this.state.isSelectedUserOnline} />
                            </div>
                            : null}
                    </div>
                    : ''}

                {this.state.showMenu === 2 ?
                    <div id="user-manager">
                        <UserEditor userStats={this.state.userStats} />
                        {this.state.showUserCreator ? <UserCreator showUserCreator={() => this.showUserCreator} /> : <div id="showUserCreator"><button onClick={this.showUserCreator}> Add new user</button></div>}
                    </div>
                    : ''}

                {this.state.showMenu === 3 ? <Reports /> : ''}

            </div>

        );
    }
}





export default AdminPanel;