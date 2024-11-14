// Draw context properties
const ctx = display.getContext("2d");
const width = Number(display.width);
const height = Number(display.height);

// Drag and gesture events
var events = {
	"is_held": false,
	"hold_x": 0,
	"hold_y": 0,
	"drag_x": 0,
	"drag_y": 0,
};

// Multiple nested bones
/*
var bone = {
		"name": "Hip",
		"position": [250, 250],
		"rotation": 0,
		"constraint": [-Math.PI, Math.PI],
		"children": [
		{
		"name": "Knee",
		"position": [50, 0],
		"rotation": 0,
		"constraint": [-Math.PI, Math.PI],
		"children": [
		{
		"name": "Feet",
		"position": [50, 0],
		"rotation": 0,
		"constraint": [-Math.PI, Math.PI],
		"children": [
		{
		"name": "Toe",
		"position": [50, 0],
		"rotation": 0,
		"constraint": [-Math.PI, Math.PI],
		"children": [
		{
		"name": "Toe",
		"position": [50, 0],
		"rotation": 0,
		"constraint": [-Math.PI, Math.PI],
		"children": [
		{
		"name": "Toe",
		"position": [50, 0],
		"rotation": 0,
		"constraint": [-Math.PI, Math.PI],
		"children": [
		{
		"name": "Toe",
		"position": [50, 0],
		"rotation": 0,
		"constraint": [-Math.PI, Math.PI],
		"children": [
		{
		"name": "Toe",
		"position": [50, 0],
		"rotation": 0,
		"constraint": [-Math.PI, Math.PI],
		"children": [],
		},],},],},],},],},],},],},]
	};
*/

// The bones properties and organization
var bone = {
		"name": "Hip",
		"position": [250, 250],
		"rotation": 0,
		"constraint": [-Math.PI, Math.PI],
		"children": [
			{
				"name": "Knee",
				"position": [75, 0],
				"rotation": 0,
				"constraint": [-Math.PI, Math.PI],
				"children": [
					{
						"name": "Feet",
						"position": [75, 0],
						"rotation": 0,
						"constraint": [-Math.PI, Math.PI],
						"children": []
					}
				]
			}
		]
	};

// The control object properties
var ct = {
	"bones": [
		bone, 
		bone.children[0],
		bone.children[0].children[0],
	],/*
	"bones": [
		bone, 
		bone.children[0],
		bone.children[0].children[0],
		bone.children[0].children[0].children[0],
		bone.children[0].children[0].children[0].children[0],
		bone.children[0].children[0].children[0].children[0].children[0],
		bone.children[0].children[0].children[0].children[0].children[0].children[0],
		bone.children[0].children[0].children[0].children[0].children[0].children[0].children[0]
	],*/
	"position": [250, 450],
	"rotation": 0,
	"convergence": -1,
};

// Draw a single bone
function renderBone(bone, parent=null){
	ctx.save();
	// Draw the stick from parent to itself if it has one
	if (parent){
		ctx.strokeStyle = "black";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(bone.position[0], bone.position[1]);
		ctx.stroke();
		ctx.closePath();
	}
	
	// Draw the itself point
	ctx.translate(bone.position[0], bone.position[1]);
	ctx.rotate(bone.rotation);
	ctx.fillStyle = "blue";
	ctx.beginPath();
	ctx.moveTo(0+10, 0);
	ctx.arc(0, 0, 10, 0, Math.PI*2);
	ctx.fill();
	ctx.closePath();
	for (let i=0; i<bone.children.length; i++){
		renderBone(bone.children[i], bone);
	}
	ctx.restore();
}

// Draw the control red square
function renderControl(){
	ctx.save();
	ctx.translate(ct.position[0], ct.position[1]);
	ctx.rotate(ct.rotation);
	ctx.fillStyle = "red";
	ctx.fillRect(-5, -5, 10, 10);
	ctx.restore();
}

// The first update method to simulate a IK control
// Uses pitagorean calculations to evaluate precise rotations, sadly only supports 2 bones with a single articulation
function updateControl1(){
	// Sumarization
	let ang = Math.atan2(
		ct.position[1] - ct.bones[0].position[1],
		ct.position[0] - ct.bones[0].position[0]
	);
	let dis = Math.hypot(
		ct.position[1] - ct.bones[0].position[1],
		ct.position[0] - ct.bones[0].position[0]
	);
	let dis0 = Math.hypot(ct.bones[1].position[0], ct.bones[1].position[1]);
	let dis1 = Math.hypot(ct.bones[2].position[0], ct.bones[2].position[1]);
	let len = Math.hypot(ct.bones[1].position[0], ct.bones[1].position[1]) + Math.hypot(ct.bones[2].position[0], ct.bones[2].position[1]);
	dis = dis>len? len: dis;
	dis = dis<Math.abs(dis0-dis1)? Math.abs(dis0-dis1): dis;
	
	// Application
	// Caculate every rotation by applying the law of cosines
	ct.bones[0].rotation = Math.acos((
		dis0*dis0 + dis*dis - dis1*dis1
	)/(
		2*dis0*dis
	))*ct.convergence;
	ct.bones[1].rotation = -((Math.acos((
		dis1*dis1 + dis*dis - dis0*dis0
	)/(
		2*dis1*dis
	))*ct.convergence) + ct.bones[0].rotation);
	ct.bones[0].rotation += ang;
}

function calculateAngle(v1, v2){
	/*let mag_v1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
	v1[0] /= mag_v1;
	v1[1] /= mag_v1;
	let mag_v2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2);
	v2[0] /= mag_v2;
	v2[1] /= mag_v2;
	let dot = v1[0] * v2[0] + v1[1] * v2[1];
	return Math.acos(dot);*/
	let an1 = Math.atan2(v1[1], v1[0]);
	let an2 = Math.atan2(v2[1], v2[0]);
	if (Math.abs(an2-an1) > Math.PI){
		if (an2 > an1){
			return (an2-Math.PI*2)-an1;
		}
		else {
			return an2-(an1-Math.PI*2);
		}
	}
	return an2-an1;
}

function updateControl2(){
	// If convergence is not zero, converges the bone rotations to a predefined direction, allowing more control over articulations
	// If is zero, the rotations are saved for each frame, wich means a more freely and natural rotation of bones
	if (ct.convergence != 0){
		// Calculate the entire length of all bones together
		let len = 0;
		let dis = Math.hypot(ct.position[0]-ct.bones[0].getGlobalPosition()[0], ct.position[1]-ct.bones[0].getGlobalPosition()[1]);
		let ang = Math.atan2(ct.position[1]-ct.bones[0].getGlobalPosition()[1], ct.position[0]-ct.bones[0].getGlobalPosition()[0]);
		for (let j=1; j<ct.bones.length; j++){
			len += Math.hypot(ct.bones[j].position[0], ct.bones[j].position[1]);
		}
		let cont = dis>len? 0: Math.PI*2*(1-(dis/len));
		
		// Rotate each bone to make the next adjustments skewed by convergence
		//dbg((dis/len).toFixed(2)+" "+dis.toFixed(2)+"/"+len.toFixed(2));
		for (let j=1; j<ct.bones.length; j++){
			let slen = Math.hypot(ct.bones[j].position[0], ct.bones[j].position[1]);
			// Commenting will result in a continuous motion
			ct.bones[j-1].rotation = (slen/len)*cont*ct.convergence;
		}
		ct.bones[0].rotation += ang + (cont*0.7 - 0.1)*-ct.convergence;
	}
	
	// Uses the CCD algorithm to fix the bones alignment
	let last = ct.bones[ct.bones.length-1];
	for (let i=0; i<10; i++){
		for (let j=ct.bones.length-2; j>=0; j--){
			let cur = ct.bones[j];
			let o = cur.getGlobalPosition();
			let e = last.getGlobalPosition();
			let t = ct.position;
			
			// Retrieve the difference angle needed to rotate the bone
			let d = calculateAngle([
				e[0]-o[0], e[1]-o[1]
			], [
				t[0]-o[0], t[1]-o[1]
			]);
			cur.rotation += d;
			
			// Set rotation bounded to max angles and restricts the bones rotations by using constraints
			cur.rotation = cur.rotation < -Math.PI? cur.rotation + 2*Math.PI: cur.rotation > Math.PI? cur.rotation - 2*Math.PI: cur.rotation;
			if (cur.rotation < cur.constraint[0]){
				cur.rotation = cur.constraint[0]
			}
			if (cur.rotation > cur.constraint[1]){
				cur.rotation = cur.constraint[1]
			}
			
			// Avoid over fixing and stop when the last tip is next to the target
			if (Math.hypot(t[0]-e[0], t[1]-e[1]) < 1){
				return;
			}
		}
	}
}

// Just a little algorithm to trace every bone and every children, just to setup functions and parents
// Without any recurson function call
function start(){
	let tree = [bone];
	let i = 0;
	while (tree.length > 0){
		let cur = tree[i];
		/* Do operations BEFORE to node cur */
		cur.getGlobalPosition = function(){
			let sx = this.position[0];
			let sy = this.position[1];
			if (this.parent){
				let p = this.parent.getGlobalPosition();
				let px = p[0];
				let py = p[1];
				let pr = this.parent.getGlobalRotation();
				let tx = sx*Math.cos(pr) - sy*Math.sin(pr) + px;
				let ty = sx*Math.sin(pr) + sy*Math.cos(pr) + py;
				return [tx, ty];
			}
			else {
				return [sx, sy];
			}
		}
		cur.getGlobalRotation = function(){
			if (this.parent){
				return this.parent.getGlobalRotation() + this.rotation;
			}
			else {
				return this.rotation;
			}
		}
		/**/
		if (cur.children.length > 0){
			tree.push(cur.children[0]);
			i++;
			continue;
		}
		let son = null;
		while (i>=0){
			if (son && (cur.children.indexOf(son) < (cur.children.length-1))){
				tree.push(cur.children[cur.children.indexOf(son)+1]);
				i++;
				break;
			}
			else {
				son = tree.pop();
				i--;
				cur = tree[i];
				/* Do operations AFTER to node son */
				son.parent = cur;
				/**/
			}
		}
	}
}

// Main Loop function
function update(dt){
	ct.position[0] += events["drag_x"];
	ct.position[1] += events["drag_y"];
	
	// Process the bones rotations
	updateControl2();
	
	// Rendering
	ctx.clearRect(0, 0, width, height);
	renderBone(bone);
	renderControl();
}

/*
	HTML Events and internal
*/

// Outputs a text on screen for debug purposes
function dbg(text){
	stdout.textContent = text;
}

window.onload = function(){
	start();
	update(0);
}

// Mouse events for drag actions
display.onmousedown = function(ev){
	events["drag_x"] = 0;
	events["drag_y"] = 0;
	events["hold_x"] = ev.clientX;
	events["hold_y"] = ev.clientY;
	events["holding"] = true;
	update(0);
}
display.onmousemove = function(ev){
	if (events["holding"]) {
		events["drag_x"] = ev.clientX-events["hold_x"];
		events["drag_y"] = ev.clientY-events["hold_y"];
		events["hold_x"] = ev.clientX;
		events["hold_y"] = ev.clientY;
		update(0);
	}
}
display.onmouseup = function(ev){
	events["holding"] = false;
}

// Touch events for drag actions
display.ontouchstart = function(ev){
	events["drag_x"] = 0;
	events["drag_y"] = 0;
	events["hold_x"] = ev.touches[0].clientX;
	events["hold_y"] = ev.touches[0].clientY;
	update(0);
}
display.ontouchmove = function(ev){
	events["drag_x"] = ev.touches[0].clientX-events["hold_x"];
	events["drag_y"] = ev.touches[0].clientY-events["hold_y"];
	events["hold_x"] = ev.touches[0].clientX;
	events["hold_y"] = ev.touches[0].clientY;
	update(0);
}
