vumi-go-skeleton
================

*Author:* Mike Jones [mike@westerncapelabs.com]

Minimum viable vumi-go JavaScript skeleton

## Sample application layout

    lib/
    lib/vumi-go-skeleton.js
    test/test.js
    test/test-vumi-go-skeleton.js
    test/fixtures/
    test/fixtures/remote-url.json
    package.json

Everywhere you see `vumi-go-skeleton` you should replace this with `your-app-name`.


## Edit the `package.json`

`package.json` files are required for npm. npm is the pip of nodeJS. You will use npm for running local tests but it will not be used in production.

## Rename `test-vumi-go-skeleton.js`

Make it `test-your-app-name.js`.


## Edit the `test/test.js`

Edit to point to `test-your-app-name.js`


## Understanding the skeleton application

The skeleton application has example states:

1. `first_state` - a free text state. Asks a set question.
2. `second_state` - thanks user and determins if they want to leave flow. Routes to `end_state` if they do.
3. `third_state` - shows them what they said in first state and asks if we got it right
4. `end_state_correct` - an end state that declares we're clever
5. `end_state_wrong` - an end state that apologises for being wrong
3. `end_state` - an end state


## Test it!

    $ npm install mocha vumigo_v01 jed
    $ npm test

of if you want to have a constant test check running run the following (WARNING: config changes require this watcher restarted)

    $ ./node_modules/.bin/mocha -R spec --watch


## General Help: `check_state` overview

When going through USSD menus the user is guided through a series of states where they 
send and recieve data. 

    check_state(user, content, next_state, expected_response, setup, teardown)

*user:* users state dict (null if first state)  
*content:* user input (numerical key they press)   
*next_state:* expected state (state_name)  
*expected_response:* what should come back (regex, remember to escape control characters like ? with two backslashes like: \\\?)  

Where creating a `user` object the `answers` values should be the result of the user pressing the numerical keys, *not* the key value. E.g.

    var user = {
        current_state: 'state_3',
        answers: {
            state_1: 'first_press',
            state_2: 'second_press'
        }
    };



