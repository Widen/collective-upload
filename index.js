'use strict';

var $ = function $(selector) {
    // thx @rnicholus!
    var selectorType = 'querySelectorAll';

    if (selector.indexOf('#') === 0) {
        selectorType = 'getElementById';
        selector = selector.substr(1, selector.length);
    }

    return document[selectorType](selector);
};

var dom_ready = require('detect-dom-ready'),
    cookie = require('cookie-cutter'),
    console_stream = require('console-stream'),
    bole = require('bole'),
    pretty = require('bistre')(),
    log = bole('collective-upload'),
    collective = require('media-collective');

//var fs = require('fs');
//
//var asset_metadata_template = fs.readFileSync('./asset_metadata.html');

bole.output({ level: 'debug', stream: pretty });
pretty.pipe(console_stream());

dom_ready(function domready() {

    var access_token = cookie.get('access_token');
    var collective_options = {
        protocol: process.env.COLLECTIVE_PROTOCOL||'https',
        port: process.env.COLLECTIVE_PORT||8443,
        host: process.env.COLLECTIVE_HOST||'localhost',
        auth: {
            type: 'bearer',
            bearer: access_token
        }
    };

    var form = $("#form"),
        uploadProfileUuids = $("#upload_profile_uuids"),
        fileInput = $("#file_input"),
        app = $('#app');

    collective.json('GET', '/uploadprofile', null, collective_options).then(function(res){
        if (res.body && res.body.uploadProfiles) {
            return res.body.uploadProfiles;
        }
        return [];
    }).then(function(uploadProfiles){
        var uploadProfileOptions = uploadProfiles.map(function(uploadProfile){
            var name, uuid, optionEl;
            optionEl = document.createElement('option');
            name = uploadProfile.title;
            uuid = uploadProfile.uuid;
            optionEl.value = uuid;
            optionEl.innerHTML = name;
            return optionEl;
        });
        uploadProfileOptions.forEach(function(uploadProfileOption){
            uploadProfileUuids.appendChild(uploadProfileOption);
        });
    }).then(function(){
        form.addEventListener('submit', function(e){
            e.preventDefault();
            var query = new FormData(form);
            query.append('filename', fileInput.value);
            collective.json('POST', '/asset', query, collective_options)
            .then(function(res){
                var uuid;
                if (res.body) {
                    uuid = res.body.uuid || '';
                }
                return uuid;
            }).then(function(uuid) {
                return new Promise(function(resolve, reject){
                    setTimeout(function(){
                        return collective.json('GET', '/asset/uuid/:uuid', {
                            uuid: uuid
                        }, collective_options).then(resolve, reject);
                    }, 10000);
                });
            }).then(function(res){
                app.innerHTML = '<h1>Done</h1>';

                var asset_metadata = res.body;

                var metadata_container = document.createElement('div');

                if (asset_metadata.name) {
                    var nameHeader = document.createElement('h1');
                    nameHeader.innerHTML = asset_metadata.name;
                    metadata_container.appendChild(nameHeader);
                }

                if (asset_metadata.downloadUrl) {
                    var downloadButton = document.createElement('a');
                    downloadButton.innerHTML = 'Download';
                    downloadButton.href = asset_metadata.downloadUrl;
                    metadata_container.appendChild(downloadButton);
                }

                if (asset_metadata.previews) {
                    var previewArea = document.createElement('div'),
                        previewImage = document.createElement('img'),
                        previewSelect = document.createElement('select');

                    previewSelect.addEventListener('change', function(e){
                        var previewKey = e.srcElement.selectedOptions[0].innerHTML;
                        previewImage.src = asset_metadata.previews[previewKey].replace('https', 'http');
                    });

                    Object.keys(asset_metadata.previews).forEach(function(previewKey, previewUrl){
                        var optionEl = document.createElement('option');
                        optionEl.innerHTML = previewKey;
                        optionEl.value = asset_metadata.previews[previewKey];

                        previewSelect.appendChild(optionEl);
                    });

                    previewImage.src = asset_metadata.previews[Object.keys(asset_metadata.previews)[0]].replace('https', 'http');

                    previewArea.appendChild(previewSelect);
                    previewArea.appendChild(previewImage);


                    metadata_container.appendChild(previewArea);
                }

                var metadataTable = document.createElement('table');

                Object.keys(asset_metadata).map(function(metadataKey){
                    var row = document.createElement('tr'),
                        key = metadataKey,
                        val = asset_metadata[metadataKey],
                        tdKey = document.createElement('td'),
                        tdVal = document.createElement('td');

                    tdKey.innerHTML = key;
                    tdVal.innerHTML = val;

                    row.appendChild(tdKey);
                    row.appendChild(tdVal);

                    metadataTable.appendChild(row);
                });

                metadata_container.appendChild(metadataTable);
                app.appendChild(metadata_container);

            }, function(err){
                log.info('Rejected', err);
                app.innerHTML = '<h1>Error</h1>';
                app.innerHTML += err;
            });
        });
    }, function(err) {
        log.info('Rejected', err);
    });
});


