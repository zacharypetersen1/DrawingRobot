function debugDraw(d) {
	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.moveTo(d.points[0][0], d.points[0][1]);
		for(var i = 0; i < d.points.length; i++){
			ctx.lineTo(d.points[i][0], d.points[i][1]);
		}
		ctx.stroke();
	}
}

function dataObj(){
	return{
		x : 0,
		y : 0,
		points : []
	}
}

function addPoint(d, x, y){
	d.points.push([x,y]);
}

function evaluate(d, key, value){
	
	// Decode values
	console.log(value);
	curIndex = 0;
	values = [""];
	for(var i = 0; i < value.length; i++){
		c = value[i]
		if(c == ","){
			values.push("");
			curIndex++;
			continue;
		}
		if(c == "-" && i > 1){
			values.push("");
			curIndex++;
		}
		values[curIndex] += c;
	}
	for(var j = 0; j < values.length; j++){
		values[j] = Number(values[j]);
	}
	
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
		case "C": addPoint(d, values[4], values[5]); d.x = values[4]; d.y = values[5]; break;
		case "S": addPoint(d, values[2], values[3]); d.x = values[2]; d.y = values[3]; break;
		case "T": addPoint(d, values[0], values[1]); d.x = values[0]; d.y = values[1]; break;
		case "Q": addPoint(d, values[2], values[3]); d.x = values[2]; d.y = values[3]; break;
		case "M": addPoint(d, values[0], values[1]); d.x = values[0]; d.y = values[1]; break;
		case "L": addPoint(d, values[0], values[1]); d.x = values[0]; d.y = values[1]; break;
		case "H": addPoint(d, values[0], d.y); d.x = values[0]; break;
		case "V": addPoint(d, d.x, values[0]); d.y = values[0]; break;
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
				endIndex = paths[i].indexOf('z', curIndex)
				paths[i] = paths[i].slice(curIndex+1, endIndex);
				//console.log(paths[i]);
				pathd = paths[i].split(/([CcSsQqTtAaMmLlHhVv])/g)
				pathd.shift();
				evaluatePathData(d, pathd);
			}
			console.log(d);
			debugDraw(d);
		}
		fr.readAsText(f);
	});
});