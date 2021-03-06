function Connection(){
	
	var self = this;

	// Connection properties
	self.from = null;
	self.to = null;
	self.speed = 3.5;

	// Strength
	self.strength = 1;
	self.strengthEased = 0;

	// Zap
	self.zap = 0;

	// Pulses
	self.pulses = [];
	self.pulse = function(signal){

		// Only send down the signal if the strength is actually good!
		if(self.isConnected()){
			signal.distance = 0; // reset signal's distance!
			self.pulses.push(signal);
		}

	};

	// Connect
	self.connect = function(from,to){
		self.from = from;
		self.to = to;
		from.senders.push(self);
		to.receivers.push(self);
	};

	// Strengthen
	self.strengthen = function(){
		self.zap = 1;
		self.strength += 1;
		if(self.strength>1) self.strength=1;
	};

	// Weaken
	self.weaken = function(){
		self.zap = 0.5;
		self.strength -= 0.05;
		if(!self.isConnected()) self.strength=0;
	};

	// Am I Connected?
	self.isConnected = function(){
		return(self.strength>=0.94);
	};

	// UPDATE
	self.update = function(){

		// Pythagorean Distance
		var dx = self.from.nx-self.to.nx;
		var dy = self.from.ny-self.to.ny;
		var distance = Math.sqrt(dx*dx+dy*dy);

		// Have all signals go down the wire
		// at a constant "actual length" rate
		for(var i=0;i<self.pulses.length;i++){
			var pulse = self.pulses[i];
			pulse.distance += self.speed;

			// Oh, you've reached the end?
			if(pulse.distance>=distance){
				
				// Tell the TO neuron to pulse
				self.to.pulse(pulse);

				// Remove this pulse from the wire
				self.pulses.splice(i,1);
				i--;

			}
		}

		// Animation
		self.strengthEased = self.strengthEased*0.9 + self.strength*0.1;
		self.zap *= 0.8;
		if(self.zap<0.01) self.zap=0;

	};

	self.strokeStyle = "#333333";
	self.lineWidth = 3;
	self.easedLineWidth = self.lineWidth;
	self.pulseRadius = 8;
	self.endDistance = 35;

	self.draw = function(ctx){

		// save
		ctx.save();

		// translate & rotate so it's from LEFT TO RIGHT
		var from = self.from;
		var to = self.to;
		var dx = from.nx-to.nx;
		var dy = from.ny-to.ny;
		var distance = Math.sqrt(dx*dx+dy*dy);
		var angle = Math.atan2(dy,dx);
		ctx.translate(from.nx,from.ny);
		ctx.rotate(angle+Math.PI);

		// Draw connection at all?!
		var endX = (distance*self.strengthEased)-self.endDistance;
		if(endX>0){

			// draw a line
			var offsetY = 7;
			ctx.strokeStyle = self.strokeStyle;
			ctx.lineWidth = self.lineWidth;
			ctx.lineCap = 'butt';
			ctx.beginPath();
			ctx.moveTo(0, offsetY);
			ctx.lineTo(endX, offsetY);
			ctx.lineTo(endX+self.pulseRadius, offsetY-self.pulseRadius);
			ctx.moveTo(endX, offsetY);
			ctx.lineTo(endX+self.pulseRadius, offsetY+self.pulseRadius);
			ctx.stroke();

		}

		// ZAP
		/*if(self.zap>0){
			var density = self.zap*0.1;
			var num = distance * density;
			for(var i=0;i<num;i++){
				ctx.fillStyle = "#0099CC";
				ctx.beginPath();
				ctx.arc(Math.random()*distance, offsetY+Math.random()*6-3, 3, 0, 2*Math.PI, false);
				ctx.fill();
			}
		}*/

		// draw all pulses
		for(var i=0;i<self.pulses.length;i++){
			var pulse = self.pulses[i];
			ctx.fillStyle = "#fff";
			ctx.beginPath();
			ctx.arc(pulse.distance, offsetY, self.pulseRadius*((pulse.strength+1)/5), 0, 2*Math.PI, false);
			ctx.fill();
		}

		// restore
		ctx.restore();

	};

};