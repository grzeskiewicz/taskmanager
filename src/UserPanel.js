import React from 'react';
import socket from './User'
import Task from './Task';
import './css/userPanel.css';

class UserPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tasks: [] };

    }
    componentDidMount() {
        socket.on('taskreceived', (task => {
            this.setState({ tasks: this.state.tasks.concat(task) });
        }));

        socket.on('usertasks-for-user', (tasklist => {
            this.setState({ tasks: tasklist });
        }));
        socket.on('timeup', (tasklist => {
            this.setState({ tasks: tasklist });

        }));

        socket.on('overdue', (tasklist => {
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
    componentWillUnmount() {
        /* socket.off('taskreceived', (task => {
             console.log(task);
             this.setState({ tasks: this.state.tasks.concat(task) });
         }));
 
         socket.off('usertasks', (tasklist => {
             this.setState({ tasks: tasklist });
         }));
         socket.off('timeup', (tasklist => {
             this.setState({ tasks: tasklist });
 
         }));
 
         socket.off('countdown', (tasklist => {
             this.setState({ tasks: tasklist });
 
         }));
 
         socket.off('userfinished', (tasklist => {
             this.setState({ tasks: tasklist });
         }));
 
         socket.off('cancelled', (tasklist => {
             this.setState({ tasks: tasklist });
         }));
 */

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
        const tab = [];
        for (let task of tasks) {
            if (tab[task['status']] === undefined) tab[task.status] = [];
            tab[task.status].push(task);
        }


        let newTasksRender = tab['new'] !== undefined ? tab['new'].map((task, index) => { // POPRAWIĆ
            return (
                <Task key={index} task={task} />
            );
        }) : '';


        let doneTasksRender = tab['done'] !== undefined ? tab['done'].map((task, index) => {
            return (
                <Task key={index} task={task} />
            );
        }) : '';


        let pendingTasksRender = tab['pending'] !== undefined ? tab['pending'].map((task, index) => {
            return (
                <Task key={index} task={task} />
            );
        }) : '';



        let overdueTasksRender = tab['overdue'] !== undefined ? tab['overdue'].map((task, index) => {

            return (
                <Task key={index} task={task} />
            );
        }) : '';


        let timeupTasksRender = tab['timeup'] !== undefined ? tab['timeup'].map((task, index) => {

            return (
                <Task key={index} task={task} />
            );
        }) : '';



        let cancelledTasksRender = tab['cancelled'] !== undefined ? tab['cancelled'].map((task, index) => {

            return (
                <Task key={index} task={task} />
            );
        }) : '';


        return (
            <div id="user-panel">
                <div id="active-tasks">
                    <div id="new-tasks">
                        <fieldset>
                            <legend>New</legend>
                            {newTasksRender ? newTasksRender : 'No new tasks'}
                        </fieldset>
                    </div>
                    <div id="pending-tasks">
                        <fieldset>
                            <legend>
                                {pendingTasksRender ? <img className="clockimg" src="https://icons8.com/vue-static/landings/animated-icons/icons/clock/clock_200.gif"></img> : ''}
                                <p>Pending</p>
                            </legend>
                            {pendingTasksRender ? pendingTasksRender : 'No pending tasks'}
                        </fieldset>
                    </div>
                    <div id="overdue-tasks">
                        <fieldset>
                            <legend>Overdue</legend>
                            {overdueTasksRender ? overdueTasksRender : 'No overdue tasks'}
                        </fieldset>
                    </div>
                    <div id="timeup-tasks">
                        <fieldset>
                            <legend>Timeup</legend>
                            {timeupTasksRender ? timeupTasksRender:'No timeup tasks'}
                        </fieldset>
                    </div>
                </div>
                <div id="non-active-tasks">
                    <div id="cancelled-tasks">
                        <fieldset>
                            <legend>Cancelled</legend>
                            {cancelledTasksRender}
                        </fieldset>
                    </div>
                    <div id="done-tasks">
                        <fieldset>
                            <legend>Done</legend>
                            {doneTasksRender}
                        </fieldset>
                    </div>
                </div>

            </div>

        );
    }
}



export default UserPanel;