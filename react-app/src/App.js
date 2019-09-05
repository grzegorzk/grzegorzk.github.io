import React from 'react';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logged_in: false
        }
    }
    render() {
        return (
            <div>
                <h4 className="bg-primary text-white text-center p-2">
                    Passwords
                </h4>
                <button className="btn btn-primary m-2"
                        style={ this.state.logged_in ? {display: 'none'} : {display: 'block'} }
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
