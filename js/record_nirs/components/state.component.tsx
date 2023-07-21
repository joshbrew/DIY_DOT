import React, { Component } from 'react'
import { EventHandler } from 'graphscript'//'../../../graphscript/index'//
import { state } from 'graphscript'
//These components share their state with the global state provided by graphscript's EventHandler, 
//  and changes propagate both directions with setState on the component state or global state

// It assumes all state keys are to be shared with global state, 
//    so if you want unique properties on this component, enforce a random Id, qhich we provided with this.unique, e.g. state = { [this.unique+'.textColor']:'blue' }

//Use "this" scope for things you don't want on the global state.

export class sComponent extends Component<{[key:string]:any}> {

    statemgr = state as EventHandler;
    state_subs = {};
    UPDATED = [] as any;
    unique = `component${Math.floor(Math.random()*1000000000000000)}`;

    react_setState = (this as any).setState.bind(this);


    constructor(
        props:{
            [key:string]:any,
            state?:EventHandler,
            doNotSubscribe?:string[] //can skip certain props
        }={
            state:state as EventHandler //can apply a new state other than the global state so you can have states for certain pages for example
        }
    ) {
        super(props);

        if(props.state) //synced with global state
            this.statemgr = props.state as EventHandler;

        
        (this as any).setState = (s:any) => {

            this.UPDATED = Object.keys(s);
            this.react_setState(s);
            if(typeof s === 'object') {            
               state.setState(s); //now relay through event handler
            }
        }

        setTimeout(()=>{
            let found = {};
            for(const prop in (this as any).state) { //for all props in state, subscribe to changes in the global state
                if(props?.doNotSubscribe && props.doNotSubscribe.indexOf(prop) > -1) continue;
                if(prop in this.statemgr.data) found[prop] = this.statemgr.data[prop]
                this.state_subs[prop] = this.__subscribeComponent(prop);
            }
            if(Object.keys(found).length > 0) this.react_setState(found); //override defaults
        },0.001);
        
    }

    __subscribeComponent(prop, onEvent?:(value)=>void) {
        
        let sub = this.statemgr.subscribeEvent(prop,(res)=>{
            let c = this;
            if(typeof c === 'undefined') { //the class will be garbage collected by react and this will work to unsubscribe
                this.statemgr.unsubscribeEvent(prop, sub);
            }
            else {
                if(onEvent) onEvent(res);
                let wasupdated = this.UPDATED.indexOf(prop);
                if( wasupdated > -1) {
                    this.UPDATED.splice(wasupdated,1);
                }
                else {
                    this.react_setState({[prop]:res});//only updates one prop at a time rn
                }
            }
        });

        return sub;

    }

    __unsubscribeComponent(prop?) {
        if(!prop) {
            for(const key in this.state_subs) {
                this.statemgr.unsubscribeEvent(key, this.state_subs[key]);
            }
        }
    }

}