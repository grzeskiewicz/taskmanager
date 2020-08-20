import React from 'react';
import socket from './User'

class Task extends React.Component { //single task with it's own time state
    constructor(props) {
        super(props);
        this.state = {
            timetoaccept: '', timeleft: '',
            showtask: false
        };
    }

    //this.props.task.status === 'new' || this.props.task.status === 'pending' || this.props.task.status === 'overdue' || this.props.task.status === 'timeup' ? true : false

    componentDidMount() {
        if (this._isMounted) socket.on('countdown', (tasklist => this.countDown(tasklist)));
    }
    componentWillUnmount() {
        //    socket.off('countdown',(tasklist => this.countDown(tasklist)));
    }


    countDown(tasklist) {
        for (const taskElem of tasklist) {
            if (taskElem.room === this.props.task.room && taskElem.content === this.props.task.content) this.setState({ timeleft: taskElem.timeleft });
            if (taskElem.status === "new") this.setState({ timetoaccept: taskElem.timetoaccept });
        }
    }
    acceptTask(task) {
        console.log("accept", task);
        socket.emit('accept', task);
        this.setState({ timeleft: 240 });
    }


    finishTask(task) {
        socket.emit('finish', task);
    }

    toggleTask(task) {
        this.setState({ showtask: !this.state.showtask });
    }

    parseTimeLeft(time) {
        const minutes = Math.floor(time / 60) < 10 ? `0${Math.floor(time / 60)}` : Math.floor(time / 60);
        const seconds = time % 60 < 10 ? `0${time % 60}` : time % 60;
        return `${minutes}:${seconds}`;
    }

    render() {
        const progress = Math.round(this.props.task.timeleft / 240 * 100, 2);
        const style = {
            '--progress': `${progress}%`,
            'background-color': progress < 30 ? 'red' : ''
        };
        return (
            <div className={"task " + (this.state.showtask ? 'unwrapped' : 'wrapped')}>
                <div onClick={() => this.toggleTask(this.props.task)}>
                    <p>{this.state.showtask ? `Hide task` :
                        (this.props.task.status === 'cancelled' || this.props.task.status === 'done') ?
                            `Showtask | ${this.props.task.room} | ${this.props.task.status} ` :
                            `Showtask | ${this.props.task.room} | ${this.props.task.status} | ${this.parseTimeLeft(this.props.task.timeleft)}`
                    }</p>
                    {!this.state.showtask && this.props.task.status == 'pending' ? <div className="progress-bar">
                        <div style={style}>&nbsp;</div>
                    </div> : ''}
                </div>

                {this.state.showtask ? <div>
                    <p>Status: {this.props.task.status}</p>
                    <p>Room: {this.props.task.room}</p>
                    <p>Task: {this.props.task.content} </p>
                    <p>Time to accept: {this.parseTimeLeft(this.props.task.timetoaccept)} </p>
                    <p>Time: {this.parseTimeLeft(this.props.task.timeleft)} </p>

                    {(this.props.task.status !== 'new') ? '' : <button onClick={() => this.acceptTask(this.props.task)}>Accept the task</button>}
                    {(this.props.task.status === 'pending' || this.props.task.status === 'timeup') ? <button onClick={() => this.finishTask(this.props.task)}>Finish the task</button> : ''}

                </div> : ''}
            </div>
        );
    }
}


export default Task;