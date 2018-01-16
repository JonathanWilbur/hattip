// Unfortunately, it does not look like VueJS has very good TypeScript support.

// Vue.component('https', {
//     props: [ "https" ],
//     template: `<label for="https">HTTPS?</label><inputtype="checkbox" id="https" name="https" title="Use HTTPS?" alt="Use HTTPS?" v-model="https" v-on:change="saveHTTPS" />`,
//     methods: {
//         saveHTTPS: function () {
//             localStorage.setItem("https", this.https);
//         }
//     }
// });

Vue.component('transaction', {
    props: [ "txn" ],
    template: `<div class="txn" v-on:click="select"><span class="verb">{{txn.request.verb}}</span><span class="path">{{txn.request.path}}</span></div>`,
    methods: {
        select: function () {
            this.$emit("select");
        }
    }
});

let history = new Vue({
    el: "#main",
    data: {
        https: localStorage.getItem("endpoint") == "true" ? true : false,
        endpoint: localStorage.getItem("endpoint") || "jsonplaceholder.typicode.com",
        txns: [],
        current: {
            request: {
                verb: "GET",
                path: "",
                body: ""
            },
            response: {
                code: 0,
                body: ""
            }
        }
    },
    computed: {
        color: function () {
            if (this.current.response.code == 0) {
                return "#FFFFFF";
            } else if (this.current.response.code == -1) {
                return "#888888";
            } else if (this.current.response.code >= 200 && this.current.response.code <= 399) {
                return "#AAFFAA";
            } else {
                return "#FFAAAA";
            }
        }
    },
    watch: {
        https: function (value) {
            localStorage.setItem("https", value);
        },
        txns: function (value) {
            while (this.txns.length > 50) this.txns.pop(); 
        }
    },
    methods: {
        request: function (event) {
            event.preventDefault();
            let uri = (this.https ? "https://" : "http://") + this.endpoint + this.current.request.path;
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = (function (xhr, txn, txns, colors) {
                return function () {
                    if (xhr.readyState == 4) {
                        txn.response.body = xhr.responseText;
                        txn.response.code = xhr.status;
                        txns.unshift({
                            request: {
                                verb: txn.request.verb,
                                path: txn.request.path,
                                body: txn.request.body
                            },
                            response: {
                                code: txn.response.code,
                                body: txn.response.body
                            }
                        });
                    }
                }
            })(xhr, this.current, this.txns, this.colors);
            xhr.timeout = 5000;
            xhr.ontimeout = (function (xhr, txn, txns, colors) {
                return function () {
                    txn.response.body = "[ TIMED OUT ]";
                    txn.response.code = xhr.status;
                    txns.unshift({
                        request: {
                            verb: txn.request.verb,
                            path: txn.request.path,
                            body: txn.request.body
                        },
                        response: {
                            code: txn.response.code,
                            body: txn.response.body
                        }
                    });
                }
            })(xhr, this.current, this.txns, this.colors);
            xhr.open(this.current.request.verb, uri, true);
            xhr.send(this.current.request.body);
        },
        select: function (txn) {
            this.current = {
                request: {
                    verb: txn.request.verb,
                    path: txn.request.path,
                    body: txn.request.body
                },
                response: {
                    code: txn.response.code,
                    body: txn.response.body
                }
            };
        },
        saveEndpoint: function () {
            localStorage.setItem("endpoint", this.endpoint);
        }
    }
});