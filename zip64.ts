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
 * Kitronik :GAME ZIP64 MakeCode Package
 */
//% weight=100 color=#00A654 icon="\uf11b" block=":GAME ZIP64"
//% groups='["Display", "Inputs", "Feedback"]'
namespace GAME_ZIP64 {
//This is the :GAME ZIP64 Package

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
        Up = DAL.MICROBIT_ID_IO_P8,
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
    //% group=Feedback
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
    //% group=Feedback
    //% blockId="buzzer_setup" block="set pitch pin to buzzer" icon="\uf080"
    //% weight=91 blockGap=8
    export function setBuzzerPin(): void {
        pins.analogSetPitchPin(AnalogPin.P2)
    }

    /**
     * Determines if a :GAME ZIP64 button is pressed
     * @param button press to be checked
     */
    //% group=Inputs
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
    //% group=Inputs
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
    	_matrixWidth: number;

        /**
         * Shows a rainbow pattern on all LEDs. 
         * @param startHue the start hue value for the rainbow, eg: 1
         * @param endHue the end hue value for the rainbow, eg: 360
         */
        //% group=Display
        //% blockId="set_zip64_rainbow" block="%display|show rainbow from %startHue|to %endHue" 
        //% weight=60 blockGap=8
        showRainbow(startHue: number = 1, endHue: number = 360) {
            if (this._length <= 0) return;

            startHue = startHue >> 0;
            endHue = endHue >> 0;
            const saturation = 100;
            const luminance = 50;
            const steps = this._length;
            const direction = HueInterpolationDirection.Clockwise;

            //hue
            const h1 = startHue;
            const h2 = endHue;
            const hDistCW = ((h2 + 360) - h1) % 360;
            const hStepCW = Math.idiv((hDistCW * 100), steps);
            const hDistCCW = ((h1 + 360) - h2) % 360;
            const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
            let hStep: number;
            if (direction === HueInterpolationDirection.Clockwise) {
                hStep = hStepCW;
            } else if (direction === HueInterpolationDirection.CounterClockwise) {
                hStep = hStepCCW;
            } else {
                hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
            }
            const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

            //sat
            const s1 = saturation;
            const s2 = saturation;
            const sDist = s2 - s1;
            const sStep = Math.idiv(sDist, steps);
            const s1_100 = s1 * 100;

            //lum
            const l1 = luminance;
            const l2 = luminance;
            const lDist = l2 - l1;
            const lStep = Math.idiv(lDist, steps);
            const l1_100 = l1 * 100

            //interpolate
            if (steps === 1) {
                this.setPixelColor(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
            } else {
                this.setPixelColor(0, hsl(startHue, saturation, luminance));
                for (let i = 1; i < steps - 1; i++) {
                    const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                    const s = Math.idiv((s1_100 + i * sStep), 100);
                    const l = Math.idiv((l1_100 + i * lStep), 100);
                    this.setPixelColor(i, hsl(h, s, l));
                }
                this.setPixelColor(steps - 1, hsl(endHue, saturation, luminance));
            }
            this.show();
        }

        /**
         * Rotate LEDs forward.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of ZIP LEDs to rotate forward, eg: 1
         */
        //% group=Display
        //% blockId="zip64display_rotate" block="%display|rotate ZIP LEDs by %offset" blockGap=8
        //% weight=50
        rotate(offset: number = 1): void {
            this.buf.rotate(-offset * 3, this.start * 3, this._length * 3)
        }

    	/**
         * Shows whole ZIP64 display as a given color (range 0-255 for r, g, b). 
         * @param rgb RGB color of the LED
         */
        //% group=Display
        //% blockId="zip64_display_set_strip_color" block="%display|show color %rgb=zip_colors" 
        //% weight=98 blockGap=8
        showColor(rgb: number) {
            rgb = rgb >> 0;
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
        //% group=Display
        //% blockId="zip64_display_set_matrix_color" block="%display|set matrix color at x %x|y %y|to %rgb=zip_colors" 
        //% weight=99
        setMatrixColor(x: number, y: number, rgb: number) {
            const cols = this._length / this._matrixWidth;
            x = x >> 0
            y = y >> 0
            rgb = rgb >> 0
            if (x < 0 || x >= this._matrixWidth || y < 0 || y >= cols) return;
            let i = x + y * this._matrixWidth;
            this.setPixelColor(i, rgb);
        }

        /**
         * Send all the changes to the ZIP64 display.
         */
        //% group=Display
        //% blockId="zip64_display_show" block="%display|show" blockGap=8
        //% weight=97
        show() {
            //ws2812b.sendBuffer(this.buf, this.pin, this.brightness);
            // Use the pxt-microbit core version which now respects brightness (10/2020)
            light.sendWS2812BufferWithBrightness(this.buf, this.pin, this.brightness);
        }

        /**
         * Turn off all LEDs on the ZIP64 display.
         * You need to call ``show`` to make the changes visible.
         */
        //% group=Display
        //% blockId="zip64_display_clear" block="%display|clear"
        //% weight=96
        clear(): void {
            this.buf.fill(0, this.start * 3, this._length * 3);
        }

        /**
         * Set the brightness of the ZIP64 display. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% group=Display
        //% blockId="zip64_display_set_brightness" block="%display|set brightness %brightness" blockGap=8
        //% weight=95
        setBrightness(brightness: number): void {
            //Clamp incoming variable at 0-255 Math.clamp didnt work...
            if(brightness <0)
            {
              brightness = 0
            }
            else if (brightness > 255)
            {
              brightness = 255
            }
            this.brightness = brightness & 0xff;
            basic.pause(1) //add a pause to stop weirdnesses
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
            this.buf[offset + 0] = green;
            this.buf[offset + 1] = red;
            this.buf[offset + 2] = blue;
        }

        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const end = this.start + this._length;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * 3, red, green, blue)
            }
        }
        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            pixeloffset = (pixeloffset + this.start) * 3;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            this.setBufferRGB(pixeloffset, red, green, blue)
        }
    }

    /**
     * Create a new ZIP LED driver for :GAME ZIP64 Display.
     */
    //% group=Display
    //% blockId="zip64_display_create" block="ZIP64 8x8 matrix display"
    //% weight=100 blockGap=8
    //% trackArgs=0,2
    //% blockSetVariable=display
    export function createZIP64Display(): ZIP64Display {
        let display = new ZIP64Display();
        display.buf = pins.createBuffer(64 * 3);
        display.start = 0;
        display._length = 64;
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
    //% group=Display
    //% weight=1
    //% blockId="zip_rgb" block="red %red|green %green|blue %blue"
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% group=Display
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

    /**
     * Converts a hue saturation luminosity value into a RGB color
     */
    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);
        
        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }
} 