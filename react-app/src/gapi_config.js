var credentials = {
    apiKey: "AIzaSyDc2p7qtGXbPyr9qaR6poitd8o-eHhRXxM",
    clientId: "693421068041-8v4j719d0cg5dek8ab2elmen2mqe33b8.apps.googleusercontent.com",
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
}; 

/* interface class abstracting away gapi from the app */

class GapiWrapper {
    constructor() {
        this.gapi = null;
        this.init_gapi_callback = function() {}
    }
    is_ready() {
        if ( this.gapi == null )
            return false;
        return true;
    }
    get_gapi_callback() {
        return this.init_gapi_callback;
    }
    sign_in() {
        this.gapi.auth2.getAuthInstance().signIn();
    }
}

/* Cannot use GapiWrapper constructor because we need to pass instance of it to async callback */
export default function create_gapi_wrapper(signed_in_hook) {
    // signed_in_hook must be a function
    if ( ! signed_in_hook && {}.toString.call(signed_in_hook) === '[object Function]' )
        throw new Error("signed_in_hook must be a function.");

    var gapi_wrapper = new GapiWrapper();
    gapi_wrapper.init_gapi_callback = function() {
        window.gapi.client.init({
            apiKey: credentials.apiKey,
            clientId: credentials.clientId,
            discoveryDocs: credentials.discoveryDocs,
            scope: credentials.scope
        }).then(function () {
            // Listen for sign-in state changes.
            window.gapi.auth2.getAuthInstance().isSignedIn.listen(signed_in_hook);

            // Handle the initial sign-in state.
            signed_in_hook(window.gapi.auth2.getAuthInstance().isSignedIn.get());

            // Pass gapi object to the wrapper for later use
            gapi_wrapper.gapi = window.gapi;
        }, function(error) {
            console.log(JSON.stringify(error, null, 2));
        });
    }

    return gapi_wrapper;
}
