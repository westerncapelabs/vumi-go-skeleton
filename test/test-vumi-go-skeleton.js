var fs = require("fs");
var assert = require("assert");
// CHANGE THIS to your-app-name 
var app = require("../lib/vumi-go-skeleton");


function fresh_api() {
    var api = app.api;
    api.reset();
    reset_im(api.im);
    return api;
}

function reset_im(im) {
    im.user = null;
    im.i18n = null;
    im.i18n_lang = null;
    im.current_state = null;
}

function maybe_call(f, that, args) {
    if (typeof f != "undefined" && f !== null) {
        f.apply(that, args);
    }
}

function check_state(user, content, next_state, expected_response, setup,
                     teardown) {
    // setup api
    var api = fresh_api();
    var from_addr = "1234567";
    var user_key = "users." + from_addr;
    api.kv_store[user_key] = user;

    maybe_call(setup, this, [api]);

    api.add_reply({
        cmd: "outbound.reply_to"
    });

    // send message
    api.on_inbound_message({
        cmd: "inbound-message",
        msg: {
            from_addr: from_addr,
            content: content,
            message_id: "123"
        }
    });

    // check result
    var saved_user = api.kv_store[user_key];
    assert.equal(saved_user.current_state, next_state);
    var reply = api.request_calls.shift();
    var response = reply.content;
    try {
        assert.ok(response);
        assert.ok(response.match(expected_response));
        assert.ok(response.length <= 163);
    } catch (e) {
        console.log(api.logs);
        console.log(response);
        console.log(expected_response);
        if (typeof response != 'undefined')
            console.log("Content length: " + response.length);
        throw e;
    }
    assert.deepEqual(app.api.request_calls, []);
    assert.equal(app.api.done_calls, 1);

    maybe_call(teardown, this, [api, saved_user]);
}

function CustomTester(custom_setup, custom_teardown) {
    var self = this;

    self._combine_setup = function(custom_setup, orig_setup) {
        var combined_setup = function (api) {
            maybe_call(custom_setup, self, [api]);
            maybe_call(orig_setup, this, [api]);
        };
        return combined_setup;
    };

    self._combine_teardown = function(custom_teardown, orig_teardown) {
        var combined_teardown = function (api, saved_user) {
            maybe_call(custom_teardown, self, [api, saved_user]);
            maybe_call(orig_teardown, this, [api, saved_user]);
        };
        return combined_teardown;
    };

    self.check_state = function(user, content, next_state, expected_response,
                                setup, teardown) {
        return check_state(user, content, next_state, expected_response,
                           self._combine_setup(custom_setup, setup),
                           self._combine_teardown(custom_teardown, teardown));
    };

    self.check_close = function(user, next_state, setup, teardown) {
        return check_close(user, next_state,
                           self._combine_setup(custom_setup, setup),
                           self._combine_teardown(custom_teardown, teardown));
    };
}

describe("test_api", function() {
    it("should exist", function() {
        assert.ok(app.api);
    });
    it("should have an on_inbound_message method", function() {
        assert.ok(app.api.on_inbound_message);
    });
    it("should have an on_inbound_event method", function() {
        assert.ok(app.api.on_inbound_event);
    });
});

// YOUR TESTS START HERE
// CHANGE THIS to test_your_app_name 
describe("test_vumi_go_skeleton", function() {

    // These are used to mock API reponses
    // EXAMPLE: Response from google maps API
    var fixtures = [
       'test/fixtures/example-geolocation.json'
    ];

    var tester = new CustomTester(function (api) {
        api.config_store.config = JSON.stringify({});
        fixtures.forEach(function (f) {
            api.load_http_fixture(f);
        });
    });

    // first test should always start 'null, null' because we haven't started interacting yet
    it("first screen should ask us to say something ", function () {
        tester.check_state(null, null, "first_state",
            "^Say something please");
    });

    it("second screen should ask if we want to know what we said", function () {
        var user = {
            current_state: 'first_state'
        };
        tester.check_state(
            user,
            "Hello world!",
            "second_state",
            "^Thank you! Do you what to know what you said\\?[^]" +
            "1. Yes[^]"+
            "2. No$"
            );
    });

    it("Declined to know what we said so say goodbye", function () {
        var user = {
            current_state: 'second_state',
            answers: {
                first_state: 'Hello world!'
            }
        };
        tester.check_state(
            user,
            "2",
            "end_state",
            "^Thank you and bye bye!$"
            );
    });

    it("Agreed to know what we said so show us", function () {
        var user = {
            current_state: 'second_state',
            answers: {
                first_state: 'Hello world!'
            }
        };
        tester.check_state(
            user,
            "1",
            "third_state",
            "^We think you said 'Hello world!'. Correct\\?[^]" +
            "1. Yes[^]"+
            "2. No$"
            );
    });

    it("Say we got it write and say goodbye", function () {
        var user = {
            current_state: 'third_state',
            answers: {
                first_state: 'Hello world!',
                second_state: 'third_state'
            }
        };
        tester.check_state(
            user,
            "1",
            "end_state_correct",
            "^Aren't we clever\\? Thank you and bye bye!$"
            );
    });

    it("Say we got it wrong and say goodbye", function () {
        var user = {
            current_state: 'third_state',
            answers: {
                first_state: 'Hello world!',
                second_state: 'third_state'
            }
        };
        tester.check_state(
            user,
            "2",
            "end_state_wrong",
            "^Silly us! Thank you and bye bye!$"
            );
    });


    // This is an example of a test that we don't want to run at the moment so we add .skip
    it.skip('should go to end when asked for them to say someting', function() {
        check_state({current_state: 'state_we_have_not_made'}, 'Hello world!',
            'end_state', '^Thank you and bye bye!');
    });

});