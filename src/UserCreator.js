import React from 'react';
import { authServices } from './services.js';

class UserCreator extends React.Component {
    constructor(props) {
        super(props);
        this.newUser = this.newUser.bind(this);
        this.handleUsername = this.handleUsername.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.state = { username: '', password: '' };

    }
    componentDidMount() { }
    componentWillUnmount() { }

    handleUsername(event) {
        this.setState({ username: event.target.value });
    }

    handlePassword(event) {
        this.setState({ password: event.target.value });
    }

    newUser(event) {
        event.preventDefault();
        const user = {
            username: this.state.username,
            password: this.state.password,
            role: "user"
        };
        authServices.register(user)
            .then(res => {
                if (res.success) {
                    this.props.showUserCreator();
                } else {

                }
            });
        this.setState({ username: '', password: '' });
        event.target.reset();


    }

    render() {
        return (
            <div id="user-creator">
                <p onClick={this.props.showUserCreator()}>&#9650;</p>
                <form onSubmit={this.newUser}>
                    <input name='username' autoFocus placeholder='Username' value={this.state.room} onChange={this.handleUsername} required></input>
                    <input name='password' type="password" placeholder='Password' value={this.state.password} onChange={this.handlePassword} required></input>
                    <button type='submit'>Create user</button>
                </form>
            </div>
        );
    }
}


export default UserCreator;