import React, {Component, ReactNode} from 'react';
import ReactDOM from 'react-dom';
import gql from "graphql-tag";
import {ajaxPost} from "rxjs/internal-compatibility";
import {tap} from "rxjs/operators";

const httpEndpoint = "http://localhost:5000/graphql";
const wsEndpoint = "ws://localhost:5000/graphql";

const mutation = gql`
        mutation {
            createMessage(input: {author: "Author", content: "Content"}) {
              author
            }
        }`;

const subscription = gql`
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
        ajaxPost(httpEndpoint, {query: mutation}).pipe(tap((response) => console.log(response))).subscribe();
    };

    private executeSubscription(): void {
        const socket = new WebSocket(wsEndpoint, 'graphql-ws');

        socket.onopen = () => {
            this.appendLine("Connection opened.");
            socket.send(JSON.stringify({type: 'connection_init'}));
        };

        socket.onmessage = (event: MessageEvent) => {
            this.appendLine("Message received.");
        };
    };
}

ReactDOM.render(
    <div>
        <Manager/>
    </div>,
    document.getElementById('root'),
);


