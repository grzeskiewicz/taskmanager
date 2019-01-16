import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { authServices } from './services.js';
import io from 'socket.io-client';


const socket = io('https://taskmanager-node.herokuapp.com');

class SelectedUserTasks extends React.Component {
    constructor(props) {
        super(props);
        this.state = { room: '', content: '', tasklist: '' };
        this.handleRoom = this.handleRoom.bind(this);
        this.handleTaskContent = this.handleTaskContent.bind(this);
        this.newTask = this.newTask.bind(this);

        socket.on('usertasks', (tasklist => {
            if (tasklist[0] && tasklist[0].username === this.props.username) this.setState({ tasklist: tasklist });
            if (!tasklist[0]) this.setState({ tasklist: '' });
        }));

        socket.on('timesup', (tasklist => {
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
        event.target.reset();
        this.setState({ taskcontent: '', room: '' });
    }


    cancelTask(task) {
        socket.emit('cancel', task);
    }


    render() {
        const tasklist = this.state.tasklist ? [...this.state.tasklist].map((task, index) => {
            return (
                <tr key={index}><td>{task.room}</td><td>{task.content}</td><td>{task.status}</td><td>{task.timeleft}</td><td>{task.status==='cancelled' ? '' : <button onClick={() => this.cancelTask(task)}>Cancel</button>}</td></tr>
            );
        }) : null;

        return (
            <div>
        <form id="new-task" onSubmit={this.newTask}>
            <input name='room' autoFocus placeholder='Room Place' value={this.state.room} onChange={this.handleRoom} required></input>
            <textarea name='taskcontent' placeholder='Task to do' value={this.state.taskcontent} onChange={this.handleTaskContent} required></textarea>
            <button type='submit'>Send task</button>
        </form> 
        <table id="tasks"><thead><tr><th>Room</th><th>Content</th><th>Status</th><th>Timeleft</th><th>Cancel</th></tr></thead><tbody>{tasklist}</tbody></table>

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
            <div>
            <ul className="userlist">{userlist}</ul> 
            {username ? <SelectedUserTasks username={this.state.username} /> : null}
            
      </div>

        );
    }
}

/*
class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = { number: 20 };
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            console.log(this.state.number, this.props.counter)
            if (this.props.counter === 'double') {
                this.setState({ number: this.state.number + this.state.number });
            } else {
                this.setState({ number: this.state.number - 1 });
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        if (this.state.number === 0) {
            // this.setState({counter:null});
            clearInterval(this.interval);
        }
        return (
            <div>
        <h1>{this.state.number}</h1>
      </div>
        )
    }
} */

// odliczanie po akceptacji - odliczanie na socket czy na kliencie?
class Task extends React.Component { //single task with it's own time state
    constructor(props) {
        super(props);
        this.state = { timeleft: null };
        socket.on('countdown', (tasklist => {
            for (const taskElem of tasklist) {
                if (taskElem.room === this.props.task.room && taskElem.content === this.props.task.content) this.setState({ timeleft: taskElem.timeleft });
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

    render() {
        return (
            <div className="task">
                    <p>Status: {this.props.task.status} </p>
                    <p>Room: {this.props.task.room}</p>
                    <p>Task: {this.props.task.content} </p>
                    <p>Time: {this.props.task.timeleft} </p>

                {(this.props.task.status!=='new') ? this.state.timeleft : <button onClick={() => this.acceptTask(this.props.task)}>Accept the task</button>}
                {(this.props.task.status==='pending' || this.props.task.status==='timesup')  ? <button onClick={() => this.finishTask(this.props.task)}>Finish the task</button> : ''}
                    

            </div>
        );
    }
}

class UserPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tasks: [] };
        socket.on('taskreceived', (task => {
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
        const tasks = this.state.tasks;
        const taskrender = tasks.map((task, index) => {
            return (
                <Task key={index} task={task} />
            );
        });

        return (
            <div id="task-group">
            <div id="new-task">{taskrender}</div>
            <div id="pending-tasks"></div>
            <div id="done-tasks"></div>
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
        socket.emit('logout', this.state.username);
        this.setState({ username: '', password: '', role: '', authorised: false, admin: false });
    }
    render() {


        return (
            <div className='login'>
         { this.state.authorised ? <div id="userinfo"> {this.state.username} <button onClick={this.logout}>Logout</button></div> 
         : <form onSubmit={this.handleLogin}>
            <input name='username' autoFocus placeholder='Your username' value={this.state.username} onChange={this.handleUsername} required></input>
            <input type='password' id='password' name='password' placeholder='Password' value={this.state.password} onChange={this.handlePassword} required></input>
            <button type='submit'>Login</button>
        </form> 
    }

      </div>
        );
    }
}

class Panels extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '', password: '', role: '', authorised: false, admin: false };
    }
    render() {
        return (
            <div> 
            {this.state.authorised && this.state.admin===false ? <UserPanel user={this.state} /> : null } 
            {this.state.admin ? <AdminPanel user={this.state} /> : null  }
            <Login />
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