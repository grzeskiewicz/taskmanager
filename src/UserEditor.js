import React from 'react';
import { authServices } from './services.js';
import './css/userEditor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';


class UserEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedUsername: '', showEdit: false, password: '', password2: '' };
        this.handlePassword = this.handlePassword.bind(this);
        this.handlePassword2 = this.handlePassword2.bind(this);
        this.resetPassword = this.resetPassword.bind(this);

    }
    componentDidMount() { }
    componentWillUnmount() { }

    selectUser(user) {
        this.setState({ selectedUsername: user.username });
        console.log("Wybrano", user);
    }

    editUser(user) {
        this.setState({ selectedUsername: user.username, showEdit: true, passwordChanged: false });
    }



    deleteUser(user) {
        let deleteConfirmation = window.confirm(`Are you sure you want to delete ${user.username}?`);
        if (deleteConfirmation) {
            authServices.deleteUser(user.username)
                .then(res => {
                    if (res.success) alert("User deleted.")
                });
        }
    }


    handlePassword(event) {
        this.setState({ password: event.target.value })
    }

    handlePassword2(event) {
        this.setState({ password2: event.target.value })
    }

    resetPassword(event) {
        event.preventDefault();
        if (this.state.password === this.state.password2) {
            authServices.resetPassword({ username: this.state.selectedUsername, password: this.state.password })
                .then(res => {
                    if (res.success) this.setState({ password: '', password2: '', passwordChanged: true, showEdit: false })
                });
        }
    }


    render() {
        let userList;
        if (this.props.userStats.length > 0) {
            userList = this.props.userStats.map((user, index) => {
                return (
                    <div key={index} onClick={() => this.selectUser(user)} className={(this.state.selectedUsername === user.username ? 'selected' : '')}>
                        <p>{user.username}</p>
                        <div className="icons">
                            <FontAwesomeIcon icon={faKey} size="lg" onClick={() => this.editUser(user)} />
                            <FontAwesomeIcon icon={faTrash} size="lg" onClick={() => this.deleteUser(user)} />
                        </div>
                    </div>
                );
            });
        }
        return (
            <div id="user-editor">
                <div id="userList-edit">{userList}</div>
                {this.state.showEdit ?
                    <div id="edit">
                        <form onSubmit={this.resetPassword}>
                            <input name='password' type='password' placeholder='New password' value={this.state.password} onChange={this.handlePassword} required></input>
                            <input name='password2' type='password' placeholder='Repeat password' value={this.state.password2} onChange={this.handlePassword2} required></input>
                            <button type='submit'>Reset</button>
                        </form>

                    </div> : this.state.passwordChanged ? <p>Password changed</p> : ''}
            </div>
        );
    }
}


export default UserEditor;