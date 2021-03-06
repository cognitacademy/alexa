'use strict';
const Alexa = require('alexa-sdk');
const APP_ID = 'skill ID here';

const HELP_MESSAGE = 'What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';


const handlers = {
    'LaunchRequest': function () {
        this.response.speak('Welcome to {Application Name}').listen();
        this.emit(':responseReady');
    },
    'IntentName': function(){
        let filledSlots=delegateSlotCollection.call(this,function(event){
            let result=false;
            let slots=event.request.intent.slots;
            
            if(slots && event.request.intent.confirmationStatus!="NONE"){
                result=true;
            }
            
            return result;
        });
        
        if(!filledSlots)return;
        
        let slotValues=getSlotValues(filledSlots);
        
        console.log(JSON.stringify(slotValues));
        
        let speechOutput="Construct Respose message here";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    }
    ,
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};


function getSlotValues (filledSlots) {
    let slotValues = {};
    console.log('The filled slots: ' + JSON.stringify(filledSlots));
    Object.keys(filledSlots).forEach(function(item) {
   
    var name = filledSlots[item].name;
   
    if(filledSlots[item]&&
        filledSlots[item].resolutions &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
        filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code ) {

        switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            case "ER_SUCCESS_MATCH":
                slotValues[name] = {
                    "synonym": filledSlots[item].value,
                    "resolved": filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                    "isValidated": true
                };
                break;
            case "ER_SUCCESS_NO_MATCH":
                slotValues[name] = {
                    "synonym": filledSlots[item].value,
                    "resolved": filledSlots[item].value,
                    "isValidated":false
                };
                break;
            }
        } else {
            slotValues[name] = {
                "synonym": filledSlots[item].value,
                "resolved": filledSlots[item].value,
                "isValidated": false
            };
        }
    },this);
    return slotValues;
}

function delegateSlotCollection(func) {
    console.log("in delegateSlotCollection");
    console.log("current dialogState: " + this.event.request.dialogState);

    if(func) {
        if (func(this.event)) {
            this.event.request.dialogState = "COMPLETED";
            return this.event.request.intent.slots;
        }
    }

    if (this.event.request.dialogState === "STARTED") {
        console.log("in STARTED");
        console.log(JSON.stringify(this.event));
        var updatedIntent = this.event.request.intent;
        // optionally pre-fill slots: update the intent object with slot values
        // for which you have defaults, then return Dialog.Delegate with this
        // updated intent in the updatedIntent property

        this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("in not completed");
        //console.log(JSON.stringify(this.event));
        this.emit(":delegate", updatedIntent);
    } else {
        console.log("in completed");
        //console.log("returning: "+ JSON.stringify(this.event.request.intent));
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent.slots;
    }
    return null;
}