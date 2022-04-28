//% deprecated
namespace GAME_ZIP64 {

}

namespace modules {
    /**
     * The 8x8 LED display
     */
    //% fixedInstance whenUsed block="gamezip screen"
    export const gameZipScreen = new LedClient("gamezip screen?device=self&rows=8&columns=8&variant=matrix")
}

namespace servers {
    function start() {
        jacdac.productIdentifier = 0x34ef625e
        jacdac.deviceDescription = "Kitronik :GameZip64"
        jacdac.startSelfServers(() => {
            pins.digitalWritePin(DigitalPin.P0, 0)
            pins.analogSetPitchPin(AnalogPin.P2)
            const servers: jacdac.Server[] = [
                new jacdac.LedServer(64,
                    jacdac.LedPixelLayout.RgbGrb,
                    (pixels, brightness) => light.sendWS2812BufferWithBrightness(pixels, DigitalPin.P0, brightness), {
                    variant: jacdac.LedVariant.Matrix,
                    numColumns: 8
                }
                ),
                new jacdac.BuzzerServer()]
            return servers
        })
    }
    start()
}