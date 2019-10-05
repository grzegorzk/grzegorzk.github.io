import xhr_load_script from "./xhr_loader";

/* scopes: https://developers.google.com/sheets/api/guides/authorizing
 * Multiple scopes are allowed, separate them with spaces
 */
var credentials = {
    apiKey: "AIzaSyA3k2KGpFCPZolfzG0dZxIMQSNEBTK2Q0s",
    clientId: "693421068041-8v4j719d0cg5dek8ab2elmen2mqe33b8.apps.googleusercontent.com",
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4",
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    scopes: "https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/spreadsheets"
};

/* interface class abstracting away gapi from the app
 * https://developers.google.com/sheets/api/
 */
class GapiWrapper {
    constructor() {
        this.gapi = null;
        this.init_gapi_callback = function() {};
        this.instance = null;
        this.spreadsheet_id = null;
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
        if ( ! this.is_ready() ) {
            throw new Error("Gooogle API is still loading, please try again");
        }
        this.gapi.auth2.getAuthInstance().signIn();
    }

    sign_out() {
        if ( ! this.is_ready() ) {
            throw new Error("Gooogle API is still loading, please try again");
        }
        this.gapi.auth2.getAuthInstance().signOut();
    }

    // TODO: refactor
    create_spreadsheet(title, callback) {
        if ( ! this.is_ready() ) {
            throw new Error("Gooogle API is still loading, please try again");
        }
        if ( ! window.gapi.auth2.getAuthInstance().isSignedIn.get() ) {
            throw new Error("You need to be signed in to create documents");
        }
        if ( this.spreadsheet_id != null ) {
            throw new Error("Your request is being processed or document has already been created");
        }

        // User may quickly click multiple times
        // We need to ensure above condition won't let us in next time
        this.spreadsheet_id = -1;

        var this_gapi_wrapper = this.instance;

        // Check if file already exists
        // https://developers.google.com/drive/api/v3/search-files
        this.gapi.client.drive.files.list({
            'pageSize': 10,
            'q': "mimeType='application/vnd.google-apps.spreadsheet' and name='" + title + "'",
            'fields': "nextPageToken, files(id, name)"
        }).then(function(response) {
            var files = response.result.files;
            if ( files && files.length > 0 ) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    this_gapi_wrapper.spreadsheet_id = file.id;
                    callback(true);
                    // TODO: more files could match search criteria
                    break;
                }
            } else {
                this_gapi_wrapper.gapi.client.sheets.spreadsheets.create({
                    properties: {title: title}
                }).then((response) => {
                    this_gapi_wrapper.spreadsheet_id = response.result.spreadsheetId;
                    callback(true);
                });
            }
        });
    }
}

/* Cannot use GapiWrapper constructor because we need to pass instance of it to async callback */
export default function create_gapi_wrapper(signed_in_hook) {
    // signed_in_hook must be a function
    if ( ! signed_in_hook && {}.toString.call(signed_in_hook) === '[object Function]' )
        throw new Error("signed_in_hook must be a function.");

    var gapi_wrapper = new GapiWrapper();
    gapi_wrapper.instance = gapi_wrapper;
    gapi_wrapper.init_gapi_callback = function() {
        window.gapi.client.init({
            apiKey: credentials.apiKey,
            clientId: credentials.clientId,
            discoveryDocs: credentials.discoveryDocs,
            scope: credentials.scopes
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

    xhr_load_script("https://apis.google.com/js/api.js", function(){
        window.gapi.load('client:auth2', gapi_wrapper.init_gapi_callback)
    });

    return gapi_wrapper;
}
