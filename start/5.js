function apiHandler() {
    class APIHandler {
        constructor(api_url, auth_required) {
            console.log("=== Create APIHandler", api_url);
            this.api_url = api_url;
            this.token_errors = 0;
            this.token = undefined;
            this.token_time = 0;
            this.auth_required = false;
            if (auth_required) this.auth_required = auth_required;
            if (this.api_url[this.api_url.length - 1] != "/") {
                this.api_url + "/"
            }
        }
        updateUrl(url) {
            console.log("=== Update APIHandler", url);
            this.api_url = url
        }
        updateToken(token) {
            console.log("=== Update APIHandler token", token);
            this.token = token;
            this.token_time = performance.now();
            engine.call("set_api_key", token)
        }
        resetToken() {
            this.token = undefined;
            this.token_time = 0
        }
        getToken() {
            return this.token
        }
        get(target, params, callback) {
            if (target.startsWith("/")) {
                target = target.substr(1)
            }
            let path = this.api_url + target;
            if (params && Object.keys(params).length) {
                path += "?";
                for (let param in params) {
                    if (!path.endsWith("?") && !path.endsWith("&")) path += "&";
                    path += param + "=" + params[param]
                }
            }
            let xhr = new XMLHttpRequest;
            xhr.open("GET", path);
            if (this.auth_required) {
                xhr.setRequestHeader("Authorization", "Bearer " + this.token)
            }
            xhr.send();
            xhr.onload = function() {
                if (xhr.status != 200) {
                    callback(xhr.status, {})
                } else {
                    let data = {};
                    try {
                        data = JSON.parse(xhr.response)
                    } catch (err) {
                        console.error(err);
                        callback(500, {})
                    }
                    if (data && "statusCode" in data && data["statusCode"] !== 200) {
                        callback(data["statusCode"], {})
                    } else {
                        callback(200, data)
                    }
                }
            }
        }
        post(target, params, callback) {
            if (target.startsWith("/")) {
                target = target.substr(1)
            }
            let path = this.api_url + target;
            let xhr = new XMLHttpRequest;
            xhr.open("POST", path);
            if (this.auth_required) {
                xhr.setRequestHeader("Authorization", "Bearer " + this.token)
            }
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.onload = function() {
                if (xhr.status != 200) {
                    callback(xhr.status, {})
                } else {
                    let data = {};
                    try {
                        data = JSON.parse(xhr.response)
                    } catch (err) {
                        console.error(err);
                        callback(500, {})
                    }
                    if (data && "statusCode" in data && data["statusCode"] !== 200) {
                        callback(data["statusCode"], {})
                    } else {
                        callback(200, data)
                    }
                }
            };
            if (params) xhr.send(JSON.stringify(params));
            else xhr.send()
        }
    }
    if (!this._apiHandler) {
        this._apiHandler = new APIHandler(API_URL + GAME.get_data("API_PATH"), true)
    }
    return this._apiHandler
}

function api_request(type, target, params, callback) {
    let now = performance.now();
    let token_age = (now - apiHandler().token_time) / 1e3;
    if (apiHandler().auth_required && (token_age > 828e5 || apiHandler().token === undefined)) {
        send_string(CLIENT_COMMAND_GET_API_TOKEN, "", "apitoken", (function(token) {
            apiHandler().updateToken(token);
            send_api_request(type, target, params, callback)
        }))
    } else {
        send_api_request(type, target, params, callback)
    }
}

function send_api_request(type, target, params, callback, secondtry) {
    if (type == "GET") apiHandler().get(target, params, api_request_callback);
    if (type == "POST") apiHandler().post(target, params, api_request_callback);

    function api_request_callback(status, data) {
        if (status == 200) {
            apiHandler().token_errors = 0;
            if (typeof callback === "function") callback(data)
        } else if (status == 404) {
            console.log("API Request 404 not found", target, status);
            if (typeof callback === "function") callback(null)
        } else if (status == 401) {
            if (apiHandler().auth_required == false || secondtry !== undefined && secondtry) {
                engine.call("echo_error", "API_REQUEST_ERROR");
                console.log("API Request failed, Auth Error", target, status);
                if (typeof callback === "function") callback(null)
            } else {
                apiHandler().token_errors++;
                if (apiHandler().token_errors < 5) {
                    send_string(CLIENT_COMMAND_GET_API_TOKEN, "", "apitoken", (function(token) {
                        apiHandler().updateToken(token);
                        send_api_request(type, target, params, callback, true)
                    }))
                }
            }
        } else if (status == 500) {
            engine.call("echo_error", "API_REQUEST_ERROR");
            console.log("API Request failed, Error 500", target);
            if (typeof callback === "function") callback(null)
        } else if (status == 408) {
            engine.call("echo_error", "API_REQUEST_ERROR");
            console.log("API Request failed, Error 408", target);
            if (typeof callback === "function") callback(null)
        } else {
            engine.call("echo_error", "API_REQUEST_ERROR");
            console.log("API Request failed, Error 4", target, status);
            if (typeof callback === "function") callback(null)
        }
    }
}

function multi_req_handler(page, requests, on_success, on_delay, on_timeout, on_pagechange) {
    let req_count = 0;
    let recv_count = 0;
    let res = {};
    for (let r of requests) {
        req_count++;
        api_request("GET", r.path, r.params, (function(data) {
            if (data === null) {
                recv_count++;
                res[r.data_key_to] = null;
                return
            }
            if ("data_key_from" in r && r["data_key_from"].length && r["data_key_from"] in data) {
                res[r.data_key_to] = data[r["data_key_from"]]
            } else {
                res[r.data_key_to] = data
            }
            recv_count++
        }))
    }
    let delay = false;
    let wait = undefined;
    let req_started = Date.now();
    if (recv_count == req_count) {
        on_success(res)
    } else {
        wait = setInterval(checkResult, 25)
    }

    function checkResult() {
        if (global_menu_page != page) {
            wait = clearInterval(wait);
            on_pagechange();
            return
        }
        if (!delay && (Date.now() - req_started) / 1e3 > 1) {
            delay = true;
            on_delay()
        }
        if (recv_count == req_count) {
            wait = clearInterval(wait);
            on_success(res)
        }
        if ((Date.now() - req_started) / 1e3 > 5) {
            wait = clearInterval(wait);
            on_timeout()
        }
    }
}