import React from 'react';
import { authServices } from './services.js';

class UserCreator extends React.Component {
    constructor(props) {
        super(props);
        this.newUser = this.newUser.bind(this);
        this.handleUsername = this.handleUsername.bind(this);
        this.handleName = this.handleName.bind(this);
        this.handleSurname = this.handleSurname.bind(this);

        this.handlePassword = this.handlePassword.bind(this);
        this.state = { username: '', password: '', name:'',surname:'' };

    }
    componentDidMount() { }
    componentWillUnmount() { }

    handleUsername(event) {
        this.setState({ username: event.target.value });
    }
    handleName(event) {
        this.setState({ name: event.target.value });
    }
    handeSurname(event) {
        this.setState({ surnmame: event.target.value });
    }

    handlePassword(event) {
        this.setState({ password: event.target.value });
    }

    newUser(event) {
        event.preventDefault();
        const user = {
            username: this.state.username,
            password: this.state.password,
            name: this.state.name,
            surname:this.state.username,
            role: "user"
        };
        authServices.register(user)
            .then(res => {
                if (res.success) {
                    this.props.showUserCreator();
                } else {

                }
            });
        this.setState({ username: '', password: '', name:'', surname:'' });
        event.target.reset();


    }

    render() {
        return (
            <div id="user-creator">
                <p onClick={this.props.showUserCreator()}>&#9650;</p>
                <form onSubmit={this.newUser}>
                    <input name='username' autoFocus placeholder='Username' value={this.state.username} onChange={this.handleUsername} required></input>
                    <input name='name'  placeholder='Name' value={this.state.name} onChange={this.handleName} required></input>
                    <input name='surname'  placeholder='Surname' value={this.state.surname} onChange={this.handleSurname} required></input>

                    <input name='password' type="password" placeholder='Password' value={this.state.password} onChange={this.handlePassword} required></input>
                    <button type='submit'>Create user</button>
                </form>
            </div>
        );
    }
}


export default UserCreator;