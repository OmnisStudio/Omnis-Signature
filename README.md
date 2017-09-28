# Omnis-Signature
For Omnis Studio 8.1.1 and above.

Omnis Signature is a JSON defined component built around the signature pad available from http://szimek.github.io/signature_pad/.

## Demo

A hosted version of Omnis Signature is running at http://omnisservice.mh.omnis-software.com/jsgallery/jssignature.htm for you to try. Sign your name and download your signature in jpg format.

## Contents

This repository includes the following:

### net.omnis.signature
A folder containing the JSON definition of the control together with images used by the Omnis Studio component store and design environment.

### ctl_net_omnis_signature.js
The Javascript file used by Omnis Studio to communicate with signature_pad.js file below.

### signature_pad.js
As downloaded from http://szimek.github.io/signature_pad/.

### jssignature
A folder containing an Omnis Studio library exported as JSON to demonstrate the Omnis Signature component.

## Installation
1. Ensure Omnis Studio is closed.
2. Place the folder net.omnis.signature into the html\controls of your Omnis Studio tree, first creating the folder if it doesn’t already exist.
3. Copy ctrl_net_omnis_signature.js and signature_pad.js into \html\scripts of your Omnis Studio tree.
4. Add the following lines to your html\jsctempl.htm file under the Omnis Studio JavaScript client scripts comment: <script type="text/javascript" src="scripts/signature_pad.js"></script>    <script type="text/javascript" src="scripts/ctl_net_omnis_signature.js"></script>
5. Start Omnis Studio.
6. With the libraries node selected in the Studio Browser, press the New Lib from JSON hyperlink, set the JSON Tree Path to the jssignature folder and select a location for your new library.
7.	Press Import and the demo library should be ready to use.
