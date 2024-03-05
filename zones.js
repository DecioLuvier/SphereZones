let inputIndex = 0;

function CreateRectangle(x, y, width, height, name, permissions) {
    var x_mapped = mapToRange(x, -1000, 1000, 0, 1);
    var y_mapped = mapToRange(y, 1000, -1000, 0, 1);
    var width_mapped = mapToRange(width, 0, 2000, 0, 1);
    var height_mapped = mapToRange(height, 0, 2000, 0, 1);

    var overlayElement = $('<div></div>').css({
        opacity: '0.9',
        position: 'absolute',
        border: '2px solid black',
        backgroundColor: 'rgba(0, 255, 0, 0.25)',
    }).hover(
        function () {
            $(this).css({
                opacity: '1',
                cursor: 'pointer'
            });
        },
        function () {
            $(this).css({
                opacity: '0.9',
                cursor: 'default'
            });
        }
    )[0];

    viewer.addOverlay({
        element: overlayElement,
        location: new OpenSeadragon.Rect(x_mapped, y_mapped, width_mapped, height_mapped),
        placement: OpenSeadragon.Placement.CENTER,
    });

    var inputRow = $(`
    <div class="input-row row no-gutters" style="display: none;" type="Rectangle">
        <div class="col-10 d-flex align-items-end">
            <label class="form-label">Name</label>
        </div>
        <div class="col-2 text-right">
            <button type="button" class="close-button" style="font-size: 25px; background-color: transparent; border: none;">
                <span style="color: white;" aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="col-12">
            <input type="text" class="form-control name-input" value="${name}"/>
        </div>
        <div class="col-md-3 col-lg-6">
        <label class="form-label">X: <span class="x-value">${x}</span></label>
        <input type="range" class="form-control-range w-100 x-input" value="${x}" min="-1000" max="1000"/>
        </div>
        <div class=" col-md-3 col-lg-6">
            <label class="form-label">Y: <span class="y-value">${y}</span></label>
            <input type="range" class="form-control-range w-100 y-input" value="${y}" min="-1000" max="1000"/>
        </div>
        <div class=" col-md-3 col-lg-6">
            <label class="form-label">W: <span class="width-value">${width}</span></label>
            <input type="range" class="form-control-range w-100 width-input" value="${width}" min="0" max="2000"/>
        </div>
        <div class=" col-md-3 col-lg-6">
            <label class="form-label">H: <span class="height-value">${height}</span></label>
            <input type="range" class="form-control-range w-100 height-input" value="${height}" min="0" max="2000"/>
        </div>
    
        <div class="col-12 mt-3">
            ${GetPermissions(inputIndex, permissions)}
        </div>
 
        <div class="col-12 p-1 mt-1">
            <button class="btn btn-danger btn-sm remove-button btn-block w-100">Remove</button>
        </div>
        
    </div>
`);

    $('.input-overlay').append(inputRow);

    inputIndex += 1

    inputRow.find('.x-input, .y-input, .width-input, .height-input').on('input', function () {
        var newX = parseFloat(inputRow.find('.x-input').val());
        var newY = parseFloat(inputRow.find('.y-input').val());
        var newWidth = parseFloat(inputRow.find('.width-input').val());
        var newHeight = parseFloat(inputRow.find('.height-input').val());

        var newX_mapped = mapToRange(newX, -1000, 1000, 0, 1);
        var newY_mapped = mapToRange(newY, 1000, -1000, 0, 1);
        var newWidth_mapped = mapToRange(newWidth, 0, 2000, 0, 1);
        var newHeight_mapped = mapToRange(newHeight, 0, 2000, 0, 1);

        viewer.updateOverlay(overlayElement, {
            location: new OpenSeadragon.Rect(newX_mapped, newY_mapped, newWidth_mapped, newHeight_mapped)
        });

        inputRow.find('.x-value').text(newX);
        inputRow.find('.y-value').text(newY);
        inputRow.find('.width-value').text(newWidth);
        inputRow.find('.height-value').text(newHeight);

    });

    inputRow.find('.remove-button').on('click', function () {
        viewer.removeOverlay(overlayElement);
        inputRow.remove();
    });

    inputRow.find('.close-button').on('click', function () {
        inputRow.hide();
    });

    new OpenSeadragon.MouseTracker({
        element: overlayElement,
        clickHandler: function (e) {
            $('.input-row').hide();
            inputRow.show();
        },
    });
}


function CreateCircle(x, y, radius, name, permissions) {
    var x_mapped = mapToRange(x, -1000, 1000, 0, 1);
    var y_mapped = mapToRange(y, 1000, -1000, 0, 1);
    var radius_mapped = mapToRange(radius, 0, 2000, 0, 1);

    var overlayElement = $('<div></div>').css({
        opacity: '0.9',
        class: "Zone",
        position: 'absolute',
        border: '2px solid black',
        borderRadius: '50%',
        width: (radius_mapped * 2 * 100) + '%',
        height: (radius_mapped * 2 * 100) + '%',
        backgroundColor: 'rgba(0, 255, 0, 0.25)',
    }).hover(
        function () {
            $(this).css({
                opacity: '1',
                cursor: 'pointer'
            });
        },
        function () {
            $(this).css({
                opacity: '0.9',
                cursor: 'default'
            });
        }
    )[0];

    viewer.addOverlay({
        element: overlayElement,
        location: new OpenSeadragon.Rect(x_mapped - radius_mapped, y_mapped - radius_mapped, radius_mapped * 2, radius_mapped * 2),
        placement: OpenSeadragon.Placement.CENTER,
    });


    var inputRow = $(`
    <div class="input-row row no-gutters" style="display:none;"  type="Circle">
        <div class="col-10 d-flex align-items-end">
            <label class="form-label">Name</label>
        </div>
        <div class="col-2 text-right">
            <button type="button" class="close-button" style="font-size: 25px; background-color: transparent; border: none;">
                <span style="color: white;" aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="col-12">
            <input type="text" class="form-control name-input" value="${name}"/>
        </div>
        <div class="col-md-4 col-lg-12">
            <label class="form-label">X: <span class="x-value">${x}</span></label>
            <input type="range" class="form-control-range w-100 x-input" value="${x}" min="-1000" max="1000"/>
        </div>
        <div class="col-md-4 col-lg-12">
            <label class="form-label">Y: <span class="y-value">${y}</span></label>
            <input type="range" class="form-control-range w-100 y-input" value="${y}" min="-1000" max="1000"/>
        </div>
        <div class="col-md-4 col-lg-12">
            <label class="form-label">R: <span class="radius-value">${radius}</span></label>
            <input type="range" class="form-control-range w-100 radius-input" value="${radius}" min="0" max="2000"/>
        </div>
        <div class="col-12 mt-3">
            ${GetPermissions(inputIndex, permissions)}
        </div>
    
        <div class="col-12 p-1 mt-1">
            <button class="btn btn-danger btn-sm remove-button btn-block w-100">Remove</button>
        </div>
    </div>
`);

    $('.input-overlay').append(inputRow);

    inputIndex += 1

    inputRow.find('.x-input, .y-input, .radius-input').on('input', function () {
        var newX = parseFloat(inputRow.find('.x-input').val());
        var newY = parseFloat(inputRow.find('.y-input').val());
        var newRadius = parseFloat(inputRow.find('.radius-input').val());

        var newX_mapped = mapToRange(newX, -1000, 1000, 0, 1);
        var newY_mapped = mapToRange(newY, 1000, -1000, 0, 1);
        var newRadius_mapped = mapToRange(newRadius, 0, 2000, 0, 1);

        viewer.updateOverlay(overlayElement, {
            location: new OpenSeadragon.Rect(newX_mapped - newRadius_mapped, newY_mapped - newRadius_mapped, newRadius_mapped * 2, newRadius_mapped * 2)
        });

        inputRow.find('.x-value').text(newX);
        inputRow.find('.y-value').text(newY);
        inputRow.find('.radius-value').text(newRadius);
    });


    inputRow.find('.remove-button').on('click', function () {
        viewer.removeOverlay(overlayElement);
        inputRow.remove();
    });

    inputRow.find('.close-button').on('click', function () {
        inputRow.hide();
    });

    new OpenSeadragon.MouseTracker({
        element: overlayElement,
        clickHandler: function (e) {
            $('.input-row').hide();
            inputRow.show();
        },
    });
}

function GetPermissions(UniqueIndex, permissions) {
    return `
    <ul class="nav nav-tabs nav-fill">
    <li class="nav-item">
        <button class="btn  text-white active fs-10 shadow" data-bs-toggle="tab" href="#players-${UniqueIndex}">Players</button>
    </li>
    <li class="nav-item">
        <button class="btn  text-white fs-10 shadow" data-bs-toggle="tab" href="#playerPals-${UniqueIndex}">PlayerPals</button>
    </li>
    <li class="nav-item">
        <button class="btn  text-white fs-10 shadow" data-bs-toggle="tab" href="#wildPals-${UniqueIndex}">WildPals</button>
    </li>
</ul>

<div class="tab-content mt-3">
    <div class="tab-pane fade show active" id="players-${UniqueIndex}">
        ${getCheckboxesHTML(permissions.players)}
    </div>
    <div class="tab-pane fade" id="playerPals-${UniqueIndex}">
        ${getCheckboxesHTML(permissions.playerPals)}
    </div>
    <div class="tab-pane fade" id="wildPals-${UniqueIndex}">
        ${getCheckboxesHTML(permissions.wildPals)}
    </div>
</div>
    `;
}

function getCheckboxesHTML(permissionSet) {
    let checkboxesHTML = '';
    for (const [permission, value] of Object.entries(permissionSet)) {
        checkboxesHTML += `
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" ${value ? 'checked' : ''}>
                <label class="form-check-label">${permission}</label>
            </div>`;
    }
    return checkboxesHTML;
}