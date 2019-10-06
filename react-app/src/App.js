import React from "react";
import create_gapi_wrapper from "./gapi_config";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logged_in: false,
            doc_obtained: false,
            passwords: [{url: "example.com", encrypted_pwd: ""},
                {url: "example.com", uname: "example", encrypted_pwd: ""},
                {url: "example.com", uname: "example", encrypted_pwd: ""},
                {url: "example.com", uname: "example", encrypted_pwd: ""}]
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
                        style={ this.state.logged_in && ! this.state.doc_obtained ? {display: "block"} : {display: "none"} }
                        onClick={ this.gapi_open_spreadsheet }>
                    Open spreadsheet
                </button>
                <button className="btn btn-primary m-2"
                        style={ this.state.logged_in && this.state.doc_obtained ? {display: "block"} : {display: "none"} }
                        onClick={ this.gapi_unload_spreadsheet }>
                    Unload spreadsheet
                </button>
                <table className="table"
                        style={ this.state.logged_in && this.state.doc_obtained ? {display: "block"} : {display: "none"} } >
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
                            <td>{value.url}</td>
                            <td>{value.uname}</td>
                            <td>***</td>
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

    update_doc_obtained_status = (status) => {
        this.setState({
            doc_obtained: status
        });
    }
    gapi_open_spreadsheet = () => {
        try {
            this.gapi_wrapper.get_spreadsheet(this.spreadsheet_name, this.update_doc_obtained_status);
        } catch (e) {
            alert(e);
        }
    }

    gapi_unload_spreadsheet = () => {
        this.setState({
            passwords: [],
            doc_obtained: false
        });
        this.gapi_wrapper.spreadsheet_id = null;
    }
}

export default App;
