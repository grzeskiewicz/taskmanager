import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { authServices } from './services.js';


class Panel extends React.Component {
    render() {
        return (
            <div className="">
            ZALOGOWANY
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