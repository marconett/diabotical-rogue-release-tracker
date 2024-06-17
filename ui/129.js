// Implementation based on section "Returning Promises in C++" of
// https://coherent-labs.com/Documentation/cpp-gameface/df/d01/javascript_virtual_machine.html
(function() {
    'use strict';
    let engine = window.engine;

    if (!engine) {
        console.error("This module meant to be executed after UI engine initialization");
        return;
    }
    if (engine.callAsync) {
        console.error("UI async already initialized");
        return;
    }

    let cxx_promises = {};
    engine.callAsync = function() {
        return new Promise((resolve, reject) => {
            engine.call.apply(engine, arguments).then(
                (cxx_promise_json) => {
                    const cxx_promise = JSON.parse(cxx_promise_json);
                    if (!cxx_promise.Type || cxx_promise.Type != 'CouiPromise') {
                        console.error("Invalid cxx promise type");
                        reject('invalid promise');
                        return;
                    }
                    cxx_promises[cxx_promise.id] = {
                        resolve: resolve,
                        reject: reject,
                    };
                }, (errors) => {
                    reject(errors);
                }
            );
        });
    };

    engine.on('c++.promise.resolve', (id, value) => {
        console.log("resolve " + id);
        cxx_promises[id].resolve(value);
        delete cxx_promises[id];
    });

    engine.on('c++.promise.reject', (id, value) => {
        cxx_promises[id].reject(value);
        delete cxx_promises[id];
    });
})();