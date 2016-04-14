MainState = function(){ }

MainState.prototype = {
    slimePointCount: 30,
    slimePoints: [],
    slimeSprings: [],
    springLineBmd: null,
    slimeCollisionGroup: null,
    worldCollisionGroup: null,
    slimeCenterPoint: null,
    cursorKeys: null,

    preload: function(){
        console.log('preload main state');
    },

    create: function(){
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 100;

        this.slimeCollisionGroup = game.physics.p2.createCollisionGroup();
        this.worldCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physics.p2.updateBoundsCollisionGroup();

        this.cursorKeys = game.input.keyboard.createCursorKeys();

        var bmd = game.add.bitmapData(6, 6);
        bmd.context.fillStyle = '#FFFFFF';
        bmd.context.fillRect(0, 0, 6, 6);
        bmd.dirty = true;
        game.cache.addBitmapData('dot', bmd);

        var bmd2 = game.add.bitmapData(640, 32);
        bmd2.context.fillStyle = '#FFFFFF';
        bmd2.context.fillRect(0, 0, bmd2.width, bmd2.height);
        bmd2.dirty = true;
        game.cache.addBitmapData('rect', bmd2);

        var bmd3 = game.add.bitmapData(game.width, game.height);
        bmd3.context.fillStyle = '#00cc00';
        bmd3.dirty = true;
        game.cache.addBitmapData('slime', bmd3);
        var slimeSprite = game.add.sprite(0, 0, bmd3);

        var platform = game.add.sprite(0, 0, bmd2);
        platform.anchor.setTo(0, 0);
        platform.x = game.world.centerX-bmd2.width/2
        platform.y = game.world.centerY-bmd2.height/2
        game.physics.p2.enable(platform);
        platform.body.setCollisionGroup(this.worldCollisionGroup);
        platform.body.collides([this.slimeCollisionGroup], null, true);
        platform.body.dynamic = false;

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
            //this.springLineBmd.context.stroke();
        }, this);
        this.springLineBmd.dirty = true;

        var slimeBmd = game.cache.getBitmapData('slime');
        slimeBmd.context.clearRect(0, 0, slimeBmd.width, slimeBmd.height);
        var grd = slimeBmd.context.createRadialGradient(this.slimeCenterPoint.x, this.slimeCenterPoint.y, 25, this.slimeCenterPoint.x, this.slimeCenterPoint.y, 100);
        grd.addColorStop(0, '#00CC00');
        grd.addColorStop(1, '#002200');
        slimeBmd.context.fillStyle = grd;
        slimeBmd.context.beginPath();
        slimeBmd.context.moveTo(this.slimePoints[0].x, this.slimePoints[0].y);
        for(var i = 1; i < this.slimePoints.length; i++){
            var point = this.slimePoints[(i + 1) % (this.slimePoints.length)];

            
            slimeBmd.context.lineTo(point.x, point.y);
        }
        slimeBmd.context.closePath();
        slimeBmd.context.fill();
        slimeBmd.dirty = true;


        if(this.cursorKeys.up.isDown){
            this.slimeCenterPoint.body.velocity.y = -200;
        }else if(this.cursorKeys.left.isDown){
            this.slimeCenterPoint.body.velocity.x += -50;
        }else if(this.cursorKeys.right.isDown){
            this.slimeCenterPoint.body.velocity.x += 50;
        }
    },

    render: function(){

    },

    createSlime: function(){
        var centerX = game.world.randomX;
        var centerY = 100;
        var averageDistanceFromCenter = 100;
        var spacing = Math.PI*2/this.slimePointCount;
        var surfaceArea = Math.pow(averageDistanceFromCenter, 2)*Math.PI;
        var elacticity = 20;
        var friction = 3;



        for(var i = 0; i < this.slimePointCount; i++){
            var pointX = centerX + averageDistanceFromCenter*Math.cos(spacing*i); //x component of vector: v*cos(angle)
            var pointY = centerY + averageDistanceFromCenter*Math.sin(spacing*i); //y component of vector: v*sin(angle)

            var point = game.add.sprite(pointX, pointY, game.cache.getBitmapData('dot'));
            game.physics.p2.enable(point);
            point.body.setCollisionGroup(this.slimeCollisionGroup);
            point.body.collides([this.worldCollisionGroup]);
            point.alpha = 0;
            point.body.collideWorldBounds = true;

            this.slimePoints.push(point);
        }

        this.slimeCenterPoint = game.add.sprite(centerX, centerY, game.cache.getBitmapData('dot'));
        this.slimeCenterPoint.width *= 2;
        this.slimeCenterPoint.height *= 2;
        game.physics.p2.enable(this.slimeCenterPoint);
        this.slimeCenterPoint.body.setCollisionGroup(this.slimeCollisionGroup);
        this.slimeCenterPoint.alpha = 0;
        this.slimeCenterPoint.body.collides([this.worldCollisionGroup]);
        this.slimeCenterPoint.body.collideWorldBounds = true;

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

                    var spring = game.physics.p2.createSpring(me, them, d, elacticity*4, friction);
                    this.slimeSprings.push(spring);
            }


           
            var centerSpring = game.physics.p2.createSpring(this.slimePoints[i], this.slimeCenterPoint, averageDistanceFromCenter, elacticity, friction)
            this.slimeSprings.push(spring);
            this.slimeSprings.push(centerSpring);

        }
    }
}