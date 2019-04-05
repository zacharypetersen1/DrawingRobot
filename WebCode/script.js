var minDist = 15;

function debugDraw(d) {
	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		ctx.beginPath();
		var penDown = false;
		for(var i = 0; i < d.codes.length; i++){
			switch(d.codes[i].id){
				case "PENUP": penDown = false; break;
				case "PENDOWN": penDown = true; break;
				case "GOTO": if(penDown){
						ctx.lineTo(d.codes[i].px, d.codes[i].py);
					}
					else{
						ctx.moveTo(d.codes[i].px, d.codes[i].py);
					}break;
			}
		}
		ctx.stroke();
	}
}

function dataObj(){
	return {x : 0, y : 0, reflectX : 0, reflectY : 0, codes : [],
	setCurPnt : function(inX, inY){
		this.x = inX;
		this.y = inY;
	},
	reflectPnt : function(inX, inY){
		dx = inX - this.x;
		dy = inY - this.y;
		this.reflectX = this.x - dx;
		this.reflectY = this.y - dy;
	},
	clearReflectPnt : function(){
		this.reflectX = this.x;
		this.reflectY = this.y;
	}};
}

function addPENUP(d){
	d.codes.push({id:"PENUP"});
}

function addPENDOWN(d){
	d.codes.push({id:"PENDOWN"});
}

function addGOTO(d, x, y){
	d.codes.push({id:"GOTO", px:x, py:y});
}

function quadraticBezier(x0, y0, x1, y1, x2, y2, t){
	x = Math.pow(1-t, 2)*x0 + 2*(1-t)*t*x1 + t*t*x2;
	y = Math.pow(1-t, 2)*y0 + 2*(1-t)*t*y1 + t*t*y2;
	pt = {x:x, y:y};
	return pt;
}

function cubicBezier(x0, y0, x1, y1, x2, y2, x3, y3, t){
	x = Math.pow(1-t,3)*x0 + 3*Math.pow(1-t,2)*t*x1 + 3*(1-t)*Math.pow(t,2)*x2 + Math.pow(t,3)*x3;
	y = Math.pow(1-t,3)*y0 + 3*Math.pow(1-t,2)*t*y1 + 3*(1-t)*Math.pow(t,2)*y2 + Math.pow(t,3)*y3;
	pt = {x:x, y:y};
	return pt;
}

function dist(p1, p2){
	xlen = Math.abs(p1.x - p2.x);
	ylen = Math.abs(p1.y - p2.y);
	return Math.sqrt(Math.pow(xlen,2)+Math.pow(ylen, 2));
}

function evalCurve(d, f, t1, t2){
	if(dist(f(t1), f(t2)) <= minDist){
		return;
	}
	tmid = (t1 + t2) / 2;
	pmid = f(tmid);
	evalCurve(d, f, t1, tmid);
	addGOTO(d, pmid.x, pmid.y);
	evalCurve(d, f, tmid, t2);
}

function isNumber(c){
	return /\d|\.|\-/.test(c);
	//return c == "0" || c == "1" || c == "2" || c == "3" || c == "4" || c == "5" || c == "6" || c == "7" || c == "8" || c == "9";
}

function evaluate(d, key, value){
	console.log(value);
	// Decode values
	curIndex = 0;
	values = [""];
	for(var i = 0; i < value.length; i++){
		c = value[i]
		/*if(c == " " && values[curIndex] == ""){
			continue;
		}
		if(c == "," || c == " "){
			values.push("");
			curIndex++;
			continue;
		}*/
		if(c == "-" && i > 0){
			values.push("");
			curIndex++;
			values[curIndex] += c;
		}
		else if(isNumber(c)){
			values[curIndex] += c;
		}
		else if(values[curIndex] != ""){
			values.push("");
			curIndex++;
		}
		
	}
	for(var j = 0; j < values.length; j++){
		values[j] = Number(values[j]);
	}
	console.log(values);
	
	// Apply relative positioning
	if(	key == "c" || 
	key == "s" || 
	key == "t" || 
	key == "q" || 
	key == "m" || 
	key == "h" || 
	key == "l"){
		for(var i = 0; i < values.length; i++){
			if(i%2==0){
				values[i] += d.x;
			}
			else{
				values[i] += d.y;
			}
		}
	}
	if(key=="v"){
		values[0] += d.y;
	}
	
	// Evaluate command
	switch(key.toUpperCase()){
		case "C": 
			evalCurve(d, function(t){
				return cubicBezier(d.x, d.y, values[0], values[1], values[2], values[3], values[4], values[5], t);
			}, 0, 1);
			addGOTO(d, values[4], values[5]);
			d.setCurPnt(values[4], values[5]);
			d.reflectPnt(values[2], values[3]);
			break;
		case "S": 
			evalCurve(d, function(t){
				return cubicBezier(d.x, d.y, d.reflectX, d.reflectY, values[0], values[1], values[2], values[3], t);
			}, 0, 1);
			addGOTO(d, values[2], values[3]);
			d.setCurPnt(values[2], values[3]);
			d.reflectPnt(values[0], values[1]);
			break;
		case "T": 
			evalCurve(d, function(t){
				return quadraticBezier(d.x, d.y, d.reflectX, d.reflectY, values[0], values[1], t);
			}, 0, 1);
			addGOTO(d, values[0], values[1]);
			d.setCurPnt(values[0], values[1]);
			d.reflectPnt(d.reflectX, d.reflectY);
			break;
		case "Q":
			evalCurve(d, function(t){
				return quadraticBezier(d.x, d.y, values[0], values[1], values[2], values[3], t);
			}, 0, 1);
			addGOTO(d, values[2], values[3]);
			d.setCurPnt(values[2], values[3]);
			d.reflectPnt(values[0], values[1]);
			break;
		case "M": 
			addPENUP(d);
			addGOTO(d, values[0], values[1]);
			addPENDOWN(d);
			d.setCurPnt(values[0], values[1]);
			d.clearReflectPnt();
			break;
		case "L":
			addGOTO(d, values[0], values[1]);
			d.setCurPnt(values[0], values[1]);
			d.clearReflectPnt();
			break;
		case "H": 
			addGOTO(d, values[0], d.y); 
			d.x = values[0]; 
			break;
		case "V": 
			addGOTO(d, d.x, values[0]);
			d.y = values[0];
			break;
	}
}

function evaluatePathData(d, pathd){
	for(var i = 0; i < pathd.length; i+= 2){
		evaluate(d, pathd[i], pathd[i+1]);
	}
}

$().ready(function () {
	$('#fileUp').change( function(){ 
		var f = $('#fileUp').prop('files')[0];
		var fr = new FileReader();
		fr.onload = function(){
			//console.log(fr.result);
			paths = fr.result.split("<path");
			paths.shift();
			//console.log(paths);
			d = dataObj();
			for(var i = 0; i < paths.length; i++){
				curIndex = paths[i].indexOf("d", 0)
				curIndex = paths[i].indexOf('"', curIndex)
				endIndex = paths[i].indexOf('"', curIndex+1)
				paths[i] = paths[i].slice(curIndex+1, endIndex);
				//console.log(paths[i]);
				pathd = paths[i].split(/([CcSsQqTtAaMmLlHhVvZz])/g)
				pathd.shift();
				console.log(pathd);
				evaluatePathData(d, pathd);
			}
			//console.log(d);
			debugDraw(d);
		}
		fr.readAsText(f);
	});
});