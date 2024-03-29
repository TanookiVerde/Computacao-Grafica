(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.ImageProcessing = {}));
}(this, (function (exports) { 'use strict';



    function ImageProcesser(img, kernel = null, xform = null, bhandler = 'icrop') {
        this.img = img.clone();
        this.width = img.shape[1];
        this.height = img.shape[0];
        this.kernel = kernel;
        this.xform = xform;
        this.bhandler = bhandler;
    }

    Object.assign( ImageProcesser.prototype, {

        apply_kernel: function(border = 'icrop') {      
            if(border == 'extend')
                this.img = extend(this.img);    //Increase the image's size in one pixel, clamping it's borders

            if(this.kernel == 'box')
            {
                this.img = new KernelApplier(box_filter, this.img).apply_filter();
            }
            else if(this.kernel == 'sobel')
            {
                var blurred = new KernelApplier(gaussian_filter, this.img).apply_filter();  //Apply Gaussian filter, to reduce high frequencies
                this.img = new KernelApplier(sobel_filter, blurred).apply_filter();         //Apply Derivatives Kernel
            }
            else if(this.kernel == 'laplace')
            {
                this.img = new KernelApplier(laplace_filter, this.img).apply_filter()
            }
            
            this.img = crop_borders(this.img);  //Always crop the image one pixel, after the filter application
        },

        apply_xform: function()  {
            var output_image = nj.zeros([600, 600]); //Canvas arbitrariamente grande
            var inversed = inverse_matrix(this.xform);

            for(var x = -300; x < 300; x++){
                for(var y = -300; y < 300; y++){
                    var world_position = nj.array([ x + 0.5, y + 0.5, 1]).T;
                    var input_position = nj.dot(inversed, world_position);

                    var color = bilinear_interpolation(this.img, input_position.get(0), input_position.get(1));

                    output_image.set(x+300, y+300, color);
                }
            }

            this.img = output_image;
        },

        update: function() {
            // Method to process image and present results
            var start = new Date().valueOf();

            if(this.kernel != null) {
                this.apply_kernel(this.bhandler);
            }

            if(this.xform != null) {
                this.apply_xform();
            }

            // Loading HTML elements and saving
            var $transformed = document.getElementById('transformed');
            $transformed.width = this.img.shape[1]; 
            $transformed.height = this.img.shape[0];
            nj.images.save(this.img, $transformed);
            var duration = new Date().valueOf() - start;
            document.getElementById('duration').textContent = '' + duration;
        }

    } )

    /* AUXILIARES */
    class KernelApplier{
        constructor(filter, image){
            //Receive a function filter and the image
            this.filter = filter;
            this.image = image;
        }
        apply_filter(){
            //Apply the function filter in the image
            var image_output = nj.zeros(this.image.shape);

            var h = this.image.shape[0]
            var w = this.image.shape[1]

            for (var x = 1; x < w-1; x++){
                for (var y = 1; y < h-1; y++){
                    var sub_matrix = this.image.slice([y-1, y+2],[x-1, x+2]);
                    var filter_output = this.filter(sub_matrix);

                    image_output.set(y, x, filter_output);
                }
            }
            return image_output;
        }
    }
    /* 
    FILTERS FUNCTIONS
    ----------
    - Send as parameters to KernelApplier constructor
    - Receive a 3x3 numjs.Array
    - Returns the pixel color 
    */
    function box_filter(kernel_values){
        return kernel_values.mean();
    }
    function laplace_filter(kernel_values){
        var result = 0*kernel_values.get(0, 0) + 1*kernel_values.get(0, 1) + 0*kernel_values.get(0, 2)
                    +1*kernel_values.get(1, 0) + 4*kernel_values.get(1, 1) + 1*kernel_values.get(1, 2)
                    +0*kernel_values.get(2, 0) + 1*kernel_values.get(2, 1) + 0*kernel_values.get(2, 2);
        return result/8;
    }
    function sobel_filter(kernel_values){
        var d_x = -1*kernel_values.get(0, 0) +0*kernel_values.get(0, 1) +1*kernel_values.get(0, 2)
                  -2*kernel_values.get(1, 0) +0*kernel_values.get(1, 1) +2*kernel_values.get(1, 2)
                  -1*kernel_values.get(2, 0) +0*kernel_values.get(2, 1) +1*kernel_values.get(2, 2);

        var d_y = +1*kernel_values.get(0, 0) +2*kernel_values.get(0, 1) +1*kernel_values.get(0, 2)
                  +0*kernel_values.get(1, 0) +0*kernel_values.get(1, 1) +0*kernel_values.get(1, 2)
                  -1*kernel_values.get(2, 0) -2*kernel_values.get(2, 1) -1*kernel_values.get(2, 2);
        return d_x/8 + d_y/8;
    }
    function gaussian_filter(kernel_values){
        var result = 1*kernel_values.get(0, 0) +2*kernel_values.get(0, 1) +1*kernel_values.get(0, 2)
                    +2*kernel_values.get(1, 0) +4*kernel_values.get(1, 1) +2*kernel_values.get(1, 2)
                    +1*kernel_values.get(2, 0) +2*kernel_values.get(2, 1) +1*kernel_values.get(2, 2);
        return result/16;
    }
    /* MISC */
    function crop_borders(image){
        //Crop borders in one pixel
        var h = image.shape[0]
        var w = image.shape[1]
        return image.slice([1,h-1],[1,w-1])
    }
    function extend(image){
        //Increse image size, clamping values from borders
        var extended = nj.zeros([image.shape[0]+2, image.shape[1]+2]);

        for (var x = 0; x < extended.shape[1]; x++){
            for (var y = 0; y < extended.shape[0]; y++){
                var img_x = clamp(x-1, 0, image.shape[1]-1);
                var img_y = clamp(y-1, 0, image.shape[0]-1);
                extended.set(y, x, image.get(img_y, img_x))
            }
        }
        return extended;
    }
    function clamp(num, min, max){
        //Returns the closest number to num between min and max
        var floor = Math.max(num, min);
        var ceil = Math.min(floor, max);
        return ceil;
    }
    function special_floor(number){
        return Math.floor(number+0.5)-0.5
    }
    function inverse_matrix(matrix){
        //Baseado em: https://byjus.com/maths/inverse-of-3-by-3-matrix/
        var determinant = det_3x3(matrix);
        var cofactor = cofactor_3x3(matrix).T;
        var adjugate = cofactor.T;
        var coeff = 1/determinant;
        var inversed = adjugate.multiply(coeff);

        return inversed;
    }
    function det_3x3(matrix){
        var A = nj.array([[matrix.get(1,1), matrix.get(1,2)],[matrix.get(2,1), matrix.get(2,2)]]);
        var B = nj.array([[matrix.get(1,0), matrix.get(1,2)],[matrix.get(1,2), matrix.get(2,2)]])
        var C = nj.array([[matrix.get(1,0), matrix.get(1,1)],[matrix.get(2,0), matrix.get(2,1)]])

        return matrix.get(0,0)*det_2x2(A) - matrix.get(0,1)*det_2x2(B) - matrix.get(0,2)*det_2x2(C);
    }
    function det_2x2(matrix){
        return matrix.get(0,0)*matrix.get(1,1) - matrix.get(0,1)*matrix.get(1,0);
    }
    function cofactor_3x3(matrix){
        return nj.array([[ matrix.get(0,0), -matrix.get(0,1),  matrix.get(0,2)],
                         [-matrix.get(1,0),  matrix.get(1,1), -matrix.get(1,2)],
                         [ matrix.get(2,0), -matrix.get(2,1),  matrix.get(2,2)]]);
    }
    function bilinear_interpolation(image, x, y){
        var i = special_floor(x); 
        var j = special_floor(y);

        var a = Math.abs(x - i);
        var b = Math.abs(y - j);

        var color = 255;
        if (i > 0 && i < image.shape[0] && j > 0 && j < image.shape[1]){
            color = (1-a)*(1-b)*image.get(i-0.5, j-0.5) + 
                        a*(1-b)*image.get(i+0.5, j-0.5) +
                            a*b*image.get(i+0.5, j+0.5) +
                        (1-a)*b*image.get(i-0.5, j+0.5);
        }

        return color;
    }

    exports.ImageProcesser = ImageProcesser;
    
})));

