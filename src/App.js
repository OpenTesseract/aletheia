import React, { Component } from "react";
import { Layout, Row } from "antd";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { withTranslation } from "react-i18next";
import api from "./api/user";
import "./App.less";

import ClaimCreate from "./components/Claim/ClaimCreate";
import ClaimView from "./components/Claim/ClaimView";
import PersonalityList from "./components/Personality/PersonalityList";
import PersonalityView from "./components/Personality/PersonalityView";
import PersonalityCreateForm from "./components/Personality/PersonalityCreateForm";
import AletheiaHeader from "./components/Header/AletheiaHeader";
import BackButton from "./components/BackButton";
import PersonalityCreateSearch from "./components/Personality/PersonalityCreateSearch";
import { connect } from "react-redux";

const { Footer, Content } = Layout;

class App extends Component {
    async componentDidMount() {
        const result = await api.validateSession({}, this.props.t);
        this.props.dispatch({
            type: "SET_LOGIN_VALIDATION",
            login: result.login
        });
    }

    render() {
        const { t } = this.props;
        return (
            <>
                <AletheiaHeader />
                <Content className="main-content">
                    <Router>
                        <Row style={{ padding: "0 30px", marginTop: "10px" }}>
                            <BackButton />
                        </Row>
                        <Switch>
                            <Route exact path="/" component={PersonalityList} />
                            <Route
                                exact
                                path="/personality"
                                component={PersonalityList}
                            />
                            <Route
                                exact
                                path="/personality/create"
                                component={PersonalityCreateForm}
                            />
                            <Route
                                exact
                                path="/personality/search"
                                render={props => (
                                    <PersonalityCreateSearch
                                        {...props}
                                        withSuggestions={true}
                                    />
                                )}
                            />
                            <Route
                                exact
                                path="/personality/:id"
                                component={PersonalityView}
                            />
                            <Route
                                exact
                                path="/personality/:id/edit"
                                render={props => (
                                    <PersonalityCreateForm
                                        {...props}
                                        edit={true}
                                    />
                                )}
                            />
                            <Route
                                exact
                                path="/personality/:id/claim/create"
                                component={ClaimCreate}
                            />
                            <Route
                                exact
                                path="/personality/:id/claim/:claimId"
                                component={ClaimView}
                            />
                            <Route
                                exact
                                path="/personality/:id/claim/:claimId/edit"
                                render={props => (
                                    <ClaimCreate {...props} edit={true} />
                                )}
                            />
                        </Switch>
                    </Router>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    {t("footer:copyright")}
                </Footer>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state?.login || false
    };
};
export default connect(mapStateToProps)(withTranslation()(App));
