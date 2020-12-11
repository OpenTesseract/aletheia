import { withTranslation } from "react-i18next";
import React, { Component } from "react";
import axios from "axios";
import { Editor, EditorState, ContentState } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { stateFromHTML } from "draft-js-import-html";
import "draft-js/dist/Draft.css";

import { Typography, Form, Input, Button, message, Row, Col } from "antd";

const { Title } = Typography;
class ClaimCreate extends Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            title: "",
            editorState: EditorState.createEmpty()
        };
        this.saveClaim = this.saveClaim.bind(this);
        this.updateClaim = this.updateClaim.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    componentDidMount() {
        if (this.props.edit) {
            axios
                .get(
                    `${process.env.API_URL}/claim/${this.props.match.params.claimId}`,
                    {
                        params: {
                            language: this.props.i18n.languages[0]
                        }
                    }

                )
                .then(response => {
                    const { content, title } = response.data;
                    const editorState = EditorState.createWithContent(
                        stateFromHTML(content.html)
                    );
                    this.setState(
                        {
                            title,
                            editorState,
                            content: stateToHTML(
                                this.state.editorState.getCurrentContent()
                            )
                        },
                        () => {
                            this.formRef.current.setFieldsValue({
                                title,
                                content: this.state.content
                            });
                        }
                    );
                })
                .catch(err => {
                    console.log(this.props.t("ClaimCreate:errorMessage"));
                    throw err;
                    
                });
        }
    }

    saveClaim(values) {
        console.log(values);
        const content = stateToHTML(this.state.editorState.getCurrentContent());
        const title = this.state.title;
        const personality = this.props.match.params.id;
        axios
            .post(`${process.env.API_URL}/claim`, {
                title,
                content,
                personality
            })
            .then(response => {
                const { title, _id } = response.data;
                message.success(`"${title}${this.props.t("claimCreate:responseC")}`);
                // Redirect to personality profile in case _id is not present
                const path = _id ? `./${_id}` : "../";
                this.props.history.push(path);
            })
            .catch(err => {
                const response = err && err.response;
                if (!response) {
                    // TODO: Track unknow errors
                    console.log(err);
                }
                const { data } = response;
                message.error(
                    data && data.message
                        ? data.message
                        : this.props.t("ClaimCreate:errorMessage1")
                );
            });
    }

    updateClaim(values) {
        const content = stateToHTML(this.state.editorState.getCurrentContent());
        const title = this.state.title;
        axios
            .put(
                `${process.env.API_URL}/claim/${this.props.match.params.claimId}`,
                {
                    title,
                    content
                }
            )
            .then(response => {
                const { title, _id } = response.data;
                message.success(`"${title}"${this.props.t("claimCreate:responseU")}`);
                // Redirect to personality profile in case _id is not present
                const path = "./";
                this.props.history.push(path);
            })
            .catch(err => {
                const response = err && err.response;
                if (!response) {
                    // TODO: Track unknow errors
                    console.log(err);
                }
                const { data } = response;
                message.error(
                    data && data.message
                        ? data.message
                        : this.props.t("ClaimCreate:errorMessage2")
                );
            });
    }

    onChange(editorState) {
        this.setState({ editorState }, () => {
            if (this.formRef.current) {
                this.formRef.current.setFieldsValue({
                    content: stateToHTML(
                        this.state.editorState.getCurrentContent()
                    )
                });
            }
        });
    }

    render() {
        return (
            <>
                <Row gutter={[32, 0]}>
                    <Col span={24}>
                        <Title level={2}>
                            <center>Create Claim</center>
                        </Title>
                        <Form
                            ref={this.formRef}
                            id="createClaim"
                            onFinish={
                                this.props.edit
                                    ? this.updateClaim
                                    : this.saveClaim
                            }
                        >
                            <Form.Item
                                name="title"
                                label="Title"
                                rules={[
                                    {
                                        required: true,
                                        message: this.props.t("ClaimCreate:message")
                                    }
                                ]}
                                wrapperCol={{ sm: 24 }}
                                style={{
                                    width: "100%"
                                }}
                            >
                                <Input
                                    value={
                                        (this.state && this.state.title) || ""
                                    }
                                    onChange={e =>
                                        this.setState({ title: e.target.value })
                                    }
                                    placeholder={this.props.t("ClaimCreate:placeholder")}
                                />
                            </Form.Item>
                            <Form.Item
                                name="content"
                                label="Content"
                                rules={[
                                    {
                                        required: true,
                                        message: this.props.t("ClaimCreate:message1")
                                    }
                                ]}
                                wrapperCol={{ sm: 24 }}
                                style={{
                                    width: "100%"
                                }}
                            >
                                <div className="ant-input">
                                    <Editor
                                        placeholder={this.props.t("ClaimCreate:placeholder1")}
                                        editorState={this.state && this.state.editorState}
                                        onChange={this.onChange}
                                    />
                                </div>
                            </Form.Item>
                            <Form.Item>
                                {this.props.edit ? (
                                    <Button type="primary" htmlType="submit">
                                        Update
                                    </Button>
                                ) : (
                                    <Button type="primary" htmlType="submit">
                                        Save
                                    </Button>
                                )}
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </>
        );
    }
}
export default withTranslation()(Claim);
