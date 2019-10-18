import React, { Component } from 'react'
import reducer from './services/reducer'

import Module from '../../abc/Module';
import {HEADER_POS_RIGHT} from '../../services/HeaderService';

import UserDropdown from './containers/UserDropdown';
import RegisterContainer from './containers/RegisterContainer'
import AuthContainer from './containers/AuthContainer'
import TeskalabsAuth from './containers/TeskalabsAuth'
import GitHubAuth from './containers/GitHubAuth'
import AuthService from './services/AuthService'
// import GitHubAuthMethod from './services/GitHubAuthMethod/GitHubAuthMethod';



export default class AuthenticationModule extends Module {
    constructor(app, name){
        super(app, "Authentication");

        app.Router.addRoute({
            path: '/auth',
            exact: true,
            name: 'Authentication',
            component: AuthContainer,
            hasHeader: false,
            hasSidebar: false,
            hasBreadcrumb: false,
            hasFooter: true,
            authn: false,
        });

        app.Router.addRoute({
            path: '/auth/teskalabs',
            exact: true,
            name: 'TL Authentication',
            component: TeskalabsAuth,
            hasHeader: false,
            hasSidebar: false,
            hasBreadcrumb: false,
            hasFooter: true,
            authn: false,
        });

        app.Router.addRoute({
            path: '/auth/github',
            exact: true,
            name: 'GH Authentication',
            component: GitHubAuth,
            hasHeader: false,
            hasSidebar: false,
            hasBreadcrumb: false,
            hasFooter: true,
            authn: false,
        });


        app.Router.addRoute({
            path: '/auth/register',
            exact: true,
            name: 'TL Registration',
            component: RegisterContainer,
            hasHeader: false,
            hasSidebar: false,
            hasBreadcrumb: false,
            hasFooter: true,
            authn: false,
        });



        // Custom userdropdown Component in header
        const headerService = app.locateService("HeaderService");
        const userDropdownProps = {"app":app};
        headerService.addComponent(HEADER_POS_RIGHT, UserDropdown, userDropdownProps);

        // Add AuthService

        this.AuthService = new AuthService(app, "AuthService");
        // this.AuthService.addAuthMethods (
        //     new GitHubAuthMethod(app)
        // )


        app.ReduxService.addReducer("AuthService", reducer);
    }
}
