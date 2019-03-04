import React, {Component, ReactNode} from 'react';
import ReactDOM from 'react-dom';
import {ajaxPost} from "rxjs/internal-compatibility";
import {tap} from "rxjs/operators";

const httpEndpoint = "http://localhost:5000/graphql";
const wsEndpoint = "ws://localhost:5000/graphql-ws";
const protocol = "graphql-ws";

const mutation = `
        mutation {
            createMessage(input: {author: "Author", content: "Content"}) {
              author
            }
        }`;

const subscription = `
        subscription {
            messageCreated(parameter: {author: "Author"}) {
              author
            }
        }`;

type Props = {};

type State = {
    content: string;
}

class Manager extends Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            content: ''
        };

        this.appendLine = this.appendLine.bind(this);
    }

    render(): ReactNode {
        return <div>
            <input type="button" value="Execute mutation" onClick={() => this.executeMutation()}/>
            <br/>
            <br/>
            <input type="button" value="Execute subscription" onClick={() => this.executeSubscription()}/>
            <br/>
            <br/>
            <pre>{this.state.content}</pre>
        </div>
    }

    private appendLine(value: string): void {
        this.setState({content: `${this.state.content}\n${value}`})
    };

    private executeMutation(): void {
        const headers = {
            "Content-Type": "application/json"
        };

        ajaxPost(httpEndpoint, {query: mutation}, headers)
            .pipe(tap((response: any) => console.log(response))).subscribe();
    };

    private executeSubscription(): void {
        const socket = new WebSocket(wsEndpoint, protocol);

        socket.onopen = () => {
            this.appendLine("Connection opened.");
            socket.send(JSON.stringify({query: subscription}));
        };

        socket.onmessage = (event: MessageEvent) => {
            this.appendLine(`Message received: ${event.data}.`);
        };
    };
}

ReactDOM.render(
    <div>
        <Manager/>
    </div>,
    document.getElementById('root'),
);


