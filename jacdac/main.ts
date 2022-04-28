//% deprecated
namespace GAME_ZIP64 {

}

namespace modules {
    /**
     * The 8x8 LED display
     */
    //% fixedInstance whenUsed block="gamezip screen"
    export const gameZipScreen = new LedClient("gamezip screen?dev=self&num_pixels=64&num_columns=8&variant=Matrix")

    /**
     * The GameZip vibration motor
     */
    //% fixedInstance whenUsed block="gamezip vibration motor"
    export const gameZipVibrationMotor = new VibrationMotorClient("gamezip vibration motor?dev=self")
}

namespace servers {
    class VibrationServer extends jacdac.Server {
        private pattern: number[][]

        constructor() {
            super(jacdac.SRV_VIBRATION_MOTOR)
        }

        handlePacket(pkt: jacdac.JDPacket) {
            if (pkt.serviceCommand == jacdac.VibrationMotorCmd.Vibrate) {
                const pattern: number[][] = pkt.jdunpack(jacdac.VibrationMotorCmdPack.Vibrate)[0]
                const started = !!this.pattern
                this.pattern = pattern
                console.log(pattern)
                if (!started)
                    control.runInParallel(() => this.playPattern())
            }
        }

        playPattern() {
            while (this.pattern && this.pattern.length > 0) {
                const [duration, intensity] = this.pattern.shift()
                const ms = duration * 8
                if (intensity > 0)
                    pins.digitalWritePin(DigitalPin.P1, 1)
                basic.pause(ms)
                pins.digitalWritePin(DigitalPin.P1, 0)
            }
            pins.digitalWritePin(DigitalPin.P1, 0)
            this.pattern = undefined
        }
    }

    function start() {
        jacdac.productIdentifier = 0x34ef625e
        jacdac.deviceDescription = "Kitronik :GameZip64"
        jacdac.startSelfServers(() => {
            // p0 neopixels
            // p1 vibration motor
            // p2 buzzer
            const display = GAME_ZIP64.createZIP64Display()
            pins.analogSetPitchPin(AnalogPin.P2)
            const servers: jacdac.Server[] = [
                new jacdac.LedServer(
                    64,
                    jacdac.LedPixelLayout.RgbGrb,
                    (pixels, brightness) => {
                        display.buf = pixels
                        display.brightness = brightness
                        display.show()
                    }, {
                    variant: jacdac.LedVariant.Matrix,
                    numColumns: 8
                }
                ), new VibrationServer()]
            return servers
        })
    }
    start()
}