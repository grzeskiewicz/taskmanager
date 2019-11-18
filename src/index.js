import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { authServices } from './services.js';
import io from 'socket.io-client';


const socket = io('https://taskmanager-node.herokuapp.com');



class SelectedUserTasks extends React.Component { //split into new task form and tasklist
    constructor(props) {
        super(props);
        this.state = { tasklist: '' };

    }


    componentDidMount() {
        socket.on('usertasks', (tasklist => {
            if (tasklist[0] && tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
            if (!tasklist[0]) this.setState({ tasklist: '' });
        }));

        socket.on('timesup', (tasklist => {
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
            console.log(task);
            return (
                <tr key={index}><td>{task.room}</td><td>{task.content}</td><td>{task.status}</td><td>{this.parseTimeLeft(task.timetoaccept)}</td><td>{this.parseTimeLeft(task.timeleft)}</td><td className="cancel">{task.status === 'cancelled' || task.status === 'done' ? '-' : <button onClick={() => this.cancelTask(task)}>Cancel</button>}</td></tr>
            );
        }) : null;

        return (
            <div id="task-manager">
                <NewTask username={this.props.username} />
                <table id="tasks">
                    <thead><tr><th>Room</th><th>Content</th><th>Status</th><th>Time to accept</th><th>Timeleft</th><th>Cancel</th></tr></thead>
                    <tbody>{tasklist}</tbody>
                </table>
            </div>

        );
    }
}



class NewTask extends React.Component { //split into new task form and tasklist
    constructor(props) {
        super(props);
        this.state = { room: '', content: '' };
        this.handleRoom = this.handleRoom.bind(this);
        this.handleTaskContent = this.handleTaskContent.bind(this);
        this.newTask = this.newTask.bind(this);
    }

    handleTaskContent(event) {
        this.setState({ taskcontent: event.target.value });
    }

    handleRoom(event) {
        this.setState({ room: event.target.value });
    }

    newTask(event) {
        event.preventDefault();
        const task = {
            username: this.props.username,
            room: this.state.room,
            content: this.state.taskcontent
        };
        console.log(task);
        socket.emit('newtask', task);
        event.target.reset();
        this.setState({ taskcontent: '', room: '' });
    }

    render() {
        return (
            <div id="new-task">
                <form onSubmit={this.newTask}>
                    <input name='room' autoFocus placeholder='Room Place' value={this.state.room} onChange={this.handleRoom} required></input>
                    <textarea name='taskcontent' placeholder='Task to do' value={this.state.taskcontent} onChange={this.handleTaskContent} required></textarea>
                    <button type='submit'>Send task</button>
                </form>
            </div>

        );
    }
}

class AdminPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '' };
        this.selectUser = this.selectUser.bind(this);

    }
    componentDidMount() { }
    componentWillUnmount() { }

    selectUser(user) {
        this.setState({ username: user, active: user, tasklist: '' });
        socket.emit('gettasks', user);
    }

    render() {
        let username = this.state.username;

        socket.on('userlist', (msg => {
            this.setState({ userlist: msg.userlist })
        }));

        const userlist = String(this.state.userlist).split(',').map((user, index) => {
            return (
                <li key={index} className={this.state.active === user ? 'active' : ''} onClick={() => this.selectUser(user)}>{user}</li>
            );
        });


        return (
            <div id="admin-panel">
                <ul className="userlist">{userlist}</ul>
                {username ? <SelectedUserTasks username={this.state.username} /> : null}
            </div>

        );
    }
}


class Task extends React.Component { //single task with it's own time state
    constructor(props) {
        super(props);
        this.state = { timetoaccept: '', timeleft: '', showtask: true };
        socket.on('countdown', (tasklist => {
            for (const taskElem of tasklist) {
                if (taskElem.room === this.props.task.room && taskElem.content === this.props.task.content) this.setState({ timeleft: taskElem.timeleft });
                if (taskElem.status === "new") this.setState({ timetoaccept: taskElem.timetoaccept });
            }
        }));



    }
    acceptTask(task) {
        socket.emit('accept', task);
        this.setState({ timeleft: 240 });
    }


    finishTask(task) {
        socket.emit('finish', task);
    }

    toggleTask(task) {
        this.setState({ showtask: !this.state.showtask });
    }

    parseTimeLeft(time) {
        const minutes = Math.floor(time / 60) < 10 ? `0${Math.floor(time / 60)}` : Math.floor(time / 60);
        const seconds = time % 60 < 10 ? `0${time % 60}` : time % 60;
        return `${minutes}:${seconds}`;
    }

    render() {
        return (
            <div className="task">
                <p onClick={() => this.toggleTask(this.props.task)}>{this.state.showtask ? 'Hide task' : `Showtask ${this.parseTimeLeft(this.state.timeleft)}`}</p>
                {this.state.showtask ? <div>
                    <p>Status: {this.props.task.status} </p>
                    <p>Room: {this.props.task.room}</p>
                    <p>Task: {this.props.task.content} </p>
                    <p>Time to accept: {this.parseTimeLeft(this.props.task.timetoaccept)} </p>
                    <p>Time: {this.parseTimeLeft(this.props.task.timeleft)} </p>

                    {(this.props.task.status !== 'new') ? '' : <button onClick={() => this.acceptTask(this.props.task)}>Accept the task</button>}
                    {(this.props.task.status === 'pending' || this.props.task.status === 'timesup') ? <button onClick={() => this.finishTask(this.props.task)}>Finish the task</button> : ''}

                </div> : ''}
            </div>
        );
    }
}

class UserPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tasks: [] };

    }
    componentDidMount() {
        socket.on('taskreceived', (task => {
            console.log(task);
            this.setState({ tasks: this.state.tasks.concat(task) });
        }));

        socket.on('usertasks', (tasklist => {
            this.setState({ tasks: tasklist });
        }));
        socket.on('timesup', (tasklist => {
            this.setState({ tasks: tasklist });

        }));

        socket.on('countdown', (tasklist => {
            this.setState({ tasks: tasklist });

        }));

        socket.on('userfinished', (tasklist => {
            this.setState({ tasks: tasklist });
        }));

        socket.on('cancelled', (tasklist => {
            this.setState({ tasks: tasklist });
        }));
    }
    componentWillUnmount() { }


    //socket has to have name-username

    //socket->in case of sending task to user->get this data over socket->refresh the panel with the tasks
    //task has time limit, content, done icon, get icon
    // admin has ready templates of messages to send (only today's tasks can be displayed)
    // (role->admin, role->user, role->manager)
    //admin-displays only logged users
    //admin-selects user->create task, delete task->info sent via socket
    // when receiving task->ALERT TO PHONE or SMS(?)
    // task when done->send info to admin

mapTasks (taskStatus) {

}

    render() {
        const tasks = this.state.tasks;
        const tab=[];
        for (let task of tasks){
            if (tab[task['status']] === undefined) tab[task.status] = [];
            tab[task.status].push(task);
        }



        const newTasksRender = tab['new'] ? tab['new'].map((task, index) => { // POPRAWIĆ
            return (
                <Task key={index} task={task} />
            );
        }): '';


        const doneTasksRender = tab['done'] ? tab['done'].map((task, index) => {
            return (
                <Task key={index} task={task} />
            );
        }): '';

        return (
            <div id="user-panel">
                <div id="new-tasks">{newTasksRender}</div>
                <div id="pending-tasks"></div>
                <div id="done-tasks">{doneTasksRender}</div>
            </div>

        );
    }
}


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.handleUsername = this.handleUsername.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
    }
    handleLogin(event) {
        event.preventDefault();
        const user = {
            username: this.props.username,
            password: this.props.password
        };
        this.props.login(user);
    }
    handleUsername(event) {
        this.props.setUsername(event.target.value);
    }
    handlePassword(event) {
        this.props.setPassword(event.target.value);
    }
    /*
     */
    render() {


        return (
            <div className='login'>
                <form onSubmit={this.handleLogin}>
                    <input name='username' autoFocus placeholder='Your username' value={this.props.username} onChange={this.handleUsername} required></input>
                    <input type='password' id='password' name='password' placeholder='Password' value={this.props.password} onChange={this.handlePassword} required></input>
                    <button type='submit'>Login</button>
                </form>

            </div>
        );
    }
}

class Logout extends React.Component {
    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout() {
        this.props.logout();
    }

    render() {
        const username = this.props.username;
        return (
            <div id="userinfo">
                {username} <button onClick={this.handleLogout}>Logout</button>
            </div>
        );
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '', password: '', role: '', authorised: false, admin: false };
        this.setUsername = this.setUsername.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }
    login(user) {
        authServices.login(user)
            .then(res => {
                if (res.success) {
                    authServices.getInfo().then(res => {
                        if (res.success) {
                            socket.emit('logged', this.state.username);
                            const admin = res.role === "admin" ? true : false;
                            this.setState({ authorised: true, role: res.role, admin: admin, password: '' });
                        } else {
                            this.setState({ authorised: false });
                        }
                    })
                } else {
                    this.setState({ authorised: false });
                }
            });
    }


    logout() {
        authServices.logout();
        socket.emit('logout', this.state.username);
        this.setState({ username: '', password: '', role: '', authorised: false, admin: false });
    }

    setUsername(username) {
        this.setState({ username: username });
    }

    setPassword(password) {
        this.setState({ password: password });
    }

    /* { this.state.authorised ? <div id="userinfo"> {this.state.username} <button onClick={this.logout}>Logout</button></div> 

     : login form!*/
    render() {
        return (
            <div id="board">
                {
                    !this.state.authorised ?
                        <Login
                            username={this.state.username}
                            password={this.state.password}
                            setUsername={this.setUsername}
                            setPassword={this.setPassword}
                            login={this.login} />
                        :
                        <Logout username={this.state.username} logout={this.logout} />
                }

                {this.state.authorised && this.state.admin === false ? <UserPanel user={this.state} /> : null}
                {this.state.admin ? <AdminPanel user={this.state} /> : null}
            </div>
        );
    }
}



// ========================================

ReactDOM.render(
    <Board />,
    document.getElementById('root')
);