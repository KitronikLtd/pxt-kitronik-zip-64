/**
 * Well known colors for ZIP LEDs
 */
enum ZipLedColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}
/**
 * Kitronik blocks have the same colour settings
 */
//% weight=100 color=#00A654 icon="\uf11b"
namespace GAME_ZIP64 {
//This is the :GAME ZIP64 Package

	/**
	 * Different modes for RGB or RGB+W ZIP strips
	 */
	export enum ZipLedMode {
	    //% block="RGB (GRB format)"
	    RGB = 0,
	    //% block="RGB+W"
	    RGBW = 1,
	    //% block="RGB (RGB format)"
	    RGB_RGB = 2
	}

	/**
	*:GAME ZIP64 Standard Buttons
	*/
	export enum ZIP64Buttons {
	    Up,
	    Down,
	    Left,
	    Right,
	    Fire1,
	    Fire2
	}

    /**
    *:GAME ZIP64 Button Pins
    */
    export enum ZIP64ButtonPins {
        //% block="Joypad Up (P8)"
        Up = <number>DAL.MICROBIT_ID_IO_P8,
        //% block="Joypad Down (P14)"
        Down = DAL.MICROBIT_ID_IO_P14,
        //% block="Joypad Left (P12)"
        Left = DAL.MICROBIT_ID_IO_P12,
        //% block="Joypad Right (P13)"
        Right = DAL.MICROBIT_ID_IO_P13,
        //% block="Fire 1 (P15)"
        Fire1 = DAL.MICROBIT_ID_IO_P15,
        //% block="Fire 2 (P16)"
        Fire2 = DAL.MICROBIT_ID_IO_P16
    }

    /**
    *:GAME ZIP64 Button Events
    */
    export enum ZIP64ButtonEvents {
        //% block="down"
        Down = DAL.MICROBIT_BUTTON_EVT_DOWN,
        //% block="up"
        Up = DAL.MICROBIT_BUTTON_EVT_UP,
        //% block="click"
        Click = DAL.MICROBIT_BUTTON_EVT_CLICK
    }

    /**
     *
     */
    //% shim=GAME_ZIP64::init
    function init(): void {
        return;
    }

    /**
     * Run vibration motor for a particular length of time
     * @param run_time is the length of time the motor will run in ms, eg: 100
     */
    //% subcategory=Feedback
    //% blockId="run_motor" block="Run motor for %run_time|ms" icon="\uf080"
    //% weight=92 blockGap=8
    export function runMotor(run_time: number): void {
        pins.digitalWritePin(DigitalPin.P1, 1)
        basic.pause(run_time)
        pins.digitalWritePin(DigitalPin.P1, 0)
    }

    /**
     * Setup micro:bit to play music through :GAME ZIP64 buzzer
     */
    //% subcategory=Feedback
    //% blockId="buzzer_setup" block="enable buzzer" icon="\uf080"
    //% weight=91 blockGap=8
    export function setBuzzerPin(): void {
        pins.analogSetPitchPin(AnalogPin.P2)
    }

    /**
     * Determines if a :GAME ZIP64 button is pressed
     * @param button press to be checked
     */
    //% subcategory=Inputs
    //% blockId="zip64_ispressed" block="button %button|is pressed"
    //% button.fieldEditor="gridpicker" button.fieldOptions.columns=3
    //% weight=95 blockGap=8
    export function buttonIsPressed(button: ZIP64ButtonPins): boolean {
        const pin = <DigitalPin><number>button;
        pins.setPull(pin, PinPullMode.PullUp);
        return pins.digitalReadPin(pin) == 0;
    }

    /**
     * Do something when one of the :GAME ZIP64 Buttons is pressed
     * @param button press to be checked
     * @param event happening on the button, eg: click
     */
    //% subcategory=Inputs
    //% blockId="button_press_on_event" block="on button %button|press %event"
    //% button.fieldEditor="gridpicker" button.fieldOptions.columns=3
    //% weight=93 blockGap=8
    export function onButtonPress(button: ZIP64ButtonPins, event: ZIP64ButtonEvents, handler: Action) {
        init();
        control.onEvent(<number>button, <number>event, handler);
    }

    export class ZIP64Display {
    	buf: Buffer;
    	pin: DigitalPin;
    	brightness: number;
    	start: number;
    	_length: number;
    	_mode: ZipLedMode;
    	_matrixWidth: number;

    	/**
         * Shows whole ZIP64 display as a given color (range 0-255 for r, g, b). 
         * @param rgb RGB color of the LED
         */
        //% subcategory=Display
        //% blockId="zip64_display_set_strip_color" block="%display|show color %rgb=zip_colors" 
        //% weight=98 blockGap=8
        
        showColor(rgb: number) {
            this.setAllRGB(rgb);
            this.show();
        }

    	/**
         * Set LED to a given color (range 0-255 for r, g, b) in the 8 x 8 matrix 
         * You need to call ``show`` to make the changes visible.
         * @param x horizontal position
         * @param y horizontal position
         * @param rgb RGB color of the LED
         */
        //% subcategory=Display
        //% blockId="zip64_display_set_matrix_color" block="%string|set matrix color at x %x|y %y|to %rgb=zip_colors" 
        //% weight=99
        
        setMatrixColor(x: number, y: number, rgb: number) {
            const cols = this._length / this._matrixWidth;
            if (x < 0 || x >= this._matrixWidth || y < 0 || y >= cols) return;
            let i = x + y * this._matrixWidth;
            this.setPixelColor(i, rgb);
        }

        /**
         * Send all the changes to the ZIP64 display.
         */
        //% subcategory=Display
        //% blockId="zip64_display_show" block="%display|show" blockGap=8
        //% weight=97
        show() {
            ws2812b.sendBuffer(this.buf, this.pin);
        }

        /**
         * Turn off all LEDs on the ZIP64 display.
         * You need to call ``show`` to make the changes visible.
         */
        //% subcategory=Display
        //% blockId="zip64_display_clear" block="%display|clear"
        //% weight=96
        
        clear(): void {
            const stride = this._mode === ZipLedMode.RGBW ? 4 : 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
        }

        /**
         * Set the brightness of the ZIP64 display. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% subcategory=Display
        //% blockId="zip64_display_set_brightness" block="%display|set brightness %brightness" blockGap=8
        //% weight=95
        
        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        /**
         * Set the pin where the ZIP LED is connected, defaults to P0.
         */
        //% weight=10
        
        setPin(pin: DigitalPin): void {
            this.pin = pin;
            pins.digitalWritePin(this.pin, 0);
            // don't yield to avoid races on initialization
    	}

    	private setPixelColor(pixeloffset: number, rgb: number): void {
            this.setPixelRGB(pixeloffset, rgb);
        }

        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (this._mode === ZipLedMode.RGB_RGB) {
                this.buf[offset + 0] = red;
                this.buf[offset + 1] = green;
            } else {
                this.buf[offset + 0] = green;
                this.buf[offset + 1] = red;
            }
            this.buf[offset + 2] = blue;
        }

        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = this.start + this._length;
            const stride = this._mode === ZipLedMode.RGBW ? 4 : 3;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * stride, red, green, blue)
            }
        }
        private setAllW(white: number) {
            if (this._mode !== ZipLedMode.RGBW)
                return;

            let br = this.brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            let end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                let ledoffset = i * 4;
                buf[ledoffset + 3] = white;
            }
        }
        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            let stride = this._mode === ZipLedMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this.start) * stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
        }
        private setPixelW(pixeloffset: number, white: number): void {
            if (this._mode !== ZipLedMode.RGBW)
                return;

            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this.start) * 4;

            let br = this.brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf = this.buf;
            buf[pixeloffset + 3] = white;
        }
    }

    /**
     * Create a new ZIP LED driver for :GAME ZIP64 Display.
     */
    //% subcategory=Display
    //% blockId="zip64_display_create" block="ZIP64 8x8 matrix display"
    //% weight=100 blockGap=8
    
    //% trackArgs=0,2
    export function createZIP64Display(): ZIP64Display {
        let display = new ZIP64Display();
        let stride = 0 === ZipLedMode.RGBW ? 4 : 3;
        display.buf = pins.createBuffer(64 * stride);
        display.start = 0;
        display._length = 64;
        display._mode = 0;
        display._matrixWidth = 8;
        display.setBrightness(255)
        display.setPin(DigitalPin.P0)
        return display;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% subcategory=Display
    //% weight=1
    //% blockId="zip_rgb" block="red %red|green %green|blue %blue"
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% subcategory=Display
    //% weight=2 blockGap=8
    //% blockId="zip_colors" block="%color"
    export function colors(color: ZipLedColors): number {
        return color;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }
} 