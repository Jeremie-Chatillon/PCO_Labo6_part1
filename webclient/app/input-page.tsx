import * as React from "react";
import * as _ from "lodash";
import { Search, Segment, Container, Header, Image, Grid, SearchProps, SearchResultProps, Icon, Menu, MenuItem, Message, Input } from "semantic-ui-react";


export interface InputPageStateProps {
    readonly address: string;
    readonly input: string;
    readonly error: string;
    readonly loading: boolean;
    readonly hasContent: boolean;
    readonly content: string;
    readonly isConnected: boolean;
    readonly requestsCount: number;
}

export interface InputPageDispatchProps {
    addressChanged: (text: string) => void;
    inputChanged: (text: string) => void;
    requestsCountChanged: (count: number) => void;
}

export interface InputPageProps extends InputPageStateProps, InputPageDispatchProps {
}

export class InputPage extends React.Component<InputPageProps, any> {
    public props: InputPageProps;

    constructor(props: InputPageProps) {
        super(props);
        this.props = props;
    }

    public componentWillMount() {
        // prevent unwanted scroll due to top-margin for menu overlap
        document.body.style.height = "80%";
    }

    public componentWillUnmount() {
        document.body.style.height = null;
    }

    public render() {
        const content = this.props.hasContent ?
            this.renderContent() : _.isEmpty(this.props.error) ? "" : this.renderErrorMessage();
        const connectionIcon = this.props.isConnected ? "chain" : "broken chain";
        return (
            <div>
                <Menu fixed="top" borderless>
                    <Menu.Item header>
                        <Image src="https://avatars2.githubusercontent.com/u/8828893?s=400" centered size="tiny" />
                    </Menu.Item>
                    <Menu.Item fitted>
                        <Segment basic>
                            <Icon name={connectionIcon} size="large" />
                            <Input
                                onChange={(evt, props) => this.props.addressChanged(props.value || "")}
                                value={this.props.address}
                                placeholder="Server address" />
                        </Segment>
                    </Menu.Item>
                    <Menu.Item fitted>
                        <Input
                            value={this.props.requestsCount}
                            label="Number of requests"
                            labelPosition="left"
                            type="number"
                            maxlength="4"
                            min="1"
                            max="9999"
                            onChange={(evt, props) => this.props.requestsCountChanged(parseInt(props.value, 10))}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Container>
                        <Input
                            loading={this.props.loading}
                            onChange={(evt, props) => this.props.inputChanged(props.value || "")}
                            value={this.props.input}
                            disabled={!this.props.isConnected}
                            icon="file text"
                            placeholder="File path"
                            fluid
                            style={{ maxWidth: 700 }}
                        />
                        </Container>
                    </Menu.Item>
                </Menu>
                <Container style={{ marginTop: 100 }}>
                    <Segment basic>
                        <Container style={this.props.loading ? { opacity: 0.3 } : { opacity: 1 }} >
                            {content}
                        </Container>
                    </Segment>
                </Container>
            </div>
        );
    }


    private createMarkup(text: string) {
        return { __html: text.replace(/(\r\n|\n|\r)/gm, "<br>") };
    }


    private renderContent() {
        return <div dangerouslySetInnerHTML={this.createMarkup(this.props.content)} />;
    }

    private renderErrorMessage() {
        return <Message error>
            <Message.Header>An error has occured</Message.Header>
            <p>{this.props.error}</p>
        </Message>;
    }
}
