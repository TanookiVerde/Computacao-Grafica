function gen_robot() 
{
    var robot = new THREE.Group();
    robot.name = "robot";

    var torso = instantiate_rect(name="torso",size=[4,6], position=[0,0,0])
    var head = instantiate_circle("head", 1.6, [0, 4.8, -0.05])

    var left_upper_arm = instantiate_rect(name="left_upper_arm", size=[1.5, 4], position=[-2.6, 0, 0]);
    var left_lower_arm = instantiate_rect(name="left_lower_arm", size=[1, 3], position=[0, -3, 0.5]);
    var left_hand = instantiate_rect(name="left_hand", size=[1.5, 0.5], position=[0, -2, 0.5]);
    
    var right_upper_arm = instantiate_rect(name="right_upper_arm", size=[1.5, 4], position=[2.6, 0, 0]);
    var right_lower_arm = instantiate_rect(name="right_lower_arm", size=[1, 3], position=[0, -3, 0]);
    var right_hand = instantiate_rect(name="right_hand", size=[1.5, 0.5], position=[0, -2, 0]);
    
    var left_upper_leg = instantiate_rect(name="left_upper_leg", size=[1.5, 4], position=[-1, -5, -1]);  
    var left_lower_leg = instantiate_rect(name="left_lower_leg", size=[1, 3], position=[0, -3, 0]);  
    var left_feet = instantiate_rect(name="left_feet", size=[1.5, 0.5], position=[0, -1.5, 0]);  
    
    var right_upper_leg = instantiate_rect(name="right_upper_leg", size=[1.5, 4], position=[1, -5, -1]);  
    var right_lower_leg = instantiate_rect(name="right_lower_leg", size=[1, 3], position=[0, -3, 0]);  
    var right_feet = instantiate_rect(name="right_feet", size=[1.5, 0.5], position=[0, -1.5, 0]);  
    
    // Estrutura hierárquica do robo
    robot.add(torso);
        torso.add(head);
        torso.add(left_upper_arm);
            left_upper_arm.add(left_lower_arm);
                left_lower_arm.add(left_hand);
        torso.add(right_upper_arm);
            right_upper_arm.add(right_lower_arm);
                right_lower_arm.add(right_hand);
        torso.add(left_upper_leg);
            left_upper_leg.add(left_lower_leg);
            left_lower_leg.add(left_feet);
        torso.add(right_upper_leg);
            right_upper_leg.add(right_lower_leg);
                right_lower_leg.add(right_feet);

    return robot
}

function instantiate_rect(name, size, position){
    var plane_geometry = new THREE.PlaneGeometry( size[0], size[1] );
    var plane_material = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff, side: THREE.DoubleSide} );
    var mesh = new THREE.Mesh(plane_geometry, plane_material);

    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);

    return mesh;
}
function instantiate_circle(name, radius, position, segment_count=30){
    var circle_geometry = new THREE.CircleGeometry( radius, segment_count);
    var circle_material = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff} );
    var mesh = new THREE.Mesh(circle_geometry, circle_material);

    mesh.name = name;
    mesh.position.set(position[0], position[1], position[2]);

    return mesh;
}

function gen_triangle( size, v1 = new THREE.Vector3(-1, 0, 0), v2 = new THREE.Vector3(1, 0, 0), v3 = new THREE.Vector3(-1, 1, 0) ) {
    var triangle_geometry = new THREE.Geometry();
    var triangle = new THREE.Triangle(v1, v2, v3);
    var normal = triangle.normal();
    triangle_geometry.vertices.push(triangle.a);
    triangle_geometry.vertices.push(triangle.b);
    triangle_geometry.vertices.push(triangle.c);
    triangle_geometry.faces.push(new THREE.Face3(0, 1, 2, normal));
    var triangle = new THREE.Mesh(triangle_geometry, new THREE.MeshNormalMaterial());
    
    triangle.size = size;

    return triangle;
}