import React from "react";
import xhr_load_script from "./xhr_loader";
import create_gapi_wrapper from "./gapi_config";

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

        this.gapi_wrapper = create_gapi_wrapper(this.update_sign_in_status);
        var gapi_callback = this.gapi_wrapper.get_gapi_callback();
        xhr_load_script("https://apis.google.com/js/api.js", function(){
            window.gapi.load('client:auth2', gapi_callback)
        });
    }
    update_sign_in_status = (status) => {
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
                        onClick={ this.gapi_oauth }>
                    Authenticate to your google account
                </button>
            </div>
        )
    }
    gapi_oauth = () => {
        if ( ! this.gapi_wrapper.is_ready() ) {
            alert("Gooogle API is still loading, please try again");
            return;
        }
        this.gapi_wrapper.sign_in();
    }
}

export default App;
