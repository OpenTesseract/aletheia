import axios from "axios";
import React, { Component } from "react";
import ClaimParagraph from "./ClaimParagraph";
import ClaimReviewForm from "./ClaimReview";
import { Row, Col, Typography, Modal, message, Spin } from "antd";
import PersonalityCard from "../Personality/PersonalityCard";
import { withTranslation } from "react-i18next";
import ReviewStats from "../ReviewStats";

const { Title } = Typography;

class Claim extends Component {
    componentDidMount() {
        const self = this;
        self.getClaim();
        self.getPersonality();
        // @TODO i18n
        message.info(this.props.t("claim:message1"));
    }

    getClaim() {
        axios
            .get(
                `${process.env.API_URL}/claim/${this.props.match.params.claimId}`
            )
            .then(response => {
                const { content, title, stats } = response.data;
                console.log(stats)
                this.setState({
                    title,
                    body: content.object,
                    stats,
                    highlight: {},
                    visible: false
                });
            })
            .catch(() => {
                console.log(this.props.t("claim:errorMessage4"));
            });
    }

    getPersonality() {
        axios
            .get(
                `${process.env.API_URL}/personality/${this.props.match.params.id}`,
                {
                    params: {
                        language: this.props.i18n.languages[0]
                    }
                }
            )
            .then(response => {
                const personality = response.data;
                this.setState({ personality });
            })
            .catch(() => {
                console.log(this.props.t("claim:errorMessage3"));
            });
    }

    handleClaimReviewForm = data => {
        const body = this.state.body;
        const highlight = {
            ...data,
            claim: this.props.match.params.claimId,
            personality: this.props.match.params.id
        };
        this.setState({ body, highlight });
        this.showModal();
    };

    showModal = () => {
        this.setState({
            visible: true
        });
    };

    handleOk = e => {
        this.setState({
            visible: false
        });
    };

    handleCancel = e => {
        this.setState({
            visible: false
        });
    };

    render() {
        const { t } = this.props;
        if (this.state && this.state.body) {
            const body = this.state.body;
            const title = this.state.title;
            const visible = this.state.visible;
            const personality = this.state.personality;

            return (
                <>
                    <Modal
                        footer=""
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                    >
                        <ClaimReviewForm
                            handleOk={this.handleOk}
                            highlight={this.state.highlight}
                        />
                    </Modal>
                    {personality && (
                        <PersonalityCard personality={personality} />
                    )}

                    <Row style={{ marginTop: "20px" }}>
                        <Col offset={2} span={18}>
                            <Title level={4}>{title}</Title>
                        </Col>
                    </Row>
                    <Row>
                        <Col offset={2} span={18}>
                            <div>
                                {body.map(p => (
                                    <ClaimParagraph
                                        key={p.props.id}
                                        paragraph={p}
                                        onClaimReviewForm={
                                            this.handleClaimReviewForm
                                        }
                                    />
                                ))}
                            </div>
                        </Col>
                    </Row>
                    {this.state.stats.total !== 0 && (
                        <Row style={{ background: "white" }}>
                            <Col
                                style={{
                                    width: "100%",
                                    color: "#262626",
                                    padding: "10px 0 25px 0px"
                                }}
                                offset={2}
                                span={18}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        marginBottom: "5px"
                                    }}
                                >
                                    <Title level={4}>
                                        {t("claim:metricsHeaderTitle")}
                                    </Title>
                                    <span>
                                        {t("claim:metricsHeaderPrefix")}
                                        <span style={{ fontWeight: "bold" }}>
                                            {t("claim:metricsHeaderInfo", {
                                                totalReviews: this.state.stats
                                                    .total
                                            })}
                                        </span>
                                        {t("claim:metricsHeaderSuffix")}
                                    </span>
                                </div>
                                <ReviewStats
                                    stats={this.state.stats}
                                    countInTitle={true}
                                    type="line"
                                />
                            </Col>
                        </Row>
                    )}
                </>
            );
        } else {
            return (
                <Spin
                    tip={t("global:loading")}
                    style={{
                        textAlign: "center",
                        position: "absolute",
                        top: "50%",
                        left: "calc(50% - 40px)"
                    }}
                ></Spin>
            );
        }
    }
}

export default withTranslation()(Claim);
