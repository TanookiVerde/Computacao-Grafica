function DancingAnimation() {}

Object.assign( DancingAnimation.prototype, {

    init: function() {
        //Animações de membros isolados
        var right_upper_arm_tween = this.create_rotation_tween(object_name="right_upper_arm", 
            startAngle=0, endAngle=Math.PI/4, 
            duration=300, pivot=[0,1.8,0]);
        var right_lower_arm_tween = this.create_rotation_tween(object_name="right_lower_arm", 
            startAngle=0, endAngle=-Math.PI/2, 
            duration=300, pivot=[0,1.8,0]);
        var right_hand_tween = this.create_rotation_tween(object_name="right_hand", 
            startAngle=0, endAngle=-Math.PI/4, 
            duration=300, pivot=[0,0.5,0]);

        
        var left_upper_arm_tween_setup = this.create_rotation_tween(object_name="left_upper_arm", 
        startAngle=0, endAngle=-2.25*Math.PI/3, 
        duration=300, pivot=[0,2,0]);
        var left_feet_tween_setup = this.create_rotation_tween(object_name="left_feet", 
        startAngle=0, endAngle=-Math.PI/24, 
        duration=300, pivot=[1,0,0]);

        var head_bob_tween_yoyo = this.create_rotation_tween(object_name="head", 
        startAngle=0, endAngle=Math.PI/12, 
        duration=350, pivot=[0,-2.5,0]);
        var left_feet_tapping_tween_yoyo = this.create_rotation_tween(object_name="left_feet",
        startAngle=-Math.PI/24, endAngle=0, 
        duration=175, pivot=[1,0,0]);
        var left_upper_arm_tween_yoyo = this.create_rotation_tween(object_name="left_upper_arm", 
        startAngle=-2.25*Math.PI/3, endAngle=1.25*Math.PI/6, 
        duration=700, pivot=[0,2,0]);
        var left_lower_arm_tween_yoyo = this.create_rotation_tween(object_name="left_lower_arm", 
        startAngle=0, endAngle=2*Math.PI/3, 
        duration=350, pivot=[0,2,0]);

        var left_hand_tween = this.create_rotation_tween(object_name="left_hand", 
        startAngle=0, endAngle=Math.PI/12, 
        duration=20, pivot=[0,0.5,0]);

        // Estrutura da Animação
        right_upper_arm_tween.start();
        right_lower_arm_tween.start();
        right_hand_tween.start();

        left_feet_tween_setup.start();      //Levanta o Pé Esquerdo
        left_upper_arm_tween_setup.start(); //Levanta o Braço Esquerdo
        left_upper_arm_tween_setup.chain(   //Começa a Dança:
            head_bob_tween_yoyo.repeat(7).yoyo(true),
            left_feet_tapping_tween_yoyo.repeat(15).yoyo(true),
            left_upper_arm_tween_yoyo.repeat(3).yoyo(true),
            left_lower_arm_tween_yoyo.repeat(7).yoyo(true),
            left_hand_tween
        );
    },
    animate: function(time) {
        window.requestAnimationFrame(this.animate.bind(this));
        TWEEN.update(time);
    },
    run: function() {
        this.init();
        this.animate(0);
    },
    create_rotation_tween: function(object_name, startAngle, endAngle, duration, pivot=[0,0,0]){
        return new TWEEN.Tween({theta:startAngle}).to({theta:endAngle}, duration)
            .onUpdate(
                function(){
                    let animated_object = robot.getObjectByName(object_name);
                    
                    var x = animated_object.position.x;
                    var y = animated_object.position.y;
                    var z = animated_object.position.z;
                    
                    animated_object.matrix.makeTranslation(0, 0, 0)                                             //1. Vira uma matriz identidade. Objeto na origem.
                        .premultiply( new THREE.Matrix4().makeTranslation(-pivot[0], -pivot[1], -pivot[2]) )    //5. Retorna para a posição
                        .premultiply( new THREE.Matrix4().makeRotationZ(this._object.theta) )                   //4. Rotaciona o objeto
                        .premultiply( new THREE.Matrix4().makeTranslation(pivot[0], pivot[1], pivot[2]) )       //3. Translada mais um pouco até o ponto de pivot
                        .premultiply( new THREE.Matrix4().makeTranslation(x, y, z) );                           //2. Translada até a posição

                    animated_object.updateMatrixWorld(true);
                    stats.update();
                    renderer.render(scene, camera);    
                }
            )
    }
});




