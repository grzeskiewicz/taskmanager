import React from 'react';
import { authServices } from './services.js';
import io from 'socket.io-client';
let socket = io('https://taskmanager-node.herokuapp.com');


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.handleUsername = this.handleUsername.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.state = { username: '', password: '' } // , role: '', authorised: false, isAdmin: false 
    }

    componentDidMount() {
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
                        if (res.success) {

                            socket.emit('logged', this.state.username);
                            const isAdmin = res.role === "admin" ? true : false;
                            this.props.authorised(this.state.username, res.role, isAdmin); //username, user role, admin:t/f
                        } else {
                            this.props.notAuthorised();
                        }
                    })
                } else {
                    this.props.notAuthorised();
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
        authServices.logout();
        // socket=null;
        this.props.logout();
        console.log(socket);
        socket.emit('logout', this.props.username);
        socket.disconnect();

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


export { Login, Logout };
export default socket;