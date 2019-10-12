import React from "react";
import create_gapi_wrapper from "./gapi_config";
import {generate_init_vector, encrypt_with_passphrase, decrypt_with_passphrase} from "./web_crypto_api";

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

        this.gapi_wrapper.update_entry(pwd.index, "A", pwd.url, callback);
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

        this.gapi_wrapper.update_entry(pwd.index, "B", pwd.uname, callback);
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
        passwords.push({index: index, url: "", uname: "", encrypted_pwd: "", init_vector: []});
        this.setState({
            passwords: passwords
        });
    }

    update_pwd_in_state = (i, new_encrypted_pwd, init_vector) => {
        if ( this.state.passwords == null ) {
            throw new Error("Tried to update uninitialised this.state.passwords");
        }
        if ( this.state.passwords.length - 1 < i ) {
            throw new Error("Tried to update this.state.passwords at nonexisting index");
        }

        let passwords = [...this.state.passwords];
        let pwd = {...passwords[i]};
        pwd.encrypted_pwd = new_encrypted_pwd;
        pwd.init_vector = init_vector;
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
        // TODO: we might want to encrypt everything behind the scenes using hardcoded key
        this.gapi_wrapper.update_entry(pwd.index, "C", pwd.encrypted_pwd, callback);
        this.gapi_wrapper.update_entry(pwd.index, "D", pwd.init_vector.join(','), callback);
    }
    gapi_update_pwd = (i) => {
        var new_pwd = prompt("Please provide new password");
        // TODO: we might want to add salt to password
        var master_pwd = prompt("Please provide master password to encrypt new password");
        var update_pwd_callback = this.update_pwd_in_state;

        var init_vector = generate_init_vector();
        encrypt_with_passphrase(master_pwd, init_vector, new_pwd).then(
            function(enc){
                update_pwd_callback(i, enc, init_vector);
            }
            ,function(e){
                console.error(e);
                alert("Error when encrypting your password, please try again.");
            }
        );
        // Probably redundant
        master_pwd = "";
    }

    gapi_pwd_to_clipboard = (index) => {
    }
}

export default App;
