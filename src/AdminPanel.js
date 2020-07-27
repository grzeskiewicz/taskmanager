import React from 'react';
import socket from './User'
import './css/adminPanel.css';
import Calendar from './Calendar';
import { authServices } from './services.js';
import { API_URL, request } from './apiconnection.js'; //request
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
                    <li key={index} className={(this.state.selectedUsername === user.username ? 'selected' : '') + " " + (user.online === true ? 'online' : 'offline')} onClick={() => this.selectUser(user)}>{user.username}</li>
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
                        <div id="userSelectionCreateTask-wrapper">
                            <div id="userlist"><ul>{userStatsMap}</ul></div>
                            {selectedUsername !== '' ? <CreateTask username={this.state.selectedUsername} /> : null}
                        </div>
                        {selectedUsername !== '' ? <SelectedUserTasks username={this.state.selectedUsername} /> : null}
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


class Reports extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tasks: '', tasksSelectedMonth: '' };
        this.handleDaySelection = this.handleDaySelection.bind(this);
        this.handleMonthSelection = this.handleMonthSelection.bind(this);
    }

    componentDidMount() {
    }

    handleMonthSelection(month, year) {

        fetch(request(`${API_URL}/gettasksmonth`, 'POST', { month: month, year: year }))
            .then(res => res.json())
            .then(result => {
                console.log(result.tasks);
                this.setState({ tasksSelectedMonth: result.tasks });
            })
            .catch(error => Promise.reject(new Error(error)));
    }

    handleDaySelection(date) {

        fetch(request(`${API_URL}/gettasksday`, 'POST', { date: date }))
            .then(res => res.json())
            .then(result => {
                this.setState({ tasks: result.tasks });
            })
            .catch(error => Promise.reject(new Error(error)));
    }

    render() {
        let summaryReport = 'X';
        let summaryReportTab = [];
        let tasksOfUser = [];
        let totalAmount = 0;
        let statusTaskAmount = '';
        let userStatistics = '';

        let monthlyTaskAmount = 0;
        let summaryReportTabMonth = [];
        let tasksOfUserMonth = [];
        let statusTaskAmountMonth = '';
        let userStatisticsMonth = '';


        if (this.state.tasks !== '') {
            totalAmount = this.state.tasks.length;

            for (const task of this.state.tasks) {
                if (summaryReportTab[task.status] === undefined) summaryReportTab[task.status] = [];
                summaryReportTab[task.status].push(task);

                if (tasksOfUser[task.username] === undefined) tasksOfUser[task.username] = [];
                tasksOfUser[task.username].push(task);
            }



            statusTaskAmount = Object.entries(summaryReportTab).map((obj, index) => {
                return (
                    <p key={index}>{obj[0]}:{obj[1].length}</p>
                );
            });



            userStatistics = Object.entries(tasksOfUser).map((obj, index) => {
                return (
                    <p key={index}>{obj[0]}:{obj[1].length}</p>
                );
            });



            for (const obj of Object.entries(tasksOfUser)) { // sort every users task to the groups of status
                //  obj[1]; -all the users's task, sort em


            }

            /*  summaryReport = this.state.tasks.map((task, index) => {
                  console.log(task);
                  return (
                      <p key={index}>{task._id}</p>
                  );
              });*/
        }


        if (this.state.tasksSelectedMonth !== '') {
            monthlyTaskAmount = this.state.tasksSelectedMonth.length;

            for (const task of this.state.tasksSelectedMonth) {
                if (summaryReportTabMonth[task.status] === undefined) summaryReportTabMonth[task.status] = [];
                summaryReportTabMonth[task.status].push(task);

                if (tasksOfUserMonth[task.username] === undefined) tasksOfUserMonth[task.username] = [];
                tasksOfUserMonth[task.username].push(task);
            }



            statusTaskAmountMonth = Object.entries(summaryReportTabMonth).map((obj, index) => {
                return (
                    <p key={index}>{obj[0]}:{obj[1].length}</p>
                );
            });



            userStatisticsMonth = Object.entries(tasksOfUserMonth).map((obj, index) => {
                return (
                    <p key={index}>{obj[0]}:{obj[1].length}</p>
                );
            });


        }

        return (
            <div id="reports">
                <Calendar handleDaySelection={this.handleDaySelection} handleMonthSelection={this.handleMonthSelection} />
                <div id="summary-report">
                    {this.state.tasks !== '' ?
                        <div id="daily-report">
                            <p>Total tasks today: {totalAmount}</p>
                            <div id="tasksPerStatus">{statusTaskAmount}</div>
                            <div id="userStatistics"><p>User statistics:</p>{userStatistics}</div>
                        </div> : ''}
                    {this.state.tasksSelectedMonth !== '' ?
                        <div id="monthly-report">
                            <p>Tasks this month:{monthlyTaskAmount}</p>
                            <div id="tasksPerStatusMonth">{statusTaskAmountMonth}</div>
                            <div id="userStatisticsMonth"><p>User statistics:</p>{userStatisticsMonth}</div>
                        </div>
                        : ''}
                </div>
            </div>
        );
    }
}


export default AdminPanel;