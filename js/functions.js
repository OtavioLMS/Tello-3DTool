function delayHideTransform(){
    cancelHideTransform();
    hideTransform();
}
function hideTransform(){
    hiding = setTimeout(function(){
        transformControl.detach(transformControl.object);
    }, 2500);
}
function cancelHideTransform(){
    if (hiding) clearTimeout(hiding);
}

//====================== RENDERIZAR ======================
function render() {
    p_transition.innerHTML = '<b>TRANSIÇÃO</b> - ' + transitionTime;
    p_stopped.innerHTML = '<b>PARADO</b> - ' + timeStopped;
    if(simulating){
        ico_Play.classList.remove('oculto');
        ico_Stop.classList.add('oculto');
    } else {
        ico_Stop.classList.remove('oculto');
        ico_Play.classList.add('oculto');
    }
    controls.update();
    updateControls();
    tello.desenharPercurso();
    tello.renderer.render(tello.scene, tello.camera);
    requestAnimationFrame(render);
};

//====================== SIMULAÇÃO ======================
function simulate(){
    var i = 2;
    tello.droneMesh.position.x = tello.droneFrames[1].position.x;
    tello.droneMesh.position.y = tello.droneFrames[1].position.y;
    tello.droneMesh.position.z = tello.droneFrames[1].position.z;
    tello.droneMesh.rotation.y = tello.droneFrames[1].rotation.y;

    lerpPosition(tello.droneMesh, tello.droneFrames[i], transitionTime, i);
}

function lerpPosition(obj, frame, time, number){
    var dist_x = 0,
        dist_y = 0,
        dist_z = 0,
        dist_r_y = 0,
        inc_x = 0,
        inc_y = 0,
        inc_z = 0,
        inc_r_y = 0,
        lp_x = false,
        lp_y = false,
        lp_z = false;
        lp_r_y = false;

    if(obj.position.x != frame.position.x){
        dist_x = frame.position.x - obj.position.x;
        inc_x = dist_x / time;
    }
    if(obj.position.y != frame.position.y){
        dist_y = frame.position.y - obj.position.y;
        inc_y = dist_y / time;
    }
    if(obj.position.z != frame.position.z){
        dist_z = frame.position.z - obj.position.z;
        inc_z = dist_z / time;
    }
    if(obj.rotation.y != frame.rotation.y){
        dist_r_y = frame.rotation.y - obj.rotation.y;
        inc_r_y = dist_r_y / time;
    }

    lerpAnimation = setInterval(function(number){
        obj.position.x += inc_x;
        obj.position.y += inc_y;
        obj.position.z += inc_z;
        obj.rotation.y += inc_r_y;
//                obj.rotateY(THREE.Math.degToRad(inc_r_y));
        var th_pos = 0.2;
        console.log('loop');
        if(
            (obj.position.x >= frame.position.x - th_pos && obj.position.x <= frame.position.x + th_pos) &&
            (obj.position.y >= frame.position.y - th_pos && obj.position.y <= frame.position.y + th_pos) &&
            (obj.position.z >= frame.position.z - th_pos && obj.position.z <= frame.position.z + th_pos)
            &&(obj.rotation.y >= frame.rotation.y - th_pos-2 && obj.rotation.y <= frame.rotation.y + th_pos+2)
        ){
            obj.position.x = frame.position.x;
            obj.position.y = frame.position.y;
            obj.position.z = frame.position.z;
            obj.rotation.y = frame.rotation.y;
            clearInterval(lerpAnimation);
            number = number + 1;
            if(number < tello.droneFrames.length){
                setTimeout(function(){
                    lerpPosition(obj, tello.droneFrames[number], time, number)
                }, timeStopped);
            } else {
                simulating = false;
            }
        }
    }, 1, number);
}


//====================== AJUSTE DE TELA ======================
function onWindowResize() {
    tello.camera.aspect = window.innerWidth / window.innerHeight;
    tello.camera.updateProjectionMatrix();
    tello.renderer.setSize( window.innerWidth, window.innerHeight );
}

//====================== TECLA PRESSIONADA ======================
function onKeyUp(e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 88: // X - ADICIONAR POSIÇÃO
            newFrame();
            break;
        case 82: // R - MODO ROTATE
            if(tello.droneFrames.length > 1){
                transformControl.showX = false;
                transformControl.showY = true;
                transformControl.showZ = false;
                transformControl.setMode('rotate');
            }
            break;
        case 69: // E - MODO TRANSLATE
            updateControls();
            transformControl.setMode('translate');
            break;
        case 46: // DELETE - DELETAR POSIÇÃO
            removeItem(tello.droneFrames.length - 1);
            break;
        case 67: // C - CENTRALIZAR
            if(!simulating){
                tello.droneMesh.position.x = 0;
                tello.droneMesh.position.z = 0;
                tello.droneMesh.rotation.y = 0;
            }
            break;
        case 86: // V - REPOSICIONAR CÂMERA
            tello.camera.position.set(0,30,-100);
            break;
        case 76: // L - LIMPAR
            clearAll();
            break;
        case 65: // A - SIMULAR
            if(tello.droneFrames.length > 2){
                simulate();
                simulating = true;
            }
            break;
        case 80: // P - PAUSAR SIMULAÇÃO
            simulating = false;
            clearInterval(lerpAnimation);
            break;
        case 187: // + - MAIS TEMPO
            timeStopped += 100;
            break;
        case 189: // - - MENOS TEMPO
            if(timeStopped >= 100){
                timeStopped -= 100;
            }
            break;
    }
};

//====================== ATUALIZAR CONTROLES GIZMOS ======================
function updateControls(){
    if(simulating){
        transformControl.showX = false;
        transformControl.showY = false;
        transformControl.showZ = false;
    } else if(positions.length == 0){
        transformControl.showY = false;
    } else {
        if(transformControl.getMode() == 'translate'){
            transformControl.showX = true;
            transformControl.showY = true;
            transformControl.showZ = true;
        } else if(transformControl.getMode() == 'rotate'){
            transformControl.showX = false;
            transformControl.showY = true;
            transformControl.showZ = false;
        }
    }
    moveToLimits();
}

function moveToLimits(){
    if(tello.droneMesh.position.y <= 0.5){
        tello.droneMesh.position.y = 1;
    }
    if(tello.droneMesh.position.y >= 40){
        tello.droneMesh.position.y = 39;
    }
    if(tello.droneMesh.position.x <= -46){
        tello.droneMesh.position.x = -46;
    }
    if(tello.droneMesh.position.x >= 46){
        tello.droneMesh.position.x = 46;
    }
    if(tello.droneMesh.position.z <= -46){
        tello.droneMesh.position.z = -46;
    }
    if(tello.droneMesh.position.z >= 46){
        tello.droneMesh.position.z = 46;
    }
}

//====================== ADICIONAR FRAME ======================
function newFrame(){
    if(!simulating){
        moveToLimits();
        if(tello.droneFrames.length == 1){
            tello.setPositionFrame(cor);
            positions.push(tello.droneMesh.position);
        } else if(tello.droneFrames[tello.droneFrames.length - 1].position.y <= 2 && tello.droneMesh.position.y <= 2){
            tello.droneMesh.position.y = 10;
            tello.setPositionFrame(cor);
            positions.push(tello.droneMesh.position);
        } else {
            tello.setPositionFrame(cor);
            positions.push(tello.droneMesh.position);
        }
//        cor += 5;
    }
    updateFrameList();
}

//====================== LIMPAR TODOS ======================
function clearAll(){
    if(!simulating){
        tello.deleteAllFrames();
        positions = [];
        tello.droneMesh.position.y = 1;
        tello.droneMesh.position.x = 0;
        tello.droneMesh.position.z = 0;
        tello.droneMesh.rotation.y = 0;
    }
    updateFrameList();
}

//====================== ATUALIZAR LISTA DE FRAMES ======================
function updateFrameList(){
    var result = '';
    result += '<div class="frameOptions">';
    result += '        <button id="btn_clearAll" class="framesTools oculto" onclick="clearAll();"><i class="ico fas fa-broom fa-lg"></i></button>';
    result += '        <button id="btn_newFrame" class="framesTools" onclick="newFrame();"><i class="ico fas fa-plus fa-lg"></i></button>';
    result += '    </div>';
    for(frame in tello.droneFrames){
        if(frame >= 1){
            result += '<div class="frameOptions">';
            result += '    <button id="' + frame + '" class="framesTools"><p class="pframe">' + frame + '</p><i class="far fa-edit fa-lg frameIco"></i></button>';
            result += '    <button id="' + frame + '" class="framesTools oculto" onclick="removeItem(' + frame + ');"><p class="pframe">' + frame + '</p><i class="far fa-trash-alt fa-lg frameIco"></i></button>';
            result += '</div>';
        }
    }
    
    div_frames.innerHTML = result;
}

//====================== REMOVER FRAME ======================
function removeItem(number){
    console.log('LENGHT - ' + tello.droneFrames.length);
    if(!simulating){
        if(tello.droneFrames.length > 2){
            if(number != 1){
                tello.deletePositionFrame(number);
                positions.splice(number, 1);
            }
        } else if(tello.droneFrames.length == 2){
            tello.deletePositionFrame(number);
            positions.splice(number, 1);
        }
        if(tello.droneFrames.length == 1){
            tello.droneMesh.position.y = 1;
        }
    }
    updateFrameList();
}