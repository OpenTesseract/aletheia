import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { Spin, Row } from "antd";
import { withTranslation } from "react-i18next";

import "./PersonalityView.less";
import PersonalityCard from "./PersonalityCard";
import AffixButton from "../Form/AffixButton";
import ClaimCard from "../Claim/ClaimCard";
import ReviewStats from "../ReviewStats";

class PersonalityView extends Component {
    constructor(props) {
        super(props);
        this.createClaim = this.createClaim.bind(this);
        this.viewClaim = this.viewClaim.bind(this);
        this.state = {};
        this.tooltipVisible = true;
        setTimeout(() => {
            this.tooltipVisible = false;
        }, 2500);
    }

    componentDidMount() {
        const self = this;
        self.getPersonality();
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
                console.log(this.props.t("personality:errorFetch"));
            });
    }

    createClaim() {
        const path = `./${this.props.match.params.id}/claim/create`;
        this.props.history.push(path);
    }

    viewClaim(id) {
        const path = `./${this.props.match.params.id}/claim/${id}`;
        this.props.history.push(path);
    }

    render() {
        const personality = this.state.personality;
        const { t } = this.props;
        if (personality) {
            const imageStyle = {
                backgroundImage: `url(${personality.image})`
            };
            return (
                <>
                    <PersonalityCard personality={personality} />

                    <Row style={{ padding: "5px 30px" }}>
                        <Row
                            style={{
                                width: "100%",
                                flexDirection: "column",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "#262626",
                                padding: "10px 0 25px 0px"
                            }}
                        >
                            <span>
                                <span
                                    style={{
                                        color: "#70b0d6",
                                        fontSize: "20px"
                                    }}
                                >
                                    {personality.stats?.total}
                                </span>{" "}
                                Claims reviewed
                            </span>
                            <small>
                                from{" "}
                                <span style={{ color: "#70b0d6" }}>
                                    {personality.claims.length}
                                </span>{" "}
                                speeches
                            </small>
                        </Row>
                        <Row
                            style={{
                                justifyContent: "space-between",
                                width: "100%"
                            }}
                        >
                            <ReviewStats
                                stats={personality.stats}
                                type="circle"
                                format="count"
                                strokeWidth="16"
                            />
                        </Row>
                    </Row>
                    <br />
                    <AffixButton
                        tooltipTitle={t("personality:affixButtonTitle")}
                        onClick={this.createClaim}
                    />
                    <Row style={{ background: "white" }}>
                        {personality.claims.map((claim, claimIndex) => (
                            <ClaimCard
                                key={claimIndex}
                                personality={personality}
                                claim={claim}
                                viewClaim={this.viewClaim}
                            />
                        ))}
                    </Row>
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
export default withRouter(withTranslation()(PersonalityView));
