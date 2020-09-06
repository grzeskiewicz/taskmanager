import React from 'react';
import Calendar from './Calendar';
import { API_URL, request } from './apiconnection.js'; //request
import './css/Reports.css';


class Reports extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tasks: '', tasksSelectedMonth: '' };
        this.handleDaySelection = this.handleDaySelection.bind(this);
        this.handleMonthSelection = this.handleMonthSelection.bind(this);
    }

    componentDidMount() {
    }

    handleMonthSelection(month, year) {
        console.log(month);
        fetch(request(`${API_URL}/gettasksmonth`, 'POST', { month: month, year: year }))
            .then(res => res.json())
            .then(result => {
                console.log(result.tasks);
                this.setState({ tasksSelectedMonth: result.tasks });
            })
            .catch(error => Promise.reject(new Error(error)));
    }

    handleDaySelection(date) {

        fetch(request(`${API_URL}/gettasksday`, 'POST', { date: date }))
            .then(res => res.json())
            .then(result => {
                this.setState({ tasks: result.tasks });
            })
            .catch(error => Promise.reject(new Error(error)));
    }

    render() {
        // let summaryReport = 'X';
        let summaryReportTab = [];
        let tasksOfUser = [];
        let totalAmount = 0;
        let statusTaskAmount = '';
        let userStatistics = '';

        let monthlyTaskAmount = 0;
        let summaryReportTabMonth = [];
        let tasksOfUserMonth = [];
        let statusTaskAmountMonth = '';
        let userStatisticsMonth = '';


        if (this.state.tasks !== '') {
            totalAmount = this.state.tasks.length;

            for (const task of this.state.tasks) {
                if (summaryReportTab[task.status] === undefined) summaryReportTab[task.status] = [];
                summaryReportTab[task.status].push(task);

                if (tasksOfUser[task.username] === undefined) tasksOfUser[task.username] = [];
                tasksOfUser[task.username].push(task);
            }



            statusTaskAmount = Object.entries(summaryReportTab).map((obj, index) => {
                return (
                    <p key={index}><span>{obj[0]}</span><span>{obj[1].length}</span></p>
                );
            });



            userStatistics = Object.entries(tasksOfUser).map((obj, index) => {
                return (
                    <p key={index}><span>{obj[0]}</span><span>{obj[1].length}</span></p>
                );
            });


            /*
                        for (const obj of Object.entries(tasksOfUser)) { // sort every users task to the groups of status
                            //  obj[1]; -all the users's task, sort em
            
            
                        }*/

            /*  summaryReport = this.state.tasks.map((task, index) => {
                  console.log(task);
                  return (
                      <p key={index}>{task._id}</p>
                  );
              });*/
        }


        if (this.state.tasksSelectedMonth !== '') {
            monthlyTaskAmount = this.state.tasksSelectedMonth.length;

            for (const task of this.state.tasksSelectedMonth) {
                if (summaryReportTabMonth[task.status] === undefined) summaryReportTabMonth[task.status] = [];
                summaryReportTabMonth[task.status].push(task);

                if (tasksOfUserMonth[task.username] === undefined) tasksOfUserMonth[task.username] = [];
                tasksOfUserMonth[task.username].push(task);
            }



            statusTaskAmountMonth = Object.entries(summaryReportTabMonth).map((obj, index) => {
                return (
                    <p key={index}><span>{obj[0]}</span><span>{obj[1].length}</span></p>
                );
            });



            userStatisticsMonth = Object.entries(tasksOfUserMonth).map((obj, index) => {
                return (
                    <p key={index}><span>{obj[0]}</span><span>{obj[1].length}</span></p>
                );
            });


        }

        return (
            <div id="reports">
                <Calendar handleDaySelection={this.handleDaySelection} handleMonthSelection={this.handleMonthSelection} />
                <div id="summary-report">
                    {this.state.tasks !== '' ?
                        <div id="daily-report">
                            <fieldset>
                                <legend>Tasks per status</legend>
                                <div id="tasksPerStatus">
                                    {statusTaskAmount}
                                    <p><span>Total</span><span>{totalAmount}</span></p>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend>Users' summary</legend>
                                <div id="userStatistics">{userStatistics}</div>
                            </fieldset>
                        </div> : ''}
                    {this.state.tasksSelectedMonth !== '' ?
                        <div id="monthly-report">
                            <fieldset>
                                <legend>Tasks per status (month)</legend>
                                <div id="tasksPerStatusMonth">
                                    {statusTaskAmountMonth}
                                    <p><span>Total: </span><span>{monthlyTaskAmount}</span></p>
                                </div>

                            </fieldset>

                            <fieldset>
                                <legend>Users' summary (month)</legend>
                                <div id="userStatisticsMonth">{userStatisticsMonth}</div>
                            </fieldset>

                        </div>
                        : ''}
                </div>
            </div>
        );
    }
}

export default Reports;