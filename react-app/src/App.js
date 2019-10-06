import React from "react";
import create_gapi_wrapper from "./gapi_config";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logged_in: false,
            passwords: []
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
                        style={ this.state.logged_in && ! this.state.passwords.length ? {display: "block"} : {display: "none"} }
                        onClick={ this.gapi_load_spreadsheet }>
                    Open spreadsheet
                </button>
                <button className="btn btn-primary m-2"
                        style={ this.state.logged_in && this.state.passwords.length ? {display: "block"} : {display: "none"} }
                        onClick={ this.gapi_unload_spreadsheet }>
                    Unload spreadsheet
                </button>
                <table className="table"
                        style={ this.state.logged_in && this.state.passwords.length ? {display: "block"} : {display: "none"} } >
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">url</th>
                            <th scope="col">user name</th>
                            <th scope="col">password</th>
                        </tr>
                    </thead>
                    <tbody>
                    {this.state.passwords.map((value, index) => {
                        return <tr key={index}>
                            <td>{index}</td>
                            <td onClick={ () => this.update_url(index) }>{value.url}</td>
                            <td onClick={ () => this.update_uname(index) }>{value.uname}</td>
                            <td onClick={ () => this.gapi_pwd_to_clipboard(index) }>***</td>
                            <td onClick={ () => this.gapi_update_pwd(index) }>change password</td>
                        </tr>
                    })}
                    </tbody>
                </table>
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
            passwords: [],
        });
        this.gapi_wrapper.spreadsheet_id = null;
    }

    update_url_in_state = (index, new_url) => {
        // https://stackoverflow.com/questions/29537299
        let passwords = [...this.state.passwords];
        let pwd = {...passwords[index]};
        pwd.url = new_url;
        passwords[index] = pwd;
        this.setState({
            passwords: passwords
        });
    }
    update_url = (index) => {
        var new_url = prompt(this.state.passwords[index].url);
        this.update_url_in_state(index, new_url);
    }

    update_uname_in_state = (index, new_uname) => {
        let passwords = [...this.state.passwords];
        let pwd = {...passwords[index]};
        pwd.uname = new_uname;
        passwords[index] = pwd;
        this.setState({
            passwords: passwords
        });
    }
    update_uname = (index) => {
        var new_uname = prompt(this.state.passwords[index].uname);
        this.update_uname_in_state(index, new_uname);
    }

    gapi_pwd_to_clipboard = (index) => {
    }
    gapi_update_pwd = (index) => {
    }
}

export default App;
