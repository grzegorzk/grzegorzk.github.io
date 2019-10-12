import React from "react";
import create_gapi_wrapper from "./gapi_config";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logged_in: false,
            passwords: null
        }
        this.spreadsheet_name = "do_not_rename_me_aes_256_passwords.xls";
        this.gapi_wrapper = create_gapi_wrapper(this.update_sign_in_status);
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
                <button className="btn btn-primary m-2"
                        style={ this.state.logged_in ? {display: "block"} : {display: "none"} }
                        onClick={ this.gapi_logout }>
                    Log out from your google account
                </button>
                <button className="btn btn-primary m-2"
                        style={ this.state.logged_in && this.state.passwords == null ? {display: "block"} : {display: "none"} }
                        onClick={ this.gapi_load_spreadsheet }>
                    Open spreadsheet
                </button>
                <button className="btn btn-primary m-2"
                        style={ this.state.logged_in && this.state.passwords != null ? {display: "block"} : {display: "none"} }
                        onClick={ this.gapi_unload_spreadsheet }>
                    Unload spreadsheet
                </button>
                <table className="table"
                        style={ this.state.logged_in && this.state.passwords != null ? {display: "block"} : {display: "none"} } >
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">url</th>
                            <th scope="col">user name</th>
                            <th scope="col">password</th>
                        </tr>
                    </thead>
                    <tbody>
                    {this.state.passwords != null ? this.state.passwords.map((value, index) => {
                        return <tr key={index}>
                            <td>{1 + index}</td>
                            <td onClick={ () => this.update_url(index) }>{value.url}</td>
                            <td onClick={ () => this.update_uname(index) }>{value.uname}</td>
                            <td onClick={ () => this.gapi_pwd_to_clipboard(index) }>***</td>
                            <td onClick={ () => this.gapi_update_pwd(index) }>change password</td>
                        </tr>
                    }) : null}
                    </tbody>
                </table>
                <button className="btn btn-primary m-2"
                        style={ this.state.logged_in && this.state.passwords != null ? {display: "block"} : {display: "none"} }
                        onClick={ this.gapi_add_row }>
                    Add
                </button>
            </div>
        )
    }
    gapi_oauth = () => {
        try {
            this.gapi_wrapper.sign_in();
        } catch (e) {
            alert(e);
        }
    }
    gapi_logout = () => {
        this.gapi_unload_spreadsheet();
        try {
            this.gapi_wrapper.sign_out();
        } catch (e) {
            alert(e);
        }
    }

    update_passwords_in_state = (values) => {
        this.setState({
            passwords: values
        });
    }
    gapi_load_spreadsheet = () => {
        try {
            this.gapi_wrapper.load_spreadsheet(this.spreadsheet_name, this.update_passwords_in_state);
        } catch (e) {
            alert(e);
        }
    }

    gapi_unload_spreadsheet = () => {
        this.setState({
            passwords: null,
        });
        this.gapi_wrapper.spreadsheet_id = null;
    }

    update_url_in_state = (i, new_url) => {
        if ( this.state.passwords == null ) {
            throw new Error("Tried to update uninitialised this.state.passwords");
        }
        if ( this.state.passwords.length - 1 < i ) {
            throw new Error("Tried to update this.state.passwords at nonexisting index");
        }

        // https://stackoverflow.com/questions/29537299
        let passwords = [...this.state.passwords];
        let pwd = {...passwords[i]};
        pwd.url = new_url;
        passwords[i] = pwd;
        // TODO: below is probably bad practice
        var app_instance = this;
        var callback = function() {
            app_instance.setState({
                passwords: passwords
            });
        };

        this.gapi_wrapper.update_entry(pwd.index, pwd.url, pwd.uname, pwd.encrypted_pwd, callback);
    }
    update_url = (i) => {
        var new_url = prompt(this.state.passwords[i].url);
        this.update_url_in_state(i, new_url);
    }

    update_uname_in_state = (i, new_uname) => {
        if ( this.state.passwords == null ) {
            throw new Error("Tried to update uninitialised this.state.passwords");
        }
        if ( this.state.passwords.length - 1 < i ) {
            throw new Error("Tried to update this.state.passwords at nonexisting index");
        }

        let passwords = [...this.state.passwords];
        let pwd = {...passwords[i]};
        pwd.uname = new_uname;
        passwords[i] = pwd;
        this.setState({
            passwords: passwords
        });
        // TODO: below is probably bad practice
        var app_instance = this;
        var callback = function() {
            app_instance.setState({
                passwords: passwords
            });
        };

        this.gapi_wrapper.update_entry(pwd.index, pwd.url, pwd.uname, pwd.encrypted_pwd, callback);
    }
    update_uname = (i) => {
        var new_uname = prompt(this.state.passwords[i].uname);
        this.update_uname_in_state(i, new_uname);
    }

    gapi_add_row = () => {
        if ( this.state.passwords == null ) {
            throw new Error("Tried to update uninitialised this.state.passwords");
        }
        var index = 1;
        if ( this.state.passwords.length > 0 ) {
            index = 1 + this.state.passwords.slice(-1)[0].index;
        }
        let passwords = [...this.state.passwords];
        passwords.push({index: index, url: "", uname: "", encrypted_pwd: ""});
        this.setState({
            passwords: passwords
        });
    }

    gapi_pwd_to_clipboard = (index) => {
    }
    gapi_update_pwd = (index) => {
    }
}

export default App;
