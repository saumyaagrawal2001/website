import * as React from 'react';
import * as _ from 'lodash';
import {DatePicker, TimePicker} from 'material-ui';
import {utils} from 'ts/utils/utils';
import * as BigNumber from 'bignumber.js';
import * as moment from 'moment';

interface ExpirationInputProps {
    orderExpiryTimestamp: BigNumber.BigNumber;
    updateOrderExpiry: (unixTimestampSec: BigNumber.BigNumber) => void;
}

interface ExpirationInputState {
    dateMoment: moment.Moment;
    timeMoment: moment.Moment;
}

export class ExpirationInput extends React.Component<ExpirationInputProps, ExpirationInputState> {
    private earliestPickableMoment: moment.Moment;
    constructor(props: ExpirationInputProps) {
        super(props);
        // Set the earliest pickable date to today at 00:00, so users can only pick the current or later dates
        this.earliestPickableMoment = moment().startOf('day');
        const expirationMoment = utils.convertToMomentFromUnixTimestamp(props.orderExpiryTimestamp);
        const initialOrderExpiryTimestamp = utils.initialOrderExpiryUnixTimestampSec();
        const didUserSetExpiry = !initialOrderExpiryTimestamp.eq(props.orderExpiryTimestamp);
        this.state = {
            dateMoment: didUserSetExpiry ? expirationMoment : undefined,
            timeMoment: didUserSetExpiry ? expirationMoment : undefined,
        };
    }
    public render() {
        const date = this.state.dateMoment ? this.state.dateMoment.toDate() : undefined;
        const time = this.state.timeMoment ? this.state.timeMoment.toDate() : undefined;
        return (
            <div className="clearfix">
                <div className="col col-6 overflow-hidden pr3 flex relative">
                    <DatePicker
                        className="overflow-hidden"
                        hintText="Date"
                        mode="landscape"
                        autoOk={true}
                        value={date}
                        onChange={this.onDateChanged.bind(this)}
                        shouldDisableDate={this.shouldDisableDate.bind(this)}
                    />
                    <div
                        className="absolute"
                        style={{fontSize: 20, right: 40, top: 13, pointerEvents: 'none'}}
                    >
                        <i className="zmdi zmdi-calendar" />
                    </div>
                </div>
                <div className="col col-5 overflow-hidden flex relative">
                    <TimePicker
                        className="overflow-hidden"
                        hintText="Time"
                        autoOk={true}
                        value={time}
                        onChange={this.onTimeChanged.bind(this)}
                    />
                    <div
                        className="absolute"
                        style={{fontSize: 20, right: 9, top: 13, pointerEvents: 'none'}}
                    >
                        <i className="zmdi zmdi-time" />
                    </div>
                </div>
                <div
                    onClick={this.clearDates.bind(this)}
                    className="col col-1 pt2"
                    style={{textAlign: 'right'}}
                >
                    <i style={{fontSize: 16, cursor: 'pointer'}} className="zmdi zmdi-close" />
                </div>
            </div>
        );
    }
    private shouldDisableDate(date: Date): boolean {
        return moment(date).startOf('day').isBefore(this.earliestPickableMoment);
    }
    private clearDates() {
        this.setState({
            dateMoment: undefined,
            timeMoment: undefined,
        });
        const defaultDateTime = utils.initialOrderExpiryUnixTimestampSec();
        this.props.updateOrderExpiry(defaultDateTime);
    }
    private onDateChanged(e: any, date: Date) {
        const dateMoment = moment(date);
        this.setState({
            dateMoment,
        });
        const timestamp = utils.convertToUnixTimestampSeconds(dateMoment, this.state.timeMoment);
        this.props.updateOrderExpiry(timestamp);
    }
    private onTimeChanged(e: any, time: Date) {
        const timeMoment = moment(time);
        this.setState({
            timeMoment,
        });
        const dateMoment =  _.isUndefined(this.state.dateMoment) ? moment() : this.state.dateMoment;
        const timestamp = utils.convertToUnixTimestampSeconds(dateMoment, timeMoment);
        this.props.updateOrderExpiry(timestamp);
    }
}
