/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement, api, track } from 'lwc';
import sitePath from "@salesforce/community/basePath";
import * as generalUtils from 'c/gtaUtilsGeneral';

/**
 * @slot linkRegion  
 */
 
 
export default class LinkifyAnything extends LightningElement {

    @api configJSONString = '{}';

    get configObj() {
        return JSON.parse(this.configJSONString);
    }

    get linkHref() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.linkHref) || this.configObj?.linkHref.trim() === 'undefined') 
        ? '' : this.configObj?.linkHref;

        if(generalUtils.isStringEmpty(tmpvalue) === false && this.linkPrependBasePath === true)
        {
            tmpvalue = sitePath + tmpvalue;
        }

        tmpvalue = tmpvalue.replaceAll('//','/');

        return tmpvalue;
    }

    get linkTitle() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.linkTitle) || this.configObj?.linkTitle.trim() === 'undefined') 
        ? '' : this.configObj?.linkTitle;
        return tmpvalue;
    }

    get linkNoTextDecoration() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.linkNoTextDecoration) )
        ? false : this.configObj?.linkNoTextDecoration;
        return tmpvalue;
    }

    get linkClasses() {
        let tmpvalue = [];
        if(this.linkNoTextDecoration === true)
        {
            tmpvalue.push('noTextDecoration');
        }
        return tmpvalue.join(' ');
    }

    get linkTarget() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.linkTarget) || this.configObj?.linkTarget.trim() === 'undefined') 
        ? '' : this.configObj?.linkTarget;
        return tmpvalue;
    }

    get linkPrependBasePath() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.linkPrependBasePath) )
        ? false : this.configObj?.linkPrependBasePath;
        return tmpvalue;
    }

    get hideComponentName() {
        let tmpvalue = (generalUtils.isStringEmpty(this.configObj?.hideComponentName) )
        ? false : this.configObj?.hideComponentName;
        return tmpvalue;
    }




    get showComponentName() {
        return this.isInSitePreview() === true && this.hideComponentName === false;
    }

    isInSitePreview() {
        let domain = document.URL.split('?')[0].replace('https://','').split('/')[0];
        return (domain.includes('.sitepreview.')  
            || domain.includes('.livepreview.') 
            || domain.includes('.live-preview.')  
            || domain.includes('.live.') 
            || domain.includes('.builder.') 
            );
    }

    handleClick(e) {
        if(this.isInSitePreview() === true)
        {
            let classes = e?.target?.classList;
            if(generalUtils.isObjectEmpty(classes) === false)
            {
                if(Array.from(classes).includes('interactions-proxy'))
                {
                    e.preventDefault();
                }
            }
           
        }
    }

}