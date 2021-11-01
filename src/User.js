import React from 'react';
import { authServices } from './services.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import socketIOClient from "socket.io-client";
//let socket = io('https://taskmanager-node.herokuapp.com');
const socket = socketIOClient('http://localhost:3001');



class Login extends React.Component {
    constructor(props) {
        super(props);
        this.handleUsername = this.handleUsername.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.state = { username: '', password: '', loginErrorMsg: '' } // , role: '', authorised: false, isAdmin: false 
    }

    componentDidMount() {
        console.log(socket);
        socket.connect();
    }
    handleLogin(event) {
        event.preventDefault();
        const user = {
            username: this.state.username,
            password: this.state.password
        };
        this.login(user);
    }

    login(user) {
        authServices.login(user)
            .then(res => {
                if (res.success) {
                    authServices.getInfo().then(res => {
                        console.log(res);
                        if (res.success) {
                            socket.emit('logged', this.state.username);
                            const isAdmin = res.role === "admin" ? true : false;
                            console.log(isAdmin, this.state.username)
                            this.props.authorised(this.state.username, res.role, isAdmin); //username, user role, admin:t/f
                        } else {
                            this.props.notAuthorised();
                        }
                    })
                } else {
                    this.props.notAuthorised();
                    this.setState({ loginErrorMsg: res.msg });
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
                    <p>{this.state.loginErrorMsg}</p>
                </form>
            </div>
        );
    }
}

class Logout extends React.Component {
    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.state = { showMenu: false };

    }

    componentWillMount() {
        document.addEventListener('mousedown', this.toggleMenu, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.toggleMenu, false);
    }

    handleLogout() {
        authServices.logout();
        // socket=null;
        this.props.logout();
        console.log(socket);
        socket.emit('logout', this.props.username);
        socket.disconnect();

    }

    toggleMenu(event) {
        if (this.node.contains(event.target)) {
            this.setState({ showMenu: true });
        } else {
            this.setState({ showMenu: false });
        }

    }

    render() {
        const username = this.props.username;
        return (
            <div id="userinfo" ref={node => this.node = node}>
                <p>{username}</p>
                <FontAwesomeIcon onClick={(event) => this.toggleMenu(event)} icon={faUserCircle} size="3x" />
                {this.state.showMenu ?
                    <div id="user-smallmenu">
                        <button onClick={() => this.handleLogout()}>Logout</button>
                        <button>test</button>
                        <button>test2</button>
                    </div> : ''}
            </div>
        );
    }
}


export { Login, Logout };
export default socket;