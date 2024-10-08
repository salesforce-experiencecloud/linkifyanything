/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement, api, track } from 'lwc';
import * as generalUtils from 'c/gtaUtilsGeneral';
import {displayLightningInputError} from 'c/gtaUtilsComponent';


const typeDelay = 1000;
const maxResults = 100;
const defaultCSSClasses = 'slds-m-bottom_medium';
const propertyEditorWidthStyle = ':root {--cb-property-editor-width: 400px;}';


export default class LinkifyAnythingCpe extends LightningElement {


    @track propInputs = {
        /*
            template: {
                key: 'template', //key used for html lightning-input tag identifier, must match key in propInputs
                label: 'Template', //label used for html lighting-input tag
                type: 'text', //type used for html lightning-input tag
                help: 'template', //tooltip / help text used for html lightning-input tag
                required: false, //required used for html lightning-input tag
                valuePath: 'general.template', //property path within the value object
                value: '', //default value
                doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
                classes: defaultCSSClasses + '', //css classes for html lightning-input tag
                changeHandler: this.handleTestChange, //onchange handler for html lightning-input tag
            },
        */
        linkHref: {
            key: 'linkHref', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Link Url', //label used for html lighting-input tag
            type: 'text', //type used for html lightning-input tag
            help: 'Url value of the link.', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'linkHref', //property path within the value object
            value: '', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-vertical_medium', //css classes for html lightning-input tag
            changeHandler: this.handleLinkHrefChange, //onchange handler for html lightning-input tag
        },
        linkTitle: {
            key: 'linkTitle', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Link Title', //label used for html lighting-input tag
            type: 'text', //type used for html lightning-input tag
            help: 'Title value for the link.', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'linkTitle', //property path within the value object
            value: '', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-m-vertical_medium', //css classes for html lightning-input tag
            changeHandler: this.handleLinkTitleChange, //onchange handler for html lightning-input tag
        },
        linkTarget: {
            key: 'linkTarget', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Link Target', //label used for html lighting-input tag
            type: 'select', //type used for html lightning-input tag
            help: 'Targe of the link: open in new window/tab or same', //tooltip / help text used for html lightning-input tag
            required: true, //required used for html lightning-input tag
            valuePath: 'linkTarget', //property path within the value object
            value: '_self', //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + '', //css classes for html lightning-input tag
            changeHandler: this.handleLinkTargetChange, //onchange handler for html lightning-input tag
            options:[
                {label: 'Same Tab or Window', value: '_self'},
                {label: 'New Tab or Window', value: '_blank'}
            ],
        },
        linkPrependBasePath: {
            key: 'linkPrependBasePath', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Prepend Site Base Path to link url', //label used for html lighting-input tag
            type: 'checkbox', //type used for html lightning-input tag
            help: 'Prepend the site\'s base path to the provided url', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'linkPrependBasePath', //property path within the value object
            value: false, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-p-horizontal_medium display_inline-block ', //css classes for html lightning-input tag
            changeHandler: this.handleLinkPrependBasePathChange, //onchange handler for html lightning-input tag
        },
        hideComponentName: {
            key: 'hideComponentName', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'Hide Component Name (for Builder only)', //label used for html lighting-input tag
            type: 'toggle', //type used for html lightning-input tag
            help: 'If toggled, hides component name in builder for preview purposes. Untoggle for ease of selecting component.', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'hideComponentName', //property path within the value object
            value: false, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-p-horizontal_medium display_inline-block ', //css classes for html lightning-input tag
            changeHandler: this.handleHideComponentNameChange, //onchange handler for html lightning-input tag
        },
        linkNoTextDecoration: {
            key: 'linkNoTextDecoration', //key used for html lightning-input tag identifier, must match key in propInputs
            label: 'No Text Decoration', //label used for html lighting-input tag
            type: 'checkbox', //type used for html lightning-input tag
            help: 'If checked, overrides link text decoration with none.', //tooltip / help text used for html lightning-input tag
            required: false, //required used for html lightning-input tag
            valuePath: 'linkNoTextDecoration', //property path within the value object
            value: false, //default value
            doSetDefaultValue: true, //set to true to set this lightning-input's default value to what is stored in the value object
            classes: defaultCSSClasses + ' slds-p-horizontal_medium display_inline-block ', //css classes for html lightning-input tag
            changeHandler: this.handleLinkNoTextDecorationChange, //onchange handler for html lightning-input tag
        },
    };

    @api
    get value() {
        return this._value;
    }

    set value(value) {
       
        let valuetmp = JSON.parse(value);
        let isValueUndefined = this._value === undefined;
        this._value = {};
        let hasValueChanged = false;

        for (let key in this.propInputs) {
            
            if(generalUtils.objectHasProperty(this.propInputs, key) && this.propInputs[key].doSetDefaultValue === true)
            {
                let tmpVal = generalUtils.getObjPropValue(valuetmp, this.propInputs[key].valuePath);
                if(generalUtils.isObjectEmpty(tmpVal))
                {
                    tmpVal = this.propInputs[key].value;
                    if(((this.propInputs[key].type === 'text' || this.propInputs[key].type === 'select' ||  this.propInputs[key].type === 'search') 
                        && !generalUtils.isStringEmpty(tmpVal)) 
                        ||
                        ((this.propInputs[key].type === 'toggle' || this.propInputs[key].type === 'checkbox' || this.propInputs[key].type === 'number' ) && !generalUtils.isObjectEmpty(tmpVal)))
                    {
                        valuetmp = generalUtils.setObjPropValue(valuetmp, this.propInputs[key].valuePath, tmpVal);
                        value = JSON.stringify(valuetmp);
                        hasValueChanged = true;
                    }
                    
                }
                if(this.propInputs[key].value !== tmpVal)
                {
                    /*if(key === 'iconName')
                    {
                        this.selectedIconName = tmpVal;
                        let e = {};
                        e.target = {};
                        e.target.dataset = {};
                        e.target.dataset.id = tmpVal;
                        
                        this.handleSelectIcon(e);
                        
                    }*/
                    this.propInputs[key].value = tmpVal;
                }
            }

            

        }

        this._value = value;
        if(hasValueChanged === true)
        {
            this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: value}}));
        }
    }

    getValueObj()
    {
        let tmpvalueObj = (generalUtils.isStringEmpty(this.value)) ? {} : JSON.parse(this.value);
        return tmpvalueObj;
    }

    displayInputErrorByDataKey(identifier, text)
    {
        displayLightningInputError(this, '[data-key="'+identifier+'"]', text);
    }


    handleLinkHrefChange(e) {

        window.clearTimeout(this.propInputs.linkHref.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.linkHref.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('linkHref', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    this.propInputs.linkHref.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.linkHref = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('linkHref', 'Invalid url provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('linkHref', 'Please provide a valid URL.');
            }

        }, typeDelay);
        
    }

    handleLinkTitleChange(e) {

        window.clearTimeout(this.propInputs.linkTitle.textDelayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.propInputs.linkTitle.textDelayTimeout = setTimeout(() => {
            
            this.displayInputErrorByDataKey('linkTitle', '');
            let inputvalue = e.detail.value;
            if(!generalUtils.isStringEmpty(inputvalue))
            {
                try {

                    this.propInputs.linkTitle.value = inputvalue;

                    let tmpvalueObj = this.getValueObj();
                    tmpvalueObj.linkTitle = inputvalue;

                    this.dispatchEvent(new CustomEvent("valuechange", 
                        {detail: {value: JSON.stringify(tmpvalueObj)}}));

                } catch(e) {
                    this.displayInputErrorByDataKey('linkTitle', 'Invalid url provided.');
                }
            }
            else 
            {
                this.displayInputErrorByDataKey('linkTitle', 'Please provide a valid URL.');
            }

        }, typeDelay);
        
    }

    handleLinkTargetChange(e) {

        let selectedValue = e.detail.value;
        this.propInputs.linkTarget.value = selectedValue;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.linkTarget = selectedValue;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
        
    }

    handleLinkPrependBasePathChange(e) {
        this.propInputs.linkPrependBasePath.value = e.detail.checked;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.linkPrependBasePath = this.propInputs.linkPrependBasePath.value;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }
    
    handleHideComponentNameChange(e) {
        this.propInputs.hideComponentName.value = e.detail.checked;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.hideComponentName = this.propInputs.hideComponentName.value;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

    handleLinkNoTextDecorationChange(e) {
        this.propInputs.linkNoTextDecoration.value = e.detail.checked;

        let tmpvalueObj = this.getValueObj();
        tmpvalueObj.linkNoTextDecoration = this.propInputs.linkNoTextDecoration.value;

        this.dispatchEvent(new CustomEvent("valuechange", 
            {detail: {value: JSON.stringify(tmpvalueObj)}}));
    }

}