import React from "react";
import xhr_load_script from "./xhr_loader";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logged_in: false,
            passwords: [{url: "example.com", encrypted_pwd: ""},
                {url: "example.com", encrypted_pwd: ""},
                {url: "example.com", encrypted_pwd: ""},
                {url: "example.com", encrypted_pwd: ""}]
        }

        var initGapi = function() {
            window.gapi.client.init({
                apiKey: "AIzaSyDc2p7qtGXbPyr9qaR6poitd8o-eHhRXxM",
                clientId: "693421068041-8v4j719d0cg5dek8ab2elmen2mqe33b8.apps.googleusercontent.com",
                discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
                scope: "https://www.googleapis.com/auth/spreadsheets.readonly"
            }).then(function () {
                // Listen for sign-in state changes.
                window.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

                // Handle the initial sign-in state.
                this.updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
            }, function(error) {
                alert(JSON.stringify(error, null, 2));
            });
        };
        xhr_load_script("https://apis.google.com/js/api.js", function(){window.gapi.load('client:auth2', initGapi)});
    }
    updateSigninStatus = (status) => {
        this.setState({
            logged_in: status
        });
    }
    render = () => {
        return (
            <div>
                <h4 className="bg-primary text-white text-center p-2">
                    Passwords
                </h4>
                <button className="btn btn-primary m-2"
                        style={ this.state.logged_in ? {display: "none"} : {display: "block"} }
                        onClick={ this.gapiOAuth }>
                    Authenticate to your google account
                </button>
            </div>
        )
    }
    gapiOAuth = () => {
        this.setState({
            logged_in: true
        })
    }
}

export default App;
