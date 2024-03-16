let globaIDIndex = 0

anno.on('createAnnotation', async (annotation, overrideId) => {
    overrideId(String(globaIDIndex));
    $('#zones').append(CreateInput(DefaultPermissions))
});

anno.on('selectAnnotation', function (annotation) {
    $('.input-overlay').children().children().hide();
    $("div[zone-id='" + annotation.id + "']").show();
});

$('.input-overlay').on('click', '.close-button', function () {
    $(this).closest('.input-row').hide();
    anno.cancelSelected();
});


anno.on('cancelSelected', function (annotation) {
    $('.input-overlay').children().children().hide();
});

async function updateAnnotations() {

    const selected = anno.getSelected();

    if (selected !== undefined) {
        await anno.updateSelected(selected, true);
    }
}


$('#exportButton').click(function () {

    updateAnnotations().then(() => {

        setTimeout(() => {

            const data = {};

            data["global"] = {}
            data["global"]["permissions"] = {}

            document.querySelector('#global').querySelector('.input-row').querySelectorAll('.tab-pane').forEach(tabs => {
                tabs.querySelectorAll('.instanceType').forEach(instanceType => {
                    const instanceTypeKey = instanceType.getAttribute('key');

                    if (!data["global"]["permissions"][instanceTypeKey]) {
                        data["global"]["permissions"][instanceTypeKey] = {};
                    }

                    instanceType.querySelectorAll('.category').forEach(category => {
                        const categoryKey = category.getAttribute('key');

                        if (!data["global"]["permissions"][instanceTypeKey][categoryKey]) {
                            data["global"]["permissions"][instanceTypeKey][categoryKey] = [];
                        }

                        category.querySelectorAll('.form-check-input').forEach(formCheckInput => {

                            if (formCheckInput.checked) {
                                data["global"]["permissions"][instanceTypeKey][categoryKey].push(formCheckInput.getAttribute('val'));
                            }
                        });
                    });

                });
            });


            const zones = [];

            document.querySelector('#zones').querySelectorAll('.input-row').forEach(row => {

                const input = {}

                input["points"] = [];
                var annotation = anno.getAnnotationById(row.getAttribute('zone-id'));
                var vectorPoints = annotation.target.selector.value;
                var pointsMatch = vectorPoints.match(/points=['"]([^'"]+)['"]/);
                if (pointsMatch && pointsMatch.length > 1) {
                    var pointsString = pointsMatch[1];
                    var pointsArray = pointsString.split(/\s+/);

                    pointsArray.forEach(point => {
                        var mappedX = ((parseFloat(point.split(',')[0]) / 8192) * 2000 - 1000) * 463 + 157664;
                        var mappedY = ((parseFloat(point.split(',')[1]) / 8192) * -2000 + 1000) * 463 - 123467;
                        input["points"].push({ x: mappedX, y: mappedY });
                    });
                }

                input["permissions"] = {};
                row.querySelectorAll('.tab-pane').forEach(tabs => {

                    tabs.querySelectorAll('.instanceType').forEach(instanceType => {
                        const instanceTypeKey = instanceType.getAttribute('key');

                        if (!input["permissions"][instanceTypeKey]) {
                            input["permissions"][instanceTypeKey] = {};
                        }

                        instanceType.querySelectorAll('.category').forEach(category => {
                            const categoryKey = category.getAttribute('key');

                            if (!input["permissions"][instanceTypeKey][categoryKey]) {
                                input["permissions"][instanceTypeKey][categoryKey] = [];
                            }

                            category.querySelectorAll('.form-check-input').forEach(formCheckInput => {

                                if (formCheckInput.checked) {
                                    input["permissions"][instanceTypeKey][categoryKey].push(formCheckInput.getAttribute('val'));
                                }
                            });
                        });

                    });
                });
                zones.push(input)
            });

            data["zones"] = zones

            var jsonString = JSON.stringify(data);
            var blob = new Blob([jsonString], { type: "application/json" });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'zones.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        }, 1000);
    }).catch(error => {
        console.error(error);
    });
});




$('#importButton').click(function () {

    var input = $('<input type="file">');
    input.on('change', function (e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var importedData = JSON.parse(e.target.result);
                var annotationData = []


                $('.input-overlay').children().empty();

                $('#global').append(CreateInput(importedData.global.permissions))

                importedData.zones.forEach(zones => {

                    let points = []

                    zones.points.forEach(data => {
                        let originalX = ((data.x - 157664) / 463 + 1000) * (8192 / 2000);
                        let originalY = -((data.y + 123467) / 463 - 1000) * (8192 / 2000);
                        points.push(`${originalX},${originalY}`);
                    })

                    points.join(' ');

                    annotationData.push(
                        {
                            "@context": "http://www.w3.org/ns/anno.jsonld",
                            "body": [],
                            "id": String(globaIDIndex),
                            "type": "Annotation",
                            "target": {
                                "selector": {
                                    "type": "SvgSelector",
                                    "value": `<svg><polygon points="${points}"></polygon></svg>`
                                }
                            }
                        }
                    )

                    $('#zones').append(CreateInput(zones.permissions))
                })


                anno.setAnnotations(annotationData);
            } catch (error) {
                console.error(error);
            }
        };
        reader.readAsText(file);
    });
    input.click();
});




function CreateInput(permissions) {
    var inputRow = $(`
    <div class="input-row row no-gutters" style="display: none;" zone-id="${globaIDIndex}">

        <div class="col-10 d-flex align-items-end">
        </div>
        <div class="col-2 text-right">
            <button type="button" class="close-button" style="font-size: 25px; background-color: transparent; border: none;">
                <span style="color: white;" aria-hidden="true">&times;</span>
            </button>
        </div>

        <ul class="nav nav-tabs nav-fill">
            <li class="nav-item col-4">
                <button class="btn  text-white active fs-10 shadow" data-bs-toggle="tab" href="#Players-${globaIDIndex}">Players</button>
            </li>
            <li class="nav-item col-4">
                <button class="btn  text-white fs-10 shadow" data-bs-toggle="tab" href="#WildPals-${globaIDIndex}">Wild Pals</button>
            </li>
            <li class="nav-item col-4">
                <button class="btn  text-white fs-10 shadow" data-bs-toggle="tab" href="#Npcs-${globaIDIndex}">Npcs</button>
            </li>
            <li class="nav-item col-6">
                <button class="btn  text-white fs-10 shadow" data-bs-toggle="tab" href="#PlayersPals-${globaIDIndex}">Player Holded Pals</button>
            </li>
            <li class="nav-item col-6">
                <button class="btn  text-white fs-10 shadow" data-bs-toggle="tab" href="#BasePals-${globaIDIndex}">Player Base Pals</button>
            </li>
        </ul>

        <div class="tab-content mt-3">

            <div class="tab-pane fade show active" id="Players-${globaIDIndex}">
                <div class="instanceType" key="Player">
                    <div class="category" key="world">
                        <span>Non-Admin Can:</span>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Build" type="checkbox" role="switch">
                            <label class="form-check-label">Build Structures</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Dismantle" type="checkbox" role="switch">
                            <label class="form-check-label"> Dismantle Structures</label>
                        </div>
                    </div>
                    <div class="category" key="damage">
                        <span>Can Damage:</span>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Player" type="checkbox" role="switch">
                            <label class="form-check-label">Players</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Otomo" type="checkbox" role="switch">
                            <label class="form-check-label">Players Holded Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="BaseCampPal" type="checkbox" role="switch">
                            <label class="form-check-label">Players Base Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="PalMonster" type="checkbox" role="switch">
                            <label class="form-check-label">Wild Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="WildNPC" type="checkbox" role="switch">
                            <label class="form-check-label">Npcs</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Structure" type="checkbox" role="switch">
                            <label class="form-check-label">Structures</label>
                        </div>
                    </div>
                </div>
            </div>


            <div class="tab-pane fade show" id="PlayersPals-${globaIDIndex}">
                <div class="instanceType" key="Otomo">
                    <div class="category" key="damage">
                        <span>Can Damage:</span>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Player" type="checkbox" role="switch">
                            <label class="form-check-label">Players</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Otomo" type="checkbox" role="switch">
                            <label class="form-check-label">Players Holded Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="BaseCampPal" type="checkbox" role="switch">
                            <label class="form-check-label">Players Base Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="PalMonster" type="checkbox" role="switch">
                            <label class="form-check-label">Wild Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="WildNPC" type="checkbox" role="switch">
                            <label class="form-check-label">Npcs</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Structure" type="checkbox" role="switch">
                            <label class="form-check-label">Structures</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-pane fade show" id="BasePals-${globaIDIndex}">
                <div class="instanceType" key="BaseCampPal">
                    <div class="category" key="damage">
                        <span>Can Damage:</span>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Player" type="checkbox" role="switch">
                            <label class="form-check-label">Players</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Otomo" type="checkbox" role="switch">
                            <label class="form-check-label">Players Holded Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="BaseCampPal" type="checkbox" role="switch">
                            <label class="form-check-label">Players Base Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="PalMonster" type="checkbox" role="switch">
                            <label class="form-check-label">Wild Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="WildNPC" type="checkbox" role="switch">
                            <label class="form-check-label">Npcs</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Structure" type="checkbox" role="switch">
                            <label class="form-check-label">Structures</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-pane fade show" id="WildPals-${globaIDIndex}">
                <div class="instanceType" key="PalMonster">
                    <div class="category" key="damage">
                        <span>Can Damage:</span>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Player" type="checkbox" role="switch">
                            <label class="form-check-label">Players</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Otomo" type="checkbox" role="switch">
                            <label class="form-check-label">Players Holded Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="BaseCampPal" type="checkbox" role="switch">
                            <label class="form-check-label">Players Base Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="PalMonster" type="checkbox" role="switch">
                            <label class="form-check-label">Wild Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="WildNPC" type="checkbox" role="switch">
                            <label class="form-check-label">Npcs</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Structure" type="checkbox" role="switch">
                            <label class="form-check-label">Structures</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-pane fade show" id="Npcs-${globaIDIndex}">
                <div class="instanceType" key="WildNPC">
                    <div class="category" key="damage">
                        <span>Can Damage:</span>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Player" type="checkbox" role="switch">
                            <label class="form-check-label">Players</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Otomo" type="checkbox" role="switch">
                            <label class="form-check-label">Players Holded Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="BaseCampPal" type="checkbox" role="switch">
                            <label class="form-check-label">Players Base Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="PalMonster" type="checkbox" role="switch">
                            <label class="form-check-label">Wild Pals</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="WildNPC" type="checkbox" role="switch">
                            <label class="form-check-label">Npcs</label>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" val="Structure" type="checkbox" role="switch">
                            <label class="form-check-label">Structures</label>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    `);

    $.each(permissions, function (category, actions) {
        var categoryDiv = inputRow.find('.instanceType[key="' + category + '"]');
        $.each(actions, function (action, values) {
            var actionDiv = categoryDiv.find('.category[key="' + action + '"]');
            Object.keys(values).forEach(function (array) {
                actionDiv.find('input[val="' + values[array] + '"]').prop('checked', true);
            });
        });
    });

    globaIDIndex += 1;

    return inputRow
}