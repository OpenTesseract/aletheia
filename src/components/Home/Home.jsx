import React, { Component } from "react";
import CTARegistration from "./CTARegistration";
import { Button, Row, Carousel, Spin } from "antd";
import personalityApi from "../../api/personality";
import statsApi from "../../api/stats";
import PersonalityCard from "../Personality/PersonalityCard";
import { withTranslation } from "react-i18next";
import SocialMediaShare from "../SocialMediaShare";
import { ArrowRightOutlined } from "@ant-design/icons"

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            personalities: [],
            stats: {
                claims: 0,
                personalities: 0,
                reviews: 0
            }
        };
    }
    componentDidMount() {
        personalityApi
            .getPersonalities({
                i18n: this.props.i18n,
                pageSize: 5,
                fetchOnly: true
            })
            .then(personalities =>
                this.setState({ personalities: personalities.data })
            );
        statsApi.get().then(stats => this.setState({ stats }));
    }

    render() {
        const { personalities, stats } = this.state;
        const { t } = this.props;

        const contentStyle = {
            height: "auto",
            color: "#fff",
            lineHeight: "160px",
            textAlign: "center",
            background: "#364d79",
            width: "100%",
            filter: "grayscale(100%)"
        };
        if (stats) {
            return (
                <>
                    <Row
                        style={{
                            position: "relative",
                            margin: "-10px -15px 0px -15px"
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "50vh",
                                overflow: "hidden",
                                position: "relative"
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    height: "50vh",
                                    position: "absolute",
                                    zIndex: "1",
                                    backgroundColor: "rgba(0,0,0,0.6)"
                                }}
                            ></div>
                            <Carousel autoplay dots={false}>
                                {personalities.map(
                                    (p, i) =>
                                        p && (
                                            <div key={i}>
                                                <img
                                                    style={contentStyle}
                                                    src={p.image}
                                                />
                                            </div>
                                        )
                                )}
                            </Carousel>
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                zIndex: "2",
                                width: "100%",
                                height: "100%",
                                padding: "7%"
                            }}
                        >
                            <Row
                                style={{
                                    height: "25%",
                                    color: "#fff",
                                    flexDirection: "column",
                                    textAlign: "center"
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "26px"

                                    }}
                                >
                                    {t("home:title")}
                                </span>{" "}
                                <br />
                                <span>{t("home:subtitle")}</span>
                            </Row>
                            <Row
                                style={{
                                    height: "60%",
                                    color: "#fff",

                                    flexDirection: "column"
                                }}
                            >
                                <Row>
                                    <p>
                                        <span
                                            style={{
                                                color: "#67BEF2",
                                                fontSize: "34px"
                                            }}
                                        >
                                            {stats.personalities}
                                        </span>{" "}
                                        {t("home:statsPersonalities")}
                                    </p>
                                </Row>
                                <Row>
                                    <p>
                                        <span
                                            style={{
                                                color: "#67BEF2",
                                                fontSize: "34px"
                                            }}
                                        >
                                            {stats.claims}
                                        </span>{" "}
                                        {t("home:statsClaims")}
                                    </p>
                                </Row>
                                <Row>
                                    <p>
                                        <span
                                            style={{
                                                color: "#67BEF2",
                                                fontSize: "34px"
                                            }}
                                        >
                                            {stats.reviews}
                                        </span>{" "}
                                        {t("home:statsClaimReviews")}
                                    </p>
                                </Row>
                            </Row>
                            <Row
                                style={{
                                    height: "15%",
                                    color: "#fff",
                                    justifyContent: "space-between"
                                }}
                            >
                                <span style={{
                                    position: "relative",
                                    width: "133px",
                                    height: "2em",
                                }}
                                >{t("home:statsFooter")}</span>
                                <Button href="#create_account"
                                    style={{
                                        position: "absolut",
                                        margin: "auto",
                                        float: "left",
                                        background: "#FFFFFF",
                                        borderRadius: "30px",

                                        alignItems: "center",
                                        justifyContent: "center",

                                        width: "150px",
                                        height: "40px",
                                        padding: "12px",


                                        fontFamily: "Open Sans",
                                        fontStyle: "normal",
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                        lineHeight: "107%",

                                        textAlign: "center",

                                        color: "#2D77A3",
                                    }}>
                                    {t("home:createAccountButton")}
                                </Button>
                            </Row>
                        </div>
                    </Row>
                    <Row>
                        {personalities.map(
                            (p, i) =>
                                p && (
                                    <PersonalityCard
                                        personality={p}
                                        summarized={true}
                                        key={p._id}
                                    />
                                )
                        )}
                        <Row
                            style={{
                                padding: "10px"

                            }}
                        >
                            <Button href="/personality" style={{


                                margin: "auto",
                                left: "30%",
                                bottom: "10px",
                                position: "relative",

                                alignItems: "center",
                                justifyContent: "center",

                                border: "2px solid #2D77A3",
                                boxSizing: "borderBox",
                                borderRadius: "30px",
                                height: "40px",
                                color: "#2D77A3",

                                fontFamily: "Open Sans",
                                fontStyle: "normal",
                                fontWeight: "bold",
                                fontSize: "14px",
                                lineHeight: "107%",
                                padding: "5%",



                            }}>
                                {t("home:seeMorePersonalitiesButton")}
                                <ArrowRightOutlined />
                            </Button>
                        </Row>
                    </Row>
                    <Row
                        id="create_account"
                        style={{
                            margin: "0 -15px"
                        }}
                    >
                        <CTARegistration></CTARegistration>
                    </Row>
                    <SocialMediaShare />
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

export default withTranslation()(Home);
