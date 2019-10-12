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
        this.invalid_spreadsheet_id = -1;
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
    load_spreadsheet(title, callback) {
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
        // That's why we set magic number below
        this.spreadsheet_id = this.invalid_spreadsheet_id;

        var this_gapi_wrapper = this.instance;

        var create_spreadsheet = function(title, callback) {
            this_gapi_wrapper.gapi.client.sheets.spreadsheets.create({
                properties: {title: title}
            }).then((response) => {
                this_gapi_wrapper.spreadsheet_id = response.result.spreadsheetId;
                callback([]);
            });
        }

        var get_spreadsheet_rows = function(spreadsheet_id, callback) {
            var params = {
                spreadsheetId: spreadsheet_id,
                ranges: "Sheet1!A:C",
                majorDimension: "ROWS"
            };

            // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchGet
            var request = this_gapi_wrapper.gapi.client.sheets.spreadsheets.values.batchGet(params);
            request.then(function(response) {
                if ( response.result.valueRanges.length !== 1 ) {
                    throw new Error("Only one range was expected, got " + response.result.valueRanges.length);
                }
                var passwords = [];
                var rows = response.result.valueRanges[0].values;
                if ( rows instanceof Array === false ) {
                    callback(passwords);
                    return;
                }
                // TODO: replace magic column numbers with properties from this_gapi_wrapper
                for ( var i = 0 ; i < rows.length ; i ++ ) {
                    var columns = rows[i];
                    var url = "";
                    var uname = "";
                    var encrypted_pwd = "";
                    var init_vector = "";
                    var index = 1 + i;
                    if ( columns.length >= 1 ) {
                        url = columns[0];
                    }
                    if ( columns.length >= 2 ) {
                        uname = columns[1];
                    }
                    if ( columns.length >= 3 ) {
                        encrypted_pwd = columns[2];
                    }
                    if ( columns.length >= 4 ) {
                        init_vector = JSON.parse("[" + columns[3] + "]");
                    }
                    passwords.push({
                        url: url,
                        uname: uname,
                        encrypted_pwd: encrypted_pwd,
                        init_vector: init_vector,
                        index: index
                    })
                }
                callback(passwords);
            }, function(reason) {
                console.error("error: " + reason.result.error.message);
            });
        }

        // Check if file already exists
        // https://developers.google.com/drive/api/v3/search-files
        this.gapi.client.drive.files.list({
            'pageSize': 10,
            'q': "mimeType='application/vnd.google-apps.spreadsheet' and name='" + title + "'",
            'fields': "nextPageToken, files(id, name)"
        }).then(function(response) {
            var files = response.result.files;
            if ( files && files.length === 1 ) {
                var file = null;
                for (var i = 0; i < files.length; i++) {
                    file = files[i];
                    this_gapi_wrapper.spreadsheet_id = file.id;
                    get_spreadsheet_rows(file.id, callback);
                }
            } else if ( files.length > 1 ) {
                // This is critical situation, user should not proceed
                this_gapi_wrapper.spreadsheet_id = this_gapi_wrapper.invalid_spreadsheet_id;

                var error_msg = "More than one '" + title + "' found. Remove unwanted copy and try again";
                error_msg += "\nIf you removed duplicate remember to also remove it from google drive trash";
                console.log(error_msg);
                alert(error_msg);
                throw new Error(error_msg);
            } else {
                create_spreadsheet(title, callback);
            }
        });
    }

    update_entry(index, column, value, callback) {
        if ( ! ["A", "a", "B", "b", "C", "c", "D", "d"].includes(column) ){
            throw new Error("Only columns A, B or C are allowed");
        }
        if ( ! this.is_ready() ) {
            throw new Error("Gooogle API is still loading, please try again");
        }
        if ( ! window.gapi.auth2.getAuthInstance().isSignedIn.get() ) {
            throw new Error("You need to be signed in to create documents");
        }
        if ( this.spreadsheet_id == null ) {
            throw new Error("Spreadsheet with passwords have not been created yet");
        }

        var this_gapi_wrapper = this.instance;
        var params = {
            spreadsheetId: this_gapi_wrapper.spreadsheet_id
        };
        var values = {
            valueInputOption: "RAW",
            data: [{
                range: "Sheet1!" + column + "" + index,
                majorDimension: "ROWS",
                values: [[value ? value : ""]]
            }]
        };

        // TODO: get that row first, calculate md5 and compare with old_md5 before updating
        // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchUpdate
        var request = this_gapi_wrapper.gapi.client.sheets.spreadsheets.values.batchUpdate(params, values);
        request.then(function(response) {
            callback();
        }, function(reason) {
            console.error("error: " + reason.result.error.message);
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
