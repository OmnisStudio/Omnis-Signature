ctrl_net_omnis_signature.prototype = (function() {

    /**
     * Omnis Studio JSON defined javascript signature pad component as defined in ../html/controls/net.omnis.signature
     * for use in conjunction with signature_pad.js downloaded from https://github.com/szimek/signature_pad
     */

    /****** CONSTANTS ******/
    var PROPERTIES = {
        dotsize: "$dotsize",
        minwidth: "$minwidth",
        maxwidth: "$maxwidth",
        throttle: "$throttle",
        backgroundcolor: "$backgroundcolor",
        pencolor: "$pencolor",
        velocityfilterweight: "$velocityfilterweight",
        transparentbackground: "$transparentbackground"
    };

    var EVENTS = {
    };

    /** The control prototype - inherited from base class prototype */
    var ctrl = new ctrl_base();

    /**
     * class initialization, must be called by constructor
     * this function should initialize class variables
     * IMPORTANT:
     * initialization is separated out from the constructor
     * as the base class constructor is not called when a
     * class is subclassed.
     * all subclass constructors must call their own
     * init_class_inst function which in turn must call the
     * superclass.init_class_inst function
     */
    ctrl.init_class_inst = function()
    {
        // install superclass prototype so we can than call superclass methods
        // using this.superclass.method_name.call(this[,...])
        this.superclass = ctrl_base.prototype;

        // call our superclass class initializer
        this.superclass.init_class_inst.call( this );

        // initialize class specific stuff
        this.mData = "";
        this.mdotsize = "";
        this.mminwidth = "";
        this.mmaxwidth = "";
        this.mthrottle = 0;
        this.mbackgroundcolor = "";
        this.mpencolor = "";
        this.mvelocityfilterweight = "";
        this.mtransparentbackground = true
    };

    ctrl.delete_class_inst = function()
    {
        //TODO: Any custom cleanup when control is deleted. Remove function if no custom behaviour required.
        this.superclass.delete_class_inst.call(this); // Call superclass version to perform standard deletion procedure.
    };

    /**
     * Initializes the control instance from element attributes.
     * Must be called after control is constructed by the constructor.
     * @param form      Reference to the parent form.
     * @param elem      The html element the control belongs to.
     * @param rowCtrl   Pointer to a complex grid control if this control belongs to a cgrid.
     * @param rowNumber The row number this control belongs to if it belongs to a cgrid.
     * @returns {boolean}   True if the control is a container.
     */
    ctrl.init_ctrl_inst = function( form, elem, rowCtrl, rowNumber )
    {
        // call our superclass init_ctrl_inst
        this.superclass.init_ctrl_inst.call( this, form, elem, rowCtrl, rowNumber );

        //Control-specific initialization:
        var client_elem = this.getClientElem();
        var dataprops = client_elem.getAttribute('data-props');
        var datapropsobj = JSON.parse(dataprops);

        this.canvas = document.createElement("canvas");

        this.canvas.width = client_elem.clientWidth;
        this.canvas.height = client_elem.clientHeight;

        client_elem.appendChild(this.canvas);
        this.signaturePad = new SignaturePad(this.canvas);

        var _this = this;
        this.signaturePad.onEnd = function () {
            _this.drawEnd.call(_this)
        }

        var attValue = datapropsobj.dotsize;
        this.setProperty(PROPERTIES.dotsize, attValue);

        var attValue = datapropsobj.minwidth;
        this.setProperty(PROPERTIES.minwidth, attValue);

        var attValue = datapropsobj.maxwidth;
        this.setProperty(PROPERTIES.maxwidth, attValue);

        var attValue = datapropsobj.throttle;
        this.setProperty(PROPERTIES.throttle, attValue);

        var attValue = datapropsobj.pencolor;
        this.setProperty(PROPERTIES.pencolor, attValue);

        var attValue = datapropsobj.velocityfilterweight;
        this.setProperty(PROPERTIES.velocityfilterweight, attValue);

        var attValue = datapropsobj.transparentbackground;
        this.setProperty(PROPERTIES.transparentbackground, attValue);

        var attValue = datapropsobj.backgroundcolor;
        this.setProperty(PROPERTIES.backgroundcolor, attValue);

        //Add event handler:
        this.addClickHandlers(client_elem);

        this.update();

        // return true if our control is a container and the
        // children require installing via this.form.InstallChildren
        return false
    };

    /**
     * The control's data has changed. The contents may need to be updated.
     *
     * @param {String} what    Specifies which part of the data has changed:
     *                 ""              - The entire data has changed
     *                 "#COL"          - A single column in the $dataname list (specified by 'row' and 'col') or a row's column (specified by 'col')
     *                 "#LSEL"         - The selected line of the $dataname list has changed (specified by 'row')
     *                 "#L"            - The current line of the $dataname list has changed  (specified by 'row')
     *                 "#LSEL_ALL"     - All lines in the $dataname list have been selected.
     *                 "#NCELL"        - An individual cell in a (nested) list. In this case, 'row' is an array of row & column numbers.
     *                                  of the form "row1,col1,row2,col2,..."
     *
     * @param {Number} row             If specified, the row number in a list (range = 1..n) to which the change pertains.
     *                                 If 'what' is "#NCELL", this must be an array of row and col numbers. Optionally, a modifier may be
     *                                 added as the final array element, to change which part of the nested data is to be changed. (Currently only "#L" is supported)
     *
     * @param {Number|String} col      If specified, the column in a list row (range = 1..n or name) to which the change pertains.
     */
    ctrl.updateCtrl = function(what, row, col, mustUpdate)
    {
        if (!this.getTrueVisibility()) // Only update when control is visible
            return

        var elem = this.getClientElem();

        // read $dataname value and display in control
        var dataname = this.getData();
        if (dataname !== null) {
            this.mData = dataname;
        } else {
            this.mData = "";
        }

        if (this.mData.length>0)
        {
            this.signaturePad.fromDataURL(this.mData)
        }
    };

    /**
     * This is called when an event registered using this.mEventFunction() is triggered.
     *
     * @param event The event object
     */

    ctrl.handleEvent = function( event ) {
        /**
        if (!this.isEnabled()) return true; // If the control is disabled, don't process the event.

        switch (event.type) {
            case "click":
                return this.handleClick(event.offsetX, event.offsetY);
            case "touchstart":
                this.lastTouch = new Date().getTime(); // Note the time of the touch start.
                this.touchStartPos = {
                    x: event.changedTouches0.clientX,
                    y: event.changedTouches0.clientY
                }; // Note the starting position of the touch.
                break;
            case "touchend":
                var time = new Date().getTime();
                if (time - this.lastTouch < 500) { //Treat as a click if less than 500ms have elapsed since touchstart
                    if (touchWithinRange(this.touchStartPos, event.changedTouches0, 20)) { //Only treat as a click if less than 20 pixels have been scrolled.
                        return this.handleClick(event.changedTouches0.offsetX, event.changedTouches0.offsetY);
                    }
                }
                break;
        }
        return this.superclass.handleEvent.call( this, event ); //Let the superclass handle the event, if not handled here.
         */
    };

    /**
     * Called to get the value of an Omnis property
     *
     * @param propNumber    The Omnis property number
     * @returns {var}       The property's value
     */
    ctrl.getProperty = function(propNumber)
    {
        switch (propNumber) {
            case eBaseProperties.text:
                return this.mText;
            case PROPERTIES.dotsize:
                return this.mdotsize;
            case PROPERTIES.minwidth:
                return this.mminwidth;
            case PROPERTIES.maxwidth:
                return this.mmaxwidth;
            case PROPERTIES.throttle:
                return this.mthrottle;
            case PROPERTIES.backgroundcolor:
                return this.mbackgroundcolor;
            case PROPERTIES.pencolor:
                return this.mpencolor;
            case PROPERTIES.velocityfilterweight:
                return this.mvelocityfilterweight;
            case PROPERTIES.transparentbackground:
                return this.mtransparentbackground;
        }
        return this.superclass.getProperty.call(this, propNumber); //Let the superclass handle it,if not handled here.
    };

    /**
     * Function to get $canassign for a property of an object
     * @param propNumber    The Omnis property number
     * @returns {boolean}   Whether the passed property can be assigned to.
     */
    ctrl.getCanAssign = function(propNumber)
    {
        switch (propNumber) {
            case eBaseProperties.text:
            case PROPERTIES.dotsize:
            case PROPERTIES.minwidth:
            case PROPERTIES.maxwidth:
            case PROPERTIES.throttle:
            case PROPERTIES.backgroundcolor:
            case PROPERTIES.pencolor:
            case PROPERTIES.velocityfilterweight:
            case PROPERTIES.transparentbackground:
                return true;
        }
        return this.superclass.getCanAssign.call(this, propNumber); // Let the superclass handle it,if not handled here.
    };

    /**
     * Assigns the specified property's value to the control.
     * @param propNumber    The Omnis property number
     * @param propValue     The new value for the property
     * @returns {boolean}   success
     */
    ctrl.setProperty = function( propNumber, propValue )
    {
        if (!this.getCanAssign(propNumber)) // check whether the value can be assigned to
            return false;

        switch (propNumber) {
            case eBaseProperties.text: // Set the text as appropriate for this control.
                this.mText = propValue;
                var client_elem = this.getClientElem();
                client_elem.innerHTML = propValue;
                return true;
            case PROPERTIES.dotsize:
                this.mdotsize = propValue;
                this.signaturePad.dotSize = Number(propValue);
                return true;
            case PROPERTIES.minwidth:
                this.mminwidth = propValue;
                this.signaturePad.minWidth = Number(propValue);
                return true;
            case PROPERTIES.maxwidth:
                this.mmaxwidth = propValue;
                this.signaturePad.maxWidth = Number(propValue);
                return true;
            case PROPERTIES.throttle:
                this.mthrottle = propValue;
                this.signaturePad.throttle = Number(propValue);
                return true;
            case PROPERTIES.backgroundcolor:
                if (!this.mtransparentbackground) {
                    this.mbackgroundcolor = propValue;
                    this.signaturePad.backgroundColor = propValue;
                }
                this.signaturePad.clear();
                return true;
            case PROPERTIES.pencolor:
                this.mpencolor = propValue;
                this.signaturePad.penColor = propValue;
                return true;
            case PROPERTIES.velocityfilterweight:
                this.mvelocityfilterweight = propValue;
                this.signaturePad.velocityFilterWeight = Number(propValue);
                return true;
            case PROPERTIES.transparentbackground:
                this.mtransparentbackground = propValue;
                this.signaturePad.transparentbackground = Number(propValue);
                return true;
        }
        return this.superclass.setProperty.call( this, propNumber, propValue ); // Let the superclass handle it, if not handled here.
    };

    /**
     * Adds a click handler if the device doesn't support touch, or equivalent touch handlers if it does.
     * @param elem Element to add a click/touch handler to
     */

    ctrl.addClickHandlers = function(elem)
    {
        /**
        if (!this.usesTouch) {
            elem.onclick = this.mEventFunction;
        }
        else {
            elem.ontouchstart = this.mEventFunction;
            elem.ontouchend = this.mEventFunction;
        }
         */
    };

    ctrl.handleClick = function(pX, pY)
    {
        // send event to Omnis
        /**
        if (this.canSendEvent(eBaseEvent.evClick)) {
            this.eventParamsAdd("pXPos", pX);
            this.eventParamsAdd("pYPos",pY);

            this.sendEvent(eBaseEvent.evClick);
        }
         */
    };


    /**
     * Called when the size of the control has changed.
     */
    ctrl.sizeChanged = function ()
    {
        this.superclass.sizeChanged();

        var elem = this.getClientElem();
        this.canvas.width = elem.clientWidth;
        this.canvas.height = elem.clientHeight;

        this.signaturePad.clear();

        // resizing canvas clears control, so use saved dataURL to redraw current signature
        if (this.mData.length>0)
        {
            this.signaturePad.fromDataURL(this.mData, this.mCanvasOptions);
        }
    };

    /**
     * Called when visibility of the control has changed.
     * eg. when used on a paged pane and the current page has changed.
     */
    ctrl.visibilityChanged = function ()
    {
        this.superclass.visibilityChanged.call(this);
        if (this.getTrueVisibility(null))
        {
            this.sizeChanged();
        }
    };

    /**
     * Called when drawing has stopped
     */
    ctrl.drawEnd = function ()
    {
        // hires support
        this.mCanvasOptions = {
            ratio: this.canvas.offsetWidth / this.canvas.offsetHeight,
            width: this.canvas.offsetWidth,
            height: this.canvas.offsetHeight
        };

        // write dataURL to $dataname value
        var signatureData = this.signaturePad.toDataURL();
        this.mData = signatureData;
        this.setData(signatureData);
    };

    /**
     * Client Method, call to clear current signature
     */
    ctrl.$clearpad = function()
    {
        // clear $dataname value
        this.mData = "";
        this.setData(this.mData);

        this.signaturePad.clear()
    };

    /**
     * Client Method
     * @returns {boolean} true if canvas is empty
     */
    ctrl.$isempty = function()
    {
        var Flag;
        Flag = this.signaturePad.isEmpty();
        return Flag
    };

    return ctrl;
})();

/**
 * Constructor for our control.
 * @constructor
 */
function ctrl_net_omnis_signature()
{
    this.init_class_inst(); // initialize our class
}



