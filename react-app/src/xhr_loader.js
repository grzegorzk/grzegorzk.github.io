function xhr_load_script(url, callback, method="GET", is_async=true) {
    if ( ! ["GET", "POST", "HEAD"].includes(method.toUpperCase()) ) {
        throw new Error("Unhandled method passed");
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var script = document.createElement("script");
                script.innerHTML = xhr.responseText;
                document.querySelector("head").appendChild(script);
            }
            if (typeof callback != "undefined") {
                setTimeout(function(){callback(xhr.responseText, xhr.status, xhr)}, 0);
            }
        }
    };

    xhr.open(method, url, is_async);
    xhr.send();
}

export default xhr_load_script;
