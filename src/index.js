import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { authServices } from './services.js';
import io from 'socket.io-client';


const socket = io('https://taskmanager-node.herokuapp.com');
socket.on('test', (msg => {
    console.log(msg);
}));


class User extends React.Component {
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
        socket.emit('newtask', task);
        console.log(task);
    }

    render() {
        return (
            <div>
<div>
        <form onSubmit={this.newTask}>
            <input name='room' autoFocus placeholder='Room Place' value={this.state.room} onChange={this.handleRoom} required></input>
            <textarea placeholder='Task to do' value={this.state.taskcontent} onChange={this.handleTaskContent} required></textarea>
            <button type='submit'>Send task</button>
        </form>  
</div>

<div>Cancel the task</div>

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

    selectUser(user) {
        console.log(user);
        this.setState({ username: user });
    }

    render() {
        let username = this.state.username;

        socket.on('userlist', (msg => {
            this.setState({ userlist: msg.userlist })
        }));

        const userlist = String(this.state.userlist).split(',').map((user, index) => {
            return (
                <li key={index} onClick={() => this.selectUser(user)}>{user}</li>
            );
        });
        return (
            <div>
            <ul>{userlist}</ul> 
            {username ? <User username={username} /> : null}
      </div>

        );
    }
}

class Panel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tasks: [] };
        this.userSocket = io(`https://taskmanager-node.herokuapp.com/${props.user.username}`);
    }



    //socket has to have name-username

    //socket->in case of sending task to user->get this data over socket->refresh the panel with the tasks
    //task has time limit, content, done icon, get icon
    // admin has ready templates of messages to send (only today's tasks can be displayed)
    // (role->admin, role->user, role->manager)
    //admin-displays only logged users
    //admin-selects user->create task, delete task->info sent via socket
    // when receiving task->ALERT TO PHONE or SMS(?)
    // task when done->send info to admin
    render() {
        this.userSocket.on('taskreceived', (task => {

            this.setState({ tasks: this.state.tasks.concat(task) });
            console.log(this.state);
        }));
const tasks=this.state.tasks;

const taskrender=tasks.map((task, index) => {
            return (
                <li key={index}>{task.room}:{task.content}</li>
            );
        });

        return (
            <div id="task-group">
            <div id="new-task">{taskrender}</div>
            <div id="pending-tasks"></div>
            <div id="done-tasks">done</div>
      </div>

        );
    }
}


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '', password: '', role: '', authorised: false, admin: false };

        this.handleUsername = this.handleUsername.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.logout = this.logout.bind(this);
    }
    handleLogin(event) {
        event.preventDefault();
        const user = {
            username: this.state.username,
            password: this.state.password
        };
        authServices.login(user)
            .then(res => {
                if (res.success) {
                    //console.log(res);
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
    handleUsername(event) {
        this.setState({ username: event.target.value });
    }
    handlePassword(event) {
        this.setState({ password: event.target.value });
    }

    logout() {
        authServices.logout();
        if (this.state.admin) {
            socket.emit('logout', this.state.username);
        }
        this.setState({ username: '', password: '', role: '', authorised: false, admin: false });
    }
    render() {


        return (
            <div className='login'>
            <form onSubmit={this.handleLogin}>
            <input name='username' autoFocus placeholder='Your username' value={this.state.username} onChange={this.handleUsername} required></input>
            <input type='password' id='password' name='password' placeholder='Password' value={this.state.password} onChange={this.handlePassword} required></input>
            <button type='submit'>Login</button>
        </form>
                    {this.state.authorised && this.state.admin===false ? <Panel user={this.state} /> : null } 
            {this.state.admin ? <AdminPanel user={this.state} /> : null  }
            {this.state.authorised ? <button onClick={this.logout}>Logout</button> : null} 
      </div>
        );
    }
}

class Board extends React.Component {

    render() {
        return (
            <div> 
            <Login />
      </div>
        );
    }
}



// ========================================

ReactDOM.render(
    <Board />,
    document.getElementById('root')
);