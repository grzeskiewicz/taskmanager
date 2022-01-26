import React from 'react';
import ReactDOM from 'react-dom';
import AdminPanel from './AdminPanel';
import UserPanel from './UserPanel';
import { Login, Logout } from './User';
import './css/index.css';

<<<<<<< HEAD
console.log("xD")


=======
//vh calc for mobile CSS
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
    // We execute the same script as before
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});
>>>>>>> 49becd92656f330000a7e8c5368108ae7e9b2369

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '', role: '', authorised: false, isAdmin: false };
        this.authorised = this.authorised.bind(this);
        this.notAuthorised = this.notAuthorised.bind(this);
        this.logout = this.logout.bind(this);
    }

    authorised(username, role, isAdmin) {
        this.setState({ authorised: true, role: role, isAdmin: isAdmin, username: username });
    }

    notAuthorised() {
        this.setState({ authorised: false, isAdmin:false, username:'', role:'' }); // anything more?
    }

    logout() {
        this.setState({ username: '', role: '', authorised: false, isAdmin: false });
    }

    render() {
        return (
            <div id="board">
                {
                    !this.state.authorised ?
                        <Login authorised={this.authorised} notAuthorised={this.notAuthorised} />
                        :
                        <Logout username={this.state.username} logout={this.logout} />
                }

                {this.state.authorised && this.state.isAdmin === false ? <UserPanel user={this.state} /> : null}
                {this.state.isAdmin ? <AdminPanel user={this.state} /> : null}
            </div>
        );
    }
}

ReactDOM.render(
    <Board />,
    document.getElementById('root')
);
