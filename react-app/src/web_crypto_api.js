if (!("TextEncoder" in window))
    throw new Error("Sorry, your browser needs to be updated before you can use this tool.");

// https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function ab2uint16arr2str(buf) {
    return (new Uint16Array(buf)).join(',');
}

function str2uint16arr2ab(str) {
    var arr = JSON.parse("[" + str + "]");
    var buf = new ArrayBuffer(arr.length * 2);
    var bufView = new Uint16Array(buf);
    for (var i=0 ; i < arr.length ; i++) {
        bufView[i] = arr[i];
    }
    return buf;
}

export function generate_init_vector_str() {
    return window.crypto.getRandomValues(new Uint8Array(16)).join(',');
}

function init_vector_from_str(str) {
    var arr = JSON.parse("[" + str + "]");
    var buf = new ArrayBuffer(arr.length);
    var bufView = new Uint8Array(buf);
    for (var i=0 ; i < arr.length ; i++) {
        bufView[i] = arr[i];
    }
    return buf;
}

// returns Promise
function get_AES_CBC_key_from_passphrase(passphrase) {
    if (typeof passphrase != "string")
        throw new Error("Cannot convert " + (typeof passphrase) + " to Uint8Array.");

    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    return crypto.subtle.digest(
        {name: "SHA-256"}, // :param algorithm:
        (new TextEncoder()).encode(passphrase) // :param data:
    ).then(
        function(digest) {
            // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
            return window.crypto.subtle.importKey(
                "raw", // :param format:
                digest, // :param keyData:
                {name: "AES-CBC"}, // :param algorithm:
                false, // :param extractable:
                ["encrypt", "decrypt"] // :param keyUsages:
            )
        }
        ,function(e) {
            console.error(e);
        }
    );
}

// returns Promise
function AES_CBC_encrypt(encryption_key, init_vector, plaintext_payload) {
    if (typeof plaintext_payload != "string")
        throw new Error("Cannot convert " + (typeof plaintext_payload) + " to Uint8Array.");

    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
    // This promise returns encrypted payload
    return window.crypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv: init_vector, // initialisation vector need not to be secret, is required when decrypting but is not enough alone in order to decrypt
        }, // :param algorithm: https://developer.mozilla.org/en-US/docs/Web/API/AesCbcParams
        encryption_key, // :param key:
        (new TextEncoder()).encode(plaintext_payload), // :param data:
    ).then(
        function(encrypted_payload) {
            return ab2uint16arr2str(encrypted_payload);
        }
        ,function(e) {
            console.error(e);
        }
    );
}

// returns Promise
export function encrypt_with_passphrase(passphrase, init_vector_str, plaintext_payload) {
    var init_vector = init_vector_from_str(init_vector_str);
    return get_AES_CBC_key_from_passphrase(passphrase).then(
        function(generated_key) {
            // Returns promise
            return AES_CBC_encrypt(generated_key, init_vector, plaintext_payload);
        }
        ,function(e) {
            console.error(e);
        }
    );
}

// returns Promise
function AES_CBC_decrypt(decryption_key, init_vector, encrypted_payload_str) {
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/decrypt
    // This promise returns decrypted (plain text) payload
    return window.crypto.subtle.decrypt(
        {
            name: "AES-CBC",
            iv: init_vector,
        }, // :param algorithm: https://developer.mozilla.org/en-US/docs/Web/API/AesCbcParams
        decryption_key, // :param key:
        str2uint16arr2ab(encrypted_payload_str) // :param data:
    ).then(
        function(plain_payload) {
            return (new TextDecoder()).decode(plain_payload);
        }
        ,function(e) {
            console.error(e);
        }
    )
}

// returns Promise
export function decrypt_with_passphrase(passphrase, init_vector_str, encrypted_payload_str) {
    var init_vector = init_vector_from_str(init_vector_str);
    return get_AES_CBC_key_from_passphrase(passphrase).then(
        function(generated_key) {
            // Returns promise
            return AES_CBC_decrypt(generated_key, init_vector, encrypted_payload_str);
        }
        ,function(e) {
            console.error(e);
        }
    );
}
