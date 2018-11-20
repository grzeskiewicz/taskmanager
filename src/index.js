import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { authServices } from './services.js';
import io from 'socket.io-client';

/*
const socket = io('http://localhost:3005');
socket.on('test', (msg => {
    console.log(msg);
})); */
class Panel extends React.Component {
        constructor(props) {
        super(props);
        this.state = {};
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
        return (
            <div id="task-group">
            <div id="new-task">new task</div>
            <div id="pending-tasks"></div>
            <div id="done-tasks">done</div>
      </div>

        );
    }
}


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '', password: '', authorised: false };

        this.handleUsername = this.handleUsername.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
    }
    handleLogin(event) {
        event.preventDefault();
        const user = {
            username: this.state.username,
            password: this.state.password
        };
        console.log(user);
        authServices.login(user)
            .then(res => {
                if (res.success) {
                    authServices.getInfo().then(res => {
                        if (res.success) { this.setState({ authorised: true }) } else {
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
    render() {


        return (
            <div className='login'>
            <form onSubmit={this.handleLogin}>
            <input name='username' autoFocus placeholder='Your username' value={this.state.username} onChange={this.handleUsername} required></input>
            <input type='password' id='password' name='password' placeholder='Password' value={this.state.password} onChange={this.handlePassword} required></input>
            <button type='submit'>Login</button>
            {this.state.authorised ? <Panel /> : null } 
        </form>
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