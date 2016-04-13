MainState = function(){ }

MainState.prototype = {
    slimePointCount: 25,
    slimePoints: [],
    slimeSprings: [],
    springLineBmd: null,
    slimeCenterPoint: null,
    cursorKeys: null,

    preload: function(){
        console.log('preload main state');
    },

    create: function(){
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 100;

        this.cursorKeys = game.input.keyboard.createCursorKeys();

        var bmd = game.add.bitmapData(6, 6);
        bmd.context.fillStyle = '#FFFFFF';
        bmd.context.fillRect(0, 0, 6, 6);
        bmd.dirty = true;
        game.cache.addBitmapData('dot', bmd);

        this.springLineBmd = game.add.bitmapData(game.width, game.height);
        this.springLineBmd.context.strokeStyle = "#FFFFFF";
        this.springLineBmd.context.fillStyle = "#FFFFFF";
        var background = game.add.sprite(0, 0, this.springLineBmd);

        this.createSlime();
    },

    update: function(){
        this.springLineBmd.context.clearRect(0, 0, this.springLineBmd.width,this.springLineBmd.height);
        this.slimeSprings.forEach(function(spring){
            this.springLineBmd.context.beginPath();
            this.springLineBmd.context.moveTo(spring.data.bodyA.position[0]*-20, spring.data.bodyA.position[1]*-20);
            this.springLineBmd.context.lineTo(spring.data.bodyB.position[0]*-20, spring.data.bodyB.position[1]*-20);
            this.springLineBmd.context.stroke();
        }, this);
        this.springLineBmd.dirty = true;


        this.slimePoints.forEach(function(point){
            if(this.cursorKeys.up.isDown){
                point.body.velocity.y = -200;
            }else if(this.cursorKeys.left.isDown){
                point.body.velocity.x += -10;
            }else if(this.cursorKeys.right.isDown){
                point.body.velocity.x += 10;
            }


        }, this);
    },

    render: function(){

    },

    createSlime: function(){
        var centerX = game.world.randomX;
        var centerY = game.world.centerY;
        var averageDistanceFromCenter = 50;
        var spacing = Math.PI*2/this.slimePointCount;
        var surfaceArea = Math.pow(averageDistanceFromCenter, 2)*Math.PI;
        var elacticity = 50;
        var friction = 5;



        for(var i = 0; i < this.slimePointCount; i++){
            var pointX = centerX + averageDistanceFromCenter*Math.cos(spacing*i); //x component of vector: v*cos(angle)
            var pointY = centerY + averageDistanceFromCenter*Math.sin(spacing*i); //y component of vector: v*sin(angle)

            var point = game.add.sprite(pointX, pointY, game.cache.getBitmapData('dot'));
            game.physics.p2.enable(point);
            point.body.collideWorldBounds = true;

            this.slimePoints.push(point);
        }

        this.slimeCenterPoint = game.add.sprite(centerX, centerY, game.cache.getBitmapData('dot'));
        this.slimeCenterPoint.width *= 2;
        this.slimeCenterPoint.height *= 2;
        game.physics.p2.enable(this.slimeCenterPoint);
        this.slimeCenterPoint.collideWorldBounds = true;

        for(var i = 0; i < this.slimePoints.length; i++){
            var connectTo = [];

            //prev
            if(i != 0){
                connectTo.push(this.slimePoints[i-1]);
            }else{
                connectTo.push(this.slimePoints[this.slimePoints.length - 1]);
            }

            //prevprev
            if(i == 0){
                connectTo.push(this.slimePoints[this.slimePoints.length - 2]);
            }else if(i == 1){
                connectTo.push(this.slimePoints[this.slimePoints.length - 1]);
            }else{
                connectTo.push(this.slimePoints[i - 2]);
            }

            //next
            if(i != this.slimePoints.length - 1){
                connectTo.push(this.slimePoints[i+1]);
            }else{
                connectTo.push(this.slimePoints[0]);
            }

            //nextnext
            if(i == this.slimePoints.length - 2){
                connectTo.push(this.slimePoints[1]);
            }else if(i == this.slimePoints.length - 1){
                connectTo.push(this.slimePoints[0]);
            }else{
               connectTo.push(this.slimePoints[i + 2]);
            }


            for(var q = 0; q < connectTo.length; q++){
                    var me = this.slimePoints[i];
                    var them = connectTo[q];
                    var d = Math.sqrt(Math.pow(me.x - them.x, 2) + Math.pow(me.y - them.y, 2), 2);

                    var spring = game.physics.p2.createSpring(me, them, d, elacticity, friction);
                    this.slimeSprings.push(spring);
            }


           
            var centerSpring = game.physics.p2.createSpring(this.slimePoints[i], this.slimeCenterPoint, averageDistanceFromCenter, elacticity, friction)
            this.slimeSprings.push(spring);
        }
    }
}